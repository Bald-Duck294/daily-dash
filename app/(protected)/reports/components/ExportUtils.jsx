import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { report } from "process";
import XLSX from "xlsx-js-style";

// ✅ Output mode ("save" | "print") controlled synchronously by exportToPDF / printReportPDF
let _pdfOutputMode = "save";

/**
 * ✅ HELPER FUNCTION: Save or Print a jsPDF document
 * When _pdfOutputMode === "print", opens the browser's native print dialog
 * with the formatted PDF instead of printing the raw modal DOM.
 */
const outputPdf = (doc, fileName) => {
  if (_pdfOutputMode === "print") {
    try {
      doc.autoPrint();
      const blobUrl = doc.output("bloburl");
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = blobUrl;

      iframe.onload = () => {
        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (err) {
            console.warn("Iframe print failed, falling back to new tab:", err);
            window.open(blobUrl, "_blank");
          }
        }, 250);

        setTimeout(() => {
          if (iframe.parentNode) {
            document.body.removeChild(iframe);
          }
          URL.revokeObjectURL(blobUrl);
        }, 60000);
      };

      document.body.appendChild(iframe);
      console.log(`🖨️ Print dialog triggered for PDF: ${fileName}`);
    } catch (error) {
      console.error("❌ Error printing PDF:", error);
      const blobUrl = doc.output("bloburl");
      window.open(blobUrl, "_blank");
    }
  } else {
    doc.save(fileName);
  }
};

// ✅ HELPER FUNCTION: Add logos to PDF header
const addLogosToHeader = (doc, pageWidth = 297) => {
  const logoHeight = 12;
  const logoWidth = 12;
  const topMargin = 8;
  const rightMargin = 14;
  const spacing = 5;

  try {
    const nmcLogoX = pageWidth - rightMargin - logoWidth;
    const safaiLogoX = nmcLogoX - logoWidth - spacing;

    const nmcLogoPath = "/nmc_logo.png";
    doc.addImage(
      nmcLogoPath,
      "PNG",
      nmcLogoX,
      topMargin,
      logoWidth,
      logoHeight,
    );

    const safaiLogoPath = "/safai_logo.jpeg";
    doc.addImage(
      safaiLogoPath,
      "JPEG",
      safaiLogoX,
      topMargin,
      logoWidth,
      logoHeight,
    );

    console.log(
      `✅ Logos added at Y=${topMargin}, NMC X=${nmcLogoX}, SaafAi X=${safaiLogoX}`,
    );
  } catch (error) {
    console.error("❌ Error adding logos:", error);
  }
};

const formatScore = (score) => {
  if (!score && score !== 0) return "N/A";
  const rounded = Math.round(score * 10) / 10;
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
};
// ✅ HELPER FUNCTION: Add logos to all pages
const addLogosToAllPages = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.width;

  console.log(`📄 Adding logos to ${pageCount} pages`);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addLogosToHeader(doc, pageWidth);
  }
};

/**
 * ✅ HELPER: Format duration in human-readable format
 */
const formatDuration = (minutes) => {
  if (!minutes || minutes < 0) return "N/A";

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;

  if (remainingMins === 0) {
    return `${hours} hr${hours !== 1 ? "s" : ""}`;
  }

  return `${hours} hr${hours !== 1 ? "s" : ""} ${remainingMins} min`;
};

const getTaskInfo = (task) => {
  const startTime = new Date(task.task_start_time);
  const endTime = task.task_end_time
    ? new Date(task.task_end_time)
    : new Date();

  const durationMs = endTime - startTime;
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  const durationHours = durationMinutes / 60;

  // Check if task is overdue (ongoing for more than 36 hours)
  if (task.status === "ongoing" && durationHours > 36) {
    return {
      status: "OVERDUE",
      duration: null,
      durationDisplay: "Overdue",
      isOverdue: true,
    };
  }

  // Check if task is incomplete (ongoing, between 2-36 hours)
  if (task.status === "ongoing" && durationHours >= 2 && durationHours <= 36) {
    return {
      status: "INCOMPLETE",
      duration: durationMinutes,
      durationDisplay: formatDuration(durationMinutes),
      isIncomplete: true,
    };
  }

  // Normal task
  return {
    status: task.status.toUpperCase(),
    duration: durationMinutes,
    durationDisplay: formatDuration(durationMinutes),
    isOverdue: false,
    isIncomplete: false,
  };
};

const exportDailyTaskToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");
  const reportTitle =
    metadata.dynamic_report_name || metadata.report_type || "Daily Task Report";
  const pageWidth = doc.internal.pageSize.width;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(reportTitle, 14, 15);

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, 18, 283, 18);

  let currentY = 25;

  autoTable(doc, {
    head: [["Organization", "Report Type", "Date Range", "Generated On"]],
    body: [
      [
        metadata.organization || "N/A",
        reportTitle,
        `${metadata.date_range?.start || "N/A"} to ${metadata.date_range?.end || "N/A"}`,
        new Date(metadata.generated_on).toLocaleString("en-CA", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      ],
    ],
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 3;

  const completionRate =
    metadata.total_tasks > 0
      ? ((metadata.completed_tasks / metadata.total_tasks) * 100).toFixed(1)
      : 0;

  autoTable(doc, {
    head: [["Total Cleanings", "Completed", "Ongoing", "Completion Rate"]],
    body: [
      [
        metadata.total_tasks,
        metadata.completed_tasks,
        metadata.ongoing_tasks,
        `${completionRate}%`,
      ],
    ],
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
      fontStyle: "bold",
      fillColor: [236, 253, 245],
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Cleaning Details", 14, currentY);

  currentY += 3;

  const formatDateTimeForPDF = (date) => {
    if (!date) return "Ongoing";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ✅ UPDATED: Use getTaskInfo for status and duration
  const tableData = data.map((task, index) => {
    const taskInfo = getTaskInfo(task);
    return [
      index + 1,
      task.cleaner_name || "N/A",
      task.washroom_full_name || "N/A",
      formatDateTimeForPDF(task.task_start_time),
      formatDateTimeForPDF(task.task_end_time),
      taskInfo.isOverdue ? "Overdue" : taskInfo.durationDisplay,
      task.ai_score !== undefined && task.ai_score !== null
        ? Number(task.ai_score).toFixed(1)
        : "N/A",
      task.washroom_avg_rating !== undefined &&
      task.washroom_avg_rating !== null
        ? Number(task.washroom_avg_rating).toFixed(1)
        : "N/A",
      taskInfo.status, // ✅ Shows COMPLETED, ONGOING, INCOMPLETE, or OVERDUE
    ];
  });

  autoTable(doc, {
    head: [
      [
        "#",
        "Cleaner Name",
        "Location / Washroom",
        "Start Time",
        "End Time",
        "Duration",
        "AI Score (0-10)",
        "Avg. Score/Rating (0-10)",
        "Status",
      ],
    ],
    body: tableData,
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 8 },
      5: { halign: "center" }, // Duration column
      6: { halign: "center" },
      7: { halign: "center" },
      8: {
        halign: "center",
        fontStyle: "bold",
      },
    },
    // ✅ Color overdue and status cells
    didParseCell: function (data) {
      if (data.section === "body") {
        if (data.column.index === 5 && data.cell.raw === "Overdue") {
          data.cell.styles.textColor = [220, 38, 38]; // Red
          data.cell.styles.fontStyle = "bold";
        }
        if (data.column.index === 8) {
          const status = data.cell.raw;
          if (status === "COMPLETED") {
            data.cell.styles.textColor = [22, 163, 74]; // Green
          } else if (status === "ONGOING") {
            data.cell.styles.textColor = [59, 130, 246]; // Blue
          } else if (status === "INCOMPLETE") {
            data.cell.styles.textColor = [234, 179, 8]; // Orange
          } else if (status === "OVERDUE") {
            data.cell.styles.textColor = [220, 38, 38]; // Red
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  //  addLogosToAllPages(doc);

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN")}`,
      14,
      doc.internal.pageSize.height - 10,
    );
  }

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

const exportDailyTaskToExcel = (data, metadata) => {
  const reportTitle =
    metadata.dynamic_report_name || metadata.report_type || "Daily Cleaning Report";

  // Refined Executive Theme (Matching Refined-Headers specification)
  const colors = {
    // Row 1 Title: Slate 100 with dark slate text
    titleBg: "F1F5F9",
    titleText: "0F172A",
    titleBorderBottom: "475569",

    // Row 2 Subtitle: Slate 50 with slate 600 italic text
    subtitleBg: "F8FAFC",
    subtitleText: "475569",
    subtitleBorderBottom: "CBD5E1",

    // Row 4 Scope / Metadata Block
    metaLabelBg: "E2E8F0",      // Slate 200
    metaLabelText: "334155",    // Slate 700
    metaValBg: "F8FAFC",        // Slate 50
    metaValText: "0F172A",      // Slate 900
    borderColor: "CBD5E1",      // Slate 300

    // Row 6 & Row 10 Banners
    bannerBg: "E2E8F0",         // Slate 200
    bannerText: "1E293B",       // Slate 800
    bannerBorderBottom: "475569", // Slate 600

    // Row 7 KPI Headers: Slate 100
    kpiHeaderBg: "F1F5F9",
    kpiHeaderText: "475569",

    // Row 8 KPI Card Values: White cards with distinct colored metrics
    cardValBg: "FFFFFF",
    cardTotalText: "0F172A",
    cardCompletedText: "15803D",
    cardOngoingText: "0369A1",
    cardOverdueText: "B91C1C",
    cardRateText: "334155",
    cardScoreText: "B45309",

    // Row 11 Main Table Headers: Slate 700 (Deep Slate / Charcoal)
    tableHeaderBg: "334155",
    tableHeaderText: "FFFFFF",

    // Data Row Striping
    rowEvenBg: "FFFFFF",
    rowOddBg: "F8FAFC",

    // Status Badges
    statusCompletedBg: "DCFCE7",
    statusCompletedText: "15803D",

    statusOverdueBg: "FEE2E2",
    statusOverdueText: "DC2626",

    statusOngoingBg: "EFF6FF",
    statusOngoingText: "1D4ED8",

    statusIncompleteBg: "FEF3C7",
    statusIncompleteText: "B45309",

    // AI Score & Rating Badges
    scoreHighBg: "DCFCE7",
    scoreHighText: "15803D",
    scoreMidBg: "FEF3C7",
    scoreMidText: "B45309",
    scoreLowBg: "FEE2E2",
    scoreLowText: "DC2626",

    // Summary Footer
    summaryBg: "E2E8F0",
    summaryText: "0F172A",
    summaryBorder: "94A3B8",
  };

  const createCellStyle = (
    bgColor = "FFFFFF",
    textColor = "000000",
    bold = false,
    align = "left",
    sz = 10,
    borderStyle = "thin",
    borderColor = colors.borderColor,
    italic = false,
  ) => ({
    font: { name: "Calibri", bold, italic, color: { rgb: textColor }, sz },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
    border: {
      left: { style: borderStyle, color: { rgb: borderColor } },
      right: { style: borderStyle, color: { rgb: borderColor } },
      top: { style: borderStyle, color: { rgb: borderColor } },
      bottom: { style: borderStyle, color: { rgb: borderColor } },
    },
  });

  const formatDateTimeForExcel = (date) => {
    if (!date) return "Ongoing";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Metrics Calculation
  const totalTasks = metadata.total_tasks || data.length;
  const completedTasks =
    metadata.completed_tasks !== undefined
      ? metadata.completed_tasks
      : data.filter((t) => t.status === "completed").length;
  const ongoingTasks =
    metadata.ongoing_tasks !== undefined
      ? metadata.ongoing_tasks
      : data.filter((t) => t.status === "ongoing").length;
  const overdueTasks = data.filter((t) => getTaskInfo(t).isOverdue).length;
  const completionRate =
    totalTasks > 0
      ? ((completedTasks / totalTasks) * 100).toFixed(1) + "%"
      : "0.0%";
  const avgAiScore =
    data.length > 0
      ? (
          data.reduce((sum, t) => sum + (Number(t.ai_score) || 0), 0) /
          data.length
        ).toFixed(1)
      : "N/A";

  const worksheetData = [];
  const styleMap = {};

  // Row 1: Title (Merged A1:I1)
  const titleRow = [reportTitle.toUpperCase(), "", "", "", "", "", "", "", ""];
  worksheetData.push(titleRow);
  for (let c = 0; c <= 8; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}1`] = {
      font: { name: "Calibri", bold: true, sz: 15, color: { rgb: colors.titleText } },
      fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        bottom: { style: "medium", color: { rgb: colors.titleBorderBottom } },
      },
    };
  }

  // Row 2: Subtitle (Merged A2:I2)
  const subText = `Comprehensive Cleaning Audit & Activity Log | Generated on: ${new Date(
    metadata.generated_on || Date.now(),
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;
  worksheetData.push([subText, "", "", "", "", "", "", "", ""]);
  for (let c = 0; c <= 8; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}2`] = {
      font: { name: "Calibri", italic: true, sz: 9.5, color: { rgb: colors.subtitleText } },
      fill: { fgColor: { rgb: colors.subtitleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        bottom: { style: "thin", color: { rgb: colors.subtitleBorderBottom } },
      },
    };
  }

  // Row 3: Blank spacer
  worksheetData.push([]);

  // Row 4: Scope / Metadata Block
  worksheetData.push([
    "ORGANIZATION",
    metadata.organization || "N/A",
    "",
    "DATE RANGE",
    `${metadata.date_range?.start || "N/A"} to ${metadata.date_range?.end || "N/A"}`,
    "",
    "REPORT TYPE",
    reportTitle,
    "",
  ]);
  const metaRow = worksheetData.length;
  const labelStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.metaLabelText } },
    fill: { fgColor: { rgb: colors.metaLabelBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };
  const valStyle = {
    font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.metaValText } },
    fill: { fgColor: { rgb: colors.metaValBg }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };
  styleMap[`A${metaRow}`] = labelStyle;
  styleMap[`B${metaRow}`] = valStyle;
  styleMap[`C${metaRow}`] = valStyle;

  styleMap[`D${metaRow}`] = labelStyle;
  styleMap[`E${metaRow}`] = valStyle;
  styleMap[`F${metaRow}`] = valStyle;

  styleMap[`G${metaRow}`] = labelStyle;
  styleMap[`H${metaRow}`] = valStyle;
  styleMap[`I${metaRow}`] = valStyle;

  // Row 5: Blank spacer
  worksheetData.push([]);

  // Row 6: KPI Header Banner
  worksheetData.push(["EXECUTIVE SUMMARY & OPERATIONAL METRICS", "", "", "", "", "", "", "", ""]);
  const kpiBannerRow = worksheetData.length;
  for (let c = 0; c <= 8; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}${kpiBannerRow}`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
      },
    };
  }

  // Row 7: KPI Headers
  worksheetData.push([
    "Total Cleanings",
    "",
    "Completed Tasks",
    "",
    "Ongoing Tasks",
    "Overdue Tasks",
    "Completion Rate",
    "Avg AI Score",
    "",
  ]);
  const kpiHeaderRow = worksheetData.length;
  const kpiHdrStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.kpiHeaderText } },
    fill: { fgColor: { rgb: colors.kpiHeaderBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };
  for (let c = 0; c <= 8; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}${kpiHeaderRow}`] = kpiHdrStyle;
  }

  // Row 8: KPI Values
  worksheetData.push([
    totalTasks,
    "",
    completedTasks,
    "",
    ongoingTasks,
    overdueTasks,
    completionRate,
    avgAiScore,
    "",
  ]);
  const kpiValRow = worksheetData.length;
  const createKpiCardValStyle = (textColor) => ({
    font: { name: "Calibri", bold: true, sz: 13, color: { rgb: textColor } },
    fill: { fgColor: { rgb: colors.cardValBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
    },
  });

  styleMap[`A${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
  styleMap[`B${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);

  styleMap[`C${kpiValRow}`] = createKpiCardValStyle(colors.cardCompletedText);
  styleMap[`D${kpiValRow}`] = createKpiCardValStyle(colors.cardCompletedText);

  styleMap[`E${kpiValRow}`] = createKpiCardValStyle(colors.cardOngoingText);
  styleMap[`F${kpiValRow}`] = createKpiCardValStyle(colors.cardOverdueText);
  styleMap[`G${kpiValRow}`] = createKpiCardValStyle(colors.cardRateText);

  styleMap[`H${kpiValRow}`] = createKpiCardValStyle(colors.cardScoreText);
  styleMap[`I${kpiValRow}`] = createKpiCardValStyle(colors.cardScoreText);

  // Row 9: Blank spacer
  worksheetData.push([]);

  // Row 10: Table Header Banner
  worksheetData.push(["CLEANING TASK ACTIVITY LOGS & AUDIT TRAIL", "", "", "", "", "", "", "", ""]);
  const tableBannerRow = worksheetData.length;
  for (let c = 0; c <= 8; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}${tableBannerRow}`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
      },
    };
  }

  // Row 11: Main Column Headers
  const tableHeaders = [
    "Sr. No.",
    "Cleaner Name",
    "Location / Washroom",
    "Start Time",
    "End Time",
    "Duration",
    "AI Score (0-10)",
    "Washroom Rating",
    "Status",
  ];
  worksheetData.push(tableHeaders);
  const tableHeaderRowNum = worksheetData.length;
  tableHeaders.forEach((header, colIdx) => {
    const colLetter = String.fromCharCode(65 + colIdx);
    const align = (colIdx === 1 || colIdx === 2) ? "left" : "center";
    styleMap[`${colLetter}${tableHeaderRowNum}`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.tableHeaderText } },
      fill: { fgColor: { rgb: colors.tableHeaderBg }, patternType: "solid" },
      alignment: { horizontal: align, vertical: "center", wrapText: true },
      border: {
        top: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        bottom: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };
  });

  // Row 12+: Data Rows
  let validScoresSum = 0;
  let validScoresCount = 0;
  let validRatingsSum = 0;
  let validRatingsCount = 0;

  data.forEach((task, idx) => {
    const taskInfo = getTaskInfo(task);
    const isOverdue = taskInfo.isOverdue;
    const durationText = isOverdue ? "Overdue" : taskInfo.durationDisplay;

    const aiScoreNum = Number(task.ai_score);
    if (!isNaN(aiScoreNum) && task.ai_score !== null && task.ai_score !== undefined) {
      validScoresSum += aiScoreNum;
      validScoresCount++;
    }

    const ratingNum = Number(task.washroom_avg_rating);
    if (!isNaN(ratingNum) && task.washroom_avg_rating !== null && task.washroom_avg_rating !== undefined) {
      validRatingsSum += ratingNum;
      validRatingsCount++;
    }

    const dataRow = [
      idx + 1,
      task.cleaner_name || "N/A",
      task.washroom_full_name || "N/A",
      formatDateTimeForExcel(task.task_start_time),
      formatDateTimeForExcel(task.task_end_time),
      durationText,
      !isNaN(aiScoreNum) && task.ai_score !== null && task.ai_score !== undefined
        ? aiScoreNum.toFixed(1)
        : "N/A",
      !isNaN(ratingNum) && task.washroom_avg_rating !== null && task.washroom_avg_rating !== undefined
        ? ratingNum.toFixed(1)
        : "N/A",
      taskInfo.status,
    ];

    const rowNum = worksheetData.length + 1;
    worksheetData.push(dataRow);

    const baseRowBg = idx % 2 === 0 ? "FFFFFF" : colors.rowOddBg;

    dataRow.forEach((cell, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      let cellBg = baseRowBg;
      let cellText = "0F172A";
      let isBold = false;
      let align = "center";
      let borderCol = colors.borderColor;

      if (colIdx === 1 || colIdx === 2) {
        align = "left";
      }
      if (colIdx === 1) {
        isBold = true;
      }

      // Duration Column (Index 5)
      if (colIdx === 5) {
        if (isOverdue) {
          cellBg = colors.statusOverdueBg;
          cellText = colors.statusOverdueText;
          borderCol = colors.statusOverdueBorder;
          isBold = true;
        } else if (taskInfo.isIncomplete) {
          cellBg = colors.statusIncompleteBg;
          cellText = colors.statusIncompleteText;
          borderCol = colors.statusIncompleteBorder;
          isBold = true;
        }
      }

      // AI Score Column (Index 6)
      if (colIdx === 6 && !isNaN(aiScoreNum) && task.ai_score !== null) {
        isBold = true;
        if (aiScoreNum >= 8.0) {
          cellBg = colors.scoreHighBg;
          cellText = colors.scoreHighText;
        } else if (aiScoreNum >= 6.0) {
          cellBg = colors.scoreMidBg;
          cellText = colors.scoreMidText;
        } else {
          cellBg = colors.scoreLowBg;
          cellText = colors.scoreLowText;
        }
      }

      // Washroom Rating Column (Index 7)
      if (colIdx === 7 && !isNaN(ratingNum) && task.washroom_avg_rating !== null) {
        isBold = true;
        if (ratingNum >= 8.0) {
          cellBg = colors.scoreHighBg;
          cellText = colors.scoreHighText;
        } else if (ratingNum >= 6.0) {
          cellBg = colors.scoreMidBg;
          cellText = colors.scoreMidText;
        } else {
          cellBg = colors.scoreLowBg;
          cellText = colors.scoreLowText;
        }
      }

      // Status Column (Index 8)
      if (colIdx === 8) {
        isBold = true;
        if (taskInfo.status === "COMPLETED") {
          cellBg = colors.statusCompletedBg;
          cellText = colors.statusCompletedText;
          borderCol = colors.statusCompletedBorder;
        } else if (taskInfo.status === "OVERDUE") {
          cellBg = colors.statusOverdueBg;
          cellText = colors.statusOverdueText;
          borderCol = colors.statusOverdueBorder;
        } else if (taskInfo.status === "INCOMPLETE") {
          cellBg = colors.statusIncompleteBg;
          cellText = colors.statusIncompleteText;
          borderCol = colors.statusIncompleteBorder;
        } else if (taskInfo.status === "ONGOING") {
          cellBg = colors.statusOngoingBg;
          cellText = colors.statusOngoingText;
          borderCol = colors.statusOngoingBorder;
        }
      }

      styleMap[`${colLetter}${rowNum}`] = createCellStyle(
        cellBg,
        cellText,
        isBold,
        align,
        10,
        "thin",
        borderCol,
      );
    });
  });

  // Summary Row at Bottom
  const finalAvgAiScore =
    validScoresCount > 0 ? (validScoresSum / validScoresCount).toFixed(1) : "N/A";
  const finalAvgRating =
    validRatingsCount > 0 ? (validRatingsSum / validRatingsCount).toFixed(1) : "N/A";

  const summaryRow = [
    "",
    "TOTAL / OVERALL AVERAGES",
    `${data.length} Total Cleanings`,
    "",
    "",
    `${completedTasks} Completed / ${overdueTasks} Overdue`,
    finalAvgAiScore,
    finalAvgRating,
    completionRate,
  ];
  const summaryRowNum = worksheetData.length + 1;
  worksheetData.push(summaryRow);

  summaryRow.forEach((cell, colIdx) => {
    const colLetter = String.fromCharCode(65 + colIdx);
    const align = colIdx === 1 ? "left" : "center";
    styleMap[`${colLetter}${summaryRowNum}`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.summaryText } },
      fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
      alignment: { horizontal: align, vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: colors.summaryBorder } },
        bottom: { style: "double", color: { rgb: colors.summaryBorder } },
        left: { style: "thin", color: { rgb: colors.summaryBorder } },
        right: { style: "thin", color: { rgb: colors.summaryBorder } },
      },
    };
  });

  // Create Workbook & Sheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column Widths
  ws["!cols"] = [
    { wch: 15 }, // Sr. No.
    { wch: 28 }, // Cleaner Name
    { wch: 42 }, // Location / Washroom
    { wch: 24 }, // Start Time
    { wch: 24 }, // End Time
    { wch: 16 }, // Duration
    { wch: 16 }, // AI Score
    { wch: 18 }, // Washroom Rating
    { wch: 18 }, // Status
  ];

  // Row Heights
  const rowHeights = [
    { hpt: 34 }, // Row 1 Title
    { hpt: 22 }, // Row 2 Subtitle
    { hpt: 12 }, // Row 3 Spacer
    { hpt: 25 }, // Row 4 Scope
    { hpt: 12 }, // Row 5 Spacer
    { hpt: 24 }, // Row 6 KPI Banner
    { hpt: 22 }, // Row 7 KPI Headers
    { hpt: 28 }, // Row 8 KPI Values
    { hpt: 12 }, // Row 9 Spacer
    { hpt: 24 }, // Row 10 Table Banner
    { hpt: 27 }, // Row 11 Table Headers
  ];
  for (let i = 0; i < data.length; i++) {
    rowHeights.push({ hpt: 22 });
  }
  rowHeights.push({ hpt: 26 }); // Summary row
  ws["!rows"] = rowHeights;

  // Merges
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // Subtitle
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } }, // Org val
    { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } }, // Date Range val
    { s: { r: 3, c: 7 }, e: { r: 3, c: 8 } }, // Report Type val
    { s: { r: 5, c: 0 }, e: { r: 5, c: 8 } }, // KPI Banner
    { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }, // KPI Header 1
    { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }, // KPI Val 1
    { s: { r: 6, c: 2 }, e: { r: 6, c: 3 } }, // KPI Header 2
    { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } }, // KPI Val 2
    { s: { r: 6, c: 7 }, e: { r: 6, c: 8 } }, // KPI Header 6
    { s: { r: 7, c: 7 }, e: { r: 7, c: 8 } }, // KPI Val 6
    { s: { r: 9, c: 0 }, e: { r: 9, c: 8 } }, // Table Banner
  ];

  // Apply Styles to Sheet
  Object.keys(styleMap).forEach((cellRef) => {
    if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
    ws[cellRef].s = styleMap[cellRef];
  });

  XLSX.utils.book_append_sheet(wb, ws, "Daily Cleaning Report");

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

const createImageLinksText = (images) => {
  if (!images || images.length === 0) return "No images";
  return images.map((_, idx) => `Img${idx + 1}`).join(", ");
};

