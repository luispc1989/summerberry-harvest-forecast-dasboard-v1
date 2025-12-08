import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePredictions } from "@/utils/predictionCalculations";
import { DailyPrediction } from "@/types/api";

interface HarvestStatsProps {
  site: string;
  selectedDate: Date;
  sector: string;
  apiPredictions?: DailyPrediction[] | null;
  apiTotal?: number | null;
  apiAverage?: number | null;
}

export const HarvestStats = ({ 
  site, 
  selectedDate, 
  sector, 
  apiPredictions,
  apiTotal,
  apiAverage
}: HarvestStatsProps) => {
  const mockStats = calculatePredictions({ 
    site, 
    selectedDate, 
    sector
  });
  
  const predictions = apiPredictions || mockStats.predictions;
  const total = apiTotal ?? mockStats.total;
  const average = apiAverage ?? mockStats.average;
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>7-Day Harvest Statistics</CardTitle>
        <CardDescription>Predicted harvest for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 7 day cards in a responsive grid */}
        <div className="grid grid-cols-7 gap-3">
          {predictions.map((pred, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors"
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">{pred.day}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{pred.date}</span>
              <div className="mt-3">
                <span className="text-xl font-bold text-foreground">{pred.value}</span>
                <span className="text-xs text-muted-foreground ml-1">kg</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Total and Average */}
        <div className="flex justify-center gap-16 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total (7 days)</p>
            <p className="text-2xl font-bold text-primary">{total} kg</p>
          </div>
          
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Daily Average</p>
            <p className="text-2xl font-bold text-foreground">{average} kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
