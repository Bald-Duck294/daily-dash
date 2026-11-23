"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, AlertCircle, Loader2 } from "lucide-react";
import { useToiletCleaners, useAssignCleaner } from "../cleaningTasks.queries";

export default function AssignCleanerModal({ isOpen, onClose, request }) {
  const [cleanerId, setCleanerId] = useState("");
  const [notes, setNotes] = useState("");

  const locationId = request?.location_id;
  const { data: cleanersRes, isLoading: cleanersLoading } = useToiletCleaners(
    locationId,
    isOpen && Boolean(locationId)
  );

  const cleaners = cleanersRes?.data || [];
  const assignMutation = useAssignCleaner();

  // Reset or pre-fill cleanerId when opening modal
  useEffect(() => {
    if (isOpen) {
      if (request?.assigned_cleaner?.id) {
        setCleanerId(String(request.assigned_cleaner.id));
      } else {
        setCleanerId("");
      }
      setNotes("");
    }
  }, [isOpen, request?.id, request?.assigned_cleaner?.id]);

  // If cleaner not yet selected and cleaners list is available, auto-select
  useEffect(() => {
    if (isOpen && cleaners.length > 0 && !cleanerId) {
      setCleanerId(String(cleaners[0].id));
    }
  }, [isOpen, cleaners, cleanerId]);

  if (!isOpen || !request) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cleanerId) return;

    assignMutation.mutate(
      {
        request_id: request.id,
        cleaner_id: cleanerId,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onClose();
          setNotes("");
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Allocate Cleaning Task
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ticket #{request.id} • {request.location?.name || request.locations?.name || "Washroom"}
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
          {/* Issue summary */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-xs space-y-1">
            <div className="font-medium text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              Reported Issues:
            </div>
            <div className="text-amber-800 dark:text-amber-200 pl-5">
              {Array.isArray(request.issues) && request.issues.length > 0
                ? request.issues.join(", ")
                : request.issue_type || request.description || "General cleaning required"}
            </div>
          </div>

          {/* Cleaner selection */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Assigned Toilet Cleaners <span className="text-red-500">*</span>
            </label>
            {cleanersLoading ? (
              <div className="flex items-center gap-2 py-3 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                Loading toilet cleaners...
              </div>
            ) : cleaners.length === 0 ? (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300">
                No active cleaners mapped to this washroom. Please check User Mapping first.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {cleaners.map((c) => (
                  <label
                    key={c.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      String(cleanerId) === String(c.id)
                        ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200"
                        : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="cleaner"
                        value={c.id}
                        checked={String(cleanerId) === String(c.id)}
                        onChange={(e) => setCleanerId(e.target.value)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-white">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {c.phone || c.email || "No contact info"}
                        </div>
                      </div>
                    </div>
                    {c.facility_company && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        {c.facility_company.name}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Supervisor Instructions */}
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Supervisor Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Please sanitize booth 2 immediately and restock soap..."
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-600 focus:outline-none"
            />
          </div>

          {/* Actions */}
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
              disabled={!cleanerId || assignMutation.isPending || cleaners.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition"
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Assigning & Notifying...
                </>
              ) : (
                "Allocate & Notify Cleaner"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
