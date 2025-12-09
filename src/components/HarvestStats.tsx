import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePredictions } from "@/utils/predictionCalculations";
import { DailyPrediction, ForecastMeta } from "@/types/api";

interface HarvestStatsProps {
  site: string;
  selectedDate: Date;
  sector: string;
  apiPredictions?: DailyPrediction[] | null;
  apiTotal?: number | null;
  apiAverage?: number | null;
  meta?: ForecastMeta | null;
}

export const HarvestStats = ({ 
  site, 
  selectedDate, 
  sector, 
  apiPredictions,
  apiTotal,
  apiAverage,
  meta
}: HarvestStatsProps) => {
  const mockStats = calculatePredictions({ 
    site, 
    selectedDate, 
    sector
  });
  
  // Use API predictions if available, otherwise use mock
  const rawPredictions = apiPredictions || mockStats.predictions;
  
  // Ensure all predictions have error data (add mock error if missing)
  const predictions = rawPredictions.map((pred, index) => {
    if (pred.error !== undefined) {
      return pred;
    }
    // Calculate mock error (5-10% of value) if not provided
    const pseudoRandom = (Math.sin(index * 1234) + 1) / 2;
    const errorPercent = 0.05 + pseudoRandom * 0.05;
    const error = Math.round(pred.value * errorPercent);
    return {
      ...pred,
      error,
      lower: pred.value - error,
      upper: pred.value + error
    };
  });
  
  const total = apiTotal ?? mockStats.total;
  const average = apiAverage ?? mockStats.average;
  
  // Calculate average error if available
  const hasErrorData = predictions.some(p => p.error !== undefined);
  const avgError = hasErrorData 
    ? Math.round(predictions.reduce((sum, p) => sum + (p.error || 0), 0) / predictions.length)
    : null;
  
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
        
        {/* Total and Error */}
        <div className="flex justify-center gap-16 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total (7 days)</p>
            <p className="text-2xl font-bold text-primary">{total} kg</p>
          </div>
          
          {avgError !== null && (
            <div className="text-center">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Predicted Error</p>
              <p className="text-2xl font-bold text-foreground">{total} ± {avgError} kg</p>
            </div>
          )}
        </div>
        
        {/* Confidence level from meta */}
        {meta && (
          <div className="text-center pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              {meta.error_metric.toUpperCase()} with {Math.round(meta.confidence_level * 100)}% confidence level
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
