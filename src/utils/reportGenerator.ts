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

export async function generateReport(data: PDFData): Promise<void> {
  const pdf = new jsPDF("portrait", "mm", "a4");
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Colors
  const primaryGreen = [34, 139, 34]; // Forest green
  const darkGray = [60, 60, 60];
  const lightGray = [120, 120, 120];

  // Add logo
  try {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load logo"));
      img.src = logoImage;
    });
    
    // Add logo with white background for visibility
    const logoWidth = 25;
    const logoHeight = 25;
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(margin - 2, y - 2, logoWidth + 4, logoHeight + 4, 3, 3, "F");
    pdf.addImage(img, "PNG", margin, y, logoWidth, logoHeight);
    
    // Company name next to logo
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryGreen);
    pdf.text("The Summer Berry Company", margin + logoWidth + 5, y + 10);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...lightGray);
    pdf.text("Harvest Prediction Report", margin + logoWidth + 5, y + 18);
    
    y += 35;
  } catch (err) {
    // Fallback without logo
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...primaryGreen);
    pdf.text("The Summer Berry Company", margin, y + 5);
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(...lightGray);
    pdf.text("Harvest Prediction Report", margin, y + 13);
    
    y += 20;
  }

  // Report date
  pdf.setFontSize(10);
  pdf.setTextColor(...lightGray);
  pdf.text("Generated: " + new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }), margin, y);
  y += 10;

  // Divider line
  pdf.setDrawColor(...primaryGreen);
  pdf.setLineWidth(0.5);
  pdf.line(margin, y, pageWidth - margin, y);
  y += 10;

  // Filters section
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...darkGray);
  pdf.text("Selected Filters", margin, y);
  y += 7;

  const siteName = data.site === "all" ? "All Sites" : data.site.toUpperCase();
  const sectorName = data.sector === "all" ? "All Sectors" : data.sector;
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...lightGray);
  pdf.text(`Site: ${siteName}  •  Sector: ${sectorName}  •  Plantation Date: ${data.plantationDate}`, margin, y);
  y += 15;

  // Chart image capture
  if (data.chartElement) {
    try {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...darkGray);
      pdf.text("7-Day Harvest Prediction Chart", margin, y);
      y += 5;

      const canvas = await html2canvas(data.chartElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", margin, y, imgWidth, Math.min(imgHeight, 70));
      y += Math.min(imgHeight, 70) + 10;
    } catch (err) {
      console.error("Failed to capture chart:", err);
      y += 5;
    }
  }

  // 7-Day Predictions Table
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...darkGray);
  pdf.text("7-Day Harvest Predictions", margin, y);
  y += 8;

  // Table header
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, y, contentWidth, 8, "F");
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...darkGray);
  pdf.text("Day", margin + 5, y + 5.5);
  pdf.text("Date", margin + 45, y + 5.5);
  pdf.text("Predicted Harvest (kg)", margin + 100, y + 5.5);
  y += 10;

  // Table rows
  pdf.setFont("helvetica", "normal");
  data.predictions.forEach((p, index) => {
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, y - 2, contentWidth, 7, "F");
    }
    pdf.setTextColor(...darkGray);
    pdf.text(p.day, margin + 5, y + 3);
    pdf.text(p.date, margin + 45, y + 3);
    pdf.text(`${p.value.toLocaleString()} kg`, margin + 100, y + 3);
    y += 7;
  });

  // Totals
  y += 3;
  pdf.setFillColor(...primaryGreen);
  pdf.rect(margin, y, contentWidth, 10, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text(`Total: ${data.total.toLocaleString()} kg`, margin + 5, y + 6.5);
  pdf.text(`Daily Average: ${data.average.toLocaleString()} kg`, margin + 100, y + 6.5);
  y += 18;

  // Top Influencing Factors
  if (data.factors && data.factors.length > 0) {
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...darkGray);
    pdf.text("Top Influencing Factors", margin, y);
    y += 8;

    data.factors.slice(0, 5).forEach((factor, index) => {
      const barWidth = (factor.importance / 100) * (contentWidth - 80);
      const barColor = factor.correlation === "positive" ? [76, 175, 80] : [244, 67, 54];
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(...darkGray);
      pdf.text(`${index + 1}. ${factor.name}`, margin, y + 3);
      
      // Progress bar background
      pdf.setFillColor(230, 230, 230);
      pdf.roundedRect(margin + 50, y - 1, contentWidth - 80, 6, 1, 1, "F");
      
      // Progress bar fill
      pdf.setFillColor(...barColor);
      pdf.roundedRect(margin + 50, y - 1, barWidth, 6, 1, 1, "F");
      
      // Importance percentage
      pdf.setTextColor(...lightGray);
      pdf.text(`${factor.importance}%`, pageWidth - margin - 10, y + 3);
      
      // Correlation label
      pdf.setFontSize(7);
      pdf.setTextColor(...(factor.correlation === "positive" ? [76, 175, 80] : [244, 67, 54]));
      pdf.text(factor.correlation === "positive" ? "Positive" : "Negative", margin + 50, y + 10);
      
      y += 14;
    });
  }

  // Footer
  const footerY = 280;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(margin, footerY, pageWidth - margin, footerY);
  
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "italic");
  pdf.setTextColor(...lightGray);
  pdf.text(
    "This report is generated based on ML model predictions. Actual harvest may vary.",
    margin,
    footerY + 5
  );
  pdf.text(
    "© The Summer Berry Company - Confidential",
    pageWidth - margin - 55,
    footerY + 5
  );

  pdf.save("harvest-report-" + new Date().toISOString().split("T")[0] + ".pdf");
}
