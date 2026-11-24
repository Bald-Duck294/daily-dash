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
  Filter
} from "lucide-react";

export default function AttendanceReportTable({ data = [], metadata = {} }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "sr_no", direction: "asc" });

  // Date columns from metadata or construct from attendance_map / data
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
          isSunday: d.getDay() === 0,
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
          isSunday: curr.getDay() === 0,
        });
        curr.setDate(curr.getDate() + 1);
      }
      return dates;
    }

    return [];
  }, [metadata, data]);

  // Matrix rows (each row = 1 cleaner with left details + attendance map)
  const matrixRows = useMemo(() => {
    // If data is already in matrix form
    if (data && data.length > 0 && data[0].attendance_map) {
      return data;
    }

    // If data is a flat list of daily records, group by cleaner
    const groups = {};
    (data || []).forEach((r) => {
      const cId = r.cleaner_id || r.cleaner_name;
      if (!groups[cId]) {
        groups[cId] = {
          sr_no: Object.keys(groups).length + 1,
          cleaner_id: cId,
          employee_name: r.cleaner_name || "Unknown",
          cleaner_phone: r.cleaner_phone || "-",
          client_range: metadata?.organization || "N/A",
          site_beat: (r.assigned_locations || []).join(", ") || "Unassigned",
          days_worked: 0,
          attendance_map: {},
        };
      }

      const isPresent = r.status?.toLowerCase() === "present" || r.code === "P";
      const isSunday = new Date(r.date).getDay() === 0;
      let code = "A";
      if (isPresent) {
        code = "P";
        groups[cId].days_worked += 1;
      } else if (isSunday) {
        code = "WO";
      }

      groups[cId].attendance_map[r.date] = {
        code,
        status: isPresent ? "Present" : isSunday ? "Week Off" : "Absent",
      };
    });

    return Object.values(groups);
  }, [data, metadata]);

  // Filter matrix rows by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return matrixRows;
    const q = searchQuery.toLowerCase();
    return matrixRows.filter((row) => {
      const nameMatch = (row.employee_name || "").toLowerCase().includes(q);
      const siteMatch = (row.site_beat || "").toLowerCase().includes(q);
      const clientMatch = (row.client_range || "").toLowerCase().includes(q);
      const phoneMatch = (row.cleaner_phone || "").toLowerCase().includes(q);
      return nameMatch || siteMatch || clientMatch || phoneMatch;
    });
  }, [matrixRows, searchQuery]);

  // Sort rows
  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];
      if (sortConfig.key === "days_worked" || sortConfig.key === "sr_no") {
        valA = Number(valA || 0);
        valB = Number(valB || 0);
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

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* =========================================================================
          TOP KPI METRIC CARDS
      ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Total Employees
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {metadata?.total_cleaners ?? matrixRows.length}
          </div>
          <span className="text-[10px] text-slate-400">Roster count</span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Audit Days
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {dateColumns.length}{" "}
            <span className="text-xs font-medium text-slate-500">Days</span>
          </div>
          <span className="text-[10px] text-slate-400">Column window</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Total Present (P)
          </span>
          <div className="text-xl font-bold text-emerald-800 mt-1">
            {metadata?.total_present ??
              matrixRows.reduce((acc, r) => acc + (r.days_worked || 0), 0)}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium">Logged on duty</span>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Total Absent (A)
          </span>
          <div className="text-xl font-bold text-rose-800 mt-1">
            {metadata?.total_absent ??
              matrixRows.reduce(
                (acc, r) => acc + (dateColumns.length - (r.days_worked || 0)),
                0
              )}
          </div>
          <span className="text-[10px] text-rose-600 font-medium">Zero activity</span>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
            Attendance Rate
          </span>
          <div className="text-xl font-bold text-indigo-800 mt-1">
            {metadata?.overall_attendance_rate || "0.0%"}
          </div>
          <span className="text-[10px] text-indigo-600 font-medium">Overall compliance</span>
        </div>
      </div>

      {/* =========================================================================
          CONTROLS & SEARCH
      ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            Attendance Muster Roll Matrix
          </span>
          <span className="text-[11px] font-medium text-slate-500">
            ({sortedRows.length} Employees, {dateColumns.length} Days)
          </span>
        </div>

        {/* Legend & Search */}
        <div className="flex items-center gap-4">
          {/* Badge Legend */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              P = Present
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
              A = Absent
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
              WO = Week Off
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee or site..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* =========================================================================
          MUSTER ROLL MATRIX TABLE (MATCHES USER SCREENSHOT EXACTLY)
      ========================================================================= */}
      <div className="bg-white border-2 border-slate-400 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Header: Coral / Terracotta matching user screenshot */}
            <thead>
              <tr className="bg-[#DF7E77] text-slate-900 border-b-2 border-slate-600 font-bold text-[11px]">
                {/* 1. Sr No */}
                <th
                  onClick={() => handleSort("sr_no")}
                  className="py-3 px-2 text-center w-12 border-r border-slate-600 cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Sr No</span>
                  </div>
                </th>

                {/* 2. Employee Name */}
                <th
                  onClick={() => handleSort("employee_name")}
                  className="py-3 px-3 min-w-[170px] max-w-[200px] border-r border-slate-600 cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Employee Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-700" />
                  </div>
                </th>

                {/* 3. Client/Range */}
                <th className="py-3 px-3 min-w-[120px] max-w-[140px] border-r border-slate-600 whitespace-nowrap">
                  Client/Range
                </th>

                {/* 4. Site/Beat */}
                <th className="py-3 px-3 min-w-[180px] max-w-[220px] border-r border-slate-600 whitespace-nowrap">
                  Site/Beat
                </th>

                {/* 5. Days Worked */}
                <th
                  onClick={() => handleSort("days_worked")}
                  className="py-3 px-2 text-center w-20 border-r border-slate-600 cursor-pointer select-none whitespace-nowrap"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Days Worked</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-700" />
                  </div>
                </th>

                {/* 6. Date Columns (Sun-01, Mon-02, Tue-03, ...) */}
                {dateColumns.map((col) => (
                  <th
                    key={col.date}
                    className="py-2.5 px-2 text-center min-w-[46px] border-r border-slate-600 whitespace-nowrap font-bold text-[10px]"
                    title={col.date}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-300">
              {sortedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5 + dateColumns.length}
                    className="py-12 text-center text-slate-400 font-medium text-xs"
                  >
                    No employee attendance records found.
                  </td>
                </tr>
              ) : (
                sortedRows.map((row, idx) => {
                  return (
                    <tr
                      key={row.cleaner_id || idx}
                      className="hover:bg-amber-50/50 transition-colors border-b border-slate-300"
                    >
                      {/* 1. Sr No */}
                      <td className="py-3 px-2 text-center font-mono font-medium text-slate-700 border-r border-slate-300">
                        {idx + 1}
                      </td>

                      {/* 2. Employee Name */}
                      <td className="py-3 px-3 border-r border-slate-300 font-semibold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{row.employee_name}</span>
                        </div>
                      </td>

                      {/* 3. Client/Range */}
                      <td className="py-3 px-3 border-r border-slate-300 text-slate-700 text-[11px] whitespace-nowrap">
                        {row.client_range}
                      </td>

                      {/* 4. Site/Beat */}
                      <td className="py-3 px-3 border-r border-slate-300 text-slate-700 text-[11px] max-w-xs truncate" title={row.site_beat}>
                        {row.site_beat}
                      </td>

                      {/* 5. Days Worked */}
                      <td className="py-3 px-2 text-center font-bold text-slate-900 border-r border-slate-300 text-sm">
                        {row.days_worked}
                      </td>

                      {/* 6. Day Cells: P, A, WO */}
                      {dateColumns.map((col) => {
                        const cellData = row.attendance_map?.[col.date];
                        const code = cellData?.code || (col.isSunday ? "WO" : "A");

                        let colorClass = "text-slate-600 font-medium";
                        let bgClass = "bg-white";

                        if (code === "P") {
                          colorClass = "text-emerald-700 font-extrabold text-[13px]";
                          bgClass = "bg-emerald-50/40";
                        } else if (code === "A") {
                          colorClass = "text-rose-600 font-extrabold text-[13px]";
                          bgClass = "bg-rose-50/40";
                        } else if (code === "WO") {
                          colorClass = "text-slate-500 font-semibold text-[11px]";
                          bgClass = "bg-slate-50";
                        }

                        return (
                          <td
                            key={col.date}
                            className={`py-2 px-1 text-center border-r border-slate-300 ${bgClass} select-none`}
                            title={`${row.employee_name} on ${col.date}: ${cellData?.status || code} (${cellData?.logs_count || 0} cleanings)`}
                          >
                            <span className={colorClass}>{code}</span>
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
