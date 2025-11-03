import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplets, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface WeeklyAveragesProps {
  site: string;
  variety: string;
  dateRange: string;
  selectedDate: Date;
}

// Base data for weekly averages by site and variety
const baseAverages = {
  adm: {
    a: { temperature: 22.5, humidity: 65, radiation: 18.2 },
    b: { temperature: 21.8, humidity: 68, radiation: 17.5 },
    c: { temperature: 23.2, humidity: 62, radiation: 19.1 },
    d: { temperature: 20.9, humidity: 70, radiation: 16.8 },
    e: { temperature: 24.1, humidity: 60, radiation: 20.3 },
  },
  alm: {
    a: { temperature: 23.8, humidity: 58, radiation: 21.5 },
    b: { temperature: 22.9, humidity: 61, radiation: 20.2 },
    c: { temperature: 24.5, humidity: 55, radiation: 22.8 },
    d: { temperature: 21.7, humidity: 64, radiation: 19.4 },
    e: { temperature: 25.3, humidity: 52, radiation: 23.9 },
  },
};

// Calculate adjusted values based on date range and selected date
const calculateAverages = (
  site: string,
  variety: string,
  dateRange: string,
  selectedDate: Date
) => {
  const base = baseAverages[site as keyof typeof baseAverages]?.[variety as keyof typeof baseAverages.adm] || baseAverages.adm.a;
  
  // Date range multipliers
  const rangeMultipliers = {
    '3d': 1.05,
    '7d': 1.0,
    '14d': 0.97,
    '30d': 0.93,
  };
  
  const rangeFactor = rangeMultipliers[dateRange as keyof typeof rangeMultipliers] || 1.0;
  
  // Date variation (different values for different dates)
  const dateVariation = (selectedDate.getDate() + selectedDate.getMonth()) * 0.015;
  const dateFactor = 1 + (dateVariation % 0.15 - 0.075); // Varies between 0.925 and 1.075
  
  return {
    temperature: (base.temperature * rangeFactor * dateFactor).toFixed(1),
    humidity: Math.round(base.humidity * rangeFactor * dateFactor),
    radiation: (base.radiation * rangeFactor * dateFactor).toFixed(1),
  };
};

export const WeeklyAverages = ({ site, variety, dateRange, selectedDate }: WeeklyAveragesProps) => {
  const [realData, setRealData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch real weather data from Odemira, Portugal
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setIsLoading(true);
        // Coordinates for Odemira, Portugal
        const lat = 37.5986;
        const lon = -8.6387;
        
        // Fetch past 7 days data for weekly averages
        const endDate = new Date(selectedDate);
        const startDate = new Date(selectedDate);
        startDate.setDate(startDate.getDate() - 7);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relative_humidity_2m,shortwave_radiation&start_date=${startDateStr}&end_date=${endDateStr}&timezone=Europe/Lisbon`
        );
        
        if (!response.ok) throw new Error('Failed to fetch weather data');
        
        const data = await response.json();
        
        // Calculate weekly averages
        const temps = data.hourly.temperature_2m.filter((t: number) => t !== null);
        const humidity = data.hourly.relative_humidity_2m.filter((h: number) => h !== null);
        const radiation = data.hourly.shortwave_radiation.filter((r: number) => r !== null);
        
        const avgTemp = temps.reduce((a: number, b: number) => a + b, 0) / temps.length;
        const avgHumidity = humidity.reduce((a: number, b: number) => a + b, 0) / humidity.length;
        const avgRadiation = radiation.reduce((a: number, b: number) => a + b, 0) / radiation.length;
        
        setRealData({
          temperature: avgTemp.toFixed(1),
          humidity: Math.round(avgHumidity),
          radiation: (avgRadiation * 0.0036).toFixed(1), // Convert W/m² to MJ/m²
        });
      } catch (error) {
        console.error('Error fetching weather data:', error);
        toast({
          title: "Could not fetch real-time data",
          description: "Showing simulated data instead",
          variant: "destructive",
        });
        // Fallback to calculated averages
        const fallback = calculateAverages(site, variety, dateRange, selectedDate);
        setRealData(fallback);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [site, variety, dateRange, selectedDate, toast]);

  const averages = realData || calculateAverages(site, variety, dateRange, selectedDate);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Weekly Environmental Conditions</CardTitle>
        <CardDescription>Real data from Odemira, Portugal</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] flex flex-col justify-center gap-6">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        {!isLoading && (
          <>
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10">
            <Thermometer className="h-6 w-6 text-orange-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Temperature</p>
            <p className="text-2xl font-bold">{averages.temperature}°C</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <Droplets className="h-6 w-6 text-blue-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Humidity</p>
            <p className="text-2xl font-bold">{averages.humidity}%</p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">
            <Sun className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">Solar Radiation</p>
            <p className="text-2xl font-bold">{averages.radiation} MJ/m²</p>
          </div>
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
};
