import { Filter, MapPin, Calendar, Leaf, Grid3x3, Trees, CalendarDays } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { WeeklyAverages } from "@/components/WeeklyAverages";

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
  '1_1', '1_2', '1_3', '1_4', '1_5',
  '2_1', '2_2', '2_3',
  '3_1', '3_2', '4',
  '5_1', '5_2', '5_3_1', '5_3_2',
  '6_1', '6_2', '6_3',
  '7_1', '7_2', '7_3',
  '8_1', '8_2', '8_3',
  '9_1', '9_2', '9_3', '9_4',
  '12_1', '12_2', '12_3',
  '13_1', '13_2', '13_3',
  '14_1', '14_2', '14_3', '14_4_1', '14_4_2',
  '15_1', '15_2', '15_3_1', '15_3_2', '15_4_1', '15_4_2', '15_5_1', '15_5_2',
  '16_1', '16_2',
  '17_1', '17_2', '17_3',
  '18_1', '18_2', '18_3',
  '19_1', '19_2', '19_3',
  '20_1', '20_2', '20_3',
  '21_1', '21_2', '21_3',
  '22_1', '22_2', '22_3',
  '23_1', '23_2', '23_3',
  '24_1', '24_2', '24_3', '24_4', '24_5', '24_6',
  '26_1', '26_2', '26_3',
  '27_1', '27_2', '27_3',
  '29_1', '29_2', '29_3', '29_4',
  '30',
  '31_1', '31_2', '31_3'
];

const plantTypes = [
  { value: 'rb', label: 'Root Blocks (RB)' },
  { value: 'gt', label: 'Grow Through (GT)' },
  { value: 'lc', label: 'Long Canes (LC)' },
  { value: 'gc', label: 'Green Canes (GC)' },
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
            <input
              type="date"
              value={selectedPlantationDate?.toISOString().split('T')[0] || ''}
              onChange={(e) => onPlantationDateChange(e.target.value ? new Date(e.target.value) : undefined)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
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
              <span className="text-muted-foreground">Total Fields:</span>
              <span className="font-medium">12</span>
            </div>
          </div>
        </Card>

        <WeeklyAverages 
          site={selectedSite}
          variety={selectedVariety}
          dateRange={selectedDateRange}
          selectedDate={selectedPlantationDate || new Date()}
        />
      </div>
    </aside>
  );
};
