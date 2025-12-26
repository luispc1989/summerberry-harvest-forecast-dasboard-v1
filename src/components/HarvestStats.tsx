import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePredictions } from "@/utils/predictionCalculations";
import { DailyPrediction, ForecastMeta } from "@/types/api";

// Helper to compute weekday from ISO date string (YYYY-MM-DD)
const getWeekdayFromDate = (dateStr: string): string => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dateObj = new Date(dateStr + 'T00:00:00'); // Ensure local timezone
  return dayNames[dateObj.getDay()];
};

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
  
  // Compute weekdays from ISO dates in frontend + ensure error data
  const predictions = rawPredictions.map((pred, index) => {
    const computedDay = getWeekdayFromDate(pred.date);
    
    // Calculate mock error (5-10% of value) if not provided
    if (pred.error !== undefined) {
      return { ...pred, day: computedDay };
    }
    
    const pseudoRandom = (Math.sin(index * 1234) + 1) / 2;
    const errorPercent = 0.05 + pseudoRandom * 0.05;
    const error = Math.round(pred.value * errorPercent);
    return {
      ...pred,
      day: computedDay,
      error,
      lower: pred.value - error,
      upper: pred.value + error
    };
  });
  
  const total = apiTotal ?? mockStats.total;
  const average = apiAverage ?? mockStats.average;
  
  // Calculate aggregated error as simple sum of daily errors
  const hasErrorData = predictions.some(p => p.error !== undefined);
  const aggregatedError = hasErrorData 
    ? Math.round(predictions.reduce((sum, p) => sum + (p.error || 0), 0))
    : null;
  
  // Calculate total as sum of daily values (frontend responsibility)
  const calculatedTotal = predictions.reduce((sum, p) => sum + p.value, 0);
  
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
              className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/40 border border-border/50 hover:bg-muted/60 transition-colors min-w-0"
            >
              <span className="text-xs font-semibold text-primary uppercase tracking-wide truncate w-full text-center">{pred.day}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full text-center">{pred.date}</span>
              <div className="mt-3 w-full text-center">
                <span className="text-base sm:text-lg md:text-xl font-bold text-foreground leading-tight" style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1.25rem)' }}>{pred.value}</span>
                <span className="text-xs text-muted-foreground ml-0.5">kg</span>
              </div>
              {pred.error !== undefined && (
                <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">±{pred.error} kg</span>
              )}
            </div>
          ))}
        </div>
        
        {/* Total Harvest Prediction and Total Prediction Error */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-16 pt-4 border-t border-border">
          <div className="text-center min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Harvest Prediction (7 days)</p>
            <p className="font-bold text-primary leading-tight" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>{calculatedTotal} kg</p>
          </div>
          
          {aggregatedError !== null && (
            <div className="text-center min-w-0">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Total Prediction Error (7 days)</p>
              <p className="font-bold text-foreground leading-tight" style={{ fontSize: 'clamp(1.25rem, 4vw, 1.5rem)' }}>± {aggregatedError} kg</p>
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
