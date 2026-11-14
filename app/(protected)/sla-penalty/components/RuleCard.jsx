"use client";

import React from "react";
import {
  AlertTriangle,
  Clock,
  Sparkles,
  Edit2,
  Trash2,
  Play,
  CheckCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

/**
 * Format condition AST into human-friendly string
 */
function formatConditionSummary(ast) {
  if (!ast || typeof ast !== "object") return "No condition defined";
  if (ast.operator && Array.isArray(ast.conditions)) {
    const parts = ast.conditions.map(c => {
      if (c.field && c.comparator !== undefined) {
        const val = Array.isArray(c.value) ? `[${c.value.join(", ")}]` : c.value;
        const fieldName = c.field.replace("review.", "").replace("day_aggregate.", "daily ");
        return `${fieldName} ${c.comparator} ${val}`;
      }
      return formatConditionSummary(c);
    });
    return parts.join(` ${ast.operator} `);
  }
  if (ast.field && ast.comparator !== undefined) {
    const val = Array.isArray(ast.value) ? `[${ast.value.join(", ")}]` : ast.value;
    return `${ast.field} ${ast.comparator} ${val}`;
  }
  return JSON.stringify(ast);
}

export default function RuleCard({
  rule,
  isDraft = false,
  onEdit,
  onDelete,
  onSimulate
}) {
  const isTaskWise = rule.scope === "TASK_WISE";

  // Category styling
  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "HYGIENE_SCORE_BREACH":
        return { label: "Hygiene Score Breach", bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800" };
      case "RETRY_FAILURE":
        return { label: "Retry Failure", bg: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800" };
      case "MAX_RETRIES_EXCEEDED":
        return { label: "Max Retries Exceeded", bg: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800" };
      case "REPEATED_DAILY_FAILURE":
        return { label: "Repeated Daily Deficiency", bg: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800" };
      case "MISSED_CLEANING_SCHEDULE":
        return { label: "Missed Cleaning", bg: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800" };
      case "LATE_COMPLETION":
        return { label: "Late Completion", bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800" };
      default:
        return { label: cat.replace(/_/g, " "), bg: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" };
    }
  };

  const catBadge = getCategoryBadge(rule.violation_category);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
              {rule.rule_code}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${catBadge.bg}`}>
              {catBadge.label}
            </span>
          </div>

          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
            isTaskWise 
              ? "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/50 dark:text-cyan-400" 
              : "bg-violet-50 text-violet-700 border border-violet-200 dark:bg-violet-950/50 dark:text-violet-400"
          }`}>
            {isTaskWise ? "TASK-WISE" : "DAY-WISE"}
          </span>
        </div>

        {/* Rule Title & Description */}
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          {rule.name}
        </h4>
        {rule.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">
            {rule.description}
          </p>
        )}

        {/* Condition Box */}
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 mb-4 font-mono text-xs text-slate-700 dark:text-slate-300">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
            Trigger Condition (AST):
          </div>
          <div className="text-emerald-700 dark:text-emerald-400 font-medium">
            {formatConditionSummary(rule.condition_config)}
          </div>
        </div>

        {/* Financial Calculation Info */}
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">Calculation</div>
            <div className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {rule.calculation_method === "FIXED_AMOUNT" ? "Fixed Amount" :
               rule.calculation_method === "TASK_VALUE_PERCENTAGE" ? "Task Value %" :
               rule.calculation_method}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2.5 border border-emerald-200/60 dark:border-emerald-800/40">
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400">Penalty Value</div>
            <div className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mt-0.5">
              ₹{Number(rule.penalty_value).toFixed(2)}
              {rule.max_penalty_cap && (
                <span className="text-[11px] font-normal text-slate-500 ml-1">
                  (Cap: ₹{Number(rule.max_penalty_cap).toFixed(0)})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Retry Policy */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Retry Resolution: </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {rule.retry_resolution_policy === "AUTO_WAIVE_ON_RETRY_PASS" ? "Auto-waive on pass" : "Enforce on outcome"}
          </span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <button
          onClick={() => onSimulate(rule)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Simulate Preview
        </button>

        {isDraft && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(rule)}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Rule"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(rule.id)}
              className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              title="Delete Rule"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
