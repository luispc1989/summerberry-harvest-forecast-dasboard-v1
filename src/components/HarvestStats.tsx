import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePredictions } from "@/utils/predictionCalculations";
import { DailyPrediction } from "@/types/api";

interface HarvestStatsProps {
  site: string;
  selectedDate: Date;
  sector: string;
  plantationDate?: string;
  // API data - when provided, uses this instead of mock calculations
  apiPredictions?: DailyPrediction[] | null;
  apiTotal?: number | null;
  apiAverage?: number | null;
}

export const HarvestStats = ({ 
  site, 
  selectedDate, 
  sector, 
  plantationDate,
  apiPredictions,
  apiTotal,
  apiAverage
}: HarvestStatsProps) => {
  // Use API data if available, otherwise fall back to mock calculations
  const mockStats = calculatePredictions({ 
    site, 
    selectedDate, 
    sector, 
    plantationDate 
  });
  
  const predictions = apiPredictions || mockStats.predictions;
  const total = apiTotal ?? mockStats.total;
  const average = apiAverage ?? mockStats.average;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Harvest Statistics</CardTitle>
        <CardDescription>Predicted harvest for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="h-[480px] space-y-6">
        <div className="space-y-1.5">
          {predictions.map((pred, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center px-4 py-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{pred.day}</span>
                <span className="text-xs text-muted-foreground">{pred.date}</span>
              </div>
              <span className="text-base font-semibold text-foreground">{pred.value} kg</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total (7 days)</p>
            <p className="text-2xl font-bold text-primary">{total} kg</p>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Average</p>
            <p className="text-2xl font-bold text-foreground">{average} kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
