import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const correlationData = [
  { variable: "Temperature", yield: 0.78, quality: 0.65, humidity: -0.42, rainfall: -0.15 },
  { variable: "Humidity", yield: -0.42, quality: -0.58, humidity: 1.0, rainfall: 0.61 },
  { variable: "Rainfall", yield: -0.15, quality: -0.22, humidity: 0.61, rainfall: 1.0 },
  { variable: "Irrigation", yield: 0.55, quality: 0.48, humidity: -0.28, rainfall: -0.35 },
  { variable: "Flower Abortion", yield: -0.72, quality: -0.81, humidity: 0.45, rainfall: 0.31 },
];

const getColor = (value: number) => {
  if (value >= 0.7) return "bg-primary/90";
  if (value >= 0.4) return "bg-primary/60";
  if (value >= 0.1) return "bg-primary/30";
  if (value >= -0.1) return "bg-muted";
  if (value >= -0.4) return "bg-accent/30";
  if (value >= -0.7) return "bg-accent/60";
  return "bg-accent/90";
};

export const CorrelationHeatmap = () => {
  const variables = ["Yield", "Quality", "Humidity", "Rainfall"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Variable Correlations</CardTitle>
        <CardDescription>Heatmap showing relationships between key variables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 text-left text-xs font-medium text-muted-foreground"></th>
                {variables.map((variable) => (
                  <th key={variable} className="p-2 text-center text-xs font-medium text-muted-foreground">
                    {variable}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationData.map((row) => (
                <tr key={row.variable}>
                  <td className="p-2 text-xs font-medium text-foreground">{row.variable}</td>
                  <td className="p-2">
                    <div
                      className={`h-10 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.yield)}`}
                      title={`${row.yield.toFixed(2)}`}
                    >
                      {row.yield.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-2">
                    <div
                      className={`h-10 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.quality)}`}
                      title={`${row.quality.toFixed(2)}`}
                    >
                      {row.quality.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-2">
                    <div
                      className={`h-10 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.humidity)}`}
                      title={`${row.humidity.toFixed(2)}`}
                    >
                      {row.humidity.toFixed(2)}
                    </div>
                  </td>
                  <td className="p-2">
                    <div
                      className={`h-10 w-full rounded flex items-center justify-center text-xs font-medium ${getColor(row.rainfall)}`}
                      title={`${row.rainfall.toFixed(2)}`}
                    >
                      {row.rainfall.toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Strong Negative (-1.0)</span>
            <span>Weak (0)</span>
            <span>Strong Positive (+1.0)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
