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
        {/* Horizontal table with 7 columns */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {predictions.map((pred, index) => (
                  <th key={index} className="px-2 py-3 text-center">
                    <div className="text-sm font-semibold text-foreground">{pred.day}</div>
                    <div className="text-xs text-muted-foreground">{pred.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {predictions.map((pred, index) => (
                  <td key={index} className="px-2 py-4 text-center">
                    <span className="text-lg font-bold text-foreground">{pred.value}</span>
                    <span className="text-sm text-muted-foreground ml-1">kg</span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Total and Average - centered below */}
        <div className="flex justify-center gap-12 pt-4 border-t border-border">
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total (7 days)</p>
            <p className="text-2xl font-bold text-primary">{total} kg</p>
          </div>
          
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Average</p>
            <p className="text-2xl font-bold text-foreground">{average} kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
