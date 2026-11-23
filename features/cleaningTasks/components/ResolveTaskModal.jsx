"use client";

import React, { useState } from "react";
import { X, CheckCircle2, Loader2, MessageSquare } from "lucide-react";
import { useUpdateRequestStatus } from "../cleaningTasks.queries";

export default function ResolveTaskModal({ isOpen, onClose, request }) {
  const [resolutionNotes, setResolutionNotes] = useState("");
  const updateMutation = useUpdateRequestStatus();

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(
      {
        id: request.id,
        status: "resolved",
        resolution_notes: resolutionNotes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setResolutionNotes("");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Mark Task Resolved
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ticket #{request.id} • {request.location?.name || "Washroom"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-xs text-slate-600 dark:text-slate-300 space-y-2">
            <div>
              Are you sure you want to mark this cleaning ticket as{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">Resolved</strong>?
            </div>
            {request.assigned_cleaner && (
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-[11px] text-slate-500">
                Cleaned by: <strong>{request.assigned_cleaner.name}</strong>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Resolution Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Washroom thoroughly cleaned, floor disinfected, soap refilled..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Resolving...
                </>
              ) : (
                "Confirm Resolution"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
