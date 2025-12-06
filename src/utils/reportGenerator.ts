import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoImage from "@/assets/summerberry-logo.png";

export interface InfluencingFactorData {
  name: string;
  importance: number;
  correlation: "positive" | "negative";
}

export interface PDFData {
  predictions: Array<{ day: string; date: string; value: number }>;
  total: number;
  average: number;
  site: string;
  sector: string;
  plantationDate: string;
  factors?: InfluencingFactorData[];
  chartElement?: HTMLElement | null;
}

// Page dimensions
const PAGE_WIDTH = 210;
const MARGIN = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = 280;

// Colors
const PRIMARY_GREEN: [number, number, number] = [34, 139, 34];
const DARK_GRAY: [number, number, number] = [60, 60, 60];
const LIGHT_GRAY: [number, number, number] = [120, 120, 120];
const POSITIVE_COLOR: [number, number, number] = [76, 175, 80];
const NEGATIVE_COLOR: [number, number, number] = [244, 67, 54];

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
  const totalPages = 2;
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
    pdf.setTextColor(...PRIMARY_GREEN);
    pdf.text("The Summer Berry Company", MARGIN + logoWidth + 5, y + 10);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...LIGHT_GRAY);
    pdf.text("Harvest Prediction Report", MARGIN + logoWidth + 5, y + 18);
    
    y += 35;
  } catch {
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PRIMARY_GREEN);
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
  pdf.text(`Site: ${siteName}  •  Sector: ${sectorName}  •  Plantation Date: ${data.plantationDate}`, MARGIN, y);
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
      pdf.setTextColor(...DARK_GRAY);
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
  pdf.setTextColor(...DARK_GRAY);
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

  // Totals row
  y += 2;
  pdf.setFillColor(...PRIMARY_GREEN);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 10, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);
  pdf.text(`Total: ${data.total.toLocaleString()} kg`, MARGIN + 5, y + 6.5);
  pdf.text(`Daily Average: ${data.average.toLocaleString()} kg`, MARGIN + 100, y + 6.5);

  // Add footer to first page
  addFooter(pdf, 1, totalPages);

  // ===== PAGE 2: Summary Statistics and Top Influencing Factors =====
  pdf.addPage();
  y = 20;

  // Summary Statistics Table
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...PRIMARY_GREEN);
  pdf.text("Summary Statistics", MARGIN, y);
  y += 10;

  const minPrediction = Math.min(...data.predictions.map(p => p.value));
  const maxPrediction = Math.max(...data.predictions.map(p => p.value));
  const minDay = data.predictions.find(p => p.value === minPrediction);
  const maxDay = data.predictions.find(p => p.value === maxPrediction);

  // Stats table
  const statsData = [
    ["Metric", "Value"],
    ["Total 7-Day Forecast", `${data.total.toLocaleString()} kg`],
    ["Daily Average", `${data.average.toLocaleString()} kg`],
    ["Highest Day", `${maxDay?.day} (${maxDay?.date}) - ${maxPrediction.toLocaleString()} kg`],
    ["Lowest Day", `${minDay?.day} (${minDay?.date}) - ${minPrediction.toLocaleString()} kg`],
    ["Variance (Max-Min)", `${(maxPrediction - minPrediction).toLocaleString()} kg`],
  ];

  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 10, "F");
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_GRAY);
  pdf.text(statsData[0][0], MARGIN + 5, y + 6.5);
  pdf.text(statsData[0][1], MARGIN + 70, y + 6.5);
  y += 11;

  // Table rows
  pdf.setFont("helvetica", "normal");
  for (let i = 1; i < statsData.length; i++) {
    if (i % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(MARGIN, y - 1, CONTENT_WIDTH, 8, "F");
    }
    pdf.setTextColor(...DARK_GRAY);
    pdf.text(statsData[i][0], MARGIN + 5, y + 4);
    pdf.setFont("helvetica", "bold");
    pdf.text(statsData[i][1], MARGIN + 70, y + 4);
    pdf.setFont("helvetica", "normal");
    y += 8;
  }

  y += 15;

  // Top Influencing Factors Table
  if (data.factors && data.factors.length > 0) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PRIMARY_GREEN);
    pdf.text("Top Influencing Factors", MARGIN, y);
    y += 10;

    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(MARGIN, y, CONTENT_WIDTH, 10, "F");
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...DARK_GRAY);
    pdf.text("Rank", MARGIN + 5, y + 6.5);
    pdf.text("Factor", MARGIN + 25, y + 6.5);
    pdf.text("Importance", MARGIN + 100, y + 6.5);
    pdf.text("Correlation", MARGIN + 140, y + 6.5);
    y += 11;

    // Factor rows
    data.factors.slice(0, 5).forEach((factor, index) => {
      if (index % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(MARGIN, y - 1, CONTENT_WIDTH, 10, "F");
      }
      
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...DARK_GRAY);
      pdf.text(`${index + 1}`, MARGIN + 8, y + 5);
      
      pdf.setFont("helvetica", "normal");
      pdf.text(factor.name, MARGIN + 25, y + 5);
      
      // Progress bar
      const barX = MARGIN + 100;
      const barWidth = 30;
      const fillWidth = (factor.importance / 100) * barWidth;
      const barColor = factor.correlation === "positive" ? POSITIVE_COLOR : NEGATIVE_COLOR;
      
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(barX, y, barWidth, 6, 1, 1, "F");
      pdf.setFillColor(...barColor);
      pdf.roundedRect(barX, y, fillWidth, 6, 1, 1, "F");
      
      pdf.setFontSize(8);
      pdf.text(`${factor.importance}%`, barX + barWidth + 3, y + 4);
      
      // Correlation
      pdf.setFontSize(9);
      pdf.setTextColor(...barColor);
      pdf.text(factor.correlation === "positive" ? "Positive ↑" : "Negative ↓", MARGIN + 140, y + 5);
      pdf.setTextColor(...DARK_GRAY);
      
      y += 10;
    });
  }

  // Add footer to second page
  addFooter(pdf, 2, totalPages);

  // Generate PDF blob
  const pdfBlob = pdf.output("blob");
  const fileName = "harvest-report-" + new Date().toISOString().split("T")[0] + ".pdf";

  // Try to use File System Access API (allows user to choose save location)
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
      // Fallback to traditional download if API fails
      console.warn("File System Access API failed, falling back to download:", err);
    }
  }

  // Fallback for browsers that don't support File System Access API
  pdf.save(fileName);
}
