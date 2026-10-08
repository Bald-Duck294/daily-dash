"use client";

import { User, MapPin, Clock, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import SlaScoreProgression from "./SlaScoreProgression";
import { getTimeElapsed, getSlaStateBadge } from "../utils/slaActivityUtils";

/**
 * ONE CARD = ONE CLEANING ACTIVITY / SLA LIFECYCLE
 */
export default function SlaCleanerActivityCard({
  activity,
  onNavigateDetail,
}) {
  const isCompleted = activity.status === "completed";
  const badge = getSlaStateBadge(activity.sla_state);

  const totalPhotos = activity.total_photos_count || 0;
  const previewPhotos = activity.preview_photos || [];
  const remainingPhotosCount = totalPhotos > 2 ? totalPhotos - 2 : 0;

  const hasRetries = activity.attempts_count > 1 || activity.sla_state !== "NO_BREACH";

  return (
    <div
      className="rounded-xl p-4 flex flex-col h-full transition-all duration-200 hover:shadow-md"
      style={{
        background: "var(--cleaner-surface, #FFFFFF)",
        border: "1px solid var(--cleaner-border, #E5E7EB)",
        boxShadow: "var(--cleaner-shadow, 0 1px 3px rgba(0,0,0,0.05))",
      }}
    >
      {/* ================= CARD HEADER: CLEANER & STATUS ================= */}
      <div className="flex items-start justify-between gap-2 mb-3">
        {/* Cleaner Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "var(--cleaner-header-icon-bg, #FFF7ED)",
              border: "1px solid var(--cleaner-header-icon-border, #FFEDD5)",
            }}
          >
            <User
              size={14}
              style={{ color: "var(--cleaner-header-icon-fg, #EA580C)" }}
            />
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-semibold truncate max-w-[130px] sm:max-w-[160px]"
              style={{ color: "var(--cleaner-title, #111827)" }}
              title={activity.cleaner_user?.name || "Cleaner"}
            >
              {activity.cleaner_user?.name || "Cleaner"}
            </p>
            <p
              className="text-[10px]"
              style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
            >
              STAFF MEMBER
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span
            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
            style={{
              background: isCompleted
                ? "var(--cleaner-status-active-bg, #DCFCE7)"
                : "var(--cleaner-status-inactive-bg, #FEF3C7)",
              color: isCompleted
                ? "var(--cleaner-status-active-text, #15803D)"
                : "var(--cleaner-status-inactive-text, #B45309)",
            }}
          >
            {activity.status}
          </span>

          {/* Latest Score Badge */}
          {typeof activity.latest_score === "number" && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide flex items-center gap-1"
              style={{
                background: "var(--cleaner-input-bg, #F3F4F6)",
                color: "var(--cleaner-title, #111827)",
                border: "1px solid var(--cleaner-border, #E5E7EB)",
              }}
            >
              ⭐ {activity.latest_score.toFixed(1)} / <b>10</b>
            </span>
          )}
        </div>
      </div>

      {/* ================= SLA STATUS BAR ================= */}
      <div
        className="rounded-lg px-2.5 py-1.5 mb-2.5 flex items-center justify-between text-xs border"
        style={{
          background: badge.bg,
          borderColor: badge.border,
          color: badge.text,
        }}
      >
        <div className="flex items-center gap-1.5 font-medium truncate">
          {activity.sla_state === "RESOLVED" && <CheckCircle2 size={13} className="shrink-0" />}
          {activity.sla_state === "EXHAUSTED" && <XCircle size={13} className="shrink-0" />}
          {activity.sla_state === "RETRY_IN_PROGRESS" && <RefreshCw size={13} className="shrink-0 animate-spin" style={{ animationDuration: '4s' }} />}
          {activity.sla_state === "BREACHED" && <AlertTriangle size={13} className="shrink-0" />}
          {activity.sla_state === "NO_BREACH" && <ShieldCheck size={13} className="shrink-0" />}
          <span className="truncate text-[11px] font-semibold">{badge.label}</span>
        </div>

        {hasRetries && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 shrink-0">
            Retry {activity.retry_display}
          </span>
        )}
      </div>

      {/* ================= RETRY SCORE PROGRESSION ================= */}
      {hasRetries ? (
        <SlaScoreProgression
          scoreProgression={activity.score_progression}
          attempts={activity.attempts}
        />
      ) : (
        <div className="my-1 text-[11px] flex items-center justify-between px-2 py-1 rounded bg-muted/40 text-muted-foreground">
          <span>Review Type:</span>
          <span className="font-semibold text-foreground">Original (Single Attempt)</span>
        </div>
      )}

      {/* ================= EVIDENCE LOGS ================= */}
      <div className="my-1.5">
        <p
          className="text-[10px] mb-1 uppercase tracking-wider font-semibold"
          style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
        >
          EVIDENCE LOGS ({totalPhotos} Photos)
        </p>

        <div className="flex items-center gap-1.5">
          {previewPhotos.slice(0, 2).map((img, i) => (
            <img
              key={i}
              src={img}
              alt="Evidence"
              className="w-8 h-8 rounded-md object-cover shrink-0"
              style={{ border: "1px solid var(--cleaner-border, #E5E7EB)" }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ))}

          {remainingPhotosCount > 0 && (
            <div
              className="w-8 h-8 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0"
              style={{
                background: "var(--cleaner-kpi-value, #FFB800)",
                color: "#000000",
              }}
            >
              +{remainingPhotosCount}
            </div>
          )}

          {totalPhotos === 0 && (
            <span className="text-[10px] text-muted-foreground italic">
              No photos uploaded
            </span>
          )}
        </div>
      </div>

      {/* ================= LOCATION & TIME ================= */}
      <div
        className="rounded-lg p-2.5 mb-3 mt-auto"
        style={{
          background: "var(--cleaner-input-bg, #F9FAFB)",
          border: "1px solid var(--cleaner-border, #E5E7EB)",
        }}
      >
        <p
          className="text-xs font-medium flex items-center gap-1.5"
          style={{ color: "var(--cleaner-title, #111827)" }}
        >
          <MapPin size={12} className="shrink-0 text-orange-500" />
          <span className="truncate">{activity.location?.name || "Washroom"}</span>
        </p>
        <p
          className="text-[10px] mt-1 pl-4"
          style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
        >
          Started: {new Date(activity.started_at).toLocaleString()}
        </p>
        {activity.status === "ongoing" && (
          <p
            className="text-[10px] mt-0.5 pl-4 flex items-center gap-1 font-medium"
            style={{ color: "var(--cleaner-primary-text, #EA580C)" }}
          >
            <Clock size={10} />
            {getTimeElapsed(activity.started_at)}
          </p>
        )}
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="mt-auto pt-1">
        <button
          onClick={() => onNavigateDetail(activity.activity_id)}
          className="w-full py-1.5 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 hover:opacity-90 active:scale-[0.99]"
          style={{
            background: "var(--cleaner-primary-bg, #EA580C)",
            color: "var(--cleaner-primary-text, #FFFFFF)",
          }}
        >
          Detailed Report →
        </button>
      </div>
    </div>
  );
}
