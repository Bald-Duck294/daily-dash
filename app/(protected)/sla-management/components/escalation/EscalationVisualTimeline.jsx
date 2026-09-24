"use client";

import React from "react";
import { AlertCircle, ArrowRight, Bell, BellOff, Clock, ShieldAlert } from "lucide-react";
import { TARGET_ROLE_OPTIONS, formatDelayMinutes } from "./escalationConstants";

export default function EscalationVisualTimeline({ levels = [], isEnabled = true }) {
  if (!isEnabled) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
        <p className="text-xs text-slate-400">
          Escalation ladder is currently disabled. Breaches will not automatically progress through roles.
        </p>
      </div>
    );
  }

  if (levels.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 text-center">
        <p className="text-xs text-amber-600 dark:text-amber-400">
          No escalation levels defined. Please add at least one level below.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-r from-slate-50 via-blue-50/20 to-slate-50 dark:from-slate-900/60 dark:via-blue-950/20 dark:to-slate-900/60">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
          Escalation Timeline Preview
        </h4>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {/* Step 0: Breach */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-center p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-center min-w-[90px]">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 mb-1" />
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300">SLA Breach</span>
            <span className="text-[9px] text-slate-500">Score &lt; Threshold</span>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        </div>

        {/* Level Steps */}
        {levels.map((item, index) => {
          const roleMeta = TARGET_ROLE_OPTIONS.find((r) => r.value === item.target_role) || {
            label: item.target_role,
            badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
          };

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm shrink-0 min-w-[130px]">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    L{index + 1}
                  </span>
                  {item.send_notification ? (
                    <span className="flex items-center text-[9px] text-emerald-600 dark:text-emerald-400 font-medium gap-0.5">
                      <Bell className="w-2.5 h-2.5" /> Alert On
                    </span>
                  ) : (
                    <span className="flex items-center text-[9px] text-slate-400 font-medium gap-0.5">
                      <BellOff className="w-2.5 h-2.5" /> Muted
                    </span>
                  )}
                </div>

                <div className="my-1">
                  <span
                    className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded-md border ${roleMeta.badgeColor}`}
                  >
                    {roleMeta.label}
                  </span>
                </div>

                <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <Clock className="w-2.5 h-2.5 text-blue-500" />
                  <span>+{formatDelayMinutes(item.delay_minutes)}</span>
                </div>
              </div>

              {index < levels.length - 1 && (
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </React.Fragment>
          );
        })}

        {/* Max Level Alert */}
        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
        <div className="flex flex-col items-center p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shrink-0 min-w-[90px]">
          <ShieldAlert className="w-4 h-4 text-amber-500 mb-1" />
          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Max Level</span>
          <span className="text-[9px] text-slate-500">Awaiting Fix</span>
        </div>
      </div>
    </div>
  );
}
