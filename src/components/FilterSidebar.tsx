import { Filter, MapPin, Leaf, Grid3x3, Grape, CalendarDays, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";

interface FilterSidebarProps {
  selectedSite: string;
  selectedVariety: string;
  selectedSector: string;
  selectedPlantType: string;
  selectedPlantationDate: string;
  onSiteChange: (value: string) => void;
  onVarietyChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onPlantTypeChange: (value: string) => void;
  onPlantationDateChange: (date: string) => void;
}

const plantationDates = [
  "2020-09-24", "2020-09-26", "2020-09-30", "2020-10-28", "2020-10-29",
  "2021-02-02", "2021-02-04", "2021-02-05", "2021-02-11", "2021-03-05",
  "2021-03-12", "2021-03-16", "2021-03-17", "2021-07-08", "2021-08-06",
  "2021-09-17", "2021-09-23", "2021-09-30", "2021-10-02", "2021-10-05",
  "2021-10-07", "2021-10-08", "2021-10-14", "2021-10-21", "2021-10-29",
  "2021-11-12", "2021-12-06", "2021-12-09", "2022-01-04", "2022-01-19",
  "2022-02-03", "2022-02-17", "2022-02-18", "2022-03-16", "2022-03-27",
  "2022-03-31", "2022-04-09", "2022-04-24", "2022-04-29", "2022-05-27",
  "2022-08-15", "2022-08-17", "2022-08-18", "2022-08-21", "2022-08-23",
  "2022-08-24", "2022-08-25", "2022-08-26", "2022-08-27", "2022-08-29",
  "2022-08-30", "2022-08-31", "2022-09-01", "2022-09-05", "2022-09-06"
];

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
  selectedSector,
  selectedPlantType,
  selectedPlantationDate,
  onSiteChange, 
  onVarietyChange, 
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
              <Grape className="h-4 w-4 text-primary" />
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
              <CalendarDays className="h-4 w-4 text-primary" />
              Plantation Date
            </Label>
            <Select value={selectedPlantationDate} onValueChange={onPlantationDateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select plantation date" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {plantationDates.map((date) => (
                  <SelectItem key={date} value={date}>{date}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-sidebar-foreground">Weekly Data Upload</h3>
          </div>
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Upload CSV or XLSX file</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log("File selected:", file.name);
                  }
                }}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center gap-2 cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-center text-muted-foreground">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-center text-muted-foreground">
                  CSV, XLSX (max 10MB)
                </span>
              </label>
            </div>
          </div>
        </Card>
      </div>
    </aside>
  );
};
