import { Upload, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const EmptyState = () => {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <FileSpreadsheet className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Predictions Yet
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md">
          Upload a data file and click "Process Data" to generate harvest predictions based on your ML models.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Upload className="h-4 w-4" />
          <span>Supported formats: CSV, XLSX</span>
        </div>
      </CardContent>
    </Card>
  );
};
