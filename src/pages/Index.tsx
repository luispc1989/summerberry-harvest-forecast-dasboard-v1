import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ForecastCards } from "@/components/ForecastCards";
import { ActualVsPredictedChart } from "@/components/ActualVsPredictedChart";
import { CorrelationHeatmap } from "@/components/CorrelationHeatmap";
import { DailyIndicators } from "@/components/DailyIndicators";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { WeeklyAverages } from "@/components/WeeklyAverages";
import { YieldTrendChart } from "@/components/YieldTrendChart";
import { HarvestStats } from "@/components/HarvestStats";
import { SectorComparison } from "@/components/SectorComparison";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("forecast");
  const [selectedSite, setSelectedSite] = useState("adm");
  const [selectedVariety, setSelectedVariety] = useState("a");
  const [selectedDateRange, setSelectedDateRange] = useState("7d");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSector, setSelectedSector] = useState("A1");
  const [selectedPlantType, setSelectedPlantType] = useState("rb");
  const [selectedPlantationDate, setSelectedPlantationDate] = useState<Date | undefined>(undefined);

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader date={selectedDate} onDateChange={setSelectedDate} />
      
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar 
          selectedSite={selectedSite}
          selectedVariety={selectedVariety}
          selectedDateRange={selectedDateRange}
          selectedSector={selectedSector}
          selectedPlantType={selectedPlantType}
          selectedPlantationDate={selectedPlantationDate}
          onSiteChange={setSelectedSite}
          onVarietyChange={setSelectedVariety}
          onDateRangeChange={setSelectedDateRange}
          onSectorChange={setSelectedSector}
          onPlantTypeChange={setSelectedPlantType}
          onPlantationDateChange={setSelectedPlantationDate}
        />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-3xl grid-cols-3 mb-6">
                <TabsTrigger value="forecast" className="text-sm">
                  Short-Term Harvest
                </TabsTrigger>
                <TabsTrigger value="correlations" className="text-sm">
                  Variable Correlations
                </TabsTrigger>
                <TabsTrigger value="comparison" className="text-sm">
                  Sector Comparison
                </TabsTrigger>
              </TabsList>

              <TabsContent value="forecast" className="space-y-6 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Short-Term Harvest Forecast
                  </h2>
                  <ForecastCards />
                </section>

                <section className="space-y-6">
                  <ActualVsPredictedChart 
                    site={selectedSite} 
                    variety={selectedVariety}
                    dateRange={selectedDateRange}
                    selectedDate={selectedDate}
                    sector={selectedSector}
                    plantType={selectedPlantType}
                  />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <TopInfluencingFactors />
                    <HarvestStats 
                      site={selectedSite}
                      variety={selectedVariety}
                      dateRange={selectedDateRange}
                      selectedDate={selectedDate}
                      sector={selectedSector}
                      plantType={selectedPlantType}
                    />
                  </div>
                </section>
              </TabsContent>

              <TabsContent value="correlations" className="space-y-6 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Variable Correlation Analysis
                  </h2>
                  <CorrelationHeatmap />
                </section>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-6 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    Sector Comparison
                  </h2>
                  <SectorComparison 
                    site={selectedSite}
                    variety={selectedVariety}
                    dateRange={selectedDateRange}
                    selectedDate={selectedDate}
                  />
                </section>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
