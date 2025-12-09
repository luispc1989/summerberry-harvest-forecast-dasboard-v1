import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImage from "@/assets/summerberry-logo.png";

export interface PDFData {
  predictions: Array<{ day: string; date: string; value: number; error?: number }>;
  total: number;
  avgError?: number | null;
  site: string;
  sector: string;
  chartElement?: HTMLElement | null;
}

// Page dimensions
const PAGE_WIDTH = 210;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = 280;

// Colors
const PRIMARY_BLUE: [number, number, number] = [3, 30, 64]; // #031e40
const PRIMARY_GREEN: [number, number, number] = [34, 139, 34];
const DARK_GRAY: [number, number, number] = [60, 60, 60];
const LIGHT_GRAY: [number, number, number] = [120, 120, 120];

function addFooter(pdf: jsPDF, pageNumber: number, totalPages: number) {
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(MARGIN, FOOTER_Y, PAGE_WIDTH - MARGIN, FOOTER_Y);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...LIGHT_GRAY);
  pdf.text(
    "This report is generated based on ML model predictions. Actual harvest may vary.",
    MARGIN,
    FOOTER_Y + 5
  );
  pdf.text(
    `Page ${pageNumber} of ${totalPages}`,
    PAGE_WIDTH - MARGIN - 20,
    FOOTER_Y + 5
  );
}

export async function generateReport(data: PDFData): Promise<void> {
  const pdf = new jsPDF("portrait", "mm", "a4");
  let y = 15;

  // ===== PAGE 1: Header, Chart, and 7-Day Predictions Table =====

  // Add logo
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load logo"));
      img.src = logoImage;
    });
    
    const logoWidth = 25;
    const logoHeight = 25;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(MARGIN - 2, y - 2, logoWidth + 4, logoHeight + 4, 3, 3, "F");
    pdf.addImage(img, "PNG", MARGIN, y, logoWidth, logoHeight);
    
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PRIMARY_BLUE);
    pdf.text("The Summer Berry Company", MARGIN + logoWidth + 5, y + 10);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...LIGHT_GRAY);
    pdf.text("Harvest Prediction Report", MARGIN + logoWidth + 5, y + 18);
    
    y += 35;
  } catch {
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PRIMARY_BLUE);
    pdf.text("The Summer Berry Company", MARGIN, y + 5);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...LIGHT_GRAY);
    pdf.text("Harvest Prediction Report", MARGIN, y + 13);
    
    y += 20;
  }

  // Report date and filters
  pdf.setFontSize(10);
  pdf.setTextColor(...LIGHT_GRAY);
  pdf.text("Generated: " + new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }), MARGIN, y);
  y += 8;

  const siteName = data.site === "all" ? "All Sites" : data.site.toUpperCase();
  const sectorName = data.sector === "all" ? "All Sectors" : data.sector;
  pdf.text(`Site: ${siteName}  •  Sector: ${sectorName}`, MARGIN, y);
  y += 8;

  // Divider line
  pdf.setDrawColor(...PRIMARY_GREEN);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 8;

  // Chart image capture
  if (data.chartElement) {
    try {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...PRIMARY_BLUE);
      pdf.text("7-Day Harvest Prediction Chart", MARGIN, y);
      y += 5;

      const canvas = await html2canvas(data.chartElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = CONTENT_WIDTH;
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 65);
      
      pdf.addImage(imgData, "PNG", MARGIN, y, imgWidth, imgHeight);
      y += imgHeight + 8;
    } catch (err) {
      console.error("Failed to capture chart:", err);
      y += 5;
    }
  }

  // 7-Day Predictions Table
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...PRIMARY_BLUE);
  pdf.text("7-Day Harvest Predictions", MARGIN, y);
  y += 6;

  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 8, "F");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_GRAY);
  pdf.text("Day", MARGIN + 5, y + 5.5);
  pdf.text("Date", MARGIN + 45, y + 5.5);
  pdf.text("Predicted Harvest (kg)", MARGIN + 100, y + 5.5);
  y += 9;

  // Table rows
  pdf.setFont("helvetica", "normal");
  data.predictions.forEach((p, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(MARGIN, y - 1, CONTENT_WIDTH, 6, "F");
    }
    pdf.setTextColor(...DARK_GRAY);
    pdf.setFontSize(9);
    pdf.text(p.day, MARGIN + 5, y + 3);
    pdf.text(p.date, MARGIN + 45, y + 3);
    pdf.text(`${p.value.toLocaleString()} kg`, MARGIN + 100, y + 3);
    y += 6;
  });

  // Totals row with Total and Predicted Error
  y += 2;
  pdf.setFillColor(...PRIMARY_GREEN);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 10, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text(`Total Harvest Prediction (7 days): ${data.total.toLocaleString()} kg`, MARGIN + 5, y + 6.5);
  if (data.avgError !== null && data.avgError !== undefined) {
    pdf.text(`Total Prediction Error (7 days): ${data.total.toLocaleString()} ± ${data.avgError.toLocaleString()} kg`, MARGIN + 80, y + 6.5);
  }
  y += 15;

  // Add footer
  addFooter(pdf, 1, 1);

  // Generate PDF blob
  const pdfBlob = pdf.output("blob");
  const fileName = "harvest-report-" + new Date().toISOString().split("T")[0] + ".pdf";

  // Try to use File System Access API (allows user to choose save location)
  // Note: This API only works in Chrome/Edge and requires secure context (HTTPS or localhost)
  // It may not work in iframes due to security restrictions
  if ("showSaveFilePicker" in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "PDF Document",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(pdfBlob);
      await writable.close();
      return;
    } catch (err: any) {
      // User cancelled the save dialog
      if (err.name === "AbortError") {
        return;
      }
      // SecurityError occurs in iframes/restricted contexts
      if (err.name === "SecurityError") {
        console.log("File System Access API not available in this context, using download fallback");
      } else {
        // Fallback to traditional download if API fails
        console.warn("File System Access API failed, falling back to download:", err);
      }
    }
  }

  // Fallback for browsers that don't support File System Access API
  pdf.save(fileName);
}
