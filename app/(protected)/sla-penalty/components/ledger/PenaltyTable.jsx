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
  onOpenActionModal
}) {
  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return {
          label: "Pending Approval",
          className: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30"
        };
      case "APPROVED":
        return {
          label: "Approved",
          className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
        };
      case "DISPUTED":
        return {
          label: "Disputed",
          className: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30"
        };
      case "REJECTED":
        return {
          label: "Rejected / Waived",
          className: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30"
        };
      case "REVERSED":
        return {
          label: "Reversed",
          className: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/30"
        };
      default:
        return {
          label: status,
          className: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30"
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
      <div className="hidden lg:block overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Penalty #</th>
              <th className="py-3.5 px-4">Cleaner & Facility</th>
              <th className="py-3.5 px-4">Breach Rule</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
            {penalties.map((item) => {
              const statusBadge = getStatusBadge(item.status);
              const cleanerName = item.cleaner?.name || `Cleaner #${item.cleaner_id}`;
              const cleanerAvatar = item.cleaner?.avatar_url;
              const locationName = item.location?.name || "Facility";
              const effectiveAmount = item.approved_amount ?? item.calculated_amount;

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {/* Penalty # */}
                  <td className="py-4 px-4 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                    <div>{item.penalty_number}</div>
                    <span className="text-[10px] font-normal text-slate-400">
                      {item.scope === "TASK_WISE" ? "Task-Wise" : "Daily-Wise"}
                    </span>
                  </td>

                  {/* Cleaner & Location */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-medium text-xs overflow-hidden border border-slate-200 dark:border-slate-700">
                        {cleanerAvatar ? (
                          <img
                            src={cleanerAvatar}
                            alt={cleanerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {cleanerName}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[150px]">{locationName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Breach Rule */}
                  <td className="py-4 px-4">
                    <div className="font-medium text-slate-900 dark:text-white text-xs">
                      {item.rule?.name || item.rule_code || "Contract Clause"}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]">
                      {item.rule_code}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-medium">
                    <div className="text-slate-900 dark:text-white font-semibold">
                      ₹{Number(effectiveAmount || 0).toFixed(2)}
                    </div>
                    {item.approved_amount !== null && item.approved_amount !== item.calculated_amount && (
                      <div className="text-[10px] text-slate-400 line-through">
                        Calc: ₹{Number(item.calculated_amount || 0).toFixed(2)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.className}`}
                    >
                      {statusBadge.label}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(item.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="View Audit Details & Evidence"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {item.status === "PENDING_APPROVAL" && (
                        <>
                          <button
                            onClick={() => onOpenActionModal(item, "APPROVE")}
                            className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Approve Penalty"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenActionModal(item, "REJECT")}
                            className="p-1.5 rounded-lg text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Reject / Waive Penalty"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {(item.status === "PENDING_APPROVAL" || item.status === "APPROVED") && (
                        <button
                          onClick={() => onOpenActionModal(item, "DISPUTE")}
                          className="p-1.5 rounded-lg text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                          title="Flag / Dispute"
                        >
                          <AlertTriangle className="w-4 h-4" />
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
          const cleanerName = item.cleaner?.name || `Cleaner #${item.cleaner_id}`;
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
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Cleaner: {cleanerName} · {item.location?.name || "Facility"}
                </p>
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

                  {item.status === "PENDING_APPROVAL" && (
                    <button
                      onClick={() => onOpenActionModal(item, "APPROVE")}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Approve
                    </button>
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
