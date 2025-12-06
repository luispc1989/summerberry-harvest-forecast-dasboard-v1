import jsPDF from "jspdf";

export interface PDFData {
  predictions: Array<{ day: string; date: string; value: number }>;
  total: number;
  average: number;
  site: string;
  sector: string;
  plantationDate: string;
}

export function generateReport(data: PDFData): void {
  const pdf = new jsPDF("portrait", "mm", "a4");
  let y = 20;

  // Header
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  pdf.text("The Summer Berry Company", 20, y);
  y += 8;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("Harvest Prediction Report - " + new Date().toLocaleDateString(), 20, y);
  y += 15;

  // Filters
  const siteName = data.site === "all" ? "All Sites" : data.site.toUpperCase();
  const sectorName = data.sector === "all" ? "All Sectors" : data.sector;
  pdf.setFontSize(10);
  pdf.text("Site: " + siteName + "  |  Sector: " + sectorName + "  |  Plantation: " + data.plantationDate, 20, y);
  y += 15;

  // Table
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.text("7-Day Predictions", 20, y);
  y += 8;

  data.predictions.forEach((p) => {
    pdf.setFont("helvetica", "normal");
    pdf.text(p.day + " (" + p.date + "): " + p.value + " kg", 25, y);
    y += 6;
  });

  y += 5;
  pdf.setFont("helvetica", "bold");
  pdf.text("Total: " + data.total + " kg  |  Average: " + data.average + " kg", 20, y);

  pdf.save("harvest-report-" + new Date().toISOString().split("T")[0] + ".pdf");
}
