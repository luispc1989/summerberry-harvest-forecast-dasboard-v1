import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { date: "Mon", actual: 186, predicted: 180 },
  { date: "Tue", actual: 198, predicted: 205 },
  { date: "Wed", actual: 220, predicted: 218 },
  { date: "Thu", actual: 239, predicted: 235 },
  { date: "Fri", actual: 248, predicted: 248 },
  { date: "Sat", actual: 265, predicted: 265 },
  { date: "Sun", actual: 221, predicted: 221 },
];

export const ActualVsPredictedChart = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Actual vs Predicted Harvest</CardTitle>
        <CardDescription>Comparison of predicted and actual harvest volumes (kg)</CardDescription>
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
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))' }}
              name="Actual Harvest"
            />
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--secondary))' }}
              name="Predicted Harvest"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
