import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DailyPrediction } from "@/types/api";

// Helper to compute weekday from ISO date string (YYYY-MM-DD)
const getWeekdayFromDate = (dateStr: string): string => {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
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
  // No mock data fallback - require API predictions
  if (!apiPredictions || apiPredictions.length === 0) {
    return (
      <Card className="col-span-2" data-chart="predicted-harvest">
        <CardHeader>
          <CardTitle>Predicted Harvest</CardTitle>
          <CardDescription>Forecast of harvest volumes for the next 7 days (kg)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Upload a data file and process predictions to view the chart.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Transform predictions - compute weekday labels in frontend from ISO dates
  const data = apiPredictions.map(pred => ({
    date: pred.date,
    label: `${getWeekdayFromDate(pred.date)} ${pred.date.slice(5)}`,
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
              dataKey="label" 
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
                  const fullDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(dateStr + 'T00:00:00').getDay()];
                  
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
