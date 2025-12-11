import { useState, useMemo, useEffect } from "react";
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
  BackendPredictionResponse, 
  convertBackendResponse
} from "@/types/api";

// Zod schema for upload response (separate from predictions)
const UploadResponseSchema = z.object({
  status: z.string(),
  sheet_count: z.number().optional(),
  message: z.string().optional()
});

// Zod schema for validating backend prediction API response
// Expected format: { predictions: {"2024-01-15": 150, ...}, total: 1420 }
const BackendPredictionResponseSchema = z.object({
  predictions: z.record(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    z.number().finite().nonnegative()
  ),
  total: z.number().finite().nonnegative(),
  average: z.number().finite().nonnegative().optional()
});

// API base URL - configure this for your local Python backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Storage key for persisting last prediction
const LAST_PREDICTION_KEY = "summerberry_last_prediction";

// Timeout for API requests (30 seconds)
const API_TIMEOUT_MS = 30000;

// Error types for specific handling
type ErrorType = 
  | 'timeout'
  | 'network'
  | 'invalid_format'
  | 'insufficient_data'
  | 'server_error'
  | 'empty_predictions'
  | 'malformed_response'
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
    network: 'Network error. Please check your connection and ensure the backend server is running.',
    invalid_format: 'Invalid file format (400). The uploaded file format is not supported or contains invalid data.',
    insufficient_data: 'Insufficient data (422). The uploaded file does not contain enough data to generate predictions.',
    server_error: 'Server error (500). An internal error occurred on the backend server.',
    empty_predictions: 'Empty predictions. The backend returned no predictions for the selected filters.',
    malformed_response: 'Malformed response. The backend returned data in an unexpected format.',
    unknown: 'An unexpected error occurred.'
  };
  
  const baseMessage = messages[type];
  return details ? `${baseMessage}\n\nDetails: ${details}` : baseMessage;
};

interface StoredPrediction {
  predictions: DailyPrediction[];
  total: number;
  average: number;
  filters: {
    site: string;
    sector: string;
  };
  timestamp: string;
}

