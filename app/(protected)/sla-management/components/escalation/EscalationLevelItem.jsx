"use client";

import React from "react";
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Bell,
  Clock,
  UserCheck,
} from "lucide-react";
import {
  TARGET_ROLE_OPTIONS,
  DELAY_PRESETS,
  formatDelayMinutes,
} from "./escalationConstants";

export default function EscalationLevelItem({
  level,
  index,
  totalLevels,
  prevDelay,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled = false,
}) {
  const currentRole =
    TARGET_ROLE_OPTIONS.find((r) => r.value === level.target_role) ||
    TARGET_ROLE_OPTIONS[0];

  const delayNum = Number(level.delay_minutes ?? 0);
  const isDelayChronological =
    index === 0 ? delayNum >= 0 : delayNum >= Number(prevDelay ?? 0);

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        !isDelayChronological
          ? "border-rose-300 bg-rose-50/20 dark:border-rose-900/60 dark:bg-rose-950/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Reorder Controls + Level Identifier */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Up/Down buttons */}
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => onMoveUp(index)}
              disabled={disabled || index === 0}
              title="Move Level Up"
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMoveDown(index)}
              disabled={disabled || index === totalLevels - 1}
              title="Move Level Down"
              className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-mono font-bold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Level {index + 1}
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentRole.badgeColor}`}
              >
                {currentRole.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] truncate">
              {currentRole.description}
            </p>
          </div>
        </div>

        {/* Center: Configuration inputs */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
          {/* Target Role Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-blue-500" />
              Target Role
            </label>
            <select
              value={level.target_role}
              onChange={(e) => onUpdate(index, { target_role: e.target.value })}
              disabled={disabled}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {TARGET_ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Delay Input + Presets */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                Delay (Minutes)
              </label>
              <span className="text-[11px] font-mono font-medium text-slate-500">
                {formatDelayMinutes(delayNum)}
              </span>
            </div>
            <input
              type="number"
              min="0"
              max="10080"
              step="1"
              value={level.delay_minutes}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : parseInt(e.target.value, 10);
                onUpdate(index, {
                  delay_minutes: isNaN(val) ? 0 : Math.max(0, val),
                });
              }}
              disabled={disabled}
              className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                !isDelayChronological
                  ? "border-rose-500 text-rose-600 focus:ring-rose-500"
                  : "border-slate-200 dark:border-slate-700"
              }`}
            />
          </div>

          {/* Send Notification Toggle */}
          <div className="flex flex-col justify-end">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-500" />
              Notification
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={level.send_notification !== false}
                onChange={(e) =>
                  onUpdate(index, { send_notification: e.target.checked })
                }
                disabled={disabled}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span className="text-xs font-medium">Send Alert</span>
            </label>
          </div>
        </div>

        {/* Right: Remove button */}
        <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0">
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled || totalLevels <= 1}
            title={
              totalLevels <= 1
                ? "Cannot remove the only level"
                : "Remove Escalation Level"
            }
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delay Out-of-Order Warning */}
      {!isDelayChronological && (
        <div className="mt-2 text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md">
          <span>&bull;</span>
          <span>
            Delay ({delayNum}m) must be greater than or equal to previous Level{" "}
            {index} delay ({prevDelay}m).
          </span>
        </div>
      )}
    </div>
  );
}
