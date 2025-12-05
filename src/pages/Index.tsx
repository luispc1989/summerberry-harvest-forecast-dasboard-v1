import { useState, useMemo } from "react";
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

const Index = () => {
  // Default to "All Sites" and "All Sectors"
  const [selectedSite, setSelectedSite] = useState("all");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedPlantationDate, setSelectedPlantationDate] = useState<string>("2021-07-08");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Memoize today's date to avoid re-renders
  const selectedDate = useMemo(() => new Date(), []);
  const selectedDateString = useMemo(() => selectedDate.toISOString().split('T')[0], [selectedDate]);
  
  // API response state - stores real predictions from Python backend
  // When null, components will use mock data as fallback
  const [predictions, setPredictions] = useState<DailyPrediction[] | null>(null);
  const [factors, setFactors] = useState<InfluencingFactor[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [noData, setNoData] = useState(false);

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
          setPredictions(null);
          setFactors(null);
          setTotal(null);
          setAverage(null);
          toast.info("No prediction available for this selection");
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: BackendPredictionResponse = await response.json();
      
      // Check if we received empty data
      if (!data || Object.keys(data).length === 0) {
        setNoData(true);
        setPredictions(null);
        setFactors(null);
        setTotal(null);
        setAverage(null);
        toast.info("No prediction available for this selection");
        return;
      }
      
      // Convert backend response to app format
      const convertedPredictions = convertBackendPredictions(data);
      const stats = calculateStats(convertedPredictions);
      
      setPredictions(convertedPredictions);
      setTotal(stats.total);
      setAverage(stats.average);
      setNoData(false);
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
