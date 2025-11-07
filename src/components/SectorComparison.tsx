import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface SectorComparisonProps {
  site: string;
  variety: string;
  dateRange: string;
  selectedDate: Date;
  plantType: string;
  plantationDate: Date | undefined;
}

const admSectors = [
  'A1', 'B2', 'A2', 'B1', 'C1', 'B3', 'B4', 'D3', 'D2', 'A3', 'C2', 'E3',
  'F1', 'E1', 'E2', 'F2', 'C3', 'F3', 'D1', 'I1', 'H3', 'I2', 'H2', 'H1',
  'M2', 'M1', 'G1', 'L3', 'K1', 'L2', 'G2', 'G3', 'L1', 'K2', 'K3', 'J1',
  'O1', 'J2', 'O2', 'O4', 'N1', 'N3', 'N2', 'O3', 'P1', 'P2', 'Q2', 'Q1'
];

const almSectors = [
  '1.1', '1.2', '1.3', '1.4', '1.5',
  '2.1', '2.2', '2.3',
  '3.1', '3.2', '4',
  '5.1', '5.2', '5.3.1', '5.3.2',
  '6.1', '6.2', '6.3',
  '7.1', '7.2', '7.3',
  '8.1', '8.2', '8.3',
  '9.1', '9.2', '9.3', '9.4',
  '12.1', '12.2', '12.3',
  '13.1', '13.2', '13.3',
  '14.1', '14.2', '14.3', '14.4.1', '14.4.2',
  '15.1', '15.2', '15.3.1', '15.3.2', '15.4.1', '15.4.2', '15.5.1', '15.5.2',
  '16.1', '16.2',
  '17.1', '17.2', '17.3',
  '18.1', '18.2', '18.3',
  '19.1', '19.2', '19.3',
  '20.1', '20.2', '20.3',
  '21.1', '21.2', '21.3',
  '22.1', '22.2', '22.3',
  '23.1', '23.2', '23.3',
  '24.1', '24.2', '24.3', '24.4', '24.5', '24.6',
  '26.1', '26.2', '26.3',
  '27.1', '27.2', '27.3',
  '29.1', '29.2', '29.3', '29.4',
  '30',
  '31.1', '31.2', '31.3'
];

const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

