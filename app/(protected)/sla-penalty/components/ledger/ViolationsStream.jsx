"use client";

import React from "react";
import {
  AlertCircle,
  MapPin,
  User,
  Clock,
  RotateCcw,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

export default function ViolationsStream({
  violations = [],
  isLoading = false
}) {
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

  const getStatusBadge = (status) => {
    switch (status) {
      case "BREACHED":
      case "QUALIFIED_FOR_PENALTY":
      case "DETECTED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      case "RETRY_PENDING":
      case "WAITING_FOR_RETRY":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      case "AUTO_WAIVED_ON_PASS":
      case "WAIVED_BY_RETRY":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "MANUALLY_WAIVED":
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!violations || violations.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
          No Violations Recorded
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          All cleaning operations are currently meeting SLA criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {violations.map((v) => {
        const cleanerUser = v.cleaner_user || v.cleaner;
        const cleanerName = cleanerUser?.name || `Cleaner #${v.cleaner_user_id || v.cleaner_id || ""}`;
        const locationName = v.location?.name || "Facility";
        const ruleCode = v.rule?.rule_code || v.rule_code || v.details?.matched_rule?.code || "SLA-RULE";
        const ruleName = v.rule?.name || v.details?.matched_rule?.name || "";
        const rawStatus = v.status || v.evaluation_status || "DETECTED";
        const displayStatus = String(rawStatus).replace(/_/g, " ");

        return (
          <div
            key={v.id}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white text-xs">
                    {ruleCode} {ruleName ? `— ${ruleName}` : ""}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadge(rawStatus)}`}
                  >
                    {displayStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {cleanerName}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {locationName}
                  </span>
                  {v.score !== null && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Score: {Number(v.score).toFixed(1)}/10
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right text-xs text-slate-400 whitespace-nowrap self-end sm:self-center">
              {formatDate(v.created_at)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

