import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ActualVsPredictedChart } from "@/components/ActualVsPredictedChart";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { HarvestStats } from "@/components/HarvestStats";

const Index = () => {
  const [selectedSite, setSelectedSite] = useState("adm");
  const [selectedVariety, setSelectedVariety] = useState("a");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSector, setSelectedSector] = useState("A1");
  const [selectedPlantType, setSelectedPlantType] = useState("gc");
  const [selectedPlantationDate, setSelectedPlantationDate] = useState<string>("2021-07-08");

  // Update sector when site changes
  const handleSiteChange = (value: string) => {
    setSelectedSite(value);
    // Set first sector based on site
    setSelectedSector(value === 'adm' ? 'A1' : '1.1');
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
              />
              <div className="grid gap-6 lg:grid-cols-2">
                <TopInfluencingFactors />
                <HarvestStats 
                  site={selectedSite}
                  variety={selectedVariety}
                  selectedDate={selectedDate}
                  sector={selectedSector}
                  plantType={selectedPlantType}
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
