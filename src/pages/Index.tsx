import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { PredictedHarvestChart } from "@/components/PredictedHarvestChart";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { HarvestStats } from "@/components/HarvestStats";
import { toast } from "sonner";
import { PredictionResponse } from "@/types/api";

// API base URL - configure this for your local Python backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const Index = () => {
  const [selectedSite, setSelectedSite] = useState("adm");
  const [selectedVariety, setSelectedVariety] = useState("a");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSector, setSelectedSector] = useState("A1");
  const [selectedPlantType, setSelectedPlantType] = useState("gc");
  const [selectedPlantationDate, setSelectedPlantationDate] = useState<string>("2021-07-08");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // API response state - stores real predictions from Python backend
  const [apiData, setApiData] = useState<PredictionResponse | null>(null);

  // Update sector when site changes
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    setSelectedSector(value === 'adm' ? 'A1' : '1.1');
    // Clear API data when filters change
    setApiData(null);
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
    // Clear previous API data when new file is uploaded
    if (file) {
      setApiData(null);
    }
  };

  const handleProcessData = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    try {
      // Prepare form data for the Python ML API
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('site', selectedSite);
      formData.append('variety', selectedVariety);
      formData.append('sector', selectedSector);
      formData.append('plantType', selectedPlantType);
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
      
    } catch (error) {
      console.error('Prediction API error:', error);
      toast.error("Failed to process predictions. Is the API running?");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader date={selectedDate} onDateChange={setSelectedDate} />
      
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar
          selectedSite={selectedSite}
          selectedVariety={selectedVariety}
          selectedSector={selectedSector}
          selectedPlantType={selectedPlantType}
          selectedPlantationDate={selectedPlantationDate}
          onSiteChange={handleSiteChange}
          onVarietyChange={setSelectedVariety}
          onSectorChange={setSelectedSector}
          onPlantTypeChange={setSelectedPlantType}
          onPlantationDateChange={setSelectedPlantationDate}
          onFileUpload={handleFileUpload}
          onProcessData={handleProcessData}
          isProcessing={isProcessing}
        />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            <section className="space-y-6">
              <PredictedHarvestChart 
                site={selectedSite} 
                variety={selectedVariety}
                selectedDate={selectedDate}
                sector={selectedSector}
                plantType={selectedPlantType}
                plantationDate={selectedPlantationDate}
                apiPredictions={apiData?.predictions}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <TopInfluencingFactors apiFactors={apiData?.factors} />
                <HarvestStats 
                  site={selectedSite}
                  variety={selectedVariety}
                  selectedDate={selectedDate}
                  sector={selectedSector}
                  plantType={selectedPlantType}
                  plantationDate={selectedPlantationDate}
                  apiPredictions={apiData?.predictions}
                  apiTotal={apiData?.total}
                  apiAverage={apiData?.average}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
