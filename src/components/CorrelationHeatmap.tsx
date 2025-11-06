import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CorrelationHeatmapProps {
  site: string;
  variety: string;
  sector: string;
  plantType: string;
}

const baseCorrelationData = [
  { 
    variable: "Temperature (°C)", 
    yield: 0.78, 
    quality: 0.65, 
    humidity: -0.42, 
    rainfall: -0.15,
    irrigation: 0.52,
    flowerAbortion: -0.68,
    fruitSize: 0.71,
    firmness: 0.58
  },
  { 
    variable: "Humidity (%)", 
    yield: -0.42, 
    quality: -0.58, 
    humidity: 1.0, 
    rainfall: 0.61,
    irrigation: -0.28,
    flowerAbortion: 0.45,
    fruitSize: -0.39,
    firmness: -0.51
  },
  { 
    variable: "Rainfall (mm)", 
    yield: -0.15, 
    quality: -0.22, 
    humidity: 0.61, 
    rainfall: 1.0,
    irrigation: -0.35,
    flowerAbortion: 0.31,
    fruitSize: -0.18,
    firmness: -0.25
  },
  { 
    variable: "Irrigation (L/ha)", 
    yield: 0.55, 
    quality: 0.48, 
    humidity: -0.28, 
    rainfall: -0.35,
    irrigation: 1.0,
    flowerAbortion: -0.41,
    fruitSize: 0.49,
    firmness: 0.44
  },
  { 
    variable: "Flower Abortion (%)", 
    yield: -0.72, 
    quality: -0.81, 
    humidity: 0.45, 
    rainfall: 0.31,
    irrigation: -0.41,
    flowerAbortion: 1.0,
    fruitSize: -0.76,
    firmness: -0.69
  },
  { 
    variable: "Solar Radiation (W/m²)", 
    yield: 0.64, 
    quality: 0.59, 
    humidity: -0.38, 
    rainfall: -0.22,
    irrigation: 0.41,
    flowerAbortion: -0.55,
    fruitSize: 0.62,
    firmness: 0.53
  },
  { 
    variable: "Wind Speed (m/s)", 
    yield: -0.31, 
    quality: -0.28, 
    humidity: 0.19, 
    rainfall: 0.15,
    irrigation: -0.18,
    flowerAbortion: 0.24,
    fruitSize: -0.29,
    firmness: -0.33
  },
  { 
    variable: "Soil Moisture (%)", 
    yield: 0.48, 
    quality: 0.42, 
    humidity: -0.21, 
    rainfall: 0.38,
    irrigation: 0.67,
    flowerAbortion: -0.36,
    fruitSize: 0.45,
    firmness: 0.39
  },
];

const getColor = (value: number) => {
  if (value >= 0.7) return "bg-primary/90 text-white";
  if (value >= 0.4) return "bg-primary/60 text-white";
  if (value >= 0.1) return "bg-primary/30";
  if (value >= -0.1) return "bg-muted";
  if (value >= -0.4) return "bg-accent/30";
  if (value >= -0.7) return "bg-accent/60 text-white";
  return "bg-accent/90 text-white";
};

export const CorrelationHeatmap = ({ site, variety, sector, plantType }: CorrelationHeatmapProps) => {
  // Apply variations based on filters
  const getVariation = () => {
    let variation = 0;
    
    if (site === 'alm') variation += 0.05;
    
    const varietyVar: { [key: string]: number } = {
      'a': 0, 'b': 0.03, 'c': -0.02, 'd': 0.04, 'e': -0.03
    };
    variation += (varietyVar[variety] || 0);
    
    const plantTypeVar: { [key: string]: number } = {
      'gc': -0.02, 'gt': 0.02, 'lc': 0.03, 'rb': 0, 'sc': -0.01
    };
    variation += (plantTypeVar[plantType] || 0);
    
    const sectorHash = sector.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    variation += ((sectorHash % 10) - 5) / 100;
    
    return variation;
  };
  
  const variation = getVariation();
  
  const correlationData = baseCorrelationData.map(row => ({
    ...row,
    yield: Math.max(-1, Math.min(1, row.yield + variation)),
    quality: Math.max(-1, Math.min(1, row.quality + variation)),
    humidity: Math.max(-1, Math.min(1, row.humidity + variation)),
    rainfall: Math.max(-1, Math.min(1, row.rainfall + variation)),
    irrigation: Math.max(-1, Math.min(1, row.irrigation + variation)),
    flowerAbortion: Math.max(-1, Math.min(1, row.flowerAbortion + variation)),
    fruitSize: Math.max(-1, Math.min(1, row.fruitSize + variation)),
    firmness: Math.max(-1, Math.min(1, row.firmness + variation)),
  }));
  const variables = [
    "Yield", 
    "Quality", 
    "Humidity", 
    "Rainfall", 
    "Irrigation", 
    "Flower Abortion",
    "Fruit Size",
    "Firmness"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variable Correlations</CardTitle>
        <CardDescription>Heatmap showing relationships between key variables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground sticky left-0 bg-card z-10"></th>
                {variables.map((variable) => (
                  <th key={variable} className="p-2 text-center text-xs font-medium text-muted-foreground min-w-[80px]">
                    {variable}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationData.map((row) => (
                <tr key={row.variable} className="border-t border-border">
                  <td className="p-2 text-xs font-medium text-foreground sticky left-0 bg-card z-10">{row.variable}</td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.yield)}`}
                      title={`Correlation: ${row.yield.toFixed(2)}`}
                    >
                      {row.yield.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.quality)}`}
                      title={`Correlation: ${row.quality.toFixed(2)}`}
                    >
                      {row.quality.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.humidity)}`}
                      title={`Correlation: ${row.humidity.toFixed(2)}`}
                    >
                      {row.humidity.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.rainfall)}`}
                      title={`Correlation: ${row.rainfall.toFixed(2)}`}
                    >
                      {row.rainfall.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.irrigation)}`}
                      title={`Correlation: ${row.irrigation.toFixed(2)}`}
                    >
                      {row.irrigation.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.flowerAbortion)}`}
                      title={`Correlation: ${row.flowerAbortion.toFixed(2)}`}
                    >
                      {row.flowerAbortion.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.fruitSize)}`}
                      title={`Correlation: ${row.fruitSize.toFixed(2)}`}
                    >
                      {row.fruitSize.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-1.5">
                    <div
                      className={`h-12 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.firmness)}`}
                      title={`Correlation: ${row.firmness.toFixed(2)}`}
                    >
                      {row.firmness.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Strong Negative (-1.0)</span>
            <span>Neutral (0)</span>
            <span>Strong Positive (+1.0)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
