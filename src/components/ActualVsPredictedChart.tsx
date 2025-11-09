import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ActualVsPredictedChartProps {
  site: string;
  variety: string;
  dateRange: string;
  selectedDate: Date;
  sector?: string;
  plantType?: string;
}

export const ActualVsPredictedChart = ({ site, variety, dateRange, selectedDate, sector, plantType }: ActualVsPredictedChartProps) => {
  // Generate data based on filters
  const generateChartData = () => {
    const daysMap: { [key: string]: number } = {
      'Last 2 days': 2, 'Last 3 days': 3, 'Last 4 days': 4, 'Last 5 days': 5, 'Last 6 days': 6, 'Last 7 days': 7
    };
    const days = daysMap[dateRange] || 7;
    const data = [];
    
    const baseActual = 220;
    const basePredicted = 215;
    
    // Apply multipliers based on filters
    let actualMultiplier = 1;
    let predictedMultiplier = 1;
    
    if (site === 'alm') {
      actualMultiplier *= 1.15;
      predictedMultiplier *= 1.12;
    }
    
    const varietyMultipliers: { [key: string]: number } = {
      'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
    };
    actualMultiplier *= (varietyMultipliers[variety] || 1.0);
    predictedMultiplier *= (varietyMultipliers[variety] || 1.0) * 0.98;
    
    const plantTypeMultipliers: { [key: string]: number } = {
      'gc': 0.95, 'gt': 1.05, 'lc': 1.1, 'rb': 1.0, 'sc': 0.92
    };
    actualMultiplier *= (plantTypeMultipliers[plantType || 'gc'] || 1.0);
    predictedMultiplier *= (plantTypeMultipliers[plantType || 'gc'] || 1.0);
    
    // Sector variation
    const sectorHash = (sector || 'A1').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
    actualMultiplier *= sectorVariation;
    predictedMultiplier *= sectorVariation;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() - (days - 1 - i));
      
      const dayVariation = 0.9 + Math.random() * 0.2;
      const actual = Math.round(baseActual * actualMultiplier * dayVariation);
      const predicted = Math.round(basePredicted * predictedMultiplier * dayVariation);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        actual,
        predicted,
      });
    }
    
    return data;
  };
  
  const data = generateChartData();
  
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
                  const isPositive = parseFloat(deviation) >= 0;
                  
                  return (
                    <div className="bg-card border border-border p-4 rounded-lg shadow-lg">
                      <p className="text-sm font-medium mb-2">{payload[0].payload.date}</p>
                      <p className="text-sm text-primary">
                        Actual Harvest: {actual} kg
                      </p>
                      <p className="text-sm text-secondary">
                        Predicted Harvest: {predicted} kg
                      </p>
                      <p className={`text-sm font-medium mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        Deviation: {parseFloat(deviation) > 0 ? '+' : ''}{deviation}%
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