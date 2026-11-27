"use client";

import React, { useEffect } from "react";
import { X, Download, Printer, Calendar } from "lucide-react";
import DailyTaskReportTable from "./tables/DailyTaskReportTable";
import ZoneWiseReportTable from "./tables/ZoneWiseReportTable";
import AiScoringReportTable from "./tables/AiScoringReportTable";
import CleanerPerformanceSummaryTable from "./tables/CleanerPerformanceSummaryTable";
import DetailedCleaningReportTable from "./tables/DetailedCleaningReportTable";
import WashroomReportTable from "./tables/WashroomReportTable";
import WashroomHygieneTrendTable from "./tables/WashroomHygieneTrendTable";
import CleanerReportTable from "./tables/CleanerReportTable";
import CleanerPenaltySummaryTable from "./tables/CleanerPenaltySummaryTable";
import WashroomPenaltySummaryTable from "./tables/WashroomPenaltySummaryTable";
import AttendanceReportTable from "./tables/AttendanceReportTable";
import NotCleanedWashroomsTable from "./tables/NotCleanedWashroomsTable";
import SlaThresholdBreachTable from "./tables/SlaThresholdBreachTable";
import { exportToPDF, exportToExcel, printReportPDF } from "./ExportUtils";
import DetailedCleaningReportTableVirtualized from "./tables/DetailedCleaningReportTableVirtualized";

export default function ReportModal({ reportType, data, metadata, onClose }) {
  const handleExportPDF = () => {
    exportToPDF(data, metadata, reportType);
  };

  const handleExportExcel = () => {
    exportToExcel(data, metadata, reportType);
  };
  console.log(reportType, "report type in modal");

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);


  const handlePrint = () => printReportPDF(data, metadata, reportType);

  // ✅ Format date range display
  const getDateRangeDisplay = () => {
    let startDate = metadata?.date_range?.start;
    let endDate = metadata?.date_range?.end;

    // Helper to check if date string is invalid or placeholder
    const isInvalid = (val) => !val || val === "Beginning" || val === "Now" || val === "N/A";

    // If dates are missing or placeholders, fallback to timestamps in data
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

    // Format helper
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now" || dateStr === "N/A") return null;
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    const formattedStart = formatDate(startDate);
    const formattedEnd = formatDate(endDate);
    const todayFormatted = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
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

  // Render appropriate table based on report type
  const renderTable = () => {
    switch (reportType) {
      case "daily_task":
        return <DailyTaskReportTable data={data} metadata={metadata} />;
      case "zone_wise":
        return <ZoneWiseReportTable data={data} metadata={metadata} />;
      case "ai_scoring":
        return <AiScoringReportTable data={data} metadata={metadata} />;
      case "cleaner_performance_summary":
        return <CleanerPerformanceSummaryTable data={data} metadata={metadata} />;
      case "detailed_cleaning":
        return <DetailedCleaningReportTableVirtualized data={data} metadata={metadata} />;
      case "washroom_report":
        return <WashroomReportTable data={data} metadata={metadata} />;
      case "cleaner_report":
        return <CleanerReportTable data={data} metadata={metadata} />;
      case "washroom_hygiene_trend":
        return <WashroomHygieneTrendTable data={data} metadata={metadata} />;
      case "cleaner_penalty_summary":
        return <CleanerPenaltySummaryTable data={data} metadata={metadata} />;
      case "washroom_penalty_summary":
        return <WashroomPenaltySummaryTable data={data} metadata={metadata} />;
      case "attendance_report":
        return <AttendanceReportTable data={data} metadata={metadata} />;
      case "not_cleaned_washrooms":
        return <NotCleanedWashroomsTable data={data} metadata={metadata} />;
      case "sla_threshold_breach":
        return <SlaThresholdBreachTable data={data} metadata={metadata} />;
      default:
        return <div className="text-center py-8 text-slate-500">Unknown report type</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm">
      <div
        className={`w-full ${
          [
            "washroom_hygiene_trend",
            "attendance_report",
            "detailed_cleaning",
          ].includes(reportType)
            ? "max-w-[96vw] 2xl:max-w-[94vw]"
            : "max-w-7xl"
        } h-screen overflow-y-auto py-6 px-3 sm:px-4`}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl">
          {/* ✅ Enhanced Sticky Header */}
          <div className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 px-6 py-4 rounded-t-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {metadata?.report_type || "Report"}
                </h2>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                  {/* Organization */}
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {metadata?.organization || "N/A"}
                  </span>

                  {/* Date Range */}
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{getDateRangeDisplay()}</span>
                  </span>

                  {/* Generated On */}
                  <span className="text-slate-500">
                    Generated: {new Date(metadata?.generated_on).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* PDF Export */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all text-sm font-medium shadow-sm"
                  title="Export as PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>

                {/* Excel Export */}
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all text-sm font-medium shadow-sm"
                  title="Export as Excel"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Excel</span>
                </button>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm font-medium shadow-sm"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors ml-2"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">
            
            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  );
}
