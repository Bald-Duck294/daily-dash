"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  Activity,
  ArrowUpDown,
  Filter,
  Sparkles,
} from "lucide-react";

export default function AttendanceReportTable({ data = [], metadata = {} }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "sr_no", direction: "asc" });

  // Date columns from metadata or fallback
  const dateColumns = useMemo(() => {
    if (metadata?.date_columns && metadata.date_columns.length > 0) {
      return metadata.date_columns;
    }

    // Fallback: construct from first row's attendance_map or metadata date range
    if (data && data.length > 0 && data[0].attendance_map) {
      return Object.keys(data[0].attendance_map).map((dStr) => {
        const d = new Date(dStr);
        const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = String(d.getDate()).padStart(2, "0");
        return {
          date: dStr,
          label: `${dayName}-${dayNum}`,
          dayName,
          dayNum,
        };
      });
    }

    // Fallback from date range
    const start = metadata?.date_range?.start;
    const end = metadata?.date_range?.end;
    if (start && end) {
      const dates = [];
      let curr = new Date(start);
      const endD = new Date(end);
      while (curr <= endD) {
        const dStr = curr.toISOString().split("T")[0];
        const dayName = curr.toLocaleDateString("en-US", { weekday: "short" });
        const dayNum = String(curr.getDate()).padStart(2, "0");
        dates.push({
          date: dStr,
          label: `${dayName}-${dayNum}`,
          dayName,
          dayNum,
        });
        curr.setDate(curr.getDate() + 1);
      }
      return dates;
    }

    return [];
  }, [metadata, data]);

  // Matrix rows (each row = 1 cleaner with left details + attendance map)
  // NOTE: Cleaners do not have week-offs. Every shift is either Present (P) or Absent (A).
  const matrixRows = useMemo(() => {
    if (data && data.length > 0 && data[0].attendance_map) {
      return data;
    }

    // Fallback if flat records were passed
    const groups = {};
    (data || []).forEach((r) => {
      const cId = r.cleaner_id || r.cleaner_name;
      if (!groups[cId]) {
        groups[cId] = {
          sr_no: Object.keys(groups).length + 1,
          cleaner_id: cId,
          cleaner_name: r.cleaner_name || r.employee_name || "Unknown",
          cleaner_phone: r.cleaner_phone || "-",
          company_name: metadata?.organization || "N/A",
          assigned_locations: (r.assigned_locations || []).join(", ") || r.site_beat || "Unassigned",
          days_present: 0,
          days_absent: 0,
          attendance_map: {},
        };
      }

      const isPresent = r.status?.toLowerCase() === "present" || r.code === "P";
      const code = isPresent ? "P" : "A";
      if (isPresent) {
        groups[cId].days_present += 1;
      } else {
        groups[cId].days_absent += 1;
      }

      groups[cId].attendance_map[r.date] = {
        code,
        status: isPresent ? "Present" : "Absent",
        logs_count: r.cleaning_logs || 0,
      };
    });

    return Object.values(groups);
  }, [data, metadata]);

  // Filter matrix rows by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return matrixRows;
    const q = searchQuery.toLowerCase();
    return matrixRows.filter((row) => {
      const name = (row.cleaner_name || row.employee_name || "").toLowerCase();
      const loc = (row.assigned_locations || row.site_beat || "").toLowerCase();
      const phone = (row.cleaner_phone || "").toLowerCase();
      return name.includes(q) || loc.includes(q) || phone.includes(q);
    });
  }, [matrixRows, searchQuery]);

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (
        sortConfig.key === "days_present" ||
        sortConfig.key === "days_worked" ||
        sortConfig.key === "sr_no"
      ) {
        valA = Number(a.days_present ?? a.days_worked ?? 0);
        valB = Number(b.days_present ?? b.days_worked ?? 0);
      } else if (sortConfig.key === "cleaner_name" || sortConfig.key === "employee_name") {
        valA = (a.cleaner_name || a.employee_name || "").toLowerCase();
        valB = (b.cleaner_name || b.employee_name || "").toLowerCase();
      }
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const totalAuditDays = dateColumns.length;
  const totalEmployees = metadata?.total_cleaners ?? matrixRows.length;
  const totalPresent =
    metadata?.total_present ??
    matrixRows.reduce((acc, r) => acc + (r.days_present ?? r.days_worked ?? 0), 0);
  const totalShifts = totalEmployees * (totalAuditDays || 1);
  const totalAbsent =
    metadata?.total_absent ?? Math.max(0, totalShifts - totalPresent);
  const overallRate =
    totalShifts > 0 ? ((totalPresent / totalShifts) * 100).toFixed(1) + "%" : "0.0%";

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP EXECUTIVE KPI CARDS
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Total Cleaners */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Cleaners
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalEmployees}
          </div>
          <span className="text-[11px] text-slate-400">Active roster</span>
        </div>

        {/* Audit Days */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Audit Window
            </span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {totalAuditDays}{" "}
            <span className="text-xs font-semibold text-slate-500">Days</span>
          </div>
          <span className="text-[11px] text-slate-400">Selected period</span>
        </div>

        {/* Total Present (P) */}
        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Present Shifts (P)
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">
            {totalPresent}
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Verified active duty</span>
        </div>

        {/* Total Absent (A) */}
        <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
              Absent Shifts (A)
            </span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-800 mt-1">
            {totalAbsent}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Zero logged activity</span>
        </div>

        {/* Attendance Rate */}
        <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Attendance Rate
            </span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-800 mt-1">
            {overallRate}
          </div>
          <span className="text-[11px] text-indigo-600 font-medium">Period compliance</span>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS, SEARCH & STATUS LEGEND
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            Workforce Attendance Matrix
          </span>
          <span className="text-xs text-slate-500 font-medium">
            ({sortedRows.length} Cleaners, {dateColumns.length} Days)
          </span>
        </div>

        {/* Legend & Search */}
        <div className="flex items-center gap-3">
          {/* Legend: Strictly P (Present) and A (Absent) */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              P = Present
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              A = Absent
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cleaner or washroom..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ATTENDANCE MATRIX TABLE (MODERN SAAFAI DESIGN SYSTEM)
      ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto max-h-[600px] relative">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header: Polished slate header with sticky columns */}
            <thead className="sticky top-0 z-20 bg-slate-900 text-slate-100 shadow-sm">
              <tr className="border-b border-slate-800 font-semibold text-[11px]">
                {/* 1. Sr No - Sticky Left */}
                <th
                  onClick={() => handleSort("sr_no")}
                  className="py-3 px-2 text-center w-12 sticky left-0 z-30 bg-slate-900 border-r border-slate-800 cursor-pointer select-none whitespace-nowrap"
                >
                  Sr.
                </th>

                {/* 2. Cleaner Name - Sticky Left */}
                <th
                  onClick={() => handleSort("cleaner_name")}
                  className="py-3 px-3 min-w-[170px] max-w-[200px] sticky left-12 z-30 bg-slate-900 border-r border-slate-800 cursor-pointer select-none whitespace-nowrap shadow-[2px_0_5px_rgba(0,0,0,0.15)]"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Cleaner Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 3. Assigned Washrooms */}
                <th className="py-3 px-3 min-w-[180px] max-w-[240px] border-r border-slate-800 whitespace-nowrap">
                  Assigned Washrooms
                </th>

                {/* 4. Days Present */}
                <th
                  onClick={() => handleSort("days_present")}
                  className="py-3 px-2 text-center w-24 border-r border-slate-800 cursor-pointer select-none whitespace-nowrap"
                  title="Total Days Present"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Days Present</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>

                {/* 5. Attendance Rate */}
                <th className="py-3 px-2 text-center w-20 border-r border-slate-800 whitespace-nowrap">
                  Att. Rate
                </th>

                {/* 6. Day Columns (01, 02, 03... with day abbreviation) */}
                {dateColumns.map((col) => (
                  <th
                    key={col.date}
                    className="py-2 px-1.5 text-center min-w-[44px] border-r border-slate-800/80 whitespace-nowrap"
                    title={col.date}
                  >
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                      {col.dayName}
                    </div>
                    <div className="text-xs font-bold text-white mt-0.5">
                      {col.dayNum}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 bg-white">
              {sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + dateColumns.length}
                    className="py-16 text-center text-slate-400 font-medium text-xs"
                  >
                    No cleaner attendance records found for the selected filters.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, idx) => {
                  const cleanerName = row.cleaner_name || row.employee_name || "Unknown";
                  const phone = row.cleaner_phone || "-";
                  const assignedWashrooms =
                    row.assigned_locations || row.site_beat || "Unassigned";
                  const daysPresent = row.days_present ?? row.days_worked ?? 0;
                  const rate =
                    totalAuditDays > 0
                      ? ((daysPresent / totalAuditDays) * 100).toFixed(0) + "%"
                      : "0%";

                  return (
                    <tr
                      key={row.cleaner_id || idx}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* 1. Sr No - Sticky Left */}
                      <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-500 border-r border-slate-100 sticky left-0 z-10 bg-white group-hover:bg-slate-50/80">
                        {idx + 1}
                      </td>

                      {/* 2. Cleaner Name & Phone - Sticky Left */}
                      <td className="py-2.5 px-3 border-r border-slate-100 sticky left-12 z-10 bg-white group-hover:bg-slate-50/80 shadow-[2px_0_5px_rgba(0,0,0,0.03)] whitespace-nowrap">
                        <div className="font-semibold text-slate-900 text-xs">
                          {cleanerName}
                        </div>
                        {phone && phone !== "-" && (
                          <div className="text-[11px] text-slate-400 font-mono">
                            {phone}
                          </div>
                        )}
                      </td>

                      {/* 3. Assigned Washrooms */}
                      <td
                        className="py-2.5 px-3 border-r border-slate-100 text-slate-600 text-xs max-w-xs truncate"
                        title={assignedWashrooms}
                      >
                        {assignedWashrooms}
                      </td>

                      {/* 4. Days Present */}
                      <td className="py-2.5 px-2 text-center font-bold text-slate-900 border-r border-slate-100 text-xs">
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {daysPresent}{" "}
                          <span className="text-[10px] text-emerald-600/80 font-normal">
                            / {totalAuditDays}
                          </span>
                        </span>
                      </td>

                      {/* 5. Rate */}
                      <td className="py-2.5 px-2 text-center font-semibold text-slate-700 border-r border-slate-100 text-xs">
                        {rate}
                      </td>

                      {/* 6. Day Cells: Strictly P (Present) or A (Absent) */}
                      {dateColumns.map((col) => {
                        const cellData = row.attendance_map?.[col.date];
                        const isPresent =
                          cellData?.code === "P" ||
                          cellData?.status?.toLowerCase() === "present";

                        return (
                          <td
                            key={col.date}
                            className={`py-1.5 px-1 text-center border-r border-slate-100 select-none ${
                              isPresent ? "bg-emerald-50/20" : "bg-rose-50/10"
                            }`}
                            title={`${cleanerName} on ${col.date}: ${
                              isPresent ? "Present" : "Absent"
                            }${
                              cellData?.logs_count
                                ? ` (${cellData.logs_count} cleaning reviews)`
                                : ""
                            }`}
                          >
                            {isPresent ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded font-extrabold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200">
                                P
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded font-semibold text-xs text-rose-600 bg-rose-50/80 border border-rose-200/60">
                                A
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
