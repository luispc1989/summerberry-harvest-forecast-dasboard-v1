import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const TopInfluencingFactors = () => {
  const factors = [
    { name: "Temperature", importance: 78, trend: "positive", color: "primary" },
    { name: "Flower Abortion Rate", importance: 72, trend: "negative", color: "accent" },
    { name: "Irrigation Volume", importance: 55, trend: "positive", color: "secondary" },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Top 3 Variables Influencing Yield</CardTitle>
        <CardDescription>Based on feature importance analysis</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex items-center">
        <div className="space-y-4 w-full">
          {factors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-muted-foreground/30">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-foreground">{factor.name}</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  {factor.importance}% importance
                </span>
              </div>
              <Progress 
                value={factor.importance} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {factor.trend === "positive" ? "Positively" : "Negatively"} correlated with yield
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
