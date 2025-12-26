import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DailyPrediction } from "@/types/api";
import { calculatePredictions } from "@/utils/predictionCalculations";

// Helper to compute weekday from ISO date string (YYYY-MM-DD)
const getWeekdayFromDate = (dateStr: string): string => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dateObj = new Date(dateStr + 'T00:00:00');
  return dayNames[dateObj.getDay()];
};

interface PredictedHarvestChartProps {
  site: string;
  selectedDate: Date;
  sector?: string;
  apiPredictions?: DailyPrediction[] | null;
}

export const PredictedHarvestChart = ({ 
  site, 
  selectedDate, 
  sector, 
  apiPredictions 
}: PredictedHarvestChartProps) => {
  // Use API data if available, otherwise fall back to mock calculations
  const data = apiPredictions 
    ? apiPredictions.map(pred => ({
        date: pred.date, // Format: YYYY-MM-DD (same as daily cards)
        predicted: pred.value,
      }))
    : calculatePredictions({ 
        site, 
        selectedDate, 
        sector: sector || 'all'
      }).predictions.map(pred => ({
        date: pred.date,
        predicted: pred.value,
      }));
  
  return (
    <Card className="col-span-2" data-chart="predicted-harvest">
      <CardHeader>
        <CardTitle>Predicted Harvest</CardTitle>
        <CardDescription>Forecast of harvest volumes for the next 7 days (kg)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '11px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const predicted = payload[0].value as number;
                  const dateStr = payload[0].payload.date;
                  const fullDay = getWeekdayFromDate(dateStr);
                  
                  return (
                    <div className="bg-card border border-border p-4 rounded-lg shadow-lg">
                      <p className="text-sm font-medium mb-2">{fullDay}, {dateStr}</p>
                      <p className="text-sm text-primary">
                        Predicted Harvest: {predicted} kg
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              name="Predicted Harvest"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
