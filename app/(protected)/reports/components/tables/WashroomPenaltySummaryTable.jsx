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
  Search,
  Building2,
  Calendar,
  Phone,
  Scale
} from "lucide-react";

export default function WashroomPenaltySummaryTable({ data = [], metadata = {} }) {
  const [expandedWashroomId, setExpandedWashroomId] = useState(
    data?.length === 1 ? data[0]?.location_id : null
  );
  const [searchFilter, setSearchFilter] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "gross_amount",
    direction: "desc",
  });

  const isSingleWashroom =
    metadata?.is_single_washroom === true ||
    (data && data.length === 1 && (metadata?.location_id || metadata?.is_single_washroom !== false));

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

  const toggleExpand = (locId) => {
    setExpandedWashroomId((prev) => (prev === locId ? null : locId));
  };

  // Filter by local search
  const filteredData = (data || []).filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const locMatch = (item.location_name || "").toLowerCase().includes(q);
    const codeMatch = (item.location_code || "").toLowerCase().includes(q);
    const cleanerMatch = (item.cleaners || []).some((c) =>
      c.toLowerCase().includes(q)
    );
    return locMatch || codeMatch || cleanerMatch;
  });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    const dir = sortConfig.direction === "asc" ? 1 : -1;
    switch (sortConfig.key) {
      case "location_name": {
        const nameA = (a.location_name || "").toLowerCase();
        const nameB = (b.location_name || "").toLowerCase();
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
      <ChevronUp className="w-3 h-3 text-indigo-600 ml-1 inline" />
    ) : (
      <ChevronDown className="w-3 h-3 text-indigo-600 ml-1 inline" />
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

  // =========================================================================
  // SINGLE WASHROOM VIEW
  // If a single washroom is selected or data has 1 washroom in single mode
  // =========================================================================
  if (isSingleWashroom && data && data.length > 0) {
    const singleLoc = data[0];
    const violations = singleLoc.violations_list || [];

    const totalCount = singleLoc.total_penalties || violations.length;
    const grossTotal = Number(singleLoc.gross_amount || 0);
    const waivedTotal = Number(singleLoc.waived_amount || 0);
    const approvedTotal = Number(singleLoc.approved_amount || 0);
    const pendingTotal = Number(singleLoc.pending_amount || 0);

    return (
      <div className="space-y-6">
        {/* Washroom Profile Header */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xl shadow-md shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {singleLoc.location_name}
                  </h2>
                  {singleLoc.location_code && singleLoc.location_code !== "-" && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {singleLoc.location_code}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  {singleLoc.location_address && singleLoc.location_address !== "-" && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {singleLoc.location_address}{singleLoc.location_city ? `, ${singleLoc.location_city}` : ""}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Period: {metadata?.date_range?.start || "Beginning"} to {metadata?.date_range?.end || "Now"}
                  </span>
                </div>
              </div>
            </div>

            {/* Cleaners on site */}
            {singleLoc.cleaners && singleLoc.cleaners.length > 0 && (
              <div className="sm:text-right space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Mapped Cleaners
                </span>
                <div className="flex flex-wrap sm:justify-end gap-1 max-w-md">
                  {singleLoc.cleaners.map((cName, cIdx) => (
                    <span
                      key={cIdx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      <User className="w-2.5 h-2.5 text-blue-500" />
                      {cName}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {/* Total Penalties / Gross */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Violations Imposed
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              ₹{grossTotal.toFixed(2)}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {totalCount} total penalty breach(es)
            </span>
          </div>

          {/* Waived / Overturned */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Waived / Forgiven
            </span>
            <div className="text-2xl font-black text-slate-600 mt-1">
              ₹{waivedTotal.toFixed(2)}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Disputed & reversed
            </span>
          </div>

          {/* Pending Review */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Pending Approval
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              ₹{pendingTotal.toFixed(2)}
            </div>
            <span className="text-xs text-amber-600/80 font-medium">
              Awaiting supervisor review
            </span>
          </div>

          {/* Approved / Deductible */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Approved Penalties
            </span>
            <div className="text-2xl font-black text-emerald-800 mt-1">
              ₹{approvedTotal.toFixed(2)}
            </div>
            <span className="text-xs text-emerald-600 font-semibold">
              Confirmed SLA deductions
            </span>
          </div>
        </div>

        {/* Itemized Penalties Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Itemized Washroom Penalties ({violations.length})
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Showing all recorded SLA breaches for this washroom
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">Sr.</th>
                  <th className="px-4 py-3">Penalty #</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Cleaner Responsible</th>
                  <th className="px-4 py-3">Breached Rule</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Dispute Reason</th>
                  <th className="px-4 py-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {violations.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                      No penalty records recorded for this washroom in the selected timeframe.
                    </td>
                  </tr>
                ) : (
                  violations.map((v, vIdx) => (
                    <tr key={v.penalty_id || vIdx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-mono font-semibold text-slate-400">
                        {vIdx + 1}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {v.penalty_number}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                        {formatDate(v.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{v.cleaner_name}</span>
                        </div>
                        {v.cleaner_phone && v.cleaner_phone !== "-" && (
                          <div className="text-[10px] text-slate-400 pl-4.5">
                            {v.cleaner_phone}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{v.rule_code}</div>
                        {v.score !== null && (
                          <span className="text-[10px] text-rose-600 font-bold">
                            Score: {Number(v.score).toFixed(1)}/10
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-slate-900">
                        ₹{Number(v.calculated_amount || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
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
                      <td className="px-4 py-3 max-w-xs truncate italic text-slate-600">
                        {v.dispute_reason ? `"${v.dispute_reason}"` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {v.review_id ? (
                          <a
                            href={`/cleaners/${v.review_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-[10px]"
                          >
                            Review #{v.review_id}
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400">Daily Quota</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* BOTTOM SUMMARY & DEDUCTIBLE RECONCILIATION BAR */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-purple-50/20 to-emerald-50/30 border-t-2 border-slate-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Washroom Penalty Reconciliation & Deductible
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span>Gross Imposed: <strong className="text-slate-800 font-mono">₹{grossTotal.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Waived / Reversed: <strong className="text-slate-600 font-mono">₹{waivedTotal.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Pending Review: <strong className="text-amber-700 font-mono">₹{pendingTotal.toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Prominent Approved Deductible Card */}
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-600 text-white shadow-md">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
                    Confirmed Washroom Deductions
                  </div>
                  <div className="text-xl font-black font-mono">
                    ₹{approvedTotal.toFixed(2)}
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-700/60 text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // MULTI-WASHROOM SUMMARY TABLE VIEW
  // =========================================================================
  return (
    <div className="space-y-5">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Total Washrooms */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Washrooms Penalized
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {metadata?.total_washrooms ?? data?.length ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Total facilities</span>
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
            placeholder="Search washroom name, code, or cleaner..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
          />
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800">{sortedData.length}</span> of{" "}
          <span className="font-semibold text-slate-800">{data?.length || 0}</span> washroom summaries
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
                  onClick={() => handleSort("location_name")}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  Washroom Location <SortIcon columnKey="location_name" />
                </th>
                <th className="px-4 py-3">Cleaners Assigned</th>
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
                    No washroom penalty records found for this period.
                  </td>
                </tr>
              ) : (
                sortedData.map((washroom, idx) => {
                  const isExpanded = expandedWashroomId === washroom.location_id;
                  const violations = washroom.violations_list || [];

                  return (
                    <React.Fragment key={washroom.location_id || idx}>
                      <tr
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          isExpanded ? "bg-purple-50/40" : ""
                        }`}
                        onClick={() => toggleExpand(washroom.location_id)}
                      >
                        {/* Serial No */}
                        <td className="px-3 py-3.5 text-center font-mono font-semibold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Location Details */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center font-bold shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {washroom.location_name}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                {washroom.location_code || washroom.location_address || "-"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cleaners on site */}
                        <td className="px-4 py-3.5">
                          <div className="flex flex-wrap items-center gap-1 max-w-xs">
                            {(washroom.cleaners || []).slice(0, 2).map((cName, cIdx) => (
                              <span
                                key={cIdx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200"
                              >
                                <User className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                                <span className="truncate max-w-[130px]">{cName}</span>
                              </span>
                            ))}
                            {(washroom.cleaners || []).length > 2 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{(washroom.cleaners || []).length - 2} more
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Penalties Count */}
                        <td className="px-3 py-3.5 text-center font-bold text-slate-800">
                          {washroom.total_penalties}
                        </td>

                        {/* Gross Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-amber-700">
                          ₹{Number(washroom.gross_amount || 0).toFixed(2)}
                        </td>

                        {/* Waived Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-semibold text-slate-600">
                          ₹{Number(washroom.waived_amount || 0).toFixed(2)}
                        </td>

                        {/* Approved Amount */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-bold text-emerald-700">
                          ₹{Number(washroom.approved_amount || 0).toFixed(2)}
                        </td>

                        {/* Pending Balance */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {Number(washroom.pending_amount || 0) > 0 ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              ₹{Number(washroom.pending_amount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">₹0.00</span>
                          )}
                        </td>

                        {/* Disputes */}
                        <td className="px-3 py-3.5 text-center">
                          {Number(washroom.disputes_count || 0) > 0 ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {washroom.disputes_count}
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
                              toggleExpand(washroom.location_id);
                            }}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                            title={isExpanded ? "Collapse" : "Expand washroom records"}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${
                                isExpanded ? "rotate-180 text-purple-600" : ""
                              }`}
                            />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Drill-down Table for Washroom */}
                      {isExpanded && (
                        <tr>
                          <td colSpan={10} className="px-4 py-3 bg-slate-50/70 border-y border-slate-200">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                  <ShieldAlert className="w-3.5 h-3.5 text-purple-600" />
                                  Violation History for {washroom.location_name} (
                                  {violations.length} records)
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
                                      <th className="px-3 py-2">Cleaner Responsible</th>
                                      <th className="px-3 py-2">Breached Rule</th>
                                      <th className="px-3 py-2">Amount</th>
                                      <th className="px-3 py-2">Status</th>
                                      <th className="px-3 py-2">Dispute Reason</th>
                                      <th className="px-3 py-2 text-right">Review</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 text-slate-700">
                                    {violations.map((v, vIdx) => (
                                      <tr key={v.penalty_id || vIdx} className="hover:bg-slate-50">
                                        <td className="px-3 py-2 font-mono font-bold text-slate-900">
                                          {v.penalty_number}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap text-slate-500">
                                          {formatDate(v.date)}
                                        </td>
                                        <td className="px-3 py-2 whitespace-nowrap">
                                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                                            <User className="w-3 h-3 text-slate-400" />
                                            <span>{v.cleaner_name}</span>
                                          </div>
                                          {v.cleaner_phone && v.cleaner_phone !== "-" && (
                                            <div className="text-[10px] text-slate-400 pl-4">
                                              {v.cleaner_phone}
                                            </div>
                                          )}
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
                                              className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-semibold text-[10px]"
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

                                {/* AT BOTTOM: RECONCILIATION & APPROVED DEDUCTIBLE BAR */}
                                <div className="p-3 bg-gradient-to-r from-slate-50 to-emerald-50/30 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600">
                                    <span>Gross: <strong className="text-slate-900 font-mono">₹{Number(washroom.gross_amount || 0).toFixed(2)}</strong></span>
                                    <span>•</span>
                                    <span>Waived: <strong className="text-slate-600 font-mono">₹{Number(washroom.waived_amount || 0).toFixed(2)}</strong></span>
                                    <span>•</span>
                                    <span>Pending: <strong className="text-amber-700 font-mono">₹{Number(washroom.pending_amount || 0).toFixed(2)}</strong></span>
                                  </div>

                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shadow-xs self-start sm:self-auto">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                                    <span>Approved Deductible: ₹{Number(washroom.approved_amount || 0).toFixed(2)}</span>
                                  </div>
                                </div>
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
