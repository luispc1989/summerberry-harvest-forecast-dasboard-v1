import { DashboardHeader } from "@/components/DashboardHeader";
import { FilterSidebar } from "@/components/FilterSidebar";
import { ForecastCards } from "@/components/ForecastCards";
import { ActualVsPredictedChart } from "@/components/ActualVsPredictedChart";
import { CorrelationHeatmap } from "@/components/CorrelationHeatmap";
import { DailyIndicators } from "@/components/DailyIndicators";
import { TopInfluencingFactors } from "@/components/TopInfluencingFactors";
import { YieldTrendChart } from "@/components/YieldTrendChart";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
      <div className="flex flex-1 overflow-hidden">
        <FilterSidebar />
        
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="p-6 space-y-6">
            {/* Forecast Summary Cards */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                3-Day Harvest Forecast
              </h2>
              <ForecastCards />
            </section>

            {/* Charts Section */}
            <section className="grid gap-6 lg:grid-cols-2">
              <ActualVsPredictedChart />
              <CorrelationHeatmap />
            </section>

            {/* Daily Indicators */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Today's Conditions
              </h2>
              <DailyIndicators />
            </section>

            {/* Bottom Panel */}
            <section className="grid gap-6 lg:grid-cols-2">
              <TopInfluencingFactors />
              <YieldTrendChart />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
