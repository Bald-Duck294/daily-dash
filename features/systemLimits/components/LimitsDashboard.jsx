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
  Building2,
  Save,
  Info,
  Globe,
} from "lucide-react";
import { useGetLimits, useSetLimit } from "../systemLimits.queries";
import { useCompanies } from "@/features/companies/queries/companies.queries";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [activeCompanyId, setActiveCompanyId] = useState("global");
  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue] = useState("");

  // 🔄 React Query Hooks for Limits
  const { data: fetchedLimits = [], isLoading: loadingLimits } =
    useGetLimits(activeCompanyId);
  const { mutate: setLimit, isPending: isUpdating } = useSetLimit();

  // 🏢 React Query Hook for Companies
  const { data: companiesResponse, isLoading: loadingCompanies } = useCompanies(
    1,
    100,
  );
  const companies = Array.isArray(companiesResponse?.data)
    ? companiesResponse.data
    : Array.isArray(companiesResponse)
      ? companiesResponse
      : [];

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
      return <Droplets className="w-6 h-6 text-blue-500" />;
    if (key.includes("CLEANER"))
      return <Activity className="w-6 h-6 text-emerald-500" />;
    if (key.includes("USER") || key.includes("SUPERVISOR"))
      return <Users className="w-6 h-6 text-indigo-500" />;
    return <Settings2 className="w-6 h-6 text-slate-500" />;
  };

  const formatTitle = (key) => {
    return key
      .replace(/_/g, " ")
      .replace("MAX", "Max")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Get current company name for the banner
  const activeCompanyName =
    activeCompanyId === "global"
      ? "Global System Default"
      : companies.find((c) => c.id.toString() === activeCompanyId)?.name ||
        `Company ID ${activeCompanyId}`;

  return (
    <div className="bg-slate-50 min-h-[calc(100vh-100px)] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* ================= HEADER SECTION ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
              <ShieldAlert className="w-9 h-9 text-blue-600" />
              SaaS Limits Controller
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">
              Product Owner Dashboard • Manage quotas and prevent system abuse
            </p>
          </div>

          {/* ================= COMPANY DROPDOWN FILTER ================= */}
          <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-200 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300 w-full md:w-auto">
            <div className="flex items-center pl-4 pr-3 py-3 gap-2 border-r border-slate-100 bg-slate-50/50 rounded-l-xl">
              {activeCompanyId === "global" ? (
                <Globe className="w-4 h-4 text-blue-500" />
              ) : (
                <Building2 className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target
              </span>
            </div>

            <div className="min-w-[260px]">
              <Select
                value={activeCompanyId}
                onValueChange={setActiveCompanyId}
              >
                <SelectTrigger
                  className="border-0 shadow-none focus:ring-0 bg-transparent w-full font-semibold text-slate-700 h-full py-3 px-4"
                  disabled={loadingCompanies}
                >
                  <SelectValue
                    placeholder={
                      loadingCompanies
                        ? "Loading companies..."
                        : "Select Target"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">
                    <span className="font-bold text-blue-600 flex items-center gap-2">
                      Global (System Default)
                    </span>
                  </SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ================= INFO BANNER ================= */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/60 rounded-2xl p-5 mb-10 flex items-start gap-4 shadow-sm">
          <div className="bg-blue-100/80 p-2.5 rounded-xl border border-blue-200">
            <Info className="w-5 h-5 text-blue-700 shrink-0" />
          </div>
          <div className="text-sm text-blue-900 mt-0.5">
            <strong className="font-bold text-base block mb-1 text-blue-950">
              Viewing limits for: {activeCompanyName}
            </strong>
            <p className="opacity-80">
              Changes applied here take effect immediately for all subsequent
              API requests. Relational limits (e.g., Cleaners per Washroom) only
              restrict new assignments.
            </p>
          </div>
        </div>

        {/* ================= LOADING STATE ================= */}
        {loadingLimits ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 h-48 animate-pulse border border-slate-100 shadow-sm"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-xl mb-6"></div>
                <div className="w-2/3 h-5 bg-slate-100 rounded mb-3"></div>
                <div className="w-1/3 h-8 bg-slate-100 rounded mt-auto"></div>
              </div>
            ))}
          </div>
        ) : (
          /* ================= CARDS GRID ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {limits.map((limit) => {
              const isEditing = editingKey === limit.limit_key;

              // Calculate Percentage safely
              let percentage = 0;
              if (limit.limit_value > 0) {
                percentage = Math.min(
                  100,
                  Math.round((limit.current_value / limit.limit_value) * 100),
                );
              }

              // Color Logic based on usage
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
                  className={`bg-white rounded-2xl border ${
                    isEditing
                      ? "border-blue-400 shadow-lg ring-4 ring-blue-50 transform scale-[1.02]"
                      : "border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
                  } overflow-hidden flex flex-col relative transition-all duration-200 group`}
                >
                  {/* Top Color Indicator */}
                  <div
                    className={`h-1.5 w-full ${limit.is_enabled ? progressColor : "bg-slate-200"}`}
                  ></div>

                  <div className="p-6 flex-1 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border ${bgColor} border-white/50 shadow-sm`}
                        >
                          {getIcon(limit.limit_key)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-[15px] leading-tight">
                            {formatTitle(limit.limit_key)}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-1.5 inline-block border ${
                              limit.is_enabled
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-slate-50 text-slate-500 border-slate-200"
                            }`}
                          >
                            {limit.is_enabled ? "ENFORCED" : "NOT SET"}
                          </span>
                        </div>
                      </div>

                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingKey(limit.limit_key);
                            setEditValue(limit.limit_value || "");
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="mt-auto">
                      {!isEditing ? (
                        <>
                          <div className="flex items-end justify-between mb-3">
                            {!isRelationalLimit ? (
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
                                  {limit.current_value}
                                </span>
                                <span className="text-sm font-bold text-slate-400 mb-0.5">
                                  / {limit.limit_value || "∞"}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter leading-none">
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
                                <div
                                  className={`text-sm font-black ${textColor} bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100`}
                                >
                                  {percentage}%
                                </div>
                              )}
                          </div>

                          {!isRelationalLimit && (
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                              <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${progressColor}`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          )}

                          {isRelationalLimit && (
                            <div className="text-[11px] text-slate-400 font-medium italic mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              * Relational limit. Applied dynamically during
                              assignments.
                            </div>
                          )}

                          {!isRelationalLimit &&
                            percentage >= 95 &&
                            limit.is_enabled && (
                              <p className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 mt-3 bg-red-50 p-2 rounded-lg border border-red-100">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                Action Required: Quota almost exhausted
                              </p>
                            )}
                        </>
                      ) : (
                        /* EDIT MODE */
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block flex justify-between">
                            <span>Set New Limit</span>
                            <span className="text-blue-500 lowercase normal-case">
                              {formatTitle(limit.limit_key)}
                            </span>
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="flex-1 px-3 py-2 text-base font-bold text-slate-800 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                              autoFocus
                              placeholder="Enter value"
                            />
                            <button
                              disabled={isUpdating}
                              onClick={() =>
                                handleSaveLimit(limit.limit_key, true)
                              }
                              className="px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm disabled:opacity-50"
                            >
                              <Save className="w-4 h-4 mr-2" /> Save
                            </button>
                            <button
                              onClick={() => setEditingKey(null)}
                              className="px-3 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
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
