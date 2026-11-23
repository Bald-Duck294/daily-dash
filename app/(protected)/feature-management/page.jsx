"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  Sliders,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Lock,
  Layers,
  Sparkles,
  ClipboardList,
  MessageSquareWarning,
  Scale,
  Zap,
  ExternalLink,
  RefreshCw,
  Info,
} from "lucide-react";
import {
  useCompaniesFeatures,
  useToggleCompanyFeature,
} from "@/features/featureManagement/featureManagement.queries";
import Loader from "@/components/ui/Loader";

export default function FeatureManagementPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = Number(user?.role_id) === 1;

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [featureFilter, setFeatureFilter] = useState("ALL"); // ALL, CLEANING_REQ_ON, CLEANING_REQ_OFF, ASSIGNMENT_ON
  const [togglingKey, setTogglingKey] = useState(null); // companyId_featureKey

  const {
    data: responseData,
    isLoading,
    refetch,
    isRefetching,
  } = useCompaniesFeatures(isSuperAdmin);

  const toggleMutation = useToggleCompanyFeature();

  // Access control
  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 text-center max-w-md shadow-xl">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-200/60 dark:border-rose-800/40">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Super Admin Access Only
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Only Super Administrators (Role ID 1) can configure organization-level feature toggles.
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const companiesList = responseData?.data || [];
  const totalCompanies = companiesList.length;

  const stats = useMemo(() => {
    let cleanerAssignCount = 0;
    let cleaningReqCount = 0;
    let slaRulesCount = 0;
    let thresholdAutoCount = 0;

    companiesList.forEach((c) => {
      if (c.features?.cleaner_assignment) cleanerAssignCount++;
      if (c.features?.cleaning_request) cleaningReqCount++;
      if (c.features?.sla_rules) slaRulesCount++;
      if (c.features?.service_req_threshold) thresholdAutoCount++;
    });

    return { cleanerAssignCount, cleaningReqCount, slaRulesCount, thresholdAutoCount };
  }, [companiesList]);

  // Filtered List
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.company_name?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q) ||
        c.company_id?.toString().includes(q);

      if (!matchesSearch) return false;

      if (featureFilter === "CLEANING_REQ_ON") return Boolean(c.features?.cleaning_request);
      if (featureFilter === "CLEANING_REQ_OFF") return !c.features?.cleaning_request;
      if (featureFilter === "ASSIGNMENT_OFF") return !c.features?.cleaner_assignment;
      if (featureFilter === "THRESHOLD_ON") return Boolean(c.features?.service_req_threshold);
      if (featureFilter === "SLA_ON") return Boolean(c.features?.sla_rules);

      return true;
    });
  }, [companiesList, searchQuery, featureFilter]);

  const handleToggle = async (companyId, featureKey, currentState, threshold) => {
    const key = `${companyId}_${featureKey}`;
    setTogglingKey(key);
    try {
      await toggleMutation.mutateAsync({
        companyId,
        featureKey,
        isActive: !currentState,
        threshold,
      });
    } finally {
      setTogglingKey(null);
    }
  };

  const handleUpdateThreshold = async (companyId, newThreshold, isActive) => {
    const key = `${companyId}_service_req_threshold_val`;
    setTogglingKey(key);
    try {
      await toggleMutation.mutateAsync({
        companyId,
        featureKey: "service_req_threshold",
        isActive: isActive !== false,
        threshold: newThreshold,
      });
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-indigo-700/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-xs font-semibold backdrop-blur-md border border-indigo-400/30">
              <Sliders className="w-3.5 h-3.5" />
              <span>Superadmin Module Controls</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Feature Management
            </h1>
            <p className="text-indigo-200/80 text-xs md:text-sm max-w-2xl leading-relaxed">
              Control which modules are active for each client organization. When a feature like{" "}
              <strong className="text-white">Cleaner Assignment</strong> or{" "}
              <strong className="text-white">Cleaning Requests</strong> is disabled, it is completely hidden from that company&apos;s workspace and navigation.
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all backdrop-blur-md border border-white/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Companies</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-800 dark:text-white mt-1">
            {totalCompanies}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cleaner Assignment</span>
            <ClipboardList className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
            {stats.cleanerAssignCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {totalCompanies}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cleaning Requests</span>
            <MessageSquareWarning className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.cleaningReqCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {totalCompanies}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Auto-Dispatch</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {stats.thresholdAutoCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {totalCompanies}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">SLA Rules Active</span>
            <Scale className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {stats.slaRulesCount}
            <span className="text-xs font-normal text-slate-400 ml-1.5">/ {totalCompanies}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company by name, ID or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: "ALL", label: "All" },
            { id: "CLEANING_REQ_ON", label: "Cleaning Requests ON" },
            { id: "CLEANING_REQ_OFF", label: "Cleaning Requests OFF" },
            { id: "THRESHOLD_ON", label: "Auto-Dispatch ON" },
            { id: "ASSIGNMENT_OFF", label: "Assignment OFF" },
            { id: "SLA_ON", label: "SLA ON" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFeatureFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                featureFilter === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Company Feature Cards / Table */}
      {isLoading ? (
        <div className="py-20 flex justify-center">
          <Loader />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No organizations found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or filter tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCompanies.map((comp) => {
            const cleanerAssignOn = Boolean(comp.features?.cleaner_assignment);
            const cleaningReqOn = Boolean(comp.features?.cleaning_request);
            const slaRulesOn = Boolean(comp.features?.sla_rules);
            const thresholdOn = Boolean(comp.features?.service_req_threshold);
            const thresholdVal = Number(comp.features?.service_req_threshold_value) || 3;

            const isTogglingCleaner = togglingKey === `${comp.company_id}_cleaner_assignment`;
            const isTogglingCleaningReq = togglingKey === `${comp.company_id}_cleaning_request`;
            const isTogglingSla = togglingKey === `${comp.company_id}_sla_rules`;
            const isTogglingThreshold = togglingKey === `${comp.company_id}_service_req_threshold`;
            const isUpdatingThresholdVal = togglingKey === `${comp.company_id}_service_req_threshold_val`;

            return (
              <div
                key={comp.company_id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm border border-indigo-200/60 dark:border-indigo-800/40">
                      {comp.company_name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {comp.company_name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          ID: #{comp.company_id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {comp.contact_email || "No contact email recorded"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/clientDashboard/${comp.company_id}`)}
                    className="self-start lg:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span>View Workspace</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Feature Toggles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                  {/* Feature 1: Cleaner Assignment */}
                  <div
                    className={`rounded-xl p-3.5 border transition-all ${
                      cleanerAssignOn
                        ? "bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/40"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <ClipboardList
                            className={`w-4 h-4 ${
                              cleanerAssignOn ? "text-blue-600 dark:text-blue-400" : "text-slate-400"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Cleaner Assignment
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          Washroom cleaner mapping & shifts
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggle(comp.company_id, "cleaner_assignment", cleanerAssignOn)}
                        disabled={isTogglingCleaner}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          cleanerAssignOn ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                        } ${isTogglingCleaner ? "opacity-50 cursor-wait" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            cleanerAssignOn ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
                      {cleanerAssignOn ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-300">
                          <CheckCircle2 className="w-3 h-3" /> Visible in company
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                          <XCircle className="w-3 h-3" /> Hidden from company
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feature 2: Cleaning Requests */}
                  <div
                    className={`rounded-xl p-3.5 border transition-all ${
                      cleaningReqOn
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MessageSquareWarning
                            className={`w-4 h-4 ${
                              cleaningReqOn ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Cleaning Requests
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          Citizen tickets & supervisor tasks
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggle(comp.company_id, "cleaning_request", cleaningReqOn)}
                        disabled={isTogglingCleaningReq}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          cleaningReqOn ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                        } ${isTogglingCleaningReq ? "opacity-50 cursor-wait" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            cleaningReqOn ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
                      {cleaningReqOn ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" /> Visible in company
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                          <XCircle className="w-3 h-3" /> Hidden from company
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feature 3: SLA Rules & Ledger */}
                  <div
                    className={`rounded-xl p-3.5 border transition-all ${
                      slaRulesOn
                        ? "bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/40"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Scale
                            className={`w-4 h-4 ${
                              slaRulesOn ? "text-purple-600 dark:text-purple-400" : "text-slate-400"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            SLA Rules & Ledger
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          Penalties, disputes & deductions
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggle(comp.company_id, "sla_rules", slaRulesOn)}
                        disabled={isTogglingSla}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          slaRulesOn ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                        } ${isTogglingSla ? "opacity-50 cursor-wait" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            slaRulesOn ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    <div className="mt-2.5 flex items-center gap-1.5 text-[10px]">
                      {slaRulesOn ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-purple-700 dark:text-purple-300">
                          <CheckCircle2 className="w-3 h-3" /> Visible in company
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                          <XCircle className="w-3 h-3" /> Hidden from company
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feature 4: Auto-Dispatch Threshold */}
                  <div
                    className={`rounded-xl p-3.5 border transition-all ${
                      thresholdOn
                        ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40"
                        : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Zap
                            className={`w-4 h-4 ${
                              thresholdOn ? "text-amber-600 dark:text-amber-400" : "text-slate-400"
                            }`}
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            Auto-Dispatch
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                          Auto-assign on ≥ {thresholdVal} requests
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleToggle(comp.company_id, "service_req_threshold", thresholdOn, thresholdVal)
                        }
                        disabled={isTogglingThreshold}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          thresholdOn ? "bg-amber-600" : "bg-slate-300 dark:bg-slate-700"
                        } ${isTogglingThreshold ? "opacity-50 cursor-wait" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            thresholdOn ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Dynamic Threshold Stepper */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                        Trigger at:
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={thresholdVal <= 1 || isUpdatingThresholdVal}
                          onClick={() =>
                            handleUpdateThreshold(
                              comp.company_id,
                              Math.max(1, thresholdVal - 1),
                              thresholdOn
                            )
                          }
                          className="w-5 h-5 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold disabled:opacity-40 transition"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 min-w-[20px] text-center">
                          {thresholdVal}
                        </span>
                        <button
                          type="button"
                          disabled={isUpdatingThresholdVal}
                          onClick={() =>
                            handleUpdateThreshold(comp.company_id, thresholdVal + 1, thresholdOn)
                          }
                          className="w-5 h-5 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-bold disabled:opacity-40 transition"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-slate-400 ml-0.5">reqs</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                      {thresholdOn ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-300">
                          <CheckCircle2 className="w-3 h-3" /> Auto-assign ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-slate-400">
                          <XCircle className="w-3 h-3" /> Disabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
