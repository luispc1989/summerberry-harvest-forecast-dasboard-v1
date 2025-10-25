import { TrendingUp, CalendarDays, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const ForecastCards = () => {
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
