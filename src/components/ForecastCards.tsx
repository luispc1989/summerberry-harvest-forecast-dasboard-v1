import { TrendingUp, CalendarDays, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ForecastCardsProps {
  site: string;
  variety: string;
  dateRange: string;
  selectedDate: Date;
  sector: string;
  plantType: string;
  plantationDate: Date | undefined;
}

export const ForecastCards = ({ site, variety, dateRange, selectedDate, sector, plantType, plantationDate }: ForecastCardsProps) => {
  // Calculate forecast based on all filters
  const calculateForecast = () => {
    const baseValue = 245;
    
    let multiplier = 1;
    
    // Site multiplier
    if (site === 'alm') multiplier *= 1.12;
    
    // Variety multiplier
    const varietyMultipliers: { [key: string]: number } = {
      'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
    };
    multiplier *= (varietyMultipliers[variety] || 1.0);
    
    // Date range multiplier
    const rangeMultipliers: { [key: string]: number } = {
      '2d': 1.15, '3d': 1.10, '4d': 1.05, '5d': 1.02, '6d': 1.01, '7d': 1.0
    };
    multiplier *= (rangeMultipliers[dateRange] || 1.0);
    
    // Plant type multiplier
    const plantTypeMultipliers: { [key: string]: number } = {
      'gc': 0.95, 'gt': 1.05, 'lc': 1.1, 'rb': 1.0, 'sc': 0.92
    };
    multiplier *= (plantTypeMultipliers[plantType] || 1.0);
    
    // Sector variation
    const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
    multiplier *= sectorVariation;
    
    // Date variation
    const dateVariation = 1 + ((selectedDate.getDate() % 10) - 5) / 100;
    multiplier *= dateVariation;
    
    // Plantation date variation
    if (plantationDate) {
      const daysDiff = Math.floor((selectedDate.getTime() - plantationDate.getTime()) / (1000 * 60 * 60 * 24));
      const plantationFactor = 1 + (Math.min(daysDiff, 180) / 1800);
      multiplier *= plantationFactor;
    }
    
    const todayValue = Math.round(baseValue * multiplier);
    const tomorrowValue = Math.round(baseValue * multiplier * 0.97);
    const day3Value = Math.round(baseValue * multiplier * 1.03);
    
    // Calculate standard deviation (average deviation over 7 days)
    const values = [todayValue, tomorrowValue, day3Value, todayValue * 0.98, tomorrowValue * 1.02, day3Value * 0.96, todayValue * 1.01];
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    const stdDev = (Math.sqrt(variance) / avg * 100).toFixed(1);
    
    return [
      {
        title: "Today's Forecast",
        value: `${todayValue} kg`,
        change: "+12%",
        trend: "up" as const,
        icon: Target,
        color: "primary",
      },
      {
        title: "Tomorrow",
        value: `${tomorrowValue} kg`,
        change: "+6.8%",
        trend: "up" as const,
        icon: CalendarDays,
        color: "secondary",
      },
      {
        title: "Day 3",
        value: `${day3Value} kg`,
        change: "-16.6%",
        trend: "down" as const,
        icon: TrendingUp,
        color: "accent",
        stdDev: stdDev,
      },
    ];
  };
  
  const forecasts = calculateForecast();

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
