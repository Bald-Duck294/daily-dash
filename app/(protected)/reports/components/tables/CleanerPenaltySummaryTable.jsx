"use client";

import React, { useState } from "react";
import {
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
  User,
  MapPin,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Search
} from "lucide-react";

export default function CleanerPenaltySummaryTable({ data = [], metadata = {} }) {
  const [expandedCleanerId, setExpandedCleanerId] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "gross_amount",
    direction: "desc",
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const toggleExpand = (cleanerId) => {
    setExpandedCleanerId((prev) => (prev === cleanerId ? null : cleanerId));
  };

  // Filter by local search
  const filteredData = (data || []).filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const nameMatch = (item.cleaner_name || "").toLowerCase().includes(q);
    const phoneMatch = (item.cleaner_phone || "").toLowerCase().includes(q);
    const locMatch = (item.locations || []).some((loc) =>
      loc.toLowerCase().includes(q)
    );
    return nameMatch || phoneMatch || locMatch;
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    switch (sortConfig.key) {
      case "cleaner_name": {
        const nameA = (a.cleaner_name || "").toLowerCase();
        const nameB = (b.cleaner_name || "").toLowerCase();
        return nameA.localeCompare(nameB) * dir;
      }
      case "total_penalties":
        return (Number(a.total_penalties || 0) - Number(b.total_penalties || 0)) * dir;
      case "gross_amount":
        return (Number(a.gross_amount || 0) - Number(b.gross_amount || 0)) * dir;
      case "approved_amount":
        return (Number(a.approved_amount || 0) - Number(b.approved_amount || 0)) * dir;
      case "waived_amount":
        return (Number(a.waived_amount || 0) - Number(b.waived_amount || 0)) * dir;
      case "pending_amount":
        return (Number(a.pending_amount || 0) - Number(b.pending_amount || 0)) * dir;
      case "disputes_count":
        return (Number(a.disputes_count || 0) - Number(b.disputes_count || 0)) * dir;
      default:
        return 0;
    }
  });

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-3 h-3 text-slate-400 ml-1 inline" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-600 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600 ml-1 inline" />
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Cleaners */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Cleaners Penalized
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {metadata?.total_cleaners ?? data?.length ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Total subjects</span>
        </div>

        {/* Gross Imposed */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
            Gross Penalties
          </span>
          <div className="text-xl font-black text-amber-900 mt-1">
            ₹{Number(metadata?.gross_amount ?? 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-amber-600/80">Calculated sum</span>
        </div>

        {/* Waived */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            Waived / Forgiven
          </span>
          <div className="text-xl font-black text-slate-700 mt-1">
            ₹{Number(metadata?.waived_amount ?? 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500">Disputes accepted</span>
        </div>

        {/* Approved / Deducted */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            Confirmed Deductions
          </span>
          <div className="text-xl font-black text-emerald-800 mt-1">
            ₹{Number(metadata?.approved_amount ?? 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-emerald-600">Ready for payroll</span>
        </div>

        {/* Pending Balance */}
        <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
            Pending Balance
          </span>
          <div className="text-xl font-black text-blue-900 mt-1">
            ₹{Number(metadata?.pending_amount ?? 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-blue-600">Awaiting supervisor</span>
        </div>
      </div>

      {/* Table Local Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search cleaner, phone, or washroom..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{sortedData.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{data?.length || 0}</span> cleaner summaries
        </div>
      </div>

      {/* Main Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-3 py-3 w-10 text-center">Sr.</th>
                <th
                  onClick={() => handleSort("cleaner_name")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Cleaner <SortIcon columnKey="cleaner_name" />
                </th>
                <th className="px-4 py-3">Assigned Washrooms</th>
                <th
                  onClick={() => handleSort("total_penalties")}
                  className="px-3 py-3 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Penalties <SortIcon columnKey="total_penalties" />
                </th>
                <th
                  onClick={() => handleSort("gross_amount")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Gross (₹) <SortIcon columnKey="gross_amount" />
                </th>
                <th
                  onClick={() => handleSort("waived_amount")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Waived (₹) <SortIcon columnKey="waived_amount" />
                </th>
                <th
                  onClick={() => handleSort("approved_amount")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Approved (₹) <SortIcon columnKey="approved_amount" />
                </th>
                <th
                  onClick={() => handleSort("pending_amount")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Pending (₹) <SortIcon columnKey="pending_amount" />
                </th>
                <th
                  onClick={() => handleSort("disputes_count")}
                  className="px-3 py-3 text-center cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Disputes <SortIcon columnKey="disputes_count" />
                </th>
                <th className="px-3 py-3 text-center w-20">Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No cleaner penalty records found for this period.
                  </td>
                </tr>
              ) : (
                sortedData.map((cleaner, idx) => {
                  const isExpanded = expandedCleanerId === cleaner.cleaner_id;
                  return (
                    <React.Fragment key={cleaner.cleaner_id || idx}>
                      <tr
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isExpanded ? "bg-blue-50/40" : ""
                        }`}
                        onClick={() => toggleExpand(cleaner.cleaner_id)}
                      >
                        {/* Serial No */}
                        <td className="px-3 py-3.5 text-center font-mono font-semibold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Cleaner Details */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 overflow-hidden border border-slate-200 shrink-0">
                              {cleaner.cleaner_avatar ? (
                                <img
                                  src={cleaner.cleaner_avatar}
                                  alt={cleaner.cleaner_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {cleaner.cleaner_name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {cleaner.cleaner_phone}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Locations */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            {(cleaner.locations || []).slice(0, 2).map((loc, lIdx) => (
                              <span
                                key={lIdx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[130px]">{loc}</span>
                              </span>
                            ))}
                            {(cleaner.locations || []).length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{(cleaner.locations || []).length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Penalties Count */}
                        <td className="px-3 py-3.5 text-center font-bold text-slate-800">
                          {cleaner.total_penalties}
                        </td>

                        {/* Gross Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-amber-700">
                          ₹{Number(cleaner.gross_amount || 0).toFixed(2)}
                        </td>

                        {/* Waived Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-600">
                          ₹{Number(cleaner.waived_amount || 0).toFixed(2)}
                        </td>

                        {/* Approved Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-emerald-700">
                          ₹{Number(cleaner.approved_amount || 0).toFixed(2)}
                        </td>

                        {/* Pending Balance */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {Number(cleaner.pending_amount || 0) > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              ₹{Number(cleaner.pending_amount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">₹0.00</span>
                          )}
                        </td>

                        {/* Disputes */}
                        <td className="px-3 py-3.5 text-center">
                          {Number(cleaner.disputes_count || 0) > 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {cleaner.disputes_count}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>

                        {/* Expand Action */}
                        <td className="px-3 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(cleaner.cleaner_id);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                            title={isExpanded ? "Collapse" : "Expand penalty records"}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isExpanded ? "rotate-180 text-blue-600" : ""
                              }`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Drill-down Table for Cleaner */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="px-4 py-3 bg-slate-50/70 border-y border-slate-200">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                                  Violation History for {cleaner.cleaner_name} (
                                  {(cleaner.violations_list || []).length} records)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                  Click any review to inspect photos
                                </span>
                              </div>

                              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                    <tr>
                                      <th className="px-3 py-2">Penalty #</th>
                                      <th className="px-3 py-2">Date</th>
                                      <th className="px-3 py-2">Facility / Washroom</th>
                                      <th className="px-3 py-2">Breached Rule</th>
                                      <th className="px-3 py-2">Amount</th>
                                      <th className="px-3 py-2">Status</th>
                                      <th className="px-3 py-2">Dispute Reason</th>
                                      <th className="px-3 py-2 text-right">Review</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {(cleaner.violations_list || []).map((v, vIdx) => (
                                      <tr key={v.penalty_id || vIdx} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                                          {v.penalty_number}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                                          {formatDate(v.date)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap font-medium text-slate-800">
                                          {v.location_name}
                                        </td>
                                        <td className="px-3 py-2">
                                          <div className="font-semibold text-slate-900">{v.rule_code}</div>
                                          {v.score !== null && (
                                            <span className="text-[10px] text-rose-600 font-bold">
                                              Score: {Number(v.score).toFixed(1)}/10
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap font-bold text-slate-900">
                                          ₹{Number(v.calculated_amount || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <span
                                            className={`inline-flex items-center px-2 py-0.2 rounded-full text-[10px] font-semibold border ${
                                              v.status === "APPROVED"
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                : v.status === "REJECTED" || v.status === "REVERSED"
                                                ? "bg-slate-100 text-slate-600 border-slate-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                            }`}
                                          >
                                            {v.status}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2 max-w-xs truncate italic text-slate-600">
                                          {v.dispute_reason ? `"${v.dispute_reason}"` : "-"}
                                        </td>
                                        <td className="px-3 py-2 text-right whitespace-nowrap">
                                          {v.review_id ? (
                                            <a
                                              href={`/cleaners/${v.review_id}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-[10px]"
                                            >
                                              Review #{v.review_id}
                                              <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          ) : (
                                            <span className="text-slate-400">Daily Quota</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
