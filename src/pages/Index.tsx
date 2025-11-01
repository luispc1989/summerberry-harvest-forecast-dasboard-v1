import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ForecastCards } from "@/components/ForecastCards";
import { ActualVsPredictedChart } from "@/components/ActualVsPredictedChart";
import { CorrelationHeatmap } from "@/components/CorrelationHeatmap";
import { DailyIndicators } from "@/components/DailyIndicators";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { YieldTrendChart } from "@/components/YieldTrendChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("forecast");
  const [selectedSite, setSelectedSite] = useState("adm");
  const [selectedVariety, setSelectedVariety] = useState("a");
  const [selectedDateRange, setSelectedDateRange] = useState("7d");

  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar 
          selectedSite={selectedSite}
          selectedVariety={selectedVariety}
          selectedDateRange={selectedDateRange}
          onSiteChange={setSelectedSite}
          onVarietyChange={setSelectedVariety}
          onDateRangeChange={setSelectedDateRange}
        />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl grid-cols-2 mb-6">
                <TabsTrigger value="forecast" className="text-sm">
                  3-Day Harvest
                </TabsTrigger>
                <TabsTrigger value="correlations" className="text-sm">
                  Variable Correlations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="forecast" className="space-y-6 animate-fade-in">
                <section>
                  <h2 className="text-2xl font-bold text-foreground mb-4">
                    3-Day Harvest Forecast
                  </h2>
                  <ForecastCards />
                </section>

                <section className="grid gap-6 lg:grid-cols-2">
                  <ActualVsPredictedChart 
                    site={selectedSite} 
                    variety={selectedVariety}
                    dateRange={selectedDateRange}
                  />
                  <TopInfluencingFactors />
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
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
