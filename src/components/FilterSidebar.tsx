import { Filter, MapPin, Calendar, Leaf, Grid3x3, Trees, CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { WeeklyAverages } from "@/components/WeeklyAverages";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  selectedSite: string;
  selectedVariety: string;
  selectedDateRange: string;
  selectedSector: string;
  selectedPlantType: string;
  selectedPlantationDate: Date | undefined;
  onSiteChange: (value: string) => void;
  onVarietyChange: (value: string) => void;
  onDateRangeChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onPlantTypeChange: (value: string) => void;
  onPlantationDateChange: (date: Date | undefined) => void;
}

const admSectors = [
  'A1', 'B2', 'A2', 'B1', 'C1', 'B3', 'B4', 'D3', 'D2', 'A3', 'C2', 'E3',
  'F1', 'E1', 'E2', 'F2', 'C3', 'F3', 'D1', 'I1', 'H3', 'I2', 'H2', 'H1',
  'M2', 'M1', 'G1', 'L3', 'K1', 'L2', 'G2', 'G3', 'L1', 'K2', 'K3', 'J1',
  'O1', 'J2', 'O2', 'O4', 'N1', 'N3', 'N2', 'O3', 'P1', 'P2', 'Q2', 'Q1'
];

const almSectors = [
  '1.1', '1.2', '1.3', '1.4', '1.5',
  '2.1', '2.2', '2.3',
  '3.1', '3.2', '4',
  '5.1', '5.2', '5.3.1', '5.3.2',
  '6.1', '6.2', '6.3',
  '7.1', '7.2', '7.3',
  '8.1', '8.2', '8.3',
  '9.1', '9.2', '9.3', '9.4',
  '12.1', '12.2', '12.3',
  '13.1', '13.2', '13.3',
  '14.1', '14.2', '14.3', '14.4.1', '14.4.2',
  '15.1', '15.2', '15.3.1', '15.3.2', '15.4.1', '15.4.2', '15.5.1', '15.5.2',
  '16.1', '16.2',
  '17.1', '17.2', '17.3',
  '18.1', '18.2', '18.3',
  '19.1', '19.2', '19.3',
  '20.1', '20.2', '20.3',
  '21.1', '21.2', '21.3',
  '22.1', '22.2', '22.3',
  '23.1', '23.2', '23.3',
  '24.1', '24.2', '24.3', '24.4', '24.5', '24.6',
  '26.1', '26.2', '26.3',
  '27.1', '27.2', '27.3',
  '29.1', '29.2', '29.3', '29.4',
  '30',
  '31.1', '31.2', '31.3'
];

const plantTypes = [
  { value: 'gc', label: 'Green Canes (GC)' },
  { value: 'gt', label: 'Grow Through (GT)' },
  { value: 'lc', label: 'Long Canes (LC)' },
  { value: 'rb', label: 'Root Blocks (RB)' },
  { value: 'sc', label: 'Summer Cutback (SC)' }
];

export const FilterSidebar = ({ 
  selectedSite, 
  selectedVariety, 
  selectedDateRange, 
  selectedSector,
  selectedPlantType,
  selectedPlantationDate,
  onSiteChange, 
  onVarietyChange, 
  onDateRangeChange,
  onSectorChange,
  onPlantTypeChange,
  onPlantationDateChange
}: FilterSidebarProps) => {
  const sectorOptions = selectedSite === 'adm' ? admSectors : almSectors;
  return (
    <aside className="w-72 border-r border-sidebar-border bg-sidebar p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-sidebar-foreground">Filters</h2>
        </div>

        <Card className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" />
              Site
            </Label>
            <Select value={selectedSite} onValueChange={onSiteChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adm">ADM</SelectItem>
                <SelectItem value="alm">ALM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Leaf className="h-4 w-4 text-primary" />
              Variety
            </Label>
            <Select value={selectedVariety} onValueChange={onVarietyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select variety" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">A</SelectItem>
                <SelectItem value="b">B</SelectItem>
                <SelectItem value="c">C</SelectItem>
                <SelectItem value="d">D</SelectItem>
                <SelectItem value="e">E</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Grid3x3 className="h-4 w-4 text-primary" />
              Sector
            </Label>
            <Select value={selectedSector} onValueChange={onSectorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {sectorOptions.map((sector) => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Trees className="h-4 w-4 text-primary" />
              Plant Type
            </Label>
            <Select value={selectedPlantType} onValueChange={onPlantTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select plant type" />
              </SelectTrigger>
              <SelectContent>
                {plantTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-primary" />
              Date Range
            </Label>
            <Select value={selectedDateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2d">Last 2 days</SelectItem>
                <SelectItem value="3d">Last 3 days</SelectItem>
                <SelectItem value="4d">Last 4 days</SelectItem>
                <SelectItem value="5d">Last 5 days</SelectItem>
                <SelectItem value="6d">Last 6 days</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <CalendarDays className="h-4 w-4 text-primary" />
              Plantation Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedPlantationDate && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {selectedPlantationDate ? format(selectedPlantationDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedPlantationDate}
                  onSelect={onPlantationDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        <Card className="p-4 bg-muted/50">
          <h3 className="text-sm font-medium mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Sites:</span>
              <span className="font-medium">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Varieties:</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Sectors:</span>
              <span className="font-medium">{sectorOptions.length}</span>
            </div>
          </div>
        </Card>

        <div className="w-full">
          <WeeklyAverages 
            site={selectedSite}
            variety={selectedVariety}
            dateRange={selectedDateRange}
            selectedDate={selectedPlantationDate || new Date()}
          />
        </div>
      </div>
    </aside>
  );
};
