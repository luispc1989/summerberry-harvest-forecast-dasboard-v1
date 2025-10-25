import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Day 1", yield: 180 },
  { day: "Day 2", yield: 186 },
  { day: "Day 3", yield: 198 },
  { day: "Day 4", yield: 220 },
  { day: "Day 5", yield: 239 },
  { day: "Day 6", yield: 248 },
  { day: "Day 7", yield: 265 },
  { day: "Day 8", yield: 221 },
  { day: "Day 9", yield: 238 },
  { day: "Day 10", yield: 255 },
];

export const YieldTrendChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>10-Day Yield Trend</CardTitle>
        <CardDescription>Historical yield evolution (kg)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '10px' }}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              style={{ fontSize: '10px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Area 
              type="monotone" 
              dataKey="yield" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              fill="url(#yieldGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
