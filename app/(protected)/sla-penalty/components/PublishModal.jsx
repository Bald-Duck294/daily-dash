"use client";

import React from "react";
import { X, Send, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function PublishModal({
  isOpen,
  onClose,
  onConfirm,
  book,
  isPublishing = false
}) {
  if (!isOpen || !book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Publish Rule Book Version {book.version}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            You are about to publish <strong className="text-slate-900 dark:text-white">"{book.name}" (Version {book.version})</strong> with <strong className="text-slate-900 dark:text-white">{book.rules?.length || 0} active rule clauses</strong>.
          </p>

          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <div className="space-y-1">
              <span className="font-bold">Audit Immutability:</span>
              <p className="text-[11px] leading-relaxed">
                Once published, this rule book will be permanently locked against changes to guarantee financial auditability. Any currently active version will be safely archived.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {isPublishing ? "Publishing..." : "Confirm & Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}
