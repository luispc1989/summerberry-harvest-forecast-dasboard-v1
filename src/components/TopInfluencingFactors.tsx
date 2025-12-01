import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const TopInfluencingFactors = () => {
  const factors = [
    {
      name: "Temperature",
      importance: 78,
      correlation: "positive" as const,
    },
    {
      name: "Flower Abortion Rate",
      importance: 72,
      correlation: "negative" as const,
    },
    {
      name: "Irrigation Volume",
      importance: 55,
      correlation: "positive" as const,
    },
    {
      name: "Humidity",
      importance: 48,
      correlation: "positive" as const,
    },
    {
      name: "Solar Radiation",
      importance: 42,
      correlation: "positive" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Influencing Yield</CardTitle>
        <CardDescription>Based on feature importance analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 py-6">
        {factors.map((factor, index) => (
          <div key={index} className="space-y-2.5">
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
