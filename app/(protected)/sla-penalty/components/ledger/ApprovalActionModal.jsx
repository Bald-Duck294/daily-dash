"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  IndianRupee,
  FileText
} from "lucide-react";

export default function ApprovalActionModal({
  penalty,
  actionType = "APPROVE", // "APPROVE" | "REJECT" | "DISPUTE" | "REVERSE"
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false
}) {
  if (!isOpen || !penalty) return null;

  const [amount, setAmount] = useState(
    penalty.calculated_amount !== undefined ? String(penalty.calculated_amount) : "0"
  );
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (actionType === "APPROVE") {
      onSubmit({
        approved_amount: Number(amount) || Number(penalty.calculated_amount),
        comments: comments.trim() || undefined
      });
    } else if (actionType === "REJECT") {
      if (!reason.trim()) return;
      onSubmit({
        rejection_reason: reason.trim()
      });
    } else if (actionType === "DISPUTE") {
      if (!reason.trim()) return;
      onSubmit({
        reason: reason.trim(),
        dispute_notes: notes.trim() || undefined
      });
    } else if (actionType === "REVERSE") {
      if (!reason.trim()) return;
      onSubmit({
        reason: reason.trim()
      });
    }
  };

  const getActionConfig = () => {
    switch (actionType) {
      case "APPROVE":
        return {
          title: "Approve SLA Penalty",
          subtitle: `Confirm financial deduction for ${penalty.penalty_number}`,
          icon: CheckCircle2,
          iconBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
          submitButton: "Approve & Deduct",
          buttonBg: "bg-emerald-600 hover:bg-emerald-700 text-white"
        };
      case "REJECT":
        return {
          title: "Reject / Waive Penalty",
          subtitle: `Dismiss financial deduction for ${penalty.penalty_number}`,
          icon: XCircle,
          iconBg: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
          submitButton: "Reject Penalty",
          buttonBg: "bg-rose-600 hover:bg-rose-700 text-white"
        };
      case "DISPUTE":
        return {
          title: "Flag for Dispute",
          subtitle: `Initiate dispute inquiry for ${penalty.penalty_number}`,
          icon: AlertTriangle,
          iconBg: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
          submitButton: "Submit Dispute",
          buttonBg: "bg-amber-600 hover:bg-amber-700 text-white"
        };
      case "REVERSE":
        return {
          title: "Reverse Approved Penalty",
          subtitle: `Refund or roll back approved deduction for ${penalty.penalty_number}`,
          icon: RotateCcw,
          iconBg: "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400",
          submitButton: "Reverse Deduction",
          buttonBg: "bg-cyan-600 hover:bg-cyan-700 text-white"
        };
      default:
        return {
          title: "Action",
          subtitle: penalty.penalty_number,
          icon: FileText,
          iconBg: "bg-blue-500/10 text-blue-600",
          submitButton: "Confirm",
          buttonBg: "bg-blue-600 hover:bg-blue-700 text-white"
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${config.iconBg}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {config.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {config.subtitle}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Quick summary strip */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Cleaner: </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {penalty.cleaner?.name || `Cleaner #${penalty.cleaner_id}`}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Calculated: </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  ₹{Number(penalty.calculated_amount || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* If APPROVE: Amount & Comments */}
            {actionType === "APPROVE" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Approved Deduction Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full pl-8 pr-4 py-2.5 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You can reduce or adjust the amount under supervisor discretion if necessary.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Approval Comments (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="e.g., Reviewed inspection evidence, penalty confirmed."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                  />
                </div>
              </>
            )}

            {/* If REJECT: Mandatory Reason */}
            {actionType === "REJECT" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rejection / Waiver Justification <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="State the reason why this penalty deduction is being waived or rejected..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-colors resize-none"
                />
              </div>
            )}

            {/* If DISPUTE: Reason & Notes */}
            {actionType === "DISPUTE" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Dispute Reason <span className="text-amber-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    placeholder="e.g., Cleaner claims water supply outage caused delay"
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Investigation Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide any additional context or claims..."
                    className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors resize-none"
                  />
                </div>
              </>
            )}

            {/* If REVERSE: Reason */}
            {actionType === "REVERSE" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Reversal Justification <span className="text-cyan-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  placeholder="Explain why this approved penalty deduction is being reversed / refunded..."
                  className="w-full px-3 py-2 text-sm rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-colors resize-none"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || ((actionType === "REJECT" || actionType === "DISPUTE" || actionType === "REVERSE") && !reason.trim())}
              className={`px-5 py-2 text-sm font-medium rounded-xl shadow-sm disabled:opacity-50 transition-colors ${config.buttonBg}`}
            >
              {isSubmitting ? "Processing..." : config.submitButton}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
