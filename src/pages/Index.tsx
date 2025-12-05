import { useState, useEffect, useCallback } from "react";
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
  const selectedDate = new Date(); // Today's date, no longer user-selectable
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // API response state - stores real predictions from Python backend
  // When null, components will use mock data as fallback
  const [predictions, setPredictions] = useState<DailyPrediction[] | null>(null);
  const [factors, setFactors] = useState<InfluencingFactor[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [average, setAverage] = useState<number | null>(null);
  const [noData, setNoData] = useState(false);
  const [usingMockData, setUsingMockData] = useState(true);

  // Fetch predictions from backend
  const fetchPredictions = useCallback(async () => {
    setIsProcessing(true);
    setNoData(false);
    
    try {
      // Build query params
      const params = new URLSearchParams({
        site: selectedSite,
        sector: selectedSector,
        plantationDate: selectedPlantationDate,
        selectedDate: selectedDate.toISOString().split('T')[0]
      });
      
      // If there's an uploaded file, use POST with FormData
      let response: Response;
      
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('site', selectedSite);
        formData.append('sector', selectedSector);
        formData.append('plantationDate', selectedPlantationDate);
        formData.append('selectedDate', selectedDate.toISOString().split('T')[0]);
        
        response = await fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // GET request for filter-based predictions
        response = await fetch(`${API_BASE_URL}/predict?${params.toString()}`, {
          method: 'GET',
        });
      }
      
      if (!response.ok) {
        if (response.status === 404) {
          // No data for this selection - use mock data
          setUsingMockData(true);
          setPredictions(null);
          setFactors(null);
          setTotal(null);
          setAverage(null);
          return;
        }
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: BackendPredictionResponse = await response.json();
      
      // Check if we received empty data
      if (!data || Object.keys(data).length === 0) {
        setUsingMockData(true);
        setPredictions(null);
        setFactors(null);
        setTotal(null);
        setAverage(null);
        return;
      }
      
      // Convert backend response to app format
      const convertedPredictions = convertBackendPredictions(data);
      const stats = calculateStats(convertedPredictions);
      
      setPredictions(convertedPredictions);
      setTotal(stats.total);
      setAverage(stats.average);
      setNoData(false);
      setUsingMockData(false);
      
    } catch (err) {
      // Backend not available - use mock data (this is expected during development)
      console.log('Backend not available, using mock data');
      setUsingMockData(true);
      setPredictions(null);
      setFactors(null);
      setTotal(null);
      setAverage(null);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedSite, selectedSector, selectedPlantationDate, selectedDate, uploadedFile]);

  // Fetch predictions on mount and when filters change
  useEffect(() => {
    fetchPredictions();
  }, [fetchPredictions]);

  // Update sector when site changes
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    // Reset to "All Sectors" when site changes
    setSelectedSector("all");
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
  };

  const handleProcessData = async () => {
    if (!uploadedFile) return;
    await fetchPredictions();
    if (!usingMockData) {
      toast.success("Predictions processed successfully!");
    }
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
