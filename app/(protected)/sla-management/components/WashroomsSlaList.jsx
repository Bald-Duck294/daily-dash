"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Lock,
  Sparkles,
  Edit3,
  Eye,
  X,
  Power,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useUpdateWashroomSlaConfig } from "@/features/companies/queries/sla.queries";

export default function WashroomsSlaList({
  locations = [],
  companySlaEnabled = false,
  companyThreshold = 8.0,
  companyMaxRetries = 2,
  selectedWashroomId,
  onSelectWashroom,
  onEditWashroom,
  canUpdate = true,
}) {
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'custom' | 'inherited' | 'disabled'
  const [viewingWashroom, setViewingWashroom] = useState(null);
  const [togglingLocationId, setTogglingLocationId] = useState(null);

  const updateMutation = useUpdateWashroomSlaConfig();

  // Compute status for each washroom
  const enrichedLocations = useMemo(() => {
    return locations.map((loc) => {
      const cfg = loc.sla_config || {};

      let status = "disabled";
      let effectiveThreshold = 0;
      let label = "Disabled";
      let isToggleOn = false;

      if (!companySlaEnabled) {
        status = "disabled";
        label = "Org SLA Off";
        effectiveThreshold = 0;
        isToggleOn = false;
      } else if (cfg.enabled === false || cfg.is_active === false) {
        status = "disabled";
        label = "SLA Disabled";
        effectiveThreshold = 0;
        isToggleOn = false;
      } else if (cfg.enabled === true || cfg.is_active === true) {
        status = "custom";
        label = "Custom Override";
        effectiveThreshold = Number(cfg.threshold_score ?? companyThreshold ?? 8.0);
        isToggleOn = true;
      } else {
        // cfg is null or not customized -> inherits org SLA
        status = "inherited";
        label = "Inheriting Org SLA";
        effectiveThreshold = Number(companyThreshold ?? 8.0);
        isToggleOn = true;
      }

      return {
        ...loc,
        hasCustom: status === "custom",
        status,
        label,
        isToggleOn,
        effectiveThreshold,
        maxRetries:
          status === "custom"
            ? Number(cfg.max_retry_attempts ?? companyMaxRetries ?? 2)
            : Number(companyMaxRetries ?? 2),
      };
    });
  }, [locations, companySlaEnabled, companyThreshold, companyMaxRetries]);

  // Counts
  const counts = useMemo(() => {
    const total = enrichedLocations.length;
    const custom = enrichedLocations.filter((l) => l.status === "custom").length;
    const inherited = enrichedLocations.filter((l) => l.status === "inherited").length;
    const disabled = enrichedLocations.filter((l) => l.status === "disabled").length;
    return { total, custom, inherited, disabled };
  }, [enrichedLocations]);

  // Filtered list
  const filteredLocations = useMemo(() => {
    return enrichedLocations.filter((loc) => {
      const matchesSearch =
        loc.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(loc.id).includes(search) ||
        (loc.code && loc.code.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterMode === "custom") return loc.status === "custom";
      if (filterMode === "inherited") return loc.status === "inherited";
      if (filterMode === "disabled") return loc.status === "disabled";
      return true;
    });
  }, [enrichedLocations, search, filterMode]);

  // Direct toggle SLA on/off for a washroom
  const handleToggleSla = async (loc, e) => {
    e.stopPropagation();

    if (!companySlaEnabled) {
      toast.error("Cannot toggle washroom SLA because Organization Master SLA is OFF.");
      return;
    }

    if (!canUpdate) {
      toast.error("You do not have permission to update SLA settings.");
      return;
    }

    const nextState = !loc.isToggleOn;
    setTogglingLocationId(loc.id);

    try {
      const payload = {
        enabled: nextState,
        is_active: nextState,
        threshold_score: Number(loc.effectiveThreshold || companyThreshold || 8.0),
        max_retry_attempts: Number(loc.maxRetries || companyMaxRetries || 2),
      };

      await updateMutation.mutateAsync({
        locationId: loc.id,
        configData: payload,
      });

      toast.success(
        nextState
          ? `SLA Enabled for "${loc.name}" (Active threshold: ${payload.threshold_score}/10)`
          : `SLA Disabled for "${loc.name}"`
      );
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to toggle SLA for this washroom"
      );
    } finally {
      setTogglingLocationId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Washroom SLAs & Active Configuration
            </h3>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {counts.total} Washrooms
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Toggle SLA status directly on/off per washroom or click <strong>Configure</strong> to adjust threshold overrides.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, code, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-5 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => setFilterMode("all")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
            filterMode === "all"
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm border border-slate-200/80 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-100 cursor-pointer"
          }`}
        >
          All ({counts.total})
        </button>
        <button
          onClick={() => setFilterMode("inherited")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            filterMode === "inherited"
              ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 shadow-sm border border-slate-200/80 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-100 cursor-pointer"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          Inheriting Org SLA ({counts.inherited})
        </button>
        <button
          onClick={() => setFilterMode("custom")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            filterMode === "custom"
              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm border border-slate-200/80 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-100 cursor-pointer"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Custom Overrides ({counts.custom})
        </button>
        <button
          onClick={() => setFilterMode("disabled")}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
            filterMode === "disabled"
              ? "bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 shadow-sm border border-slate-200/80 dark:border-slate-600"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-100 cursor-pointer"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500" />
          SLA Disabled ({counts.disabled})
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-5 py-3 w-28">Location ID</th>
              <th className="px-5 py-3">Washroom Name</th>
              <th className="px-5 py-3 w-36 text-center">SLA Switch</th>
              <th className="px-5 py-3">SLA Status</th>
              <th className="px-5 py-3">Effective Threshold</th>
              <th className="px-5 py-3">Max Retries</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLocations.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                  No washrooms found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredLocations.map((loc) => {
                const isSelected = String(loc.id) === String(selectedWashroomId);
                const isToggling = String(loc.id) === String(togglingLocationId);

                return (
                  <tr
                    key={loc.id}
                    className={`transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/50 ${
                      isSelected
                        ? "bg-blue-50/40 dark:bg-blue-950/20 border-l-4 border-l-blue-600"
                        : ""
                    }`}
                  >
                    {/* Location ID */}
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        #{loc.id}
                      </span>
                    </td>

                    {/* Name & Code */}
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {loc.name}
                      </div>
                      {loc.code && (
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Code: {loc.code}
                        </div>
                      )}
                    </td>

                    {/* Direct SLA Toggle Switch */}
                    <td className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        <label
                          className={`relative inline-flex items-center ${
                            !companySlaEnabled || !canUpdate || isToggling
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                          title={
                            !companySlaEnabled
                              ? "Company SLA is OFF. Enable Company SLA first."
                              : loc.isToggleOn
                              ? "Click to switch SLA OFF for this washroom"
                              : "Click to switch SLA ON for this washroom"
                          }
                        >
                          <input
                            type="checkbox"
                            checked={loc.isToggleOn && companySlaEnabled}
                            disabled={!companySlaEnabled || !canUpdate || isToggling}
                            onChange={(e) => handleToggleSla(loc, e)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                        <span className="text-[10px] font-bold text-slate-500 w-7 text-left">
                          {loc.isToggleOn && companySlaEnabled ? "ON" : "OFF"}
                        </span>
                      </div>
                    </td>

                    {/* SLA Status Badge */}
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold text-[11px] border ${
                          loc.status === "custom"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                            : loc.status === "inherited"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800"
                            : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}
                      >
                        {loc.status === "custom" ? (
                          <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        ) : loc.status === "inherited" ? (
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Lock className="w-3 h-3 text-slate-400" />
                        )}
                        {loc.label}
                      </span>
                    </td>

                    {/* Breach Threshold */}
                    <td className="px-5 py-3.5">
                      {loc.status === "disabled" ? (
                        <span className="text-slate-400 text-xs italic">Disabled</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 dark:text-white text-xs">
                            {loc.effectiveThreshold.toFixed(1)}
                          </span>
                          <span className="text-slate-400 text-[10px]">/ 10</span>
                          {loc.status === "custom" && (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium ml-1">
                              (Custom)
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Max Retries */}
                    <td className="px-5 py-3.5">
                      {loc.status === "disabled" ? (
                        <span className="text-slate-400 text-xs">-</span>
                      ) : (
                        <span className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                          {loc.maxRetries} {loc.maxRetries === 1 ? "retry" : "retries"}
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingWashroom(loc)}
                          title="View SLA Details"
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditWashroom?.(loc)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Configure</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Quick View Modal */}
      {viewingWashroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Washroom SLA Details
                </h4>
                <p className="text-xs text-slate-500">
                  Location ID: #{viewingWashroom.id}
                </p>
              </div>
              <button
                onClick={() => setViewingWashroom(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Washroom:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {viewingWashroom.name}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">SLA Status:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {viewingWashroom.label}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Effective Threshold:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {viewingWashroom.status === "disabled"
                    ? "N/A (Disabled)"
                    : `${viewingWashroom.effectiveThreshold.toFixed(1)} / 10`}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Max Retry Attempts:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {viewingWashroom.status === "disabled" ? "0" : viewingWashroom.maxRetries}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setViewingWashroom(null)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const target = viewingWashroom;
                  setViewingWashroom(null);
                  onEditWashroom?.(target);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Configure / Edit SLA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
