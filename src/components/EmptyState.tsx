import { Upload, FileSpreadsheet, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const EmptyState = () => {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/20">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <FileSpreadsheet className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Predictions Available
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          To generate harvest predictions, upload your data file using the sidebar on the left, 
          then click "Process Predictions".
        </p>
        <div className="flex flex-col gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4 text-primary" />
            <span>Use the "Weekly Data Upload" section in the sidebar</span>
          </div>
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <span>Supported format: XLSX (Excel)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};