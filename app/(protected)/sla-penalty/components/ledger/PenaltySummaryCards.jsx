"use client";

import React from "react";
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingDown,
  Layers
} from "lucide-react";

export default function PenaltySummaryCards({ summary, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const s = summary || {
    total_count: 0,
    pending_count: 0,
    approved_count: 0,
    rejected_count: 0,
    disputed_count: 0,
    reversed_count: 0,
    total_calculated_amount: 0,
    total_approved_amount: 0,
    pending_amount: 0
  };

  const cards = [
    {
      title: "Total Deductions",
      value: `₹${(s.total_calculated_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      badge: `${s.total_count || 0} total`,
      icon: IndianRupee,
      iconBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
    },
    {
      title: "Pending Approval",
      value: s.pending_count || 0,
      badge: `₹${(s.pending_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
    },
    {
      title: "Approved & Deducted",
      value: s.approved_count || 0,
      badge: `₹${(s.total_approved_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
    },
    {
      title: "Disputed / Waived",
      value: (s.disputed_count || 0) + (s.rejected_count || 0) + (s.reversed_count || 0),
      badge: `${s.disputed_count || 0} disp · ${s.rejected_count || 0} waiv`,
      icon: AlertTriangle,
      iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm"
          >
            <div className="min-w-0">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block truncate">
                {card.title}
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {card.value}
                </span>
                {card.badge && (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate">
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg}`}
            >
              <Icon className="w-3.5 h-3.5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

