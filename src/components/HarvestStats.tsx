import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface HarvestStatsProps {
  site: string;
  variety: string;
  selectedDate: Date;
  sector: string;
  plantType: string;
}

export const HarvestStats = ({ site, variety, selectedDate, sector, plantType }: HarvestStatsProps) => {
  // Generate 7 predicted values for the next 7 days
  const calculatePredictions = () => {
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
      'rb': 1.0, 'gt': 1.05, 'lc': 1.1, 'gc': 0.95, 'sc': 0.92
    };
    predictedMultiplier *= (plantTypeMultipliers[plantType] || 1.0);
    
    // Sector variation
    const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
    predictedMultiplier *= sectorVariation * 0.98;
    
    // Generate 7 daily predictions
    const predictions = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      
      // Add daily variation
      const dateVariation = 1 + ((date.getDate() % 10) - 5) / 100;
      const dayVariation = 0.9 + Math.random() * 0.2;
      
      const predicted = Math.round(basePredicted * predictedMultiplier * dateVariation * dayVariation);
      
      predictions.push({
        day: `Day ${i + 1}`,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: predicted
      });
    }
    
    // Calculate statistics
    const values = predictions.map(p => p.value);
    const total = values.reduce((a, b) => a + b, 0);
    const average = total / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    return {
      predictions,
      total: Math.round(total),
      average: Math.round(average),
      stdDev: stdDev.toFixed(1)
    };
  };
  
  const stats = calculatePredictions();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day Harvest Statistics</CardTitle>
        <CardDescription>Predicted harvest for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          {stats.predictions.map((pred, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center px-4 py-2.5 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{pred.day}</span>
                <span className="text-xs text-muted-foreground">{pred.date}</span>
              </div>
              <span className="text-base font-semibold text-foreground">{pred.value} kg</span>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total (7 days)</p>
            <p className="text-2xl font-bold text-primary">{stats.total} kg</p>
          </div>
          
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Average</p>
            <p className="text-2xl font-bold text-foreground">{stats.average} kg</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
