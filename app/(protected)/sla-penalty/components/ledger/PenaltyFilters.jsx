"use client";

import React from "react";
import { Filter, Search, RotateCcw, User, X } from "lucide-react";

export default function PenaltyFilters({
  filters,
  onFilterChange,
  onReset,
  cleanerFilterCount = null
}) {
  const statuses = [
    { value: "", label: "All Statuses" },
    { value: "PENDING_APPROVAL", label: "Pending Approval" },
    { value: "APPROVED", label: "Approved" },
    { value: "DISPUTED", label: "Disputed" },
    { value: "REJECTED", label: "Rejected / Waived" },
    { value: "REVERSED", label: "Reversed" }
  ];

  const scopes = [
    { value: "", label: "All Scopes" },
    { value: "TASK_WISE", label: "Per Inspection (Task)" },
    { value: "DAY_WISE", label: "Daily Aggregate" }
  ];

  const hasActiveFilters = Boolean(
    filters.status || filters.scope || filters.search || filters.cleaner_id
  );

  return (
    <div className="p-4 mb-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
      {/* Active Cleaner Filter Highlight Banner */}
      {filters.cleaner_id && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs">
          <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span>
                Filtered by Cleaner: <strong className="font-semibold">{filters.cleaner_name || `ID #${filters.cleaner_id}`}</strong>
              </span>
              {cleanerFilterCount !== null && (
                <span className="ml-2 font-mono font-bold px-2 py-0.5 rounded-full bg-blue-200 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-[11px]">
                  {cleanerFilterCount} {cleanerFilterCount === 1 ? "Penalty" : "Penalties"}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onFilterChange("cleaner_id", "")}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            Clear Filter
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by penalty #, cleaner, or rule..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status select */}
          <div className="flex items-center gap-2">
            <select
              value={filters.status || ""}
              onChange={(e) => onFilterChange("status", e.target.value)}
              className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Scope select */}
          <div className="flex items-center gap-2">
            <select
              value={filters.scope || ""}
              onChange={(e) => onFilterChange("scope", e.target.value)}
              className="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer"
            >
              {scopes.map((sc) => (
                <option key={sc.value} value={sc.value}>
                  {sc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

