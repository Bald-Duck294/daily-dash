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
  FileText,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon
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
  const cleanerName = penalty.cleaner?.name || `Cleaner #${penalty.cleaner_id}`;
  const effectiveAmount = penalty.approved_amount ?? penalty.calculated_amount;
  const snapshot = penalty.calculation_snapshot || {};
  const logs = penalty.penalty_logs || [];
  const review = penalty.violation?.review;
  const reviewImages = review?.images || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {penalty.penalty_number}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusBadge.className}`}>
                  {statusBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Created on {formatDate(penalty.created_at)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[calc(85vh-160px)] overflow-y-auto">
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
                  {penalty.cleaner?.avatar_url ? (
                    <img src={penalty.cleaner.avatar_url} alt={cleanerName} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
                    {cleanerName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {penalty.cleaner?.phone || "No phone recorded"}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{penalty.location?.name || "Facility"} {penalty.location?.address ? `(${penalty.location.address})` : ""}</span>
              </div>
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
          {review && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Inspection Evidence
              </span>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Hygiene Score: </span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {Number(review.score || 0).toFixed(1)} / 10
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Inspection Type: </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {review.inspection_type || "Routine"}
                  </span>
                </div>
                {review.delay_minutes > 0 && (
                  <div>
                    <span className="text-slate-400">Delay: </span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      {review.delay_minutes} minutes
                    </span>
                  </div>
                )}
              </div>

              {/* Photos */}
              {reviewImages && reviewImages.length > 0 ? (
                <div>
                  <div className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Review Photos ({reviewImages.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {reviewImages.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noreferrer"
                        className="aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:opacity-90 transition-opacity"
                      >
                        <img src={img} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No inspection photos attached.</p>
              )}
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
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white dark:ring-slate-900" />
                    <div className="text-xs font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="font-semibold">{log.action}</span>
                      {log.from_status && log.to_status && (
                        <span className="text-slate-400 font-mono text-[10px]">
                          ({log.from_status} → {log.to_status})
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {formatDate(log.created_at)} · {log.actor?.name || "System Automated"}
                    </div>
                    {log.comments && (
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                        {log.comments}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {penalty.status === "PENDING_APPROVAL" && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenActionModal(penalty, "REJECT");
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                >
                  Reject / Waive
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenActionModal(penalty, "APPROVE");
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
                >
                  Approve Penalty
                </button>
              </>
            )}

            {(penalty.status === "PENDING_APPROVAL" || penalty.status === "APPROVED") && (
              <button
                onClick={() => {
                  onClose();
                  onOpenActionModal(penalty, "DISPUTE");
                }}
                className="px-4 py-2 text-sm font-medium rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-900 transition-colors"
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
                className="px-4 py-2 text-sm font-medium rounded-xl text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 transition-colors"
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

