"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Building2,
  Phone,
  Activity,
  Layers,
  Sparkles,
  ArrowUpDown,
  Filter
} from "lucide-react";

export default function AttendanceReportTable({ data = [], metadata = {} }) {
  const [activeTab, setActiveTab] = useState("ledger"); // "ledger" | "summaries"
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "present" | "absent"
  const [sortField, setSortField] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Extract cleaner summaries from data or calculate
  const cleanerSummaries = useMemo(() => {
    // Group records by cleaner
    const groups = {};
    (data || []).forEach((r) => {
      const cId = r.cleaner_id || r.cleaner_name;
      if (!groups[cId]) {
        groups[cId] = {
          cleaner_id: cId,
          cleaner_name: r.cleaner_name,
          cleaner_phone: r.cleaner_phone,
          assigned_locations: r.assigned_locations || [],
          days_present: 0,
          days_absent: 0,
          total_days: 0,
          total_cleaning_logs: 0
        };
      }
      groups[cId].total_days += 1;
      if (r.status?.toLowerCase() === "present") {
        groups[cId].days_present += 1;
        groups[cId].total_cleaning_logs += Number(r.cleaning_logs || 0);
      } else {
        groups[cId].days_absent += 1;
      }
    });

    return Object.values(groups).map((c) => {
      const rate =
        c.total_days > 0
          ? ((c.days_present / c.total_days) * 100).toFixed(1)
          : "0.0";
      return {
        ...c,
        attendance_rate: `${rate}%`,
        rateNumber: parseFloat(rate),
        avg_daily_cleanings:
          c.days_present > 0
            ? (c.total_cleaning_logs / c.days_present).toFixed(1)
            : "0.0"
      };
    });
  }, [data]);

  // Filtered daily ledger records
  const filteredLedger = useMemo(() => {
    return (data || []).filter((item) => {
      // Status filter
      if (statusFilter !== "all") {
        if (item.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (item.cleaner_name || "").toLowerCase().includes(q);
        const phoneMatch = (item.cleaner_phone || "").toLowerCase().includes(q);
        const dateMatch = (item.date || "").toLowerCase().includes(q);
        const locMatch = (item.assigned_locations || []).some((loc) =>
          loc.toLowerCase().includes(q)
        );
        if (!nameMatch && !phoneMatch && !dateMatch && !locMatch) return false;
      }

      return true;
    });
  }, [data, searchQuery, statusFilter]);

  // Sorted ledger records
  const sortedLedger = useMemo(() => {
    return [...filteredLedger].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (sortField === "cleaning_logs") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredLedger, sortField, sortDirection]);

  // Paginated ledger
  const paginatedLedger = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedLedger.slice(start, start + pageSize);
  }, [sortedLedger, currentPage]);

  const totalPages = Math.ceil(sortedLedger.length / pageSize) || 1;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const formatTime = (timeVal) => {
    if (!timeVal) return "-";
    try {
      const d = new Date(timeVal);
      if (isNaN(d.getTime())) return String(timeVal);
      return d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    } catch {
      return String(timeVal);
    }
  };

  const formatDate = (dateVal) => {
    if (!dateVal) return "-";
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return String(dateVal);
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP INDUSTRIAL KPI SUMMARY CARDS
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Card 1: Total Cleaners */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Cleaners</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metadata?.total_cleaners ?? cleanerSummaries.length}
          </div>
          <span className="text-[10px] text-slate-500">Active roster</span>
        </div>

        {/* Card 2: Total Working Days */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Audit Period</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metadata?.total_days || 1} <span className="text-xs font-medium text-slate-500">Days</span>
          </div>
          <span className="text-[10px] text-slate-500">Date window</span>
        </div>

        {/* Card 3: Total Man-Days */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Shifts</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {metadata?.total_man_days ?? data.length}
          </div>
          <span className="text-[10px] text-slate-500">Scheduled days</span>
        </div>

        {/* Card 4: Present Days */}
        <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Present</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-800">
            {metadata?.total_present ?? cleanerSummaries.reduce((acc, c) => acc + c.days_present, 0)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Logged on duty</span>
        </div>

        {/* Card 5: Absent Days */}
        <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Absent</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-800">
            {metadata?.total_absent ?? cleanerSummaries.reduce((acc, c) => acc + c.days_absent, 0)}
          </div>
          <span className="text-[10px] text-rose-600 font-medium">Zero activity</span>
        </div>

        {/* Card 6: Overall Attendance Rate */}
        <div className="bg-indigo-50 border border-indigo-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Attendance %</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-bold text-indigo-800">
            {metadata?.overall_attendance_rate || "0.0%"}
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">Compliance rate</span>
        </div>
      </div>

      {/* =========================================================================
          VIEW SWITCHER & CONTROLS
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        {/* Left: Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("ledger")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "ledger"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Daily Attendance Ledger ({sortedLedger.length})
          </button>
          <button
            onClick={() => setActiveTab("summaries")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "summaries"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Cleaner Compliance Summaries ({cleanerSummaries.length})
          </button>
        </div>

        {/* Right: Search & Status Filter */}
        <div className="flex items-center gap-2">
          {/* Status Filter Pill */}
          {activeTab === "ledger" && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => { setStatusFilter("all"); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => { setStatusFilter("present"); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === "present" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-emerald-700"
                }`}
              >
                Present
              </button>
              <button
                onClick={() => { setStatusFilter("absent"); setCurrentPage(1); }}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === "absent" ? "bg-rose-600 text-white shadow-sm" : "text-slate-500 hover:text-rose-700"
                }`}
              >
                Absent
              </button>
            </div>
          )}

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search cleaner or date..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DAILY ATTENDANCE LEDGER
      ========================================================================= */}
      {activeTab === "ledger" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 w-12 text-center">Sr</th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSort("date")}
                  >
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSort("cleaner_name")}
                  >
                    <div className="flex items-center gap-1">
                      Cleaner Name
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5">Assigned Facilities</th>
                  <th className="py-3 px-3.5">Check-In</th>
                  <th className="py-3 px-3.5">Last Active</th>
                  <th
                    className="py-3 px-3.5 text-center cursor-pointer hover:text-slate-900 transition-colors"
                    onClick={() => handleSort("cleaning_logs")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      Logs
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLedger.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No attendance records match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedLedger.map((row, idx) => {
                    const isPresent = row.status?.toLowerCase() === "present";
                    const locs = row.assigned_locations || [];

                    return (
                      <tr key={row.record_id || idx} className="hover:bg-slate-50/70 transition-colors">
                        {/* Sr */}
                        <td className="py-3 px-3.5 text-center font-mono text-slate-400">
                          {(currentPage - 1) * pageSize + idx + 1}
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-800">{formatDate(row.date)}</div>
                          <span className="text-[10px] text-slate-400 font-mono">{row.date}</span>
                        </td>

                        {/* Cleaner */}
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900">{row.cleaner_name}</div>
                          {row.cleaner_phone && row.cleaner_phone !== "-" && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-slate-400" />
                              {row.cleaner_phone}
                            </span>
                          )}
                        </td>

                        {/* Facilities */}
                        <td className="py-3 px-3.5 max-w-xs">
                          {locs.length <= 1 ? (
                            <span className="text-slate-700 truncate block text-[11px]" title={locs[0]}>
                              {locs[0] || "Unassigned"}
                            </span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-700 truncate text-[11px]" title={locs.join(", ")}>
                                {locs[0]}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                +{locs.length - 1}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Check-In */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-700">
                          {isPresent && row.check_in_time ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>{formatTime(row.check_in_time)}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Last Active */}
                        <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-700">
                          {isPresent && row.last_active_time ? (
                            <span>{formatTime(row.last_active_time)}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>

                        {/* Logs Count */}
                        <td className="py-3 px-3.5 text-center">
                          {isPresent ? (
                            <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {row.cleaning_logs} logs
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono text-[11px]">0</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3 px-3.5 text-center">
                          {isPresent ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              PRESENT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              ABSENT
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <div>
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, sortedLedger.length)} of {sortedLedger.length} records
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Previous
                </button>
                <span className="px-2 font-semibold text-slate-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CLEANER COMPLIANCE SUMMARIES
      ========================================================================= */}
      {activeTab === "summaries" && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-3.5 w-12 text-center">Sr</th>
                  <th className="py-3 px-3.5">Cleaner Name</th>
                  <th className="py-3 px-3.5">Assigned Facilities</th>
                  <th className="py-3 px-3.5 text-center">Days Present</th>
                  <th className="py-3 px-3.5 text-center">Days Absent</th>
                  <th className="py-3 px-3.5 text-center">Total Working Days</th>
                  <th className="py-3 px-3.5 text-center">Attendance %</th>
                  <th className="py-3 px-3.5 text-center">Total Cleanings</th>
                  <th className="py-3 px-3.5 text-center">Avg Cleanings / Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cleanerSummaries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs font-medium">
                      No cleaner summaries available.
                    </td>
                  </tr>
                ) : (
                  cleanerSummaries.map((c, idx) => {
                    const rate = c.rateNumber || 0;
                    const locs = c.assigned_locations || [];

                    return (
                      <tr key={c.cleaner_id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-3.5 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="py-3.5 px-3.5">
                          <div className="font-semibold text-slate-900">{c.cleaner_name}</div>
                          {c.cleaner_phone && c.cleaner_phone !== "-" && (
                            <span className="text-[10px] text-slate-500 font-mono">{c.cleaner_phone}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3.5 max-w-xs text-[11px] text-slate-700">
                          {locs.join(", ") || "Unassigned"}
                        </td>
                        <td className="py-3.5 px-3.5 text-center font-bold text-emerald-700">
                          {c.days_present}
                        </td>
                        <td className="py-3.5 px-3.5 text-center font-bold text-rose-700">
                          {c.days_absent}
                        </td>
                        <td className="py-3.5 px-3.5 text-center font-semibold text-slate-800">
                          {c.total_days}
                        </td>
                        <td className="py-3.5 px-3.5 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`text-xs font-bold ${
                                rate >= 80
                                  ? "text-emerald-700"
                                  : rate >= 50
                                  ? "text-amber-700"
                                  : "text-rose-700"
                              }`}
                            >
                              {c.attendance_rate}
                            </span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full ${
                                  rate >= 80
                                    ? "bg-emerald-500"
                                    : rate >= 50
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                                }`}
                                style={{ width: `${Math.min(rate, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3.5 text-center font-bold text-indigo-700">
                          {c.total_cleaning_logs}
                        </td>
                        <td className="py-3.5 px-3.5 text-center text-slate-700 font-medium">
                          {c.avg_daily_cleanings}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
