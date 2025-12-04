import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ActualVsPredictedChart } from "@/components/ActualVsPredictedChart";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { HarvestStats } from "@/components/HarvestStats";
import { toast } from "sonner";

const Index = () => {
  const [selectedSite, setSelectedSite] = useState("adm");
  const [selectedVariety, setSelectedVariety] = useState("a");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSector, setSelectedSector] = useState("A1");
  const [selectedPlantType, setSelectedPlantType] = useState("gc");
  const [selectedPlantationDate, setSelectedPlantationDate] = useState<string>("2021-07-08");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Update sector when site changes
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    // Set first sector based on site
    setSelectedSector(value === 'adm' ? 'A1' : '1.1');
  };

  const handleFileUpload = (file: File | null) => {
    setUploadedFile(file);
  };

  const handleProcessData = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    // TODO: This will call the ML backend API for predictions
    // Simulating processing time for now
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("Predictions processed successfully!");
      // Here you would update the dashboard with new predictions
    }, 2000);
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
              <ActualVsPredictedChart 
                site={selectedSite} 
                variety={selectedVariety}
                selectedDate={selectedDate}
                sector={selectedSector}
                plantType={selectedPlantType}
                plantationDate={selectedPlantationDate}
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <TopInfluencingFactors />
                <HarvestStats 
                  site={selectedSite}
                  variety={selectedVariety}
                  selectedDate={selectedDate}
                  sector={selectedSector}
                  plantType={selectedPlantType}
                  plantationDate={selectedPlantationDate}
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
