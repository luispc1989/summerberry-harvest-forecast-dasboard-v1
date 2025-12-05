import { Filter, MapPin, Grid3x3, CalendarDays, Upload, X, FileSpreadsheet, CheckCircle2, Play, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  selectedSite: string;
  selectedSector: string;
  selectedPlantationDate: string;
  onSiteChange: (value: string) => void;
  onSectorChange: (value: string) => void;
  onPlantationDateChange: (date: string) => void;
  onFileUpload?: (file: File | null) => void;
  onProcessData?: () => void;
  isProcessing?: boolean;
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

// Get sector options based on selected site
function getSectorOptions(site: string): string[] {
  if (site === 'adm') return admSectors;
  if (site === 'alm') return almSectors;
  return []; // "all" sites - only "All Sectors" is available
}

export const FilterSidebar = ({ 
  selectedSite, 
  selectedSector,
  selectedPlantationDate,
  onSiteChange, 
  onSectorChange,
  onPlantationDateChange,
  onFileUpload,
  onProcessData,
  isProcessing = false
}: FilterSidebarProps) => {
  const sectorOptions = getSectorOptions(selectedSite);
  const isAllSites = selectedSite === 'all';
  
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  // Reset success state after animation
  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const processFile = (file: File) => {
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    // Check file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!validTypes.includes(extension)) {
      toast.error("Invalid file type. Please upload CSV or XLSX files.");
      return;
    }

    // Simulate upload with animation
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setUploadedFileName(file.name);
      onFileUpload?.(file);
      toast.success(`File "${file.name}" uploaded successfully`);
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => {
      const newCount = prev - 1;
      if (newCount === 0) {
        setIsDragging(false);
      }
      return newCount;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragCounter(0);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleClearFile = () => {
    setUploadedFileName(null);
    onFileUpload?.(null);
    toast.info("File removed");
  };

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
              <SelectContent className="z-50 bg-popover">
                <SelectItem value="all">All Sites</SelectItem>
                <SelectItem value="adm">ADM</SelectItem>
                <SelectItem value="alm">ALM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Grid3x3 className="h-4 w-4 text-primary" />
              Sector
            </Label>
            <Select 
              value={selectedSector} 
              onValueChange={onSectorChange}
              disabled={isAllSites}
            >
              <SelectTrigger className={isAllSites ? "opacity-70" : ""}>
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-popover max-h-[300px]">
                <SelectItem value="all">All Sectors</SelectItem>
                {sectorOptions.map((sector) => (
                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isAllSites && (
              <p className="text-xs text-muted-foreground">
                All sectors included when "All Sites" is selected
              </p>
            )}
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
              <SelectContent className="z-50 bg-popover max-h-[300px]">
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
            {uploadedFileName ? (
              <div className="space-y-3">
                <div className={cn(
                  "border rounded-lg p-3 transition-all duration-300",
                  uploadSuccess 
                    ? "border-primary bg-primary/10 scale-[1.02]" 
                    : "border-primary/50 bg-primary/5"
                )}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={cn(
                        "p-1.5 rounded-md transition-all duration-300",
                        uploadSuccess ? "bg-primary/20" : "bg-primary/10"
                      )}>
                        <FileSpreadsheet className={cn(
                          "h-4 w-4 transition-all duration-300",
                          uploadSuccess ? "text-primary scale-110" : "text-primary"
                        )} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-foreground truncate block">{uploadedFileName}</span>
                        <span className="text-[10px] text-muted-foreground">Ready to process</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={handleClearFile}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  className="w-full gap-2"
                  onClick={onProcessData}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Process Predictions
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div 
                className={cn(
                  "relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ease-out cursor-pointer overflow-hidden",
                  isDragging && "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20",
                  isUploading && "border-primary bg-primary/5 pointer-events-none",
                  !isDragging && !isUploading && "border-border hover:border-primary/50 hover:bg-muted/30"
                )}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Animated background effect when dragging */}
                {isDragging && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 animate-pulse" />
                    <div className="absolute inset-0 border-2 border-primary/30 rounded-xl animate-[ping_1.5s_ease-in-out_infinite]" />
                  </>
                )}
                
                {/* Upload progress animation */}
                {isUploading && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-muted overflow-hidden rounded-b-xl">
                    <div className="h-full bg-primary animate-[loading_0.8s_ease-in-out]" 
                      style={{ 
                        animation: 'loading 0.8s ease-in-out forwards',
                      }} 
                    />
                  </div>
                )}
                
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className={cn(
                    "relative flex flex-col items-center gap-3 cursor-pointer",
                    isUploading && "cursor-wait"
                  )}
                >
                  <div className={cn(
                    "p-3 rounded-full transition-all duration-300",
                    isDragging && "bg-primary/20 scale-125 shadow-lg shadow-primary/30",
                    isUploading && "bg-primary/20 animate-bounce",
                    !isDragging && !isUploading && "bg-muted/50 group-hover:bg-primary/10"
                  )}>
                    {isUploading ? (
                      <CheckCircle2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <Upload className={cn(
                        "h-6 w-6 transition-all duration-300",
                        isDragging && "text-primary -translate-y-1 scale-110",
                        !isDragging && "text-muted-foreground"
                      )} />
                    )}
                  </div>
                  <div className="text-center space-y-1">
                    <span className={cn(
                      "text-sm font-medium transition-colors duration-200",
                      isDragging && "text-primary",
                      isUploading && "text-primary",
                      !isDragging && !isUploading && "text-foreground"
                    )}>
                      {isUploading ? 'Uploading...' : isDragging ? 'Drop to upload' : 'Drop file here'}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {isUploading ? 'Please wait' : isDragging ? 'Release to upload your file' : 'or click to browse'}
                    </p>
                  </div>
                  <span className={cn(
                    "text-xs px-2.5 py-1 rounded-full transition-all duration-200",
                    isDragging && "bg-primary/20 text-primary scale-105",
                    isUploading && "bg-primary/20 text-primary",
                    !isDragging && !isUploading && "bg-muted text-muted-foreground"
                  )}>
                    CSV, XLSX • Max 10MB
                  </span>
                </label>
              </div>
            )}
          </div>
        </Card>
      </div>
    </aside>
  );
};
