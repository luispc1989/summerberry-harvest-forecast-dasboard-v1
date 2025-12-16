import { useState, useMemo, useEffect, useCallback } from "react";
import { z } from "zod";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PredictedHarvestChart } from "@/components/PredictedHarvestChart";

import { HarvestStats } from "@/components/HarvestStats";
import { LoadingState } from "@/components/LoadingState";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { toast } from "sonner";
import { generateReport } from "@/utils/reportGenerator";
import { 
  DailyPrediction, 
  HierarchicalForecastResponse,
  ForecastMeta,
  convertHierarchicalResponse
} from "@/types/api";

// Zod schema for upload response (separate from predictions)
const UploadResponseSchema = z.object({
  status: z.string(),
  sheet_count: z.number().optional(),
  message: z.string().optional()
});

// Zod schema for hierarchical /api/last_predictions and /api/filters response
const DailyForecastSchema = z.object({
  date: z.string(),
  value: z.number(),
  error: z.number().optional(),
  lower: z.number().optional(),
  upper: z.number().optional()
});

const SectorForecastSchema = z.object({
  daily_forecast: z.array(DailyForecastSchema),
  total: z.number(),
  average: z.number()
});

const SiteForecastSchema = z.object({
  daily_forecast: z.array(DailyForecastSchema),
  total: z.number(),
  average: z.number(),
  sectors: z.record(SectorForecastSchema)
});

const HierarchicalForecastResponseSchema = z.object({
  meta: z.object({
    forecast_horizon_days: z.number().optional(),
    generated_at: z.string().optional(),
    units: z.string().optional(),
    error_metric: z.string().optional(),
    confidence_level: z.number().optional()
  }).optional(),
  global: z.object({
    daily_forecast: z.array(DailyForecastSchema),
    total: z.number(),
    average: z.number()
  }),
  sites: z.record(SiteForecastSchema)
});

// API base URL - configure this for your local Python backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Timeout for API requests (30 seconds)
const API_TIMEOUT_MS = 30000;

// Debug log levels
type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface DebugLog {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  details?: unknown;
}

// Debug logging system
const debugLogs: DebugLog[] = [];
const MAX_DEBUG_LOGS = 100;

const log = (level: LogLevel, category: string, message: string, details?: unknown) => {
  const entry: DebugLog = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    details
  };
  
  debugLogs.push(entry);
  if (debugLogs.length > MAX_DEBUG_LOGS) {
    debugLogs.shift();
  }
  
  // Console output with color coding
  const prefix = `[${category}]`;
  switch (level) {
    case 'error':
      console.error(`❌ ${prefix}`, message, details || '');
      break;
    case 'warn':
      console.warn(`⚠️ ${prefix}`, message, details || '');
      break;
    case 'info':
      console.info(`ℹ️ ${prefix}`, message, details || '');
      break;
    case 'debug':
      console.log(`🔍 ${prefix}`, message, details || '');
      break;
  }
};

// Error types for specific handling
type ErrorType = 
  | 'timeout'
  | 'network'
  | 'invalid_format'
  | 'insufficient_data'
  | 'server_error'
  | 'empty_predictions'
  | 'malformed_response'
  | 'filter_not_found'
  | 'unknown';

interface ProcessingError {
  type: ErrorType;
  message: string;
  details?: string;
}

// Get user-friendly error message based on error type
const getErrorMessage = (type: ErrorType, details?: string): string => {
  const messages: Record<ErrorType, string> = {
    timeout: 'Request timed out after 30 seconds. The server may be overloaded or the data processing is taking too long.',
    network: 'Network error. Please check your connection and ensure the backend server is running at ' + API_BASE_URL,
    invalid_format: 'Invalid file format (400). The uploaded file format is not supported or contains invalid data.',
    insufficient_data: 'Insufficient data (422). The uploaded file does not contain enough data to generate predictions.',
    server_error: 'Server error (500). An internal error occurred on the backend server.',
    empty_predictions: 'Empty predictions. The backend returned no predictions for the selected filters.',
    malformed_response: 'Malformed response. The backend returned data in an unexpected format.',
    filter_not_found: 'Filter combination not found. The selected site/sector combination does not exist in the cached data.',
    unknown: 'An unexpected error occurred.'
  };
  
  const baseMessage = messages[type];
  return details ? `${baseMessage}\n\nDetails: ${details}` : baseMessage;
};