const exportDetailedCleaningReport = (data, metadata, format = "pdf") => {
  const reportTitle =
    metadata.dynamic_report_name ||
    metadata.report_type ||
    "Detailed Cleaning Report";

  // Common data processing
  const avgAiScore =
    data.length > 0
      ? data.reduce((sum, t) => sum + (t.ai_score || 0), 0) / data.length
      : 0;
  const totalImages = data.reduce(
    (sum, t) =>
      sum + (t.before_photo?.length || 0) + (t.after_photo?.length || 0),
    0,
  );

  const completedTasks = data.filter((t) => t.status === "completed").length;
  const ongoingTasks = data.length - completedTasks;

  // Helper: Format date range display (NEVER "Beginning to Now")
  const getDateRangeDisplay = () => {
    let startDate = metadata?.date_range?.start;
    let endDate = metadata?.date_range?.end;

    const isInvalid = (val) => !val || val === "Beginning" || val === "Now" || val === "N/A";

    if ((isInvalid(startDate) || isInvalid(endDate)) && Array.isArray(data) && data.length > 0) {
      const timestamps = data
        .map((item) => {
          const t = item.task_start_time || item.created_at || item.start_time || item.date;
          return t ? new Date(t).getTime() : NaN;
        })
        .filter((t) => !isNaN(t));

      if (timestamps.length > 0) {
        if (isInvalid(startDate)) {
          startDate = new Date(Math.min(...timestamps)).toISOString().split("T")[0];
        }
        if (isInvalid(endDate)) {
          endDate = new Date(Math.max(...timestamps)).toISOString().split("T")[0];
        }
      }
    }

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now" || dateStr === "N/A") return null;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    const todayFormatted = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (formattedStart && formattedEnd) {
      if (formattedStart === formattedEnd) {
        return formattedStart;
      }
      return `${formattedStart} to ${formattedEnd}`;
    }

    if (formattedStart) {
      return formattedStart === todayFormatted ? formattedStart : `${formattedStart} to ${todayFormatted}`;
    }

    if (formattedEnd) {
      return formattedEnd;
    }

    return todayFormatted;
  };

  const dateRangeDisplay = getDateRangeDisplay();

  const formatDateTimeForReport = (date) => {
    if (!date) return "Ongoing";
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Main table data with image links text (10 columns, Average Rating removed)
  const tableData = data.map((task, index) => {
    const taskInfo = getTaskInfo(task);
    const beforeImages = task.before_photo || [];
    const afterImages = task.after_photo || [];

    return [
      index + 1,
      task.cleaner_name || "N/A",
      task.zone_name || "N/A",
      task.washroom_name || task.washroom_full_name || "N/A",
      formatDateTimeForReport(task.task_start_time),
      formatDateTimeForReport(task.task_end_time),
      formatScore(task.ai_score),
      taskInfo.status,
      createImageLinksText(beforeImages.slice(0, 6)), // Before images column (index 8)
      createImageLinksText(afterImages.slice(0, 6)), // After images column (index 9)
    ];
  });

  // ==================== PDF EXPORT ====================
  if (format === "pdf") {
    const doc = new jsPDF("l", "mm", "a4");
    let currentY = 25;

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(reportTitle, 14, 15);

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 283, 18);

    // Metadata table
    autoTable(doc, {
      head: [["Organization", "Report Type", "Date Range", "Generated On"]],
      body: [
        [
          metadata.organization || "N/A",
          reportTitle,
          dateRangeDisplay,
          new Date(metadata.generated_on || Date.now()).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 3;

    // Statistics table (Avg Final Rating removed)
    autoTable(doc, {
      head: [
        [
          "Total Reviews",
          "Completed",
          "Ongoing",
          "Avg AI Score",
          "Total Images",
        ],
      ],
      body: [
        [
          data.length,
          completedTasks,
          ongoingTasks,
          avgAiScore.toFixed(1),
          totalImages,
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
        fontStyle: "bold",
        fillColor: [236, 253, 245],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    // Main details heading
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Cleaning Details with Image Links", 14, currentY);
    currentY += 3;

    // ✅ Store cell positions for overlaying clickable links
    let cellPositions = [];

    // Main table (10 columns, no Average Rating)
    autoTable(doc, {
      head: [
        [
          "#",
          "Cleaner",
          "Zone Name",
          "Location",
          "Start Time",
          "End Time",
          "AI Score",
          "Status",
          "Before Images",
          "After Images",
        ],
      ],
      body: tableData,
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        4: { halign: "center", cellWidth: 26 },
        5: { halign: "center", cellWidth: 26 },
        6: { halign: "center", cellWidth: 16 },
        7: { halign: "center", fontStyle: "bold", cellWidth: 20 },
        8: {
          halign: "center",
          textColor: [37, 99, 235],
          fontStyle: "italic",
          cellWidth: 38,
        },
        9: {
          halign: "center",
          textColor: [22, 163, 74],
          fontStyle: "italic",
          cellWidth: 38,
        },
      },
      didDrawCell: function (cellData) {
        // ✅ Color status cells (col 7)
        if (cellData.column.index === 7 && cellData.section === "body") {
          const status = tableData[cellData.row.index][7];
          if (status === "COMPLETED") {
            doc.setTextColor(22, 163, 74);
          } else if (status === "INCOMPLETE") {
            doc.setTextColor(234, 179, 8);
          } else if (status === "OVERDUE") {
            doc.setTextColor(220, 38, 38);
          }
        }

        // ✅ Store positions of image cells (columns 8 and 9)
        if (
          cellData.section === "body" &&
          (cellData.column.index === 8 || cellData.column.index === 9)
        ) {
          cellPositions.push({
            rowIndex: cellData.row.index,
            colIndex: cellData.column.index,
            x: cellData.cell.x,
            y: cellData.cell.y,
            width: cellData.cell.width,
            height: cellData.cell.height,
            pageNumber: doc.internal.getCurrentPageInfo().pageNumber,
          });
        }
      },
      margin: { left: 14, right: 14 },
    });

    // ✅ FIXED: Add clickable link rectangles over each "ImgX" text
    data.forEach((task, taskIndex) => {
      const beforeImages = task.before_photo || [];
      const afterImages = task.after_photo || [];

      // Find cells for this row
      const beforeCell = cellPositions.find(
        (c) => c.rowIndex === taskIndex && c.colIndex === 8,
      );
      const afterCell = cellPositions.find(
        (c) => c.rowIndex === taskIndex && c.colIndex === 9,
      );

      // Set font for width calculation
      doc.setFontSize(7);

      // Add links for BEFORE images
      if (beforeCell && beforeImages.length > 0) {
        // Go to the correct page
        doc.setPage(beforeCell.pageNumber);

        const textParts = beforeImages.map((_, idx) => `Img${idx + 1}`);
        const fullText = textParts.join(", ");
        const textWidth = doc.getTextWidth(fullText);
        const startX = beforeCell.x + (beforeCell.width - textWidth) / 2;
        const linkY = beforeCell.y + beforeCell.height / 2 - 1;

        let currentX = startX;
        beforeImages.forEach((url, idx) => {
          const linkText = `Img${idx + 1}`;
          const linkWidth = doc.getTextWidth(linkText);

          // Add clickable link rectangle
          doc.link(currentX, linkY, linkWidth, 3.5, { url: url });

          // Move to next position (add width + comma + space)
          currentX += linkWidth;
          if (idx < beforeImages.length - 1) {
            currentX += doc.getTextWidth(", ");
          }
        });
      }

      // Add links for AFTER images
      if (afterCell && afterImages.length > 0) {
        // Go to the correct page
        doc.setPage(afterCell.pageNumber);

        const textParts = afterImages.map((_, idx) => `Img${idx + 1}`);
        const fullText = textParts.join(", ");
        const textWidth = doc.getTextWidth(fullText);
        const startX = afterCell.x + (afterCell.width - textWidth) / 2;
        const linkY = afterCell.y + afterCell.height / 2 - 1;

        let currentX = startX;
        afterImages.forEach((url, idx) => {
          const linkText = `Img${idx + 1}`;
          const linkWidth = doc.getTextWidth(linkText);

          // Add clickable link rectangle
          doc.link(currentX, linkY, linkWidth, 3.5, { url: url });

          // Move to next position
          currentX += linkWidth;
          if (idx < afterImages.length - 1) {
            currentX += doc.getTextWidth(", ");
          }
        });
      }
    });

    // Add note
    currentY = doc.lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Note: Image links (Img1, Img2, etc.) in the table are clickable. Full URLs available in Excel export.",
      14,
      currentY,
    );

    //  addLogosToAllPages(doc);

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100);
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: "center" },
      );
      doc.text(
        `Generated on ${new Date().toLocaleString("en-IN")}`,
        14,
        doc.internal.pageSize.height - 10,
      );
    }

    const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    outputPdf(doc, fileName);
    console.log(`✅ PDF file exported: ${fileName}`);
  }

  // ==================== EXCEL EXPORT (REFINED EXECUTIVE THEME) ====================
  else if (format === "excel") {
    const colors = {
      titleBg: "F1F5F9",
      titleText: "0F172A",
      titleBorderBottom: "2563EB",
      subtitleBg: "F8FAFC",
      subtitleText: "475569",
      subtitleBorderBottom: "CBD5E1",
      metaLabelBg: "F1F5F9",
      metaLabelText: "334155",
      metaValBg: "FFFFFF",
      metaValText: "0F172A",
      bannerBg: "F1F5F9",
      bannerText: "1E293B",
      bannerBorderBottom: "94A3B8",
      kpiHeaderBg: "F8FAFC",
      kpiHeaderText: "64748B",
      cardValBg: "FFFFFF",
      cardTotalText: "0F172A",
      cardCompletedText: "16A34A",
      cardOngoingText: "2563EB",
      cardScoreText: "059669",
      cardImagesText: "7C3AED",
      tableHeaderBg: "334155",
      tableHeaderText: "FFFFFF",
      borderColor: "E2E8F0",
      rowOddBg: "F8FAFC",
      statusCompletedBg: "DCFCE7",
      statusCompletedText: "166534",
      statusOngoingBg: "EFF6FF",
      statusOngoingText: "1E40AF",
      statusOverdueBg: "FEE2E2",
      statusOverdueText: "991B1B",
      statusIncompleteBg: "FEF3C7",
      statusIncompleteText: "92400E",
      scoreGreenBg: "DCFCE7",
      scoreGreenText: "166534",
      scoreAmberBg: "FEF3C7",
      scoreAmberText: "92400E",
      scoreRedBg: "FEE2E2",
      scoreRedText: "991B1B",
    };

    const styleMap = {};
    const worksheetData = [];

    // Row 1: Merged Title (A1:J1)
    worksheetData.push([reportTitle.toUpperCase(), "", "", "", "", "", "", "", "", ""]);
    for (let c = 0; c <= 9; c++) {
      const col = String.fromCharCode(65 + c);
      styleMap[`${col}1`] = {
        font: { name: "Calibri", bold: true, sz: 14, color: { rgb: colors.titleText } },
        fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          bottom: { style: "thick", color: { rgb: colors.titleBorderBottom } },
        },
      };
    }

    // Row 2: Subtitle (A2:J2)
    const genDateStr = new Date(metadata.generated_on || Date.now()).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    const subText = `Comprehensive Cleaning Audit & Activity Log | Generated on: ${genDateStr}`;
    worksheetData.push([subText, "", "", "", "", "", "", "", "", ""]);
    for (let c = 0; c <= 9; c++) {
      const col = String.fromCharCode(65 + c);
      styleMap[`${col}2`] = {
        font: { name: "Calibri", italic: true, sz: 9.5, color: { rgb: colors.subtitleText } },
        fill: { fgColor: { rgb: colors.subtitleBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          bottom: { style: "thin", color: { rgb: colors.subtitleBorderBottom } },
        },
      };
    }

    // Row 3: Blank spacer
    worksheetData.push([]);

    // Row 4: Scope / Metadata Block (A4:J4)
    worksheetData.push([
      "ORGANIZATION",
      metadata.organization || "N/A",
      "",
      "",
      "DATE RANGE",
      dateRangeDisplay,
      "",
      "REPORT TYPE",
      reportTitle,
      "",
    ]);
    const metaRow = worksheetData.length;
    const labelStyle = {
      font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.metaLabelText } },
      fill: { fgColor: { rgb: colors.metaLabelBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };
    const valStyle = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.metaValText } },
      fill: { fgColor: { rgb: colors.metaValBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    styleMap[`A${metaRow}`] = labelStyle;
    styleMap[`B${metaRow}`] = valStyle;
    styleMap[`C${metaRow}`] = valStyle;
    styleMap[`D${metaRow}`] = valStyle;

    styleMap[`E${metaRow}`] = labelStyle;
    styleMap[`F${metaRow}`] = valStyle;
    styleMap[`G${metaRow}`] = valStyle;

    styleMap[`H${metaRow}`] = labelStyle;
    styleMap[`I${metaRow}`] = valStyle;
    styleMap[`J${metaRow}`] = valStyle;

    // Row 5: Blank spacer
    worksheetData.push([]);

    // Row 6: KPI Header Banner
    worksheetData.push(["EXECUTIVE SUMMARY & OPERATIONAL METRICS", "", "", "", "", "", "", "", "", ""]);
    const kpiBannerRow = worksheetData.length;
    for (let c = 0; c <= 9; c++) {
      const col = String.fromCharCode(65 + c);
      styleMap[`${col}${kpiBannerRow}`] = {
        font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
        fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
        },
      };
    }

    // Row 7: KPI Headers
    worksheetData.push([
      "Total Reviews",
      "",
      "Completed Tasks",
      "",
      "Ongoing Tasks",
      "",
      "Avg AI Score",
      "",
      "Total Evidence Images",
      "",
    ]);
    const kpiHeaderRow = worksheetData.length;
    const kpiHdrStyle = {
      font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.kpiHeaderText } },
      fill: { fgColor: { rgb: colors.kpiHeaderBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };
    for (let c = 0; c <= 9; c++) {
      const col = String.fromCharCode(65 + c);
      styleMap[`${col}${kpiHeaderRow}`] = kpiHdrStyle;
    }

    // Row 8: KPI Values
    worksheetData.push([
      data.length,
      "",
      completedTasks,
      "",
      ongoingTasks,
      "",
      avgAiScore.toFixed(1),
      "",
      totalImages,
      "",
    ]);
    const kpiValRow = worksheetData.length;
    const createKpiCardValStyle = (textColor) => ({
      font: { name: "Calibri", bold: true, sz: 13, color: { rgb: textColor } },
      fill: { fgColor: { rgb: colors.cardValBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
      },
    });

    styleMap[`A${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`B${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`C${kpiValRow}`] = createKpiCardValStyle(colors.cardCompletedText);
    styleMap[`D${kpiValRow}`] = createKpiCardValStyle(colors.cardCompletedText);
    styleMap[`E${kpiValRow}`] = createKpiCardValStyle(colors.cardOngoingText);
    styleMap[`F${kpiValRow}`] = createKpiCardValStyle(colors.cardOngoingText);
    styleMap[`G${kpiValRow}`] = createKpiCardValStyle(colors.cardScoreText);
    styleMap[`H${kpiValRow}`] = createKpiCardValStyle(colors.cardScoreText);
    styleMap[`I${kpiValRow}`] = createKpiCardValStyle(colors.cardImagesText);
    styleMap[`J${kpiValRow}`] = createKpiCardValStyle(colors.cardImagesText);

    // Row 9: Blank spacer
    worksheetData.push([]);

    // Row 10: Table Header Banner
    worksheetData.push(["DETAILED CLEANING AUDIT TRAIL & IMAGE EVIDENCE", "", "", "", "", "", "", "", "", ""]);
    const tableBannerRow = worksheetData.length;
    for (let c = 0; c <= 9; c++) {
      const col = String.fromCharCode(65 + c);
      styleMap[`${col}${tableBannerRow}`] = {
        font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
        fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
        },
      };
    }

    // Row 11: Main Column Headers (10 columns, no Average Rating)
    const tableHeaders = [
      "Sr. No.",
      "Cleaner Name",
      "Zone Name",
      "Location / Washroom",
      "Start Time",
      "End Time",
      "AI Score (0-10)",
      "Status",
      "Before Images",
      "After Images",
    ];
    worksheetData.push(tableHeaders);
    const tableHeaderRowNum = worksheetData.length;
    tableHeaders.forEach((header, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      const align = (colIdx === 1 || colIdx === 2 || colIdx === 3) ? "left" : "center";
      styleMap[`${colLetter}${tableHeaderRowNum}`] = {
        font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.tableHeaderText } },
        fill: { fgColor: { rgb: colors.tableHeaderBg }, patternType: "solid" },
        alignment: { horizontal: align, vertical: "center", wrapText: true },
        border: {
          top: { style: "medium", color: { rgb: colors.tableHeaderBg } },
          bottom: { style: "medium", color: { rgb: colors.tableHeaderBg } },
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };
    });

    // Row 12+: Data Rows
    let validScoresSum = 0;
    let validScoresCount = 0;

    const dataStartRowNum = worksheetData.length + 1;
    data.forEach((task, idx) => {
      const taskInfo = getTaskInfo(task);
      const beforeImages = task.before_photo || [];
      const afterImages = task.after_photo || [];

      const aiScoreNum = Number(task.ai_score);
      if (!isNaN(aiScoreNum) && task.ai_score !== null && task.ai_score !== undefined) {
        validScoresSum += aiScoreNum;
        validScoresCount++;
      }

      const beforeText = createImageLinksText(beforeImages.slice(0, 6)) || "None";
      const afterText = createImageLinksText(afterImages.slice(0, 6)) || "None";

      const dataRow = [
        idx + 1,
        task.cleaner_name || "N/A",
        task.zone_name || "N/A",
        task.washroom_name || task.washroom_full_name || "N/A",
        formatDateTimeForReport(task.task_start_time),
        formatDateTimeForReport(task.task_end_time),
        !isNaN(aiScoreNum) && task.ai_score !== null && task.ai_score !== undefined
          ? aiScoreNum.toFixed(1)
          : "N/A",
        taskInfo.status,
        beforeText,
        afterText,
      ];

      const rowNum = worksheetData.length + 1;
      worksheetData.push(dataRow);

      const baseRowBg = idx % 2 === 0 ? "FFFFFF" : colors.rowOddBg;

      // Col A: Sr No
      styleMap[`A${rowNum}`] = {
        font: { name: "Calibri", sz: 9.5 },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col B: Cleaner Name
      styleMap[`B${rowNum}`] = {
        font: { name: "Calibri", sz: 9.5, bold: true },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col C: Zone Name
      styleMap[`C${rowNum}`] = {
        font: { name: "Calibri", sz: 9.5 },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col D: Location / Washroom
      styleMap[`D${rowNum}`] = {
        font: { name: "Calibri", sz: 9.5 },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "left", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col E: Start Time
      styleMap[`E${rowNum}`] = {
        font: { name: "Calibri", sz: 9 },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col F: End Time
      styleMap[`F${rowNum}`] = {
        font: { name: "Calibri", sz: 9 },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col G: AI Score Pill
      let scoreBg = baseRowBg;
      let scoreText = "0F172A";
      if (!isNaN(aiScoreNum) && task.ai_score !== null && task.ai_score !== undefined) {
        if (aiScoreNum >= 7.5) {
          scoreBg = colors.scoreGreenBg;
          scoreText = colors.scoreGreenText;
        } else if (aiScoreNum >= 6.0) {
          scoreBg = colors.scoreAmberBg;
          scoreText = colors.scoreAmberText;
        } else {
          scoreBg = colors.scoreRedBg;
          scoreText = colors.scoreRedText;
        }
      }
      styleMap[`G${rowNum}`] = {
        font: { name: "Calibri", sz: 9.5, bold: true, color: { rgb: scoreText } },
        fill: { fgColor: { rgb: scoreBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col H: Status Pill
      let statusBg = baseRowBg;
      let statusText = "0F172A";
      if (taskInfo.status === "COMPLETED") {
        statusBg = colors.statusCompletedBg;
        statusText = colors.statusCompletedText;
      } else if (taskInfo.status === "OVERDUE") {
        statusBg = colors.statusOverdueBg;
        statusText = colors.statusOverdueText;
      } else if (taskInfo.status === "INCOMPLETE") {
        statusBg = colors.statusIncompleteBg;
        statusText = colors.statusIncompleteText;
      } else {
        statusBg = colors.statusOngoingBg;
        statusText = colors.statusOngoingText;
      }
      styleMap[`H${rowNum}`] = {
        font: { name: "Calibri", sz: 9, bold: true, color: { rgb: statusText } },
        fill: { fgColor: { rgb: statusBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col I: Before Images
      styleMap[`I${rowNum}`] = {
        font: { name: "Calibri", sz: 9, italic: true, color: { rgb: beforeImages.length > 0 ? "2563EB" : "94A3B8" } },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };

      // Col J: After Images
      styleMap[`J${rowNum}`] = {
        font: { name: "Calibri", sz: 9, italic: true, color: { rgb: afterImages.length > 0 ? "16A34A" : "94A3B8" } },
        fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };
    });

    // Summary Row
    const overallAvgScore = validScoresCount > 0 ? (validScoresSum / validScoresCount).toFixed(1) : "N/A";
    worksheetData.push([
      "TOTALS / OVERALL AVERAGE",
      "",
      "",
      "",
      "",
      `${data.length} Tasks Logged`,
      overallAvgScore,
      `${completedTasks} Completed`,
      `${totalImages} Images Total`,
      "",
    ]);
    const summaryRowNum = worksheetData.length;
    for (let c = 0; c <= 9; c++) {
      const colLetter = String.fromCharCode(65 + c);
      styleMap[`${colLetter}${summaryRowNum}`] = {
        font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.bannerText } },
        fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
        alignment: { horizontal: c === 0 ? "left" : "center", vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
          bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Apply Merges
    ws["!merges"] = [
      // Title
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
      // Subtitle
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
      // Scope block
      { s: { r: metaRow - 1, c: 1 }, e: { r: metaRow - 1, c: 3 } }, // Org val B-D
      { s: { r: metaRow - 1, c: 5 }, e: { r: metaRow - 1, c: 6 } }, // Date val F-G
      { s: { r: metaRow - 1, c: 8 }, e: { r: metaRow - 1, c: 9 } }, // Report type val I-J
      // KPI Banner
      { s: { r: kpiBannerRow - 1, c: 0 }, e: { r: kpiBannerRow - 1, c: 9 } },
      // KPI Headers
      { s: { r: kpiHeaderRow - 1, c: 0 }, e: { r: kpiHeaderRow - 1, c: 1 } },
      { s: { r: kpiHeaderRow - 1, c: 2 }, e: { r: kpiHeaderRow - 1, c: 3 } },
      { s: { r: kpiHeaderRow - 1, c: 4 }, e: { r: kpiHeaderRow - 1, c: 5 } },
      { s: { r: kpiHeaderRow - 1, c: 6 }, e: { r: kpiHeaderRow - 1, c: 7 } },
      { s: { r: kpiHeaderRow - 1, c: 8 }, e: { r: kpiHeaderRow - 1, c: 9 } },
      // KPI Values
      { s: { r: kpiValRow - 1, c: 0 }, e: { r: kpiValRow - 1, c: 1 } },
      { s: { r: kpiValRow - 1, c: 2 }, e: { r: kpiValRow - 1, c: 3 } },
      { s: { r: kpiValRow - 1, c: 4 }, e: { r: kpiValRow - 1, c: 5 } },
      { s: { r: kpiValRow - 1, c: 6 }, e: { r: kpiValRow - 1, c: 7 } },
      { s: { r: kpiValRow - 1, c: 8 }, e: { r: kpiValRow - 1, c: 9 } },
      // Table Banner
      { s: { r: tableBannerRow - 1, c: 0 }, e: { r: tableBannerRow - 1, c: 9 } },
      // Summary Row
      { s: { r: summaryRowNum - 1, c: 0 }, e: { r: summaryRowNum - 1, c: 3 } }, // A-D
      { s: { r: summaryRowNum - 1, c: 8 }, e: { r: summaryRowNum - 1, c: 9 } }, // I-J
    ];

    // Column widths
    ws["!cols"] = [
      { wch: 8 },  // Sr No
      { wch: 22 }, // Cleaner
      { wch: 18 }, // Zone Name
      { wch: 32 }, // Washroom
      { wch: 22 }, // Start Time
      { wch: 22 }, // End Time
      { wch: 16 }, // AI Score
      { wch: 16 }, // Status
      { wch: 28 }, // Before Images
      { wch: 28 }, // After Images
    ];

    // Apply styles to all cells in ws
    Object.keys(styleMap).forEach((cellRef) => {
      if (!ws[cellRef]) {
        ws[cellRef] = { t: "s", v: "" };
      }
      ws[cellRef].s = styleMap[cellRef];
    });

    // Add clickable hyperlinks for Before and After images
    data.forEach((task, dataIndex) => {
      const excelRowIndex = dataStartRowNum + dataIndex;
      const beforeImages = task.before_photo || [];
      const afterImages = task.after_photo || [];

      const beforeCellRef = `I${excelRowIndex}`;
      if (beforeImages.length > 0 && ws[beforeCellRef]) {
        ws[beforeCellRef].l = {
          Target: beforeImages[0],
          Tooltip: "Click to open image evidence",
        };
      }

      const afterCellRef = `J${excelRowIndex}`;
      if (afterImages.length > 0 && ws[afterCellRef]) {
        ws[afterCellRef].l = {
          Target: afterImages[0],
          Tooltip: "Click to open image evidence",
        };
      }
    });

    // Add separate sheet with full image URLs
    const imageUrlsData = [["Image URLs Reference"], []];

    data.forEach((task, taskIndex) => {
      const beforeImages = task.before_photo || [];
      const afterImages = task.after_photo || [];

      if (beforeImages.length > 0 || afterImages.length > 0) {
        imageUrlsData.push([`Task ${taskIndex + 1} - ${task.cleaner_name || "Unknown"} (${task.washroom_name || "Washroom"})`]);
        imageUrlsData.push([]);

        if (beforeImages.length > 0) {
          imageUrlsData.push(["Before Images"]);
          beforeImages.forEach((url, idx) => {
            imageUrlsData.push([`Image ${idx + 1}`, url]);
          });
          imageUrlsData.push([]);
        }

        if (afterImages.length > 0) {
          imageUrlsData.push(["After Images"]);
          afterImages.forEach((url, idx) => {
            imageUrlsData.push([`Image ${idx + 1}`, url]);
          });
          imageUrlsData.push([]);
        }
      }
    });

    const wsUrls = XLSX.utils.aoa_to_sheet(imageUrlsData);
    wsUrls["!cols"] = [{ wch: 35 }, { wch: 80 }];

    XLSX.utils.book_append_sheet(wb, ws, "Detailed Report");
    XLSX.utils.book_append_sheet(wb, wsUrls, "Image URLs");

    const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    console.log(`✅ Excel file exported: ${fileName}`);
  }
};

const getScoreColor = (score) => {
  if (!score && score !== 0)
    return { fillColor: [226, 232, 240], textColor: [100, 116, 139] };
  if (score >= 9)
    return { fillColor: [187, 247, 208], textColor: [20, 83, 45] }; // Green
  if (score >= 8)
    return { fillColor: [187, 247, 208], textColor: [22, 101, 52] }; // Light Green
  if (score >= 7)
    return { fillColor: [254, 243, 199], textColor: [113, 63, 18] }; // Yellow
  if (score >= 6)
    return { fillColor: [254, 215, 170], textColor: [124, 45, 18] }; // Orange
  return { fillColor: [254, 202, 202], textColor: [127, 29, 29] }; // Red
};

// ==================== FIXED HYGIENE TREND PDF EXPORT ====================

const exportHygieneTrendToPDF = (data, metadata) => {
  const reportTitle =
    metadata?.dynamic_report_name ||
    metadata?.report_type ||
    "Hygiene Trend Report";
  const doc = new jsPDF("l", "mm", "a4");
  let currentY = 25;

  // ============ HEADER ============
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(reportTitle, 14, 15);

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, 18, 283, 18);

  // ============ EXTRACT DATE COLUMNS FROM DATA ============
  let dateColumns = [];
  if (data && data.length > 0 && data[0].daily_scores) {
    dateColumns = Object.keys(data[0].daily_scores).sort();

    dateColumns = dateColumns.map((dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
      ];
      const month = monthNames[date.getMonth()];
      return { key: dateStr, label: `${day} ${month}` };
    });
  }

  // ============ SORT DATA BY ACTIVITY ============
  const sortedData = [...(data || [])].sort((a, b) => {
    const getActiveCount = (w) => {
      if (w.active_days_count !== undefined) return w.active_days_count;
      if (!w.daily_scores) return Number(w.average_score) > 0 ? 1 : 0;
      return Object.values(w.daily_scores).filter((s) => s !== null && s !== undefined).length;
    };
    const aActive = getActiveCount(a);
    const bActive = getActiveCount(b);
    const aHas = aActive > 0 || (Number(a.average_score) || 0) > 0 || (a.total_inspections || 0) > 0;
    const bHas = bActive > 0 || (Number(b.average_score) || 0) > 0 || (b.total_inspections || 0) > 0;

    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    if (aHas && bHas) {
      if (bActive !== aActive) return bActive - aActive;
      const scoreDiff = (Number(b.average_score) || 0) - (Number(a.average_score) || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (a.washroom_name || "").localeCompare(b.washroom_name || "");
    }
    return (a.washroom_name || "").localeCompare(b.washroom_name || "");
  });

  // ============ SUMMARY STATISTICS ============
  const totalWashrooms = metadata?.total_washrooms || sortedData.length || 0;
  const totalDays = dateColumns.length;
  const overallAvgScore = metadata?.overall_avg_score || 0;

  let topPerformer = "N/A",
    topPerformerScore = 0;
  let lowPerformer = "N/A",
    lowPerformerScore = 10;

  if (sortedData.length > 0) {
    const sorted = [...sortedData].sort((a, b) => (Number(b.average_score) || 0) - (Number(a.average_score) || 0));
    topPerformer = sorted[0]?.washroom_name || "N/A";
    topPerformerScore = sorted[0]?.average_score || 0;

    const activeOnly = sortedData.filter((w) => (Number(w.average_score) || 0) > 0);
    if (activeOnly.length > 0) {
      const sortedLow = [...activeOnly].sort((a, b) => (Number(a.average_score) || 0) - (Number(b.average_score) || 0));
      lowPerformer = sortedLow[0]?.washroom_name || "N/A";
      lowPerformerScore = sortedLow[0]?.average_score || 0;
    }
  }

  const excellentCount = sortedData.filter((w) => w.average_score >= 9).length;
  const goodCount = sortedData.filter((w) => w.average_score >= 7 && w.average_score < 9).length;
  const averageCount = sortedData.filter((w) => w.average_score >= 5 && w.average_score < 7).length;
  const poorCount = sortedData.filter((w) => w.average_score < 5).length;

  // ============ METADATA TABLE ============
  autoTable(doc, {
    head: [["Organization", "Date Range", "Total Washrooms", "Generated On"]],
    body: [
      [
        metadata?.organization || "N/A",
        `${metadata?.date_range?.start || "N/A"} to ${metadata?.date_range?.end || "N/A"}`,
        totalWashrooms,
        new Date(metadata?.generated_on).toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      ],
    ],
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 3;

  // ============ STATISTICS SUMMARY TABLE ============
  autoTable(doc, {
    head: [
      [
        "Overall Avg Score",
        "Top Performer",
        "Low Performer",
        "Excellent (9+)",
        "Good (7-9)",
        "Average (5-7)",
        "Poor (<5)",
      ],
    ],
    body: [
      [
        formatScore(overallAvgScore),
        `${topPerformer} (${formatScore(topPerformerScore)})`,
        `${lowPerformer} (${formatScore(lowPerformerScore)})`,
        `${excellentCount} ${excellentCount === 1 ? "Washroom" : "Washrooms"}`,
        `${goodCount} ${goodCount === 1 ? "Washroom" : "Washrooms"}`,
        `${averageCount} ${averageCount === 1 ? "Washroom" : "Washrooms"}`,
        `${poorCount} ${poorCount === 1 ? "Washroom" : "Washrooms"}`,
      ],
    ],
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
      fontStyle: "bold",
      fillColor: [236, 253, 245],
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // ============ MAIN TABLE HEADING ============
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Daily Hygiene Trend - Washroom Wise", 14, currentY);
  currentY += 3;

  // ============ BUILD TABLE DATA (NO CITY COLUMN) ============
  const dailyScoresArray =
    sortedData.map((washroom, index) => {
      const dailyScores = dateColumns.map((dateObj) => {
        return formatScore(washroom.daily_scores?.[dateObj.key]);
      });

      return [
        index + 1,
        washroom.washroom_name,
        washroom.zone_type || "N/A",
        ...dailyScores,
        formatScore(washroom.average_score),
      ];
    });

  // ============ BUILD COLUMN HEADERS (NO CITY COLUMN) ============
  const tableHeaders = [
    "Sr",
    "Washroom",
    "Zone",
    ...dateColumns.map((d) => d.label),
    "Avg",
  ];

  // ============ DYNAMIC COLUMN WIDTHS ============
  const dateColumnCount = Math.max(1, dateColumns.length);
  const pageWidth = doc.internal.pageSize.getWidth();
  const availableWidth = pageWidth - 28; // 14mm left + 14mm right margin
  const srWidth = 8;
  const zoneWidth = 22;
  const avgWidth = 11;
  const baseWashroomWidth = 46;
  const remainingWidth =
    availableWidth - (srWidth + baseWashroomWidth + zoneWidth + avgWidth);
  const dateColumnWidth = Math.max(5.5, remainingWidth / dateColumnCount);
  const washroomWidth = Math.max(
    36,
    availableWidth -
      (srWidth + zoneWidth + avgWidth + dateColumnWidth * dateColumns.length),
  );

  const columnStyles = {
    0: { halign: "center", cellWidth: srWidth },
    1: { halign: "left", cellWidth: washroomWidth },
    2: { halign: "center", cellWidth: zoneWidth },
  };

  // Add date column styles starting at index 3
  dateColumns.forEach((_, idx) => {
    columnStyles[3 + idx] = {
      halign: "center",
      cellWidth: dateColumnWidth,
      fontSize: 5.5,
    };
  });

  // Average column
  columnStyles[3 + dateColumns.length] = {
    halign: "center",
    cellWidth: avgWidth,
    fontStyle: "bold",
  };

  // ============ MAIN TABLE WITH COLOR CODING ============
  autoTable(doc, {
    head: [tableHeaders],
    body: dailyScoresArray,
    startY: currentY,
    tableWidth: availableWidth,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 5.5,
      halign: "center",
      cellPadding: 1,
    },
    bodyStyles: {
      fontSize: 5.5,
      textColor: 50,
      cellPadding: 1,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: columnStyles,
    didDrawCell: function (cellData) {
      const columnIndex = cellData.column.index;
      const isDateColumn =
        columnIndex >= 3 && columnIndex < 3 + dateColumns.length;
      const isAvgColumn = columnIndex === 3 + dateColumns.length;

      if ((isDateColumn || isAvgColumn) && cellData.section === "body") {
        const scoreValue = dailyScoresArray[cellData.row.index]?.[columnIndex];

        if (scoreValue && scoreValue !== "N/A" && scoreValue !== "-") {
          const numScore = parseFloat(scoreValue);
          const colors = getScoreColor(numScore);

          doc.setFillColor(...colors.fillColor);
          doc.rect(
            cellData.cell.x,
            cellData.cell.y,
            cellData.cell.width,
            cellData.cell.height,
            "F",
          );

          doc.setTextColor(...colors.textColor);
          doc.setFontSize(5.5);
          if (isAvgColumn) {
            doc.setFont("helvetica", "bold");
          }
          doc.text(
            scoreValue.toString(),
            cellData.cell.x + cellData.cell.width / 2,
            cellData.cell.y + cellData.cell.height / 2 + 1,
            { align: "center", baseline: "middle" },
          );
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  // ============ FOOTER ============
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} - Confidential - Tadoba Smart Washroom Management`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: "center" },
    );
  }

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

// ✅ EXPORT WASHROOM HYGIENE TREND TO EXCEL - REFINED EXECUTIVE THEME
const exportHygieneTrendToExcel = (data, metadata) => {
  const reportTitle =
    metadata?.dynamic_report_name ||
    metadata?.report_type ||
    "Washroom Daily Scores Report";

  // Helper: Format date range display
  const getDateRangeDisplay = () => {
    const startDate = metadata?.date_range?.start;
    const endDate = metadata?.date_range?.end;

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now") return dateStr;
      try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
      return "Beginning to Now";
    }

    if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
      return `${formatDate(startDate)} to ${new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}`;
    }

    if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
      return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
    }

    if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
      return `Beginning to ${formatDate(endDate)}`;
    }

    return "Date Range Not Specified";
  };

  // 1. Determine Date Columns
  let dateColumns = [];
  if (data && data.length > 0 && data[0].daily_scores) {
    const rawKeys = Object.keys(data[0].daily_scores);
    dateColumns = rawKeys.map((key, idx) => {
      let label = metadata?.date_columns?.[idx];
      if (!label) {
        const d = new Date(key);
        label = !isNaN(d.getTime())
          ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
          : key;
      }
      return { key, label };
    });
  } else if (metadata?.date_columns && metadata.date_columns.length > 0) {
    dateColumns = metadata.date_columns.map((label, idx) => ({ key: label, label }));
  }

  // 2. Sort washrooms with activity in front, others below
  const sortedData = [...(data || [])].sort((a, b) => {
    const getActiveCount = (w) => {
      if (w.active_days_count !== undefined) return w.active_days_count;
      if (!w.daily_scores) return Number(w.average_score) > 0 ? 1 : 0;
      return Object.values(w.daily_scores).filter((s) => s !== null && s !== undefined).length;
    };
    const aActive = getActiveCount(a);
    const bActive = getActiveCount(b);
    const aHas = aActive > 0 || (Number(a.average_score) || 0) > 0 || (a.total_inspections || 0) > 0;
    const bHas = bActive > 0 || (Number(b.average_score) || 0) > 0 || (b.total_inspections || 0) > 0;

    if (aHas && !bHas) return -1;
    if (!aHas && bHas) return 1;
    if (aHas && bHas) {
      if (bActive !== aActive) return bActive - aActive;
      const scoreDiff = (Number(b.average_score) || 0) - (Number(a.average_score) || 0);
      if (scoreDiff !== 0) return scoreDiff;
      return (a.washroom_name || "").localeCompare(b.washroom_name || "");
    }
    return (a.washroom_name || "").localeCompare(b.washroom_name || "");
  });

  // Calculate Metrics
  const totalWashrooms = sortedData.length;
  const activeWashrooms = sortedData.filter((w) => {
    const activeDays = w.daily_scores
      ? Object.values(w.daily_scores).filter((s) => s !== null && s !== undefined).length
      : 0;
    return activeDays > 0 || (Number(w.average_score) || 0) > 0 || (w.total_inspections || 0) > 0;
  }).length;

  const overallAvgScore = metadata?.overall_avg_score
    ? Number(metadata.overall_avg_score).toFixed(1)
    : (totalWashrooms > 0
        ? (sortedData.reduce((acc, w) => acc + (Number(w.average_score) || 0), 0) / totalWashrooms).toFixed(1)
        : "0.0");

  let topPerformer = "N/A";
  if (sortedData.length > 0) {
    const withScores = [...sortedData].sort((a, b) => (Number(b.average_score) || 0) - (Number(a.average_score) || 0));
    if (withScores[0] && Number(withScores[0].average_score) > 0) {
      topPerformer = `${withScores[0].washroom_name} (${Number(withScores[0].average_score).toFixed(1)})`;
    }
  }

  const totalDays = dateColumns.length || metadata?.total_days || 0;

  // Number of columns: Sr. No., Washroom Name, Zone Type, ...dates, Average Score
  // (NO City Column, NO Assigned Cleaners Column!)
  const numCols = 3 + dateColumns.length + 1;

  // Refined Executive Theme Palette
  const colors = {
    titleBg: "F1F5F9",
    titleText: "0F172A",
    titleBorderBottom: "475569",

    subtitleBg: "F8FAFC",
    subtitleText: "475569",
    subtitleBorderBottom: "CBD5E1",

    metaLabelBg: "E2E8F0",
    metaLabelText: "334155",
    metaValBg: "F8FAFC",
    metaValText: "0F172A",
    borderColor: "CBD5E1",

    bannerBg: "E2E8F0",
    bannerText: "1E293B",
    bannerBorderBottom: "475569",

    kpiHeaderBg: "F1F5F9",
    kpiHeaderText: "475569",

    cardValBg: "FFFFFF",
    cardTotalText: "0F172A",
    cardCompletedText: "15803D",
    cardOngoingText: "0369A1",
    cardScoreText: "B45309",
    cardDurationText: "334155",

    tableHeaderBg: "334155",
    tableHeaderText: "FFFFFF",

    rowOddBg: "F8FAFC",

    scoreHighBg: "DCFCE7",
    scoreHighText: "15803D",
    scoreGoodBg: "E0F2FE",
    scoreGoodText: "0369A1",
    scoreMidBg: "FEF3C7",
    scoreMidText: "B45309",
    scoreLowBg: "FEE2E2",
    scoreLowText: "DC2626",

    summaryBg: "E2E8F0",
    summaryText: "0F172A",
    summaryBorder: "94A3B8",
  };

  const createCellStyle = (
    bgColor = "FFFFFF",
    textColor = "000000",
    bold = false,
    align = "left",
    sz = 10,
    borderStyle = "thin",
    borderColor = colors.borderColor,
    italic = false
  ) => ({
    font: { name: "Calibri", bold, italic, color: { rgb: textColor }, sz },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
    border: {
      left: { style: borderStyle, color: { rgb: borderColor } },
      right: { style: borderStyle, color: { rgb: borderColor } },
      top: { style: borderStyle, color: { rgb: borderColor } },
      bottom: { style: borderStyle, color: { rgb: borderColor } },
    },
  });

  const createKpiCardValStyle = (textColor) => ({
    font: { name: "Calibri", bold: true, sz: 13, color: { rgb: textColor } },
    fill: { fgColor: { rgb: colors.cardValBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
    },
  });

  const worksheetData = [];
  const styleMap = {};

  const formattedGeneratedOn = new Date(
    metadata.generated_on || Date.now()
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Row 1: Title Banner
  const titleRow = Array(numCols).fill("");
  titleRow[0] = reportTitle.toUpperCase();
  worksheetData.push(titleRow);
  for (let c = 0; c < numCols; c++) {
    const col = XLSX.utils.encode_col(c);
    styleMap[`${col}1`] = {
      font: { name: "Calibri", bold: true, sz: 15, color: { rgb: colors.titleText } },
      fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "medium", color: { rgb: colors.titleBorderBottom } } },
    };
  }

  // Row 2: Subtitle
  const subRow = Array(numCols).fill("");
  subRow[0] = `Daily Hygiene Trend & Washroom Inspection Audit | Generated on: ${formattedGeneratedOn}`;
  worksheetData.push(subRow);
  for (let c = 0; c < numCols; c++) {
    const col = XLSX.utils.encode_col(c);
    styleMap[`${col}2`] = {
      font: { name: "Calibri", italic: true, sz: 9.5, color: { rgb: colors.subtitleText } },
      fill: { fgColor: { rgb: colors.subtitleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "thin", color: { rgb: colors.subtitleBorderBottom } } },
    };
  }

  // Row 3: Blank Spacer
  worksheetData.push([]);

  // Row 4: Scope / Metadata Row
  const dateRangeDisplay = getDateRangeDisplay();
  const labelStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.metaLabelText } },
    fill: { fgColor: { rgb: colors.metaLabelBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };
  const valStyle = {
    font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.metaValText } },
    fill: { fgColor: { rgb: colors.metaValBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  const metaRow = Array(numCols).fill("");
  metaRow[0] = "ORGANIZATION";
  metaRow[1] = metadata.organization || "N/A";
  metaRow[3] = "DATE RANGE";
  metaRow[4] = dateRangeDisplay;
  metaRow[6] = "REPORT TYPE";
  metaRow[7] = reportTitle;
  worksheetData.push(metaRow);

  for (let c = 0; c < numCols; c++) {
    const col = XLSX.utils.encode_col(c);
    styleMap[`${col}4`] = valStyle;
  }
  styleMap["A4"] = labelStyle;
  styleMap[XLSX.utils.encode_col(3) + "4"] = labelStyle;
  styleMap[XLSX.utils.encode_col(6) + "4"] = labelStyle;

  // Row 5: Blank Spacer
  worksheetData.push([]);

  // Row 6: Section Banner - Summary
  const banner1 = Array(numCols).fill("");
  banner1[0] = "EXECUTIVE SUMMARY & OPERATIONAL METRICS";
  worksheetData.push(banner1);
  for (let c = 0; c < numCols; c++) {
    const col = XLSX.utils.encode_col(c);
    styleMap[`${col}6`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: { bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } } },
    };
  }

  // Row 7 & 8: Horizontal KPI Cards (5 cards across width)
  const kpiLabelStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.kpiHeaderText } },
    fill: { fgColor: { rgb: colors.kpiHeaderBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  const kpiRow1 = Array(numCols).fill("");
  kpiRow1[0] = "Total Washrooms";
  kpiRow1[2] = "Active Washrooms";
  kpiRow1[4] = "Overall Avg Score";
  kpiRow1[6] = "Top Performer";
  kpiRow1[9] = "Audited Days";
  worksheetData.push(kpiRow1);

  const kpiRow2 = Array(numCols).fill("");
  kpiRow2[0] = totalWashrooms;
  kpiRow2[2] = activeWashrooms;
  kpiRow2[4] = overallAvgScore;
  kpiRow2[6] = topPerformer;
  kpiRow2[9] = `${totalDays} Days`;
  worksheetData.push(kpiRow2);

  for (let c = 0; c < numCols; c++) {
    const col = XLSX.utils.encode_col(c);
    styleMap[`${col}7`] = kpiLabelStyle;
    styleMap[`${col}8`] = createKpiCardValStyle(colors.cardTotalText);
  }
  for (let c = 0; c < 2; c++) styleMap[`${XLSX.utils.encode_col(c)}8`] = createKpiCardValStyle(colors.cardTotalText);
  for (let c = 2; c < 4; c++) styleMap[`${XLSX.utils.encode_col(c)}8`] = createKpiCardValStyle(colors.cardCompletedText);
  for (let c = 4; c < 6; c++) styleMap[`${XLSX.utils.encode_col(c)}8`] = createKpiCardValStyle(colors.cardScoreText);
  for (let c = 6; c < 9; c++) styleMap[`${XLSX.utils.encode_col(c)}8`] = createKpiCardValStyle(colors.cardOngoingText);
  for (let c = 9; c < numCols; c++) styleMap[`${XLSX.utils.encode_col(c)}8`] = createKpiCardValStyle(colors.cardDurationText);

  // Row 9: Blank Spacer
  worksheetData.push([]);

  // Row 10: Section Banner - Matrix
  const banner2 = Array(numCols).fill("");
  banner2[0] = "DAILY WASHROOM HYGIENE TREND & SCORE MATRIX";
  worksheetData.push(banner2);
  for (let c = 0; c < numCols; c++) {
    const col = XLSX.utils.encode_col(c);
    styleMap[`${col}10`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: { bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } } },
    };
  }

  // Row 11: Table Headers (NO CITY COLUMN, NO ASSIGNED CLEANERS COLUMN)
  const tableHeaders = [
    "Sr. No.",
    "Washroom Name",
    "Zone Type",
    ...dateColumns.map((d) => d.label),
    "Average Score",
  ];
  worksheetData.push(tableHeaders);

  for (let c = 0; c < numCols; c++) {
    const col = XLSX.utils.encode_col(c);
    styleMap[`${col}11`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.tableHeaderText } },
      fill: { fgColor: { rgb: colors.tableHeaderBg }, patternType: "solid" },
      alignment: {
        horizontal: c === 0 || c >= 3 ? "center" : "left",
        vertical: "center",
      },
      border: {
        left: { style: "thin", color: { rgb: "475569" } },
        right: { style: "thin", color: { rgb: "475569" } },
        top: { style: "thin", color: { rgb: "475569" } },
        bottom: { style: "medium", color: { rgb: "0F172A" } },
      },
    };
  }

  const getScoreStyle = (scoreVal, isOdd) => {
    if (scoreVal === "-" || scoreVal === null || scoreVal === undefined) {
      return createCellStyle(isOdd ? colors.rowOddBg : "FFFFFF", "94A3B8", false, "center");
    }
    const num = parseFloat(scoreVal);
    if (isNaN(num) || num === 0) {
      return createCellStyle(isOdd ? colors.rowOddBg : "FFFFFF", "94A3B8", false, "center");
    }
    if (num >= 9.0) return createCellStyle(colors.scoreHighBg, colors.scoreHighText, true, "center");
    if (num >= 7.5) return createCellStyle(colors.scoreGoodBg, colors.scoreGoodText, true, "center");
    if (num >= 6.0) return createCellStyle(colors.scoreMidBg, colors.scoreMidText, true, "center");
    return createCellStyle(colors.scoreLowBg, colors.scoreLowText, true, "center");
  };

  // Row 12+: Data Rows
  sortedData.forEach((w, idx) => {
    const rowNum = 12 + idx;
    const isOdd = idx % 2 === 1;
    const bg = isOdd ? colors.rowOddBg : "FFFFFF";

    const dailyScores = dateColumns.map((dateObj) => {
      const score = w.daily_scores ? w.daily_scores[dateObj.key] : null;
      if (score === null || score === undefined) return "-";
      return typeof score === "number" ? score.toFixed(1) : score;
    });

    const avgDisplay =
      w.average_score !== null && w.average_score !== undefined && Number(w.average_score) > 0
        ? Number(w.average_score).toFixed(1)
        : "0.0";

    const row = [
      idx + 1,
      w.washroom_name,
      w.zone_type || "N/A",
      ...dailyScores,
      avgDisplay,
    ];
    worksheetData.push(row);

    for (let c = 0; c < numCols; c++) {
      const col = XLSX.utils.encode_col(c);
      const cellRef = `${col}${rowNum}`;

      if (c === 0) {
        styleMap[cellRef] = createCellStyle(bg, "64748B", false, "center");
      } else if (c === 1) {
        styleMap[cellRef] = createCellStyle(bg, "0F172A", true, "left");
      } else if (c === 2) {
        styleMap[cellRef] = createCellStyle(bg, "334155", false, "left");
      } else if (c >= 3 && c < 3 + dateColumns.length) {
        styleMap[cellRef] = getScoreStyle(row[c], isOdd);
      } else {
        // Average column
        styleMap[cellRef] = getScoreStyle(row[c], isOdd);
      }
    }
  });

  // Merges
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } }, // Subtitle
    { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } }, // Org
    { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } }, // Date Range
    { s: { r: 3, c: 7 }, e: { r: 3, c: numCols - 1 } }, // Report Type
    { s: { r: 5, c: 0 }, e: { r: 5, c: numCols - 1 } }, // Banner 1
    { s: { r: 9, c: 0 }, e: { r: 9, c: numCols - 1 } }, // Banner 2
    // KPI Cards:
    { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } },
    { s: { r: 6, c: 2 }, e: { r: 6, c: 3 } },
    { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } },
    { s: { r: 6, c: 4 }, e: { r: 6, c: 5 } },
    { s: { r: 7, c: 4 }, e: { r: 7, c: 5 } },
    { s: { r: 6, c: 6 }, e: { r: 6, c: 8 } },
    { s: { r: 7, c: 6 }, e: { r: 7, c: 8 } },
    { s: { r: 6, c: 9 }, e: { r: 6, c: numCols - 1 } },
    { s: { r: 7, c: 9 }, e: { r: 7, c: numCols - 1 } },
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  ws["!merges"] = merges;

  Object.keys(styleMap).forEach((cellRef) => {
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = styleMap[cellRef];
  });

  // Generous column widths (NO Assigned Cleaners)
  const colWidths = [
    { wch: 8 }, // Sr No
    { wch: 32 }, // Washroom Name
    { wch: 16 }, // Zone Type
    ...dateColumns.map(() => ({ wch: 12 })), // Each Date Col
    { wch: 15 }, // Average Score
  ];
  ws["!cols"] = colWidths;

  const rowHeights = [
    { hpt: 34 },
    { hpt: 22 },
    { hpt: 12 },
    { hpt: 25 },
    { hpt: 12 },
    { hpt: 24 },
    { hpt: 22 },
    { hpt: 28 },
    { hpt: 12 },
    { hpt: 24 },
    { hpt: 27 },
  ];
  for (let i = 0; i < sortedData.length; i++) {
    rowHeights.push({ hpt: 22 });
  }
  ws["!rows"] = rowHeights;

  XLSX.utils.book_append_sheet(wb, ws, "Hygiene Trend Matrix");

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

const exportZoneWiseToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");
  const reportTitle =
    metadata.dynamic_report_name || metadata.report_type || "Zone-wise Report";

  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(reportTitle, 14, 15);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const metadataY = 25;
  doc.text(`Organization: ${metadata.organization}`, 14, metadataY);
  doc.text(`Zone: ${metadata.zone}`, 14, metadataY + 5);
  doc.text(
    `Date Range: ${metadata.date_range.start} to ${metadata.date_range.end}`,
    14,
    metadataY + 10,
  );
  doc.text(
    `Generated On: ${new Date(metadata.generated_on).toLocaleString()}`,
    14,
    metadataY + 15,
  );

  doc.text(
    `Total Locations: ${metadata.total_locations} | Total Reviews: ${metadata.total_reviews} | Avg Score: ${(metadata.average_score_overall || 0).toFixed(2)}`,
    14,
    metadataY + 20,
  );

  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.address !== "N/A" ? row.address : "No address",
    row.cleaner_name,
    (row.current_score || 0).toFixed(2),
    (row.average_rating || 0).toFixed(2),
    row.review_status,
    row.last_review_date
      ? new Date(row.last_review_date).toLocaleDateString()
      : "Never",
    row.facility_company,
    row.latitude && row.longitude
      ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
      : "N/A",
  ]);

  autoTable(doc, {
    head: [
      [
        "#",
        "Location",
        "Address",
        "Cleaner",
        "Current Score",
        "Avg Rating",
        "Status",
        "Last Review",
        "Facility Company",
        "Coordinates",
      ],
    ],
    body: tableData,
    startY: metadataY + 25,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  //   addLogosToAllPages(doc);

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

const exportZoneWiseToExcel = (data, metadata) => {
  const reportTitle = metadata.dynamic_report_name || "Zone-wise Report";

  const headerRows = [
    [reportTitle],
    [],
    ["Organization", metadata.organization],
    ["Zone", metadata.zone],
    [
      "Date Range",
      `${metadata.date_range.start} to ${metadata.date_range.end}`,
    ],
    ["Generated On", new Date(metadata.generated_on).toLocaleString()],
    ["Total Locations", metadata.total_locations],
    ["Total Reviews", metadata.total_reviews],
    ["Average Score", (metadata.average_score_overall || 0).toFixed(2)],
    ["Average Rating", (metadata.average_rating_overall || 0).toFixed(2)],
    [],
  ];

  const tableHeaders = [
    "#",
    "Location Name",
    "Address",
    "City",
    "State",
    "Zone",
    "Cleaner Name",
    "Cleaner Phone",
    "Current Score",
    "Average Rating",
    "Hygiene Score Count",
    "Review Status",
    "Last Review Date",
    "Total Reviews",
    "Unique Cleaners",
    "Facility Company",
    "Latitude",
    "Longitude",
    "Google Maps Link",
  ];

  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.address !== "N/A" ? row.address : "",
    row.city !== "N/A" ? row.city : "",
    row.state !== "N/A" ? row.state : "",
    row.zone,
    row.cleaner_name,
    row.cleaner_phone !== "N/A" ? row.cleaner_phone : "",
    (row.current_score || 0).toFixed(2),
    (row.average_rating || 0).toFixed(2),
    row.hygiene_score_count,
    row.review_status,
    row.last_review_date
      ? new Date(row.last_review_date).toLocaleDateString()
      : "",
    row.total_reviews,
    row.unique_cleaners,
    row.facility_company,
    row.latitude || "",
    row.longitude || "",
    row.latitude && row.longitude
      ? `https://www.google.com/maps?q=${row.latitude},${row.longitude}`
      : "",
  ]);

  const worksheetData = [...headerRows, tableHeaders, ...tableData];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  ws["!cols"] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 50 },
  ];

  ws["A1"].s = {
    font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
    alignment: { horizontal: "center" },
  };

  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }];

  XLSX.utils.book_append_sheet(wb, ws, "Zone Report");

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

const exportAiScoringToPDF = (data, metadata) => {
  const doc = new jsPDF("p", "mm", "a4");
  const reportTitle = metadata.dynamic_report_name || "AI Scoring Report";

  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text(reportTitle, 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100);
  const metadataY = 30;
  doc.text(
    `Date Range: ${metadata.date_range.start} to ${metadata.date_range.end}`,
    14,
    metadataY,
  );
  doc.text(
    `Generated On: ${new Date(metadata.generated_on).toLocaleString("en-IN")}`,
    14,
    metadataY + 5,
  );
  doc.text(
    `Total Locations: ${metadata.total_locations_inspected} | Overall Average Score: ${metadata.overall_average_score.toFixed(2)}`,
    14,
    metadataY + 10,
  );

  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.total_inspections,
    row.average_score.toFixed(1),
    `${row.improvement_percentage.toFixed(1)}%`,
  ]);

  autoTable(doc, {
    head: [
      [
        "#",
        "Washroom",
        "Total Inspections",
        "Average Score (0-10)",
        "Improvement Trend",
      ],
    ],
    body: tableData,
    startY: metadataY + 18,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: "bold" },
    didDrawCell: (data) => {
      if (data.column.dataKey === 4 && data.cell.section === "body") {
        const value = parseFloat(data.cell.raw);
        if (value > 0) doc.setTextColor(34, 139, 34);
        if (value < 0) doc.setTextColor(220, 20, 60);
      }
    },
  });

  // addLogosToAllPages(doc);

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

const exportAiScoringToExcel = (data, metadata) => {
  const reportTitle = metadata.dynamic_report_name || "AI Scoring Report";

  const headerRows = [
    [reportTitle],
    [],
    [
      "Date Range",
      `${metadata.date_range.start} to ${metadata.date_range.end}`,
    ],
    ["Generated On", new Date(metadata.generated_on).toLocaleString("en-IN")],
    ["Total Locations Inspected", metadata.total_locations_inspected],
    ["Overall Average Score", metadata.overall_average_score.toFixed(2)],
    [],
  ];

  const tableHeaders = [
    "#",
    "Washroom",
    "Total Inspections",
    "Average Score (0-10)",
    "Improvement Trend (%)",
  ];

  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.total_inspections,
    row.average_score.toFixed(1),
    row.improvement_percentage.toFixed(1),
  ]);

  const ws = XLSX.utils.aoa_to_sheet([
    ...headerRows,
    tableHeaders,
    ...tableData,
  ]);
  ws["!cols"] = [
    { wch: 5 },
    { wch: 40 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];
  ws["A1"].s = {
    font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
    alignment: { horizontal: "center" },
  };
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "AI Scoring Report");

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportCleanerPerformanceSummaryToPDF = (data, metadata) => {
  const doc = new jsPDF();
  const reportTitle =
    metadata.dynamic_report_name || "Cleaner Performance Summary";

  doc.text(reportTitle, 14, 20);
  doc.setFontSize(10);
  doc.text(
    `Date Range: ${
      metadata?.date_range?.start && metadata?.date_range?.end
        ? metadata.date_range.start + " to " + metadata.date_range.end
        : "-"
    }`,
    14,
    30,
  );

  autoTable(doc, {
    head: [
      [
        "Cleaner",
        "Total Tasks",
        "Avg. AI Score",
        "Avg. Compliance (%)",
        "Avg. Duration (min)",
        "Last Task Date",
      ],
    ],
    body: data.map((row) => [
      row.cleaner_name,
      row.total_tasks,
      row.avg_ai_score,
      row.avg_compliance,
      row.avg_duration,
      row.last_task_date
        ? new Date(row.last_task_date).toLocaleString("en-IN")
        : "-",
    ]),
    startY: 35,
  });

  //addLogosToAllPages(doc);

  const fileName = `${reportTitle.replace(/\s+/g, "_")}.pdf`;
  outputPdf(doc, fileName);
};

export const exportCleanerPerformanceSummaryToExcel = (data, metadata) => {
  const reportTitle =
    metadata.dynamic_report_name || "Cleaner Performance Summary";

  const header = [[reportTitle]];
  const subHeader = [
    [
      "Date Range",
      metadata?.date_range?.start && metadata?.date_range?.end
        ? `${metadata.date_range.start} to ${metadata.date_range.end}`
        : "-",
    ],
  ];
  const tableHeaders = [
    "Cleaner",
    "Total Tasks",
    "Avg. AI Score",
    "Avg. Compliance (%)",
    "Avg. Duration (min)",
    "Last Task Date",
  ];
  const tableData = data.map((row) => [
    row.cleaner_name,
    row.total_tasks,
    row.avg_ai_score,
    row.avg_compliance,
    row.avg_duration,
    row.last_task_date
      ? new Date(row.last_task_date).toLocaleString("en-IN")
      : "-",
  ]);
  const ws = XLSX.utils.aoa_to_sheet([
    ...header,
    ...subHeader,
    [],
    tableHeaders,
    ...tableData,
  ]);
  ws["!cols"] = Array(tableHeaders.length).fill({ wch: 22 });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Performance Summary");

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

const exportWashroomReportToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");
  const reportTitle =
    metadata.dynamic_report_name || metadata.report_type || "Washroom Report";
  const isSingleWashroom = metadata.is_single_washroom;

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(reportTitle, 14, 15);

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, 18, 283, 18);

  let currentY = 25;

  const formatDateForReport = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  };

  // ✅ Metadata Section
  formatDateForReport();
  if (isSingleWashroom) {
    autoTable(doc, {
      head: [
        [
          "Organization",
          "Zone/Type",
          "Address",
          "City/State",
          "Date Range",
          "Report Type",
          "Generated On",
        ],
      ],
      body: [
        [
          metadata.organization || "N/A",
          metadata.washroom_type || "N/A",
          metadata.washroom_address || "N/A",
          [metadata.washroom_city, metadata.washroom_state]
            .filter(Boolean)
            .join(", ") || "N/A",
          `${formatDateForReport(metadata.date_range?.start)} to ${formatDateForReport(metadata.date_range?.end)}`,
          reportTitle,
          new Date(metadata.generated_on).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 30 },
        1: { halign: "left", cellWidth: 35 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "center", cellWidth: 35 },
        4: { halign: "center", cellWidth: 40 },
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    autoTable(doc, {
      head: [["Organization", "Report Type", "Date Range", "Generated On"]],
      body: [
        [
          metadata.organization || "N/A",
          reportTitle,
          `${formatDateForReport(metadata.date_range?.start)} to ${formatDateForReport(metadata.date_range?.end)}`,
          new Date(metadata.generated_on).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });
  }

  currentY = doc.lastAutoTable.finalY + 3;

  // ✅ SINGLE WASHROOM REPORT
  if (isSingleWashroom) {
    // Summary Stats
    autoTable(doc, {
      head: [
        [
          "Washroom",
          "Total Cleanings",
          "Completed",
          "Ongoing",
          "Avg Rating",
          "Avg Duration",
        ],
      ],
      body: [
        [
          metadata.washroom_name || "N/A",
          metadata.total_cleanings || 0,
          metadata.completed || 0,
          metadata.ongoing || 0,
          metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
          metadata.avg_cleaning_duration
            ? formatDuration(metadata.avg_cleaning_duration)
            : "N/A",
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
        fontStyle: "bold",
        fillColor: [236, 253, 245],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    // Cleaning Records Table
    const formatDateTime = (date) => {
      if (!date) return "Ongoing";
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const tableData = data.map((cleaning, index) => {
      const taskInfo = cleaning.duration_minutes
        ? getTaskInfo({
            task_start_time: cleaning.start_time,
            task_end_time: cleaning.end_time,
            status: cleaning.status,
          })
        : null;

      return [
        index + 1,
        cleaning.cleaner_name || "N/A",
        formatDateTime(cleaning.start_time),
        formatDateTime(cleaning.end_time),
        taskInfo
          ? taskInfo.durationDisplay
          : cleaning.duration_minutes
            ? formatDuration(cleaning.duration_minutes)
            : "N/A",
        cleaning.rating ? cleaning.rating.toFixed(1) : "N/A",
        taskInfo
          ? taskInfo.status
          : cleaning.status
            ? cleaning.status.toUpperCase()
            : "N/A",
        cleaning.before_image_count || 0,
        cleaning.after_image_count || 0,
      ];
    });

    autoTable(doc, {
      head: [
        [
          "#",
          "Cleaner",
          "Start Time",
          "End Time",
          "Duration",
          "Rating",
          "Status",
          "Before",
          "After",
        ],
      ],
      body: tableData,
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center", fontStyle: "bold" },
        7: { halign: "center" },
        8: { halign: "center" },
      },
      // ✅ Color code status cells
      didParseCell: function (data) {
        if (data.column.index === 6 && data.section === "body") {
          const status = data.cell.raw;
          if (status === "COMPLETED") {
            data.cell.styles.textColor = [22, 163, 74]; // Green (text-green-700)
            data.cell.styles.fillColor = [220, 252, 231]; // Light green (bg-green-100)
          } else if (status === "ONGOING") {
            data.cell.styles.textColor = [161, 98, 7]; // Yellow-700 (text-yellow-700)
            data.cell.styles.fillColor = [254, 249, 195]; // Yellow-100 (bg-yellow-100)
          } else if (status === "INCOMPLETE") {
            data.cell.styles.textColor = [234, 179, 8]; // Orange
            data.cell.styles.fillColor = [255, 237, 213]; // Orange-100
          } else if (status === "OVERDUE") {
            data.cell.styles.textColor = [220, 38, 38]; // Red
            data.cell.styles.fillColor = [254, 226, 226]; // Red-100
          } else if (status === "NO ACTIVITY") {
            data.cell.styles.textColor = [71, 85, 105]; // Slate-600
            data.cell.styles.fillColor = [241, 245, 249]; // Slate-100
          }
        }
      },
      margin: { left: 14, right: 14 },
    });
  }
  // ✅ ALL WASHROOMS REPORT
  else {
    // Summary Stats
    autoTable(doc, {
      head: [
        [
          "Total Washrooms",
          "Completed",
          "Ongoing",
          "Avg Rating",
          "Avg Duration",
        ],
      ],
      body: [
        [
          metadata.total_washrooms || 0,
          metadata.completed || 0,
          metadata.ongoing || 0,
          metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
          metadata.avg_cleaning_duration
            ? formatDuration(metadata.avg_cleaning_duration)
            : "N/A",
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
        fontStyle: "bold",
        fillColor: [236, 253, 245],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    // Washroom Details Table
    const formatDateTime = (date) => {
      if (!date) return "No Activity";
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const tableData = data.map((washroom, index) => [
      index + 1,
      washroom.name || "N/A",
      washroom.address || "N/A",
      washroom.type || "N/A",
      washroom.cleaner_name || "No Activity",
      washroom.avg_rating ? washroom.avg_rating.toFixed(1) : "N/A",
      washroom.status === "no_activity"
        ? "NO ACTIVITY"
        : washroom.status
          ? washroom.status.toUpperCase()
          : "NO ACTIVITY",
      washroom.image_count || 0,
      formatDateTime(washroom.last_cleaned_on),
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "Washroom",
          "Address",
          "Type",
          "Cleaner",
          "Avg Rating",
          "Status",
          "Images",
          "Last Activity",
        ],
      ],
      body: tableData,
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 50,
        cellPadding: 2,
        overflow: "linebreak", // ✅ Wraps text to multiple lines
        valign: "top",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        1: { halign: "left", overflow: "linebreak" },
        2: { halign: "left", overflow: "linebreak" },
        3: { halign: "left", overflow: "linebreak" },
        4: { halign: "left", overflow: "linebreak" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
        8: { halign: "left", overflow: "linebreak" },
      },
      // ✅ Color code status cells
      didParseCell: function (data) {
        if (data.column.index === 6 && data.section === "body") {
          const status = data.cell.raw;
          if (status === "COMPLETED") {
            data.cell.styles.textColor = [22, 163, 74]; // Green (text-green-700)
            data.cell.styles.fillColor = [220, 252, 231]; // Light green (bg-green-100)
          } else if (status === "ONGOING") {
            data.cell.styles.textColor = [161, 98, 7]; // Yellow-700 (text-yellow-700)
            data.cell.styles.fillColor = [254, 249, 195]; // Yellow-100 (bg-yellow-100)
          } else if (status === "INCOMPLETE") {
            data.cell.styles.textColor = [234, 179, 8]; // Orange
            data.cell.styles.fillColor = [255, 237, 213]; // Orange-100
          } else if (status === "OVERDUE") {
            data.cell.styles.textColor = [220, 38, 38]; // Red
            data.cell.styles.fillColor = [254, 226, 226]; // Red-100
          } else if (status === "NO ACTIVITY") {
            data.cell.styles.textColor = [71, 85, 105]; // Slate-600
            data.cell.styles.fillColor = [241, 245, 249]; // Slate-100
          }
        }
      },
      margin: { left: 14, right: 14 },
    });
  }

  //   addLogosToAllPages(doc);

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN")}`,
      14,
      doc.internal.pageSize.height - 10,
    );
  }

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

// ✅ EXPORT WASHROOM REPORT TO EXCEL - REFINED EXECUTIVE THEME
const exportWashroomReportToExcel = (data, metadata) => {
  const isSingleWashroom = metadata.is_single_washroom;
  const reportTitle =
    metadata.dynamic_report_name ||
    metadata.report_type ||
    (isSingleWashroom ? "Washroom Cleaning Report" : "All Washrooms Report");

  // Helper: Format date range display
  const getDateRangeDisplay = () => {
    const startDate = metadata?.date_range?.start;
    const endDate = metadata?.date_range?.end;

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now")
        return dateStr;
      try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    if (
      (!startDate || startDate === "Beginning") &&
      (!endDate || endDate === "Now")
    ) {
      return new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    if (
      startDate &&
      startDate !== "Beginning" &&
      (!endDate || endDate === "Now")
    ) {
      return `${formatDate(startDate)} to ${new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      )}`;
    }

    if (
      startDate &&
      endDate &&
      startDate !== "Beginning" &&
      endDate !== "Now"
    ) {
      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
      return formattedStart === formattedEnd
        ? formattedStart
        : `${formattedStart} to ${formattedEnd}`;
    }

    if (
      (!startDate || startDate === "Beginning") &&
      endDate &&
      endDate !== "Now"
    ) {
      return `Beginning to ${formatDate(endDate)}`;
    }

    return "Date Range Not Specified";
  };

  // Refined Executive Theme
  const colors = {
    titleBg: "F1F5F9",
    titleText: "0F172A",
    titleBorderBottom: "475569",

    subtitleBg: "F8FAFC",
    subtitleText: "475569",
    subtitleBorderBottom: "CBD5E1",

    metaLabelBg: "E2E8F0",
    metaLabelText: "334155",
    metaValBg: "F8FAFC",
    metaValText: "0F172A",
    borderColor: "CBD5E1",

    bannerBg: "E2E8F0",
    bannerText: "1E293B",
    bannerBorderBottom: "475569",

    kpiHeaderBg: "F1F5F9",
    kpiHeaderText: "475569",

    cardValBg: "FFFFFF",
    cardTotalText: "0F172A",
    cardCompletedText: "15803D",
    cardOngoingText: "0369A1",
    cardIncompleteText: "B91C1C",
    cardScoreText: "B45309",
    cardDurationText: "334155",

    tableHeaderBg: "334155",
    tableHeaderText: "FFFFFF",

    rowOddBg: "F8FAFC",

    statusCompletedBg: "DCFCE7",
    statusCompletedText: "15803D",

    statusOverdueBg: "FEE2E2",
    statusOverdueText: "DC2626",

    statusOngoingBg: "EFF6FF",
    statusOngoingText: "1D4ED8",

    statusIncompleteBg: "FEF3C7",
    statusIncompleteText: "B45309",

    scoreHighBg: "DCFCE7",
    scoreHighText: "15803D",
    scoreMidBg: "FEF3C7",
    scoreMidText: "B45309",
    scoreLowBg: "FEE2E2",
    scoreLowText: "DC2626",

    summaryBg: "E2E8F0",
    summaryText: "0F172A",
    summaryBorder: "94A3B8",
  };

  const createCellStyle = (
    bgColor = "FFFFFF",
    textColor = "000000",
    bold = false,
    align = "left",
    sz = 10,
    borderStyle = "thin",
    borderColor = colors.borderColor,
    italic = false,
  ) => ({
    font: { name: "Calibri", bold, italic, color: { rgb: textColor }, sz },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
    border: {
      left: { style: borderStyle, color: { rgb: borderColor } },
      right: { style: borderStyle, color: { rgb: borderColor } },
      top: { style: borderStyle, color: { rgb: borderColor } },
      bottom: { style: borderStyle, color: { rgb: borderColor } },
    },
  });

  const createKpiCardValStyle = (textColor) => ({
    font: { name: "Calibri", bold: true, sz: 13, color: { rgb: textColor } },
    fill: { fgColor: { rgb: colors.cardValBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
    },
  });

  const worksheetData = [];
  const styleMap = {};

  const formattedGeneratedOn = new Date(
    metadata.generated_on || Date.now(),
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const numCols = 10;

  // Row 1: Title Banner
  const titleRow = Array(numCols).fill("");
  titleRow[0] = reportTitle.toUpperCase();
  worksheetData.push(titleRow);
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}1`] = {
      font: { name: "Calibri", bold: true, sz: 15, color: { rgb: colors.titleText } },
      fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "medium", color: { rgb: colors.titleBorderBottom } } },
    };
  }

  // Row 2: Subtitle
  const subText = isSingleWashroom
    ? `Washroom Cleaning History & Hygiene Audit | Generated on: ${formattedGeneratedOn}`
    : `Comprehensive Washroom Performance & Facility Audit | Generated on: ${formattedGeneratedOn}`;
  const subRow = Array(numCols).fill("");
  subRow[0] = subText;
  worksheetData.push(subRow);
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}2`] = {
      font: { name: "Calibri", italic: true, sz: 9.5, color: { rgb: colors.subtitleText } },
      fill: { fgColor: { rgb: colors.subtitleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "thin", color: { rgb: colors.subtitleBorderBottom } } },
    };
  }

  // Row 3: Blank Spacer
  worksheetData.push([]);

  // Row 4: Scope / Metadata Block
  const dateRangeDisplay = getDateRangeDisplay();
  const labelStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.metaLabelText } },
    fill: { fgColor: { rgb: colors.metaLabelBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };
  const valStyle = {
    font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.metaValText } },
    fill: { fgColor: { rgb: colors.metaValBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  const metaRow = Array(numCols).fill("");
  if (isSingleWashroom) {
    metaRow[0] = "WASHROOM";
    metaRow[1] = metadata.washroom_name || "N/A";
    metaRow[4] = "ZONE / TYPE";
    metaRow[5] = metadata.washroom_type || "N/A";
    metaRow[6] = "DATE RANGE";
    metaRow[7] = dateRangeDisplay;
    metaRow[8] = "ORGANIZATION";
    metaRow[9] = metadata.organization || "N/A";
  } else {
    metaRow[0] = "ORGANIZATION";
    metaRow[1] = metadata.organization || "N/A";
    metaRow[5] = "DATE RANGE";
    metaRow[6] = dateRangeDisplay;
    metaRow[8] = "REPORT TYPE";
    metaRow[9] = reportTitle;
  }
  worksheetData.push(metaRow);

  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}4`] = valStyle;
  }
  if (isSingleWashroom) {
    styleMap["A4"] = labelStyle;
    styleMap["E4"] = labelStyle;
    styleMap["G4"] = labelStyle;
    styleMap["I4"] = labelStyle;
  } else {
    styleMap["A4"] = labelStyle;
    styleMap["F4"] = labelStyle;
    styleMap["I4"] = labelStyle;
  }

  // Row 5: Blank Spacer
  worksheetData.push([]);

  // Row 6: Section Banner - Summary
  const banner1 = Array(numCols).fill("");
  banner1[0] = "EXECUTIVE SUMMARY & OPERATIONAL METRICS";
  worksheetData.push(banner1);
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}6`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: { bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } } },
    };
  }

  // Calculate Metrics
  const totalItems = isSingleWashroom
    ? (metadata.total_cleanings || data?.length || 0)
    : (metadata.total_washrooms || data?.length || 0);

  const completedCleanings = metadata.completed || 0;
  const ongoingCleanings = metadata.ongoing || 0;
  const avgHygieneRating = metadata.avg_rating ? Number(metadata.avg_rating).toFixed(1) : "0.0";
  const avgCleaningDuration = metadata.avg_cleaning_duration ? `${Math.round(metadata.avg_cleaning_duration)} min` : "0 min";

  // Row 7 & 8: Horizontal KPI Cards
  const kpiLabelStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.kpiHeaderText } },
    fill: { fgColor: { rgb: colors.kpiHeaderBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  const kpiRow1 = Array(numCols).fill("");
  kpiRow1[0] = isSingleWashroom ? "Total Cleanings" : "Total Washrooms";
  kpiRow1[2] = "Completed Cleanings";
  kpiRow1[4] = "Ongoing Cleanings";
  kpiRow1[6] = "Avg Hygiene Rating";
  kpiRow1[8] = "Avg Duration";
  worksheetData.push(kpiRow1);

  const kpiRow2 = Array(numCols).fill("");
  kpiRow2[0] = totalItems;
  kpiRow2[2] = completedCleanings;
  kpiRow2[4] = ongoingCleanings;
  kpiRow2[6] = avgHygieneRating;
  kpiRow2[8] = avgCleaningDuration;
  worksheetData.push(kpiRow2);

  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}7`] = kpiLabelStyle;
  }
  for (let c = 0; c < 2; c++) styleMap[`${String.fromCharCode(65 + c)}8`] = createKpiCardValStyle(colors.cardTotalText);
  for (let c = 2; c < 4; c++) styleMap[`${String.fromCharCode(65 + c)}8`] = createKpiCardValStyle(colors.cardCompletedText);
  for (let c = 4; c < 6; c++) styleMap[`${String.fromCharCode(65 + c)}8`] = createKpiCardValStyle(colors.cardOngoingText);
  for (let c = 6; c < 8; c++) styleMap[`${String.fromCharCode(65 + c)}8`] = createKpiCardValStyle(colors.cardScoreText);
  for (let c = 8; c < 10; c++) styleMap[`${String.fromCharCode(65 + c)}8`] = createKpiCardValStyle(colors.cardDurationText);

  // Row 9: Blank Spacer
  worksheetData.push([]);

  // Row 10: Section Banner - Audit Trail
  const banner2 = Array(numCols).fill("");
  banner2[0] = isSingleWashroom
    ? "WASHROOM CLEANING ACTIVITY LOGS & AUDIT TRAIL"
    : "WASHROOM INVENTORY & PERFORMANCE AUDIT TRAIL";
  worksheetData.push(banner2);
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}10`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: { bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } } },
    };
  }

  // Row 11: Table Headers
  const tableHeaders = isSingleWashroom
    ? [
        "Sr. No.",
        "Cleaner Name",
        "Phone",
        "Start Time",
        "End Time",
        "Duration (min)",
        "Rating",
        "Status",
        "Before Images",
        "After Images",
      ]
    : [
        "Sr. No.",
        "Washroom Name",
        "Address",
        "City",
        "Type",
        "Cleaner",
        "Avg Rating",
        "Status",
        "Total Images",
        "Last Activity",
      ];

  worksheetData.push(tableHeaders);
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}11`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.tableHeaderText } },
      fill: { fgColor: { rgb: colors.tableHeaderBg }, patternType: "solid" },
      alignment: {
        horizontal: c === 0 || c >= 6 ? "center" : "left",
        vertical: "center",
      },
      border: {
        left: { style: "thin", color: { rgb: "475569" } },
        right: { style: "thin", color: { rgb: "475569" } },
        top: { style: "thin", color: { rgb: "475569" } },
        bottom: { style: "medium", color: { rgb: "0F172A" } },
      },
    };
  }

  const formatDateTime = (date) => {
    if (!date) return "Ongoing";
    try {
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return String(date);
    }
  };

  const getScoreStyle = (scoreVal, bgOdd) => {
    const num = parseFloat(scoreVal);
    if (isNaN(num)) {
      return createCellStyle(bgOdd ? colors.rowOddBg : "FFFFFF", "64748B", false, "center");
    }
    if (num >= 8) return createCellStyle(colors.scoreHighBg, colors.scoreHighText, true, "center");
    if (num >= 6) return createCellStyle(colors.scoreMidBg, colors.scoreMidText, true, "center");
    return createCellStyle(colors.scoreLowBg, colors.scoreLowText, true, "center");
  };

  const getStatusStyle = (statusVal) => {
    const s = String(statusVal || "").toUpperCase();
    if (s.includes("COMPLETED")) return createCellStyle(colors.statusCompletedBg, colors.statusCompletedText, true, "center");
    if (s.includes("OVERDUE") || s.includes("FAILED")) return createCellStyle(colors.statusOverdueBg, colors.statusOverdueText, true, "center");
    if (s.includes("ONGOING")) return createCellStyle(colors.statusOngoingBg, colors.statusOngoingText, true, "center");
    if (s.includes("INCOMPLETE")) return createCellStyle(colors.statusIncompleteBg, colors.statusIncompleteText, true, "center");
    return createCellStyle("F1F5F9", "475569", true, "center");
  };

  // Row 12+: Data Rows
  (data || []).forEach((row, idx) => {
    const rowNum = 12 + idx;
    const isOdd = idx % 2 === 1;
    const bg = isOdd ? colors.rowOddBg : "FFFFFF";

    let dataRow = [];
    if (isSingleWashroom) {
      dataRow = [
        idx + 1,
        row.cleaner_name || "N/A",
        row.cleaner_phone || "N/A",
        formatDateTime(row.start_time),
        formatDateTime(row.end_time),
        row.duration_minutes !== undefined && row.duration_minutes !== null ? row.duration_minutes : 0,
        row.rating ? Number(row.rating).toFixed(1) : "N/A",
        row.status ? row.status.toUpperCase() : "N/A",
        row.before_image_count || 0,
        row.after_image_count || 0,
      ];
    } else {
      dataRow = [
        idx + 1,
        row.name || "N/A",
        row.address || "N/A",
        row.city || "N/A",
        row.type || "N/A",
        row.cleaner_name || "No Activity",
        row.avg_rating ? Number(row.avg_rating).toFixed(1) : "N/A",
        row.status === "no_activity"
          ? "NO ACTIVITY"
          : row.status
            ? row.status.toUpperCase()
            : "NO ACTIVITY",
        row.image_count || 0,
        row.last_cleaned_on ? formatDateTime(row.last_cleaned_on) : "No Activity",
      ];
    }

    worksheetData.push(dataRow);

    for (let c = 0; c < numCols; c++) {
      const col = String.fromCharCode(65 + c);
      const cellRef = `${col}${rowNum}`;

      if (c === 0) {
        styleMap[cellRef] = createCellStyle(bg, "64748B", false, "center");
      } else if (c === 6) {
        // Rating column
        styleMap[cellRef] = getScoreStyle(dataRow[c], isOdd);
      } else if (c === 7) {
        // Status column
        styleMap[cellRef] = getStatusStyle(dataRow[c]);
      } else if (isSingleWashroom && (c === 5 || c === 8 || c === 9)) {
        // Duration, Before, After
        styleMap[cellRef] = createCellStyle(bg, "0F172A", false, "center");
      } else if (!isSingleWashroom && c === 8) {
        // Total images
        styleMap[cellRef] = createCellStyle(bg, "0F172A", false, "center");
      } else {
        styleMap[cellRef] = createCellStyle(bg, "0F172A", false, "left");
      }
    }
  });

  // Summary Row at Bottom
  const summaryRowNum = 12 + (data?.length || 0);
  const summaryRow = Array(numCols).fill("");
  summaryRow[0] = "TOTAL";
  summaryRow[1] = isSingleWashroom ? `${data?.length || 0} Cleaning Records` : `${data?.length || 0} Washrooms`;
  summaryRow[6] = avgHygieneRating;
  worksheetData.push(summaryRow);

  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}${summaryRowNum}`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.summaryText } },
      fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
      alignment: { horizontal: c === 0 || c >= 6 ? "center" : "left", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: colors.summaryBorder } },
        bottom: { style: "double", color: { rgb: colors.summaryBorder } },
        left: { style: "thin", color: { rgb: colors.summaryBorder } },
        right: { style: "thin", color: { rgb: colors.summaryBorder } },
      },
    };
  }

  // Merges
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }, // Title
    { s: { r: 1, c: 0 }, e: { r: 1, c: numCols - 1 } }, // Subtitle
    { s: { r: 5, c: 0 }, e: { r: 5, c: numCols - 1 } }, // Banner 1
    { s: { r: 9, c: 0 }, e: { r: 9, c: numCols - 1 } }, // Banner 2
    // KPI Cards: 5 cards across 10 cols
    { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } },
    { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } },
    { s: { r: 6, c: 2 }, e: { r: 6, c: 3 } },
    { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } },
    { s: { r: 6, c: 4 }, e: { r: 6, c: 5 } },
    { s: { r: 7, c: 4 }, e: { r: 7, c: 5 } },
    { s: { r: 6, c: 6 }, e: { r: 6, c: 7 } },
    { s: { r: 7, c: 6 }, e: { r: 7, c: 7 } },
    { s: { r: 6, c: 8 }, e: { r: 6, c: 9 } },
    { s: { r: 7, c: 8 }, e: { r: 7, c: 9 } },
  ];

  if (isSingleWashroom) {
    merges.push(
      { s: { r: 3, c: 1 }, e: { r: 3, c: 3 } }, // Washroom Name B4:D4
    );
  } else {
    merges.push(
      { s: { r: 3, c: 1 }, e: { r: 3, c: 4 } }, // Org B4:E4
      { s: { r: 3, c: 6 }, e: { r: 3, c: 7 } }, // Date Range G4:H4
    );
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  ws["!merges"] = merges;

  // Apply Styles
  Object.keys(styleMap).forEach((cellRef) => {
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = styleMap[cellRef];
  });

  // Column Widths
  ws["!cols"] = isSingleWashroom
    ? [
        { wch: 8 },
        { wch: 22 },
        { wch: 16 },
        { wch: 22 },
        { wch: 22 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
        { wch: 14 },
        { wch: 14 },
      ]
    : [
        { wch: 8 },
        { wch: 28 },
        { wch: 32 },
        { wch: 16 },
        { wch: 16 },
        { wch: 22 },
        { wch: 12 },
        { wch: 15 },
        { wch: 14 },
        { wch: 22 },
      ];

  // Row Heights
  const rowHeights = [
    { hpt: 34 }, // Row 1
    { hpt: 22 }, // Row 2
    { hpt: 12 }, // Row 3
    { hpt: 25 }, // Row 4
    { hpt: 12 }, // Row 5
    { hpt: 24 }, // Row 6
    { hpt: 22 }, // Row 7
    { hpt: 28 }, // Row 8
    { hpt: 12 }, // Row 9
    { hpt: 24 }, // Row 10
    { hpt: 27 }, // Row 11
  ];
  for (let i = 0; i < (data?.length || 0); i++) {
    rowHeights.push({ hpt: 22 });
  }
  rowHeights.push({ hpt: 26 }); // Summary row
  ws["!rows"] = rowHeights;

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    isSingleWashroom ? "Single Washroom" : "All Washrooms",
  );

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// const exportCleanerReportToPDF = (data, metadata) => {
//     const doc = new jsPDF("l", "mm", "a4");
//     const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Cleaner Report";
//     const isSingleCleaner = metadata.is_single_cleaner;

//     // ✅ Helper: Format date range display
//     const getDateRangeDisplay = () => {
//         const startDate = metadata?.date_range?.start;
//         const endDate = metadata?.date_range?.end;

//         const formatDate = (dateStr) => {
//             if (!dateStr || dateStr === "Beginning" || dateStr === "Now") return dateStr;
//             try {
//                 return new Date(dateStr).toLocaleDateString('en-IN', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric'
//                 });
//             } catch {
//                 return dateStr;
//             }
//         };

//         if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
//             return "Beginning to Now";
//         }

//         if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
//             return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric'
//             })}`;
//         }

//         if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
//             const formattedStart = formatDate(startDate);
//             const formattedEnd = formatDate(endDate);
//             return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
//         }

//         if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
//             return `Beginning to ${formatDate(endDate)}`;
//         }

//         return "Date Range Not Specified";
//     };

//     // ✅ Report Title
//     doc.setFontSize(20);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(30, 58, 138);
//     doc.text(reportTitle, 14, 15);

//     doc.setDrawColor(30, 58, 138);
//     doc.setLineWidth(0.5);
//     doc.line(14, 18, 283, 18);

//     let currentY = 25;

//     // ✅ Enhanced Metadata Section
//     if (isSingleCleaner) {
//         autoTable(doc, {
//             head: [["Organization", "Cleaner Name", "Phone", "Date Range", "Generated On"]],
//             body: [[
//                 metadata.organization || "N/A",
//                 metadata.cleaner_name || "N/A",
//                 metadata.cleaner_phone || "N/A",
//                 getDateRangeDisplay(),
//                 new Date(metadata.generated_on).toLocaleString('en-IN', {
//                     day: '2-digit',
//                     month: '2-digit',
//                     year: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     hour12: true
//                 })
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [241, 245, 249],
//                 textColor: [51, 65, 85],
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'left',
//                 cellPadding: 3,
//             },
//             columnStyles: {
//                 0: { halign: 'left', cellWidth: 30 },
//                 1: { halign: 'left', cellWidth: 35 },
//                 2: { halign: 'center', cellWidth: 25 },
//                 3: { halign: 'center', cellWidth: 35 },
//                 4: { halign: 'center', cellWidth: 40 }
//             },
//             margin: { left: 14, right: 14 },
//         });
//     } else {
//         autoTable(doc, {
//             head: [["Organization", "Report Type", "Date Range", "Generated On"]],
//             body: [[
//                 metadata.organization || "N/A",
//                 reportTitle,
//                 getDateRangeDisplay(),
//                 new Date(metadata.generated_on).toLocaleString('en-IN', {
//                     day: '2-digit',
//                     month: '2-digit',
//                     year: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     hour12: true
//                 })
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [241, 245, 249],
//                 textColor: [51, 65, 85],
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'center',
//                 cellPadding: 3,
//             },
//             margin: { left: 14, right: 14 },
//         });
//     }

//     currentY = doc.lastAutoTable.finalY + 3;

//     // ✅ SINGLE CLEANER REPORT
//     if (isSingleCleaner) {
//         // Performance Summary Stats
//         autoTable(doc, {
//             head: [["Total Cleanings", "Completed", "Ongoing", "Avg Rating", "Avg Duration (min)"]],
//             body: [[
//                 metadata.total_cleanings || 0,
//                 metadata.completed || 0,
//                 metadata.ongoing || 0,
//                 typeof metadata.avg_ai_score === 'number' ? metadata.avg_ai_score.toFixed(2) : metadata.avg_ai_score,
//                 metadata.avg_duration || 0
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [16, 185, 129],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'center',
//                 cellPadding: 3,
//                 fontStyle: 'bold',
//                 fillColor: [236, 253, 245]
//             },
//             margin: { left: 14, right: 14 },
//         });

//         currentY = doc.lastAutoTable.finalY + 8;

//         // Cleaning Tasks Table
//         const formatDateTime = (date) => {
//             if (!date) return "Ongoing";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((task, index) => [
//             index + 1,
//             task.washroom_name || "N/A",
//             task.zone_type || "N/A",
//             formatDateTime(task.start_time),
//             formatDateTime(task.end_time),
//             task.duration_minutes || 0,
//             task.rating ? task.rating.toFixed(1) : "N/A",
//             task.status ? task.status.toUpperCase() : "N/A",
//             task.before_image_count || 0,
//             task.after_image_count || 0
//         ]);

//         autoTable(doc, {
//             head: [[
//                 "#",
//                 "Washroom",
//                 "Zone",
//                 "Start Time",
//                 "End Time",
//                 "Duration (min)",
//                 "Rating",
//                 "Status",
//                 "Before",
//                 "After"
//             ]],
//             body: tableData,
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [37, 99, 235],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 8,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 7,
//                 textColor: 50,
//             },
//             alternateRowStyles: {
//                 fillColor: [248, 250, 252]
//             },
//             columnStyles: {
//                 0: { halign: 'center', cellWidth: 8 },
//                 5: { halign: 'center' },
//                 6: { halign: 'center' },
//                 7: { halign: 'center', fontStyle: 'bold' },
//                 8: { halign: 'center' },
//                 9: { halign: 'center' }
//             },
//             margin: { left: 14, right: 14 },
//         });
//     }
//     // ✅ ALL CLEANERS REPORT
//     else {
//         // Summary Stats
//         autoTable(doc, {
//             head: [["Total Cleaners", "Total Tasks", "Completed", "Ongoing", "Avg Rating", "Avg Duration (min)"]],
//             body: [[
//                 metadata.total_cleaners || 0,
//                 metadata.total_tasks || 0,
//                 metadata.completed || 0,
//                 metadata.ongoing || 0,
//                 metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
//                 metadata.avg_duration || 0
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [16, 185, 129],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'center',
//                 cellPadding: 3,
//                 fontStyle: 'bold',
//                 fillColor: [236, 253, 245]
//             },
//             margin: { left: 14, right: 14 },
//         });

//         currentY = doc.lastAutoTable.finalY + 8;

//         // Cleaners Details Table
//         const formatDateTime = (date) => {
//             if (!date) return "N/A";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((cleaner, index) => [
//             index + 1,
//             cleaner.name || "N/A",
//             cleaner.phone || "N/A",
//             cleaner.total_tasks || 0,
//             cleaner.completed_tasks || 0,
//             cleaner.avg_rating ? cleaner.avg_rating.toFixed(1) : "N/A",
//             cleaner.status ? cleaner.status.toUpperCase() : "N/A",
//             formatDateTime(cleaner.last_task_on)
//         ]);

//         autoTable(doc, {
//             head: [[
//                 "#",
//                 "Cleaner Name",
//                 "Phone",
//                 "Total Tasks",
//                 "Completed",
//                 "Avg Rating",
//                 "Status",
//                 "Last Task"
//             ]],
//             body: tableData,
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [37, 99, 235],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 8,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 7,
//                 textColor: 50,
//             },
//             alternateRowStyles: {
//                 fillColor: [248, 250, 252]
//             },
//             columnStyles: {
//                 0: { halign: 'center', cellWidth: 8 },
//                 3: { halign: 'center' },
//                 4: { halign: 'center' },
//                 5: { halign: 'center' },
//                 6: { halign: 'center', fontStyle: 'bold' },
//                 7: { halign: 'center' }
//             },
//             margin: { left: 14, right: 14 },
//         });
//     }

//     // ✅ Add footers and page numbers
//     addLogosToAllPages(doc);

//     const pageCount = doc.internal.getNumberOfPages();
//     doc.setFontSize(8);
//     doc.setTextColor(100);
//     for (let i = 1; i <= pageCount; i++) {
//         doc.setPage(i);
//         doc.text(
//             `Page ${i} of ${pageCount}`,
//             doc.internal.pageSize.width / 2,
//             doc.internal.pageSize.height - 10,
//             { align: 'center' }
//         );
//         doc.text(
//             `Generated on ${new Date().toLocaleString('en-IN')}`,
//             14,
//             doc.internal.pageSize.height - 10
//         );
//     }

//     const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
//     outputPdf(doc, fileName);
// };

// //  EXPORT CLEANER REPORT TO EXCEL
// const exportCleanerReportToExcel = (data, metadata) => {
//     const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Cleaner Report";
//     const isSingleCleaner = metadata.is_single_cleaner;

//     // ✅ Helper: Format date range display
//     const getDateRangeDisplay = () => {
//         const startDate = metadata?.date_range?.start;
//         const endDate = metadata?.date_range?.end;

//         const formatDate = (dateStr) => {
//             if (!dateStr || dateStr === "Beginning" || dateStr === "Now") return dateStr;
//             try {
//                 return new Date(dateStr).toLocaleDateString('en-IN', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric'
//                 });
//             } catch {
//                 return dateStr;
//             }
//         };

//         if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
//             return "Beginning to Now";
//         }

//         if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
//             return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric'
//             })}`;
//         }

//         if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
//             const formattedStart = formatDate(startDate);
//             const formattedEnd = formatDate(endDate);
//             return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
//         }

//         if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
//             return `Beginning to ${formatDate(endDate)}`;
//         }

//         return "Date Range Not Specified";
//     };

//     const headerRows = [
//         [reportTitle],
//         [],
//     ];

//     // ✅ SINGLE CLEANER REPORT
//     if (isSingleCleaner) {
//         headerRows.push(
//             ["Organization", metadata.organization || "N/A"],
//             ["Cleaner Name", metadata.cleaner_name || "N/A"],
//             ["Phone", metadata.cleaner_phone || "N/A"],
//             ["Date Range", getDateRangeDisplay()],
//             ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: '2-digit',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             })],
//             [],
//             ["Performance Summary"],
//             ["Total Tasks", metadata.total_tasks || 0],
//             ["Completed", metadata.completed || 0],
//             ["Ongoing", metadata.ongoing || 0],
//             ["Avg Rating", metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"],
//             ["Avg Duration (min)", metadata.avg_duration || 0],
//             []
//         );

//         const tableHeaders = [
//             "#",
//             "Washroom Name",
//             "Zone Type",
//             "Start Time",
//             "End Time",
//             "Duration (min)",
//             "Rating",
//             "Status",
//             "Before Images",
//             "After Images"
//         ];

//         const formatDateTime = (date) => {
//             if (!date) return "Ongoing";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((task, index) => [
//             index + 1,
//             task.washroom_name || "N/A",
//             task.zone_type || "N/A",
//             formatDateTime(task.start_time),
//             formatDateTime(task.end_time),
//             task.duration_minutes || 0,
//             task.rating ? task.rating.toFixed(1) : "N/A",
//             task.status ? task.status.toUpperCase() : "N/A",
//             task.before_image_count || 0,
//             task.after_image_count || 0
//         ]);

//         const worksheetData = [...headerRows, tableHeaders, ...tableData];
//         const wb = XLSX.utils.book_new();
//         const ws = XLSX.utils.aoa_to_sheet(worksheetData);

//         ws["!cols"] = [
//             { wch: 5 },
//             { wch: 25 },
//             { wch: 20 },
//             { wch: 22 },
//             { wch: 22 },
//             { wch: 15 },
//             { wch: 10 },
//             { wch: 12 },
//             { wch: 15 },
//             { wch: 15 }
//         ];

//         ws["A1"].s = {
//             font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
//             alignment: { horizontal: "left", vertical: "center" },
//         };

//         ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

//         XLSX.utils.book_append_sheet(wb, ws, "Single Cleaner");

//         const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
//         XLSX.writeFile(wb, fileName);
//     }
//     // ✅ ALL CLEANERS REPORT
//     else {
//         headerRows.push(
//             ["Organization", metadata.organization || "N/A"],
//             ["Report Type", reportTitle],
//             ["Date Range", getDateRangeDisplay()],
//             ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: '2-digit',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             })],
//             [],
//             ["Summary Statistics"],
//             ["Total Cleaners", metadata.total_cleaners || 0],
//             ["Total Tasks", metadata.total_tasks || 0],
//             ["Completed", metadata.completed || 0],
//             ["Ongoing", metadata.ongoing || 0],
//             ["Avg Rating", metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"],
//             ["Avg Duration (min)", metadata.avg_duration || 0],
//             []
//         );

//         const tableHeaders = [
//             "#",
//             "Cleaner Name",
//             "Phone",
//             "Total Tasks",
//             "Completed",
//             "Avg Rating",
//             "Status",
//             "Last Task"
//         ];

//         const formatDateTime = (date) => {
//             if (!date) return "N/A";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((cleaner, index) => [
//             index + 1,
//             cleaner.name || "N/A",
//             cleaner.phone || "N/A",
//             cleaner.total_tasks || 0,
//             cleaner.completed_tasks || 0,
//             cleaner.avg_rating ? cleaner.avg_rating.toFixed(1) : "N/A",
//             cleaner.status ? cleaner.status.toUpperCase() : "N/A",
//             formatDateTime(cleaner.last_task_on)
//         ]);

//         const worksheetData = [...headerRows, tableHeaders, ...tableData];
//         const wb = XLSX.utils.book_new();
//         const ws = XLSX.utils.aoa_to_sheet(worksheetData);

//         ws["!cols"] = [
//             { wch: 5 },
//             { wch: 25 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 12 },
//             { wch: 12 },
//             { wch: 20 }
//         ];

//         ws["A1"].s = {
//             font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
//             alignment: { horizontal: "left", vertical: "center" },
//         };

//         ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

//         XLSX.utils.book_append_sheet(wb, ws, "All Cleaners");

//         const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
//         XLSX.writeFile(wb, fileName);
//     }
// };

// ✅ EXPORT CLEANER REPORT TO PDF - FIXED

const exportCleanerReportToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");
  const reportTitle =
    metadata.dynamic_report_name || metadata.report_type || "Cleaner Report";
  const isSingleCleaner = metadata.is_single_cleaner;

  const totalOngoing = data.reduce(
    (sum, cleaner) => sum + (cleaner.ongoing || 0),
    0,
  );

  // ✅ Helper: Format date range display
  const getDateRangeDisplay = () => {
    const startDate = metadata?.date_range?.start;
    const endDate = metadata?.date_range?.end;

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now")
        return dateStr;
      try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    if (
      (!startDate || startDate === "Beginning") &&
      (!endDate || endDate === "Now")
    ) {
      return new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    if (
      startDate &&
      startDate !== "Beginning" &&
      (!endDate || endDate === "Now")
    ) {
      return `${formatDate(startDate)} to ${new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      )}`;
    }

    if (
      startDate &&
      endDate &&
      startDate !== "Beginning" &&
      endDate !== "Now"
    ) {
      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
      return formattedStart === formattedEnd
        ? formattedStart
        : `${formattedStart} to ${formattedEnd}`;
    }

    if (
      (!startDate || startDate === "Beginning") &&
      endDate &&
      endDate !== "Now"
    ) {
      return `Beginning to ${formatDate(endDate)}`;
    }

    return "Date Range Not Specified";
  };

  // ✅ Report Title
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(reportTitle, 14, 15);

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, 18, 283, 18);

  let currentY = 25;

  // ✅ Enhanced Metadata Section
  if (isSingleCleaner) {
    autoTable(doc, {
      head: [
        ["Organization", "Cleaner Name", "Phone", "Date Range", "Generated On"],
      ],
      body: [
        [
          metadata.organization || "N/A",
          metadata.cleaner_name || "N/A",
          metadata.cleaner_phone || "N/A",
          getDateRangeDisplay(),
          new Date(metadata.generated_on).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "left",
        cellPadding: 3,
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 30 },
        1: { halign: "left", cellWidth: 35 },
        2: { halign: "center", cellWidth: 25 },
        3: { halign: "center", cellWidth: 35 },
        4: { halign: "center", cellWidth: 40 },
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    autoTable(doc, {
      head: [["Organization", "Report Type", "Date Range", "Generated On"]],
      body: [
        [
          metadata.organization || "N/A",
          reportTitle,
          getDateRangeDisplay(),
          new Date(metadata.generated_on).toLocaleString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [51, 65, 85],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
      },
      margin: { left: 14, right: 14 },
    });
  }

  currentY = doc.lastAutoTable.finalY + 3;

  // ✅ SINGLE CLEANER REPORT
  if (isSingleCleaner) {
    // Performance Summary Stats
    autoTable(doc, {
      head: [
        [
          "Total Cleanings",
          "Completed",
          "Ongoing",
          "Avg Score",
          "Avg Duration (min)",
        ],
      ],
      body: [
        [
          metadata.total_cleanings || 0,
          metadata.completed || 0,
          metadata.ongoing || 0,
          typeof metadata.avg_ai_score === "number"
            ? metadata.avg_ai_score.toFixed(2)
            : metadata.avg_ai_score || "N/A",
          metadata.avg_duration || 0,
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
        fontStyle: "bold",
        fillColor: [236, 253, 245],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    // Cleaning Records Table - FIXED to match actual data structure
    const tableData = data.map((record, index) => [
      index + 1,
      record.date || "N/A",
      record.washroom_name || "N/A",
      record.zone_type || "N/A",
      record.time || "N/A",
      record.status === "Incomplete" ? "N/A" : record.duration,
      record.rating
        ? typeof record.rating === "number"
          ? record.rating.toFixed(1)
          : record.rating
        : "N/A",
      record.status ? record.status.toUpperCase() : "N/A",
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "Date",
          "Washroom",
          "Zone",
          "Time",
          "Duration (min)",
          "Score",
          "Status",
        ],
      ],
      body: tableData,
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
    });
  }
  // ✅ ALL CLEANERS REPORT
  else {
    // Summary Stats
    autoTable(doc, {
      head: [["Total Cleaners", "Total Task", "Completed", "Ongoing"]],
      body: [
        [
          metadata.total_cleaners || 0,
          metadata.top_avg_score.length || 0,
          metadata.total_cleanings_completed || 0,
          totalOngoing, // metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
          // metadata.avg_duration || 0
        ],
      ],
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [30, 41, 59],
        halign: "center",
        cellPadding: 3,
        fontStyle: "bold",
        fillColor: [236, 253, 245],
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    // Cleaners Details Table - FIXED
    const tableData = data.map((cleaner, index) => [
      index + 1,
      cleaner.cleaner_name || "N/A",
      cleaner.location_name ||
        (cleaner.assigned_washrooms && cleaner.assigned_washrooms.length > 0
          ? cleaner.assigned_washrooms.map((w) => w.name).join(", ")
          : "N/A"),
      cleaner.total_cleanings || 0,
      cleaner.completed || 0,
      cleaner.ongoing || 0,
      cleaner.incomplete || 0,
      cleaner?.avg_ai_score || "N/A",
      cleaner?.avg_duration || 0,
      cleaner.last_activity
        ? new Date(cleaner.last_activity).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "Cleaner Name",
          "Location",
          "Total Tasks",
          "Completed",
          "Ongoing",
          "Incomplete",
          "Avg Score",
          "Duration (min)",
          "Last Activity",
        ],
      ],
      body: tableData,
      startY: currentY,
      theme: "grid",
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        halign: "center",
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center", fontStyle: "bold" },
        7: { halign: "center" },
      },
      margin: { left: 14, right: 14 },
    });
  }

  // ✅ Add footers and page numbers
  //addLogosToAllPages(doc);

  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" },
    );
    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN")}`,
      14,
      doc.internal.pageSize.height - 10,
    );
  }

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

// ✅ EXPORT CLEANER REPORT TO EXCEL - REFINED EXECUTIVE THEME
const exportCleanerReportToExcel = (data, metadata) => {
  const isSingleCleaner = metadata.is_single_cleaner;
  const reportTitle =
    metadata.dynamic_report_name ||
    metadata.report_type ||
    (isSingleCleaner ? "Cleaner Performance Report" : "All Cleaners Report");

  // Helper: Format date range display
  const getDateRangeDisplay = () => {
    const startDate = metadata?.date_range?.start;
    const endDate = metadata?.date_range?.end;

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now")
        return dateStr;
      try {
        return new Date(dateStr).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    if (
      (!startDate || startDate === "Beginning") &&
      (!endDate || endDate === "Now")
    ) {
      return new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    if (
      startDate &&
      startDate !== "Beginning" &&
      (!endDate || endDate === "Now")
    ) {
      return `${formatDate(startDate)} to ${new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      )}`;
    }

    if (
      startDate &&
      endDate &&
      startDate !== "Beginning" &&
      endDate !== "Now"
    ) {
      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);
      return formattedStart === formattedEnd
        ? formattedStart
        : `${formattedStart} to ${formattedEnd}`;
    }

    if (
      (!startDate || startDate === "Beginning") &&
      endDate &&
      endDate !== "Now"
    ) {
      return `Beginning to ${formatDate(endDate)}`;
    }

    return "Date Range Not Specified";
  };

  // Refined Executive Theme (Matching Refined-Headers specification)
  const colors = {
    titleBg: "F1F5F9",
    titleText: "0F172A",
    titleBorderBottom: "475569",

    subtitleBg: "F8FAFC",
    subtitleText: "475569",
    subtitleBorderBottom: "CBD5E1",

    metaLabelBg: "E2E8F0",
    metaLabelText: "334155",
    metaValBg: "F8FAFC",
    metaValText: "0F172A",
    borderColor: "CBD5E1",

    bannerBg: "E2E8F0",
    bannerText: "1E293B",
    bannerBorderBottom: "475569",

    kpiHeaderBg: "F1F5F9",
    kpiHeaderText: "475569",

    cardValBg: "FFFFFF",
    cardTotalText: "0F172A",
    cardCompletedText: "15803D",
    cardOngoingText: "0369A1",
    cardIncompleteText: "B91C1C",
    cardScoreText: "B45309",
    cardDurationText: "334155",

    tableHeaderBg: "334155",
    tableHeaderText: "FFFFFF",

    rowOddBg: "F8FAFC",

    statusCompletedBg: "DCFCE7",
    statusCompletedText: "15803D",

    statusOverdueBg: "FEE2E2",
    statusOverdueText: "DC2626",

    statusOngoingBg: "EFF6FF",
    statusOngoingText: "1D4ED8",

    statusIncompleteBg: "FEF3C7",
    statusIncompleteText: "B45309",

    scoreHighBg: "DCFCE7",
    scoreHighText: "15803D",
    scoreMidBg: "FEF3C7",
    scoreMidText: "B45309",
    scoreLowBg: "FEE2E2",
    scoreLowText: "DC2626",

    summaryBg: "E2E8F0",
    summaryText: "0F172A",
    summaryBorder: "94A3B8",
  };

  const createCellStyle = (
    bgColor = "FFFFFF",
    textColor = "000000",
    bold = false,
    align = "left",
    sz = 10,
    borderStyle = "thin",
    borderColor = colors.borderColor,
    italic = false,
  ) => ({
    font: { name: "Calibri", bold, italic, color: { rgb: textColor }, sz },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
    border: {
      left: { style: borderStyle, color: { rgb: borderColor } },
      right: { style: borderStyle, color: { rgb: borderColor } },
      top: { style: borderStyle, color: { rgb: borderColor } },
      bottom: { style: borderStyle, color: { rgb: borderColor } },
    },
  });

  const createKpiCardValStyle = (textColor) => ({
    font: { name: "Calibri", bold: true, sz: 13, color: { rgb: textColor } },
    fill: { fgColor: { rgb: colors.cardValBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
    },
  });

  const worksheetData = [];
  const styleMap = {};

  const formattedGeneratedOn = new Date(
    metadata.generated_on || Date.now(),
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const numCols = isSingleCleaner ? 8 : 10;

  // Row 1: Title Banner
  const titleRow = Array(numCols).fill("");
  titleRow[0] = reportTitle.toUpperCase();
  worksheetData.push(titleRow);
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}1`] = {
      font: { name: "Calibri", bold: true, sz: 15, color: { rgb: colors.titleText } },
      fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "medium", color: { rgb: colors.titleBorderBottom } } },
    };
  }

  // Row 2: Subtitle
  const subText = isSingleCleaner
    ? `Cleaner Audit Trail & Task History | Generated on: ${formattedGeneratedOn}`
    : `Comprehensive Cleaner Performance & Operational Audit | Generated on: ${formattedGeneratedOn}`;
  const subRow = Array(numCols).fill("");
  subRow[0] = subText;
  worksheetData.push(subRow);
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}2`] = {
      font: { name: "Calibri", italic: true, sz: 9.5, color: { rgb: colors.subtitleText } },
      fill: { fgColor: { rgb: colors.subtitleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "thin", color: { rgb: colors.subtitleBorderBottom } } },
    };
  }

  // Row 3: Blank Spacer
  worksheetData.push([]);

  // Row 4: Scope / Metadata Block
  const dateRangeDisplay = getDateRangeDisplay();
  const labelStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.metaLabelText } },
    fill: { fgColor: { rgb: colors.metaLabelBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };
  const valStyle = {
    font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.metaValText } },
    fill: { fgColor: { rgb: colors.metaValBg }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  let merges = [];

  if (isSingleCleaner) {
    // 8 Columns: A to H
    worksheetData.push([
      "CLEANER NAME",
      metadata.cleaner_name || "N/A",
      "",
      "DATE RANGE",
      dateRangeDisplay,
      "",
      "REPORT TYPE",
      reportTitle,
    ]);
    const metaRow = worksheetData.length;
    styleMap[`A${metaRow}`] = labelStyle;
    styleMap[`B${metaRow}`] = valStyle;
    styleMap[`C${metaRow}`] = valStyle;
    styleMap[`D${metaRow}`] = labelStyle;
    styleMap[`E${metaRow}`] = valStyle;
    styleMap[`F${metaRow}`] = valStyle;
    styleMap[`G${metaRow}`] = labelStyle;
    styleMap[`H${metaRow}`] = valStyle;
  } else {
    // 10 Columns: A to J
    worksheetData.push([
      "ORGANIZATION",
      metadata.organization || "N/A",
      "",
      "",
      "DATE RANGE",
      dateRangeDisplay,
      "",
      "REPORT TYPE",
      reportTitle,
      "",
    ]);
    const metaRow = worksheetData.length;
    styleMap[`A${metaRow}`] = labelStyle;
    styleMap[`B${metaRow}`] = valStyle;
    styleMap[`C${metaRow}`] = valStyle;
    styleMap[`D${metaRow}`] = valStyle;
    styleMap[`E${metaRow}`] = labelStyle;
    styleMap[`F${metaRow}`] = valStyle;
    styleMap[`G${metaRow}`] = valStyle;
    styleMap[`H${metaRow}`] = labelStyle;
    styleMap[`I${metaRow}`] = valStyle;
    styleMap[`J${metaRow}`] = valStyle;
  }

  // Row 5: Blank Spacer
  worksheetData.push([]);

  // Row 6: KPI Banner
  const kpiBannerRowData = Array(numCols).fill("");
  kpiBannerRowData[0] = "EXECUTIVE SUMMARY & OPERATIONAL METRICS";
  worksheetData.push(kpiBannerRowData);
  const kpiBannerRow = worksheetData.length;
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}${kpiBannerRow}`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
      },
    };
  }

  const kpiHdrStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.kpiHeaderText } },
    fill: { fgColor: { rgb: colors.kpiHeaderBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  // Metrics
  const totalCleaners = metadata.total_cleaners || (isSingleCleaner ? 1 : data.length);
  const totalTasks =
    metadata.total_tasks ||
    metadata.total_cleanings ||
    data.reduce((sum, c) => sum + (Number(c.total_cleanings) || 0), 0);
  const completedTasks =
    metadata.total_cleanings_completed !== undefined
      ? metadata.total_cleanings_completed
      : metadata.completed !== undefined
      ? metadata.completed
      : data.reduce((sum, c) => sum + (Number(c.completed) || 0), 0);
  const ongoingTasks =
    metadata.total_cleanings_ongoing !== undefined
      ? metadata.total_cleanings_ongoing
      : metadata.ongoing !== undefined
      ? metadata.ongoing
      : data.reduce((sum, c) => sum + (Number(c.ongoing) || 0), 0);
  const incompleteTasks =
    metadata.incomplete !== undefined
      ? metadata.incomplete
      : data.reduce((sum, c) => sum + (Number(c.incomplete) || 0), 0);

  const validScores = data
    .map((c) => (isSingleCleaner ? Number(c.rating) : Number(c.avg_ai_score)))
    .filter((s) => !isNaN(s) && s > 0);
  const avgScore =
    validScores.length > 0
      ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : metadata.avg_ai_score
      ? Number(metadata.avg_ai_score).toFixed(1)
      : "N/A";

  const validDurations = data
    .map((c) => Number(c.duration || c.avg_duration || 0))
    .filter((d) => !isNaN(d) && d > 0);
  const avgDuration =
    validDurations.length > 0
      ? Math.round(validDurations.reduce((a, b) => a + b, 0) / validDurations.length) + " min"
      : metadata.avg_duration
      ? Math.round(metadata.avg_duration) + " min"
      : "N/A";

  const completionRate =
    totalTasks > 0
      ? ((completedTasks / totalTasks) * 100).toFixed(1) + "%"
      : "0.0%";

  if (isSingleCleaner) {
    // Single Cleaner: 8 columns (A to H)
    worksheetData.push([
      "Total Cleanings",
      "",
      "Completed",
      "Ongoing",
      "Incomplete",
      "Completion Rate",
      "Avg Score",
      "Avg Duration",
    ]);
    const kpiHeaderRow = worksheetData.length;
    for (let c = 0; c < 8; c++) {
      const col = String.fromCharCode(65 + c);
      styleMap[`${col}${kpiHeaderRow}`] = kpiHdrStyle;
    }

    worksheetData.push([
      totalTasks,
      "",
      completedTasks,
      ongoingTasks,
      incompleteTasks,
      completionRate,
      avgScore,
      avgDuration,
    ]);
    const kpiValRow = worksheetData.length;
    styleMap[`A${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`B${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`C${kpiValRow}`] = createKpiCardValStyle(colors.cardCompletedText);
    styleMap[`D${kpiValRow}`] = createKpiCardValStyle(colors.cardOngoingText);
    styleMap[`E${kpiValRow}`] = createKpiCardValStyle(colors.cardIncompleteText);
    styleMap[`F${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`G${kpiValRow}`] = createKpiCardValStyle(colors.cardScoreText);
    styleMap[`H${kpiValRow}`] = createKpiCardValStyle(colors.cardDurationText);
  } else {
    // All Cleaners: 10 columns (A to J)
    worksheetData.push([
      "Total Cleaners",
      "",
      "Total Tasks",
      "",
      "Completed Tasks",
      "",
      "Ongoing Tasks",
      "Incomplete Tasks",
      "Avg Score",
      "Avg Duration",
    ]);
    const kpiHeaderRow = worksheetData.length;
    for (let c = 0; c < 10; c++) {
      const col = String.fromCharCode(65 + c);
      styleMap[`${col}${kpiHeaderRow}`] = kpiHdrStyle;
    }

    worksheetData.push([
      totalCleaners,
      "",
      totalTasks,
      "",
      completedTasks,
      "",
      ongoingTasks,
      incompleteTasks,
      avgScore,
      avgDuration,
    ]);
    const kpiValRow = worksheetData.length;
    styleMap[`A${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`B${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`C${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`D${kpiValRow}`] = createKpiCardValStyle(colors.cardTotalText);
    styleMap[`E${kpiValRow}`] = createKpiCardValStyle(colors.cardCompletedText);
    styleMap[`F${kpiValRow}`] = createKpiCardValStyle(colors.cardCompletedText);
    styleMap[`G${kpiValRow}`] = createKpiCardValStyle(colors.cardOngoingText);
    styleMap[`H${kpiValRow}`] = createKpiCardValStyle(colors.cardIncompleteText);
    styleMap[`I${kpiValRow}`] = createKpiCardValStyle(colors.cardScoreText);
    styleMap[`J${kpiValRow}`] = createKpiCardValStyle(colors.cardDurationText);
  }

  // Row 9: Blank Spacer
  worksheetData.push([]);

  // Row 10: Table Banner
  const tableBannerRowData = Array(numCols).fill("");
  tableBannerRowData[0] = isSingleCleaner
    ? "CLEANING TASK ACTIVITY LOGS & AUDIT TRAIL"
    : "CLEANER PERFORMANCE & ACTIVITY AUDIT TRAIL";
  worksheetData.push(tableBannerRowData);
  const tableBannerRow = worksheetData.length;
  for (let c = 0; c < numCols; c++) {
    const col = String.fromCharCode(65 + c);
    styleMap[`${col}${tableBannerRow}`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
      },
    };
  }

  // Row 11: Main Table Headers
  const tableHeaders = isSingleCleaner
    ? ["#", "Date", "Washroom Name", "Zone Type", "Time", "Duration (min)", "Score", "Status"]
    : [
        "Sr. No.",
        "Cleaner Name",
        "Location",
        "Total Tasks",
        "Completed",
        "Ongoing",
        "Incomplete",
        "Avg Score",
        "Duration (min)",
        "Last Activity",
      ];
  worksheetData.push(tableHeaders);
  const tableHeaderRowNum = worksheetData.length;
  tableHeaders.forEach((header, colIdx) => {
    const colLetter = String.fromCharCode(65 + colIdx);
    const align =
      (!isSingleCleaner && (colIdx === 1 || colIdx === 2)) ||
      (isSingleCleaner && (colIdx === 2 || colIdx === 3))
        ? "left"
        : "center";
    styleMap[`${colLetter}${tableHeaderRowNum}`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.tableHeaderText } },
      fill: { fgColor: { rgb: colors.tableHeaderBg }, patternType: "solid" },
      alignment: { horizontal: align, vertical: "center", wrapText: true },
      border: {
        top: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        bottom: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };
  });

  // Row 12+: Data Rows
  if (isSingleCleaner) {
    data.forEach((record, idx) => {
      const rowNum = worksheetData.length + 1;
      const scoreNum = parseFloat(record.rating);
      const scoreDisplay = !isNaN(scoreNum) ? scoreNum.toFixed(1) : (record.rating || "N/A");
      const durationDisplay = record.status === "Incomplete" ? "N/A" : (record.duration ? `${record.duration} min` : "0 min");
      const statusStr = record.status ? record.status.toUpperCase() : "N/A";

      const dataRow = [
        idx + 1,
        record.date || "N/A",
        record.washroom_name || "N/A",
        record.zone_type || "N/A",
        record.time || "N/A",
        durationDisplay,
        scoreDisplay,
        statusStr,
      ];
      worksheetData.push(dataRow);

      const baseRowBg = idx % 2 === 0 ? "FFFFFF" : colors.rowOddBg;

      dataRow.forEach((val, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        let cellBg = baseRowBg;
        let cellText = "0F172A";
        let isBold = false;
        let align = "center";
        let borderCol = colors.borderColor;

        if (colIdx === 2 || colIdx === 3) align = "left";

        // Score Pill
        if (colIdx === 6 && !isNaN(scoreNum)) {
          isBold = true;
          if (scoreNum >= 8.0) {
            cellBg = colors.scoreHighBg;
            cellText = colors.scoreHighText;
          } else if (scoreNum >= 6.0) {
            cellBg = colors.scoreMidBg;
            cellText = colors.scoreMidText;
          } else {
            cellBg = colors.scoreLowBg;
            cellText = colors.scoreLowText;
          }
        }

        // Status Pill
        if (colIdx === 7) {
          isBold = true;
          if (statusStr === "COMPLETED") {
            cellBg = colors.statusCompletedBg;
            cellText = colors.statusCompletedText;
          } else if (statusStr === "OVERDUE") {
            cellBg = colors.statusOverdueBg;
            cellText = colors.statusOverdueText;
          } else if (statusStr === "ONGOING") {
            cellBg = colors.statusOngoingBg;
            cellText = colors.statusOngoingText;
          } else {
            cellBg = colors.statusIncompleteBg;
            cellText = colors.statusIncompleteText;
          }
        }

        styleMap[`${colLetter}${rowNum}`] = createCellStyle(
          cellBg,
          cellText,
          isBold,
          align,
          10,
          "thin",
          borderCol,
        );
      });
    });

    // Summary Row (Single Cleaner)
    const summaryRowNum = worksheetData.length + 1;
    const summaryRow = [
      "",
      "TOTAL",
      `${data.length} Cleanings`,
      "",
      "",
      avgDuration,
      avgScore,
      completionRate,
    ];
    worksheetData.push(summaryRow);
    summaryRow.forEach((cell, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      const align = (colIdx === 1 || colIdx === 2) ? "left" : "center";
      styleMap[`${colLetter}${summaryRowNum}`] = {
        font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.summaryText } },
        fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
        alignment: { horizontal: align, vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: colors.summaryBorder } },
          bottom: { style: "double", color: { rgb: colors.summaryBorder } },
          left: { style: "thin", color: { rgb: colors.summaryBorder } },
          right: { style: "thin", color: { rgb: colors.summaryBorder } },
        },
      };
    });
  } else {
    // All Cleaners Data Rows
    data.forEach((cleaner, idx) => {
      const rowNum = worksheetData.length + 1;
      const scoreNum = parseFloat(cleaner.avg_ai_score);
      const scoreDisplay = !isNaN(scoreNum) ? scoreNum.toFixed(1) : (cleaner.avg_ai_score || "N/A");
      const durationDisplay = cleaner.avg_duration ? `${cleaner.avg_duration} min` : "0 min";

      let lastActivityStr = "N/A";
      if (cleaner.last_activity) {
        try {
          lastActivityStr = new Date(cleaner.last_activity).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } catch {
          lastActivityStr = String(cleaner.last_activity);
        }
      }

      const locName = cleaner.location_name ||
        (cleaner.assigned_washrooms && cleaner.assigned_washrooms.length > 0
          ? cleaner.assigned_washrooms.map((w) => w.name).join(", ")
          : "N/A");

      const dataRow = [
        idx + 1,
        cleaner.cleaner_name || "N/A",
        locName,
        cleaner.total_cleanings || 0,
        cleaner.completed || 0,
        cleaner.ongoing || 0,
        cleaner.incomplete || 0,
        scoreDisplay,
        durationDisplay,
        lastActivityStr,
      ];
      worksheetData.push(dataRow);

      const baseRowBg = idx % 2 === 0 ? "FFFFFF" : colors.rowOddBg;

      dataRow.forEach((val, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        let cellBg = baseRowBg;
        let cellText = "0F172A";
        let isBold = false;
        let align = "center";
        let borderCol = colors.borderColor;

        if (colIdx === 1 || colIdx === 2) align = "left";
        if (colIdx === 1) isBold = true;

        // Ongoing > 0
        if (colIdx === 5 && cleaner.ongoing > 0) {
          cellBg = colors.statusOngoingBg;
          cellText = colors.statusOngoingText;
          isBold = true;
        }

        // Incomplete > 0
        if (colIdx === 6 && cleaner.incomplete > 0) {
          cellBg = colors.statusOverdueBg;
          cellText = colors.statusOverdueText;
          isBold = true;
        }

        // Score Pill
        if (colIdx === 7 && !isNaN(scoreNum)) {
          isBold = true;
          if (scoreNum >= 8.0) {
            cellBg = colors.scoreHighBg;
            cellText = colors.scoreHighText;
          } else if (scoreNum >= 6.0) {
            cellBg = colors.scoreMidBg;
            cellText = colors.scoreMidText;
          } else {
            cellBg = colors.scoreLowBg;
            cellText = colors.scoreLowText;
          }
        }

        styleMap[`${colLetter}${rowNum}`] = createCellStyle(
          cellBg,
          cellText,
          isBold,
          align,
          10,
          "thin",
          borderCol,
        );
      });
    });

    // Summary Row (All Cleaners)
    const summaryRowNum = worksheetData.length + 1;
    const summaryRow = [
      "",
      "TOTAL / OVERALL AVERAGES",
      `${data.length} Cleaners`,
      totalTasks,
      completedTasks,
      ongoingTasks,
      incompleteTasks,
      avgScore,
      avgDuration,
      "",
    ];
    worksheetData.push(summaryRow);
    summaryRow.forEach((cell, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      const align = (colIdx === 1 || colIdx === 2) ? "left" : "center";
      styleMap[`${colLetter}${summaryRowNum}`] = {
        font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.summaryText } },
        fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
        alignment: { horizontal: align, vertical: "center" },
        border: {
          top: { style: "medium", color: { rgb: colors.summaryBorder } },
          bottom: { style: "double", color: { rgb: colors.summaryBorder } },
          left: { style: "thin", color: { rgb: colors.summaryBorder } },
          right: { style: "thin", color: { rgb: colors.summaryBorder } },
        },
      };
    });
  }

  // Workbook & Sheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column Widths
  ws["!cols"] = isSingleCleaner
    ? [
        { wch: 8 },  // #
        { wch: 16 }, // Date
        { wch: 38 }, // Washroom Name
        { wch: 18 }, // Zone Type
        { wch: 16 }, // Time
        { wch: 16 }, // Duration (min)
        { wch: 15 }, // Score
        { wch: 18 }, // Status
      ]
    : [
        { wch: 8 },  // Sr. No.
        { wch: 28 }, // Cleaner Name
        { wch: 38 }, // Location
        { wch: 14 }, // Total Tasks
        { wch: 14 }, // Completed
        { wch: 14 }, // Ongoing
        { wch: 14 }, // Incomplete
        { wch: 15 }, // Avg Score
        { wch: 16 }, // Duration (min)
        { wch: 24 }, // Last Activity
      ];

  // Row Heights
  const rowHeights = [
    { hpt: 34 }, // Row 1 Title
    { hpt: 22 }, // Row 2 Subtitle
    { hpt: 12 }, // Row 3 Spacer
    { hpt: 25 }, // Row 4 Scope
    { hpt: 12 }, // Row 5 Spacer
    { hpt: 24 }, // Row 6 KPI Banner
    { hpt: 22 }, // Row 7 KPI Headers
    { hpt: 28 }, // Row 8 KPI Values
    { hpt: 12 }, // Row 9 Spacer
    { hpt: 24 }, // Row 10 Table Banner
    { hpt: 27 }, // Row 11 Table Headers
  ];
  for (let i = 0; i < data.length; i++) {
    rowHeights.push({ hpt: 22 });
  }
  rowHeights.push({ hpt: 26 }); // Summary row
  ws["!rows"] = rowHeights;

  // Merges
  if (isSingleCleaner) {
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }, // Subtitle
      { s: { r: 3, c: 1 }, e: { r: 3, c: 2 } }, // Cleaner name val
      { s: { r: 3, c: 4 }, e: { r: 3, c: 5 } }, // Date range val
      { s: { r: 5, c: 0 }, e: { r: 5, c: 7 } }, // KPI Banner
      { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }, // Total Cleanings Header
      { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }, // Total Cleanings Val
      { s: { r: 9, c: 0 }, e: { r: 9, c: 7 } }, // Table Banner
    ];
  } else {
    merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }, // Title
      { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } }, // Subtitle
      { s: { r: 3, c: 1 }, e: { r: 3, c: 3 } }, // Org val (B4:D4)
      { s: { r: 3, c: 5 }, e: { r: 3, c: 6 } }, // Date Range val (F4:G4)
      { s: { r: 3, c: 8 }, e: { r: 3, c: 9 } }, // Report Type val (I4:J4)
      { s: { r: 5, c: 0 }, e: { r: 5, c: 9 } }, // KPI Banner
      { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }, // Total Cleaners Header
      { s: { r: 7, c: 0 }, e: { r: 7, c: 1 } }, // Total Cleaners Val
      { s: { r: 6, c: 2 }, e: { r: 6, c: 3 } }, // Total Tasks Header
      { s: { r: 7, c: 2 }, e: { r: 7, c: 3 } }, // Total Tasks Val
      { s: { r: 6, c: 4 }, e: { r: 6, c: 5 } }, // Completed Tasks Header
      { s: { r: 7, c: 4 }, e: { r: 7, c: 5 } }, // Completed Tasks Val
      { s: { r: 9, c: 0 }, e: { r: 9, c: 9 } }, // Table Banner
    ];
  }
  ws["!merges"] = merges;

  // Apply styles
  Object.keys(styleMap).forEach((cellRef) => {
    if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
    ws[cellRef].s = styleMap[cellRef];
  });

  XLSX.utils.book_append_sheet(
    wb,
    ws,
    isSingleCleaner ? "Single Cleaner" : "All Cleaners",
  );

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

const exportCleanerPenaltySummaryToExcel = (data, metadata) => {
  const wb = XLSX.utils.book_new();

  const colors = {
    title: "1E3A8A",      // Dark Blue
    headerBg: "F1F5F9",   // Light Gray
    headerText: "1E293B", // Slate
    summaryBg: "0F766E",  // Teal
    summaryText: "FFFFFF",// White
    tableBg: "2563EB",    // Royal Blue
    tableText: "FFFFFF",  // White
    altRowBg: "F8FAFC",   // Crisp Light Slate
    borderColor: "CBD5E1",// Border Gray
    totalBg: "E2E8F0",    // Total Row Slate
  };

  const createCellStyle = (
    bgColor = "FFFFFF",
    textColor = "000000",
    bold = false,
    align = "left",
    wrapText = false
  ) => ({
    font: { bold, color: { rgb: textColor }, sz: 10 },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  });

  const createHeaderStyle = (bgColor, textColor = "FFFFFF", bold = true, sz = 11) => ({
    font: { bold, color: { rgb: textColor }, sz },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  });

  // Calculate totals first so summary metrics are 100% accurate
  let sumPenalties = 0;
  let sumGross = 0;
  let sumApproved = 0;
  let sumPending = 0;
  let sumWaived = 0;
  let sumDisputes = 0;

  (data || []).forEach((c) => {
    sumPenalties += Number(c.total_penalties || 0);
    sumGross += Number(c.gross_amount || 0);
    sumApproved += Number(c.approved_amount || 0);
    sumPending += Number(c.pending_amount || 0);
    sumWaived += Number(c.waived_amount || 0);
    sumDisputes += Number(c.disputes_count || 0);
  });

  // ==========================================
  // SHEET 1: Cleaner Penalty Summary
  // ==========================================
  const worksheetData = [];
  const styleMap = {};

  // 1. Title Banner (Row 1)
  worksheetData.push(["CLEANER PENALTY SUMMARY REPORT"]);
  styleMap["A1"] = {
    font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: colors.title }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
  };

  worksheetData.push([]); // Blank spacer (Row 2)

  // 2. Metadata Section (Rows 3-4, placed comfortably in Columns B-F)
  const formattedGenDate = new Date(metadata?.generated_on || Date.now()).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  worksheetData.push([
    "",
    "Organization:",
    metadata?.organization || "N/A",
    "",
    "Generated On:",
    formattedGenDate,
  ]);
  const row3 = worksheetData.length;
  styleMap[`B${row3}`] = createCellStyle("FFFFFF", colors.headerText, true, "left");
  styleMap[`C${row3}`] = createCellStyle("FFFFFF", "000000", false, "left");
  styleMap[`E${row3}`] = createCellStyle("FFFFFF", colors.headerText, true, "left");
  styleMap[`F${row3}`] = createCellStyle("FFFFFF", "000000", false, "left");

  worksheetData.push([
    "",
    "Date Range:",
    `${metadata?.date_range?.start || "Beginning"} to ${metadata?.date_range?.end || "Now"}`,
    "",
    "Report Type:",
    "Contractual Penalty Deduction Summary",
  ]);
  const row4 = worksheetData.length;
  styleMap[`B${row4}`] = createCellStyle("FFFFFF", colors.headerText, true, "left");
  styleMap[`C${row4}`] = createCellStyle("FFFFFF", "000000", false, "left");
  styleMap[`E${row4}`] = createCellStyle("FFFFFF", colors.headerText, true, "left");
  styleMap[`F${row4}`] = createCellStyle("FFFFFF", "000000", false, "left");

  worksheetData.push([]); // Blank spacer (Row 5)

  // 3. Executive KPI Summary Block (Rows 6-8, horizontal card layout)
  worksheetData.push(["", "EXECUTIVE SUMMARY METRICS"]);
  const kpiBannerRow = worksheetData.length;
  styleMap[`B${kpiBannerRow}`] = {
    font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const kpiHeaders = [
    "",
    "Total Cleaners",
    "Total Penalties",
    "Gross Imposed (Rs.)",
    "Approved / Deducted (Rs.)",
    "Pending Approval (Rs.)",
    "Waived / Reversed (Rs.)",
    "Disputes Count",
  ];
  worksheetData.push(kpiHeaders);
  const kpiHeaderRow = worksheetData.length;
  kpiHeaders.forEach((h, colIdx) => {
    if (!h) return;
    const colLetter = String.fromCharCode(65 + colIdx);
    styleMap[`${colLetter}${kpiHeaderRow}`] = createHeaderStyle(colors.headerBg, colors.headerText, true, 10);
  });

  const kpiValues = [
    "",
    metadata?.total_cleaners || (data || []).length,
    sumPenalties,
    sumGross.toFixed(2),
    sumApproved.toFixed(2),
    sumPending.toFixed(2),
    sumWaived.toFixed(2),
    metadata?.disputes_count || sumDisputes,
  ];
  worksheetData.push(kpiValues);
  const kpiValRow = worksheetData.length;
  kpiValues.forEach((v, colIdx) => {
    if (colIdx === 0) return;
    const colLetter = String.fromCharCode(65 + colIdx);
    const align = colIdx >= 3 && colIdx <= 6 ? "right" : "center";
    styleMap[`${colLetter}${kpiValRow}`] = createCellStyle("FFFFFF", "000000", true, align);
  });

  worksheetData.push([]); // Blank spacer (Row 9)

  // 4. Main Cleaner Summary Table (Row 10+)
  worksheetData.push(["CLEANER-WISE PENALTY BREAKDOWN"]);
  const tableBannerRow = worksheetData.length;
  styleMap[`A${tableBannerRow}`] = {
    font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: colors.title }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  };

  const tableHeaders = [
    "Sr. No.",
    "Cleaner Name",
    "Phone Number",
    "Assigned Washrooms",
    "Total Penalties",
    "Gross Imposed (Rs.)",
    "Approved / Deducted (Rs.)",
    "Pending Approval (Rs.)",
    "Waived / Reversed (Rs.)",
    "Disputes Count",
  ];

  worksheetData.push(tableHeaders);
  const tableHeaderRowNum = worksheetData.length;
  tableHeaders.forEach((header, colIdx) => {
    const colLetter = String.fromCharCode(65 + colIdx);
    styleMap[`${colLetter}${tableHeaderRowNum}`] = createHeaderStyle(colors.tableBg, colors.tableText, true);
  });

  (data || []).forEach((c, idx) => {
    const pCount = Number(c.total_penalties || 0);
    const gAmt = Number(c.gross_amount || 0);
    const aAmt = Number(c.approved_amount || 0);
    const pendAmt = Number(c.pending_amount || 0);
    const wAmt = Number(c.waived_amount || 0);
    const dCount = Number(c.disputes_count || 0);

    const rowData = [
      idx + 1,
      c.cleaner_name || "N/A",
      c.cleaner_phone || "-",
      (c.locations || []).join(", ") || "-",
      pCount,
      gAmt.toFixed(2),
      aAmt.toFixed(2),
      pendAmt.toFixed(2),
      wAmt.toFixed(2),
      dCount,
    ];

    const rNum = worksheetData.length + 1;
    worksheetData.push(rowData);

    const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
    rowData.forEach((val, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      const isBold = colIdx === 1 || colIdx === 4 || colIdx === 5;
      const align =
        colIdx === 0 || colIdx === 2 || colIdx === 4 || colIdx === 9
          ? "center"
          : colIdx >= 5 && colIdx <= 8
          ? "right"
          : "left";
      styleMap[`${colLetter}${rNum}`] = createCellStyle(bgColor, "000000", isBold, align, colIdx === 3);
    });
  });

  // Total Summary Row
  if ((data || []).length > 0) {
    const totalRow = [
      "TOTAL",
      "",
      "",
      "",
      sumPenalties,
      sumGross.toFixed(2),
      sumApproved.toFixed(2),
      sumPending.toFixed(2),
      sumWaived.toFixed(2),
      sumDisputes,
    ];
    const totalRowNum = worksheetData.length + 1;
    worksheetData.push(totalRow);

    totalRow.forEach((val, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      const align =
        colIdx === 0 || colIdx === 4 || colIdx === 9
          ? "center"
          : colIdx >= 5 && colIdx <= 8
          ? "right"
          : "left";
      styleMap[`${colLetter}${totalRowNum}`] = createCellStyle(
        colors.totalBg,
        "000000",
        true,
        align
      );
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Apply Styles
  Object.keys(styleMap).forEach((cellRef) => {
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = styleMap[cellRef];
  });

  // Calculate dynamic auto-fit column widths with ample breathing room
  const colWidths = [10, 24, 18, 34, 16, 22, 26, 24, 24, 16];
  worksheetData.forEach((row, rIdx) => {
    // Skip merged title & section header rows from width calculation
    if (rIdx === 0 || rIdx === 5 || rIdx === 9) return;
    if (!Array.isArray(row)) return;
    row.forEach((val, cIdx) => {
      if (val === null || val === undefined) return;
      const strLen = String(val).length;
      colWidths[cIdx] = Math.max(colWidths[cIdx] || 12, strLen + 4);
    });
  });
  ws["!cols"] = colWidths.map((w) => ({ wch: Math.min(w, 55) }));

  // Set Row Heights
  ws["!rows"] = [
    { hpx: 32 }, // Title
    { hpx: 8 },  // Spacer
    { hpx: 20 }, // Meta 1
    { hpx: 20 }, // Meta 2
    { hpx: 8 },  // Spacer
    { hpx: 24 }, // KPI Title
    { hpx: 22 }, // KPI Headers
    { hpx: 24 }, // KPI Values
    { hpx: 8 },  // Spacer
    { hpx: 26 }, // Table Section Header
    { hpx: 26 }, // Table Header
  ];

  // Merges
  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },                         // A1:J1 Title
    { s: { r: kpiBannerRow - 1, c: 1 }, e: { r: kpiBannerRow - 1, c: 7 } }, // B6:H6 KPI Banner
    { s: { r: tableBannerRow - 1, c: 0 }, e: { r: tableBannerRow - 1, c: 9 } }, // Table Header Banner
  ];
  if ((data || []).length > 0) {
    const totalRowIdx = worksheetData.length - 1;
    merges.push({ s: { r: totalRowIdx, c: 0 }, e: { r: totalRowIdx, c: 3 } }); // TOTAL merge A..D
  }
  ws["!merges"] = merges;

  XLSX.utils.book_append_sheet(wb, ws, "Penalty Summary");

  // ==========================================
  // SHEET 2: Itemized Violations Breakdown
  // ==========================================
  const itemizedRows = [];
  const itemizedStyles = {};

  // Title Row
  itemizedRows.push(["ITEMIZED PENALTY VIOLATIONS BREAKDOWN"]);
  itemizedStyles["A1"] = {
    font: { bold: true, sz: 15, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: colors.title }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
  };

  itemizedRows.push([]); // Spacer

  const detailHeaders = [
    "Sr. No.",
    "Penalty Number",
    "Violation Date",
    "Cleaner Name",
    "Phone Number",
    "Washroom Location",
    "Rule Code",
    "Rule Description",
    "Hygiene Score",
    "Status",
    "Gross Imposed (Rs.)",
    "Approved Amount (Rs.)",
    "Review ID",
  ];
  const detailHeaderRowNum = itemizedRows.length + 1;
  itemizedRows.push(detailHeaders);
  detailHeaders.forEach((header, colIdx) => {
    const colLetter = String.fromCharCode(65 + colIdx);
    itemizedStyles[`${colLetter}${detailHeaderRowNum}`] = createHeaderStyle("1E40AF", "FFFFFF", true);
  });

  let violIdx = 0;
  (data || []).forEach((c) => {
    (c.violations_list || []).forEach((v) => {
      violIdx++;
      const formattedDate = v.date
        ? new Date(v.date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-";

      const rData = [
        violIdx,
        v.penalty_number || `PEN-${v.penalty_id}`,
        formattedDate,
        c.cleaner_name || "N/A",
        c.cleaner_phone || "-",
        v.location_name || "-",
        v.rule_code || "RULE",
        v.rule_name || "SLA Deficiency",
        v.score !== null && v.score !== undefined ? Number(v.score).toFixed(1) : "-",
        v.status || "PENDING",
        Number(v.calculated_amount || 0).toFixed(2),
        Number(v.approved_amount || 0).toFixed(2),
        v.review_id ? `#${v.review_id}` : "-",
      ];

      const rNum = itemizedRows.length + 1;
      itemizedRows.push(rData);

      const bgColor = violIdx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
      rData.forEach((val, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        const isBold = colIdx === 1 || colIdx === 9;
        const align =
          colIdx === 0 || colIdx === 1 || colIdx === 2 || colIdx === 4 || colIdx === 6 || colIdx === 8 || colIdx === 9 || colIdx === 12
            ? "center"
            : colIdx === 10 || colIdx === 11
            ? "right"
            : "left";
        itemizedStyles[`${colLetter}${rNum}`] = createCellStyle(bgColor, "000000", isBold, align);
      });
    });
  });

  const wsDetails = XLSX.utils.aoa_to_sheet(itemizedRows);
  Object.keys(itemizedStyles).forEach((cellRef) => {
    if (!wsDetails[cellRef]) wsDetails[cellRef] = {};
    wsDetails[cellRef].s = itemizedStyles[cellRef];
  });

  // Calculate dynamic auto-fit column widths for Sheet 2
  const detailColWidths = [8, 18, 16, 24, 16, 30, 16, 32, 14, 16, 20, 22, 14];
  itemizedRows.forEach((row, rIdx) => {
    if (rIdx === 0) return;
    if (!Array.isArray(row)) return;
    row.forEach((val, cIdx) => {
      if (val === null || val === undefined) return;
      const strLen = String(val).length;
      detailColWidths[cIdx] = Math.max(detailColWidths[cIdx] || 12, strLen + 4);
    });
  });
  wsDetails["!cols"] = detailColWidths.map((w) => ({ wch: Math.min(w, 60) }));

  wsDetails["!rows"] = [
    { hpx: 30 }, // Title
    { hpx: 8 },  // Spacer
    { hpx: 26 }, // Header
  ];
  wsDetails["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 12 } }, // Title merge A1:M1
  ];

  XLSX.utils.book_append_sheet(wb, wsDetails, "Itemized Violations");

  const fileName = `Cleaner_Penalty_Summary_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

// =========================================================================
// HELPER: Format violation date for PDF
// =========================================================================
const formatViolDate = (dateVal) => {
  if (!dateVal) return "-";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateVal);
  }
};

const formatReportDateOnly = (dateVal) => {
  if (!dateVal) return "-";
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(dateVal);
  }
};

// =========================================================================
// HELPER: Draw Industrial Report Header with Underlined Title
// =========================================================================
const drawIndustrialHeaderTitle = (doc, titleText, subtitleText, docCategory = "INDUSTRIAL SLA AUDIT REPORT") => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(titleText, 14, 15);

  const titleWidth = doc.getTextWidth(titleText);
  // Underline the report title
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.7);
  doc.line(14, 16.8, 14 + titleWidth, 16.8);

  // Subtitle
  if (subtitleText) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(subtitleText, 14, 21.5);
  }

  // Top-right industrial document classification & badge
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(docCategory.toUpperCase(), 283, 14, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("CONFIDENTIAL  |  OFFICIAL COMPLIANCE RECORD", 283, 18, { align: "right" });
};

// =========================================================================
// HELPER: Draw styled KPI card in jsPDF
// =========================================================================
const drawPdfKpiCard = (doc, x, y, width, height, title, value, subtext, bgColor, borderColor, titleColor, valColor) => {
  doc.setFillColor(...bgColor);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, width, height, 2, 2, "FD");

  doc.setFontSize(7);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...titleColor);
  doc.text(title.toUpperCase(), x + 3.5, y + 4.5);

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.setTextColor(...valColor);
  doc.text(value, x + 3.5, y + 10);

  if (subtext) {
    doc.setFontSize(6.5);
    doc.setFont(undefined, "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(subtext, x + 3.5, y + 14);
  }
};

// =========================================================================
// HELPER: Draw bottom reconciliation & payroll deductible banner in jsPDF
// =========================================================================
const drawPdfBottomSummary = (doc, finalY, gross, waived, pending, approved, title, approvedLabel) => {
  const pageWidth = doc.internal.pageSize.width;
  let y = finalY + 4;
  if (y + 22 > doc.internal.pageSize.height - 12) {
    doc.addPage();
    y = 16;
  }

  const boxWidth = pageWidth - 28;
  const boxHeight = 17;

  // Background & border
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129);  // emerald-500
  doc.setLineWidth(0.5);
  doc.roundedRect(14, y, boxWidth, boxHeight, 2.5, 2.5, "FD");

  // Left side: Title & breakdown
  doc.setFontSize(8);
  doc.setFont(undefined, "bold");
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(title.toUpperCase(), 18, y + 5.5);

  doc.setFontSize(7.5);
  doc.setFont(undefined, "normal");
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    `Gross Imposed: Rs. ${Number(gross || 0).toFixed(2)}    |    Waived / Reversed: Rs. ${Number(waived || 0).toFixed(2)}    |    Pending Review: Rs. ${Number(pending || 0).toFixed(2)}`,
    18,
    y + 11.5
  );

  // Right side: Green confirmation badge
  const badgeWidth = 74;
  const badgeHeight = 13;
  const badgeX = 14 + boxWidth - badgeWidth - 2;
  const badgeY = y + 2;

  doc.setFillColor(5, 150, 105); // emerald-600
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 2, 2, "F");

  doc.setFontSize(6.5);
  doc.setFont(undefined, "bold");
  doc.setTextColor(209, 250, 229); // emerald-100
  doc.text(approvedLabel.toUpperCase(), badgeX + badgeWidth / 2, badgeY + 4.5, { align: "center" });

  doc.setFontSize(10.5);
  doc.setFont(undefined, "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`Rs. ${Number(approved || 0).toFixed(2)}`, badgeX + badgeWidth / 2, badgeY + 10.5, { align: "center" });
};

// =========================================================================
// EXPORT CLEANER PENALTY SUMMARY TO PDF (Supports Single Cleaner & All Cleaners)
// =========================================================================
const exportCleanerPenaltySummaryToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");
  const isSingle =
    metadata?.is_single_cleaner === true ||
    (data && data.length === 1 && (metadata?.cleaner_id || metadata?.is_single_cleaner !== false));

  // =========================================================================
  // CASE A: SINGLE CLEANER PENALTY REPORT PDF
  // =========================================================================
  if (isSingle && data && data.length > 0) {
    const cleaner = data[0];
    const violations = cleaner.violations_list || [];

    addLogosToHeader(doc);

    // Title with underline & industrial header format
    drawIndustrialHeaderTitle(
      doc,
      "SINGLE CLEANER PENALTY REPORT",
      "Itemized Contractual SLA Violations & Payroll Deduction Reconciliation",
      "CLEANER SLA AUDIT"
    );

    // Industrial Profile & Parameters Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 25, 269, 18, 1.5, 1.5, "FD");

    // Left Column: Cleaner Details
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("CLEANER NAME:", 18, 30.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(cleaner.cleaner_name || metadata?.cleaner_name || "N/A", 52, 30.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("CONTACT DETAILS:", 18, 35.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const phoneVal = cleaner.cleaner_phone || metadata?.cleaner_phone || "-";
    const emailVal = cleaner.cleaner_email || metadata?.cleaner_email || "-";
    doc.text(`Phone: ${phoneVal}   |   Email: ${emailVal}`, 52, 35.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("ORGANIZATION:", 18, 40.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(metadata?.organization || "N/A", 52, 40.5);

    // Right Column: Audit & Assignments
    const washroomStr = (cleaner.locations || metadata?.locations || []).join(", ") || "-";
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("ASSIGNED TO:", 155, 30.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(washroomStr.length > 70 ? washroomStr.substring(0, 67) + "..." : washroomStr, 185, 30.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("AUDIT PERIOD:", 155, 35.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(`${formatReportDateOnly(metadata?.date_range?.start)} to ${formatReportDateOnly(metadata?.date_range?.end)}`, 185, 35.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("GENERATED ON:", 155, 40.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(formatViolDate(metadata?.generated_on || Date.now()), 185, 40.5);

    // KPI Summary Cards (4 Cards across page width: 269mm / 4 = ~64mm each)
    const cardY = 46;
    const cardW = 64.5;
    const cardH = 16;
    const gap = 3.5;

    // Card 1: Gross Imposed
    drawPdfKpiCard(
      doc,
      14,
      cardY,
      cardW,
      cardH,
      "Gross Penalties Imposed",
      `Rs. ${Number(cleaner.gross_amount || 0).toFixed(2)}`,
      `${cleaner.total_penalties || violations.length} total infraction(s)`,
      [248, 250, 252],
      [226, 232, 240],
      [71, 85, 105],
      [15, 23, 42]
    );

    // Card 2: Waived / Reversed
    drawPdfKpiCard(
      doc,
      14 + cardW + gap,
      cardY,
      cardW,
      cardH,
      "Waived / Overturned",
      `Rs. ${Number(cleaner.waived_amount || 0).toFixed(2)}`,
      "Disputed & forgiven",
      [248, 250, 252],
      [226, 232, 240],
      [71, 85, 105],
      [71, 85, 105]
    );

    // Card 3: Pending Approval
    drawPdfKpiCard(
      doc,
      14 + (cardW + gap) * 2,
      cardY,
      cardW,
      cardH,
      "Pending Review",
      `Rs. ${Number(cleaner.pending_amount || 0).toFixed(2)}`,
      "Awaiting supervisor",
      [254, 243, 199],
      [252, 211, 77],
      [180, 83, 9],
      [180, 83, 9]
    );

    // Card 4: Approved Deductible
    drawPdfKpiCard(
      doc,
      14 + (cardW + gap) * 3,
      cardY,
      cardW,
      cardH,
      "Approved Deductible",
      `Rs. ${Number(cleaner.approved_amount || 0).toFixed(2)}`,
      "Confirmed for payroll",
      [236, 253, 245],
      [110, 231, 183],
      [4, 120, 87],
      [4, 120, 87]
    );

    // Section Title
    doc.setFontSize(9.5);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`Itemized Violation Records (${violations.length} records)`, 14, 67);

    // Table of itemized violations
    const tableHeaders = [
      [
        "Sr",
        "Penalty #",
        "Date",
        "Facility / Washroom",
        "Breached Rule & Score",
        "Amount (Rs.)",
        "Status",
        "Dispute Reason",
        "Review"
      ]
    ];

    const tableBody = violations.map((v, idx) => [
      idx + 1,
      v.penalty_number || `PEN-${v.penalty_id}`,
      formatViolDate(v.date),
      v.location_name || "-",
      `${v.rule_code || "RULE"}${v.score !== null ? ` (Score: ${Number(v.score).toFixed(1)}/10)` : ""}`,
      `Rs. ${Number(v.calculated_amount || 0).toFixed(2)}`,
      v.status || "PENDING",
      v.dispute_reason ? `"${v.dispute_reason}"` : "-",
      v.review_id ? `Review #${v.review_id}` : "Daily Quota"
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableBody,
      startY: 70,
      theme: "grid",
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 7.5,
        halign: "left"
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 32, fontStyle: "bold" },
        2: { cellWidth: 32 },
        3: { cellWidth: 50 },
        4: { cellWidth: 46 },
        5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
        6: { cellWidth: 22, halign: "center" },
        7: { cellWidth: 33 },
        8: { cellWidth: 20, halign: "center" }
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 6) {
          const val = String(data.cell.raw || "");
          if (val === "APPROVED") {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "PENDING") {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "REVERSED" || val === "REJECTED") {
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
      }
    });

    // Draw Reconciliation Banner at bottom
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 150;
    drawPdfBottomSummary(
      doc,
      finalY,
      cleaner.gross_amount,
      cleaner.waived_amount,
      cleaner.pending_amount,
      cleaner.approved_amount,
      "Penalty Reconciliation & Payroll Summary",
      "Approved Deductible for Payroll"
    );

    addLogosToAllPages(doc);
    outputPdf(doc, `Single_Cleaner_Penalty_Report_${cleaner.cleaner_name?.replace(/\s+/g, "_") || "Cleaner"}_${Date.now()}.pdf`);
    return;
  }

  // =========================================================================
  // CASE B: ALL CLEANERS SUMMARY REPORT PDF
  // =========================================================================
  addLogosToHeader(doc);

  // Title with underline & industrial header format
  drawIndustrialHeaderTitle(
    doc,
    "CLEANER PENALTY SUMMARY REPORT",
    "Consolidated Contractor & Cleaner SLA Penalty Audit Ledger",
    "INDUSTRIAL COMPLIANCE AUDIT"
  );

  // Industrial Metadata Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 25, 269, 14, 1.5, 1.5, "FD");

  // Left Column
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("ORGANIZATION:", 18, 31);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(metadata?.organization || "N/A", 52, 31);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("TOTAL CLEANERS:", 18, 36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(metadata?.total_cleaners ?? data?.length ?? 0), 52, 36);

  // Right Column
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("AUDIT PERIOD:", 155, 31);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatReportDateOnly(metadata?.date_range?.start)} to ${formatReportDateOnly(metadata?.date_range?.end)}`, 185, 31);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("GENERATED ON:", 155, 36);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(formatViolDate(metadata?.generated_on || Date.now()), 185, 36);

  // Top KPI Summary Cards (5 cards across width: 269mm / 5 = ~51mm each)
  const cardW = 51;
  const cardH = 15;
  const gap = 3.5;
  const cardY = 42;

  drawPdfKpiCard(doc, 14, cardY, cardW, cardH, "Cleaners Penalized", String(metadata?.total_cleaners ?? data?.length ?? 0), "Total subjects", [248, 250, 252], [226, 232, 240], [71, 85, 105], [15, 23, 42]);
  drawPdfKpiCard(doc, 14 + (cardW + gap), cardY, cardW, cardH, "Gross Penalties", `Rs. ${Number(metadata?.gross_amount || 0).toFixed(2)}`, "Calculated sum", [254, 243, 199], [252, 211, 77], [180, 83, 9], [180, 83, 9]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 2, cardY, cardW, cardH, "Waived / Forgiven", `Rs. ${Number(metadata?.waived_amount || 0).toFixed(2)}`, "Disputes accepted", [248, 250, 252], [226, 232, 240], [71, 85, 105], [71, 85, 105]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 3, cardY, cardW, cardH, "Confirmed Deductions", `Rs. ${Number(metadata?.approved_amount || 0).toFixed(2)}`, "Ready for payroll", [236, 253, 245], [110, 231, 183], [4, 120, 87], [4, 120, 87]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 4, cardY, cardW, cardH, "Pending Balance", `Rs. ${Number(metadata?.pending_amount || 0).toFixed(2)}`, "Awaiting supervisor", [239, 246, 255], [191, 219, 254], [29, 78, 216], [29, 78, 216]);

  const headers = [
    [
      "Sr",
      "Cleaner Name",
      "Phone",
      "Assigned Washrooms",
      "Penalties",
      "Gross (Rs.)",
      "Waived (Rs.)",
      "Approved (Rs.)",
      "Pending (Rs.)",
      "Disputes"
    ]
  ];

  const body = (data || []).map((c, idx) => [
    idx + 1,
    c.cleaner_name || "-",
    c.cleaner_phone || "-",
    (c.locations || []).slice(0, 2).join(", ") + ((c.locations || []).length > 2 ? ` (+${(c.locations || []).length - 2})` : ""),
    c.total_penalties || 0,
    `Rs. ${Number(c.gross_amount || 0).toFixed(2)}`,
    `Rs. ${Number(c.waived_amount || 0).toFixed(2)}`,
    `Rs. ${Number(c.approved_amount || 0).toFixed(2)}`,
    `Rs. ${Number(c.pending_amount || 0).toFixed(2)}`,
    c.disputes_count || 0
  ]);

  autoTable(doc, {
    head: headers,
    body: body,
    startY: 60,
    theme: "striped",
    headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2.5 },
    margin: { left: 14, right: 14 }
  });

  // Table 2: All Itemized Violations
  const allViolations = [];
  (data || []).forEach((c) => {
    (c.violations_list || []).forEach((v) => {
      allViolations.push({
        ...v,
        cleaner_name: c.cleaner_name,
        cleaner_phone: c.cleaner_phone
      });
    });
  });

  if (allViolations.length > 0) {
    let nextY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 8;
    if (nextY + 30 > doc.internal.pageSize.height - 15) {
      doc.addPage();
      nextY = 18;
    }

    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`All Itemized SLA Penalty Violations (${allViolations.length} records)`, 14, nextY);

    const violHeaders = [
      [
        "Sr",
        "Penalty #",
        "Date",
        "Cleaner Name",
        "Facility / Washroom",
        "Breached Rule & Score",
        "Amount (Rs.)",
        "Status",
        "Dispute Reason"
      ]
    ];

    const violBody = allViolations.map((v, idx) => [
      idx + 1,
      v.penalty_number || `PEN-${v.penalty_id}`,
      formatViolDate(v.date),
      v.cleaner_name || "-",
      v.location_name || "-",
      `${v.rule_code || "RULE"}${v.score !== null ? ` (${Number(v.score).toFixed(1)}/10)` : ""}`,
      `Rs. ${Number(v.calculated_amount || 0).toFixed(2)}`,
      v.status || "PENDING",
      v.dispute_reason ? `"${v.dispute_reason}"` : "-"
    ]);

    autoTable(doc, {
      head: violHeaders,
      body: violBody,
      startY: nextY + 3,
      theme: "grid",
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 7, fontStyle: "bold" },
      bodyStyles: { fontSize: 6.5, cellPadding: 1.8 },
      margin: { left: 14, right: 14 }
    });
  }

  // Draw Bottom Reconciliation Banner
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 160;
  drawPdfBottomSummary(
    doc,
    finalY,
    metadata?.gross_amount,
    metadata?.waived_amount,
    metadata?.pending_amount,
    metadata?.approved_amount,
    "Overall Organization Penalty Reconciliation",
    "Total Approved Deductible"
  );

  addLogosToAllPages(doc);
  outputPdf(doc, `Cleaner_Penalty_Summary_${Date.now()}.pdf`);
};

// =========================================================================
// EXPORT WASHROOM PENALTY SUMMARY TO PDF (Supports Single Washroom & All Washrooms)
// =========================================================================
const exportWashroomPenaltySummaryToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");
  const isSingle =
    metadata?.is_single_washroom === true ||
    (data && data.length === 1 && (metadata?.location_id || metadata?.is_single_washroom !== false));

  // =========================================================================
  // CASE A: SINGLE WASHROOM PENALTY REPORT PDF
  // =========================================================================
  if (isSingle && data && data.length > 0) {
    const loc = data[0];
    const violations = loc.violations_list || [];

    addLogosToHeader(doc);

    // Title with underline & industrial header format
    drawIndustrialHeaderTitle(
      doc,
      "SINGLE WASHROOM PENALTY REPORT",
      "Itemized Contractual SLA Violations & Facility Penalty Audit",
      "FACILITY SLA AUDIT"
    );

    // Industrial Profile & Parameters Box (NO CODE, NO ADDRESS)
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 25, 269, 18, 1.5, 1.5, "FD");

    // Left Column: Facility Details
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("FACILITY / WASHROOM:", 18, 30.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(loc.location_name || metadata?.location_name || "N/A", 60, 30.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("ORGANIZATION:", 18, 35.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(metadata?.organization || "N/A", 60, 35.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("MAPPED CLEANERS:", 18, 40.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    const cleanerStr = (loc.cleaners || metadata?.cleaners || []).join(", ") || "-";
    doc.text(cleanerStr.length > 70 ? cleanerStr.substring(0, 67) + "..." : cleanerStr, 60, 40.5);

    // Right Column: Audit Period & Classification
    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("AUDIT PERIOD:", 155, 30.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(`${formatReportDateOnly(metadata?.date_range?.start)} to ${formatReportDateOnly(metadata?.date_range?.end)}`, 185, 30.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("GENERATED ON:", 155, 35.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text(formatViolDate(metadata?.generated_on || Date.now()), 185, 35.5);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(71, 85, 105);
    doc.text("REPORT SCOPE:", 155, 40.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(15, 23, 42);
    doc.text("Single Facility SLA Compliance & Penalty Ledger", 185, 40.5);

    // KPI Summary Cards
    const cardY = 46;
    const cardW = 64.5;
    const cardH = 16;
    const gap = 3.5;

    drawPdfKpiCard(doc, 14, cardY, cardW, cardH, "Gross Penalties Imposed", `Rs. ${Number(loc.gross_amount || 0).toFixed(2)}`, `${loc.total_penalties || violations.length} total infraction(s)`, [248, 250, 252], [226, 232, 240], [71, 85, 105], [15, 23, 42]);
    drawPdfKpiCard(doc, 14 + cardW + gap, cardY, cardW, cardH, "Waived / Overturned", `Rs. ${Number(loc.waived_amount || 0).toFixed(2)}`, "Disputed & forgiven", [248, 250, 252], [226, 232, 240], [71, 85, 105], [71, 85, 105]);
    drawPdfKpiCard(doc, 14 + (cardW + gap) * 2, cardY, cardW, cardH, "Pending Review", `Rs. ${Number(loc.pending_amount || 0).toFixed(2)}`, "Awaiting supervisor", [254, 243, 199], [252, 211, 77], [180, 83, 9], [180, 83, 9]);
    drawPdfKpiCard(doc, 14 + (cardW + gap) * 3, cardY, cardW, cardH, "Approved Deductible", `Rs. ${Number(loc.approved_amount || 0).toFixed(2)}`, "Confirmed deductions", [236, 253, 245], [110, 231, 183], [4, 120, 87], [4, 120, 87]);

    // Section Title
    doc.setFontSize(9.5);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`Itemized Washroom Penalties (${violations.length} records)`, 14, 67);

    // AutoTable for violations
    const tableHeaders = [
      [
        "Sr",
        "Penalty #",
        "Date",
        "Cleaner Responsible",
        "Breached Rule & Score",
        "Amount (Rs.)",
        "Status",
        "Dispute Reason",
        "Review"
      ]
    ];

    const tableBody = violations.map((v, idx) => [
      idx + 1,
      v.penalty_number || `PEN-${v.penalty_id}`,
      formatViolDate(v.date),
      v.cleaner_name || "-",
      `${v.rule_code || "RULE"}${v.score !== null ? ` (Score: ${Number(v.score).toFixed(1)}/10)` : ""}`,
      `Rs. ${Number(v.calculated_amount || 0).toFixed(2)}`,
      v.status || "PENDING",
      v.dispute_reason ? `"${v.dispute_reason}"` : "-",
      v.review_id ? `Review #${v.review_id}` : "Daily Quota"
    ]);

    autoTable(doc, {
      head: tableHeaders,
      body: tableBody,
      startY: 70,
      theme: "grid",
      headStyles: {
        fillColor: [109, 40, 217], // purple-700
        textColor: 255,
        fontStyle: "bold",
        fontSize: 7.5,
        halign: "left"
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 32, fontStyle: "bold" },
        2: { cellWidth: 32 },
        3: { cellWidth: 50 },
        4: { cellWidth: 46 },
        5: { cellWidth: 24, halign: "right", fontStyle: "bold" },
        6: { cellWidth: 22, halign: "center" },
        7: { cellWidth: 33 },
        8: { cellWidth: 20, halign: "center" }
      },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.section === "body" && data.column.index === 6) {
          const val = String(data.cell.raw || "");
          if (val === "APPROVED") {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "PENDING") {
            data.cell.styles.textColor = [217, 119, 6];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "REVERSED" || val === "REJECTED") {
            data.cell.styles.textColor = [100, 116, 139];
          }
        }
      }
    });

    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 150;
    drawPdfBottomSummary(
      doc,
      finalY,
      loc.gross_amount,
      loc.waived_amount,
      loc.pending_amount,
      loc.approved_amount,
      "Washroom Penalty Reconciliation & Deductible",
      "Confirmed Washroom Deductions"
    );

    addLogosToAllPages(doc);
    outputPdf(doc, `Single_Washroom_Penalty_Report_${loc.location_name?.replace(/\s+/g, "_") || "Washroom"}_${Date.now()}.pdf`);
    return;
  }

  // =========================================================================
  // CASE B: ALL WASHROOMS SUMMARY REPORT PDF
  // =========================================================================
  addLogosToHeader(doc);

  // Title with underline & industrial header format
  drawIndustrialHeaderTitle(
    doc,
    "WASHROOM PENALTY SUMMARY REPORT",
    "Consolidated Facility SLA Violation & Penalty Audit Ledger",
    "INDUSTRIAL COMPLIANCE AUDIT"
  );

  // Industrial Metadata Card (NO CODE, NO ADDRESS)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 25, 269, 14, 1.5, 1.5, "FD");

  // Left Column
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("ORGANIZATION:", 18, 31);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(metadata?.organization || "N/A", 52, 31);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("TOTAL WASHROOMS:", 18, 36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(String(metadata?.total_washrooms ?? data?.length ?? 0), 52, 36);

  // Right Column
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("AUDIT PERIOD:", 155, 31);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatReportDateOnly(metadata?.date_range?.start)} to ${formatReportDateOnly(metadata?.date_range?.end)}`, 185, 31);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("GENERATED ON:", 155, 36);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(formatViolDate(metadata?.generated_on || Date.now()), 185, 36);

  // Top KPI Summary Cards
  const cardW = 51;
  const cardH = 15;
  const gap = 3.5;
  const cardY = 42;

  drawPdfKpiCard(doc, 14, cardY, cardW, cardH, "Washrooms Penalized", String(metadata?.total_washrooms ?? data?.length ?? 0), "Total facilities", [248, 250, 252], [226, 232, 240], [71, 85, 105], [15, 23, 42]);
  drawPdfKpiCard(doc, 14 + (cardW + gap), cardY, cardW, cardH, "Gross Penalties", `Rs. ${Number(metadata?.gross_amount || 0).toFixed(2)}`, "Calculated sum", [254, 243, 199], [252, 211, 77], [180, 83, 9], [180, 83, 9]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 2, cardY, cardW, cardH, "Waived / Forgiven", `Rs. ${Number(metadata?.waived_amount || 0).toFixed(2)}`, "Disputes accepted", [248, 250, 252], [226, 232, 240], [71, 85, 105], [71, 85, 105]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 3, cardY, cardW, cardH, "Confirmed Deductions", `Rs. ${Number(metadata?.approved_amount || 0).toFixed(2)}`, "Ready for payroll", [236, 253, 245], [110, 231, 183], [4, 120, 87], [4, 120, 87]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 4, cardY, cardW, cardH, "Pending Balance", `Rs. ${Number(metadata?.pending_amount || 0).toFixed(2)}`, "Awaiting supervisor", [239, 246, 255], [191, 219, 254], [29, 78, 216], [29, 78, 216]);

  // Headers without "Code"
  const headers = [
    [
      "Sr",
      "Washroom Location",
      "Mapped Cleaners",
      "Penalties",
      "Gross (Rs.)",
      "Waived (Rs.)",
      "Approved (Rs.)",
      "Pending (Rs.)",
      "Disputes"
    ]
  ];

  // Body without "Code"
  const body = (data || []).map((w, idx) => [
    idx + 1,
    w.location_name || "-",
    (w.cleaners || []).slice(0, 2).join(", ") + ((w.cleaners || []).length > 2 ? ` (+${(w.cleaners || []).length - 2})` : ""),
    w.total_penalties || 0,
    `Rs. ${Number(w.gross_amount || 0).toFixed(2)}`,
    `Rs. ${Number(w.waived_amount || 0).toFixed(2)}`,
    `Rs. ${Number(w.approved_amount || 0).toFixed(2)}`,
    `Rs. ${Number(w.pending_amount || 0).toFixed(2)}`,
    w.disputes_count || 0
  ]);

  autoTable(doc, {
    head: headers,
    body: body,
    startY: 60,
    theme: "striped",
    headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: "bold", fontSize: 7.5 },
    bodyStyles: { fontSize: 7, cellPadding: 2.5 },
    margin: { left: 14, right: 14 }
  });

  // Table 2: All Itemized Violations
  const allViolations = [];
  (data || []).forEach((w) => {
    (w.violations_list || []).forEach((v) => {
      allViolations.push({
        ...v,
        location_name: w.location_name
      });
    });
  });

  if (allViolations.length > 0) {
    let nextY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : 120) + 8;
    if (nextY + 30 > doc.internal.pageSize.height - 15) {
      doc.addPage();
      nextY = 18;
    }

    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    doc.setTextColor(30, 41, 59);
    doc.text(`All Itemized Washroom Violations (${allViolations.length} records)`, 14, nextY);

    const violHeaders = [
      [
        "Sr",
        "Penalty #",
        "Date",
        "Washroom Location",
        "Cleaner Responsible",
        "Breached Rule & Score",
        "Amount (Rs.)",
        "Status",
        "Dispute Reason"
      ]
    ];

    const violBody = allViolations.map((v, idx) => [
      idx + 1,
      v.penalty_number || `PEN-${v.penalty_id}`,
      formatViolDate(v.date),
      v.location_name || "-",
      v.cleaner_name || "-",
      `${v.rule_code || "RULE"}${v.score !== null ? ` (${Number(v.score).toFixed(1)}/10)` : ""}`,
      `Rs. ${Number(v.calculated_amount || 0).toFixed(2)}`,
      v.status || "PENDING",
      v.dispute_reason ? `"${v.dispute_reason}"` : "-"
    ]);

    autoTable(doc, {
      head: violHeaders,
      body: violBody,
      startY: nextY + 3,
      theme: "grid",
      headStyles: { fillColor: [51, 65, 85], textColor: 255, fontSize: 7, fontStyle: "bold" },
      bodyStyles: { fontSize: 6.5, cellPadding: 1.8 },
      margin: { left: 14, right: 14 }
    });
  }

  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 160;
  drawPdfBottomSummary(
    doc,
    finalY,
    metadata?.gross_amount,
    metadata?.waived_amount,
    metadata?.pending_amount,
    metadata?.approved_amount,
    "Overall Washrooms Penalty Reconciliation",
    "Confirmed Washroom Deductions"
  );

  addLogosToAllPages(doc);
  outputPdf(doc, `Washroom_Penalty_Summary_${Date.now()}.pdf`);
};

const exportWashroomPenaltySummaryToExcel = (data, metadata) => {
  const wb = XLSX.utils.book_new();

  const summaryHeaders = [
    "Sr. No.",
    "Washroom Location",
    "Mapped Cleaners",
    "Total Penalties",
    "Gross Imposed (Rs.)",
    "Waived / Reversed (Rs.)",
    "Approved Deductible (Rs.)",
    "Pending Review (Rs.)",
    "Disputed Count"
  ];

  const summaryRows = [
    ["WASHROOM PENALTY SUMMARY REPORT"],
    [`Organization: ${metadata?.organization || "N/A"}`],
    [`Date Range: ${metadata?.date_range?.start || "Beginning"} to ${metadata?.date_range?.end || "Now"}`],
    [`Generated: ${new Date().toLocaleString("en-IN")}`],
    [],
    summaryHeaders
  ];

  (data || []).forEach((w, idx) => {
    summaryRows.push([
      idx + 1,
      w.location_name || "-",
      (w.cleaners || []).join(", "),
      w.total_penalties || 0,
      Number(w.gross_amount || 0).toFixed(2),
      Number(w.waived_amount || 0).toFixed(2),
      Number(w.approved_amount || 0).toFixed(2),
      Number(w.pending_amount || 0).toFixed(2),
      w.disputes_count || 0
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, "Washroom Summary");

  // Sheet 2: Itemized Violations
  const itemizedRows = [
    ["ITEMIZED WASHROOM SLA PENALTY VIOLATIONS"],
    [`Organization: ${metadata?.organization || "N/A"}`],
    [],
    [
      "Sr. No.",
      "Penalty Number",
      "Date",
      "Washroom Location",
      "Cleaner Responsible",
      "Rule Code",
      "Rule Description",
      "Score",
      "Status",
      "Gross Imposed (Rs.)",
      "Approved Amount (Rs.)",
      "Review ID"
    ]
  ];

  let vIdx = 0;
  (data || []).forEach((w) => {
    (w.violations_list || []).forEach((v) => {
      vIdx++;
      itemizedRows.push([
        vIdx,
        v.penalty_number || `PEN-${v.penalty_id}`,
        v.date ? new Date(v.date).toLocaleDateString("en-IN") : "-",
        w.location_name || "-",
        v.cleaner_name || "-",
        v.rule_code || "RULE",
        v.rule_name || "SLA Deficiency",
        v.score !== null ? Number(v.score).toFixed(1) : "-",
        v.status || "PENDING",
        Number(v.calculated_amount || 0).toFixed(2),
        Number(v.approved_amount || 0).toFixed(2),
        v.review_id ? `#${v.review_id}` : "-"
      ]);
    });
  });

  const wsDetails = XLSX.utils.aoa_to_sheet(itemizedRows);
  XLSX.utils.book_append_sheet(wb, wsDetails, "Itemized Violations");

  XLSX.writeFile(wb, `Washroom_Penalty_Summary_${new Date().toISOString().split("T")[0]}.xlsx`);
};

