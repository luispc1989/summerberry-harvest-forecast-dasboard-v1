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
const PAGE_HEIGHT = 297;
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

function addFooter(pdf: jsPDF) {
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
    "© The Summer Berry Company - Confidential",
    PAGE_WIDTH - MARGIN - 55,
    FOOTER_Y + 5
  );
}

function checkNewPage(pdf: jsPDF, y: number, requiredSpace: number): number {
  if (y + requiredSpace > FOOTER_Y - 10) {
    addFooter(pdf);
    pdf.addPage();
    return 20; // Reset to top of new page
  }
  return y;
}

export async function generateReport(data: PDFData): Promise<void> {
  const pdf = new jsPDF("portrait", "mm", "a4");
  let y = 15;

  // ===== PAGE 1: Header, Filters, and Chart =====

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

  // Report date
  pdf.setFontSize(10);
  pdf.setTextColor(...LIGHT_GRAY);
  pdf.text("Generated: " + new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }), MARGIN, y);
  y += 10;

  // Divider line
  pdf.setDrawColor(...PRIMARY_GREEN);
  pdf.setLineWidth(0.5);
  pdf.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
  y += 10;

  // Filters section
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_GRAY);
  pdf.text("Selected Filters", MARGIN, y);
  y += 7;

  const siteName = data.site === "all" ? "All Sites" : data.site.toUpperCase();
  const sectorName = data.sector === "all" ? "All Sectors" : data.sector;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...LIGHT_GRAY);
  pdf.text(`Site: ${siteName}  •  Sector: ${sectorName}  •  Plantation Date: ${data.plantationDate}`, MARGIN, y);
  y += 15;

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
      const imgHeight = Math.min((canvas.height * imgWidth) / canvas.width, 80);
      
      pdf.addImage(imgData, "PNG", MARGIN, y, imgWidth, imgHeight);
      y += imgHeight + 10;
    } catch (err) {
      console.error("Failed to capture chart:", err);
      y += 5;
    }
  }

  // Add footer to first page
  addFooter(pdf);

  // ===== PAGE 2: 7-Day Predictions Table =====
  pdf.addPage();
  y = 20;

  // Page 2 Header
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...PRIMARY_GREEN);
  pdf.text("7-Day Harvest Predictions", MARGIN, y);
  y += 15;

  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 10, "F");
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_GRAY);
  pdf.text("Day", MARGIN + 5, y + 6.5);
  pdf.text("Date", MARGIN + 50, y + 6.5);
  pdf.text("Predicted Harvest (kg)", MARGIN + 110, y + 6.5);
  y += 12;

  // Table rows
  pdf.setFont("helvetica", "normal");
  data.predictions.forEach((p, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(MARGIN, y - 2, CONTENT_WIDTH, 10, "F");
    }
    pdf.setTextColor(...DARK_GRAY);
    pdf.setFontSize(10);
    pdf.text(p.day, MARGIN + 5, y + 5);
    pdf.text(p.date, MARGIN + 50, y + 5);
    pdf.text(`${p.value.toLocaleString()} kg`, MARGIN + 110, y + 5);
    y += 10;
  });

  // Totals row
  y += 5;
  pdf.setFillColor(...PRIMARY_GREEN);
  pdf.rect(MARGIN, y, CONTENT_WIDTH, 12, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.text(`Total: ${data.total.toLocaleString()} kg`, MARGIN + 5, y + 8);
  pdf.text(`Daily Average: ${data.average.toLocaleString()} kg`, MARGIN + 110, y + 8);
  y += 25;

  // Summary statistics
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...DARK_GRAY);
  pdf.text("Summary Statistics", MARGIN, y);
  y += 10;

  const minPrediction = Math.min(...data.predictions.map(p => p.value));
  const maxPrediction = Math.max(...data.predictions.map(p => p.value));
  const minDay = data.predictions.find(p => p.value === minPrediction);
  const maxDay = data.predictions.find(p => p.value === maxPrediction);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...DARK_GRAY);
  
  const stats = [
    `• Total 7-Day Forecast: ${data.total.toLocaleString()} kg`,
    `• Daily Average: ${data.average.toLocaleString()} kg`,
    `• Highest Day: ${maxDay?.day} (${maxDay?.date}) - ${maxPrediction.toLocaleString()} kg`,
    `• Lowest Day: ${minDay?.day} (${minDay?.date}) - ${minPrediction.toLocaleString()} kg`,
  ];

  stats.forEach(stat => {
    pdf.text(stat, MARGIN + 5, y);
    y += 8;
  });

  // Add footer to second page
  addFooter(pdf);

  // ===== PAGE 3: Top Influencing Factors =====
  if (data.factors && data.factors.length > 0) {
    pdf.addPage();
    y = 20;

    // Page 3 Header
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...PRIMARY_GREEN);
    pdf.text("Top Influencing Factors", MARGIN, y);
    y += 8;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...LIGHT_GRAY);
    pdf.text("Based on feature importance analysis from machine learning models", MARGIN, y);
    y += 15;

    // Factor cards
    data.factors.slice(0, 5).forEach((factor, index) => {
      y = checkNewPage(pdf, y, 40);
      
      // Card background
      pdf.setFillColor(248, 249, 250);
      pdf.roundedRect(MARGIN, y, CONTENT_WIDTH, 35, 3, 3, "F");
      
      // Rank number
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(200, 200, 200);
      pdf.text(`${index + 1}`, MARGIN + 8, y + 22);
      
      // Factor name
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...DARK_GRAY);
      pdf.text(factor.name, MARGIN + 30, y + 12);
      
      // Importance percentage
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      const importanceColor = factor.correlation === "positive" ? POSITIVE_COLOR : NEGATIVE_COLOR;
      pdf.setTextColor(...importanceColor);
      pdf.text(`${factor.importance}%`, PAGE_WIDTH - MARGIN - 20, y + 12);
      
      // Progress bar background
      const barY = y + 18;
      const barWidth = CONTENT_WIDTH - 50;
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(MARGIN + 30, barY, barWidth, 6, 2, 2, "F");
      
      // Progress bar fill
      const fillWidth = (factor.importance / 100) * barWidth;
      pdf.setFillColor(...importanceColor);
      pdf.roundedRect(MARGIN + 30, barY, fillWidth, 6, 2, 2, "F");
      
      // Correlation label
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...importanceColor);
      const correlationLabel = factor.correlation === "positive" 
        ? "↑ Positively correlated with yield" 
        : "↓ Negatively correlated with yield";
      pdf.text(correlationLabel, MARGIN + 30, y + 32);
      
      y += 42;
    });

    // Interpretation section
    y = checkNewPage(pdf, y, 50);
    y += 10;
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...DARK_GRAY);
    pdf.text("How to Interpret These Factors", MARGIN, y);
    y += 10;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...LIGHT_GRAY);
    
    const interpretationText = [
      "• Positive correlation: Higher values of this factor tend to increase harvest yield.",
      "• Negative correlation: Higher values of this factor tend to decrease harvest yield.",
      "• Importance %: The relative contribution of each factor to the prediction model.",
      "• These factors are derived from historical data analysis and ML feature importance.",
    ];

    interpretationText.forEach(text => {
      pdf.text(text, MARGIN + 5, y);
      y += 7;
    });

    // Add footer to third page
    addFooter(pdf);
  }

  pdf.save("harvest-report-" + new Date().toISOString().split("T")[0] + ".pdf");
}