// Load last prediction from localStorage
const loadLastPrediction = (): StoredPrediction | null => {
  try {
    const stored = localStorage.getItem(LAST_PREDICTION_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error("Failed to load last prediction:", err);
  }
  return null;
};

// Save prediction to localStorage
const saveLastPrediction = (prediction: StoredPrediction) => {
  try {
    localStorage.setItem(LAST_PREDICTION_KEY, JSON.stringify(prediction));
  } catch (err) {
    console.error("Failed to save prediction:", err);
  }
};

// MOCK DATA REMOVED - Backend integration is now active
// When API is unavailable, show error state instead of mock data

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
  // Load last prediction on mount
  const lastPrediction = useMemo(() => loadLastPrediction(), []);
  
  // Always default to "All Sites" and "All Sectors"
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Memoize today's date to avoid re-renders
  const selectedDate = useMemo(() => new Date(), []);
  const selectedDateString = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
  
  // API response state - initialized with last prediction if available
  const [predictions, setPredictions] = useState<DailyPrediction[] | null>(
    lastPrediction?.predictions || null
  );
  const [total, setTotal] = useState<number | null>(
    lastPrediction?.total ?? null
  );
  const [average, setAverage] = useState<number | null>(
    lastPrediction?.average ?? null
  );
  const [noData, setNoData] = useState(false);
  
  // Error state for displaying detailed errors
  const [processingError, setProcessingError] = useState<ProcessingError | null>(null);
  
  // Track if predictions were processed in current session (not just loaded from localStorage)
  const [hasProcessedInSession, setHasProcessedInSession] = useState(false);
  
  const [isLoadingLastPredictions, setIsLoadingLastPredictions] = useState(true);

  // On dashboard load - use localStorage only (no mock data fallback)
  useEffect(() => {
    // Check if we have stored predictions
    if (lastPrediction?.predictions && lastPrediction.predictions.length > 0) {
      setPredictions(lastPrediction.predictions);
      setTotal(lastPrediction.total);
      setAverage(lastPrediction.average);
      console.log("Loaded predictions from localStorage");
    } else {
      // No stored predictions - show empty state (no mock data)
      setPredictions(null);
      setTotal(null);
      setAverage(null);
      console.log("No stored predictions, waiting for user to upload data");
    }
    setIsLoadingLastPredictions(false);
  }, [lastPrediction]);

  // Reset to initial state (after dismissing error)
  const resetToInitialState = () => {
    setProcessingError(null);
    setUploadedFile(null);
    setHasProcessedInSession(false);
    setNoData(false);
    // Keep existing predictions/mock data visible
  };

  // Process predictions - only called when user clicks "Process Predictions" button
  const handleProcessData = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file first");
      return;
    }
    
    setIsProcessing(true);
    setNoData(false);
    setProcessingError(null);
    
    try {
      // Step 1: Upload file to /api/data
      const fileFormData = new FormData();
      fileFormData.append('file', uploadedFile);
      
      let uploadResponse: Response;
      try {
        uploadResponse = await fetchWithTimeout(
          `${API_BASE_URL}/api/data`,
          { method: 'POST', body: fileFormData },
          API_TIMEOUT_MS
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw { type: 'timeout' as ErrorType, details: 'File upload request timed out' };
        }
        throw { type: 'network' as ErrorType, details: String(error) };
      }
      
      // Handle upload response errors
      if (!uploadResponse.ok) {
        const errorBody = await uploadResponse.text().catch(() => '');
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
      
      // Parse upload response (separate schema from predictions)
      let uploadResult: unknown;
      try {
        uploadResult = await uploadResponse.json();
      } catch (parseError) {
        throw { type: 'malformed_response' as ErrorType, details: 'Failed to parse upload response JSON' };
      }
      
      // Validate upload response with its own schema (NOT predictions schema)
      const uploadParseResult = UploadResponseSchema.safeParse(uploadResult);
      if (!uploadParseResult.success) {
        console.warn("Upload response validation warning:", uploadParseResult.error);
        // Don't throw - upload might still be successful even if response format differs
      }
      
      console.log("File uploaded successfully:", uploadResult);
      
      // Step 2: Get predictions from /api/filters
      let filterResponse: Response;
      try {
        filterResponse = await fetchWithTimeout(
          `${API_BASE_URL}/api/filters`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ site: selectedSite, sector: selectedSector }),
          },
          API_TIMEOUT_MS
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          throw { type: 'timeout' as ErrorType, details: 'Prediction request timed out' };
        }
        throw { type: 'network' as ErrorType, details: String(error) };
      }
      
      // Handle filter response errors
      if (!filterResponse.ok) {
        const errorBody = await filterResponse.text().catch(() => '');
        if (filterResponse.status === 400) {
          throw { type: 'invalid_format' as ErrorType, details: errorBody || 'Bad request for predictions' };
        }
        if (filterResponse.status === 404) {
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
      } catch (parseError) {
        throw { type: 'malformed_response' as ErrorType, details: 'Failed to parse JSON response from server' };
      }
      
      // Validate response schema to prevent malformed data issues
      const parseResult = BackendPredictionResponseSchema.safeParse(rawData);
      if (!parseResult.success) {
        console.error("Invalid API response format:", parseResult.error);
        throw { 
          type: 'malformed_response' as ErrorType, 
          details: `Schema validation failed: ${parseResult.error.errors.map(e => e.message).join(', ')}` 
        };
      }
      
      const data: BackendPredictionResponse = parseResult.data as BackendPredictionResponse;
      
      // Check if we received empty predictions
      if (Object.keys(data.predictions).length === 0) {
        throw { type: 'empty_predictions' as ErrorType, details: 'Backend returned an empty predictions object' };
      }
      
      // Convert backend response to app format
      const convertedData = convertBackendResponse(data);
      
      // Update state with real API data
      setPredictions(convertedData.predictions);
      setTotal(convertedData.total);
      setAverage(convertedData.average);
      setNoData(false);
      setHasProcessedInSession(true);
      
      // Save to localStorage for persistence
      saveLastPrediction({
        predictions: convertedData.predictions,
        total: convertedData.total,
        average: convertedData.average,
        filters: {
          site: selectedSite,
          sector: selectedSector,
        },
        timestamp: new Date().toISOString(),
      });
      
      toast.success("Predictions processed successfully!");
      
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
        console.error(`Processing error [${typedError.type}]:`, typedError.details);
      } else {
        // Unknown error format
        const errorMessage = err instanceof Error ? err.message : String(err);
        setProcessingError({ 
          type: 'unknown', 
          message: getErrorMessage('unknown', errorMessage),
          details: errorMessage 
        });
        console.error("Unknown processing error:", err);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Update sector when site changes
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    // Reset to "All Sectors" when site changes
    setSelectedSector("all");
    // Reset processed state - user needs to reprocess with new filters
    setHasProcessedInSession(false);
  };

  // Handle sector change
  const handleSectorChange = (value: string) => {
    setSelectedSector(value);
    setHasProcessedInSession(false);
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    // Reset processed state when new file is uploaded - user needs to reprocess
    setHasProcessedInSession(false);
  };

  // Generate PDF report
  const handleGenerateReport = async () => {
    if (!predictions || predictions.length === 0) {
      toast.error("No predictions available to generate report");
      return;
    }

    // Find the chart element
    const chartElement = document.querySelector('[data-chart="predicted-harvest"]') as HTMLElement | null;

    // Calculate total error as sum of daily errors
    const hasErrorData = predictions.some(p => p.error !== undefined);
    const totalError = hasErrorData 
      ? Math.round(predictions.reduce((sum, p) => sum + (p.error || 0), 0))
      : null;

    // Calculate total as sum of daily values
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
    } catch (err) {
      toast.error("Failed to generate PDF report", { id: "pdf-generation" });
      console.error("PDF generation error:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
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
              <LoadingState message="Loading last predictions..." />
            ) : isProcessing ? (
              <LoadingState message="Processing predictions... This may take up to 30 seconds." />
            ) : noData ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center space-y-2">
                  <p className="text-lg text-muted-foreground">
                    No prediction available for this selection.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try selecting different filters.
                  </p>
                </div>
              </div>
            ) : processingError ? (
              // When there's an error, show empty state below the error message
              <EmptyState />
            ) : predictions === null || predictions.length === 0 ? (
              <EmptyState />
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
