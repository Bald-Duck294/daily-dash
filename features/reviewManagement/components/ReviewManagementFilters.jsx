"use client";

import React, { useState } from "react";
import {
  Calendar,
  Building2,
  Users,
  Filter,
  RotateCcw,
  Search,
} from "lucide-react";
import {
  useCompaniesDropdown,
  useCleanersDropdown,
} from "@/features/dropdownList/dropdownlist.query";

export default function ReviewManagementFilters({
  filters,
  onApplyFilters,
  onResetFilters,
  showCleanerFilter = false,
  isLoading = false,
}) {
  const { data: companies = [] } = useCompaniesDropdown();
  const [selectedCompany, setSelectedCompany] = useState(
    filters.company_id || "all"
  );
  const [selectedCleaner, setSelectedCleaner] = useState(
    filters.cleaner_id || "all"
  );
  const [startDate, setStartDate] = useState(filters.start_date || "");
  const [endDate, setEndDate] = useState(filters.end_date || "");
  const [search, setSearch] = useState(filters.search || "");

  const { data: cleaners = [], isLoading: loadingCleaners } =
    useCleanersDropdown(
      selectedCompany !== "all" ? selectedCompany : undefined
    );

  const handleCompanyChange = (e) => {
    const newCompany = e.target.value;
    setSelectedCompany(newCompany);
    setSelectedCleaner("all");
  };

  const handleApply = (e) => {
    e?.preventDefault();
    onApplyFilters({
      company_id: selectedCompany,
      cleaner_id: showCleanerFilter ? selectedCleaner : undefined,
      start_date: startDate,
      end_date: endDate,
      search: search.trim(),
    });
  };

  const handleReset = () => {
    setSelectedCompany("all");
    setSelectedCleaner("all");
    setStartDate("");
    setEndDate("");
    setSearch("");
    onResetFilters();
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-sm">
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Filter Records</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Filters
        </button>
      </div>

      <form onSubmit={handleApply}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Company Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              Organization / Company
            </label>
            <select
              value={selectedCompany}
              onChange={handleCompanyChange}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            >
              <option value="all">All Organizations</option>
              {(companies || []).map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cleaner Selector (Optional) */}
          {showCleanerFilter && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                Cleaner
              </label>
              <select
                value={selectedCleaner}
                onChange={(e) => setSelectedCleaner(e.target.value)}
                disabled={selectedCompany === "all" || loadingCleaners}
                className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50 cursor-pointer"
              >
                <option value="all">
                  {selectedCompany === "all"
                    ? "Select Organization first"
                    : loadingCleaners
                    ? "Loading cleaners..."
                    : "All Cleaners"}
                </option>
                {(cleaners || []).map((cln) => (
                  <option key={cln.id} value={cln.id}>
                    {cln.name || cln.cleaner_name || `Cleaner #${cln.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* From Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            />
          </div>

          {/* To Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            />
          </div>
        </div>

        {/* Search & Apply Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 mt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keywords, location name, comments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}
