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
      });
    } else if (isOpen) {
      const existingSla = location?.sla_config || location?.metadata?.sla;
      if (existingSla) {
        setIsEnabled(Boolean(existingSla.enabled));
        setConfig({
          threshold_score: existingSla.threshold_score ?? 8,
          max_retry_attempts: existingSla.max_retry_attempts ?? 1,
        });
      } else {
        setIsEnabled(false);
        setConfig({
          threshold_score: 8,
          max_retry_attempts: 1,
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
    }

    try {
      await updateMutation.mutateAsync({
        locationId: location.id,
        configData: {
          enabled: isEnabled,
          is_active: isEnabled,
          threshold_score: Number(config.threshold_score),
          max_retry_attempts: Number(config.max_retry_attempts),
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
          "Failed to update SLA configuration"
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Washroom SLA Configuration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {location?.name || "Washroom"} (ID: {location?.id})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center">
              <Loader size="medium" />
            </div>
          ) : (
            <WashroomSLAForm
              isEnabled={isEnabled}
              setIsEnabled={setIsEnabled}
              config={config}
              setConfig={setConfig}
              isSaving={updateMutation.isPending}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
