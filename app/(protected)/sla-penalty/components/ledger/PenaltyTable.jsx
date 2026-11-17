"use client";

import React from "react";
import {
  User,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  IndianRupee,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function PenaltyTable({
  penalties = [],
  isLoading = false,
  onViewDetails,
  onOpenActionModal,
  onSelectCleaner,
  selectedCleanerId
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
      case "PENDING_APPROVAL":
        return {
          label: "PENDING",
          sublabel: "Awaiting review",
          dotColor: "bg-amber-500",
          className: "bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800"
        };
      case "APPROVED":
        return {
          label: "APPROVED",
          sublabel: "Confirmed & deducted",
          dotColor: "bg-emerald-500",
          className: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
        };
      case "DISPUTED":
        return {
          label: "DISPUTED",
          sublabel: "Inquiry in progress",
          dotColor: "bg-indigo-500",
          className: "bg-indigo-50 text-indigo-700 border border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800"
        };
      case "REJECTED":
        return {
          label: "WAIVED",
          sublabel: "Dismissed by supervisor",
          dotColor: "bg-slate-400",
          className: "bg-slate-50 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
        };
      case "REVERSED":
        return {
          label: "REVERSED",
          sublabel: "Waived by passing re-clean",
          dotColor: "bg-cyan-500",
          className: "bg-cyan-50 text-cyan-700 border border-cyan-200/80 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800"
        };
      default:
        return {
          label: String(status || "").toUpperCase(),
          sublabel: "",
          dotColor: "bg-slate-400",
          className: "bg-slate-50 text-slate-700 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
        };
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!penalties || penalties.length === 0) {
    return (
      <div className="text-center py-16 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
          No Penalty Records Found
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          No penalties match the current filter criteria, or no SLA breaches have occurred yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden lg:block rounded-xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="border-b text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              style={{
                background: "var(--washroom-table-header-bg)",
                borderColor: "var(--washroom-table-divider)",
              }}
            >
              <th className="py-2.5 px-3.5 text-blue-600 w-12 text-center">#</th>
              <th className="py-2.5 px-3.5">Penalty #</th>
              <th className="py-2.5 px-3.5">Cleaner & Facility</th>
              <th className="py-2.5 px-3.5">Breach Rule</th>
              <th className="py-2.5 px-3.5">Amount</th>
              <th className="py-2.5 px-3.5">Status</th>
              <th className="py-2.5 px-3.5">Date</th>
              <th className="py-2.5 px-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {penalties.map((item, idx) => {
              const indexStr = String(idx + 1).padStart(2, "0");
              const statusBadge = getStatusBadge(item.status);
              const cleanerUser = item.cleaner_user || item.cleaner;
              const cleanerName = cleanerUser?.name || `Cleaner #${item.cleaner_user_id || item.cleaner_id || ""}`;
              const cleanerAvatar = cleanerUser?.avatar_url;
              const locationName = item.location?.name || "Facility";
              const effectiveAmount = item.approved_amount ?? item.calculated_amount;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  {/* Index # */}
                  <td className="py-2.5 px-3.5 text-center font-bold font-mono text-[11px] text-slate-400">
                    {indexStr}
                  </td>

                  {/* Penalty # */}
                  <td className="py-2.5 px-3.5 font-mono text-xs font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    <div>{item.penalty_number}</div>
                    <span className="text-[10px] font-medium text-slate-400 font-sans">
                      {item.scope === "TASK_WISE" ? "Task-Wise" : "Daily-Wise"}
                    </span>
                  </td>

                  {/* Cleaner & Location */}
                  <td className="py-2.5 px-3.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        onClick={() => onSelectCleaner && onSelectCleaner(cleanerUser || { id: item.cleaner_user_id || item.cleaner_id, name: cleanerName })}
                        className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-xs overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all shrink-0"
                        title={`Filter by ${cleanerName}`}
                      >
                        {cleanerAvatar ? (
                          <img
                            src={cleanerAvatar}
                            alt={cleanerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onSelectCleaner && onSelectCleaner(cleanerUser || { id: item.cleaner_user_id || item.cleaner_id, name: cleanerName })}
                          className="font-medium text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors cursor-pointer truncate max-w-[150px] block"
                          title={`Filter penalties for ${cleanerName}`}
                        >
                          {cleanerName}
                        </button>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate max-w-[160px]">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{locationName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Breach Rule */}
                  <td className="py-2.5 px-3.5">
                    <div className="font-medium text-slate-900 dark:text-white text-xs truncate max-w-[180px]">
                      {item.rule?.name || item.rule_code || "Contract Clause"}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate max-w-[180px]">
                      {item.rule_code}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap">
                    <div className="text-slate-900 dark:text-white font-bold text-xs">
                      ₹{Number(effectiveAmount || 0).toFixed(2)}
                    </div>
                    {item.approved_amount !== null && item.approved_amount !== item.calculated_amount && (
                      <div className="text-[10px] text-slate-400 line-through">
                        Calc: ₹{Number(item.calculated_amount || 0).toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Status with Dot Pill */}
                  <td className="py-2.5 px-3.5 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusBadge.className}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusBadge.dotColor}`} />
                      {statusBadge.label}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-2.5 px-3.5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(item.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Audit Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {(item.status === "PENDING" || item.status === "PENDING_APPROVAL" || item.status === "DISPUTED") && (
                        <>
                          <button
                            onClick={() => onOpenActionModal(item, "APPROVE")}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                            title={item.status === "DISPUTED" ? "Resolve Dispute: Uphold / Approve Penalty" : "Approve Penalty"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onOpenActionModal(item, "REJECT")}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title={item.status === "DISPUTED" ? "Resolve Dispute: Accept & Waive Penalty" : "Reject / Waive Penalty"}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}

                      {(item.status === "PENDING" || item.status === "PENDING_APPROVAL" || item.status === "APPROVED") && item.status !== "DISPUTED" && (
                        <button
                          onClick={() => onOpenActionModal(item, "DISPUTE")}
                          className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                          title="Flag Dispute"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile & Tablet Card View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {penalties.map((item) => {
          const statusBadge = getStatusBadge(item.status);
          const cleanerUser = item.cleaner_user || item.cleaner;
          const cleanerName = cleanerUser?.name || `Cleaner #${item.cleaner_user_id || item.cleaner_id || ""}`;
          const effectiveAmount = item.approved_amount ?? item.calculated_amount;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white">
                  {item.penalty_number}
                </span>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusBadge.className}`}
                >
                  {statusBadge.label}
                </span>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">
                  {item.rule?.name || item.rule_code}
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Cleaner:</span>
                  <button
                    type="button"
                    onClick={() => onSelectCleaner && onSelectCleaner(item.cleaner_user || item.cleaner || { id: item.cleaner_user_id || item.cleaner_id, name: cleanerName })}
                    className="font-semibold text-blue-600 dark:text-blue-400 underline decoration-blue-500/40 hover:text-blue-700"
                  >
                    {cleanerName}
                  </button>
                  <span>· {item.location?.name || "Facility"}</span>
                </div>
                {statusBadge.sublabel && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    Status: {statusBadge.sublabel}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Deduction</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white">
                    ₹{Number(effectiveAmount || 0).toFixed(2)}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onViewDetails(item)}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Details
                  </button>

                  {(item.status === "PENDING" || item.status === "PENDING_APPROVAL") && (
                    <>
                      <button
                        onClick={() => onOpenActionModal(item, "APPROVE")}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onOpenActionModal(item, "REJECT")}
                        className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

