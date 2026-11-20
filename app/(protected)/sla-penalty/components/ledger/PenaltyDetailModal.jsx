"use client";

import React, { useState } from "react";
import {
  X,
  User,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  ExternalLink
} from "lucide-react";

export default function PenaltyDetailModal({
  penalty,
  onClose,
  onOpenActionModal
}) {
  const [showJsonSnapshot, setShowJsonSnapshot] = useState(false);

  if (!penalty) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
      case "PENDING_APPROVAL":
        return { label: "Pending Approval", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" };
      case "APPROVED":
        return { label: "Approved", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" };
      case "DISPUTED":
        return { label: "Disputed", className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20" };
      case "REJECTED":
        return { label: "Rejected / Waived", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
      case "REVERSED":
        return { label: "Reversed", className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20" };
      default:
        return { label: status, className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20" };
    }
  };

  const statusBadge = getStatusBadge(penalty.status);
  const cleanerUser = penalty.cleaner_user || penalty.cleaner;
  const cleanerName = cleanerUser?.name || `Cleaner #${penalty.cleaner_user_id || penalty.cleaner_id || ""}`;
  const effectiveAmount = penalty.approved_amount ?? penalty.calculated_amount;
  const snapshot = penalty.calculation_snapshot || {};
  const logs = penalty.logs || penalty.penalty_logs || [];
  const review = penalty.review || penalty.violation?.review;
  const beforePhotos = Array.isArray(review?.before_photo) ? review.before_photo : [];
  const afterPhotos = Array.isArray(review?.after_photo) ? review.after_photo : [];
  const reviewImages = [
    ...beforePhotos,
    ...afterPhotos,
    ...(Array.isArray(review?.images) ? review.images : []),
    ...(Array.isArray(penalty.violation?.evidence_references?.photos) ? penalty.violation.evidence_references.photos : [])
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {penalty.penalty_number}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Created on {formatDate(penalty.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[calc(85vh-140px)] overflow-y-auto text-xs">
          {/* Status Transparency Banner for Cleaner & Supervisor */}
          <div className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-start gap-3 ${
            penalty.status === "APPROVED"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : penalty.status === "REVERSED"
              ? "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800 text-cyan-900 dark:text-cyan-200"
              : penalty.status === "DISPUTED"
              ? "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200"
              : penalty.status === "REJECTED"
              ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
          }`}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm">
                {penalty.status === "APPROVED" && "Status: Approved & Confirmed"}
                {penalty.status === "REVERSED" && "Status: Automatically Waived & Reversed"}
                {penalty.status === "DISPUTED" && "Status: Under Dispute Inquiry"}
                {penalty.status === "REJECTED" && "Status: Waived / Dismissed by Management"}
                {(penalty.status === "PENDING" || penalty.status === "PENDING_APPROVAL") && "Status: Awaiting Supervisor Review"}
              </div>
              <p>
                {penalty.status === "APPROVED" && `This deduction of ₹${Number(effectiveAmount).toFixed(2)} has been confirmed by management and processed into financial records.`}
                {penalty.status === "REVERSED" && (penalty.reversal_reason || "This penalty was automatically waived because the cleaner re-cleaned the facility and passed the inspection threshold (Score ≥ 7.0).")}
                {penalty.status === "DISPUTED" && (penalty.dispute_reason ? `Dispute reason: "${penalty.dispute_reason}". Currently under investigation.` : "A dispute inquiry has been submitted and is currently being investigated.")}
                {penalty.status === "REJECTED" && (penalty.rejection_reason ? `Waived by supervisor: "${penalty.rejection_reason}".` : "This penalty deduction was waived under management discretion.")}
                {(penalty.status === "PENDING" || penalty.status === "PENDING_APPROVAL") && "This penalty is currently pending supervisor review. Note: If the cleaner conducts a re-cleaning and achieves a passing score (≥ 7.0), this penalty will be automatically waived."}
              </p>
            </div>
          </div>

          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cleaner & Location Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Subject & Facility
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold overflow-hidden">
                  {cleanerUser?.avatar_url ? (
                    <img src={cleanerUser.avatar_url} alt={cleanerName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {cleanerName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cleanerUser?.phone || "No phone recorded"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{penalty.location?.name || "Facility"} {penalty.location?.address ? `(${penalty.location.address})` : ""}</span>
              </div>

              {penalty.cleaner_pending_amount !== undefined && (
                <div className="text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Total Pending on Cleaner:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    ₹{Number(penalty.cleaner_pending_amount || 0).toFixed(2)} ({penalty.cleaner_pending_count || 0} pending)
                  </span>
                </div>
              )}
            </div>

            {/* Financial Overview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Financial Assessment
              </span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">Final Deduction:</span>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  ₹{Number(effectiveAmount || 0).toFixed(2)}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div className="flex justify-between">
                  <span>Calculated Amount:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">₹{Number(penalty.calculated_amount || 0).toFixed(2)}</span>
                </div>
                {penalty.base_task_value && (
                  <div className="flex justify-between">
                    <span>Base Task Value:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">₹{Number(penalty.base_task_value).toFixed(2)}</span>
                  </div>
                )}
                {penalty.approved_amount !== null && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Approved Amount:</span>
                    <span>₹{Number(penalty.approved_amount).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rule & Formula Snapshot */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Breached Contract Rule
                </span>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                  {penalty.rule?.name || penalty.rule_code}
                </h4>
              </div>
              <span className="px-2 py-0.5 rounded-lg text-xs font-mono bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {penalty.rule_code}
              </span>
            </div>

            {snapshot.formula && (
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-semibold text-blue-600 dark:text-blue-400">Formula: </span>
                {snapshot.formula}
              </div>
            )}

            {/* Toggle Raw JSON Snapshot */}
            <div>
              <button
                type="button"
                onClick={() => setShowJsonSnapshot(!showJsonSnapshot)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
              >
                {showJsonSnapshot ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showJsonSnapshot ? "Hide Technical Snapshot" : "View Full Calculation Snapshot (Audit JSON)"}
              </button>

              {showJsonSnapshot && (
                <pre className="mt-2 p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(snapshot, null, 2)}
                </pre>
              )}
            </div>
          </div>

          {/* Inspection Evidence (if associated review exists) */}
          {review ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Inspection Evidence & Review #{review.id}
                  </span>
                  {review.created_at && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Conducted on {formatDate(review.created_at)}
                    </div>
                  )}
                </div>
                <a
                  href={`/cleaners/${review.id}?companyId=${penalty.company_id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Review Inspection ↗
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400">Hygiene Score: </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {Number(review.score || penalty.violation?.score || 0).toFixed(1)} / 10
                  </span>
                </div>
                {review.attempt_no && (
                  <div>
                    <span className="text-slate-400">Attempt: </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      #{review.attempt_no} ({review.review_type || "Routine"})
                    </span>
                  </div>
                )}
                {penalty.violation?.threshold && (
                  <div>
                    <span className="text-slate-400">Required Threshold: </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      ≥ {Number(penalty.violation.threshold).toFixed(1)}/10
                    </span>
                  </div>
                )}
                {review.delay_minutes > 0 && (
                  <div>
                    <span className="text-slate-400">Delay: </span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {review.delay_minutes} minutes
                    </span>
                  </div>
                )}
              </div>

              {/* Inspection Comments */}
              {(review.initial_comment || review.final_comment) && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
                  {review.initial_comment && (
                    <div>
                      <span className="font-semibold text-slate-500">Initial Note: </span>
                      <span className="text-slate-700 dark:text-slate-300">{review.initial_comment}</span>
                    </div>
                  )}
                  {review.final_comment && (
                    <div>
                      <span className="font-semibold text-slate-500">Cleaner / Inspector Comment: </span>
                      <span className="text-slate-700 dark:text-slate-300 italic">"{review.final_comment}"</span>
                    </div>
                  )}
                </div>
              )}

              {/* Photos */}
              {reviewImages && reviewImages.length > 0 ? (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Review Photos ({reviewImages.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Click to open full photo</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {reviewImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-blue-500 transition-all"
                      >
                        <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center">
                          <ExternalLink className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No inspection photos attached.</p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-1 text-xs">
              <span className="font-semibold uppercase tracking-wider text-slate-400 text-[11px]">
                Shift / Daily Performance Quota
              </span>
              <p className="text-slate-600 dark:text-slate-300">
                This penalty is assessed based on aggregated daily quota performance (e.g. minimum cleanings per day schedule requirement) rather than a single inspection review.
              </p>
            </div>
          )}

          {/* Append-Only Audit Trail Log */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Audit History & State Transitions ({logs.length})
            </span>

            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No historical logs recorded.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {logs.map((log) => {
                  const fromStatus = log.previous_status || log.from_status;
                  const toStatus = log.new_status || log.to_status;
                  const actorName = log.actor_user?.name || log.actor?.name || "System Automated";
                  const commentText = log.comment || log.comments;

                  return (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                      <div className="text-xs font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="font-semibold">{log.action}</span>
                        {fromStatus && toStatus && (
                          <span className="text-slate-400 font-mono text-[10px]">
                            ({fromStatus} → {toStatus})
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {formatDate(log.created_at)} · {actorName}
                      </div>
                      {commentText && (
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                          {commentText}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {(penalty.status === "PENDING" || penalty.status === "PENDING_APPROVAL" || penalty.status === "DISPUTED") && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenActionModal(penalty, "REJECT");
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                >
                  {penalty.status === "DISPUTED" ? "Accept Dispute & Waive" : "Reject / Waive"}
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenActionModal(penalty, "APPROVE");
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  {penalty.status === "DISPUTED" ? "Resolve Dispute: Uphold" : "Approve Penalty"}
                </button>
              </>
            )}

            {(penalty.status === "PENDING" || penalty.status === "PENDING_APPROVAL" || penalty.status === "APPROVED") && penalty.status !== "DISPUTED" && (
              <button
                onClick={() => {
                  onClose();
                  onOpenActionModal(penalty, "DISPUTE");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition-colors cursor-pointer"
              >
                Dispute
              </button>
            )}

            {penalty.status === "APPROVED" && (
              <button
                onClick={() => {
                  onClose();
                  onOpenActionModal(penalty, "REVERSE");
                }}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 transition-colors"
              >
                Reverse Penalty
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

