import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PredictedHarvestChart } from "@/components/PredictedHarvestChart";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { HarvestStats } from "@/components/HarvestStats";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";
import { PredictionResponse } from "@/types/api";

// API base URL - configure this for your local Python backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const Index = () => {
  const [selectedSite, setSelectedSite] = useState("adm");
  const [selectedSector, setSelectedSector] = useState("A1");
  const [selectedPlantationDate, setSelectedPlantationDate] = useState<string>("2021-07-08");
  const selectedDate = new Date(); // Today's date, no longer user-selectable
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // API response state - stores real predictions from Python backend
  const [apiData, setApiData] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Update sector when site changes
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    setSelectedSector(value === 'adm' ? 'A1' : '1.1');
    // Clear API data and errors when filters change
    setApiData(null);
    setError(null);
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    // Clear previous API data and errors when new file is uploaded
    if (file) {
      setApiData(null);
      setError(null);
    }
  };

  const handleProcessData = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Prepare form data for the Python ML API
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('site', selectedSite);
      formData.append('sector', selectedSector);
      formData.append('plantationDate', selectedPlantationDate);
      formData.append('selectedDate', selectedDate.toISOString().split('T')[0]);
      
      // Call Python ML API
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: PredictionResponse = await response.json();
      setApiData(data);
      toast.success("Predictions processed successfully!");
      
    } catch (err) {
      console.error('Prediction API error:', err);
      const errorMessage = err instanceof Error ? err.message : "Failed to connect to the API";
      setError(`Failed to process predictions: ${errorMessage}. Make sure the Python backend is running on ${API_BASE_URL}`);
      toast.error("Failed to process predictions. Is the API running?");
    } finally {
      setIsProcessing(false);
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
            ) : error ? (
              <div className="space-y-6">
                <ErrorState message={error} onRetry={handleProcessData} />
                <section className="space-y-6">
                <PredictedHarvestChart 
                    site={selectedSite} 
                    selectedDate={selectedDate}
                    sector={selectedSector}
                    plantationDate={selectedPlantationDate}
                    apiPredictions={apiData?.predictions}
                  />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <TopInfluencingFactors apiFactors={apiData?.factors} />
                    <HarvestStats 
                      site={selectedSite}
                      selectedDate={selectedDate}
                      sector={selectedSector}
                      plantationDate={selectedPlantationDate}
                      apiPredictions={apiData?.predictions}
                      apiTotal={apiData?.total}
                      apiAverage={apiData?.average}
                    />
                  </div>
                </section>
              </div>
            ) : (
              <section className="space-y-6">
                <PredictedHarvestChart 
                  site={selectedSite} 
                  selectedDate={selectedDate}
                  sector={selectedSector}
                  plantationDate={selectedPlantationDate}
                  apiPredictions={apiData?.predictions}
                />
                <div className="grid gap-6 lg:grid-cols-2">
                  <TopInfluencingFactors apiFactors={apiData?.factors} />
                  <HarvestStats 
                    site={selectedSite}
                    selectedDate={selectedDate}
                    sector={selectedSector}
                    plantationDate={selectedPlantationDate}
                    apiPredictions={apiData?.predictions}
                    apiTotal={apiData?.total}
                    apiAverage={apiData?.average}
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
