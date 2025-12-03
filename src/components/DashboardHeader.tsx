import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import logo from "@/assets/summerberry-logo.png";
import { ThemeToggle } from "./ThemeToggle";

interface DashboardHeaderProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

export const DashboardHeader = ({ date, onDateChange }: DashboardHeaderProps) => {

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
            <h1 className="text-lg font-semibold text-foreground">SummerBerry</h1>
            <p className="text-xs text-muted-foreground">Harvest Forecasting Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {format(date, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && onDateChange(newDate)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
