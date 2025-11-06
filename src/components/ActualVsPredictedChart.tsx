import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Data for different site and variety combinations
const chartData = {
  adm: {
    a: [
      { date: "Mon", actual: 186, predicted: 180 },
      { date: "Tue", actual: 198, predicted: 205 },
      { date: "Wed", actual: 220, predicted: 218 },
      { date: "Thu", actual: 239, predicted: 235 },
      { date: "Fri", actual: 248, predicted: 248 },
      { date: "Sat", actual: 265, predicted: 265 },
      { date: "Sun", actual: 221, predicted: 221 },
    ],
    b: [
      { date: "Mon", actual: 165, predicted: 170 },
      { date: "Tue", actual: 178, predicted: 185 },
      { date: "Wed", actual: 195, predicted: 198 },
      { date: "Thu", actual: 215, predicted: 210 },
      { date: "Fri", actual: 228, predicted: 225 },
      { date: "Sat", actual: 242, predicted: 240 },
      { date: "Sun", actual: 198, predicted: 205 },
    ],
    c: [
      { date: "Mon", actual: 205, predicted: 200 },
      { date: "Tue", actual: 218, predicted: 220 },
      { date: "Wed", actual: 235, predicted: 238 },
      { date: "Thu", actual: 255, predicted: 250 },
      { date: "Fri", actual: 268, predicted: 270 },
      { date: "Sat", actual: 285, predicted: 282 },
      { date: "Sun", actual: 245, predicted: 248 },
    ],
    d: [
      { date: "Mon", actual: 145, predicted: 150 },
      { date: "Tue", actual: 158, predicted: 165 },
      { date: "Wed", actual: 175, predicted: 178 },
      { date: "Thu", actual: 192, predicted: 188 },
      { date: "Fri", actual: 205, predicted: 208 },
      { date: "Sat", actual: 218, predicted: 215 },
      { date: "Sun", actual: 178, predicted: 182 },
    ],
    e: [
      { date: "Mon", actual: 225, predicted: 220 },
      { date: "Tue", actual: 238, predicted: 242 },
      { date: "Wed", actual: 258, predicted: 255 },
      { date: "Thu", actual: 275, predicted: 278 },
      { date: "Fri", actual: 292, predicted: 288 },
      { date: "Sat", actual: 308, predicted: 305 },
      { date: "Sun", actual: 265, predicted: 268 },
    ],
  },
  alm: {
    a: [
      { date: "Mon", actual: 175, predicted: 178 },
      { date: "Tue", actual: 188, predicted: 192 },
      { date: "Wed", actual: 208, predicted: 205 },
      { date: "Thu", actual: 225, predicted: 228 },
      { date: "Fri", actual: 242, predicted: 238 },
      { date: "Sat", actual: 255, predicted: 258 },
      { date: "Sun", actual: 212, predicted: 215 },
    ],
    b: [
      { date: "Mon", actual: 155, predicted: 158 },
      { date: "Tue", actual: 168, predicted: 172 },
      { date: "Wed", actual: 185, predicted: 188 },
      { date: "Thu", actual: 202, predicted: 198 },
      { date: "Fri", actual: 218, predicted: 215 },
      { date: "Sat", actual: 232, predicted: 235 },
      { date: "Sun", actual: 188, predicted: 192 },
    ],
    c: [
      { date: "Mon", actual: 195, predicted: 192 },
      { date: "Tue", actual: 208, predicted: 212 },
      { date: "Wed", actual: 228, predicted: 225 },
      { date: "Thu", actual: 245, predicted: 248 },
      { date: "Fri", actual: 262, predicted: 258 },
      { date: "Sat", actual: 275, predicted: 278 },
      { date: "Sun", actual: 235, predicted: 238 },
    ],
    d: [
      { date: "Mon", actual: 135, predicted: 138 },
      { date: "Tue", actual: 148, predicted: 152 },
      { date: "Wed", actual: 165, predicted: 168 },
      { date: "Thu", actual: 182, predicted: 178 },
      { date: "Fri", actual: 195, predicted: 198 },
      { date: "Sat", actual: 208, predicted: 205 },
      { date: "Sun", actual: 168, predicted: 172 },
    ],
    e: [
      { date: "Mon", actual: 215, predicted: 218 },
      { date: "Tue", actual: 228, predicted: 232 },
      { date: "Wed", actual: 248, predicted: 245 },
      { date: "Thu", actual: 265, predicted: 268 },
      { date: "Fri", actual: 282, predicted: 278 },
      { date: "Sat", actual: 298, predicted: 295 },
      { date: "Sun", actual: 255, predicted: 258 },
    ],
  },
};

// Generate data based on date range and selected date
const generateDataForDateRange = (baseData: any[], dateRange: string, selectedDate: Date) => {
  const multipliers = {
    '3d': { start: 0, count: 3, factor: 1.1 },
    '7d': { start: 0, count: 7, factor: 1.0 },
    '14d': { start: 0, count: 7, factor: 0.95 },
    '30d': { start: 0, count: 7, factor: 0.9 },
  };
  
  const config = multipliers[dateRange as keyof typeof multipliers] || multipliers['7d'];
  
  // Use the selected date to create a variation factor (different data for different dates)
  const dateVariation = (selectedDate.getDate() + selectedDate.getMonth()) * 0.02;
  const dateFactor = 1 + (dateVariation % 0.2 - 0.1); // Varies between 0.9 and 1.1
  
  return baseData.slice(config.start, config.start + config.count).map(item => ({
    ...item,
    actual: Math.round(item.actual * config.factor * dateFactor),
    predicted: Math.round(item.predicted * config.factor * dateFactor),
  }));
};

interface ActualVsPredictedChartProps {
  site: string;
  variety: string;
  dateRange: string;
  selectedDate: Date;
  sector?: string;
  plantType?: string;
}

export const ActualVsPredictedChart = ({ site, variety, dateRange, selectedDate, sector, plantType }: ActualVsPredictedChartProps) => {
  const baseData = chartData[site as keyof typeof chartData]?.[variety as keyof typeof chartData.adm] || chartData.adm.a;
  const data = generateDataForDateRange(baseData, dateRange, selectedDate);
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
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const actual = payload[0].value as number;
                  const predicted = payload[1].value as number;
                  const deviation = ((actual - predicted) / predicted * 100).toFixed(1);
                  return (
                    <div className="bg-card border border-border p-4 rounded-lg shadow-lg">
                      <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
                      <p className="text-sm text-primary">
                        Actual Harvest: {actual} kg
                      </p>
                      <p className="text-sm text-secondary">
                        Predicted Harvest: {predicted} kg
                      </p>
                      <p className={`text-sm font-medium mt-1 ${parseFloat(deviation) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        Deviation: {deviation}%
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