// =========================================================================
// EXPORT ATTENDANCE REPORT TO PDF (Workforce Attendance Matrix with P & A)
// =========================================================================
const exportAttendanceReportToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");

  addLogosToHeader(doc);

  drawIndustrialHeaderTitle(
    doc,
    "CLEANER ATTENDANCE REPORT",
    "Daily Workforce Attendance & Shift Compliance Audit (P: Present, A: Absent)",
    "WORKFORCE ATTENDANCE AUDIT"
  );

  // Determine Date Columns
  let dateColumns = metadata?.date_columns || [];
  if (dateColumns.length === 0 && metadata?.date_range?.start && metadata?.date_range?.end) {
    let curr = new Date(metadata.date_range.start);
    const endD = new Date(metadata.date_range.end);
    while (curr <= endD) {
      const dStr = curr.toISOString().split("T")[0];
      const dayName = curr.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
      const dayNum = String(curr.getUTCDate()).padStart(2, "0");
      dateColumns.push({
        date: dStr,
        label: `${dayName}-${dayNum}`,
        dayName,
        dayNum
      });
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
  }

  // Determine Matrix Rows
  let matrixRows = metadata?.matrix || [];
  if (matrixRows.length === 0) {
    if (data && data.length > 0 && data[0].attendance_map) {
      matrixRows = data;
    } else {
      // Reconstruct from flat records
      const groups = {};
      (data || []).forEach((r) => {
        const cId = r.cleaner_id || r.cleaner_name;
        if (!groups[cId]) {
          groups[cId] = {
            cleaner_id: cId,
            cleaner_name: r.cleaner_name || r.employee_name || "Unknown",
            cleaner_phone: r.cleaner_phone || "-",
            company_name: metadata?.organization || "N/A",
            assigned_locations: (r.assigned_locations || []).join(", ") || r.site_beat || "Unassigned",
            days_present: 0,
            attendance_map: {}
          };
        }
        const isPresent = r.status?.toLowerCase() === "present" || r.code === "P";
        const code = isPresent ? "P" : "A";
        if (isPresent) {
          groups[cId].days_present += 1;
        }
        groups[cId].attendance_map[r.date] = { code };
      });
      matrixRows = Object.values(groups);
    }
  }

  // Industrial Metadata Card (NO code, NO address)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, 25, 269, 14, 1.5, 1.5, "FD");

  // Left Column
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("ORGANIZATION:", 18, 31);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(metadata?.organization || "N/A", 52, 31);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("TOTAL CLEANERS:", 18, 36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${metadata?.total_cleaners || matrixRows.length} Active Cleaners`, 52, 36);

  // Right Column
  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("AUDIT PERIOD:", 155, 31);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(`${formatReportDateOnly(metadata?.date_range?.start)} to ${formatReportDateOnly(metadata?.date_range?.end)}`, 185, 31);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(71, 85, 105);
  doc.text("GENERATED ON:", 155, 36);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(15, 23, 42);
  doc.text(formatViolDate(metadata?.generated_on || Date.now()), 185, 36);

  // Top KPI Summary Cards (5 cards)
  const cardW = 51;
  const cardH = 14;
  const gap = 3.5;
  const cardY = 42;

  const totalAuditDays = dateColumns.length;
  const totalEmployees = matrixRows.length;
  const totalShifts = metadata?.total_man_days ?? (totalEmployees * (totalAuditDays || 1));
  const presentCount = metadata?.total_present ?? matrixRows.reduce((acc, r) => acc + (r.days_present ?? r.days_worked ?? 0), 0);
  const absentCount = metadata?.total_absent ?? Math.max(0, totalShifts - presentCount);
  const rateStr = metadata?.overall_attendance_rate || (totalShifts > 0 ? `${((presentCount / totalShifts) * 100).toFixed(1)}%` : "0.0%");

  drawPdfKpiCard(doc, 14, cardY, cardW, cardH, "Cleaners", String(totalEmployees), "Active roster", [248, 250, 252], [226, 232, 240], [71, 85, 105], [15, 23, 42]);
  drawPdfKpiCard(doc, 14 + (cardW + gap), cardY, cardW, cardH, "Present Shifts (P)", String(presentCount), "Verified duty", [236, 253, 245], [110, 231, 183], [4, 120, 87], [4, 120, 87]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 2, cardY, cardW, cardH, "Absent Shifts (A)", String(absentCount), "Missed duty", [255, 241, 242], [254, 205, 211], [190, 18, 60], [190, 18, 60]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 3, cardY, cardW, cardH, "Audit Days", String(totalAuditDays), "Calendar window", [239, 246, 255], [191, 219, 254], [29, 78, 216], [29, 78, 216]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 4, cardY, cardW, cardH, "Compliance Rate", rateStr, "Present vs Total", [238, 242, 255], [199, 210, 254], [67, 56, 202], [67, 56, 202]);

  // Section Title
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Cleaner Attendance Matrix (${matrixRows.length} Cleaners, ${dateColumns.length} Days)`, 14, 60);

  // Table Headers
  const tableHeaders = [
    [
      "Sr",
      "Cleaner Name",
      "Assigned Washrooms",
      "Days Present",
      "Att. Rate",
      ...dateColumns.map((col) => col.label)
    ]
  ];

  // Table Body
  const tableBody = matrixRows.map((row, idx) => {
    const cleanerName = row.cleaner_name || row.employee_name || "-";
    const assignedLocs = row.assigned_locations || row.site_beat || "Unassigned";
    const daysPresent = row.days_present ?? row.days_worked ?? 0;
    const attRate = totalAuditDays > 0 ? `${((daysPresent / totalAuditDays) * 100).toFixed(0)}%` : "0%";

    const dayCells = dateColumns.map((col) => {
      const cellData = row.attendance_map?.[col.date];
      const isPresent = cellData?.code === "P" || cellData?.status?.toLowerCase() === "present";
      return isPresent ? "P" : "A";
    });

    return [
      idx + 1,
      cleanerName,
      assignedLocs,
      daysPresent,
      attRate,
      ...dayCells
    ];
  });

  // Calculate dynamic day column width
  const fixedColsWidth = 8 + 42 + 56 + 18 + 14; // 138mm
  const remainingWidth = 269 - fixedColsWidth;
  const dayColWidth = Math.max(remainingWidth / Math.max(dateColumns.length, 1), 5.5);

  const columnStyles = {
    0: { cellWidth: 8, halign: "center" },
    1: { cellWidth: 42, fontStyle: "bold" },
    2: { cellWidth: 56 },
    3: { cellWidth: 18, halign: "center", fontStyle: "bold" },
    4: { cellWidth: 14, halign: "center" }
  };

  dateColumns.forEach((_, cIdx) => {
    columnStyles[5 + cIdx] = { cellWidth: dayColWidth, halign: "center" };
  });

  autoTable(doc, {
    head: tableHeaders,
    body: tableBody,
    startY: 63,
    theme: "grid",
    headStyles: {
      fillColor: [30, 41, 59], // Slate-800 modern executive header
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 6.5,
      halign: "center",
      lineColor: [51, 65, 85],
      lineWidth: 0.2
    },
    bodyStyles: {
      fontSize: 6.5,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    columnStyles: columnStyles,
    margin: { left: 14, right: 14 },
    didParseCell: (hookData) => {
      // Color-code day cells (column index >= 5)
      if (hookData.section === "body" && hookData.column.index >= 5) {
        const val = String(hookData.cell.raw || "");
        if (val === "P") {
          hookData.cell.styles.textColor = [21, 128, 61]; // emerald-700
          hookData.cell.styles.fontStyle = "bold";
        } else if (val === "A") {
          hookData.cell.styles.textColor = [225, 29, 72];  // rose-600
          hookData.cell.styles.fontStyle = "bold";
        }
      }
    }
  });

  // Bottom Summary Box
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 150;
  let y = finalY + 4;
  if (y + 18 > doc.internal.pageSize.height - 12) {
    doc.addPage();
    y = 16;
  }

  const boxWidth = doc.internal.pageSize.width - 28;
  const boxHeight = 15;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(14, y, boxWidth, boxHeight, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text("CLEANER ATTENDANCE RECONCILIATION & AUDIT SUMMARY", 18, y + 5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Scheduled Shifts: ${totalShifts}    |    Present Shifts (P): ${presentCount}    |    Absent Shifts (A): ${absentCount}    |    Active Cleaners: ${matrixRows.length}`,
    18,
    y + 10.5
  );

  // Green Attendance Badge
  const badgeWidth = 65;
  const badgeHeight = 11;
  const badgeX = 14 + boxWidth - badgeWidth - 2;
  const badgeY = y + 2;

  doc.setFillColor(16, 185, 129);
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, "F");

  doc.setFontSize(6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(236, 253, 245);
  doc.text("COMPLIANCE RATE", badgeX + badgeWidth / 2, badgeY + 4, { align: "center" });

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(rateStr, badgeX + badgeWidth / 2, badgeY + 9, { align: "center" });

  addLogosToAllPages(doc);
  outputPdf(doc, `Cleaner_Attendance_Report_${Date.now()}.pdf`);
};

// =========================================================================
// EXPORT ATTENDANCE REPORT TO EXCEL (Refined Executive Workforce Matrix)
// =========================================================================
const exportAttendanceReportToExcel = (data, metadata) => {
  const wb = XLSX.utils.book_new();

  // Helper for Excel column letters (handles A-Z, AA-ZZ)
  const getColLetter = (colIndex) => {
    let temp = colIndex;
    let letter = "";
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  };

  // Determine Date Columns
  let dateColumns = metadata?.date_columns || [];
  if (dateColumns.length === 0 && metadata?.date_range?.start && metadata?.date_range?.end) {
    let curr = new Date(metadata.date_range.start);
    const endD = new Date(metadata.date_range.end);
    while (curr <= endD) {
      const dStr = curr.toISOString().split("T")[0];
      const dayName = curr.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
      const dayNum = String(curr.getUTCDate()).padStart(2, "0");
      dateColumns.push({
        date: dStr,
        label: `${dayName}-${dayNum}`,
        dayName,
        dayNum
      });
      curr.setUTCDate(curr.getUTCDate() + 1);
    }
  }

  // Determine Matrix Rows
  let matrixRows = metadata?.matrix || [];
  if (matrixRows.length === 0) {
    if (data && data.length > 0 && data[0].attendance_map) {
      matrixRows = data;
    } else {
      const groups = {};
      (data || []).forEach((r) => {
        const cId = r.cleaner_id || r.cleaner_name;
        if (!groups[cId]) {
          groups[cId] = {
            cleaner_id: cId,
            cleaner_name: r.cleaner_name || r.employee_name || "Unknown",
            cleaner_phone: r.cleaner_phone || "-",
            company_name: metadata?.organization || "N/A",
            assigned_locations: (r.assigned_locations || []).join(", ") || r.site_beat || "Unassigned",
            days_present: 0,
            attendance_map: {}
          };
        }
        const isPresent = r.status?.toLowerCase() === "present" || r.code === "P";
        const code = isPresent ? "P" : "A";
        if (isPresent) {
          groups[cId].days_present += 1;
        }
        groups[cId].attendance_map[r.date] = { code };
      });
      matrixRows = Object.values(groups);
    }
  }

  // Helper: Format date range display (NEVER "Beginning to Now")
  const getDateRangeDisplay = () => {
    let startDate = metadata?.date_range?.start;
    let endDate = metadata?.date_range?.end;

    const isInvalid = (val) => !val || val === "Beginning" || val === "Now" || val === "N/A";

    if ((isInvalid(startDate) || isInvalid(endDate)) && dateColumns.length > 0) {
      if (isInvalid(startDate)) startDate = dateColumns[0].date;
      if (isInvalid(endDate)) endDate = dateColumns[dateColumns.length - 1].date;
    }

    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now" || dateStr === "N/A") return null;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      } catch {
        return dateStr;
      }
    };

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    const todayFormatted = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    if (formattedStart && formattedEnd) {
      if (formattedStart === formattedEnd) {
        return formattedStart;
      }
      return `${formattedStart} to ${formattedEnd}`;
    }

    if (formattedStart) {
      return formattedStart === todayFormatted ? formattedStart : `${formattedStart} to ${todayFormatted}`;
    }

    if (formattedEnd) return formattedEnd;
    return todayFormatted;
  };

  const dateRangeDisplay = getDateRangeDisplay();

  // Metrics
  const totalAuditDays = dateColumns.length;
  const totalEmployees = matrixRows.length;
  const totalShifts = metadata?.total_man_days ?? (totalEmployees * (totalAuditDays || 1));
  const presentCount = metadata?.total_present ?? matrixRows.reduce((acc, r) => acc + (r.days_present ?? r.days_worked ?? 0), 0);
  const absentCount = metadata?.total_absent ?? Math.max(0, totalShifts - presentCount);
  const rateStr = metadata?.overall_attendance_rate || (totalShifts > 0 ? `${((presentCount / totalShifts) * 100).toFixed(1)}%` : "0.0%");

  // Daily sums
  const dailyPresent = {};
  const dailyAbsent = {};
  dateColumns.forEach((col) => {
    dailyPresent[col.date] = 0;
    dailyAbsent[col.date] = 0;
    matrixRows.forEach((r) => {
      const isP = r.attendance_map?.[col.date]?.code === "P" || r.attendance_map?.[col.date]?.status?.toLowerCase() === "present";
      if (isP) dailyPresent[col.date]++;
      else dailyAbsent[col.date]++;
    });
  });

  // Colors
  const colors = {
    titleBg: "F1F5F9",
    titleText: "0F172A",
    titleBorderBottom: "2563EB",
    subtitleBg: "F8FAFC",
    subtitleText: "475569",
    subtitleBorderBottom: "CBD5E1",
    metaLabelBg: "F1F5F9",
    metaLabelText: "334155",
    metaValBg: "FFFFFF",
    metaValText: "0F172A",
    bannerBg: "F1F5F9",
    bannerText: "1E293B",
    bannerBorderBottom: "94A3B8",
    kpiHeaderBg: "F8FAFC",
    kpiHeaderText: "64748B",
    cardValBg: "FFFFFF",
    cardTotalText: "0F172A",
    cardPresentText: "16A34A",
    cardAbsentText: "DC2626",
    cardRateText: "2563EB",
    tableHeaderBg: "334155",
    tableHeaderText: "FFFFFF",
    borderColor: "E2E8F0",
    rowOddBg: "F8FAFC",
    presentBg: "DCFCE7",
    presentText: "166534",
    absentBg: "FEE2E2",
    absentText: "991B1B",
    summaryBg: "F1F5F9",
    summaryText: "1E293B",
    tierHighBg: "DCFCE7",
    tierHighText: "166534",
    tierModBg: "FEF3C7",
    tierModText: "92400E",
    tierLowBg: "FEE2E2",
    tierLowText: "991B1B"
  };

  // =========================================================================
  // Sheet 1: Attendance Matrix
  // =========================================================================
  const totalCols = Math.max(6 + dateColumns.length, 6);
  const lastColIdx = totalCols - 1;

  const styleMap = {};
  const worksheetData = [];

  // Row 1: Merged Title
  const titleRow = new Array(totalCols).fill("");
  titleRow[0] = "CLEANER WORKFORCE ATTENDANCE REPORT";
  worksheetData.push(titleRow);
  for (let c = 0; c <= lastColIdx; c++) {
    const col = getColLetter(c);
    styleMap[`${col}1`] = {
      font: { name: "Calibri", bold: true, sz: 14, color: { rgb: colors.titleText } },
      fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        bottom: { style: "thick", color: { rgb: colors.titleBorderBottom } },
      },
    };
  }

  // Row 2: Subtitle
  const genDateStr = new Date(metadata.generated_on || Date.now()).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const subRow = new Array(totalCols).fill("");
  subRow[0] = `Comprehensive Workforce Attendance Matrix & Shift Compliance Audit | Generated on: ${genDateStr}`;
  worksheetData.push(subRow);
  for (let c = 0; c <= lastColIdx; c++) {
    const col = getColLetter(c);
    styleMap[`${col}2`] = {
      font: { name: "Calibri", italic: true, sz: 9.5, color: { rgb: colors.subtitleText } },
      fill: { fgColor: { rgb: colors.subtitleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        bottom: { style: "thin", color: { rgb: colors.subtitleBorderBottom } },
      },
    };
  }

  // Row 3: Blank spacer
  worksheetData.push([]);

  // Row 4: Scope / Metadata Block
  const metaRowData = new Array(totalCols).fill("");
  metaRowData[0] = "ORGANIZATION";
  metaRowData[1] = metadata.organization || "N/A";
  if (totalCols >= 6) {
    metaRowData[3] = "AUDIT PERIOD";
    metaRowData[4] = dateRangeDisplay;
  }
  if (totalCols >= 8) {
    metaRowData[6] = "REPORT TYPE";
    metaRowData[7] = "Attendance Matrix";
  }
  worksheetData.push(metaRowData);
  const metaRow = worksheetData.length;

  const labelStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.metaLabelText } },
    fill: { fgColor: { rgb: colors.metaLabelBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };
  const valStyle = {
    font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.metaValText } },
    fill: { fgColor: { rgb: colors.metaValBg }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  for (let c = 0; c <= lastColIdx; c++) {
    const col = getColLetter(c);
    if (c === 0 || c === 3 || c === 6) {
      styleMap[`${col}${metaRow}`] = labelStyle;
    } else {
      styleMap[`${col}${metaRow}`] = valStyle;
    }
  }

  // Row 5: Blank spacer
  worksheetData.push([]);

  // Row 6: KPI Header Banner
  const kpiBannerData = new Array(totalCols).fill("");
  kpiBannerData[0] = "EXECUTIVE WORKFORCE ATTENDANCE SUMMARY & COMPLIANCE METRICS";
  worksheetData.push(kpiBannerData);
  const kpiBannerRow = worksheetData.length;
  for (let c = 0; c <= lastColIdx; c++) {
    const col = getColLetter(c);
    styleMap[`${col}${kpiBannerRow}`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
      },
    };
  }

  // Rows 7 & 8: KPI Headers & Values (5 cards)
  const kpiHdrData = new Array(totalCols).fill("");
  const kpiValData = new Array(totalCols).fill("");

  kpiHdrData[0] = "Active Cleaners";
  kpiValData[0] = totalEmployees;

  kpiHdrData[1] = "Audit Window";
  kpiValData[1] = `${totalAuditDays} Day${totalAuditDays !== 1 ? 's' : ''}`;

  kpiHdrData[2] = "Present Shifts (P)";
  kpiValData[2] = presentCount;

  kpiHdrData[3] = "Absent Shifts (A)";
  kpiValData[3] = absentCount;

  kpiHdrData[4] = "Attendance Rate";
  kpiValData[4] = rateStr;

  worksheetData.push(kpiHdrData);
  const kpiHdrRow = worksheetData.length;

  worksheetData.push(kpiValData);
  const kpiValRow = worksheetData.length;

  const kpiHdrStyle = {
    font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.kpiHeaderText } },
    fill: { fgColor: { rgb: colors.kpiHeaderBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  };

  const createKpiValStyle = (textColor) => ({
    font: { name: "Calibri", bold: true, sz: 13, color: { rgb: textColor } },
    fill: { fgColor: { rgb: colors.cardValBg }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
    },
  });

  for (let c = 0; c <= lastColIdx; c++) {
    const col = getColLetter(c);
    styleMap[`${col}${kpiHdrRow}`] = kpiHdrStyle;
    let textColor = colors.cardTotalText;
    if (c === 2) textColor = colors.cardPresentText;
    if (c === 3) textColor = colors.cardAbsentText;
    if (c === 4) textColor = colors.cardRateText;
    styleMap[`${col}${kpiValRow}`] = createKpiValStyle(textColor);
  }

  // Row 9: Blank spacer
  worksheetData.push([]);

  // Row 10: Section Banner
  const sectionBannerData = new Array(totalCols).fill("");
  sectionBannerData[0] = "DAILY WORKFORCE ATTENDANCE MATRIX (P: PRESENT | A: ABSENT)";
  worksheetData.push(sectionBannerData);
  const tableBannerRow = worksheetData.length;
  for (let c = 0; c <= lastColIdx; c++) {
    const col = getColLetter(c);
    styleMap[`${col}${tableBannerRow}`] = {
      font: { name: "Calibri", bold: true, sz: 10.5, color: { rgb: colors.bannerText } },
      fill: { fgColor: { rgb: colors.bannerBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
      },
    };
  }

  // Row 11: Main Column Headers
  const tableHeaders = [
    "Sr. No.",
    "Cleaner Name",
    "Phone",
    "Assigned Washrooms",
    "Days Present",
    "Attendance Rate",
    ...dateColumns.map((col) => col.label)
  ];
  worksheetData.push(tableHeaders);
  const tableHeaderRowNum = worksheetData.length;

  tableHeaders.forEach((header, colIdx) => {
    const colLetter = getColLetter(colIdx);
    const align = (colIdx === 1 || colIdx === 3) ? "left" : "center";
    styleMap[`${colLetter}${tableHeaderRowNum}`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.tableHeaderText } },
      fill: { fgColor: { rgb: colors.tableHeaderBg }, patternType: "solid" },
      alignment: { horizontal: align, vertical: "center", wrapText: true },
      border: {
        top: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        bottom: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };
  });

  // Row 12+: Matrix Rows
  matrixRows.forEach((row, idx) => {
    const cleanerName = row.cleaner_name || row.employee_name || "-";
    const phone = row.cleaner_phone || "-";
    const assignedWashrooms = row.assigned_locations || row.site_beat || "Unassigned";
    const daysPresent = row.days_present ?? row.days_worked ?? 0;
    const attRate = totalAuditDays > 0 ? `${((daysPresent / totalAuditDays) * 100).toFixed(0)}%` : "0%";

    const dayCells = dateColumns.map((col) => {
      const cellData = row.attendance_map?.[col.date];
      const isPresent = cellData?.code === "P" || cellData?.status?.toLowerCase() === "present";
      return isPresent ? "P" : "A";
    });

    const dataRow = [
      idx + 1,
      cleanerName,
      phone,
      assignedWashrooms,
      daysPresent,
      attRate,
      ...dayCells
    ];

    const rowNum = worksheetData.length + 1;
    worksheetData.push(dataRow);

    const baseRowBg = idx % 2 === 0 ? "FFFFFF" : colors.rowOddBg;

    // Col A: Sr No
    styleMap[`A${rowNum}`] = {
      font: { name: "Calibri", sz: 9.5 },
      fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Col B: Cleaner Name
    styleMap[`B${rowNum}`] = {
      font: { name: "Calibri", sz: 9.5, bold: true },
      fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Col C: Phone
    styleMap[`C${rowNum}`] = {
      font: { name: "Calibri", sz: 9 },
      fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Col D: Assigned Washrooms
    styleMap[`D${rowNum}`] = {
      font: { name: "Calibri", sz: 9 },
      fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center", wrapText: true },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Col E: Days Present
    styleMap[`E${rowNum}`] = {
      font: { name: "Calibri", sz: 9.5, bold: true, color: { rgb: daysPresent > 0 ? colors.presentText : colors.absentText } },
      fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Col F: Attendance Rate
    const attRateNum = parseFloat(attRate);
    let rateColor = colors.cardTotalText;
    if (attRateNum >= 75) rateColor = colors.presentText;
    else if (attRateNum >= 50) rateColor = "92400E";
    else rateColor = colors.absentText;

    styleMap[`F${rowNum}`] = {
      font: { name: "Calibri", sz: 9.5, bold: true, color: { rgb: rateColor } },
      fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Date columns (G+)
    dayCells.forEach((cellVal, cIdx) => {
      const colLetter = getColLetter(6 + cIdx);
      const isP = cellVal === "P";
      styleMap[`${colLetter}${rowNum}`] = {
        font: { name: "Calibri", sz: 9.5, bold: true, color: { rgb: isP ? colors.presentText : colors.absentText } },
        fill: { fgColor: { rgb: isP ? colors.presentBg : colors.absentBg }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center" },
        border: {
          left: { style: "thin", color: { rgb: colors.borderColor } },
          right: { style: "thin", color: { rgb: colors.borderColor } },
          top: { style: "thin", color: { rgb: colors.borderColor } },
          bottom: { style: "thin", color: { rgb: colors.borderColor } },
        },
      };
    });
  });

  // Bottom Summary Rows:
  // 1. DAILY PRESENT SHIFTS (P)
  const summaryRowPresent = [
    "DAILY PRESENT SHIFTS (P)",
    "",
    "",
    "",
    presentCount,
    rateStr,
    ...dateColumns.map((col) => dailyPresent[col.date])
  ];
  worksheetData.push(summaryRowPresent);
  const rowNumPres = worksheetData.length;

  // 2. DAILY ABSENT SHIFTS (A)
  const summaryRowAbsent = [
    "DAILY ABSENT SHIFTS (A)",
    "",
    "",
    "",
    absentCount,
    "-",
    ...dateColumns.map((col) => dailyAbsent[col.date])
  ];
  worksheetData.push(summaryRowAbsent);
  const rowNumAbs = worksheetData.length;

  // 3. DAILY COMPLIANCE RATE (%)
  const summaryRowRate = [
    "DAILY ATTENDANCE COMPLIANCE %",
    "",
    "",
    "",
    presentCount,
    rateStr,
    ...dateColumns.map((col) => totalEmployees > 0 ? `${((dailyPresent[col.date] / totalEmployees) * 100).toFixed(0)}%` : "0%")
  ];
  worksheetData.push(summaryRowRate);
  const rowNumRate = worksheetData.length;

  // Style summary rows
  for (let c = 0; c <= lastColIdx; c++) {
    const colLetter = getColLetter(c);
    // Present row
    styleMap[`${colLetter}${rowNumPres}`] = {
      font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.presentText } },
      fill: { fgColor: { rgb: "F0FDF4" }, patternType: "solid" },
      alignment: { horizontal: c === 0 ? "left" : "center", vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Absent row
    styleMap[`${colLetter}${rowNumAbs}`] = {
      font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.absentText } },
      fill: { fgColor: { rgb: "FEF2F2" }, patternType: "solid" },
      alignment: { horizontal: c === 0 ? "left" : "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "thin", color: { rgb: colors.borderColor } },
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };

    // Rate row
    styleMap[`${colLetter}${rowNumRate}`] = {
      font: { name: "Calibri", bold: true, sz: 9.5, color: { rgb: colors.titleText } },
      fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
      alignment: { horizontal: c === 0 ? "left" : "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: colors.borderColor } },
        bottom: { style: "medium", color: { rgb: colors.bannerBorderBottom } },
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };
  }

  const wsMuster = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set merges
  wsMuster["!merges"] = [
    // Title
    { s: { r: 0, c: 0 }, e: { r: 0, c: lastColIdx } },
    // Subtitle
    { s: { r: 1, c: 0 }, e: { r: 1, c: lastColIdx } },
    // Scope Block
    { s: { r: metaRow - 1, c: 1 }, e: { r: metaRow - 1, c: 2 } }, // Org val
    { s: { r: metaRow - 1, c: 4 }, e: { r: metaRow - 1, c: 5 } }, // Date val
    ...(totalCols >= 8 ? [{ s: { r: metaRow - 1, c: 7 }, e: { r: metaRow - 1, c: lastColIdx } }] : []),
    // KPI Banner
    { s: { r: kpiBannerRow - 1, c: 0 }, e: { r: kpiBannerRow - 1, c: lastColIdx } },
    // Table Banner
    { s: { r: tableBannerRow - 1, c: 0 }, e: { r: tableBannerRow - 1, c: lastColIdx } },
    // Summary Row Merges (Cols A-D for labels)
    { s: { r: rowNumPres - 1, c: 0 }, e: { r: rowNumPres - 1, c: 3 } },
    { s: { r: rowNumAbs - 1, c: 0 }, e: { r: rowNumAbs - 1, c: 3 } },
    { s: { r: rowNumRate - 1, c: 0 }, e: { r: rowNumRate - 1, c: 3 } },
  ];

  // Column widths
  const colWidths = [
    { wch: 8 },  // Sr No
    { wch: 24 }, // Cleaner Name
    { wch: 16 }, // Phone
    { wch: 38 }, // Assigned Washrooms
    { wch: 14 }, // Days Present
    { wch: 16 }, // Attendance Rate
    ...dateColumns.map(() => ({ wch: 10 }))
  ];
  wsMuster["!cols"] = colWidths;

  // Apply styles
  Object.keys(styleMap).forEach((cellRef) => {
    if (!wsMuster[cellRef]) {
      wsMuster[cellRef] = { t: "s", v: "" };
    }
    wsMuster[cellRef].s = styleMap[cellRef];
  });

  XLSX.utils.book_append_sheet(wb, wsMuster, "Attendance Matrix");

  // =========================================================================
  // Sheet 2: Cleaner Summary Roster
  // =========================================================================
  const summarySheetData = [];
  const summaryStyleMap = {};

  summarySheetData.push(["CLEANER WORKFORCE ATTENDANCE ROSTER SUMMARY", "", "", "", "", "", "", ""]);
  for (let c = 0; c <= 7; c++) {
    const col = getColLetter(c);
    summaryStyleMap[`${col}1`] = {
      font: { name: "Calibri", bold: true, sz: 14, color: { rgb: colors.titleText } },
      fill: { fgColor: { rgb: colors.titleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "thick", color: { rgb: colors.titleBorderBottom } } },
    };
  }

  summarySheetData.push([`Audit Period: ${dateRangeDisplay} | Total Active Cleaners: ${totalEmployees}`, "", "", "", "", "", "", ""]);
  for (let c = 0; c <= 7; c++) {
    const col = getColLetter(c);
    summaryStyleMap[`${col}2`] = {
      font: { name: "Calibri", italic: true, sz: 9.5, color: { rgb: colors.subtitleText } },
      fill: { fgColor: { rgb: colors.subtitleBg }, patternType: "solid" },
      alignment: { horizontal: "center", vertical: "center" },
      border: { bottom: { style: "thin", color: { rgb: colors.subtitleBorderBottom } } },
    };
  }

  summarySheetData.push([]);

  const rosterHeaders = [
    "Sr. No.",
    "Cleaner Name",
    "Phone",
    "Assigned Washrooms",
    "Total Shifts",
    "Days Present",
    "Attendance Rate",
    "Compliance Tier"
  ];
  summarySheetData.push(rosterHeaders);
  const rosterHdrRow = summarySheetData.length;

  rosterHeaders.forEach((h, cIdx) => {
    const colLetter = getColLetter(cIdx);
    const align = (cIdx === 1 || cIdx === 3) ? "left" : "center";
    summaryStyleMap[`${colLetter}${rosterHdrRow}`] = {
      font: { name: "Calibri", bold: true, sz: 10, color: { rgb: colors.tableHeaderText } },
      fill: { fgColor: { rgb: colors.tableHeaderBg }, patternType: "solid" },
      alignment: { horizontal: align, vertical: "center" },
      border: {
        top: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        bottom: { style: "medium", color: { rgb: colors.tableHeaderBg } },
        left: { style: "thin", color: { rgb: colors.borderColor } },
        right: { style: "thin", color: { rgb: colors.borderColor } },
      },
    };
  });

  matrixRows.forEach((r, idx) => {
    const cleanerName = r.cleaner_name || r.employee_name || "-";
    const phone = r.cleaner_phone || "-";
    const assignedWashrooms = r.assigned_locations || r.site_beat || "Unassigned";
    const daysPresent = r.days_present ?? r.days_worked ?? 0;
    const rateVal = totalAuditDays > 0 ? (daysPresent / totalAuditDays) * 100 : 0;
    let tier = "LOW ATTENDANCE";
    let tierBg = colors.tierLowBg;
    let tierText = colors.tierLowText;
    if (rateVal >= 80) {
      tier = "HIGH ATTENDANCE";
      tierBg = colors.tierHighBg;
      tierText = colors.tierHighText;
    } else if (rateVal >= 50) {
      tier = "MODERATE ATTENDANCE";
      tierBg = colors.tierModBg;
      tierText = colors.tierModText;
    }

    const rowData = [
      idx + 1,
      cleanerName,
      phone,
      assignedWashrooms,
      totalAuditDays,
      daysPresent,
      `${rateVal.toFixed(0)}%`,
      tier
    ];

    const rowNum = summarySheetData.length + 1;
    summarySheetData.push(rowData);

    const baseRowBg = idx % 2 === 0 ? "FFFFFF" : colors.rowOddBg;

    for (let c = 0; c <= 7; c++) {
      const colLetter = getColLetter(c);
      if (c === 7) {
        summaryStyleMap[`${colLetter}${rowNum}`] = {
          font: { name: "Calibri", bold: true, sz: 9, color: { rgb: tierText } },
          fill: { fgColor: { rgb: tierBg }, patternType: "solid" },
          alignment: { horizontal: "center", vertical: "center" },
          border: {
            left: { style: "thin", color: { rgb: colors.borderColor } },
            right: { style: "thin", color: { rgb: colors.borderColor } },
            top: { style: "thin", color: { rgb: colors.borderColor } },
            bottom: { style: "thin", color: { rgb: colors.borderColor } },
          },
        };
      } else {
        const align = (c === 1 || c === 3) ? "left" : "center";
        summaryStyleMap[`${colLetter}${rowNum}`] = {
          font: { name: "Calibri", sz: 9.5, bold: c === 1 || c === 5 },
          fill: { fgColor: { rgb: baseRowBg }, patternType: "solid" },
          alignment: { horizontal: align, vertical: "center" },
          border: {
            left: { style: "thin", color: { rgb: colors.borderColor } },
            right: { style: "thin", color: { rgb: colors.borderColor } },
            top: { style: "thin", color: { rgb: colors.borderColor } },
            bottom: { style: "thin", color: { rgb: colors.borderColor } },
          },
        };
      }
    }
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
  wsSummary["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
  ];
  wsSummary["!cols"] = [
    { wch: 8 },  // Sr No
    { wch: 24 }, // Cleaner Name
    { wch: 16 }, // Phone
    { wch: 38 }, // Assigned Washrooms
    { wch: 14 }, // Total Shifts
    { wch: 14 }, // Days Present
    { wch: 16 }, // Attendance Rate
    { wch: 24 }, // Compliance Tier
  ];

  Object.keys(summaryStyleMap).forEach((cellRef) => {
    if (!wsSummary[cellRef]) {
      wsSummary[cellRef] = { t: "s", v: "" };
    }
    wsSummary[cellRef].s = summaryStyleMap[cellRef];
  });

  XLSX.utils.book_append_sheet(wb, wsSummary, "Cleaner Summary");

  XLSX.writeFile(wb, `Cleaner_Attendance_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
};

// ✅ EXPORT NOT CLEANED WASHROOMS REPORT TO PDF
const exportNotCleanedWashroomsToPDF = (data, metadata) => {
  const reportTitle =
    metadata?.dynamic_report_name ||
    metadata?.report_type ||
    "Not Cleaned Washrooms Report";
  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const availableWidth = pageWidth - 28;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(reportTitle, 14, 15);

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, 18, pageWidth - 14, 18);

  const startDate = metadata?.date_range?.start || "N/A";
  const endDate = metadata?.date_range?.end || "N/A";
  const dateRangeStr =
    startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  const generatedStr = new Date(
    metadata?.generated_on || Date.now(),
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Metadata Table
  autoTable(doc, {
    head: [["Organization", "Date Range", "Report Type", "Generated On"]],
    body: [
      [
        metadata?.organization || "N/A",
        dateRangeStr,
        reportTitle,
        generatedStr,
      ],
    ],
    startY: 23,
    tableWidth: availableWidth,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  let currentY = doc.lastAutoTable.finalY + 3;

  const rows = Array.isArray(data) ? data : [];
  const totalWashrooms = metadata?.total_washrooms ?? rows.length;
  const cleanedWashrooms = metadata?.cleaned_washrooms ?? 0;
  const notCleanedCount = metadata?.not_cleaned_count ?? rows.length;
  const coveragePct = metadata?.coverage_percentage ?? 0;

  // KPI Summary Table
  autoTable(doc, {
    head: [
      [
        "Total Washrooms",
        "Cleaned Washrooms",
        "Not Cleaned Washrooms",
        "Cleaning Coverage",
      ],
    ],
    body: [
      [
        `${totalWashrooms} Washrooms`,
        `${cleanedWashrooms} Washrooms`,
        `${notCleanedCount} Washrooms`,
        `${coveragePct}%`,
      ],
    ],
    startY: currentY,
    tableWidth: availableWidth,
    theme: "grid",
    headStyles: {
      fillColor: [225, 29, 72],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
      fontStyle: "bold",
      fillColor: [255, 241, 242],
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 6;

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(`Uncleaned Washrooms (${rows.length})`, 14, currentY);
  currentY += 3;

  const formatLastCleaned = (dt) => {
    if (!dt) return "Never Cleaned";
    return new Date(dt).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const tableBody = rows.map((row, idx) => [
    idx + 1,
    row.name || "Unknown",
    row.zone || "N/A",
    row.assigned_cleaners || "Unassigned",
    row.cleaner_phones || "N/A",
    formatLastCleaned(row.last_cleaned_on),
    row.days_since_cleaned !== null && row.days_since_cleaned !== undefined
      ? `${row.days_since_cleaned} ${row.days_since_cleaned === 1 ? "day" : "days"}`
      : "Never",
    "NOT CLEANED",
  ]);

  autoTable(doc, {
    head: [
      [
        "#",
        "Washroom Name",
        "Zone",
        "Assigned Cleaner(s)",
        "Cleaner Phone",
        "Last Cleaned On",
        "Days Since Cleaned",
        "Status",
      ],
    ],
    body:
      tableBody.length > 0
        ? tableBody
        : [["-", "All accessible washrooms were cleaned in this period.", "", "", "", "", "", "-"]],
    startY: currentY,
    tableWidth: availableWidth,
    theme: "grid",
    headStyles: {
      fillColor: [15, 36, 71],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left", cellWidth: 55 },
      2: { halign: "center", cellWidth: 28 },
      3: { halign: "left", cellWidth: 46 },
      4: { halign: "center", cellWidth: 32 },
      5: { halign: "center", cellWidth: 42 },
      6: { halign: "center", cellWidth: 28 },
      7: { halign: "center", cellWidth: 28, fontStyle: "bold", textColor: [190, 18, 60] },
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} | ${metadata?.organization || "SaafAI"} | ${reportTitle}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

// ✅ EXPORT NOT CLEANED WASHROOMS REPORT TO EXCEL - REFINED EXECUTIVE THEME
const exportNotCleanedWashroomsToExcel = (data, metadata) => {
  const wb = XLSX.utils.book_new();
  const rows = Array.isArray(data) ? data : [];
  const reportTitle =
    metadata?.dynamic_report_name ||
    metadata?.report_type ||
    "Not Cleaned Washrooms Report";
  const startDate = metadata?.date_range?.start || "N/A";
  const endDate = metadata?.date_range?.end || "N/A";
  const dateRangeStr =
    startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  const wsData = [];
  wsData.push([`${reportTitle.toUpperCase()} — ${metadata?.organization || "SaafAI"}`]);
  wsData.push([`Date Range: ${dateRangeStr} | Generated: ${new Date(metadata?.generated_on || Date.now()).toLocaleString("en-IN")}`]);
  wsData.push([
    `Total Washrooms: ${metadata?.total_washrooms ?? rows.length}`,
    "",
    `Cleaned: ${metadata?.cleaned_washrooms ?? 0}`,
    "",
    `Not Cleaned: ${metadata?.not_cleaned_count ?? rows.length}`,
    "",
    `Coverage: ${metadata?.coverage_percentage ?? 0}%`,
    "",
    "",
  ]);
  wsData.push([]);
  wsData.push([
    "Sr No",
    "Washroom Name",
    "Zone",
    "Address",
    "Assigned Cleaner(s)",
    "Cleaner Phone",
    "Last Cleaned On",
    "Days Since Cleaned",
    "Status",
  ]);

  rows.forEach((row, idx) => {
    wsData.push([
      idx + 1,
      row.name || "Unknown",
      row.zone || "N/A",
      row.address || "N/A",
      row.assigned_cleaners || "Unassigned",
      row.cleaner_phones || "N/A",
      row.last_cleaned_on
        ? new Date(row.last_cleaned_on).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "Never Cleaned",
      row.days_since_cleaned !== null && row.days_since_cleaned !== undefined
        ? row.days_since_cleaned
        : "Never",
      "NOT CLEANED",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    { s: { r: 2, c: 2 }, e: { r: 2, c: 3 } },
    { s: { r: 2, c: 4 }, e: { r: 2, c: 5 } },
    { s: { r: 2, c: 6 }, e: { r: 2, c: 8 } },
  ];

  const thinBorder = {
    top: { style: "thin", color: { rgb: "CBD5E1" } },
    bottom: { style: "thin", color: { rgb: "CBD5E1" } },
    left: { style: "thin", color: { rgb: "CBD5E1" } },
    right: { style: "thin", color: { rgb: "CBD5E1" } },
  };

  // Style Title Banner
  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" }, name: "Calibri" },
      fill: { fgColor: { rgb: "0F2447" } },
      alignment: { horizontal: "left", vertical: "center" },
    };
  }
  if (ws["A2"]) {
    ws["A2"].s = {
      font: { italic: true, sz: 10, color: { rgb: "334155" }, name: "Calibri" },
      fill: { fgColor: { rgb: "F1F5F9" } },
      alignment: { horizontal: "left", vertical: "center" },
    };
  }

  // Style KPI Row (Row 3, index 2) across full width
  for (let c = 0; c <= 8; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c });
    if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
    const isNotCleaned = c === 4 || c === 5;
    ws[cellRef].s = {
      font: { bold: true, sz: 10, color: { rgb: isNotCleaned ? "BE123C" : "0F2447" }, name: "Calibri" },
      fill: { fgColor: { rgb: isNotCleaned ? "FFF1F2" : "EFF6FF" } },
      border: thinBorder,
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  // Style Table Header (Row 5, index 4)
  for (let c = 0; c <= 8; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 4, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, sz: 10, color: { rgb: "FFFFFF" }, name: "Calibri" },
        fill: { fgColor: { rgb: "0F2447" } },
        border: thinBorder,
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  // Style Data Rows
  for (let r = 5; r < wsData.length; r++) {
    const isEven = (r - 5) % 2 === 1;
    for (let c = 0; c <= 8; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (ws[cellRef]) {
        const isStatus = c === 8;
        ws[cellRef].s = {
          font: {
            sz: 10,
            bold: isStatus || c === 1,
            color: { rgb: isStatus ? "BE123C" : "1E293B" },
            name: "Calibri",
          },
          fill: {
            fgColor: {
              rgb: isStatus ? "FFE4E6" : isEven ? "F8FAFC" : "FFFFFF",
            },
          },
          border: thinBorder,
          alignment: {
            horizontal: c === 0 || c === 5 || c === 7 || c === 8 ? "center" : "left",
            vertical: "center",
          },
        };
      }
    }
  }

  ws["!cols"] = [
    { wch: 8 },
    { wch: 32 },
    { wch: 18 },
    { wch: 28 },
    { wch: 26 },
    { wch: 18 },
    { wch: 22 },
    { wch: 18 },
    { wch: 15 },
  ];
  ws["!rows"] = [{ hpt: 28 }, { hpt: 20 }, { hpt: 22 }, { hpt: 10 }, { hpt: 24 }];

  XLSX.utils.book_append_sheet(wb, ws, "Not Cleaned Washrooms");
  XLSX.writeFile(
    wb,
    `Not_Cleaned_Washrooms_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

// ✅ EXPORT SLA THRESHOLD BREACH REPORT TO PDF
const exportSlaThresholdBreachToPDF = (data, metadata) => {
  const reportTitle =
    metadata?.dynamic_report_name ||
    metadata?.report_type ||
    "SLA Threshold Breach Report";
  const doc = new jsPDF("l", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const availableWidth = pageWidth - 28;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138);
  doc.text(reportTitle, 14, 15);

  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, 18, pageWidth - 14, 18);

  const startDate = metadata?.date_range?.start || "N/A";
  const endDate = metadata?.date_range?.end || "N/A";
  const dateRangeStr =
    startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  const generatedStr = new Date(
    metadata?.generated_on || Date.now(),
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Metadata Table
  autoTable(doc, {
    head: [["Organization", "Date Range", "Baseline Threshold", "Generated On"]],
    body: [
      [
        metadata?.organization || "N/A",
        dateRangeStr,
        `${metadata?.company_threshold ?? 7.5} / 10`,
        generatedStr,
      ],
    ],
    startY: 23,
    tableWidth: availableWidth,
    theme: "grid",
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [51, 65, 85],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });

  let currentY = doc.lastAutoTable.finalY + 3;
  const rows = Array.isArray(data) ? data : [];

  // KPI Summary Table
  autoTable(doc, {
    head: [
      [
        "Total Breaches",
        "Evaluated Reviews",
        "Breach Rate",
        "Affected Washrooms",
      ],
    ],
    body: [
      [
        metadata?.total_breaches ?? rows.length,
        metadata?.total_reviews_evaluated ?? 0,
        `${metadata?.breach_rate ?? 0}%`,
        `${metadata?.affected_washrooms ?? 0} Washrooms`,
      ],
    ],
    startY: currentY,
    tableWidth: availableWidth,
    theme: "grid",
    headStyles: {
      fillColor: [225, 29, 72],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: "center",
      cellPadding: 3,
      fontStyle: "bold",
      fillColor: [255, 241, 242],
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(`SLA Breach Details (${rows.length})`, 14, currentY);
  currentY += 3;

  const tableBody = rows.map((row, idx) => [
    idx + 1,
    row.washroom_name || "Unknown",
    row.zone || "N/A",
    row.cleaner_name || "N/A",
    row.cleaner_phone || "N/A",
    row.score ?? 0,
    row.threshold ?? 7.5,
    `-${row.breach_gap ?? 0}`,
    `#${row.attempt_no || 1}`,
    row.reviewed_at
      ? new Date(row.reviewed_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A",
  ]);

  autoTable(doc, {
    head: [
      [
        "#",
        "Washroom",
        "Zone",
        "Cleaner",
        "Phone",
        "AI Score",
        "Threshold",
        "Deficit",
        "Attempt",
        "Reviewed On",
      ],
    ],
    body:
      tableBody.length > 0
        ? tableBody
        : [["-", "No SLA threshold breaches found in this period.", "", "", "", "", "", "", "", "-"]],
    startY: currentY,
    tableWidth: availableWidth,
    theme: "grid",
    headStyles: {
      fillColor: [15, 36, 71],
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8.5,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "left", cellWidth: 50 },
      2: { halign: "center", cellWidth: 26 },
      3: { halign: "left", cellWidth: 38 },
      4: { halign: "center", cellWidth: 28 },
      5: { halign: "center", cellWidth: 20, fontStyle: "bold", textColor: [190, 18, 60] },
      6: { halign: "center", cellWidth: 22 },
      7: { halign: "center", cellWidth: 20, fontStyle: "bold", textColor: [180, 83, 9] },
      8: { halign: "center", cellWidth: 18 },
      9: { halign: "center", cellWidth: 37 },
    },
    margin: { left: 14, right: 14 },
  });

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Page ${i} of ${pageCount} | ${metadata?.organization || "SaafAI"} | ${reportTitle}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: "center" },
    );
  }

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  outputPdf(doc, fileName);
};

// ✅ EXPORT SLA THRESHOLD BREACH REPORT TO EXCEL - REFINED EXECUTIVE THEME
const exportSlaThresholdBreachToExcel = (data, metadata) => {
  const wb = XLSX.utils.book_new();
  const rows = Array.isArray(data) ? data : [];
  const reportTitle =
    metadata?.dynamic_report_name ||
    metadata?.report_type ||
    "SLA Threshold Breach Report";
  const startDate = metadata?.date_range?.start || "N/A";
  const endDate = metadata?.date_range?.end || "N/A";
  const dateRangeStr =
    startDate === endDate ? startDate : `${startDate} to ${endDate}`;

  const wsData = [];
  wsData.push([`${reportTitle.toUpperCase()} — ${metadata?.organization || "SaafAI"}`]);
  wsData.push([`Date Range: ${dateRangeStr} | Baseline Threshold: ${metadata?.company_threshold ?? 7.5}/10 | Generated: ${new Date(metadata?.generated_on || Date.now()).toLocaleString("en-IN")}`]);
  wsData.push([
    `Total Breaches: ${metadata?.total_breaches ?? rows.length}`,
    "",
    `Evaluated: ${metadata?.total_reviews_evaluated ?? 0}`,
    "",
    `Breach Rate: ${metadata?.breach_rate ?? 0}%`,
    "",
    "",
    `Affected Washrooms: ${metadata?.affected_washrooms ?? 0}`,
    "",
    "",
  ]);
  wsData.push([]);
  wsData.push([
    "Sr No",
    "Washroom",
    "Zone",
    "Cleaner",
    "Phone",
    "AI Score",
    "SLA Threshold",
    "Deficit",
    "Attempt",
    "Reviewed On",
  ]);

  rows.forEach((row, idx) => {
    wsData.push([
      idx + 1,
      row.washroom_name || "Unknown",
      row.zone || "N/A",
      row.cleaner_name || "N/A",
      row.cleaner_phone || "N/A",
      row.score ?? 0,
      row.threshold ?? 7.5,
      `-${row.breach_gap ?? 0}`,
      `#${row.attempt_no || 1}`,
      row.reviewed_at
        ? new Date(row.reviewed_at).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "N/A",
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 9 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 9 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
    { s: { r: 2, c: 2 }, e: { r: 2, c: 3 } },
    { s: { r: 2, c: 4 }, e: { r: 2, c: 6 } },
    { s: { r: 2, c: 7 }, e: { r: 2, c: 9 } },
  ];

  const thinBorder = {
    top: { style: "thin", color: { rgb: "CBD5E1" } },
    bottom: { style: "thin", color: { rgb: "CBD5E1" } },
    left: { style: "thin", color: { rgb: "CBD5E1" } },
    right: { style: "thin", color: { rgb: "CBD5E1" } },
  };

  if (ws["A1"]) {
    ws["A1"].s = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" }, name: "Calibri" },
      fill: { fgColor: { rgb: "0F2447" } },
      alignment: { horizontal: "left", vertical: "center" },
    };
  }
  if (ws["A2"]) {
    ws["A2"].s = {
      font: { italic: true, sz: 10, color: { rgb: "334155" }, name: "Calibri" },
      fill: { fgColor: { rgb: "F1F5F9" } },
      alignment: { horizontal: "left", vertical: "center" },
    };
  }

  for (let c = 0; c <= 9; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c });
    if (!ws[cellRef]) ws[cellRef] = { t: "s", v: "" };
    const isBreach = c === 0 || c === 1;
    ws[cellRef].s = {
      font: { bold: true, sz: 10, color: { rgb: isBreach ? "BE123C" : "0F2447" }, name: "Calibri" },
      fill: { fgColor: { rgb: isBreach ? "FFF1F2" : "EFF6FF" } },
      border: thinBorder,
      alignment: { horizontal: "center", vertical: "center" },
    };
  }

  for (let c = 0; c <= 9; c++) {
    const cellRef = XLSX.utils.encode_cell({ r: 4, c });
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, sz: 10, color: { rgb: "FFFFFF" }, name: "Calibri" },
        fill: { fgColor: { rgb: "0F2447" } },
        border: thinBorder,
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  for (let r = 5; r < wsData.length; r++) {
    const isEven = (r - 5) % 2 === 1;
    for (let c = 0; c <= 9; c++) {
      const cellRef = XLSX.utils.encode_cell({ r, c });
      if (ws[cellRef]) {
        const isScore = c === 5;
        ws[cellRef].s = {
          font: {
            sz: 10,
            bold: isScore || c === 1,
            color: { rgb: isScore ? "BE123C" : "1E293B" },
            name: "Calibri",
          },
          fill: {
            fgColor: {
              rgb: isScore ? "FFE4E6" : isEven ? "F8FAFC" : "FFFFFF",
            },
          },
          border: thinBorder,
          alignment: {
            horizontal: c === 0 || c >= 4 ? "center" : "left",
            vertical: "center",
          },
        };
      }
    }
  }

  ws["!cols"] = [
    { wch: 8 },
    { wch: 30 },
    { wch: 18 },
    { wch: 24 },
    { wch: 16 },
    { wch: 12 },
    { wch: 14 },
    { wch: 12 },
    { wch: 10 },
    { wch: 22 },
  ];
  ws["!rows"] = [{ hpt: 28 }, { hpt: 20 }, { hpt: 22 }, { hpt: 10 }, { hpt: 24 }];

  XLSX.utils.book_append_sheet(wb, ws, "SLA Threshold Breaches");
  XLSX.writeFile(
    wb,
    `SLA_Threshold_Breach_Report_${new Date().toISOString().split("T")[0]}.xlsx`,
  );
};

export const exportToPDF = (
  data,
  metadata,
  reportType = "zone_wise",
  signatureData = null,
  mode = "save",
) => {
  _pdfOutputMode = mode;
  try {
    if (reportType === "daily_task") {
      exportDailyTaskToPDF(data, metadata);
    } else if (reportType === "zone_wise") {
      exportZoneWiseToPDF(data, metadata);
    } else if (reportType === "ai_scoring") {
      exportAiScoringToPDF(data, metadata);
    } else if (reportType === "detailed_cleaning") {
      exportDetailedCleaningReport(data, metadata, "pdf");
    } else if (reportType === "cleaner_performance_summary") {
      exportCleanerPerformanceSummaryToPDF(data, metadata);
    } else if (reportType === "washroom_report") {
      exportWashroomReportToPDF(data, metadata);
    } else if (reportType === "cleaner_report") {
      exportCleanerReportToPDF(data, metadata);
    } else if (reportType === "washroom_hygiene_trend") {
      exportHygieneTrendToPDF(data, metadata);
    } else if (reportType === "cleaner_penalty_summary") {
      exportCleanerPenaltySummaryToPDF(data, metadata);
    } else if (reportType === "washroom_penalty_summary") {
      exportWashroomPenaltySummaryToPDF(data, metadata);
    } else if (reportType === "attendance_report") {
      exportAttendanceReportToPDF(data, metadata);
    } else if (reportType === "not_cleaned_washrooms") {
      exportNotCleanedWashroomsToPDF(data, metadata);
    } else if (reportType === "sla_threshold_breach") {
      exportSlaThresholdBreachToPDF(data, metadata);
    } else {
      console.error("Unknown report type:", reportType);
    }
  } finally {
    _pdfOutputMode = "save";
  }
};

/**
 * ✅ Print formatted PDF directly (replaces raw window.print() of modal DOM)
 */
export const printReportPDF = (data, metadata, reportType = "zone_wise") => {
  exportToPDF(data, metadata, reportType, null, "print");
};

/**
 * Main Excel export function
 */
export const exportToExcel = (data, metadata, reportType = "zone_wise") => {
  if (reportType === "daily_task") {
    exportDailyTaskToExcel(data, metadata);
  } else if (reportType === "zone_wise") {
    exportZoneWiseToExcel(data, metadata);
  } else if (reportType === "ai_scoring") {
    exportAiScoringToExcel(data, metadata);
  } else if (reportType === "cleaner_performance_summary") {
    exportCleanerPerformanceSummaryToExcel(data, metadata);
  } else if (reportType === "detailed_cleaning") {
    exportDetailedCleaningReport(data, metadata, "excel");
  } else if (reportType === "washroom_report") {
    exportWashroomReportToExcel(data, metadata);
  } else if (reportType === "cleaner_report") {
    exportCleanerReportToExcel(data, metadata);
  } else if (reportType === "washroom_hygiene_trend") {
    exportHygieneTrendToExcel(data, metadata);
  } else if (reportType === "cleaner_penalty_summary") {
    exportCleanerPenaltySummaryToExcel(data, metadata);
  } else if (reportType === "washroom_penalty_summary") {
    exportWashroomPenaltySummaryToExcel(data, metadata);
  } else if (reportType === "attendance_report") {
    exportAttendanceReportToExcel(data, metadata);
  } else if (reportType === "not_cleaned_washrooms") {
    exportNotCleanedWashroomsToExcel(data, metadata);
  } else if (reportType === "sla_threshold_breach") {
    exportSlaThresholdBreachToExcel(data, metadata);
  } else {
    console.error("Unknown report type:", reportType);
  }
};
