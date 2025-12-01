import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { calculatePredictions } from "@/utils/predictionCalculations";

interface ActualVsPredictedChartProps {
  site: string;
  variety: string;
  selectedDate: Date;
  sector?: string;
  plantType?: string;
}

export const ActualVsPredictedChart = ({ site, variety, selectedDate, sector, plantType }: ActualVsPredictedChartProps) => {
  const predictions = calculatePredictions({ 
    site, 
    variety, 
    selectedDate, 
    sector: sector || 'A1', 
    plantType: plantType || 'gc' 
  });
  
  const data = predictions.predictions.map(pred => ({
    date: pred.date,
    predicted: pred.value,
  }));
  
  return (
    <Card className="col-span-2">
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
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const predicted = payload[0].value as number;
                  
                  return (
                    <div className="bg-card border border-border p-4 rounded-lg shadow-lg">
                      <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
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