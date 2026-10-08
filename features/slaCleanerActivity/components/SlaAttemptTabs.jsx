"use client";

import { Activity, Star, Clock, CheckCircle2, CheckSquare } from "lucide-react";
import { formatDateTime12Hr, getCompletionTime, getTimeElapsed } from "../utils/slaActivityUtils";

/**
 * Switcher and details for individual attempts (Original, Retry #1, Retry #2)
 */
export default function SlaAttemptTabs({
  attempts = [],
  selectedAttemptIndex = 0,
  onSelectAttempt,
  slaThreshold = 8.0,
}) {
  if (!attempts || attempts.length === 0) return null;

  const currentAttempt = attempts[selectedAttemptIndex] || attempts[0];
  const isCompleted = currentAttempt.status === "completed";
  const hasScore = typeof currentAttempt.score === "number";
  const isPass = currentAttempt.is_passed;

  return (
    <div className="space-y-4">
      {/* ================= TAB BUTTONS ================= */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl border bg-muted/30">
        {attempts.map((att, idx) => {
          const isSelected = idx === selectedAttemptIndex;
          const attScore = typeof att.score === "number";

          return (
            <button
              key={idx}
              onClick={() => onSelectAttempt(idx)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-transparent hover:bg-muted/80"
              }`}
            >
              <span>{att.label}</span>
              {attScore && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : att.is_passed
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  {att.score.toFixed(1)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= ATTEMPT SUMMARY CARD ================= */}
      <div
        className="rounded-xl p-5 border space-y-4"
        style={{
          background: "var(--cleaner-surface, #FFFFFF)",
          borderColor: "var(--cleaner-border, #E5E7EB)",
        }}
      >
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b">
          <div>
            <div className="flex items-center gap-2">
              <h3
                className="text-base font-bold"
                style={{ color: "var(--cleaner-title, #111827)" }}
              >
                {currentAttempt.label} Details
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  isPass
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-red-500/15 text-red-600 dark:text-red-400"
                }`}
              >
                {hasScore ? (isPass ? "Passed Inspection" : "Failed Inspection") : "In Progress"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inspector / Cleaner: <span className="font-semibold text-foreground">{currentAttempt.cleaner_name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            {hasScore && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border font-bold text-sm">
                <span>Score:</span>
                <span className={isPass ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                  {currentAttempt.score.toFixed(1)} / 10
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  (Target: {slaThreshold}/10)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Task Timing and Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg p-3.5 bg-muted/30 border space-y-1.5">
            <p className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Activity size={14} className="text-orange-500" />
              Timing & Duration
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Started:</strong> {formatDateTime12Hr(currentAttempt.created_at)}
            </p>
            {isCompleted ? (
              <>
                <p className="text-xs text-muted-foreground">
                  <strong>Completed:</strong> {formatDateTime12Hr(currentAttempt.updated_at)}
                </p>
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  {getCompletionTime(currentAttempt.created_at, currentAttempt.updated_at)}
                </p>
              </>
            ) : (
              <p className="text-xs font-medium text-orange-500 flex items-center gap-1">
                <Clock size={12} />
                Running for {getTimeElapsed(currentAttempt.created_at)}
              </p>
            )}
          </div>

          <div className="rounded-lg p-3.5 bg-muted/30 border space-y-1.5">
            <p className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Star size={14} className="text-orange-500" />
              Inspection Outcome
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Status:</strong> {isCompleted ? "Completed & Evaluated" : "Work in Progress"}
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Evidence Photos:</strong> {currentAttempt.photos_count || 0} submitted
            </p>
          </div>
        </div>

        {/* Observations & Post cleaning notes */}
        {(currentAttempt.initial_comment || currentAttempt.final_comment) && (
          <div className="space-y-3 pt-2">
            {currentAttempt.initial_comment && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Initial Observation
                </p>
                <p className="text-xs p-3 rounded-lg bg-muted/40 border leading-relaxed">
                  {currentAttempt.initial_comment}
                </p>
              </div>
            )}

            {currentAttempt.final_comment && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Post-Cleaning Notes
                </p>
                <p className="text-xs p-3 rounded-lg bg-muted/40 border leading-relaxed">
                  {currentAttempt.final_comment}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tasks list if available */}
        {currentAttempt.tasks && currentAttempt.tasks.length > 0 && (
          <div className="pt-2">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
              <CheckSquare size={13} />
              Completed Tasks ({currentAttempt.tasks.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {currentAttempt.tasks.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-muted/60 border text-foreground"
                >
                  ✓ {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