// Fetch with timeout helper
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const Index = () => {
  // Filter state - default to "All Sites" and "All Sectors"
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Memoize today's date to avoid re-renders
  const selectedDate = useMemo(() => new Date(), []);
  
  // API response state
  const [predictions, setPredictions] = useState<DailyPrediction[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [noData, setNoData] = useState(false);
  
  // Error state for displaying detailed errors
  const [processingError, setProcessingError] = useState<ProcessingError | null>(null);
  
  // Track if predictions were processed in current session
  const [hasProcessedInSession, setHasProcessedInSession] = useState(false);
  
  // Loading state for initial fetch
  const [isLoadingLastPredictions, setIsLoadingLastPredictions] = useState(true);
  
  // CACHE: Store full hierarchical response for filter-based selection
  const [cachedPredictions, setCachedPredictions] = useState<HierarchicalForecastResponse | null>(null);
  const [forecastMeta, setForecastMeta] = useState<ForecastMeta | null>(null);

  // Debug: Show current cache state
  const [debugMode, setDebugMode] = useState(false);

  // Select predictions from cache based on current filters
  const selectFromCache = useCallback((site: string, sector: string, cache: HierarchicalForecastResponse | null) => {
    if (!cache) {
      log('warn', 'CACHE', 'No cached data available for filter selection');
      return null;
    }

    try {
      log('debug', 'CACHE', `Selecting data for site="${site}", sector="${sector}"`);
      const convertedData = convertHierarchicalResponse(cache, site, sector);
      log('info', 'CACHE', `Selected ${convertedData.predictions.length} predictions from cache`, {
        total: convertedData.total,
        average: convertedData.average
      });
      return convertedData;
    } catch (error) {
      log('error', 'CACHE', `Filter selection failed: ${error instanceof Error ? error.message : String(error)}`, {
        availableSites: Object.keys(cache.sites),
        requestedSite: site,
        requestedSector: sector
      });
      return null;
    }
  }, []);

  // On dashboard load - try to fetch last predictions from backend
  useEffect(() => {
    const fetchLastPredictions = async () => {
      log('info', 'INIT', 'Fetching last predictions from backend...');
      
      try {
        const response = await fetchWithTimeout(
          `${API_BASE_URL}/api/last_predictions`,
          { method: 'GET' },
          10000
        );
        
        if (!response.ok) {
          log('warn', 'API', `Backend returned ${response.status} for last_predictions`);
          throw new Error(`Backend returned ${response.status}`);
        }
        
        const rawData = await response.json();
        log('debug', 'API', 'Raw response from /api/last_predictions', rawData);
        
        // Validate hierarchical response schema
        const parseResult = HierarchicalForecastResponseSchema.safeParse(rawData);
        if (!parseResult.success) {
          log('error', 'VALIDATION', 'Schema validation failed for last_predictions', parseResult.error.errors);
          throw new Error("Invalid response format");
        }
        
        const hierarchicalData = parseResult.data as HierarchicalForecastResponse;
        
        // Check if we have actual predictions
        if (!hierarchicalData.global?.daily_forecast?.length) {
          log('warn', 'API', 'No predictions stored in database');
          throw new Error("No predictions available");
        }
        
        // Cache the full hierarchical data
        setCachedPredictions(hierarchicalData);
        if (hierarchicalData.meta) {
          setForecastMeta(hierarchicalData.meta as ForecastMeta);
        }
        
        // Select data based on current filters
        const convertedData = selectFromCache("all", "all", hierarchicalData);
        if (convertedData) {
          setPredictions(convertedData.predictions);
          setTotal(convertedData.total);
          setAverage(convertedData.average);
        }
        
        log('info', 'INIT', 'Successfully loaded last predictions from backend', {
          sitesAvailable: Object.keys(hierarchicalData.sites),
          totalPredictions: hierarchicalData.global.daily_forecast.length
        });
        
        toast.success("Loaded last predictions from database");
        
      } catch (error) {
        log('warn', 'INIT', `Could not fetch last predictions: ${error instanceof Error ? error.message : String(error)}`);
        // No mock data - just show empty state
        setPredictions(null);
        setTotal(null);
        setAverage(null);
        setCachedPredictions(null);
      } finally {
        setIsLoadingLastPredictions(false);
      }
    };
    
    fetchLastPredictions();
  }, [selectFromCache]);

  // Reset to initial state (after dismissing error)
  const resetToInitialState = () => {
    log('debug', 'UI', 'Resetting to initial state');
    setProcessingError(null);
    setUploadedFile(null);
    setHasProcessedInSession(false);
    setNoData(false);
  };

  // Process predictions - only called when user clicks "Process Predictions" button
  const handleProcessData = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file first");
      return;
    }
    
    log('info', 'PROCESS', `Starting data processing for file: ${uploadedFile.name}`);
    setIsProcessing(true);
    setNoData(false);
    setProcessingError(null);
    
    try {
      // Step 1: Upload file to /api/data
      const fileFormData = new FormData();
      fileFormData.append('file', uploadedFile);
      
      log('debug', 'API', `Uploading file to ${API_BASE_URL}/api/data`);
      
      let uploadResponse: Response;
      try {
        uploadResponse = await fetchWithTimeout(
          `${API_BASE_URL}/api/data`,
          { method: 'POST', body: fileFormData },
          API_TIMEOUT_MS
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          log('error', 'API', 'File upload timed out');
          throw { type: 'timeout' as ErrorType, details: 'File upload request timed out' };
        }
        log('error', 'API', 'Network error during file upload', error);
        throw { type: 'network' as ErrorType, details: String(error) };
      }
      
      // Handle upload response errors
      if (!uploadResponse.ok) {
        const errorBody = await uploadResponse.text().catch(() => '');
        log('error', 'API', `Upload failed with status ${uploadResponse.status}`, errorBody);
        
        if (uploadResponse.status === 400) {
          throw { type: 'invalid_format' as ErrorType, details: errorBody || 'Bad request during file upload' };
        }
        if (uploadResponse.status === 422) {
          throw { type: 'insufficient_data' as ErrorType, details: errorBody || 'Unprocessable entity during file upload' };
        }
        if (uploadResponse.status >= 500) {
          throw { type: 'server_error' as ErrorType, details: errorBody || `Server returned ${uploadResponse.status}` };
        }
        throw { type: 'unknown' as ErrorType, details: `File upload failed with status ${uploadResponse.status}: ${errorBody}` };
      }
      
      // Parse upload response
      let uploadResult: unknown;
      try {
        uploadResult = await uploadResponse.json();
        log('info', 'API', 'File uploaded successfully', uploadResult);
      } catch (parseError) {
        log('error', 'API', 'Failed to parse upload response', parseError);
        throw { type: 'malformed_response' as ErrorType, details: 'Failed to parse upload response JSON' };
      }
      
      // Validate upload response
      const uploadParseResult = UploadResponseSchema.safeParse(uploadResult);
      if (!uploadParseResult.success) {
        log('warn', 'VALIDATION', 'Upload response validation warning', uploadParseResult.error);
      }
      
      // Step 2: Get ALL predictions (hierarchical) from /api/filters
      log('debug', 'API', `Fetching hierarchical predictions from ${API_BASE_URL}/api/filters`);
      
      let filterResponse: Response;
      try {
        // Request ALL data (site: "all", sector: "all") to get full hierarchical response
        filterResponse = await fetchWithTimeout(
          `${API_BASE_URL}/api/filters`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site: "all", sector: "all" }),
          },
          API_TIMEOUT_MS
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          log('error', 'API', 'Prediction request timed out');
          throw { type: 'timeout' as ErrorType, details: 'Prediction request timed out' };
        }
        log('error', 'API', 'Network error during prediction request', error);
        throw { type: 'network' as ErrorType, details: String(error) };
      }
      
      // Handle filter response errors
      if (!filterResponse.ok) {
        const errorBody = await filterResponse.text().catch(() => '');
        log('error', 'API', `Prediction request failed with status ${filterResponse.status}`, errorBody);
        
        if (filterResponse.status === 400) {
          throw { type: 'invalid_format' as ErrorType, details: errorBody || 'Bad request for predictions' };
        }
        if (filterResponse.status === 404) {
          log('warn', 'API', 'No predictions available (404)');
          setNoData(true);
          toast.info("No prediction available for this selection");
          return;
        }
        if (filterResponse.status === 422) {
          throw { type: 'insufficient_data' as ErrorType, details: errorBody || 'Insufficient data for predictions' };
        }
        if (filterResponse.status >= 500) {
          throw { type: 'server_error' as ErrorType, details: errorBody || `Server returned ${filterResponse.status}` };
        }
        throw { type: 'unknown' as ErrorType, details: `Prediction request failed with status ${filterResponse.status}: ${errorBody}` };
      }
      
      // Parse response
      let rawData: unknown;
      try {
        rawData = await filterResponse.json();
        log('debug', 'API', 'Raw response from /api/filters', rawData);
      } catch (parseError) {
        log('error', 'API', 'Failed to parse prediction response', parseError);
        throw { type: 'malformed_response' as ErrorType, details: 'Failed to parse JSON response from server' };
      }
      
      // Validate hierarchical response schema
      const parseResult = HierarchicalForecastResponseSchema.safeParse(rawData);
      if (!parseResult.success) {
        log('error', 'VALIDATION', 'Schema validation failed', parseResult.error.errors);
        throw { 
          type: 'malformed_response' as ErrorType, 
          details: `Schema validation failed: ${parseResult.error.errors.map(e => e.message).join(', ')}` 
        };
      }
      
      const hierarchicalData = parseResult.data as HierarchicalForecastResponse;
      
      // Check if we received valid predictions
      if (!hierarchicalData.global?.daily_forecast?.length) {
        log('error', 'API', 'Empty predictions in response');
        throw { type: 'empty_predictions' as ErrorType, details: 'Backend returned no predictions' };
      }
      
      // CACHE the full hierarchical data for filter-based selection
      log('info', 'CACHE', 'Caching hierarchical predictions', {
        sitesAvailable: Object.keys(hierarchicalData.sites),
        totalGlobalPredictions: hierarchicalData.global.daily_forecast.length
      });
      
      setCachedPredictions(hierarchicalData);
      if (hierarchicalData.meta) {
        setForecastMeta(hierarchicalData.meta as ForecastMeta);
      }
      
      // Select data based on current filters
      const convertedData = selectFromCache(selectedSite, selectedSector, hierarchicalData);
      if (convertedData) {
        setPredictions(convertedData.predictions);
        setTotal(convertedData.total);
        setAverage(convertedData.average);
      }
      
      setNoData(false);
      setHasProcessedInSession(true);
      
      log('info', 'PROCESS', 'Predictions processed and cached successfully');
      toast.success("Predictions processed and cached successfully!");
      
    } catch (err) {
      // Handle typed errors
      if (err && typeof err === 'object' && 'type' in err) {
        const typedError = err as { type: ErrorType; details?: string };
        const errorMessage = getErrorMessage(typedError.type, typedError.details);
        setProcessingError({ 
          type: typedError.type, 
          message: errorMessage,
          details: typedError.details 
        });
        log('error', 'PROCESS', `Processing error [${typedError.type}]`, typedError.details);
      } else {
        // Unknown error format
        const errorMessage = err instanceof Error ? err.message : String(err);
        setProcessingError({ 
          type: 'unknown', 
          message: getErrorMessage('unknown', errorMessage),
          details: errorMessage 
        });
        log('error', 'PROCESS', 'Unknown processing error', err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Update predictions when site filter changes - select from cache
  const handleSiteChange = (value: string) => {
    log('debug', 'FILTER', `Site changed to: ${value}`);
    setSelectedSite(value);
    setSelectedSector("all"); // Reset sector when site changes
    setHasProcessedInSession(false);
    
    if (cachedPredictions) {
      const convertedData = selectFromCache(value, "all", cachedPredictions);
      if (convertedData) {
        setPredictions(convertedData.predictions);
        setTotal(convertedData.total);
        setAverage(convertedData.average);
        setProcessingError(null);
      } else {
        // Filter combination not found in cache
        setProcessingError({
          type: 'filter_not_found',
          message: getErrorMessage('filter_not_found'),
          details: `Site "${value}" not found in cached data`
        });
      }
    } else {
      log('warn', 'FILTER', 'No cached data - cannot change filter without processing data first');
    }
  };

  // Update predictions when sector filter changes - select from cache
  const handleSectorChange = (value: string) => {
    log('debug', 'FILTER', `Sector changed to: ${value}`);
    setSelectedSector(value);
    setHasProcessedInSession(false);
    
    if (cachedPredictions) {
      const convertedData = selectFromCache(selectedSite, value, cachedPredictions);
      if (convertedData) {
        setPredictions(convertedData.predictions);
        setTotal(convertedData.total);
        setAverage(convertedData.average);
        setProcessingError(null);
      } else {
        // Filter combination not found in cache
        setProcessingError({
          type: 'filter_not_found',
          message: getErrorMessage('filter_not_found'),
          details: `Sector "${value}" not found for site "${selectedSite}"`
        });
      }
    } else {
      log('warn', 'FILTER', 'No cached data - cannot change filter without processing data first');
    }
  };

  const handleFileUpload = (file: File | null) => {
    log('debug', 'FILE', file ? `File selected: ${file.name}` : 'File cleared');
    setUploadedFile(file);
    setHasProcessedInSession(false);
    
    // Clear cache and predictions when new file is uploaded
    if (file) {
      log('info', 'CACHE', 'Clearing cache for new file upload');
      setCachedPredictions(null);
      setPredictions(null);
      setTotal(null);
      setAverage(null);
      setForecastMeta(null);
      setProcessingError(null);
      setNoData(false);
    }
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    if (!predictions || predictions.length === 0) {
      toast.error("No predictions available to generate report");
      return;
    }

    log('info', 'PDF', 'Generating PDF report');
    const chartElement = document.querySelector('[data-chart="predicted-harvest"]') as HTMLElement | null;

    const hasErrorData = predictions.some(p => p.error !== undefined);
    const totalError = hasErrorData 
      ? Math.round(predictions.reduce((sum, p) => sum + (p.error || 0), 0))
      : null;

    const calculatedTotal = predictions.reduce((sum, p) => sum + p.value, 0);

    const reportData = {
      predictions: predictions.map(p => ({
        day: p.day,
        date: p.date,
        value: p.value,
        error: p.error
      })),
      total: calculatedTotal,
      totalError,
      site: selectedSite,
      sector: selectedSector,
      chartElement
    };

    toast.loading("Generating PDF report...", { id: "pdf-generation" });
    
    try {
      await generateReport(reportData);
      toast.success("PDF report generated successfully!", { id: "pdf-generation" });
      log('info', 'PDF', 'PDF report generated successfully');
    } catch (err) {
      toast.error("Failed to generate PDF report", { id: "pdf-generation" });
      log('error', 'PDF', 'PDF generation failed', err);
    }
  };

  // Toggle debug panel visibility (press Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        log('info', 'DEBUG', debugMode ? 'Debug panel hidden' : 'Debug panel shown');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [debugMode]);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader hasData={predictions !== null && predictions.length > 0} isConnected={!isLoadingLastPredictions} />
      
      {/* Debug Panel - toggle with Ctrl+Shift+D */}
      {debugMode && (
        <div className="bg-muted/80 backdrop-blur border-b border-border p-4 max-h-64 overflow-y-auto font-mono text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-foreground">Debug Panel (Ctrl+Shift+D to toggle)</span>
            <div className="flex gap-4 text-muted-foreground">
              <span>API: {API_BASE_URL}</span>
              <span>Cache: {cachedPredictions ? `${Object.keys(cachedPredictions.sites).length} sites` : 'empty'}</span>
              <span>Predictions: {predictions?.length ?? 0}</span>
            </div>
          </div>
          <div className="space-y-1">
            {debugLogs.slice(-20).map((log, i) => (
              <div key={i} className={`
                ${log.level === 'error' ? 'text-destructive' : ''}
                ${log.level === 'warn' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                ${log.level === 'info' ? 'text-blue-600 dark:text-blue-400' : ''}
                ${log.level === 'debug' ? 'text-muted-foreground' : ''}
              `}>
                <span className="opacity-60">{log.timestamp.split('T')[1].split('.')[0]}</span>
                {' '}[{log.category}] {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar
          selectedSite={selectedSite}
          selectedSector={selectedSector}
          onSiteChange={handleSiteChange}
          onSectorChange={handleSectorChange}
          onFileUpload={handleFileUpload}
          onProcessData={handleProcessData}
          onGenerateReport={handleGenerateReport}
          isProcessing={isProcessing}
          hasPredictions={hasProcessedInSession && predictions !== null && predictions.length > 0}
        />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            {/* Error State - shown above content with dismiss button */}
            {processingError && (
              <ErrorState 
                message={processingError.message} 
                onRetry={resetToInitialState}
              />
            )}
            
            {isLoadingLastPredictions ? (
              <LoadingState message="Connecting to backend..." />
            ) : isProcessing ? (
              <LoadingState message="Processing predictions... This may take up to 30 seconds." />
            ) : noData ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-2">
                  <p className="text-lg text-muted-foreground">
                    No prediction available for this selection.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try selecting different filters or upload data first.
                  </p>
                </div>
              </div>
            ) : processingError ? (
              <EmptyState />
            ) : predictions === null || predictions.length === 0 ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-2">
                  <p className="text-lg text-muted-foreground">
                    No predictions loaded.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Upload a data file and click "Process Predictions" to generate forecasts.
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Press Ctrl+Shift+D to toggle debug panel
                  </p>
                </div>
              </div>
            ) : (
              <section className="space-y-6">
                <PredictedHarvestChart 
                  site={selectedSite} 
                  selectedDate={selectedDate}
                  sector={selectedSector}
                  apiPredictions={predictions}
                />
                <HarvestStats 
                  site={selectedSite}
                  selectedDate={selectedDate}
                  sector={selectedSector}
                  apiPredictions={predictions}
                  apiTotal={total}
                  apiAverage={average}
                  meta={forecastMeta}
                />
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;