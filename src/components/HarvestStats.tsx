import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePredictions } from "@/utils/predictionCalculations";

interface HarvestStatsProps {
  site: string;
  variety: string;
  selectedDate: Date;
  sector: string;
  plantType: string;
}

export const HarvestStats = ({ site, variety, selectedDate, sector, plantType }: HarvestStatsProps) => {
  const stats = calculatePredictions({ site, variety, selectedDate, sector, plantType });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Harvest Statistics</CardTitle>
        <CardDescription>Predicted harvest for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="h-[480px] space-y-6">
        <div className="space-y-1.5">
          {stats.predictions.map((pred, index) => (
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
            <p className="text-2xl font-bold text-primary">{stats.total} kg</p>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Average</p>
            <p className="text-2xl font-bold text-foreground">{stats.average} kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
