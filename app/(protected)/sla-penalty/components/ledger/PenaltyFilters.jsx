"use client";

import React from "react";
import { Filter, Search, RotateCcw, User, X } from "lucide-react";

export default function PenaltyFilters({
  filters,
  onFilterChange,
  onReset,
  cleaners = [],
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
    <div className="rounded-xl p-2 mb-3 flex flex-col md:flex-row items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 w-full md:w-auto min-w-[240px]">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by penalty #, cleaner, or rule..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange("search", e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs outline-none bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Active Cleaner Chip (Inline) */}
      {filters.cleaner_id && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 shrink-0">
          <User className="w-3.5 h-3.5" />
          <span>
            {filters.cleaner_name || `ID #${filters.cleaner_id}`}
            {cleanerFilterCount !== null && (
              <span className="ml-1 opacity-75 font-mono">({cleanerFilterCount})</span>
            )}
          </span>
          <button
            onClick={() => onFilterChange("cleaner_id", "")}
            className="ml-1 text-blue-500 hover:text-blue-800 dark:hover:text-blue-100 cursor-pointer"
            title="Remove cleaner filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filters Group */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        {/* Cleaner select */}
        <select
          value={filters.cleaner_id || ""}
          onChange={(e) => {
            const val = e.target.value;
            const found = cleaners.find((c) => String(c.id) === String(val));
            onFilterChange("cleaner_id", val);
            onFilterChange("cleaner_name", found ? found.name : "");
          }}
          className="px-2.5 py-1.5 border border-slate-200/90 dark:border-slate-700/80 rounded-lg text-xs font-medium bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 outline-none cursor-pointer max-w-[180px] truncate"
          title="Filter by Cleaner"
        >
          <option value="">All Cleaners</option>
          {cleaners.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Status select */}
        <select
          value={filters.status || ""}
          onChange={(e) => onFilterChange("status", e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200/90 dark:border-slate-700/80 rounded-lg text-xs font-medium bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* Scope select */}
        <select
          value={filters.scope || ""}
          onChange={(e) => onFilterChange("scope", e.target.value)}
          className="px-2.5 py-1.5 border border-slate-200/90 dark:border-slate-700/80 rounded-lg text-xs font-medium bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
        >
          {scopes.map((sc) => (
            <option key={sc.value} value={sc.value}>
              {sc.label}
            </option>
          ))}
        </select>

        {/* Reset button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

