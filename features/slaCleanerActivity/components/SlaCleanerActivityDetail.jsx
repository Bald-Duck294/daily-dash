"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Layers,
  Award,
  Activity as ActivityIcon,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

import {
  useSlaCleanerActivityById,
} from "../slaCleanerActivity.queries";
import SlaTimeline from "./SlaTimeline";
import SlaAttemptTabs from "./SlaAttemptTabs";
import SlaVisualEvidence from "./SlaVisualEvidence";
import SlaPhotoModal from "./SlaPhotoModal";
import { formatDateTime12Hr, getSlaStateBadge } from "../utils/slaActivityUtils";

export default function SlaCleanerActivityDetail({ activityId, companyId }) {
  useRequirePermission(MODULES.CLEANER_REVIEWS);

  const router = useRouter();
  const [selectedAttemptIndex, setSelectedAttemptIndex] = useState(0);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  // TanStack Query
  const { data: activity, isLoading, isError, error } = useSlaCleanerActivityById(activityId);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "var(--cleaner-bg, #F9FAFB)" }}
      >
        <div className="flex flex-col items-center text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4"
            style={{
              borderColor: "var(--cleaner-kpi-value, #EA580C)",
              borderTopColor: "transparent",
            }}
          />
          <p className="text-sm font-semibold" style={{ color: "var(--cleaner-title, #111827)" }}>
            Loading SLA Activity Lifecycle...
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--cleaner-subtitle, #6B7280)" }}>
            Fetching attempt chain, audit trail, and photo evidence
          </p>
        </div>
      </div>
    );
  }

  if (isError || !activity) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ background: "var(--cleaner-bg, #F9FAFB)" }}
      >
        <div
          className="max-w-md w-full text-center rounded-xl p-8 border"
          style={{
            background: "var(--cleaner-surface, #FFFFFF)",
            borderColor: "var(--cleaner-border, #E5E7EB)",
            boxShadow: "var(--cleaner-shadow, 0 1px 3px rgba(0,0,0,0.05))",
          }}
        >
          <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center bg-red-500/10 text-red-500">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-base font-bold mb-2">Activity Not Found</h2>
          <p className="text-xs text-muted-foreground mb-6">
            The requested SLA cleaning activity could not be found or may have been removed.
          </p>
          <button
            onClick={() => router.push(companyId ? `/slaCleanerActivity?companyId=${companyId}` : "/slaCleanerActivity")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to SLA Cleaner Activity
          </button>
        </div>
      </div>
    );
  }

  const attempts = activity.attempts || [];
  const currentAttempt = attempts[selectedAttemptIndex] || attempts[0];
  const badge = getSlaStateBadge(activity.sla_state);

  return (
    <>
      <Toaster position="top-center" />

      {/* Photo Viewer Modal */}
      {selectedPhotoIndex !== null && currentAttempt && (
        <SlaPhotoModal
          photos={{
            before: currentAttempt.before_photo || [],
            after: currentAttempt.after_photo || [],
          }}
          initialIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
        />
      )}

      <div
        className="min-h-screen p-3 sm:p-5 lg:p-6"
        style={{
          background: "var(--cleaner-bg, #F9FAFB)",
          color: "var(--cleaner-title, #111827)",
        }}
      >
        <div className="max-w-6xl mx-auto space-y-5">
          {/* ================= HEADER ================= */}
          <div
            className="rounded-xl p-5 border"
            style={{
              background: "var(--cleaner-surface, #FFFFFF)",
              borderColor: "var(--cleaner-border, #E5E7EB)",
              boxShadow: "var(--cleaner-shadow, 0 1px 3px rgba(0,0,0,0.05))",
            }}
          >
            {/* Back button */}
            <button
              onClick={() => router.push(companyId ? `/slaCleanerActivity?companyId=${companyId}` : "/slaCleanerActivity")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition mb-3 cursor-pointer border bg-muted/40 hover:bg-muted"
            >
              <ArrowLeft size={13} />
              Back to SLA Cleaner Activity
            </button>

            {/* Title & SLA Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold">
                    Cleaning Activity – {activity.cleaner_user?.name || "Cleaner"}
                  </h1>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                    style={{
                      background: badge.bg,
                      borderColor: badge.border,
                      color: badge.text,
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                  <MapPin size={13} className="text-orange-500" />
                  <span>{activity.location?.name || "Washroom"}</span>
                  {activity.location?.location_types?.name && (
                    <span className="opacity-75">({activity.location.location_types.name})</span>
                  )}
                </p>
              </div>

              {/* Latest score banner */}
              {typeof activity.latest_score === "number" && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl border bg-muted/40 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Latest Score</p>
                    <p className="text-base font-extrabold text-foreground">
                      {activity.latest_score.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">/ 10</span>
                    </p>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                      activity.latest_score >= activity.sla_threshold
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/20 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {activity.latest_score >= activity.sla_threshold ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      <AlertTriangle size={20} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ================= SLA SUMMARY KPI CARDS ================= */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. SLA Status */}
            <div className="rounded-xl p-3.5 border bg-card space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">SLA Status</p>
              <p className="text-xs font-extrabold truncate" style={{ color: badge.text }}>
                {activity.sla_status_label}
              </p>
            </div>

            {/* 2. Attempts */}
            <div className="rounded-xl p-3.5 border bg-card space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Attempts</p>
              <p className="text-sm font-extrabold">
                {activity.attempts_count} <span className="text-xs text-muted-foreground font-normal">/ {activity.max_retries + 1}</span>
              </p>
            </div>

            {/* 3. Original Score */}
            <div className="rounded-xl p-3.5 border bg-card space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Original Score</p>
              <p className="text-sm font-extrabold text-foreground">
                {typeof activity.original_score === "number" ? `${activity.original_score.toFixed(1)} / 10` : "N/A"}
              </p>
            </div>

            {/* 4. Latest Score */}
            <div className="rounded-xl p-3.5 border bg-card space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Latest Score</p>
              <p className="text-sm font-extrabold text-foreground">
                {typeof activity.latest_score === "number" ? `${activity.latest_score.toFixed(1)} / 10` : "N/A"}
              </p>
            </div>

            {/* 5. Triggered At */}
            <div className="rounded-xl p-3.5 border bg-card space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Started</p>
              <p className="text-xs font-semibold truncate text-muted-foreground">
                {formatDateTime12Hr(activity.started_at)}
              </p>
            </div>

            {/* 6. Completed / Due */}
            <div className="rounded-xl p-3.5 border bg-card space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {activity.escalation?.resolved_at ? "Resolved At" : "Completed"}
              </p>
              <p className="text-xs font-semibold truncate text-muted-foreground">
                {formatDateTime12Hr(activity.completed_at)}
              </p>
            </div>
          </div>

          {/* ================= MAIN CONTENT 2-COL GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* ===== LEFT COLUMN: ATTEMPT DETAILS & VISUAL EVIDENCE (7 cols) ===== */}
            <div className="lg:col-span-7 space-y-5">
              {/* Attempt Switcher & Overview */}
              <SlaAttemptTabs
                attempts={attempts}
                selectedAttemptIndex={selectedAttemptIndex}
                onSelectAttempt={setSelectedAttemptIndex}
                slaThreshold={activity.sla_threshold}
              />

              {/* Visual Evidence Photos strictly for the selected attempt */}
              {currentAttempt && (
                <SlaVisualEvidence
                  beforePhotos={currentAttempt.before_photo || []}
                  afterPhotos={currentAttempt.after_photo || []}
                  attemptLabel={currentAttempt.label}
                  onPhotoClick={(photoIdx) => setSelectedPhotoIndex(photoIdx)}
                />
              )}
            </div>

            {/* ===== RIGHT COLUMN: LIFECYCLE AUDIT TIMELINE (5 cols) ===== */}
            <div className="lg:col-span-5 space-y-5">
              <div
                className="rounded-xl p-5 border space-y-4"
                style={{
                  background: "var(--cleaner-surface, #FFFFFF)",
                  borderColor: "var(--cleaner-border, #E5E7EB)",
                }}
              >
                <div className="flex items-center justify-between pb-2 border-b">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <ActivityIcon size={16} className="text-orange-500" />
                    Activity & SLA Timeline
                  </h3>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    Target: {activity.sla_threshold}/10
                  </span>
                </div>

                <SlaTimeline
                  timeline={activity.timeline || []}
                  slaThreshold={activity.sla_threshold}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
