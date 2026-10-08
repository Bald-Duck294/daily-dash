"use client";

import { Check, X, Clock } from "lucide-react";

/**
 * Renders compact score progression for an SLA Cleaner Activity lifecycle
 * e.g.:
 * Original     5.2 / 10   ❌
 * Retry #1     6.4 / 10   ❌
 * Retry #2     8.7 / 10   ✅
 */
export default function SlaScoreProgression({ scoreProgression = [], attempts = [] }) {
  const items = scoreProgression.length > 0 ? scoreProgression : attempts.map((a) => ({
    label: a.short_label || `Attempt #${a.attempt_no}`,
    score: a.score,
    is_passed: a.is_passed,
    status: a.score !== null ? (a.is_passed ? "Passed" : "Failed") : "Pending",
  }));

  if (!items || items.length === 0) return null;

  return (
    <div
      className="rounded-lg p-2.5 my-2 border text-xs"
      style={{
        background: "var(--cleaner-input-bg, rgba(255,255,255,0.04))",
        borderColor: "var(--cleaner-border, rgba(255,255,255,0.1))",
      }}
    >
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider mb-1.5 pb-1 border-b"
        style={{
          color: "var(--cleaner-subtitle, #9CA3AF)",
          borderColor: "var(--cleaner-border, rgba(255,255,255,0.08))",
        }}
      >
        <span>Attempt Lifecycle</span>
        <span>Score</span>
      </div>

      <div className="space-y-1.5">
        {items.map((item, idx) => {
          const isPass = item.is_passed;
          const hasScore = typeof item.score === "number";

          return (
            <div
              key={idx}
              className="flex items-center justify-between text-xs py-0.5"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: !hasScore
                      ? "#9CA3AF"
                      : isPass
                      ? "#10B981"
                      : "#EF4444",
                  }}
                />
                <span
                  className="font-medium truncate"
                  style={{ color: "var(--cleaner-title, #FFFFFF)" }}
                >
                  {item.label}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {hasScore ? (
                  <>
                    <span
                      className="font-bold tabular-nums"
                      style={{
                        color: isPass ? "#10B981" : "#EF4444",
                      }}
                    >
                      {item.score.toFixed(1)}
                      <span className="text-[10px] opacity-70 font-normal text-muted-foreground ml-0.5">/ 10</span>
                    </span>
                    {isPass ? (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 text-[10px]">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500/20 text-red-500 text-[10px]">
                        <X size={10} strokeWidth={3} />
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock size={10} /> Pending
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
