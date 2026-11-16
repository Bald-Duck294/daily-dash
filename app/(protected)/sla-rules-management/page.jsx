"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  Scale,
  Building2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Lock,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  Layers,
  RotateCcw
} from "lucide-react";
import {
  useAllCompaniesSlaRulesStatus,
  useToggleCompanySlaRules
} from "@/features/slaPenalty/slaPenalty.queries";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function SlaRulesManagementPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = Number(user?.role_id) === 1;

  // Search & Status Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "ACTIVE" | "INACTIVE"
  const [togglingCompanyId, setTogglingCompanyId] = useState(null);

  // Queries & Mutations
  const {
    data: responseData,
    isLoading,
    refetch
  } = useAllCompaniesSlaRulesStatus(isSuperAdmin);

  const toggleMutation = useToggleCompanySlaRules();

  // Access Denied Screen for non-superadmin
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
            Only Super Administrators (Role ID 1) can configure organization-level SLA feature toggles in the configuration master table.
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
  const totalCount = responseData?.total || companiesList.length;
  const activeCount = responseData?.active_count ?? companiesList.filter((c) => c.is_active).length;
  const inactiveCount = responseData?.inactive_count ?? companiesList.filter((c) => !c.is_active).length;

  // Filtered List
  const filteredCompanies = useMemo(() => {
    return companiesList.filter((c) => {
      // 1. Text filter
      const matchesSearch =
        !searchQuery.trim() ||
        c.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company_id?.toString().includes(searchQuery);

      // 2. Status filter
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && c.is_active) ||
        (statusFilter === "INACTIVE" && !c.is_active);

      return matchesSearch && matchesStatus;
    });
  }, [companiesList, searchQuery, statusFilter]);

  // Handle Toggle Click
  const handleToggle = async (company) => {
    const nextState = !company.is_active;
    setTogglingCompanyId(company.company_id);

    try {
      await toggleMutation.mutateAsync({
        companyId: company.company_id,
        isActive: nextState
      });

      toast.success(
        nextState
          ? `SLA Management enabled for "${company.company_name}"`
          : `SLA Management disabled for "${company.company_name}"`
      );
      refetch();
    } catch (err) {
      toast.error(err.message || "Failed to update company SLA status");
    } finally {
      setTogglingCompanyId(null);
    }
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                SLA Feature Management
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                Super Admin Control
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Configure which organizations have access to contractual SLA Rule Books, Penalty Deductions, and the Approval Ledger.
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="self-start sm:self-center px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Organizations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Organizations
            </span>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {isLoading ? "..." : totalCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Registered tenant accounts</p>
        </div>

        {/* SLA Rules Active */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/20 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SLA Rules Enabled
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {isLoading ? "..." : activeCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Module visible to company admins</p>
        </div>

        {/* SLA Rules Disabled */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              SLA Rules Disabled
            </span>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {isLoading ? "..." : inactiveCount}
          </div>
          <p className="text-xs text-slate-400 mt-1">Module completely hidden</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizations by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Status Tabs Filter */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ALL"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All ({companiesList.length})
            </button>
            <button
              onClick={() => setStatusFilter("ACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "ACTIVE"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Enabled ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("INACTIVE")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === "INACTIVE"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Disabled ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Companies List / Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            No Organizations Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {searchQuery || statusFilter !== "ALL"
              ? "No organizations matched your search or status filter."
              : "No registered organizations exist in the system."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/40 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Organization</th>
                <th className="py-4 px-6">ID & Contact</th>
                <th className="py-4 px-6 text-center">SLA Rules Status</th>
                <th className="py-4 px-6 text-center">Feature Toggle</th>
                <th className="py-4 px-6 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {filteredCompanies.map((comp) => {
                const isToggling = togglingCompanyId === comp.company_id;

                return (
                  <tr
                    key={comp.company_id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Organization Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-200/60 dark:border-blue-900/60">
                          {comp.company_name?.charAt(0)?.toUpperCase() || "O"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white text-sm">
                            {comp.company_name}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Key: <code className="font-mono text-slate-500 dark:text-slate-400">sla_rules</code>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* ID & Contact */}
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-slate-700 dark:text-slate-300">
                        Company #{comp.company_id}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[200px]">
                        {comp.contact_email || "No contact email"}
                      </div>
                    </td>

                    {/* Status Pill */}
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          comp.is_active
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            comp.is_active ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                          }`}
                        />
                        {comp.is_active ? "Enabled" : "Disabled"}
                      </span>
                    </td>

                    {/* Toggle Switch */}
                    <td className="py-4 px-6 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggle(comp)}
                        disabled={isToggling}
                        aria-pressed={comp.is_active}
                        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 ${
                          comp.is_active ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                        title={
                          comp.is_active
                            ? "Click to disable SLA Rules for this company"
                            : "Click to enable SLA Rules for this company"
                        }
                      >
                        <span
                          className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            comp.is_active ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Quick Action */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() =>
                          router.push(`/sla-penalty?companyId=${comp.company_id}`)
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
                      >
                        <span>Open SLA</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Architectural Guidance Box */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-start gap-3.5">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              SLA Feature Flag Governance & Tenancy Rules
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Configuration Table Key:
                </strong>{" "}
                State is stored in the PostgreSQL <code className="font-mono">configurations</code> table under key <code className="font-mono">sla_rules</code> with unique constraint <code className="font-mono">@@unique([name, company_id])</code>.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Strict Multi-Tenant Isolation:
                </strong>{" "}
                When disabled, Company Admins (Role ID 2) cannot see the SLA Management navigation item in their sidebar, even if their role possesses all global permissions.
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">
                  Separation of Concerns:
                </strong>{" "}
                Contractual SLA Rules and Penalties operate under key <code className="font-mono">sla_rules</code>, completely independent of the legacy <code className="font-mono">SLA_CONFIGURATION</code> threshold and escalation engine.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "12px"
          }
        }}
      />
    </div>
  );
}
