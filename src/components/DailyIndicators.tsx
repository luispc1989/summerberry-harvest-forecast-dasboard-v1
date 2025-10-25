import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, CloudRain, Sprout } from "lucide-react";

export const DailyIndicators = () => {
  const indicators = [
    {
      title: "Temperature",
      value: "22°C",
      subtitle: "Avg today",
      icon: Thermometer,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Humidity",
      value: "68%",
      subtitle: "Current",
      icon: Droplets,
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      title: "Rainfall",
      value: "3.2 mm",
      subtitle: "Last 24h",
      icon: CloudRain,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Irrigation",
      value: "45 L/ha",
      subtitle: "Applied",
      icon: Sprout,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {indicators.map((indicator, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {indicator.title}
            </CardTitle>
            <div className={`${indicator.bgColor} p-2 rounded-lg`}>
              <indicator.icon className={`h-4 w-4 ${indicator.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${indicator.color}`}>
              {indicator.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {indicator.subtitle}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
