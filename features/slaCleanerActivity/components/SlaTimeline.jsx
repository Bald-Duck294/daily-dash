"use client";

import { CheckCircle2, AlertTriangle, RefreshCw, XCircle, Clock, ShieldCheck, UserCheck } from "lucide-react";
import { formatDateTime12Hr } from "../utils/slaActivityUtils";

/**
 * Renders complete cleaning activity & SLA lifecycle timeline
 */
export default function SlaTimeline({ timeline = [], slaThreshold = 8.0 }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-muted/40 text-center text-xs text-muted-foreground">
        No lifecycle events recorded for this activity.
      </div>
    );
  }

  const getEventIcon = (event) => {
    switch (event.event_type) {
      case "ORIGINAL_REVIEW":
        return event.is_passed ? (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 size={16} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/30">
            <AlertTriangle size={16} />
          </div>
        );
      case "SLA_BREACH":
      case "BREACH_TRIGGERED":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/30">
            <AlertTriangle size={16} />
          </div>
        );
      case "RETRY_REVIEW":
      case "RETRY_ATTEMPT":
        return event.is_passed ? (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 size={16} />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/30">
            <RefreshCw size={16} />
          </div>
        );
      case "SLA_RESOLVED":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck size={16} />
          </div>
        );
      case "SLA_EXHAUSTED":
        return (
          <div className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/30">
            <XCircle size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/30">
            <UserCheck size={16} />
          </div>
        );
    }
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
      {timeline.map((item, index) => {
        return (
          <div key={item.id || index} className="relative flex items-start gap-4">
            {/* Timeline node icon */}
            <div className="absolute -left-6 shrink-0 z-10 bg-background rounded-full">
              {getEventIcon(item)}
            </div>

            {/* Event Content Box */}
            <div
              className="flex-1 rounded-xl p-4 border"
              style={{
                background: "var(--cleaner-surface, #FFFFFF)",
                borderColor: "var(--cleaner-border, #E5E7EB)",
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-2">
                  <h4
                    className="text-sm font-bold"
                    style={{ color: "var(--cleaner-title, #111827)" }}
                  >
                    {item.title}
                  </h4>

                  {typeof item.score === "number" && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        item.is_passed
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-500/15 text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.score.toFixed(1)} / 10 ({item.is_passed ? "Passed" : "Failed"})
                    </span>
                  )}
                </div>

                <span
                  className="text-xs flex items-center gap-1 font-medium"
                  style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                >
                  <Clock size={12} />
                  {formatDateTime12Hr(item.timestamp)}
                </span>
              </div>

              <p
                className="text-xs leading-relaxed"
                style={{ color: "var(--cleaner-subtitle, #4B5563)" }}
              >
                {item.description}
              </p>

              {item.cleaner_name && (
                <div className="mt-2 text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                  <span>Inspector / Cleaner:</span>
                  <span className="text-foreground font-semibold">{item.cleaner_name}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
