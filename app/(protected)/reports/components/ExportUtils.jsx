import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { report } from "process";
import * as XLSX from "xlsx";

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
      duration: durationMinutes,
      durationDisplay: `${Math.floor(durationHours)} hrs`,
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
      task.cleaner_name,
      task.washroom_full_name,
      formatDateTimeForPDF(task.task_start_time),
      formatDateTimeForPDF(task.task_end_time),
      taskInfo.durationDisplay, // ✅ Formatted duration (e.g., "2 hrs 30 min")
      task.ai_score.toFixed(1),
      task.washroom_avg_rating.toFixed(1),
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
        "Duration", // ✅ Changed header
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
    // ✅ UPDATED: Color status cells based on status
    didParseCell: function (data) {
      if (data.column.index === 8 && data.section === "body") {
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
  doc.save(fileName);
};

const exportDailyTaskToExcel = (data, metadata) => {
  const reportTitle =
    metadata.dynamic_report_name || metadata.report_type || "Daily Task Report";

  const headerRows = [
    [reportTitle],
    [],
    ["Organization", metadata.organization || "N/A"],
    ["Report Type", reportTitle],
    [
      "Date Range",
      `${metadata.date_range?.start || "N/A"} to ${metadata.date_range?.end || "N/A"}`,
    ],
    ["Generated On", new Date(metadata.generated_on).toLocaleString("en-IN")],
    [],
    ["Statistics"],
    ["Total Cleanings", metadata.total_tasks],
    ["Completed", metadata.completed_tasks],
    ["Ongoing", metadata.ongoing_tasks],
    [
      "Completion Rate",
      metadata.total_tasks > 0
        ? ((metadata.completed_tasks / metadata.total_tasks) * 100).toFixed(1) +
          "%"
        : "0%",
    ],
    [],
  ];

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

  const tableHeaders = [
    "#",
    "Cleaner Name",
    "Location / Washroom",
    "Start Time",
    "End Time",
    "Duration", // ✅ Changed header
    "AI Score (0-10)",
    "Average Rating (0-10)",
    "Status",
  ];

  // ✅ UPDATED: Use getTaskInfo for status and duration
  const tableData = data.map((task, index) => {
    const taskInfo = getTaskInfo(task);
    return [
      index + 1,
      task.cleaner_name,
      task.washroom_full_name,
      formatDateTimeForExcel(task.task_start_time),
      formatDateTimeForExcel(task.task_end_time),
      taskInfo.durationDisplay, // ✅ Formatted duration
      task.ai_score.toFixed(1),
      task.washroom_avg_rating.toFixed(1),
      taskInfo.status, // ✅ Shows COMPLETED, ONGOING, INCOMPLETE, or OVERDUE
    ];
  });

  const worksheetData = [...headerRows, tableHeaders, ...tableData];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  ws["!cols"] = [
    { wch: 5 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 }, // Duration column
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
  ];

  ws["A1"].s = {
    font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
    alignment: { horizontal: "center" },
  };

  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

  // ✅ BONUS: Add status colors to Excel
  const statusColIndex = 8; // Status is column I (index 8)
  const headerRowIndex = headerRows.length + 1; // Account for header rows

  data.forEach((task, dataIndex) => {
    const taskInfo = getTaskInfo(task);
    const excelRowIndex = headerRowIndex + dataIndex;
    const cellRef = `I${excelRowIndex + 1}`; // Excel uses 1-based indexing

    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: {
          bold: true,
          color: {
            rgb:
              taskInfo.status === "COMPLETED"
                ? "16A34A" // Green
                : taskInfo.status === "OVERDUE"
                  ? "DC2626" // Red
                  : taskInfo.status === "INCOMPLETE"
                    ? "EA930B" // Orange
                    : "3B82F6", // Blue for ONGOING
          },
        },
        alignment: { horizontal: "center" },
      };
    }
  });

  XLSX.utils.book_append_sheet(wb, ws, "Daily Task Report");

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
      ? data.reduce((sum, t) => sum + t.ai_score, 0) / data.length
      : 0;
  const avgFinalRating =
    data.length > 0
      ? data.reduce((sum, t) => sum + t.final_rating, 0) / data.length
      : 0;
  const totalImages = data.reduce(
    (sum, t) =>
      sum + (t.before_photo?.length || 0) + (t.after_photo?.length || 0),
    0,
  );

  const completedTasks = data.filter((t) => t.status === "completed").length;
  const ongoingTasks = data.length - completedTasks;

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

  // Main table data with image links text
  const tableData = data.map((task, index) => {
    const taskInfo = getTaskInfo(task);
    const beforeImages = task.before_photo || [];
    const afterImages = task.after_photo || [];

    return [
      index + 1,
      task.cleaner_name,
      task.zone_name,
      task.washroom_name,
      formatDateTimeForReport(task.task_start_time),
      formatDateTimeForReport(task.task_end_time),
      formatScore(task.ai_score),
      formatScore(task.final_rating),
      taskInfo.status,
      createImageLinksText(beforeImages.slice(0, 6)), // Before images column
      createImageLinksText(afterImages.slice(0, 6)), // After images column
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
          `${metadata.date_range?.start || "N/A"} to ${metadata.date_range?.end || "N/A"}`,
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

    currentY = doc.lastAutoTable.finalY + 3;

    // Statistics table
    autoTable(doc, {
      head: [
        [
          "Total Reviews",
          "Completed",
          "Ongoing",
          "Avg AI Score",
          "Avg Final Rating",
          "Total Images",
        ],
      ],
      body: [
        [
          data.length,
          completedTasks,
          ongoingTasks,
          avgAiScore.toFixed(1),
          avgFinalRating.toFixed(1),
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

    // Main table
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
          "Average Rating",
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
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center", fontStyle: "bold" },
        8: {
          halign: "center",
          textColor: [37, 99, 235],
          fontStyle: "italic",
        },
        9: {
          halign: "center",
          textColor: [22, 163, 74],
          fontStyle: "italic",
          cellWidth: 45,
        },
        10: {
          halign: "center",
          textColor: [101, 148, 224],
          fontStyle: "italic",
          cellWidth: 45,
        },
      },
      didDrawCell: function (cellData) {
        // ✅ Color status cells
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
    doc.save(fileName);
    console.log(`✅ PDF file exported: ${fileName}`);
  }

  // ==================== EXCEL EXPORT ====================
  else if (format === "excel") {
    const headerRows = [
      [reportTitle],
      [],
      ["Organization", metadata.organization || "N/A"],
      ["Report Type", reportTitle],
      [
        "Date Range",
        `${metadata.date_range?.start || "N/A"} to ${metadata.date_range?.end || "N/A"}`,
      ],
      ["Generated On", new Date(metadata.generated_on).toLocaleString("en-IN")],
      [],
      ["Statistics"],
      ["Total Reviews", data.length],
      ["Completed", completedTasks],
      ["Ongoing", ongoingTasks],
      ["Avg AI Score", avgAiScore.toFixed(1)],
      ["Avg Final Rating", avgFinalRating.toFixed(1)],
      ["Total Images", totalImages],
      [],
    ];

    const tableHeaders = [
      "#",
      "Cleaner Name",
      "Location / Washroom",
      "Start Time",
      "End Time",
      "AI Score (0-10)",
      "Average Rating (0-10)",
      "Status",
      "Before Images",
      "After Images",
    ];

    // Excel table data - we'll add hyperlinks separately
    const excelTableData = tableData.map((row) => [...row]);

    const worksheetData = [...headerRows, tableHeaders, ...excelTableData];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    ws["!cols"] = [
      { wch: 5 },
      { wch: 20 },
      { wch: 25 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 }, // Before images column
      { wch: 20 }, // After images column
    ];

    // Format title
    ws["A1"].s = {
      font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
      alignment: { horizontal: "center" },
    };

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

    const headerRowIndex = headerRows.length;

    // ✅ Add hyperlinks to Excel image cells
    data.forEach((task, dataIndex) => {
      const taskInfo = getTaskInfo(task);
      const excelRowIndex = headerRowIndex + 1 + dataIndex;

      // Format status column
      const statusCellRef = `H${excelRowIndex + 1}`;
      if (ws[statusCellRef]) {
        ws[statusCellRef].s = {
          font: {
            bold: true,
            color: {
              rgb:
                taskInfo.status === "COMPLETED"
                  ? "16A34A"
                  : taskInfo.status === "OVERDUE"
                    ? "DC2626"
                    : taskInfo.status === "INCOMPLETE"
                      ? "EA930B"
                      : "EA930B",
            },
          },
          alignment: { horizontal: "center" },
        };
      }

      // ✅ Add clickable hyperlinks for BEFORE images in Excel
      const beforeImages = task.before_photo || [];
      const beforeCellRef = `I${excelRowIndex + 1}`;
      if (beforeImages.length > 0 && ws[beforeCellRef]) {
        // Create hyperlink formula for first image
        const firstImageUrl = beforeImages[0];
        ws[beforeCellRef].l = {
          Target: firstImageUrl,
          Tooltip: "Click to view image",
        };
        ws[beforeCellRef].s = {
          font: { color: { rgb: "2563EB" }, underline: true },
          alignment: { horizontal: "center" },
        };
      }

      // ✅ Add clickable hyperlinks for AFTER images in Excel
      const afterImages = task.after_photo || [];
      const afterCellRef = `J${excelRowIndex + 1}`;
      if (afterImages.length > 0 && ws[afterCellRef]) {
        // Create hyperlink formula for first image
        const firstImageUrl = afterImages[0];
        ws[afterCellRef].l = {
          Target: firstImageUrl,
          Tooltip: "Click to view image",
        };
        ws[afterCellRef].s = {
          font: { color: { rgb: "16A34A" }, underline: true },
          alignment: { horizontal: "center" },
        };
      }
    });

    // ✅ Add separate sheet with full image URLs
    const imageUrlsData = [["Image URLs Reference"], []];

    data.forEach((task, taskIndex) => {
      const beforeImages = task.before_photo || [];
      const afterImages = task.after_photo || [];

      if (beforeImages.length > 0 || afterImages.length > 0) {
        imageUrlsData.push([`Task ${taskIndex + 1} - ${task.cleaner_name}`]);
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
    wsUrls["!cols"] = [{ wch: 30 }, { wch: 80 }];

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
  // Since metadata.date_columns is empty, extract from first washroom's daily_scores
  let dateColumns = [];
  if (data && data.length > 0 && data[0].daily_scores) {
    dateColumns = Object.keys(data[0].daily_scores).sort();

    // Format dates to "DD MMM" (e.g., "15 Nov")
    dateColumns = dateColumns.map((dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[date.getMonth()];
      return { key: dateStr, label: `${day} ${month}` };
    });
  }

  console.log(`📅 Extracted ${dateColumns.length} date columns`);

  // ============ SUMMARY STATISTICS ============
  const totalWashrooms = metadata?.total_washrooms || data?.length || 0;
  const totalDays = dateColumns.length;
  const overallAvgScore = metadata?.overall_avg_score || 0;

  // Calculate top & low performers
  let topPerformer = "N/A",
    topPerformerScore = 0;
  let lowPerformer = "N/A",
    lowPerformerScore = 10;

  if (data && data.length > 0) {
    const sorted = [...data].sort((a, b) => b.average_score - a.average_score);
    topPerformer = sorted[0]?.washroom_name || "N/A";
    topPerformerScore = sorted[0]?.average_score || 0;

    const sortedLow = [...data].sort(
      (a, b) => a.average_score - b.average_score,
    );
    lowPerformer = sortedLow[0]?.washroom_name || "N/A";
    lowPerformerScore = sortedLow[0]?.average_score || 10;
  }

  // Count scores in ranges
  const excellentCount = data?.filter((w) => w.average_score >= 9).length || 0;
  const goodCount =
    data?.filter((w) => w.average_score >= 7 && w.average_score < 9).length ||
    0;
  const averageCount =
    data?.filter((w) => w.average_score >= 5 && w.average_score < 7).length ||
    0;
  const poorCount = data?.filter((w) => w.average_score < 5).length || 0;

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
        excellentCount,
        goodCount,
        averageCount,
        poorCount,
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

  // ============ BUILD TABLE DATA ============
  const dailyScoresArray =
    data?.map((washroom, index) => {
      const dailyScores = dateColumns.map((dateObj) => {
        return formatScore(washroom.daily_scores?.[dateObj.key]);
      });

      return [
        index + 1,
        washroom.washroom_name,
        washroom.city || "N/A",
        washroom.zone_type || "N/A",
        ...dailyScores,
        formatScore(washroom.average_score),
      ];
    }) || [];

  // ============ BUILD COLUMN HEADERS ============
  const tableHeaders = [
    "Sr",
    "Washroom",
    "City",
    "Zone",
    ...dateColumns.map((d) => d.label),
    "Avg",
  ];

  // ============ DYNAMIC COLUMN WIDTHS (CRITICAL FOR FITTING ALL DATES) ============
  const dateColumnCount = dateColumns.length;
  const fixedColumnsWidth = 8 + 35 + 15 + 20 + 10; // Sr + Washroom + City + Zone + Avg
  const availableWidth = 297 - 28; // Page width - margins
  const remainingWidth = availableWidth - fixedColumnsWidth;
  const dateColumnWidth = Math.max(
    6,
    Math.floor(remainingWidth / dateColumnCount),
  ); // Min 6mm per date

  console.log(
    `📏 Date column width: ${dateColumnWidth}mm for ${dateColumnCount} dates`,
  );

  const columnStyles = {
    0: { halign: "center", cellWidth: 8 },
    1: { halign: "left", cellWidth: 35 },
    2: { halign: "center", cellWidth: 15 },
    3: { halign: "center", cellWidth: 20 },
  };

  // Add date column styles
  dateColumns.forEach((_, idx) => {
    columnStyles[4 + idx] = {
      halign: "center",
      cellWidth: dateColumnWidth,
      fontSize: 5.5, // Very small font for dates
    };
  });

  // Average column
  columnStyles[4 + dateColumns.length] = {
    halign: "center",
    cellWidth: 10,
    fontStyle: "bold",
  };

  // ============ MAIN TABLE WITH COLOR CODING ============
  autoTable(doc, {
    head: [tableHeaders],
    body: dailyScoresArray,
    startY: currentY,
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
        columnIndex >= 4 && columnIndex < 4 + dateColumns.length;
      const isAvgColumn = columnIndex === 4 + dateColumns.length;

      // Color code both date columns and average column
      if ((isDateColumn || isAvgColumn) && cellData.section === "body") {
        const scoreValue = dailyScoresArray[cellData.row.index]?.[columnIndex];

        if (scoreValue && scoreValue !== "N/A") {
          const numScore = parseFloat(scoreValue);
          const colors = getScoreColor(numScore);

          // Draw colored background
          doc.setFillColor(...colors.fillColor);
          doc.rect(
            cellData.cell.x,
            cellData.cell.y,
            cellData.cell.width,
            cellData.cell.height,
            "F",
          );

          // Draw text with appropriate color
          doc.setTextColor(...colors.textColor);
          doc.setFontSize(5.5);
          if (isAvgColumn) {
            doc.setFont("helvetica", "bold");
          }
          doc.text(
            scoreValue,
            cellData.cell.x + cellData.cell.width / 2,
            cellData.cell.y + cellData.cell.height / 2,
            { align: "center", baseline: "middle" },
          );
        }
      }
    },
    margin: { left: 14, right: 14 },
  });

  currentY = doc.lastAutoTable.finalY + 5;

  // ============ LEGEND ============
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Score Legend:", 14, currentY);
  currentY += 4;

  const legendItems = [
    { color: [187, 247, 208], text: "Excellent (9.0 - 10.0)" },
    { color: [254, 243, 199], text: "Good (7.0 - 8.9)" },
    { color: [254, 215, 170], text: "Average (5.0 - 6.9)" },
    { color: [254, 202, 202], text: "Poor (< 5.0)" },
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  legendItems.forEach((item) => {
    doc.setFillColor(...item.color);
    doc.rect(14, currentY - 2, 3, 3, "F");
    doc.setTextColor(51, 65, 85);
    doc.text(item.text, 18, currentY);
    currentY += 4;
  });

  // ============ PAGE FOOTER ============
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 8,
      { align: "center" },
    );
    doc.text(
      `Generated on ${new Date().toLocaleString("en-IN")}`,
      14,
      doc.internal.pageSize.height - 8,
    );
  }

  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
  console.log(
    `✅ Hygiene Trend PDF exported: ${fileName} with ${dateColumns.length} date columns`,
  );
};

const exportHygieneTrendToExcel = (data, metadata) => {
  const reportTitle =
    metadata?.dynamic_report_name ||
    metadata?.report_type ||
    "Hygiene Trend Report";
  const dateColumns = metadata?.date_columns || [];

  // Calculate statistics
  const totalWashrooms = metadata?.total_washrooms || 0;
  const totalDays = metadata?.total_days || 0;
  const overallAvgScore = metadata?.overall_avg_score || 0;

  let topPerformer = "N/A",
    topPerformerScore = 0;
  let lowPerformer = "N/A",
    lowPerformerScore = 10;

  if (data && data.length > 0) {
    const sorted = [...data].sort((a, b) => b.average_score - a.average_score);
    topPerformer = sorted[0]?.washroom_name || "N/A";
    topPerformerScore = sorted[0]?.average_score || 0;

    const sortedLow = [...data].sort(
      (a, b) => a.average_score - b.average_score,
    );
    lowPerformer = sortedLow[0]?.washroom_name || "N/A";
    lowPerformerScore = sortedLow[0]?.average_score || 10;
  }

  const excellentCount = data?.filter((w) => w.average_score >= 9).length || 0;
  const goodCount =
    data?.filter((w) => w.average_score >= 7 && w.average_score < 9).length ||
    0;
  const averageCount =
    data?.filter((w) => w.average_score >= 5 && w.average_score < 7).length ||
    0;
  const poorCount = data?.filter((w) => w.average_score < 5).length || 0;

  // ============ BUILD HEADER ROWS ============
  const headerRows = [
    [reportTitle],
    [],
    ["Organization", metadata?.organization || "N/A"],
    [
      "Date Range",
      `${metadata?.date_range?.start || "N/A"} to ${metadata?.date_range?.end || "N/A"}`,
    ],
    ["Total Washrooms", totalWashrooms],
    ["Total Days", totalDays],
    ["Generated On", new Date(metadata?.generated_on).toLocaleString("en-IN")],
    [],
    ["Summary Statistics"],
    ["Overall Average Score", formatScore(overallAvgScore)],
    ["Top Performer", `${topPerformer} (${formatScore(topPerformerScore)})`],
    ["Low Performer", `${lowPerformer} (${formatScore(lowPerformerScore)})`],
    ["Excellent Count (9+)", excellentCount],
    ["Good Count (7-9)", goodCount],
    ["Average Count (5-7)", averageCount],
    ["Poor Count (<5)", poorCount],
    [],
  ];

  // ============ BUILD TABLE HEADERS ============
  const tableHeaders = [
    "Sr No",
    "Washroom Name",
    "City",
    "Zone Type",
    "Assigned Cleaners",
    ...dateColumns,
    "Average Score",
  ];

  // ============ BUILD TABLE DATA ============
  const tableData =
    data?.map((washroom, index) => {
      const dailyScores =
        metadata?.date_columns?.map((_, idx) => {
          const dateKey = Object.keys(washroom.daily_scores || {})[idx];
          return formatScore(washroom.daily_scores?.[dateKey]);
        }) || [];

      return [
        index + 1,
        washroom.washroom_name,
        washroom.city || "N/A",
        washroom.zone_type || "N/A",
        washroom.assigned_cleaners?.join(", ") || "N/A",
        ...dailyScores,
        formatScore(washroom.average_score),
      ];
    }) || [];

  // ============ COMBINE DATA ============
  const worksheetData = [...headerRows, tableHeaders, ...tableData];

  // ============ CREATE WORKBOOK ============
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // ============ SET COLUMN WIDTHS ============
  const colWidths = [8, 22, 12, 12, 25, ...dateColumns.map(() => 14), 14];
  ws["!cols"] = colWidths.map((wch) => ({ wch }));

  // ============ FORMAT TITLE ============
  ws["A1"].s = {
    font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  // ============ MERGE TITLE ============
  ws["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: tableHeaders.length - 1 } },
  ];

  // ============ FORMAT HEADER ROW ============
  const headerRowIndex = headerRows.length;
  for (let col = 0; col < tableHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_col(col) + (headerRowIndex + 1);
    if (ws[cellRef]) {
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2563EB" } },
        alignment: { horizontal: "center", vertical: "center" },
      };
    }
  }

  // ============ COLOR CODE DATA ROWS ============
  const rgbToHex = (rgb) => {
    return (
      "FF" +
      rgb
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        })
        .join("")
        .toUpperCase()
    );
  };

  tableData.forEach((row, rowIdx) => {
    const excelRowIndex = headerRowIndex + 1 + rowIdx;

    for (let col = 5; col < tableHeaders.length; col++) {
      const cellRef = XLSX.utils.encode_col(col) + (excelRowIndex + 1);
      const scoreValue = row[col];
      if (scoreValue && scoreValue !== "N/A" && ws[cellRef]) {
        const numScore = parseFloat(scoreValue);
        const colors = getScoreColor(numScore);

        ws[cellRef].s = {
          fill: { fgColor: { rgb: rgbToHex(colors.fillColor) } },
          font: {
            color: { rgb: rgbToHex(colors.textColor) },
            bold: col === tableHeaders.length - 1,
          },
          alignment: { horizontal: "center" },
        };
      }
    }
  });

  // ============ CREATE SUMMARY SHEET ============
  const summaryData = [
    ["Hygiene Trend Report Summary"],
    [],
    ["Metric", "Value"],
    ["Organization", metadata?.organization || "N/A"],
    [
      "Report Period",
      `${metadata?.date_range?.start || "N/A"} to ${metadata?.date_range?.end || "N/A"}`,
    ],
    ["Total Washrooms", totalWashrooms],
    ["Total Days", totalDays],
    ["Overall Average Score", formatScore(overallAvgScore)],
    [],
    ["Performance Distribution"],
    ["Excellent (9+)", excellentCount],
    ["Good (7-9)", goodCount],
    ["Average (5-7)", averageCount],
    ["Poor (<5)", poorCount],
    [],
    ["Top & Low Performers"],
    ["Top Performer", `${topPerformer} (${formatScore(topPerformerScore)})`],
    ["Low Performer", `${lowPerformer} (${formatScore(lowPerformerScore)})`],
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary["!cols"] = [{ wch: 25 }, { wch: 40 }];

  wsSummary["A1"].s = {
    font: { bold: true, sz: 14, color: { rgb: "1E3A8A" } },
  };

  // ============ ADD SHEETS TO WORKBOOK ============
  XLSX.utils.book_append_sheet(wb, ws, "Hygiene Trend");
  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

  // ============ SAVE FILE ============
  const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  console.log(`✅ Hygiene Trend Excel exported: ${fileName}`);
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
  doc.save(fileName);
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
  doc.save(fileName);
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
  doc.save(fileName);
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
      if (!date) return "N/A";
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
      washroom.cleaner_name || "N/A",
      washroom.avg_rating ? washroom.avg_rating.toFixed(1) : "N/A",
      washroom.status ? washroom.status.toUpperCase() : "N/A",
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
  doc.save(fileName);
};

const exportWashroomReportToExcel = (data, metadata) => {
  const reportTitle =
    metadata.dynamic_report_name || metadata.report_type || "Washroom Report";
  const isSingleWashroom = metadata.is_single_washroom;

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
      return "Beginning to Now";
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

  // ✅ Color Scheme
  const colors = {
    title: "1E3A8A", // Dark Blue
    headerBg: "F1F5F9", // Light Gray
    headerText: "333333", // Dark Gray
    summaryBg: "10B981", // Green
    summaryText: "FFFFFF", // White
    tableBg: "2563EB", // Blue
    tableText: "FFFFFF", // White
    altRowBg: "F8FAFC", // Light Gray
    borderColor: "CBD5E1", // Gray
  };

  // ✅ Style Helper Function
  const createHeaderStyle = (bgColor, textColor = "FFFFFF", bold = true) => ({
    font: { bold, color: { rgb: textColor }, sz: 11 },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  });

  const createCellStyle = (
    bgColor = "FFFFFF",
    textColor = "000000",
    bold = false,
    align = "left",
  ) => ({
    font: { bold, color: { rgb: textColor }, sz: 10 },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  });

  // ✅ Build Header Section
  const worksheetData = [];
  let styleMap = {};

  // Title Row
  worksheetData.push([reportTitle]);
  styleMap["A1"] = {
    font: { bold: true, sz: 20, color: { rgb: colors.title } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  worksheetData.push([]); // Blank row

  // Metadata Section
  const metadataRows = [
    ["Organization", metadata.organization || "N/A"],
    ["Report Type", reportTitle],
    ["Date Range", getDateRangeDisplay()],
    [
      "Generated On",
      new Date(metadata.generated_on).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    ],
  ];

  const metadataStartRow = worksheetData.length + 1;
  metadataRows.forEach((row, idx) => {
    worksheetData.push(row);
    const rowNum = metadataStartRow + idx;
    styleMap[`A${rowNum}`] = createCellStyle(
      colors.headerBg,
      colors.headerText,
      true,
      "left",
    );
    styleMap[`B${rowNum}`] = createCellStyle("FFFFFF", "000000", false, "left");
  });

  worksheetData.push([]); // Blank row

  // ✅ SINGLE WASHROOM REPORT
  if (isSingleWashroom) {
    // Washroom Details Section
    worksheetData.push(["Washroom Details"]);
    const detailsHeaderRow = worksheetData.length;
    styleMap[`A${detailsHeaderRow}`] = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3B82F6" }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const detailsRows = [
      ["Washroom Name", metadata.washroom_name || "N/A"],
      ["Zone / Type", metadata.washroom_type || "N/A"],
      ["Address", metadata.washroom_address || "N/A"],
      [
        "City / State",
        [metadata.washroom_city, metadata.washroom_state]
          .filter(Boolean)
          .join(", ") || "N/A",
      ],
    ];

    const detailsStartRow = worksheetData.length + 1;
    detailsRows.forEach((row, idx) => {
      worksheetData.push(row);
      const rowNum = detailsStartRow + idx;
      styleMap[`A${rowNum}`] = createCellStyle(
        colors.headerBg,
        colors.headerText,
        true,
        "left",
      );
      styleMap[`B${rowNum}`] = createCellStyle(
        "FFFFFF",
        "000000",
        false,
        "left",
      );
    });

    worksheetData.push([]); // Blank row

    // Summary Stats Section
    worksheetData.push(["Performance Summary"]);
    const summaryHeaderRow = worksheetData.length;
    styleMap[`A${summaryHeaderRow}`] = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const summaryRows = [
      ["Total Cleanings", metadata.total_cleanings || 0],
      ["Completed", metadata.completed || 0],
      ["Ongoing", metadata.ongoing || 0],
      [
        "Avg Rating",
        metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
      ],
      ["Avg Duration (min)", metadata.avg_cleaning_duration || 0],
    ];

    const summaryStartRow = worksheetData.length + 1;
    summaryRows.forEach((row, idx) => {
      worksheetData.push(row);
      const rowNum = summaryStartRow + idx;
      styleMap[`A${rowNum}`] = createCellStyle(
        colors.summaryBg,
        colors.summaryText,
        true,
        "left",
      );
      styleMap[`B${rowNum}`] = createCellStyle(
        "ECF5E3",
        "000000",
        true,
        "center",
      );
    });

    worksheetData.push([]); // Blank row

    // Table Headers
    const tableHeaders = [
      "#",
      "Cleaner Name",
      "Phone",
      "Start Time",
      "End Time",
      "Duration (min)",
      "Rating",
      "Status",
      "Before Images",
      "After Images",
    ];

    const headerRow = worksheetData.length + 1;
    worksheetData.push(tableHeaders);
    tableHeaders.forEach((header, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(
        colors.tableBg,
        colors.tableText,
      );
    });

    // Data Rows
    const formatDateTime = (date) => {
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

    data.forEach((cleaning, idx) => {
      const dataRow = [
        idx + 1,
        cleaning.cleaner_name || "N/A",
        cleaning.cleaner_phone || "N/A",
        formatDateTime(cleaning.start_time),
        formatDateTime(cleaning.end_time),
        cleaning.duration_minutes || 0,
        cleaning.rating ? cleaning.rating.toFixed(1) : "N/A",
        cleaning.status ? cleaning.status.toUpperCase() : "N/A",
        cleaning.before_image_count || 0,
        cleaning.after_image_count || 0,
      ];
      const rowNum = worksheetData.length + 1;
      worksheetData.push(dataRow);

      // Alternate row colors
      const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
      dataRow.forEach((cell, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        const isBold = colIdx === 7; // Status column bold
        styleMap[`${colLetter}${rowNum}`] = createCellStyle(
          bgColor,
          "000000",
          isBold,
          colIdx === 0 || colIdx === 7 ? "center" : "left",
        );
      });
    });
  }
  // ✅ ALL WASHROOMS REPORT
  else {
    // Summary Stats Section
    worksheetData.push(["Summary Statistics"]);
    const summaryHeaderRow = worksheetData.length;
    styleMap[`A${summaryHeaderRow}`] = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const summaryRows = [
      ["Total Washrooms", metadata.total_washrooms || 0],
      ["Completed", metadata.completed || 0],
      ["Ongoing", metadata.ongoing || 0],
      [
        "Avg Rating",
        metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
      ],
      ["Avg Duration (min)", metadata.avg_cleaning_duration || 0],
    ];

    const summaryStartRow = worksheetData.length + 1;
    summaryRows.forEach((row, idx) => {
      worksheetData.push(row);
      const rowNum = summaryStartRow + idx;
      styleMap[`A${rowNum}`] = createCellStyle(
        colors.summaryBg,
        colors.summaryText,
        true,
        "left",
      );
      styleMap[`B${rowNum}`] = createCellStyle(
        "ECF5E3",
        "000000",
        true,
        "center",
      );
    });

    worksheetData.push([]); // Blank row

    // Table Headers
    const tableHeaders = [
      "#",
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

    const headerRow = worksheetData.length + 1;
    worksheetData.push(tableHeaders);
    tableHeaders.forEach((header, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(
        colors.tableBg,
        colors.tableText,
      );
    });

    // Data Rows
    const formatDateTime = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    data.forEach((washroom, idx) => {
      const dataRow = [
        idx + 1,
        washroom.name || "N/A",
        washroom.address || "N/A",
        washroom.city || "N/A",
        washroom.type || "N/A",
        washroom.cleaner_name || "N/A",
        washroom.avg_rating ? washroom.avg_rating.toFixed(1) : "N/A",
        washroom.status ? washroom.status.toUpperCase() : "N/A",
        washroom.image_count || 0,
        formatDateTime(washroom.last_cleaned_on),
      ];
      const rowNum = worksheetData.length + 1;
      worksheetData.push(dataRow);

      // Alternate row colors
      const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
      dataRow.forEach((cell, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        const isBold = colIdx === 7; // Status column bold
        styleMap[`${colLetter}${rowNum}`] = createCellStyle(
          bgColor,
          "000000",
          isBold,
          colIdx === 0 || colIdx === 7 ? "center" : "left",
        );
      });
    });
  }

  // ✅ Create Workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // ✅ Apply Styles
  Object.keys(styleMap).forEach((cellRef) => {
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = styleMap[cellRef];
  });

  // ✅ Set Column Widths
  ws["!cols"] = isSingleWashroom
    ? [
        { wch: 5 },
        { wch: 22 },
        { wch: 15 },
        { wch: 22 },
        { wch: 22 },
        { wch: 15 },
        { wch: 10 },
        { wch: 14 },
        { wch: 15 },
        { wch: 15 },
      ]
    : [
        { wch: 5 },
        { wch: 25 },
        { wch: 35 },
        { wch: 15 },
        { wch: 18 },
        { wch: 20 },
        { wch: 12 },
        { wch: 14 },
        { wch: 13 },
        { wch: 20 },
      ];

  // ✅ Set Row Heights
  ws["!rows"] = [
    { hpx: 28 }, // Title row
    { hpx: 5 }, // Blank row
  ];

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
//     doc.save(fileName);
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
      return "Beginning to Now";
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
      cleaner.cleaner_phone || "N/A",
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
          "Phone",
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
  doc.save(fileName);
};

// ✅ EXPORT CLEANER REPORT TO EXCEL - FIXED & BEAUTIFULLY STYLED
const exportCleanerReportToExcel = (data, metadata) => {
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
      return "Beginning to Now";
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

  //  Color Scheme
  const colors = {
    title: "1E3A8A",
    headerBg: "F1F5F9",
    headerText: "333333",
    summaryBg: "10B981",
    summaryText: "FFFFFF",
    tableBg: "2563EB",
    tableText: "FFFFFF",
    altRowBg: "F8FAFC",
    borderColor: "CBD5E1",
  };

  // ✅ Style Helper Functions
  const createHeaderStyle = (bgColor, textColor = "FFFFFF", bold = true) => ({
    font: { bold, color: { rgb: textColor }, sz: 11 },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  });

  const createCellStyle = (
    bgColor = "FFFFFF",
    textColor = "000000",
    bold = false,
    align = "left",
  ) => ({
    font: { bold, color: { rgb: textColor }, sz: 10 },
    fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
    alignment: { horizontal: align, vertical: "center", wrapText: true },
    border: {
      left: { style: "thin", color: { rgb: colors.borderColor } },
      right: { style: "thin", color: { rgb: colors.borderColor } },
      top: { style: "thin", color: { rgb: colors.borderColor } },
      bottom: { style: "thin", color: { rgb: colors.borderColor } },
    },
  });

  // ✅ Build Header Section
  const worksheetData = [];
  let styleMap = {};

  // Title Row
  worksheetData.push([reportTitle]);
  styleMap["A1"] = {
    font: { bold: true, sz: 20, color: { rgb: colors.title } },
    alignment: { horizontal: "left", vertical: "center" },
  };

  worksheetData.push([]); // Blank row

  // Metadata Section
  const metadataRows = [
    ["Organization", metadata.organization || "N/A"],
    ["Report Type", reportTitle],
    ["Date Range", getDateRangeDisplay()],
    [
      "Generated On",
      new Date(metadata.generated_on).toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    ],
  ];

  const metadataStartRow = worksheetData.length + 1;
  metadataRows.forEach((row, idx) => {
    worksheetData.push(row);
    const rowNum = metadataStartRow + idx;
    styleMap[`A${rowNum}`] = createCellStyle(
      colors.headerBg,
      colors.headerText,
      true,
      "left",
    );
    styleMap[`B${rowNum}`] = createCellStyle("FFFFFF", "000000", false, "left");
  });

  worksheetData.push([]); // Blank row

  // ✅ SINGLE CLEANER REPORT
  if (isSingleCleaner) {
    // Cleaner Details Section
    worksheetData.push(["Cleaner Details"]);
    const detailsHeaderRow = worksheetData.length;
    styleMap[`A${detailsHeaderRow}`] = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "3B82F6" }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const detailsRows = [
      ["Cleaner Name", metadata.cleaner_name || "N/A"],
      ["Phone", metadata.cleaner_phone || "N/A"],
    ];

    const detailsStartRow = worksheetData.length + 1;
    detailsRows.forEach((row, idx) => {
      worksheetData.push(row);
      const rowNum = detailsStartRow + idx;
      styleMap[`A${rowNum}`] = createCellStyle(
        colors.headerBg,
        colors.headerText,
        true,
        "left",
      );
      styleMap[`B${rowNum}`] = createCellStyle(
        "FFFFFF",
        "000000",
        false,
        "left",
      );
    });

    worksheetData.push([]); // Blank row

    // Summary Stats Section
    worksheetData.push(["Performance Summary"]);
    const summaryHeaderRow = worksheetData.length;
    styleMap[`A${summaryHeaderRow}`] = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const summaryRows = [
      ["Total Cleanings", metadata.total_cleanings || 0],
      ["Completed", metadata.completed || 0],
      ["Ongoing", metadata.ongoing || 0],
      [
        "Avg Score",
        typeof metadata.avg_ai_score === "number"
          ? metadata.avg_ai_score.toFixed(2)
          : metadata.avg_ai_score || "N/A",
      ],
      ["Avg Duration (min)", metadata.avg_duration || 0],
    ];

    const summaryStartRow = worksheetData.length + 1;
    summaryRows.forEach((row, idx) => {
      worksheetData.push(row);
      const rowNum = summaryStartRow + idx;
      styleMap[`A${rowNum}`] = createCellStyle(
        colors.summaryBg,
        colors.summaryText,
        true,
        "left",
      );
      styleMap[`B${rowNum}`] = createCellStyle(
        "ECF5E3",
        "000000",
        true,
        "center",
      );
    });

    worksheetData.push([]); // Blank row

    // Table Headers - FIXED
    const tableHeaders = [
      "#",
      "Date",
      "Washroom Name",
      "Zone Type",
      "Time",
      "Duration (min)",
      "Score",
      "Status",
    ];

    const headerRow = worksheetData.length + 1;
    worksheetData.push(tableHeaders);
    tableHeaders.forEach((header, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(
        colors.tableBg,
        colors.tableText,
      );
    });

    // Data Rows - FIXED to match actual data structure
    data.forEach((record, idx) => {
      const dataRow = [
        idx + 1,
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
      ];
      const rowNum = worksheetData.length + 1;
      worksheetData.push(dataRow);

      // Alternate row colors
      const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
      dataRow.forEach((cell, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        const isBold = colIdx === 7; // Status column bold
        styleMap[`${colLetter}${rowNum}`] = createCellStyle(
          bgColor,
          "000000",
          isBold,
          colIdx === 0 || colIdx === 7 ? "center" : "left",
        );
      });
    });
  }
  // ✅ ALL CLEANERS REPORT
  else {
    // Summary Stats Section
    worksheetData.push(["Summary Statistics"]);
    const summaryHeaderRow = worksheetData.length;
    styleMap[`A${summaryHeaderRow}`] = {
      font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
      alignment: { horizontal: "left", vertical: "center" },
    };

    const summaryRows = [
      ["Total Cleaners", metadata.total_cleaners || 0],
      ["Total Tasks", metadata.top_avg_score.length || 0],
      ["Completed", metadata.total_cleanings_completed || 0],
      ["Ongoing", totalOngoing || 0],
    ];

    const summaryStartRow = worksheetData.length + 1;
    summaryRows.forEach((row, idx) => {
      worksheetData.push(row);
      const rowNum = summaryStartRow + idx;
      styleMap[`A${rowNum}`] = createCellStyle(
        colors.summaryBg,
        colors.summaryText,
        true,
        "left",
      );
      styleMap[`B${rowNum}`] = createCellStyle(
        "ECF5E3",
        "000000",
        true,
        "center",
      );
    });

    worksheetData.push([]); // Blank row

    // Table Headers
    const tableHeaders = [
      "#",
      "Cleaner Name",
      "Phone",
      "Total Tasks",
      "Completed",
      "Ongoing",
      "Incomplete",
      "Avg Score",
      "Duration (min)",
      "Last Activity",
    ];

    const headerRow = worksheetData.length + 1;
    worksheetData.push(tableHeaders);
    tableHeaders.forEach((header, colIdx) => {
      const colLetter = String.fromCharCode(65 + colIdx);
      styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(
        colors.tableBg,
        colors.tableText,
      );
    });

    // Data Rows
    data.forEach((cleaner, idx) => {
      const dataRow = [
        idx + 1,
        cleaner.cleaner_name || "N/A",
        cleaner.cleaner_phone || "N/A",
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
      ];
      const rowNum = worksheetData.length + 1;
      worksheetData.push(dataRow);

      // Alternate row colors
      const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
      dataRow.forEach((cell, colIdx) => {
        const colLetter = String.fromCharCode(65 + colIdx);
        const isBold = colIdx === 6; // Status column bold
        styleMap[`${colLetter}${rowNum}`] = createCellStyle(
          bgColor,
          "000000",
          isBold,
          colIdx === 0 || colIdx === 6 ? "center" : "left",
        );
      });
    });
  }

  // ✅ Create Workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // ✅ Apply Styles
  Object.keys(styleMap).forEach((cellRef) => {
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = styleMap[cellRef];
  });

  // ✅ Set Column Widths
  ws["!cols"] = isSingleCleaner
    ? [
        { wch: 5 },
        { wch: 15 },
        { wch: 25 },
        { wch: 18 },
        { wch: 22 },
        { wch: 15 },
        { wch: 10 },
        { wch: 14 },
      ]
    : [
        { wch: 5 },
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
      ];

  // ✅ Set Row Heights
  ws["!rows"] = [
    { hpx: 28 }, // Title row
    { hpx: 5 }, // Blank row
  ];

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
    doc.save(`Single_Cleaner_Penalty_Report_${cleaner.cleaner_name?.replace(/\s+/g, "_") || "Cleaner"}_${Date.now()}.pdf`);
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
  doc.save(`Cleaner_Penalty_Summary_${Date.now()}.pdf`);
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
    doc.save(`Single_Washroom_Penalty_Report_${loc.location_name?.replace(/\s+/g, "_") || "Washroom"}_${Date.now()}.pdf`);
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
  doc.save(`Washroom_Penalty_Summary_${Date.now()}.pdf`);
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
// EXPORT ATTENDANCE REPORT TO PDF (Muster Roll Matrix View with P / A / WO)
// =========================================================================
const exportAttendanceReportToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");

  addLogosToHeader(doc);

  drawIndustrialHeaderTitle(
    doc,
    "CLEANER ATTENDANCE MUSTER ROLL REPORT",
    "Workforce Shift Attendance Matrix (P: Present, A: Absent, WO: Week Off)",
    "ATTENDANCE MUSTER ROLL"
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
        isSunday: curr.getUTCDay() === 0
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
            employee_name: r.cleaner_name || "Unknown",
            cleaner_phone: r.cleaner_phone || "-",
            client_range: metadata?.organization || "N/A",
            site_beat: (r.assigned_locations || []).join(", ") || "Unassigned",
            days_worked: 0,
            attendance_map: {}
          };
        }
        const isPresent = r.status?.toLowerCase() === "present" || r.code === "P";
        const isSunday = new Date(r.date).getUTCDay() === 0;
        let code = "A";
        if (isPresent) {
          code = "P";
          groups[cId].days_worked += 1;
        } else if (isSunday) {
          code = "WO";
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
  doc.text("TOTAL EMPLOYEES:", 18, 36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${metadata?.total_cleaners || matrixRows.length} Cleaners`, 52, 36);

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

  const totalShifts = metadata?.total_man_days ?? (matrixRows.length * dateColumns.length);
  const presentCount = metadata?.total_present ?? matrixRows.reduce((acc, r) => acc + (r.days_worked || 0), 0);
  const absentCount = metadata?.total_absent ?? matrixRows.reduce((acc, r) => acc + (dateColumns.length - (r.days_worked || 0)), 0);
  const rateStr = metadata?.overall_attendance_rate || (totalShifts > 0 ? `${((presentCount / totalShifts) * 100).toFixed(1)}%` : "0.0%");

  drawPdfKpiCard(doc, 14, cardY, cardW, cardH, "Employees", String(matrixRows.length), "Active in roster", [248, 250, 252], [226, 232, 240], [71, 85, 105], [15, 23, 42]);
  drawPdfKpiCard(doc, 14 + (cardW + gap), cardY, cardW, cardH, "Days Worked (P)", String(presentCount), "Total logged shifts", [236, 253, 245], [110, 231, 183], [4, 120, 87], [4, 120, 87]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 2, cardY, cardW, cardH, "Days Absent (A)", String(absentCount), "Missed shifts", [255, 241, 242], [254, 205, 211], [190, 18, 60], [190, 18, 60]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 3, cardY, cardW, cardH, "Total Days", String(dateColumns.length), "Calendar window", [239, 246, 255], [191, 219, 254], [29, 78, 216], [29, 78, 216]);
  drawPdfKpiCard(doc, 14 + (cardW + gap) * 4, cardY, cardW, cardH, "Compliance Rate", rateStr, "Present vs Total", [238, 242, 255], [199, 210, 254], [67, 56, 202], [67, 56, 202]);

  // Section Title
  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(`Workforce Attendance Muster Roll (${matrixRows.length} Employees, ${dateColumns.length} Days)`, 14, 60);

  // Table Headers
  const tableHeaders = [
    [
      "Sr No",
      "Employee Name",
      "Client/Range",
      "Site/Beat",
      "Days Worked",
      ...dateColumns.map((col) => col.label)
    ]
  ];

  // Table Body
  const tableBody = matrixRows.map((row, idx) => {
    const dayCells = dateColumns.map((col) => {
      const cellData = row.attendance_map?.[col.date];
      return cellData?.code || (col.isSunday ? "WO" : "A");
    });

    return [
      idx + 1,
      row.employee_name || "-",
      row.client_range || "-",
      row.site_beat || "Unassigned",
      row.days_worked || 0,
      ...dayCells
    ];
  });

  // Calculate dynamic day column width
  const fixedColsWidth = 10 + 38 + 28 + 48 + 14; // 138mm
  const remainingWidth = 269 - fixedColsWidth;
  const dayColWidth = Math.max(remainingWidth / Math.max(dateColumns.length, 1), 6);

  const columnStyles = {
    0: { cellWidth: 10, halign: "center" },
    1: { cellWidth: 38, fontStyle: "bold" },
    2: { cellWidth: 28 },
    3: { cellWidth: 48 },
    4: { cellWidth: 14, halign: "center", fontStyle: "bold" }
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
      fillColor: [223, 126, 119], // Terracotta/coral header matching user screenshot
      textColor: [15, 23, 42],     // Bold black text
      fontStyle: "bold",
      fontSize: 6.5,
      halign: "center",
      lineColor: [100, 116, 139],
      lineWidth: 0.2
    },
    bodyStyles: {
      fontSize: 6.5,
      cellPadding: 1.8,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
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
        } else if (val === "WO") {
          hookData.cell.styles.textColor = [100, 116, 139]; // slate-500
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
  doc.text("ATTENDANCE MUSTER ROLL RECONCILIATION & AUDIT SUMMARY", 18, y + 5);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Total Scheduled Man-Days: ${totalShifts}    |    Days Worked (P): ${presentCount}    |    Days Absent (A): ${absentCount}    |    Active Workforce: ${matrixRows.length}`,
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
  doc.save(`Attendance_Muster_Roll_${Date.now()}.pdf`);
};

// =========================================================================
// EXPORT ATTENDANCE REPORT TO EXCEL (Muster Roll Matrix Sheet)
// =========================================================================
const exportAttendanceReportToExcel = (data, metadata) => {
  const wb = XLSX.utils.book_new();

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
        isSunday: curr.getUTCDay() === 0
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
            employee_name: r.cleaner_name || "Unknown",
            cleaner_phone: r.cleaner_phone || "-",
            client_range: metadata?.organization || "N/A",
            site_beat: (r.assigned_locations || []).join(", ") || "Unassigned",
            days_worked: 0,
            attendance_map: {}
          };
        }
        const isPresent = r.status?.toLowerCase() === "present" || r.code === "P";
        const isSunday = new Date(r.date).getUTCDay() === 0;
        let code = "A";
        if (isPresent) {
          code = "P";
          groups[cId].days_worked += 1;
        } else if (isSunday) {
          code = "WO";
        }
        groups[cId].attendance_map[r.date] = { code };
      });
      matrixRows = Object.values(groups);
    }
  }

  // Sheet 1: Attendance Muster Roll Matrix
  const musterHeaders = [
    "Sr No",
    "Employee Name",
    "Client/Range",
    "Site/Beat",
    "Days Worked",
    ...dateColumns.map((col) => col.label)
  ];

  const musterRows = [
    ["CLEANER ATTENDANCE MUSTER ROLL REPORT"],
    [`Organization: ${metadata?.organization || "N/A"}`],
    [`Audit Period: ${metadata?.date_range?.start || "Beginning"} to ${metadata?.date_range?.end || "Now"}`],
    [`Overall Attendance Rate: ${metadata?.overall_attendance_rate || "N/A"}`],
    [`Generated: ${new Date().toLocaleString("en-IN")}`],
    [],
    musterHeaders
  ];

  matrixRows.forEach((row, idx) => {
    const dayCells = dateColumns.map((col) => {
      const cellData = row.attendance_map?.[col.date];
      return cellData?.code || (col.isSunday ? "WO" : "A");
    });

    musterRows.push([
      idx + 1,
      row.employee_name || "-",
      row.client_range || "-",
      row.site_beat || "Unassigned",
      row.days_worked || 0,
      ...dayCells
    ]);
  });

  const wsMuster = XLSX.utils.aoa_to_sheet(musterRows);
  XLSX.utils.book_append_sheet(wb, wsMuster, "Attendance Muster Roll");

  XLSX.writeFile(wb, `Attendance_Muster_Roll_${new Date().toISOString().split("T")[0]}.xlsx`);
};

export const exportToPDF = (
  data,
  metadata,
  reportType = "zone_wise",
  signatureData = null,
) => {
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
  } else {
    console.error("Unknown report type:", reportType);
  }
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
  } else {
    console.error("Unknown report type:", reportType);
  }
};
