import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ActualVsPredictedChartProps {
  site: string;
  variety: string;
  selectedDate: Date;
  sector?: string;
  plantType?: string;
}

export const ActualVsPredictedChart = ({ site, variety, selectedDate, sector, plantType }: ActualVsPredictedChartProps) => {
  // Generate data based on filters
  const generateChartData = () => {
    const days = 7;
    const data = [];
    
    const basePredicted = 215;
    
    // Apply multipliers based on filters
    let predictedMultiplier = 1;
    
    if (site === 'alm') {
      predictedMultiplier *= 1.12;
    }
    
    const varietyMultipliers: { [key: string]: number } = {
      'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
    };
    predictedMultiplier *= (varietyMultipliers[variety] || 1.0) * 0.98;
    
    const plantTypeMultipliers: { [key: string]: number } = {
      'gc': 0.95, 'gt': 1.05, 'lc': 1.1, 'rb': 1.0, 'sc': 0.92
    };
    predictedMultiplier *= (plantTypeMultipliers[plantType || 'gc'] || 1.0);
    
    // Sector variation
    const sectorHash = (sector || 'A1').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
    predictedMultiplier *= sectorVariation;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      
      const dayVariation = 0.9 + Math.random() * 0.2;
      const predicted = Math.round(basePredicted * predictedMultiplier * dayVariation);
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        predicted,
      });
    }
    
    return data;
  };
  
  const data = generateChartData();
  
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