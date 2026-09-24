"use client";

import React, { useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, Save, Bell, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import {
  useCompanySlaConfig,
  useEnableSla,
  useDisableSla,
  useUpdateSlaConfig,
} from "@/features/companies/queries/sla.queries";

function CompanySlaFormContent({
  companyId,
  companyName,
  isEnabled,
  config,
  refetch,
  isSaving,
  enableMutation,
  disableMutation,
  updateMutation,
}) {
  const [threshold, setThreshold] = useState(() => Number(config.threshold_score ?? 8.0));
  const [maxRetries, setMaxRetries] = useState(() => Number(config.max_retry_attempts ?? 2));
  const [maxUpdates, setMaxUpdates] = useState(() => Number(config.max_score_updates_per_activity ?? 1));
  const [notifyCleaner, setNotifyCleaner] = useState(() => config.notify_cleaner !== false);
  const [notifySupervisor, setNotifySupervisor] = useState(() => config.notify_supervisor !== false);

  const handleToggleSla = async (checked) => {
    if (!companyId) return;
    try {
      if (checked) {
        await enableMutation.mutateAsync(companyId);
        toast.success(`SLA enabled for ${companyName}`);
      } else {
        await disableMutation.mutateAsync(companyId);
        toast.success(`SLA disabled for ${companyName}`);
      }
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to toggle organization SLA");
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    try {
      await updateMutation.mutateAsync({
        companyId,
        configData: {
          threshold_score: parseFloat(threshold),
          max_retry_attempts: parseInt(maxRetries, 10),
          max_score_updates_per_activity: parseInt(maxUpdates, 10),
          notify_cleaner: notifyCleaner,
          notify_supervisor: notifySupervisor,
        },
      });
      toast.success("Organization SLA baseline updated!");
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update SLA configuration");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isEnabled
                ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
            }`}
          >
            {isEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Organization Master SLA
              </h3>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Org ID: #{companyId}
              </span>
              <span
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                  isEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                }`}
              >
                {isEnabled ? "Master SLA: ACTIVE" : "Master SLA: INACTIVE"}
              </span>
              {config?.escalation?.enabled && (
                <a
                  href="#escalation-hierarchy-section"
                  className="px-2 py-0.5 text-[11px] font-bold rounded-full border bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800 hover:opacity-85 transition-opacity"
                >
                  Escalation ({config.escalation.levels?.length || 0} Levels) ↓
                </a>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{companyName}</span> &bull; Governs organization-wide cleaning standards and serves as default fallback.
            </p>
          </div>
        </div>

        {/* Master Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggleSla(e.target.checked)}
            disabled={isSaving}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Form Body */}
      <form onSubmit={handleSaveConfig} className="space-y-4 pt-4 flex-1 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Threshold Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Company Baseline Threshold (0 – 10)
              </label>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800">
                {Number(threshold).toFixed(1)} / 10
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>0 (Off)</span>
              <span>8.0 (Company Default)</span>
              <span>10.0 (Max)</span>
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
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                value={maxUpdates}
                onChange={(e) => setMaxUpdates(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notification Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-blue-500" />
              Notifications
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={notifyCleaner}
                onChange={(e) => setNotifyCleaner(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Notify Cleaner on Clear App</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={notifySupervisor}
                onChange={(e) => setNotifySupervisor(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <span>Notify Supervisor</span>
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
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Baseline SLA"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CompanySlaCard({ selectedCompany }) {
  const companyId = selectedCompany?.id ? String(selectedCompany.id) : null;
  const companyName = selectedCompany?.name || "Selected Organization";

  // Fetch company SLA config
  const { data: slaData, isLoading, refetch } = useCompanySlaConfig(companyId, Boolean(companyId));

  const enableMutation = useEnableSla();
  const disableMutation = useDisableSla();
  const updateMutation = useUpdateSlaConfig();

  if (!companyId) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 text-center py-12">
        <Shield className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
          No Organization Selected
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Select an organization from the dropdown above to view and configure its Master SLA.
        </p>
      </div>
    );
  }

  const isEnabled = Boolean(slaData?.enabled);
  const config = slaData?.configuration || {};
  const isSaving = updateMutation.isPending || enableMutation.isPending || disableMutation.isPending;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full">
      {isLoading ? (
        <div className="flex justify-center items-center py-16 flex-1">
          <Loader size="medium" />
        </div>
      ) : (
        <CompanySlaFormContent
          key={`${companyId}-${isEnabled}-${config.threshold_score}`}
          companyId={companyId}
          companyName={companyName}
          isEnabled={isEnabled}
          config={config}
          refetch={refetch}
          isSaving={isSaving}
          enableMutation={enableMutation}
          disableMutation={disableMutation}
          updateMutation={updateMutation}
        />
      )}
    </div>
  );
}
