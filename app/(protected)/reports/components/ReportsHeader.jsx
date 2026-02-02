"use client";
import React from "react";
import { FileText, Download, TrendingUp } from "lucide-react";

export default function ReportHeader({
  selectedReport,
  description,
  onExport,
  isExporting,
}) {
  return (
    <div className="page-header border-l-4 border-l-blue-600 bg-white dark:bg-card shadow-sm">
      <div className="page-header-content">
        <div className="page-header-title-section">
          <div className="page-header-icon bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30">
            <FileText
              size={24}
              className="text-blue-600 dark:text-blue-400"
              strokeWidth={2.5}
            />
          </div>

          <div>
            <h1 className="page-header-title text-slate-800 dark:text-white">
              Analytics Reports
            </h1>
            <p className="page-header-subtitle mt-1.5 flex items-center gap-2">
              <TrendingUp
                size={12}
                className="text-blue-600 dark:text-blue-400"
              />
              <span className="text-slate-500 dark:text-slate-400 italic font-medium">
                {description}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <button
            onClick={onExport}
            disabled={isExporting}
            className="btn btn-secondary bg-indigo-50/50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100/50 px-6 py-3 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 min-w-[160px]"
          >
            <Download
              size={14}
              strokeWidth={3}
              className={isExporting ? "animate-spin" : ""}
            />
            <span className="uppercase tracking-widest text-[11px] font-black">
              {isExporting ? "Exporting..." : "Export Reports"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
