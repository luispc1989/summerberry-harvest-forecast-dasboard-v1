import { Calendar, Wifi, WifiOff } from "lucide-react";
import { format } from "date-fns";
import logo from "@/assets/summerberry-logo.png";
import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";

interface DashboardHeaderProps {
  isMockData?: boolean;
}

export const DashboardHeader = ({ isMockData = false }: DashboardHeaderProps) => {
  const today = new Date();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-white p-1.5 shadow-sm dark:bg-white/95">
            <img 
              src={logo} 
              alt="The Summer Berry Company" 
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">The Summer Berry Company</h1>
            <p className="text-xs text-muted-foreground">Harvest Forecasting Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection status badge */}
          {isMockData ? (
            <Badge variant="secondary" className="gap-1.5 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              <WifiOff className="h-3 w-3" />
              Demo Mode
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1.5 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              <Wifi className="h-3 w-3" />
              Live Data
            </Badge>
          )}
          
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {format(today, "PPP")}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};