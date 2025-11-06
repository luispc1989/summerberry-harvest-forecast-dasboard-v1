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
}

const admSectors = [
  'A1', 'B2', 'A2', 'B1', 'C1', 'B3', 'B4', 'D3', 'D2', 'A3', 'C2', 'E3',
  'F1', 'E1', 'E2', 'F2', 'C3', 'F3', 'D1', 'I1', 'H3', 'I2', 'H2', 'H1',
  'M2', 'M1', 'G1', 'L3', 'K1', 'L2', 'G2', 'G3', 'L1', 'K2', 'K3', 'J1',
  'O1', 'J2', 'O2', 'O4', 'N1', 'N3', 'N2', 'O3', 'P1', 'P2', 'Q2', 'Q1'
];

const almSectors = [
  '1_1', '1_2', '1_3', '1_4', '1_5',
  '2_1', '2_2', '2_3',
  '3_1', '3_2', '4',
  '5_1', '5_2', '5_3_1', '5_3_2',
  '6_1', '6_2', '6_3',
  '7_1', '7_2', '7_3',
  '8_1', '8_2', '8_3',
  '9_1', '9_2', '9_3', '9_4',
  '12_1', '12_2', '12_3',
  '13_1', '13_2', '13_3',
  '14_1', '14_2', '14_3', '14_4_1', '14_4_2',
  '15_1', '15_2', '15_3_1', '15_3_2', '15_4_1', '15_4_2', '15_5_1', '15_5_2',
  '16_1', '16_2',
  '17_1', '17_2', '17_3',
  '18_1', '18_2', '18_3',
  '19_1', '19_2', '19_3',
  '20_1', '20_2', '20_3',
  '21_1', '21_2', '21_3',
  '22_1', '22_2', '22_3',
  '23_1', '23_2', '23_3',
  '24_1', '24_2', '24_3', '24_4', '24_5', '24_6',
  '26_1', '26_2', '26_3',
  '27_1', '27_2', '27_3',
  '29_1', '29_2', '29_3', '29_4',
  '30',
  '31_1', '31_2', '31_3'
];

const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#10b981'];

export const SectorComparison = ({ site, variety, dateRange, selectedDate }: SectorComparisonProps) => {
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
      '2d': 2, '3d': 3, '4d': 4, '5d': 5, '6d': 6, '7d': 7
    };
    const days = daysMap[dateRange] || 7;
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    const baseActual = 220;
    const basePredicted = 215;
    
    const varietyMultipliers: { [key: string]: number } = {
      'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
    };
    const varietyMultiplier = varietyMultipliers[variety] || 1.0;
    
    const siteMultiplier = site === 'alm' ? 1.15 : 1.0;
    
    return Array.from({ length: days }, (_, idx) => {
      const dataPoint: any = { day: dayNames[idx % 7] };
      
      selectedSectors.forEach((sector, sectorIdx) => {
        const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
        const dayVariation = 0.9 + (Math.sin(idx * 0.5 + sectorIdx) * 0.1);
        
        const value = baseActual * varietyMultiplier * siteMultiplier * sectorVariation * dayVariation;
        dataPoint[sector] = Math.round(value);
      });
      
      return dataPoint;
    });
  };
  
  // Generate statistics for each sector
  const generateStats = () => {
    const daysMap: { [key: string]: number } = {
      '2d': 2, '3d': 3, '4d': 4, '5d': 5, '6d': 6, '7d': 7
    };
    const days = daysMap[dateRange] || 7;
    
    return selectedSectors.map(sector => {
      const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const sectorVariation = 1 + ((sectorHash % 20) - 10) / 100;
      
      const varietyMultipliers: { [key: string]: number } = {
        'a': 1.0, 'b': 1.08, 'c': 0.95, 'd': 1.12, 'e': 0.88
      };
      const multiplier = (site === 'alm' ? 1.15 : 1.0) * (varietyMultipliers[variety] || 1.0) * sectorVariation;
      
      const actual = Math.round(220 * multiplier * days);
      const predicted = Math.round(215 * multiplier * days * 0.98);
      
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
              <CardDescription>7-Day Statistics</CardDescription>
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
