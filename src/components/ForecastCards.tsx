import { TrendingUp, CalendarDays, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ForecastCards = () => {
  // Calculate 7-day average for standard deviation
  const calculate7DayAvg = () => {
    const values = [248, 242, 255, 238, 252, 245, 250];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    return { avg, stdDev: (stdDev / avg * 100).toFixed(1) };
  };
  
  const { avg, stdDev } = calculate7DayAvg();
  
  const forecasts = [
    {
      title: "Today's Forecast",
      value: "248 kg",
      change: "+12%",
      trend: "up",
      icon: Target,
      color: "primary",
    },
    {
      title: "Tomorrow",
      value: "265 kg",
      change: "+6.8%",
      trend: "up",
      icon: CalendarDays,
      color: "secondary",
    },
    {
      title: "Day 3",
      value: "221 kg",
      change: "-16.6%",
      trend: "down",
      icon: TrendingUp,
      color: "accent",
      stdDev: stdDev,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {forecasts.map((forecast, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {forecast.title}
            </CardTitle>
            <forecast.icon className={`h-4 w-4 text-${forecast.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{forecast.value}</div>
            <p className={`text-xs ${forecast.trend === 'up' ? 'text-primary' : 'text-accent'} mt-1`}>
              {forecast.change} from previous period
            </p>
            {'stdDev' in forecast && (
              <p className="text-xs text-muted-foreground mt-2">
                Std Dev (7d avg): ±{forecast.stdDev}%
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
