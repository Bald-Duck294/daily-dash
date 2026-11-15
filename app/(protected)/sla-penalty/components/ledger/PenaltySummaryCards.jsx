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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm animate-pulse h-28"
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
      subtitle: `${s.total_count || 0} total penalties assessed`,
      icon: IndianRupee,
      iconBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
      borderAccent: "border-blue-500/20"
    },
    {
      title: "Pending Approval",
      value: s.pending_count || 0,
      badge: `₹${(s.pending_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Awaiting supervisor sign-off",
      icon: Clock,
      iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
      borderAccent: "border-amber-500/20"
    },
    {
      title: "Approved & Deducted",
      value: s.approved_count || 0,
      badge: `₹${(s.total_approved_amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Processed into payroll deductions",
      icon: CheckCircle2,
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      borderAccent: "border-emerald-500/20"
    },
    {
      title: "Disputed / Waived",
      value: (s.disputed_count || 0) + (s.rejected_count || 0) + (s.reversed_count || 0),
      subtitle: `${s.disputed_count || 0} disputed · ${s.rejected_count || 0} waived · ${s.reversed_count || 0} reversed`,
      icon: AlertTriangle,
      iconBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
      borderAccent: "border-purple-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200 hover:shadow-md ${card.borderAccent}`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {card.value}
              </span>
              {card.badge && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {card.badge}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {card.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
