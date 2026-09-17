"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import {
  useWashroomSlaConfig,
  useUpdateWashroomSlaConfig,
} from "@/features/companies/queries/sla.queries";
import WashroomSLAForm from "./WashroomSLAForm";

export default function WashroomSLAConfigModal({ location, isOpen, onClose }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [config, setConfig] = useState({
    threshold_score: 8,
    max_retry_attempts: 1,
    notify_cleaner: true,
    notify_supervisor: true,
    max_score_updates_per_activity: 1,
  });

  const { data: slaData, isLoading, refetch } = useWashroomSlaConfig(
    location?.id,
    isOpen
  );
  const updateMutation = useUpdateWashroomSlaConfig();

  useEffect(() => {
    if (slaData) {
      setIsEnabled(Boolean(slaData.enabled));
      const c = slaData.configuration || slaData;
      setConfig({
        threshold_score: c.threshold_score ?? 8,
        max_retry_attempts: c.max_retry_attempts ?? 1,
        notify_cleaner: c.notify_cleaner ?? true,
        notify_supervisor: c.notify_supervisor ?? true,
        max_score_updates_per_activity: c.max_score_updates_per_activity ?? 1,
      });
    } else if (isOpen) {
      const existingSla = location?.metadata?.sla;
      if (existingSla) {
        setIsEnabled(Boolean(existingSla.enabled));
        setConfig({
          threshold_score: existingSla.threshold_score ?? 8,
          max_retry_attempts: existingSla.max_retry_attempts ?? 1,
          notify_cleaner: existingSla.notify_cleaner ?? true,
          notify_supervisor: existingSla.notify_supervisor ?? true,
          max_score_updates_per_activity:
            existingSla.max_score_updates_per_activity ?? 1,
        });
      } else {
        setIsEnabled(false);
        setConfig({
          threshold_score: 8,
          max_retry_attempts: 1,
          notify_cleaner: true,
          notify_supervisor: true,
          max_score_updates_per_activity: 1,
        });
      }
    }
  }, [slaData, isOpen, location]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (isEnabled) {
      if (config.threshold_score < 0 || config.threshold_score > 10) {
        return toast.error("Threshold Score must be between 0 and 10");
      }
      if (config.max_retry_attempts < 0) {
        return toast.error("Maximum Retry Attempts must be at least 0");
      }
      if (config.max_score_updates_per_activity < 1) {
        return toast.error(
          "Maximum Score Updates Per Activity must be at least 1"
        );
      }
    }

    try {
      await updateMutation.mutateAsync({
        locationId: location.id,
        configData: {
          enabled: isEnabled,
          ...config,
        },
      });
      toast.success(
        isEnabled
          ? "Washroom SLA Configuration Updated Successfully."
          : "Washroom SLA Disabled Successfully."
      );
      await refetch();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to update washroom SLA configuration."
      );
    }
  };

  const isSaving = updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              SLA Configuration
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">
              {location?.name || "Washroom"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="medium" />
            </div>
          ) : (
            <WashroomSLAForm
              isEnabled={isEnabled}
              setIsEnabled={setIsEnabled}
              config={config}
              setConfig={setConfig}
              isSaving={isSaving}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
