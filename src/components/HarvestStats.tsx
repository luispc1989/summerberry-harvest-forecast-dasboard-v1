import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HarvestStatsProps {
  site: string;
  variety: string;
  selectedDate: Date;
  sector: string;
  plantType: string;
}

export const HarvestStats = ({ site, variety, selectedDate, sector, plantType }: HarvestStatsProps) => {
  // Calculate stats based on filters
  const calculateStats = () => {
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
      'rb': 1.0, 'gt': 1.05, 'lc': 1.1, 'gc': 0.95, 'sc': 0.92
    };
    actualMultiplier *= (plantTypeMultipliers[plantType] || 1.0);
    predictedMultiplier *= (plantTypeMultipliers[plantType] || 1.0);
    
    // Sector variation
    const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
    actualMultiplier *= sectorVariation;
    predictedMultiplier *= sectorVariation * 0.98;
    
    // Date variation based on selected date
    const dateVariation = 1 + ((selectedDate.getDate() % 10) - 5) / 100;
    actualMultiplier *= dateVariation;
    predictedMultiplier *= dateVariation * 0.99;
    
    const actual7d = Math.round(baseActual * actualMultiplier * 7);
    const predicted7d = Math.round(basePredicted * predictedMultiplier * 7);
    const avgActual = Math.round(actual7d / 7);
    const avgPredicted = Math.round(predicted7d / 7);
    const deviation = ((actual7d - predicted7d) / predicted7d * 100).toFixed(1);
    
    return {
      actual7d,
      predicted7d,
      avgActual,
      avgPredicted,
      deviation: parseFloat(deviation)
    };
  };
  
  const stats = calculateStats();
  const isPositive = stats.deviation >= 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Harvest Statistics</CardTitle>
        <CardDescription>Actual vs Predicted comparison</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px] flex flex-col justify-center gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 rounded-lg bg-primary/10">
            <div>
              <p className="text-sm text-muted-foreground">Total Actual (7d)</p>
              <p className="text-2xl font-bold text-primary">{stats.actual7d} kg</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-xl font-semibold">{stats.avgActual} kg</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/10">
            <div>
              <p className="text-sm text-muted-foreground">Total Predicted (7d)</p>
              <p className="text-2xl font-bold text-secondary">{stats.predicted7d} kg</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-xl font-semibold">{stats.avgPredicted} kg</p>
            </div>
          </div>
          
          <div className={`flex items-center justify-center gap-2 p-4 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
            {isPositive ? (
              <TrendingUp className={`h-5 w-5 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            ) : (
              <TrendingDown className={`h-5 w-5 ${isPositive ? 'text-green-500' : 'text-red-500'}`} />
            )}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Deviation</p>
              <p className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {stats.deviation > 0 ? '+' : ''}{stats.deviation}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
