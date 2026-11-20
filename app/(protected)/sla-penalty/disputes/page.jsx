"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  Eye,
  Building2,
  Calendar,
  User,
  MapPin,
  MessageSquare,
  Check,
  X,
  RotateCcw,
  ExternalLink
} from "lucide-react";
import {
  useCompaniesDropdown,
  useCleanersDropdown,
  useDropdownLocations
} from "@/features/dropdownList/dropdownlist.query";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  usePenalties,
  usePenaltySummary,
  useApprovePenalty,
  useRejectPenalty
} from "@/features/slaPenalty/slaPenalty.queries";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";

import PenaltyDetailModal from "../components/ledger/PenaltyDetailModal";
import ApprovalActionModal from "../components/ledger/ApprovalActionModal";

export default function SlaDisputesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlCompanyId = searchParams.get("companyId");
  const { user } = useSelector((state) => state.auth);
  const { companyId: contextCompanyId } = useCompanyId();

  const isSuperAdmin = Number(user?.role_id) === 1;

  // Companies dropdown for superadmin
  const { data: companies = [] } = useCompaniesDropdown();

  // Effective company ID
  const effectiveCompanyId = isSuperAdmin
    ? urlCompanyId || (companies?.length > 0 ? String(companies[0].id) : "")
    : contextCompanyId || user?.company_id;

  // Cleaners and locations dropdowns for filtering
  const { data: cleanersList = [] } = useCleanersDropdown(effectiveCompanyId);
  const { data: locationsResponse = [] } = useDropdownLocations(effectiveCompanyId);
  const locationsList = useMemo(() => {
    if (Array.isArray(locationsResponse)) return locationsResponse;
    if (Array.isArray(locationsResponse?.data)) return locationsResponse.data;
    return [];
  }, [locationsResponse]);

  // Selected company change handler (for SuperAdmin)
  const handleCompanyChange = (e) => {
    const newId = e.target.value;
    router.push(`/sla-penalty/disputes?companyId=${newId}`);
  };

  // Filter states
  const [activeTab, setActiveTab] = useState("PENDING"); // PENDING | ALL | WAIVED | UPHELD
  const [selectedCleanerId, setSelectedCleanerId] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [datePreset, setDatePreset] = useState("all"); // 'all' | 'today' | 'week' | 'month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Calculate date boundaries based on datePreset
  const computedDateRange = useMemo(() => {
    const now = new Date();
    const toDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (datePreset === "today") {
      return { start_date: toDateStr, end_date: toDateStr };
    }
    if (datePreset === "week") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      const pastStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`;
      return { start_date: pastStr, end_date: toDateStr };
    }
    if (datePreset === "month") {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      const pastStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`;
      return { start_date: pastStr, end_date: toDateStr };
    }
    if (datePreset === "custom") {
      return {
        start_date: customStartDate || undefined,
        end_date: customEndDate || undefined
      };
    }
    return { start_date: undefined, end_date: undefined };
  }, [datePreset, customStartDate, customEndDate]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    activeTab !== "PENDING" ||
    selectedCleanerId ||
    selectedLocationId ||
    appliedSearch ||
    searchInput ||
    datePreset !== "all" ||
    customStartDate ||
    customEndDate
  );

  // Modal states
  const [selectedPenaltyForDetail, setSelectedPenaltyForDetail] = useState(null);
  const [actionModalConfig, setActionModalConfig] = useState({
    isOpen: false,
    penalty: null,
    actionType: "APPROVE" // "APPROVE" (Uphold) | "REJECT" (Waive)
  });

  // Queries - Reactively bound to selected date range, cleaner & location
  const {
    data: summaryData,
    refetch: refetchSummary
  } = usePenaltySummary(effectiveCompanyId, {
    cleaner_id: selectedCleanerId || undefined,
    location_id: selectedLocationId || undefined,
    start_date: computedDateRange.start_date,
    end_date: computedDateRange.end_date
  });

  const {
    data: penaltiesResponse,
    isLoading: isLoadingPenalties,
    isFetching: isFetchingPenalties,
    refetch: refetchPenalties
  } = usePenalties(effectiveCompanyId, {
    dispute_filter: activeTab,
    cleaner_id: selectedCleanerId || undefined,
    location_id: selectedLocationId || undefined,
    start_date: computedDateRange.start_date,
    end_date: computedDateRange.end_date,
    page: currentPage,
    limit: pageSize
  });

  // Mutations
  const approveMutation = useApprovePenalty();
  const rejectMutation = useRejectPenalty();

  const penaltiesList = penaltiesResponse?.data || [];
  const pagination = penaltiesResponse?.pagination || {};

  // Client-side search filtering (by cleaner name, phone, location name, penalty number, dispute reason)
  const filteredPenalties = useMemo(() => {
    if (!appliedSearch.trim()) return penaltiesList;
    const q = appliedSearch.toLowerCase().trim();
    return penaltiesList.filter((p) => {
      const cleanerName = (p.cleaner_user?.name || "").toLowerCase();
      const cleanerPhone = (p.cleaner_user?.phone || "").toLowerCase();
      const locationName = (p.location?.name || "").toLowerCase();
      const penaltyNum = (p.penalty_number || "").toLowerCase();
      const ruleCode = (p.rule?.rule_code || "").toLowerCase();
      const reason = (p.dispute_reason || "").toLowerCase();
      return (
        cleanerName.includes(q) ||
        cleanerPhone.includes(q) ||
        locationName.includes(q) ||
        penaltyNum.includes(q) ||
        ruleCode.includes(q) ||
        reason.includes(q)
      );
    });
  }, [penaltiesList, appliedSearch]);

  // Handle Search Submission
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput.trim());
    setCurrentPage(1);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveTab("PENDING");
    setSelectedCleanerId("");
    setSelectedLocationId("");
    setSearchInput("");
    setAppliedSearch("");
    setDatePreset("all");
    setCustomStartDate("");
    setCustomEndDate("");
    setCurrentPage(1);
  };

  // Refresh data
  const handleRefresh = () => {
    refetchSummary();
    refetchPenalties();
    toast.success("Dispute queue refreshed");
  };

  // Open action modal
  const handleOpenActionModal = (penalty, actionType) => {
    setActionModalConfig({
      isOpen: true,
      penalty,
      actionType
    });
  };

  const handleCloseActionModal = () => {
    setActionModalConfig({
      isOpen: false,
      penalty: null,
      actionType: "APPROVE"
    });
  };

  // Submit action (Uphold vs Waive)
  const handleActionSubmit = async (payload) => {
    const { penalty, actionType } = actionModalConfig;
    if (!penalty || !effectiveCompanyId) return;

    try {
      if (actionType === "APPROVE") {
        await approveMutation.mutateAsync({
          penaltyId: penalty.id,
          companyId: effectiveCompanyId,
          data: {
            approved_amount: payload.approved_amount,
            comment: payload.comment || payload.comments || "Dispute reviewed: deduction upheld"
          }
        });
        toast.success(`Dispute for #${penalty.penalty_number} resolved: deduction upheld.`);
      } else if (actionType === "REJECT") {
        await rejectMutation.mutateAsync({
          penaltyId: penalty.id,
          companyId: effectiveCompanyId,
          data: {
            rejection_reason: payload.rejection_reason || payload.reason || "Dispute accepted: deduction waived"
          }
        });
        toast.success(`Dispute for #${penalty.penalty_number} accepted: penalty waived (₹0.00).`);
      }
      handleCloseActionModal();
      refetchPenalties();
      refetchSummary();
    } catch (err) {
      toast.error(err?.message || "Failed to submit dispute resolution");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      <Toaster position="top-right" />

      {/* Industrial Header Bar with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push(`/sla-penalty?companyId=${effectiveCompanyId || ""}`);
              }
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer shrink-0"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                SLA Dispute Management
              </h1>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                Resolution Queue
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review cleaner contestations, verify evidence, and uphold or waive contract deductions.
            </p>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Superadmin Company Switcher */}
          {isSuperAdmin && companies?.length > 0 && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={effectiveCompanyId || ""}
                onChange={handleCompanyChange}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company_name || c.name || `Company #${c.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Link
            href={`/sla-penalty?companyId=${effectiveCompanyId || ""}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shadow-sm"
          >
            <Scale className="w-3.5 h-3.5 text-blue-500" />
            Rule Books & Ledger
          </Link>

          <button
            onClick={handleRefresh}
            disabled={isFetchingPenalties}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Refresh disputes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingPenalties ? "animate-spin text-blue-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Clickable Small KPI Cards (Filter & Date Reactive) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Pending Review (Primary Action Item) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("PENDING");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl text-left transition-all border shadow-sm cursor-pointer ${
            activeTab === "PENDING"
              ? "bg-amber-500/10 border-amber-500/50 ring-2 ring-amber-500/30 dark:bg-amber-950/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Pending Review
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {summaryData?.disputed_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Awaiting supervisor action</span>
            {activeTab === "PENDING" && (
              <span className="font-semibold text-amber-600 dark:text-amber-400">Active</span>
            )}
          </div>
        </button>

        {/* 2. Total Disputes */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("ALL");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl text-left transition-all border shadow-sm cursor-pointer ${
            activeTab === "ALL"
              ? "bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/30 dark:bg-blue-950/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Total Disputes
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {summaryData?.total_disputes_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
            <span>All claims for period</span>
            {activeTab === "ALL" && (
              <span className="font-semibold text-blue-600 dark:text-blue-400">Active</span>
            )}
          </div>
        </button>

        {/* 3. Waived by Management */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("WAIVED");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl text-left transition-all border shadow-sm cursor-pointer ${
            activeTab === "WAIVED"
              ? "bg-slate-500/10 border-slate-500/50 ring-2 ring-slate-500/30 dark:bg-slate-800/40"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Disputes Waived
            </span>
            <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {summaryData?.dispute_waived_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Accepted excuses (₹0.00)</span>
            {activeTab === "WAIVED" && (
              <span className="font-semibold text-slate-700 dark:text-slate-300">Active</span>
            )}
          </div>
        </button>

        {/* 4. Upheld & Confirmed */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("UPHELD");
            setCurrentPage(1);
          }}
          className={`p-3.5 rounded-2xl text-left transition-all border shadow-sm cursor-pointer ${
            activeTab === "UPHELD"
              ? "bg-emerald-500/10 border-emerald-500/50 ring-2 ring-emerald-500/30 dark:bg-emerald-950/20"
              : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow"
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Disputes Upheld
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {summaryData?.dispute_upheld_count ?? 0}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Breaches confirmed</span>
            {activeTab === "UPHELD" && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
            )}
          </div>
        </button>
      </div>

      {/* Industrial Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 shadow-sm space-y-3">
        {/* Row 1: Status Tabs & Date Presets */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab("PENDING");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "PENDING"
                  ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Pending Review
              {summaryData?.disputed_count ? (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/20">
                  {summaryData.disputed_count}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => {
                setActiveTab("ALL");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              All Disputes
            </button>

            <button
              onClick={() => {
                setActiveTab("WAIVED");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "WAIVED"
                  ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Waived (Accepted)
              {summaryData?.dispute_waived_count ? (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                  {summaryData.dispute_waived_count}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => {
                setActiveTab("UPHELD");
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "UPHELD"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Upheld (Confirmed)
              {summaryData?.dispute_upheld_count ? (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                  {summaryData.dispute_upheld_count}
                </span>
              ) : null}
            </button>
          </div>

          {/* Date Range Presets */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 mr-1" />
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "week", label: "This Week" },
              { id: "month", label: "This Month" },
              { id: "custom", label: "Custom" }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setDatePreset(preset.id);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  datePreset === preset.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Search input with Search button, Cleaner Dropdown, Location Dropdown & Custom Dates */}
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
          {/* Cleaner Search Input with Search Button */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-1.5 flex-1 min-w-[260px]"
          >
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search cleaner name, phone, penalty #..."
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setAppliedSearch("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="submit"
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              Search
            </button>
          </form>

          {/* Cleaner Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCleanerId}
              onChange={(e) => {
                setSelectedCleanerId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none text-xs cursor-pointer max-w-[150px] truncate"
            >
              <option value="">All Cleaners</option>
              {cleanersList.map((c) => {
                const pending = summaryData?.cleaners_pending?.[String(c.id)];
                const pendingText = pending && pending.pending_amount > 0 ? ` (₹${Number(pending.pending_amount).toFixed(2)} pending)` : "";
                return (
                  <option key={c.id} value={c.id}>
                    {(c.name || `Cleaner #${c.id}`) + pendingText}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Location / Washroom Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedLocationId}
              onChange={(e) => {
                setSelectedLocationId(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-slate-800 dark:text-slate-200 outline-none text-xs cursor-pointer max-w-[170px] truncate"
            >
              <option value="">All Washrooms</option>
              {locationsList.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name || `Location #${loc.id}`}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Date Pickers */}
          {datePreset === "custom" && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => {
                  setCustomStartDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-800 dark:text-slate-200 outline-none text-xs cursor-pointer"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => {
                  setCustomEndDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-slate-800 dark:text-slate-200 outline-none text-xs cursor-pointer"
              />
            </div>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Disputes Table Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoadingPenalties ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader />
            <span className="text-xs font-semibold text-slate-400">
              Loading dispute records...
            </span>
          </div>
        ) : filteredPenalties.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No Disputes Found
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {activeTab === "PENDING"
                ? "All clear! There are currently no unresolved cleaner disputes awaiting supervisor action."
                : "No dispute records match your selected filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="px-3.5 py-3 w-12 text-center">Sr. No.</th>
                  <th className="px-4 py-3">Penalty # & Date</th>
                  <th className="px-4 py-3">Cleaner</th>
                  <th className="px-4 py-3">Facility / Washroom</th>
                  <th className="px-4 py-3">Breached Rule</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 max-w-xs">Dispute Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPenalties.map((penalty, index) => {
                  const serialNo = (currentPage - 1) * pageSize + index + 1;
                  const cleanerUser = penalty.cleaner_user || penalty.cleaner;
                  const cleanerName = cleanerUser?.name || `Cleaner #${penalty.cleaner_user_id || ""}`;
                  const isActionable =
                    penalty.status === "DISPUTED" ||
                    penalty.status === "PENDING" ||
                    penalty.status === "PENDING_APPROVAL";
                  const isWaived = penalty.status === "REJECTED";
                  const isUpheld = penalty.status === "APPROVED";
                  const isReversed = penalty.status === "REVERSED";

                  return (
                    <tr
                      key={penalty.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Sr. No. */}
                      <td className="px-3 py-3.5 text-center font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {serialNo}
                      </td>

                      {/* Penalty Number & Date */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white font-mono text-xs">
                          {penalty.penalty_number}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formatDate(penalty.disputed_at || penalty.created_at)}
                        </div>
                      </td>

                      {/* Cleaner Details */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 shrink-0">
                            {cleanerUser?.avatar_url ? (
                              <img
                                src={cleanerUser.avatar_url}
                                alt={cleanerName}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-3.5 h-3.5" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {cleanerName}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {cleanerUser?.phone || "No phone"}
                            </div>
                            {penalty.cleaner_pending_amount !== undefined && penalty.cleaner_pending_amount > 0 && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20" title={`Total pending penalty balance for ${cleanerName}`}>
                                  Pending: ₹{Number(penalty.cleaner_pending_amount).toFixed(2)} ({penalty.cleaner_pending_count || 1})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]">{penalty.location?.name || "Unassigned"}</span>
                        </div>
                        {penalty.location?.city && (
                          <div className="text-[10px] text-slate-400 ml-5">
                            {penalty.location.city}
                          </div>
                        )}
                      </td>

                      {/* Breached Rule & Review Link */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">
                          {penalty.rule?.rule_code || "RULE-BREACH"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                          {penalty.rule?.name || "Threshold violation"}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-1">
                          {penalty.violation?.score !== undefined && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              Score: {Number(penalty.violation.score).toFixed(1)}/10
                            </span>
                          )}
                          {penalty.review_id ? (
                            <Link
                              href={`/cleaners/${penalty.review_id}?companyId=${effectiveCompanyId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 transition-colors"
                              title="Open responsible cleaner review in new tab"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                              Review #{penalty.review_id}
                              {penalty.review?.attempt_no ? ` (Att #${penalty.review.attempt_no})` : ""}
                            </Link>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Daily Quota</span>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">
                          ₹{Number(penalty.calculated_amount || 0).toFixed(2)}
                        </div>
                        {penalty.approved_amount !== null && penalty.approved_amount !== undefined && (
                          <div className="text-[10px] text-slate-400">
                            Approved: ₹{Number(penalty.approved_amount).toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Cleaner Dispute Statement */}
                      <td className="px-4 py-3 max-w-xs">
                        {penalty.dispute_reason ? (
                          <div className="max-w-[260px]">
                            <p
                              className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed italic"
                              title={penalty.dispute_reason}
                            >
                              "{penalty.dispute_reason}"
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No statement provided</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        {isActionable && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                            {penalty.status === "DISPUTED" ? "Dispute Pending" : "Pending Review"}
                          </span>
                        )}
                        {isWaived && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                            Waived (₹0.00)
                          </span>
                        )}
                        {isUpheld && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            Upheld & Deducted
                          </span>
                        )}
                        {isReversed && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
                            Reversed
                          </span>
                        )}
                        {!isActionable && !isWaived && !isUpheld && !isReversed && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600">
                            {penalty.status}
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct link to responsible Review Inspection */}
                          {penalty.review_id && (
                            <Link
                              href={`/cleaners/${penalty.review_id}?companyId=${effectiveCompanyId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                              title={`Open Cleaner Review #${penalty.review_id} in new tab`}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>
                          )}

                          {/* Evidence inspection */}
                          <button
                            onClick={() => setSelectedPenaltyForDetail(penalty)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Inspect Inspection Evidence & Photos"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Actions if Actionable */}
                          {isActionable && (
                            <>
                              {/* Waive / Reject Button */}
                              <button
                                onClick={() => handleOpenActionModal(penalty, "REJECT")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                                title="Accept cleaner excuse and waive penalty"
                              >
                                <X className="w-3 h-3" />
                                Waive
                              </button>

                              {/* Uphold / Approve Button */}
                              <button
                                onClick={() => handleOpenActionModal(penalty, "APPROVE")}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                                title="Confirm financial deduction"
                              >
                                <Check className="w-3 h-3" />
                                Uphold
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <span>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} disputes)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Deep Inspection Detail Modal */}
      {selectedPenaltyForDetail && (
        <PenaltyDetailModal
          penalty={selectedPenaltyForDetail}
          onClose={() => setSelectedPenaltyForDetail(null)}
          onOpenActionModal={(penalty, actionType) => {
            setSelectedPenaltyForDetail(null);
            handleOpenActionModal(penalty, actionType);
          }}
        />
      )}

      {/* Uphold vs Waive Action Modal */}
      {actionModalConfig.isOpen && (
        <ApprovalActionModal
          penalty={actionModalConfig.penalty}
          actionType={actionModalConfig.actionType}
          isOpen={actionModalConfig.isOpen}
          onClose={handleCloseActionModal}
          onSubmit={handleActionSubmit}
          isSubmitting={approveMutation.isLoading || rejectMutation.isLoading}
        />
      )}
    </div>
  );
}
