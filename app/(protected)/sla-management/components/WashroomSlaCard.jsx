"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  Lock,
  Save,
  Bell,
  RefreshCw,
  Info,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import {
  useWashroomSlaConfig,
  useUpdateWashroomSlaConfig,
} from "@/features/companies/queries/sla.queries";

function WashroomSlaFormContent({
  washroomId,
  washroomName,
  washroomCode,
  companySlaEnabled,
  companyThreshold,
  initialData,
  refetch,
  isSaving,
  updateMutation,
}) {
  const [isEnabled, setIsEnabled] = useState(() => Boolean(initialData?.enabled));
  const [thresholdScore, setThresholdScore] = useState(() =>
    Number(initialData?.threshold_score ?? 7.0)
  );
  const [maxRetryAttempts, setMaxRetryAttempts] = useState(() =>
    Number(initialData?.max_retry_attempts ?? 1)
  );
  const [maxScoreUpdates, setMaxScoreUpdates] = useState(() =>
    Number(initialData?.max_score_updates_per_activity ?? 1)
  );
  const [notifyCleaner, setNotifyCleaner] = useState(
    () => initialData?.notify_cleaner !== false
  );
  const [notifySupervisor, setNotifySupervisor] = useState(
    () => initialData?.notify_supervisor !== false
  );

  const handleSave = async (e) => {
    e.preventDefault();

    if (!companySlaEnabled && isEnabled) {
      toast.error(
        "Cannot enable Washroom SLA because Organization Master SLA is OFF. Enable Organization SLA first."
      );
      return;
    }

    if (thresholdScore < 0 || thresholdScore > 10) {
      toast.error("Threshold Score must be between 0.0 and 10.0");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        locationId: washroomId,
        configData: {
          enabled: isEnabled,
          threshold_score: parseFloat(thresholdScore),
          max_retry_attempts: parseInt(maxRetryAttempts, 10),
          max_score_updates_per_activity: parseInt(maxScoreUpdates, 10),
          notify_cleaner: notifyCleaner,
          notify_supervisor: notifySupervisor,
        },
      });

      toast.success(
        isEnabled
          ? `Washroom SLA updated: ${thresholdScore.toFixed(1)}/10 threshold active!`
          : "Washroom custom SLA disabled. Reverted to Organization fallback."
      );
      await refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update washroom SLA configuration"
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              !companySlaEnabled
                ? "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                : isEnabled
                ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                : "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            }`}
          >
            {!companySlaEnabled ? (
              <Lock className="w-6 h-6" />
            ) : isEnabled ? (
              <CheckCircle2 className="w-6 h-6" />
            ) : (
              <Sparkles className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Single Washroom SLA
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
               ID: #{washroomId}
              </span>
              <span
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                  !companySlaEnabled
                    ? "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    : isEnabled
                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                }`}
              >
                {!companySlaEnabled
                  ? "LOCKED"
                  : isEnabled
                  ? "CUSTOM OVERRIDE"
                  : "INHERITING ORG SLA"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{washroomName}</span> {washroomCode ? `(${washroomCode})` : ""}
            </p>
          </div>
        </div>

        {/* Custom Override Toggle Switch */}
        <div className="flex flex-col items-end gap-1">
          <label
            className={`relative inline-flex items-center ${
              !companySlaEnabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              checked={isEnabled && companySlaEnabled}
              disabled={!companySlaEnabled || isSaving}
              onChange={(e) => {
                if (!companySlaEnabled) return;
                setIsEnabled(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-[10px] text-slate-400 font-medium">
            {isEnabled && companySlaEnabled ? "Override ON" : "Override OFF"}
          </span>
        </div>
      </div>

      {/* Lock Notice if Organization Master SLA is Disabled */}
      {!companySlaEnabled && (
        <div className="my-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold">Organization Master SLA is Disabled</p>
            <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
              Single washroom SLA can only be enabled when the parent organization’s Master SLA is active.
              Toggle the Master SLA switch on the left to unlock this washroom configuration.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className={`space-y-4 pt-4 flex-1 flex flex-col justify-between ${
          !companySlaEnabled ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <div className="space-y-4">
          {/* Inheritance Banner when Override is OFF but Org SLA is ON */}
          {companySlaEnabled && !isEnabled && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                This washroom currently inherits the organization baseline threshold of{" "}
                <strong className="text-slate-900 dark:text-white">
                  {companyThreshold.toFixed(1)} / 10
                </strong>
                . Turn on the switch above to set a custom threshold for this washroom.
              </p>
            </div>
          )}

          {/* Threshold Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                Washroom Breach Threshold (1.0 – 10.0)
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                {Number(thresholdScore).toFixed(1)} / 10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={thresholdScore}
              disabled={!isEnabled || !companySlaEnabled}
              onChange={(e) => setThresholdScore(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1.0 (Strict)</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">
                {Number(thresholdScore).toFixed(1)} (Trigger threshold)
              </span>
              <span>10.0 (Lenient)</span>
            </div>
          
          </div>

          {/* Numbers Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Max Retry Attempts
              </label>
              <input
                type="number"
                min="0"
                max="10"
                disabled={!isEnabled || !companySlaEnabled}
                value={maxRetryAttempts}
                onChange={(e) => setMaxRetryAttempts(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Score Updates Allowed
              </label>
              <input
                type="number"
                min="1"
                max="5"
                disabled={!isEnabled || !companySlaEnabled}
                value={maxScoreUpdates}
                onChange={(e) => setMaxScoreUpdates(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
              />
            </div>
          </div>

          {/* Notification Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-500" />
              SLA Breach Notifications
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={notifyCleaner}
                disabled={!isEnabled || !companySlaEnabled}
                onChange={(e) => setNotifyCleaner(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <span>Notify Assigned Cleaner (Push Alert via Clear App)</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={notifySupervisor}
                disabled={!isEnabled || !companySlaEnabled}
                onChange={(e) => setNotifySupervisor(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 disabled:opacity-50"
              />
              <span>Notify Shift Supervisor</span>
            </label>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isSaving}
            className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="submit"
            disabled={isSaving || !companySlaEnabled}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Washroom SLA"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function WashroomSlaCard({
  selectedWashroom,
  companySlaEnabled = false,
  companyThreshold = 8.0,
}) {
  const washroom = selectedWashroom;
  const washroomId = washroom?.id;
  const washroomName = washroom?.name || "Selected Washroom";
  const washroomCode = washroom?.code || "";

  const {
    data: slaData,
    isLoading,
    refetch,
  } = useWashroomSlaConfig(washroomId, Boolean(washroomId));

  const updateMutation = useUpdateWashroomSlaConfig();

  if (!washroomId) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 text-center py-12 flex flex-col items-center justify-center h-full">
        <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Washroom Selected
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          Select a washroom from the dropdown above to view or customize its dedicated SLA threshold and alerts.
        </p>
      </div>
    );
  }

  const isSaving = updateMutation.isPending;

  // Extract initial values from slaData or washroom.sla_config
  const resolvedConfig = slaData?.configuration || slaData || washroom?.sla_config || {};
  const isCustomEnabled = slaData?.enabled !== undefined ? Boolean(slaData.enabled) : Boolean(washroom?.sla_config?.enabled);

  const initialData = {
    enabled: isCustomEnabled,
    threshold_score: resolvedConfig.threshold_score ?? 7.0,
    max_retry_attempts: resolvedConfig.max_retry_attempts ?? 1,
    max_score_updates_per_activity: resolvedConfig.max_score_updates_per_activity ?? 1,
    notify_cleaner: resolvedConfig.notify_cleaner !== false,
    notify_supervisor: resolvedConfig.notify_supervisor !== false,
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full">
      {isLoading ? (
        <div className="flex justify-center items-center py-16 flex-1">
          <Loader size="medium" />
        </div>
      ) : (
        <WashroomSlaFormContent
          key={`${washroomId}-${isCustomEnabled}-${initialData.threshold_score}`}
          washroomId={washroomId}
          washroomName={washroomName}
          washroomCode={washroomCode}
          companySlaEnabled={companySlaEnabled}
          companyThreshold={companyThreshold}
          initialData={initialData}
          refetch={refetch}
          isSaving={isSaving}
          updateMutation={updateMutation}
        />
      )}
    </div>
  );
}
