"use client";

import React, { useState } from "react";
import {
  GitFork,
  Plus,
  Save,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import {
  useCompanySlaConfig,
  useUpdateSlaConfig,
} from "@/features/companies/queries/sla.queries";
import { createDefaultLevel } from "./escalationConstants";
import { validateEscalationLadder } from "./escalationValidation";
import EscalationLevelItem from "./EscalationLevelItem";
import EscalationVisualTimeline from "./EscalationVisualTimeline";

function EscalationFormContent({
  companyId,
  companyName,
  config,
  refetch,
  updateMutation,
}) {
  const escalationConfig = config?.escalation || {};
  const [isEnabled, setIsEnabled] = useState(
    () => escalationConfig.enabled !== false
  );
  const [levels, setLevels] = useState(() => {
    if (Array.isArray(escalationConfig.levels) && escalationConfig.levels.length > 0) {
      return escalationConfig.levels.map((lvl, idx) => ({
        level: idx + 1,
        target_role: lvl.target_role || "cleaner",
        delay_minutes: Number(lvl.delay_minutes ?? 0),
        send_notification: lvl.send_notification !== false,
      }));
    }
    return [
      { level: 1, target_role: "cleaner", delay_minutes: 0, send_notification: true },
      { level: 2, target_role: "supervisor", delay_minutes: 120, send_notification: true },
      { level: 3, target_role: "admin", delay_minutes: 240, send_notification: true },
    ];
  });

  const [maxRetries, setMaxRetries] = useState(
    () => Number(config.max_retry_attempts ?? 2)
  );

  const validation = validateEscalationLadder(levels, isEnabled, maxRetries);
  const isSaving = updateMutation.isPending;

  const handleAddLevel = () => {
    if (levels.length >= 10) {
      toast.error("Maximum 10 escalation levels allowed");
      return;
    }
    const prevDelay = levels.length > 0 ? levels[levels.length - 1].delay_minutes : 0;
    const newLevel = createDefaultLevel(levels.length + 1, prevDelay);
    setLevels((prev) => [...prev, newLevel]);
    toast.success(`Added Level ${newLevel.level} (${newLevel.target_role})`);
  };

  const handleRemoveLevel = (index) => {
    if (levels.length <= 1) {
      toast.error("At least one escalation level is required");
      return;
    }
    const removedLevelNum = index + 1;
    setLevels((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((lvl, idx) => ({ ...lvl, level: idx + 1 }))
    );
    toast.success(`Removed Level ${removedLevelNum}`);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setLevels((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy.map((lvl, idx) => ({ ...lvl, level: idx + 1 }));
    });
  };

  const handleMoveDown = (index) => {
    if (index >= levels.length - 1) return;
    setLevels((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy.map((lvl, idx) => ({ ...lvl, level: idx + 1 }));
    });
  };

  const handleUpdateLevel = (index, updates) => {
    setLevels((prev) =>
      prev.map((lvl, i) => (i === index ? { ...lvl, ...updates } : lvl))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyId) {
      toast.error("Company not selected");
      return;
    }

    if (!validation.isValid) {
      toast.error(validation.firstError || "Please resolve validation errors first");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        companyId,
        configData: {
          max_retry_attempts: parseInt(maxRetries, 10),
          escalation: {
            enabled: isEnabled,
            levels: levels.map((lvl, idx) => ({
              level: idx + 1,
              target_role: lvl.target_role,
              delay_minutes: Number(lvl.delay_minutes),
              send_notification: Boolean(lvl.send_notification),
            })),
          },
        },
      });
      toast.success("Escalation ladder updated successfully!");
      refetch();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update escalation hierarchy"
      );
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400">
            <GitFork className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                SLA Escalation & Corrective Routing
              </h3>
              <span
                className={`px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                  isEnabled
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                    : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}
              >
                {isEnabled ? "Escalation: ACTIVE" : "Escalation: DISABLED"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Governs automated level transitions and alert routing when SLA breaches occur.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isEnabled ? "Enabled" : "Disabled"}
          </span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              disabled={isSaving}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>

      {/* Global Retry Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
            Max Corrective Retries Allowed
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={maxRetries}
            onChange={(e) => setMaxRetries(e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">
            Max physical corrective attempts on Clear App before state changes to EXHAUSTED.
          </p>
        </div>

        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Active Ladder Summary</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {levels.length} Escalation Level{levels.length > 1 ? "s" : ""} configured &bull; Max delay:{" "}
            {levels.length > 0 ? `${levels[levels.length - 1].delay_minutes} mins` : "None"}
          </p>
        </div>
      </div>

      {/* Visual Timeline Preview */}
      <EscalationVisualTimeline levels={levels} isEnabled={isEnabled} />

      {/* Ladder Builder Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Escalation Level Ladder
          </h4>
          <p className="text-xs text-slate-500">
            Configure order, recipient roles, and chronological notification delays.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddLevel}
          disabled={isSaving || levels.length >= 10 || !isEnabled}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Escalation Level
        </button>
      </div>

      {/* Level Items List */}
      <div className="space-y-3">
        {levels.map((lvl, idx) => (
          <EscalationLevelItem
            key={`${idx}-${lvl.level}`}
            level={lvl}
            index={idx}
            totalLevels={levels.length}
            prevDelay={idx > 0 ? levels[idx - 1].delay_minutes : 0}
            onUpdate={handleUpdateLevel}
            onRemove={handleRemoveLevel}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            disabled={isSaving || !isEnabled}
          />
        ))}
      </div>

      {/* Validation Alert */}
      {!validation.isValid && isEnabled && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <span className="font-bold">Hierarchy Configuration Error:</span>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              {validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isSaving}
          className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Changes
        </button>
        <button
          type="submit"
          disabled={isSaving || (!validation.isValid && isEnabled)}
          className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? "Saving Ladder..." : "Save Escalation Hierarchy"}
        </button>
      </div>
    </form>
  );
}

export default function EscalationConfigCard({ selectedCompany }) {
  const companyId = selectedCompany?.id ? String(selectedCompany.id) : null;
  const companyName = selectedCompany?.name || "Selected Organization";

  const { data: slaData, isLoading, refetch } = useCompanySlaConfig(
    companyId,
    Boolean(companyId)
  );
  const updateMutation = useUpdateSlaConfig();

  if (!companyId) return null;

  const config = slaData?.configuration || {};

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader size="medium" />
        </div>
      ) : (
        <EscalationFormContent
          key={`${companyId}-${config?.escalation?.enabled}-${config?.escalation?.levels?.length}`}
          companyId={companyId}
          companyName={companyName}
          config={config}
          refetch={refetch}
          updateMutation={updateMutation}
        />
      )}
    </div>
  );
}
