import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { InfluencingFactor } from "@/types/api";

interface TopInfluencingFactorsProps {
  // API data - when provided, uses this instead of mock data
  apiFactors?: InfluencingFactor[];
}

// Default mock factors when no API data is available
const defaultFactors: InfluencingFactor[] = [
  { name: "Temperature", importance: 78, correlation: "positive" },
  { name: "Flower Abortion Rate", importance: 72, correlation: "negative" },
  { name: "Irrigation Volume", importance: 55, correlation: "positive" },
  { name: "Humidity", importance: 48, correlation: "positive" },
  { name: "Solar Radiation", importance: 42, correlation: "positive" },
];

export const TopInfluencingFactors = ({ apiFactors }: TopInfluencingFactorsProps) => {
  const factors = apiFactors || defaultFactors;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Influencing Yield</CardTitle>
        <CardDescription>Based on feature importance analysis</CardDescription>
      </CardHeader>
      <CardContent className="h-[480px] space-y-5 py-4">
        {factors.map((factor, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="text-2xl font-bold text-muted-foreground/30 flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-foreground truncate">{factor.name}</span>
              </div>
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap flex-shrink-0">
                {factor.importance}% importance
              </span>
            </div>
            <Progress 
              value={factor.importance} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground pl-10">
              {factor.correlation === "positive" ? "Positively" : "Negatively"} correlated with yield
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
