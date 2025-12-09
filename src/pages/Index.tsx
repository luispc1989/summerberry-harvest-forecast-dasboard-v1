import { useState, useMemo, useEffect } from "react";
import { z } from "zod";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PredictedHarvestChart } from "@/components/PredictedHarvestChart";

import { HarvestStats } from "@/components/HarvestStats";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import { generateReport } from "@/utils/reportGenerator";
import { 
  DailyPrediction, 
  BackendPredictionResponse, 
  convertBackendResponse
} from "@/types/api";

// Zod schema for validating backend API response
// Expected format: { predictions: {"2024-01-15": 150, ...}, total: 1050, average: 150 }
const BackendPredictionResponseSchema = z.object({
  predictions: z.record(
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    z.number().finite().nonnegative()
  ),
  total: z.number().finite().nonnegative(),
  average: z.number().finite().nonnegative()
});

// API base URL - configure this for your local Python backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Storage key for persisting last prediction
const LAST_PREDICTION_KEY = "summerberry_last_prediction";

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
  
  // Track if predictions were processed in current session (not just loaded from localStorage)
  const [hasProcessedInSession, setHasProcessedInSession] = useState(false);
  
  const [isLoadingLastPredictions, setIsLoadingLastPredictions] = useState(true);

  // Fetch last predictions from backend on dashboard load
  useEffect(() => {
    const fetchLastPredictions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/last-predictions`);
        
        if (!response.ok) {
          if (response.status === 404) {
            console.log("No previous predictions found in database");
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }
        
        const rawData = await response.json();
        
        // Validate response schema
        const parseResult = BackendPredictionResponseSchema.safeParse(rawData);
        if (!parseResult.success) {
          console.error("Invalid API response format:", parseResult.error);
          return;
        }
        
        const data: BackendPredictionResponse = parseResult.data as BackendPredictionResponse;
        
        if (Object.keys(data.predictions).length === 0) {
          console.log("No predictions in last-predictions response");
          return;
        }
        
        // Convert and update state
        const convertedData = convertBackendResponse(data);
        setPredictions(convertedData.predictions);
        setTotal(convertedData.total);
        setAverage(convertedData.average);
        
        // Also save to localStorage
        saveLastPrediction({
          predictions: convertedData.predictions,
          total: convertedData.total,
          average: convertedData.average,
          filters: { site: "all", sector: "all" },
          timestamp: new Date().toISOString(),
        });
        
        console.log("Last predictions loaded from database");
        
      } catch (err) {
        console.log("Could not fetch last predictions from backend:", err);
        // Fallback to localStorage data (already loaded in initial state)
      } finally {
        setIsLoadingLastPredictions(false);
      }
    };
    
    fetchLastPredictions();
  }, []);

  // Process predictions - only called when user clicks "Process Predictions" button
  const handleProcessData = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a file first");
      return;
    }
    
    setIsProcessing(true);
    setNoData(false);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('site', selectedSite);
      formData.append('sector', selectedSector);
      
      formData.append('selectedDate', selectedDateString);
      
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setNoData(true);
          toast.info("No prediction available for this selection");
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const rawData = await response.json();
      
      // Validate response schema to prevent malformed data issues
      const parseResult = BackendPredictionResponseSchema.safeParse(rawData);
      if (!parseResult.success) {
        console.error("Invalid API response format:", parseResult.error);
        throw new Error("Invalid response format from prediction API");
      }
      
      const data: BackendPredictionResponse = parseResult.data as BackendPredictionResponse;
      
      // Check if we received empty predictions
      if (Object.keys(data.predictions).length === 0) {
        setNoData(true);
        toast.info("No prediction available for this selection");
        return;
      }
      
      // Convert backend response to app format (no frontend calculations)
      const convertedData = convertBackendResponse(data);
      
      // Update state with real API data
      setPredictions(convertedData.predictions);
      setTotal(convertedData.total);
      setAverage(convertedData.average);
      setNoData(false);
      setHasProcessedInSession(true); // Mark as processed in current session
      
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
      // Backend not available - show error to user
      console.error('Backend error:', err);
      toast.error("Failed to process predictions. Please check your connection to the backend.");
      setNoData(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update sector when site changes - reset processed state to require new processing
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    // Reset to "All Sectors" when site changes
    setSelectedSector("all");
    // Reset processed state - user needs to reprocess with new filters
    setHasProcessedInSession(false);
  };

  // Handle sector change - reset processed state
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
            {isLoadingLastPredictions ? (
              <LoadingState message="Loading last predictions..." />
            ) : isProcessing ? (
              <LoadingState />
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
