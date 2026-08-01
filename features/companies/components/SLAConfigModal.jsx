"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/ui/Loader";
import { 
  useCompanySlaConfig, 
  useEnableSla, 
  useDisableSla, 
  useUpdateSlaConfig 
} from "../queries/sla.queries";

export default function SLAConfigModal({ company, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [isEnabled, setIsEnabled] = useState(false);
  const [config, setConfig] = useState({
    threshold_score: 8,
    max_retry_attempts: 1,
    notify_cleaner: true,
    notify_supervisor: true,
    max_score_updates_per_activity: 1
  });

  const { data: slaData, isLoading, refetch } = useCompanySlaConfig(company?.id, isOpen);
  const enableMutation = useEnableSla();
  const disableMutation = useDisableSla();
  const updateMutation = useUpdateSlaConfig();

  useEffect(() => {
    if (slaData) {
      setIsEnabled(slaData.enabled);
      if (slaData.configuration) {
        setConfig({
          threshold_score: slaData.configuration.threshold_score ?? 8,
          max_retry_attempts: slaData.configuration.max_retry_attempts ?? 1,
          notify_cleaner: slaData.configuration.notify_cleaner ?? true,
          notify_supervisor: slaData.configuration.notify_supervisor ?? true,
          max_score_updates_per_activity: slaData.configuration.max_score_updates_per_activity ?? 1
        });
      }
    } else if (isOpen) {
      // reset defaults if opened
      setIsEnabled(false);
    }
  }, [slaData, isOpen]);

  if (!isOpen) return null;

  const handleToggle = async () => {
    try {
      if (isEnabled) {
        await disableMutation.mutateAsync(company.id);
        setIsEnabled(false);
        toast.success("SLA Disabled Successfully.");
      } else {
        await enableMutation.mutateAsync(company.id);
        setIsEnabled(true);
        toast.success("SLA Enabled Successfully.");
        await refetch();
      }
      queryClient.invalidateQueries({ queryKey: ["sla-statuses"] });
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to toggle SLA status.");
    }
  };

  const handleSave = async () => {
    if (!isEnabled) {
      onClose();
      return;
    }
    
    if (config.threshold_score < 0 || config.threshold_score > 10) {
      return toast.error("Threshold Score must be between 0 and 10");
    }
    if (config.max_retry_attempts < 0) {
      return toast.error("Maximum Retry Attempts must be at least 0");
    }
    if (config.max_score_updates_per_activity < 1) {
      return toast.error("Maximum Score Updates Per Activity must be at least 1");
    }

    try {
      await updateMutation.mutateAsync({ companyId: company.id, configData: config });
      toast.success("SLA Configuration Updated Successfully.");
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || "Failed to update SLA configuration.");
    }
  };

  const isMutating = enableMutation.isPending || disableMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">SLA Configuration</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{company?.name}</p>
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
            <div className="space-y-6">
              
              {/* Enable Toggle Section */}
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Enable SLA</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Activate SLA engine for this company</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={isEnabled}
                    onChange={handleToggle}
                    disabled={isMutating}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {!isEnabled ? (
                <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  SLA is currently disabled for this company.
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* SLA Rules Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">SLA Rules</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Threshold Score (0-10)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={config.threshold_score}
                          onChange={(e) => setConfig({ ...config, threshold_score: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                          Max Retry Attempts
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={config.max_retry_attempts}
                          onChange={(e) => setConfig({ ...config, max_retry_attempts: Number(e.target.value) })}
                          className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Supervisor Rules Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Supervisor Rules</h3>
                    
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Max Score Updates Per Activity
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={config.max_score_updates_per_activity}
                        onChange={(e) => setConfig({ ...config, max_score_updates_per_activity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Notifications Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Notifications</h3>
                    
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.notify_cleaner}
                          onChange={(e) => setConfig({ ...config, notify_cleaner: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Notify Cleaner</span>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={config.notify_supervisor}
                          onChange={(e) => setConfig({ ...config, notify_supervisor: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Notify Supervisor</span>
                      </label>
                    </div>
                  </div>

                </div>
              )}
            </div>
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
            disabled={isMutating || isLoading}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
          >
            {isMutating ? "Saving..." : "Save"}
          </button>
        </div>

      </div>
    </div>
  );
}