export const SectorComparison = ({ site, variety, dateRange, selectedDate, plantType, plantationDate }: SectorComparisonProps) => {
  const [selectedSectors, setSelectedSectors] = useState<string[]>(['A1', 'B2']);
  const sectorOptions = site === 'adm' ? admSectors : almSectors;
  
  const addSector = () => {
    if (selectedSectors.length < 4) {
      const availableSector = sectorOptions.find(s => !selectedSectors.includes(s));
      if (availableSector) {
        setSelectedSectors([...selectedSectors, availableSector]);
      }
    }
  };
  
  const removeSector = (sector: string) => {
    if (selectedSectors.length > 2) {
      setSelectedSectors(selectedSectors.filter(s => s !== sector));
    }
  };
  
  const updateSector = (oldSector: string, newSector: string) => {
    setSelectedSectors(selectedSectors.map(s => s === oldSector ? newSector : s));
  };
  
  // Generate comparison data based on filters
  const generateData = () => {
    const daysMap: { [key: string]: number } = {
      'Last 2 days': 2, 'Last 3 days': 3, 'Last 4 days': 4, 'Last 5 days': 5, 'Last 6 days': 6, 'Last 7 days': 7
    };
    const days = daysMap[dateRange] || 7;
    
    // Generate day labels dynamically based on the selected date
    const generateDayLabels = (numDays: number, endDate: Date) => {
      const labels = [];
      for (let i = numDays - 1; i >= 0; i--) {
        const date = new Date(endDate);
        date.setDate(date.getDate() - i);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayNum = date.getDate();
        labels.push(`${dayName} ${dayNum}`);
      }
      return labels;
    };
    
    const dayLabels = generateDayLabels(days, selectedDate);
    
    const baseActual = 220;
    
    const varietyMultipliers: { [key: string]: number } = {
      'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
    };
    const varietyMultiplier = varietyMultipliers[variety] || 1.0;
    
    const siteMultiplier = site === 'alm' ? 1.15 : 1.0;
    
    // Plant type multiplier
    const plantTypeMultipliers: { [key: string]: number } = {
      'gc': 0.95, 'gt': 1.05, 'lc': 1.1, 'rb': 1.0, 'sc': 0.92
    };
    const plantTypeMultiplier = plantTypeMultipliers[plantType] || 1.0;
    
    // Date variation
    const dateVariation = 1 + ((selectedDate.getDate() % 10) - 5) / 100;
    
    // Plantation date variation
    let plantationFactor = 1;
    if (plantationDate) {
      const daysDiff = Math.floor((selectedDate.getTime() - plantationDate.getTime()) / (1000 * 60 * 60 * 24));
      plantationFactor = 1 + (Math.min(daysDiff, 180) / 1800);
    }
    
    return Array.from({ length: days }, (_, idx) => {
      const dataPoint: any = { day: dayLabels[idx] };
      
      selectedSectors.forEach((sector, sectorIdx) => {
        const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const sectorVariation = 1 + ((sectorHash % 30) - 15) / 100;
        const dayVariation = 0.85 + (Math.sin(idx * 0.7 + sectorIdx * 1.3) * 0.15);
        
        const value = baseActual * varietyMultiplier * siteMultiplier * plantTypeMultiplier * 
                     sectorVariation * dayVariation * dateVariation * plantationFactor;
        dataPoint[sector] = Math.round(value);
      });
      
      return dataPoint;
    });
  };
  
  // Generate statistics for each sector
  const generateStats = () => {
    const daysMap: { [key: string]: number } = {
      'Last 2 days': 2, 'Last 3 days': 3, 'Last 4 days': 4, 'Last 5 days': 5, 'Last 6 days': 6, 'Last 7 days': 7
    };
    const days = daysMap[dateRange] || 7;
    
    return selectedSectors.map(sector => {
      const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const sectorVariation = 1 + ((sectorHash % 30) - 15) / 100;
      
      const varietyMultipliers: { [key: string]: number } = {
        'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
      };
      
      // Plant type multiplier
      const plantTypeMultipliers: { [key: string]: number } = {
        'gc': 0.95, 'gt': 1.05, 'lc': 1.1, 'rb': 1.0, 'sc': 0.92
      };
      const plantTypeMultiplier = plantTypeMultipliers[plantType] || 1.0;
      
      // Date variation
      const dateVariation = 1 + ((selectedDate.getDate() % 10) - 5) / 100;
      
      // Plantation date variation
      let plantationFactor = 1;
      if (plantationDate) {
        const daysDiff = Math.floor((selectedDate.getTime() - plantationDate.getTime()) / (1000 * 60 * 60 * 24));
        plantationFactor = 1 + (Math.min(daysDiff, 180) / 1800);
      }
      
      const multiplier = (site === 'alm' ? 1.15 : 1.0) * (varietyMultipliers[variety] || 1.0) * 
                        sectorVariation * plantTypeMultiplier * dateVariation * plantationFactor;
      
      // Add unique variation for predicted values to create different deviations
      const predictedVariation = 0.92 + ((sectorHash % 17) / 100);
      
      const actual = Math.round(220 * multiplier * days);
      const predicted = Math.round(215 * multiplier * days * predictedVariation);
      
      return { sector, actual, predicted };
    });
  };
  
  const data = generateData();
  const comparisonData = generateStats();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sector Comparison</CardTitle>
          <CardDescription>Compare harvest data across multiple sectors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Selected Sectors ({selectedSectors.length}/4)</Label>
            {selectedSectors.length < 4 && (
              <Button onClick={addSector} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Sector
              </Button>
            )}
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            {selectedSectors.map((sector, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: colors[idx] }}
                />
                <Select value={sector} onValueChange={(val) => updateSector(sector, val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {sectorOptions.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedSectors.length > 2 && (
                  <Button 
                    onClick={() => removeSector(sector)} 
                    size="icon" 
                    variant="ghost"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                label={{ value: 'Harvest (kg)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              {selectedSectors.map((sector, idx) => (
                <Line
                  key={sector}
                  type="monotone"
                  dataKey={sector}
                  stroke={colors[idx]}
                  strokeWidth={2}
                  dot={{ fill: colors[idx], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
    
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {comparisonData.map((sector) => {
        const deviation = ((sector.actual - sector.predicted) / sector.predicted * 100).toFixed(1);
        const isPositive = parseFloat(deviation) >= 0;
        
        return (
          <Card key={sector.sector}>
            <CardHeader>
              <CardTitle className="text-base">Sector {sector.sector}</CardTitle>
              <CardDescription>{dateRange} Statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10">
                <div>
                  <p className="text-xs text-muted-foreground">Actual</p>
                  <p className="text-lg font-bold text-primary">{sector.actual} kg</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/10">
                <div>
                  <p className="text-xs text-muted-foreground">Predicted</p>
                  <p className="text-lg font-bold text-secondary">{sector.predicted} kg</p>
                </div>
              </div>
              
              <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${isPositive ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                {isPositive ? (
                  <TrendingUp className={`h-4 w-4 text-green-500`} />
                ) : (
                  <TrendingDown className={`h-4 w-4 text-red-500`} />
                )}
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Deviation</p>
                  <p className={`text-lg font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(deviation) > 0 ? '+' : ''}{deviation}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  </div>
  );
};
