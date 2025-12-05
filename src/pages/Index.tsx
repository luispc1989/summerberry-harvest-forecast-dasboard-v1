import { useState, useMemo, useEffect } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PredictedHarvestChart } from "@/components/PredictedHarvestChart";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { HarvestStats } from "@/components/HarvestStats";
import { LoadingState } from "@/components/LoadingState";
import { toast } from "sonner";
import { 
  DailyPrediction, 
  BackendPredictionResponse, 
  convertBackendPredictions, 
  calculateStats,
  InfluencingFactor
} from "@/types/api";

// API base URL - configure this for your local Python backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Storage key for persisting last prediction
const LAST_PREDICTION_KEY = "summerberry_last_prediction";

interface StoredPrediction {
  predictions: DailyPrediction[];
  factors: InfluencingFactor[] | null;
  total: number;
  average: number;
  filters: {
    site: string;
    sector: string;
    plantationDate: string;
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
  
  // Default to last prediction filters or "All Sites" and "All Sectors"
  const [selectedSite, setSelectedSite] = useState(lastPrediction?.filters.site || "all");
  const [selectedSector, setSelectedSector] = useState(lastPrediction?.filters.sector || "all");
  const [selectedPlantationDate, setSelectedPlantationDate] = useState<string>(
    lastPrediction?.filters.plantationDate || "2021-07-08"
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Memoize today's date to avoid re-renders
  const selectedDate = useMemo(() => new Date(), []);
  const selectedDateString = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
  
  // API response state - initialized with last prediction if available
  const [predictions, setPredictions] = useState<DailyPrediction[] | null>(
    lastPrediction?.predictions || null
  );
  const [factors, setFactors] = useState<InfluencingFactor[] | null>(
    lastPrediction?.factors || null
  );
  const [total, setTotal] = useState<number | null>(
    lastPrediction?.total ?? null
  );
  const [average, setAverage] = useState<number | null>(
    lastPrediction?.average ?? null
  );
  const [noData, setNoData] = useState(false);
  
  // Track if we're using real API data (has stored prediction)
  const hasRealPrediction = lastPrediction !== null || predictions !== null;

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
      formData.append('plantationDate', selectedPlantationDate);
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
      
      const data: BackendPredictionResponse = await response.json();
      
      // Check if we received empty data
      if (!data || Object.keys(data).length === 0) {
        setNoData(true);
        toast.info("No prediction available for this selection");
        return;
      }
      
      // Convert backend response to app format
      const convertedPredictions = convertBackendPredictions(data);
      const stats = calculateStats(convertedPredictions);
      
      // Update state
      setPredictions(convertedPredictions);
      setTotal(stats.total);
      setAverage(stats.average);
      setNoData(false);
      
      // Save to localStorage for persistence
      saveLastPrediction({
        predictions: convertedPredictions,
        factors: null, // Will be populated when API returns factors
        total: stats.total,
        average: stats.average,
        filters: {
          site: selectedSite,
          sector: selectedSector,
          plantationDate: selectedPlantationDate,
        },
        timestamp: new Date().toISOString(),
      });
      
      toast.success("Predictions processed successfully!");
      
    } catch (err) {
      // Backend not available - show error message
      console.log('Backend not available:', err);
      toast.error("Failed to process predictions. Make sure the backend API is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Update sector when site changes
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    // Reset to "All Sectors" when site changes
    setSelectedSector("all");
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    // Don't trigger predictions automatically - just store the file
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar
          selectedSite={selectedSite}
          selectedSector={selectedSector}
          selectedPlantationDate={selectedPlantationDate}
          onSiteChange={handleSiteChange}
          onSectorChange={setSelectedSector}
          onPlantationDateChange={setSelectedPlantationDate}
          onFileUpload={handleFileUpload}
          onProcessData={handleProcessData}
          isProcessing={isProcessing}
        />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            {isProcessing ? (
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
                  plantationDate={selectedPlantationDate}
                  apiPredictions={predictions}
                />
                <div className="grid gap-6 lg:grid-cols-2">
                  <TopInfluencingFactors apiFactors={factors} />
                  <HarvestStats 
                    site={selectedSite}
                    selectedDate={selectedDate}
                    sector={selectedSector}
                    plantationDate={selectedPlantationDate}
                    apiPredictions={predictions}
                    apiTotal={total}
                    apiAverage={average}
                  />
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
