"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  Droplets,
  Settings2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Activity,
  Search,
  Building2,
  Save,
  Info,
} from "lucide-react";
import { useGetLimits, useSetLimit } from "../systemLimits.queries";

// Ensure we always show these cards even if DB is empty for a company
const DEFAULT_KEYS = [
  "MAX_WASHROOMS",
  "MAX_USERS",
  "MAX_CLEANERS",
  "MAX_SUPERVISORS",
  "MAX_WASHROOMS_PER_CLEANER",
  "MAX_CLEANERS_PER_WASHROOM",
];

export default function LimitsDashboard() {
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [activeCompanyId, setActiveCompanyId] = useState("global");

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  // 🔄 React Query Hooks
  const { data: fetchedLimits = [], isLoading } = useGetLimits(activeCompanyId);
  const { mutate: setLimit, isPending: isUpdating } = useSetLimit();

  // Merge fetched data with default keys to guarantee UI layout
  const limits = DEFAULT_KEYS.map((key) => {
    const found = fetchedLimits.find((d) => d.limit_key === key);
    return (
      found || {
        limit_key: key,
        limit_value: 0,
        current_value: 0,
        is_enabled: false,
      }
    );
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveCompanyId(
      companyIdInput.trim() === "" ? "global" : companyIdInput.trim(),
    );
  };

  const handleSaveLimit = (limitKey, isEnabled) => {
    const payload = {
      limit_key: limitKey,
      limit_value: parseInt(editValue) || 0,
      is_enabled: isEnabled,
      company_id: activeCompanyId === "global" ? null : activeCompanyId,
    };

    setLimit(payload, {
      onSuccess: () => setEditingKey(null),
    });
  };

  // UI Helpers
  const getIcon = (key) => {
    if (key.includes("WASHROOM"))
      return <Droplets className="w-5 h-5 text-blue-500" />;
    if (key.includes("CLEANER"))
      return <Activity className="w-5 h-5 text-emerald-500" />;
    if (key.includes("USER") || key.includes("SUPERVISOR"))
      return <Users className="w-5 h-5 text-indigo-500" />;
    return <Settings2 className="w-5 h-5 text-slate-500" />;
  };

  const formatTitle = (key) => {
    return key
      .replace(/_/g, " ")
      .replace("MAX", "Max")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-100px)] p-6 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <ShieldAlert className="w-8 h-8 text-blue-600" />
              SaaS Limits Controller
            </h1>
            <p className="text-sm text-slate-500 mt-1 font-medium">
              Product Owner Dashboard • Manage quotas and prevent system abuse
            </p>
          </div>

          {/* COMPANY FILTER */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200"
          >
            <div className="flex items-center px-3 gap-2 border-r border-slate-100">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target
              </span>
            </div>
            <input
              type="text"
              placeholder="Company ID (Leave empty for Global)"
              value={companyIdInput}
              onChange={(e) => setCompanyIdInput(e.target.value)}
              className="px-2 py-1 outline-none text-sm font-semibold w-64 text-slate-800"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* INFO BANNER */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong className="font-bold block mb-1">
              Viewing limits for:{" "}
              {activeCompanyId === "global"
                ? "Global System Default"
                : `Company ID ${activeCompanyId}`}
            </strong>
            Changes applied here take effect immediately for all subsequent API
            requests. Relational limits (e.g., Cleaners per Washroom) only
            restrict new assignments.
          </div>
        </div>

        {/* LOADING STATE */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 h-48 animate-pulse border border-slate-100"
              >
                <div className="w-10 h-10 bg-slate-200 rounded-xl mb-4"></div>
                <div className="w-3/4 h-4 bg-slate-200 rounded mb-2"></div>
                <div className="w-1/2 h-8 bg-slate-200 rounded mt-6"></div>
              </div>
            ))}
          </div>
        ) : (
          /* CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {limits.map((limit) => {
              const isEditing = editingKey === limit.limit_key;

              let percentage = 0;
              if (limit.limit_value > 0) {
                percentage = Math.min(
                  100,
                  Math.round((limit.current_value / limit.limit_value) * 100),
                );
              }

              let progressColor = "bg-emerald-500";
              let textColor = "text-emerald-600";
              let bgColor = "bg-emerald-50";

              if (percentage >= 75) {
                progressColor = "bg-amber-500";
                textColor = "text-amber-600";
                bgColor = "bg-amber-50";
              }
              if (percentage >= 95) {
                progressColor = "bg-red-500";
                textColor = "text-red-600";
                bgColor = "bg-red-50";
              }
              if (!limit.is_enabled || limit.limit_value === 0) {
                progressColor = "bg-slate-300";
                textColor = "text-slate-500";
                bgColor = "bg-slate-100";
                percentage = 0;
              }

              const isRelationalLimit = limit.limit_key.includes("_PER_");

              return (
                <div
                  key={limit.limit_key}
                  className={`bg-white rounded-2xl border ${isEditing ? "border-blue-400 shadow-md ring-4 ring-blue-50" : "border-slate-200"} shadow-sm overflow-hidden flex flex-col relative transition-all hover:shadow-md hover:border-slate-300 group`}
                >
                  <div
                    className={`h-1.5 w-full ${limit.is_enabled ? progressColor : "bg-slate-200"}`}
                  ></div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border ${bgColor} border-white/50`}
                        >
                          {getIcon(limit.limit_key)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-[14px] leading-tight">
                            {formatTitle(limit.limit_key)}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${limit.is_enabled ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}
                          >
                            {limit.is_enabled ? "ENFORCED" : "NOT SET"}
                          </span>
                        </div>
                      </div>

                      {!isEditing ? (
                        <button
                          onClick={() => {
                            setEditingKey(limit.limit_key);
                            setEditValue(limit.limit_value || "");
                          }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="mt-auto">
                      {!isEditing ? (
                        <div className="flex items-end justify-between mb-3">
                          {!isRelationalLimit ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
                                {limit.current_value}
                              </span>
                              <span className="text-sm font-bold text-slate-400 mb-0.5">
                                / {limit.limit_value || "∞"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
                                {limit.limit_value || "∞"}
                              </span>
                              <span className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">
                                Max Allowed
                              </span>
                            </div>
                          )}

                          {!isRelationalLimit &&
                            limit.is_enabled &&
                            limit.limit_value > 0 && (
                              <div className={`text-xs font-bold ${textColor}`}>
                                {percentage}%
                              </div>
                            )}
                        </div>
                      ) : (
                        <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                            Set New Limit
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-1.5 text-sm font-bold text-slate-800 border border-slate-300 rounded-md outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                              autoFocus
                            />
                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                handleSaveLimit(limit.limit_key, true)
                              }
                              className="px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="px-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-md flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {!isRelationalLimit && (
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      )}

                      {isRelationalLimit && (
                        <div className="text-[11px] text-slate-400 font-medium italic mt-2">
                          * Relational limit. Applied dynamically during
                          assignments.
                        </div>
                      )}

                      {!isRelationalLimit &&
                        percentage >= 95 &&
                        limit.is_enabled && (
                          <p className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 mt-3">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Action Required: Limit almost exhausted
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
