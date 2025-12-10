import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center relative">
        <AlertCircle className="h-10 w-10 text-destructive mb-3" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Error Processing Data
        </h3>
        <p className="text-muted-foreground mb-6 max-w-lg whitespace-pre-line text-sm">
          {message}
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <X className="h-4 w-4" />
            Dismiss & Start Over
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
