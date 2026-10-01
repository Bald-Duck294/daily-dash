"use client";

import { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  AlertOctagon,
  Bell,
  MapPin,
  User,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
  X,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  TrendingUp,
  Flame,
  FileText,
  Smartphone,
} from "lucide-react";

import { useCompanyId } from "@/providers/CompanyProvider";
import {
  useSlaIncidents,
  useSlaIncidentDetails,
  useSlaLogs,
} from "@/features/slaLogs/slaLogs.queries.js";
import {
  useCleanersDropdown,
  useDropdownLocations,
} from "@/features/dropdownList/dropdownlist.query.js";
import Loader from "@/components/ui/Loader.jsx";

/* ---------------- Helper Formatters ---------------- */

const getLocalDateString = (d = new Date()) => {
  const offset = d.getTimezoneOffset();
  const localDate = new Date(d.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatTimeOnly = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return date.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

/* ---------------- Event Type & State Badges ---------------- */

const EVENT_TYPE_CONFIG = {
  SLA_BREACH: {
    label: "SLA Breach",
    icon: AlertTriangle,
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    dotClass: "bg-red-500",
  },
  RETRY_ATTEMPT: {
    label: "Retry Attempt",
    icon: RotateCcw,
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotClass: "bg-blue-500",
  },
  RETRY_PASSED: {
    label: "Retry Passed",
    icon: CheckCircle,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  RETRY_FAILED: {
    label: "Retry Failed",
    icon: XCircle,
    badgeClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
    dotClass: "bg-orange-500",
  },
  ESCALATION_ADVANCED: {
    label: "Tier Advanced",
    icon: ArrowUpRight,
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotClass: "bg-amber-500",
  },
  SLA_RESOLVED: {
    label: "SLA Resolved",
    icon: ShieldCheck,
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500",
  },
  SLA_EXHAUSTED: {
    label: "SLA Exhausted",
    icon: AlertOctagon,
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    dotClass: "bg-rose-500",
  },
  NOTIFICATION_SENT: {
    label: "Notification Sent",
    icon: Bell,
    badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    dotClass: "bg-purple-500",
  },
};

const STATE_BADGE_CONFIG = {
  OPEN: {
    label: "OPEN",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    dotClass: "bg-amber-500 animate-pulse",
  },
  RESOLVED: {
    label: "RESOLVED",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-500",
  },
  EXHAUSTED: {
    label: "EXHAUSTED",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    dotClass: "bg-rose-500",
  },
};

export default function SlaLogsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  // View Mode: "incidents" (default) or "stream" (raw audit logs)
  const [viewMode, setViewMode] = useState("incidents");

  // Selected Incident for Detail Drawer
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);

  // Filters State
  const [datePreset, setDatePreset] = useState(searchParams.get("datePreset") || "today");
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || getLocalDateString());
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || getLocalDateString());
  const [selectedCleanerId, setSelectedCleanerId] = useState(searchParams.get("cleanerId") || "all");
  const [selectedLocationId, setSelectedLocationId] = useState(searchParams.get("locationId") || "all");
  const [selectedEventType, setSelectedEventType] = useState(searchParams.get("eventType") || "all");
  const [selectedState, setSelectedState] = useState(searchParams.get("state") || "all");
  const [selectedTier, setSelectedTier] = useState(searchParams.get("tier") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 15);

  // Dropdown Queries
  const { data: cleaners = [] } = useCleanersDropdown(companyId);
  const { data: locations = [] } = useDropdownLocations(companyId);

  // Query Params Memo
  const queryParams = useMemo(() => {
    return {
      datePreset,
      ...(datePreset === "custom" && { startDate, endDate }),
      cleanerId: selectedCleanerId,
      locationId: selectedLocationId,
      eventType: selectedEventType,
      status: selectedState,
      tier: selectedTier,
      search: searchQuery,
      page,
      limit,
    };
  }, [
    datePreset,
    startDate,
    endDate,
    selectedCleanerId,
    selectedLocationId,
    selectedEventType,
    selectedState,
    selectedTier,
    searchQuery,
    page,
    limit,
  ]);

  // Incidents Query (Primary View)
  const {
    data: incidentsResponse,
    isLoading: isIncidentsLoading,
    isFetching: isIncidentsFetching,
    refetch: refetchIncidents,
  } = useSlaIncidents(queryParams, companyId);

  // Raw Audit Logs Query (Audit Stream View)
  const {
    data: logsResponse,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
    refetch: refetchLogs,
  } = useSlaLogs(queryParams, companyId);

  // Incident Details Query for Drawer
  const {
    data: activeIncidentDetail,
    isLoading: isDetailLoading,
  } = useSlaIncidentDetails(selectedIncidentId);

  const incidents = incidentsResponse?.data || [];
  const incidentsPagination = incidentsResponse?.pagination || { total: 0, totalPages: 1 };
  const summary = (viewMode === "incidents" ? incidentsResponse?.summary : logsResponse?.summary) || {
    totalIncidents: 0,
    activeIncidents: 0,
    open: 0,
    resolved: 0,
    exhausted: 0,
    newBreaches: 0,
  };

  const logs = logsResponse?.data || [];
  const logsPagination = logsResponse?.pagination || { total: 0, totalPages: 1 };

  const isLoading = viewMode === "incidents" ? isIncidentsLoading : isLogsLoading;
  const isFetching = viewMode === "incidents" ? isIncidentsFetching : isLogsFetching;

  const handleRefresh = () => {
    if (viewMode === "incidents") {
      refetchIncidents();
    } else {
      refetchLogs();
    }
  };

  const handleResetFilters = () => {
    setDatePreset("today");
    setStartDate(getLocalDateString());
    setEndDate(getLocalDateString());
    setSelectedCleanerId("all");
    setSelectedLocationId("all");
    setSelectedEventType("all");
    setSelectedState("all");
    setSelectedTier("all");
    setSearchQuery("");
    setPage(1);
  };

  const handleOpenReview = (reviewId) => {
    if (reviewId) {
      router.push(`/cleaners/${reviewId}?companyId=${companyId}`);
    }
  };

  return (
    <div className="flex-1 w-full min-h-[calc(100vh-4rem)] bg-[var(--background)] text-[var(--foreground)] p-4 sm:p-6 lg:p-8 space-y-6">
      {/* ===== COMPACT HEADER & VIEW TOGGLE ===== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                SLA Incident Monitor
              </h1>
              <p className="text-xs text-[var(--sidebar-muted)]">
                Incident-centric tracking of washroom cleanliness breaches, cleaner retries, and tier advancements.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Dual View Toggle */}
          <div className="inline-flex items-center p-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xs">
            <button
              onClick={() => {
                setViewMode("incidents");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === "incidents"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[var(--sidebar-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Incidents
            </button>
            <button
              onClick={() => {
                setViewMode("stream");
                setPage(1);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewMode === "stream"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[var(--sidebar-muted)] hover:text-[var(--foreground)]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Audit Stream
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] transition-all shadow-xs active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ===== INCIDENT-ORIENTED SUMMARY CARDS ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Active / Open Incidents */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--sidebar-muted)]">
            <span>Active Incidents</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {summary.activeIncidents ?? summary.open ?? 0}
            </span>
            <span className="text-[10px] text-amber-600/80 bg-amber-500/10 px-1.5 py-0.5 rounded font-medium">
              In Progress
            </span>
          </div>
        </div>

        {/* New Breaches Today */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--sidebar-muted)]">
            <span>New Breaches</span>
            <Flame className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {summary.newBreaches ?? 0}
            </span>
            <span className="text-[10px] text-[var(--sidebar-muted)]">Today</span>
          </div>
        </div>

        {/* Open State Count */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--sidebar-muted)]">
            <span>Open (Unresolved)</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {summary.open ?? 0}
            </span>
            <span className="text-[10px] text-[var(--sidebar-muted)]">Awaiting Retry</span>
          </div>
        </div>

        {/* Resolved */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[var(--sidebar-muted)]">
            <span>Resolved</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {summary.resolved ?? 0}
            </span>
            <span className="text-[10px] text-emerald-600/80 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
              Passed
            </span>
          </div>
        </div>

        {/* Exhausted */}
        <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[var(--sidebar-muted)]">
            <span>Exhausted</span>
            <AlertOctagon className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {summary.exhausted ?? 0}
            </span>
            <span className="text-[10px] text-rose-600/80 bg-rose-500/10 px-1.5 py-0.5 rounded font-medium">
              Retries Maxed
            </span>
          </div>
        </div>
      </div>

      {/* ===== FILTER TOOLBAR ===== */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-3.5 shadow-xs">
        {/* Date Preset Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center p-1 rounded-lg bg-[var(--background)] border border-[var(--border)] text-xs font-medium">
            {[
              { key: "today", label: "Today" },
              { key: "7days", label: "Last 7 Days" },
              { key: "30days", label: "Last 30 Days" },
              { key: "custom", label: "Custom Range" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setDatePreset(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  datePreset === tab.key
                    ? "bg-[var(--surface)] text-[var(--foreground)] font-semibold shadow-xs"
                    : "text-[var(--sidebar-muted)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--sidebar-muted)]" />
            <input
              type="text"
              placeholder="Search by cleaner, washroom..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--sidebar-muted)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Custom Date Picker (if selected) */}
        {datePreset === "custom" && (
          <div className="flex items-center gap-2 pt-1 text-xs">
            <span className="text-[var(--sidebar-muted)]">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
            <span className="text-[var(--sidebar-muted)]">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]"
            />
          </div>
        )}

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-1">
          {/* Cleaner Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-muted)] mb-1">
              Cleaner
            </label>
            <select
              value={selectedCleanerId}
              onChange={(e) => {
                setSelectedCleanerId(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Cleaners</option>
              {cleaners.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-muted)] mb-1">
              Washroom Location
            </label>
            <select
              value={selectedLocationId}
              onChange={(e) => {
                setSelectedLocationId(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-muted)] mb-1">
              Escalation Status
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="EXHAUSTED">EXHAUSTED</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-[var(--sidebar-muted)] mb-1">
              Current Tier
            </label>
            <select
              value={selectedTier}
              onChange={(e) => {
                setSelectedTier(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Tiers</option>
              <option value="1">Tier 1 (Cleaner)</option>
              <option value="2">Tier 2 (Supervisor)</option>
              <option value="3">Tier 3 (Admin)</option>
              <option value="4">Tier 4 (Facility Admin)</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--surface-hover)] text-[var(--sidebar-muted)] hover:text-[var(--foreground)] transition-all shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* ===== PRIMARY CONTENT AREA ===== */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader size="lg" />
            <p className="text-xs text-[var(--sidebar-muted)]">Loading SLA incident data...</p>
          </div>
        ) : viewMode === "incidents" ? (
          /* ========================================================================= */
          /* 1. DEFAULT VIEW: INCIDENT LIST                                            */
          /* ========================================================================= */
          incidents.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[var(--foreground)]">
                No SLA Incidents Found
              </h3>
              <p className="text-xs text-[var(--sidebar-muted)] max-w-sm mx-auto">
                No washroom cleaning SLA breaches matching your filter criteria. All locations meet targets!
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)]/60 text-[var(--sidebar-muted)] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Incident</th>
                    <th className="py-3 px-4 font-semibold">Cleaner</th>
                    <th className="py-3 px-4 font-semibold">Washroom Location</th>
                    <th className="py-3 px-4 font-semibold">Started</th>
                    <th className="py-3 px-4 font-semibold">Attempts</th>
                    <th className="py-3 px-4 font-semibold">Current Tier</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {incidents.map((incident) => {
                    const stateCfg =
                      STATE_BADGE_CONFIG[incident.state] || {
                        label: incident.state,
                        badgeClass: "bg-gray-500/10 text-gray-600 border-gray-500/20",
                        dotClass: "bg-gray-500",
                      };

                    const cleanerName = incident.cleaner_user?.name || "Cleaner";
                    const cleanerPhone = incident.cleaner_user?.phone || incident.cleaner_user?.email || "";
                    const locationName = incident.location?.name || "Washroom";
                    const locationCode = incident.location?.code || "";

                    const maxRetries = incident.max_retries ?? 2;
                    const attemptsUsed = incident.reviews?.length || 1;
                    const maxAllowedAttempts = maxRetries + 1; // 1 original + max_retries

                    return (
                      <tr
                        key={incident.id}
                        className="hover:bg-[var(--surface-hover)] transition-colors group cursor-pointer"
                        onClick={() => setSelectedIncidentId(incident.id)}
                      >
                        {/* Incident ID & Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[var(--foreground)] group-hover:text-emerald-600 transition-colors">
                              #{incident.id}
                            </span>
                            {incident.business_date && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--background)] border border-[var(--border)] text-[var(--sidebar-muted)]">
                                {new Date(incident.business_date).toISOString().slice(5, 10)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cleaner */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {cleanerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[var(--foreground)] truncate">
                                {cleanerName}
                              </p>
                              {cleanerPhone && (
                                <p className="text-[10px] text-[var(--sidebar-muted)] truncate">
                                  {cleanerPhone}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-medium text-[var(--foreground)]">
                                {locationName}
                              </p>
                              {locationCode && (
                                <span className="inline-block text-[10px] text-[var(--sidebar-muted)] font-mono">
                                  Code: {locationCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Started Time */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-medium text-[var(--foreground)]">
                            {formatTimeOnly(incident.created_at)}
                          </p>
                          <p className="text-[10px] text-[var(--sidebar-muted)]">
                            {formatTimeAgo(incident.created_at)}
                          </p>
                        </td>

                        {/* Attempts */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[var(--foreground)]">
                              {attemptsUsed} / {maxAllowedAttempts}
                            </span>
                            <span className="text-[10px] text-[var(--sidebar-muted)]">
                              ({incident.retry_count} retries)
                            </span>
                          </div>
                        </td>

                        {/* Current Tier */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-muted text-[var(--foreground)] border border-[var(--border)] inline-flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3 text-amber-500" />
                            Tier {incident.current_level}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${stateCfg.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${stateCfg.dotClass}`} />
                            {stateCfg.label}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedIncidentId(incident.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition-all shadow-2xs"
                          >
                            View Journey
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ========================================================================= */
          /* 2. AUDIT STREAM VIEW (FLAT RAW LOGS)                                      */
          /* ========================================================================= */
          logs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 mx-auto flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-sm text-[var(--foreground)]">
                No Audit Events Found
              </h3>
              <p className="text-xs text-[var(--sidebar-muted)] max-w-sm mx-auto">
                No raw SLA events logged matching the selected filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--background)]/60 text-[var(--sidebar-muted)] uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4 font-semibold">Event Type</th>
                    <th className="py-3 px-4 font-semibold">Incident</th>
                    <th className="py-3 px-4 font-semibold">Cleaner</th>
                    <th className="py-3 px-4 font-semibold">Washroom Location</th>
                    <th className="py-3 px-4 font-semibold">Tier / State</th>
                    <th className="py-3 px-4 font-semibold">Score</th>
                    <th className="py-3 px-4 font-semibold">Timestamp</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {logs.map((log) => {
                    const eventCfg =
                      EVENT_TYPE_CONFIG[log.event_type] || {
                        label: log.event_type,
                        icon: Activity,
                        badgeClass: "bg-gray-500/10 text-gray-600 border-gray-500/20",
                        dotClass: "bg-gray-500",
                      };
                    const EventIcon = eventCfg.icon;

                    const cleanerName =
                      log.escalation?.cleaner_user?.name ||
                      log.actor_user?.name ||
                      "Cleaner";
                    const locationName = log.escalation?.location?.name || "Washroom";
                    const escalationState = log.escalation?.state || "OPEN";
                    const stateBadge =
                      STATE_BADGE_CONFIG[escalationState]?.badgeClass ||
                      "bg-gray-500/10 text-gray-600";

                    const level = log.level || log.escalation?.current_level || 1;

                    // Clean Score Handling: never render NaN
                    const hasValidScore =
                      log.score !== null &&
                      log.score !== undefined &&
                      !isNaN(Number(log.score)) &&
                      Number(log.score) > 0;
                    const scoreDisplay = hasValidScore ? Number(log.score).toFixed(1) : null;

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-[var(--surface-hover)] transition-colors group"
                      >
                        {/* Event Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${eventCfg.badgeClass}`}
                          >
                            <EventIcon className="w-3 h-3" />
                            {eventCfg.label}
                          </span>
                        </td>

                        {/* Incident Link */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {log.escalation_id ? (
                            <button
                              onClick={() => setSelectedIncidentId(log.escalation_id)}
                              className="font-mono font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              #{log.escalation_id}
                            </button>
                          ) : (
                            <span className="text-[var(--sidebar-muted)]">-</span>
                          )}
                        </td>

                        {/* Cleaner */}
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[var(--foreground)] truncate">
                            {cleanerName}
                          </p>
                        </td>

                        {/* Location */}
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-[var(--foreground)] truncate">
                            {locationName}
                          </p>
                        </td>

                        {/* Tier & State */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-muted border border-[var(--border)]">
                              Tier {level}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stateBadge}`}>
                              {escalationState}
                            </span>
                          </div>
                        </td>

                        {/* Score (Never NaN) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {scoreDisplay ? (
                            <div className="flex items-center gap-1 font-semibold">
                              <span className="text-amber-600 dark:text-amber-400">
                                {scoreDisplay}
                              </span>
                              <span className="text-[var(--sidebar-muted)] text-[10px] font-normal">
                                / 10
                              </span>
                            </div>
                          ) : (
                            <span className="text-[var(--sidebar-muted)]">—</span>
                          )}
                        </td>

                        {/* Timestamp */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <p className="font-medium text-[var(--foreground)]">
                            {formatTimeAgo(log.created_at)}
                          </p>
                          <p className="text-[10px] text-[var(--sidebar-muted)]">
                            {formatDateTime(log.created_at)}
                          </p>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => {
                              if (log.review_id) {
                                handleOpenReview(log.review_id);
                              } else if (log.escalation_id) {
                                setSelectedIncidentId(log.escalation_id);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] transition-all"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {log.review_id ? `Review #${log.review_id}` : "View"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* ===== PAGINATION BAR ===== */}
        {((viewMode === "incidents" ? incidentsPagination.totalPages : logsPagination.totalPages) || 1) > 1 && (
          <div className="px-4 py-3 border-t border-[var(--border)] flex items-center justify-between text-xs bg-[var(--background)]/40">
            <span className="text-[var(--sidebar-muted)]">
              Showing page <strong className="text-[var(--foreground)]">{page}</strong> of{" "}
              <strong className="text-[var(--foreground)]">
                {viewMode === "incidents" ? incidentsPagination.totalPages : logsPagination.totalPages}
              </strong>{" "}
              ({viewMode === "incidents" ? incidentsPagination.total : logsPagination.total} total items)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setPage((p) =>
                    Math.min(
                      viewMode === "incidents" ? incidentsPagination.totalPages : logsPagination.totalPages,
                      p + 1
                    )
                  )
                }
                disabled={
                  page >=
                  (viewMode === "incidents" ? incidentsPagination.totalPages : logsPagination.totalPages)
                }
                className="p-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* INCIDENT DETAIL / JOURNEY DRAWER (SIDE MODAL)                             */}
      {/* ========================================================================= */}
      {selectedIncidentId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl h-full bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-[var(--border)] flex items-start justify-between bg-[var(--background)]/60">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm">
                    Incident #{selectedIncidentId}
                  </span>
                  {activeIncidentDetail && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        STATE_BADGE_CONFIG[activeIncidentDetail.state]?.badgeClass || ""
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          STATE_BADGE_CONFIG[activeIncidentDetail.state]?.dotClass || ""
                        }`}
                      />
                      {activeIncidentDetail.state}
                    </span>
                  )}
                </div>
                {activeIncidentDetail && (
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {activeIncidentDetail.cleaner_user?.name || "Cleaner"} ·{" "}
                    {activeIncidentDetail.location?.name || "Washroom"}
                  </p>
                )}
                <p className="text-xs text-[var(--sidebar-muted)]">
                  Started on {activeIncidentDetail ? formatDateTime(activeIncidentDetail.created_at) : "..."}
                </p>
              </div>

              <button
                onClick={() => setSelectedIncidentId(null)}
                className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--sidebar-muted)] hover:text-[var(--foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {isDetailLoading || !activeIncidentDetail ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3">
                  <Loader size="lg" />
                  <p className="text-xs text-[var(--sidebar-muted)]">Loading incident journey...</p>
                </div>
              ) : (
                <>
                  {/* Key Stats Bar */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[var(--sidebar-muted)]">
                        Current Tier
                      </p>
                      <p className="text-base font-bold text-[var(--foreground)] mt-0.5">
                        Tier {activeIncidentDetail.current_level} / {activeIncidentDetail.max_level || 4}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[var(--sidebar-muted)]">
                        Attempts Used
                      </p>
                      <p className="text-base font-bold text-[var(--foreground)] mt-0.5">
                        {activeIncidentDetail.reviews?.length || 1} / {(activeIncidentDetail.max_retries ?? 2) + 1}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-semibold text-[var(--sidebar-muted)]">
                        Target Score
                      </p>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {activeIncidentDetail.threshold || 7.5} / 10
                      </p>
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* SECTION A: CLEANING ATTEMPTS (CLEANER REVIEW LIFECYCLE)            */}
                  {/* ================================================================= */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        A. Cleaning Attempts & Inspections
                      </h3>
                    </div>

                    <div className="space-y-3 relative pl-4 border-l-2 border-emerald-500/30 ml-2">
                      {activeIncidentDetail.reviews && activeIncidentDetail.reviews.length > 0 ? (
                        activeIncidentDetail.reviews.map((rev, idx) => {
                          const isOriginal = idx === 0 || rev.review_type === "ORIGINAL";
                          const attemptLabel = isOriginal ? "ORIGINAL INSPECTION" : `RETRY ATTEMPT #${idx}`;
                          const isPassed = Number(rev.score ?? 0) >= Number(activeIncidentDetail.threshold ?? 7.5);

                          return (
                            <div
                              key={rev.id}
                              className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-2.5 shadow-2xs relative"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                        isOriginal
                                          ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                          : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                      }`}
                                    >
                                      {attemptLabel}
                                    </span>
                                    <span className="font-mono text-xs font-bold text-[var(--foreground)]">
                                      Review #{rev.id}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-[var(--sidebar-muted)] mt-1">
                                    Submitted at {formatDateTime(rev.created_at)}
                                  </p>
                                </div>

                                <div className="text-right">
                                  <div className="flex items-baseline justify-end gap-1">
                                    <span
                                      className={`text-lg font-bold ${
                                        isPassed
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-amber-600 dark:text-amber-400"
                                      }`}
                                    >
                                      {rev.score !== null && rev.score !== undefined
                                        ? Number(rev.score).toFixed(1)
                                        : "—"}
                                    </span>
                                    <span className="text-xs text-[var(--sidebar-muted)]">/ 10</span>
                                  </div>
                                  <span
                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                      isPassed
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                        : "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                                    }`}
                                  >
                                    {isPassed ? "PASSED TARGET ✓" : "FAILED TARGET ✗"}
                                  </span>
                                </div>
                              </div>

                              {/* Action Link to Review */}
                              <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                                <span className="text-[10px] text-[var(--sidebar-muted)]">
                                  Status: <strong className="text-[var(--foreground)] capitalize">{rev.status}</strong>
                                </span>
                                <button
                                  onClick={() => handleOpenReview(rev.id)}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                  View Full Review Photos & Details
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-[var(--sidebar-muted)]">No review records found.</p>
                      )}
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* SECTION B: ESCALATION PROGRESSION JOURNEY                          */}
                  {/* ================================================================= */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        B. Escalation Tier Journey
                      </h3>
                    </div>

                    <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--background)] space-y-4">
                      {/* Step Progress Pills */}
                      <div className="flex items-center justify-between relative">
                        {[1, 2, 3, 4].map((tierNum, idx) => {
                          const isReached = tierNum <= (activeIncidentDetail.current_level || 1);
                          const roleName =
                            tierNum === 1
                              ? "Cleaner"
                              : tierNum === 2
                              ? "Supervisor"
                              : tierNum === 3
                              ? "Admin"
                              : "Facility Admin";

                          return (
                            <div key={tierNum} className="flex flex-col items-center relative z-10">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                                  isReached
                                    ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                                    : "bg-[var(--surface)] text-[var(--sidebar-muted)] border-[var(--border)]"
                                }`}
                              >
                                T{tierNum}
                              </div>
                              <span className="text-[10px] font-medium text-[var(--sidebar-muted)] mt-1 text-center">
                                {roleName}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tier Progression Logs with Nested Notifications */}
                      <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                        {activeIncidentDetail.events
                          ?.filter(
                            (e) =>
                              e.event_type === "SLA_BREACH" ||
                              e.event_type === "ESCALATION_ADVANCED" ||
                              e.event_type === "SLA_RESOLVED" ||
                              e.event_type === "SLA_EXHAUSTED"
                          )
                          .map((stageEvt) => {
                            // Find any supporting notification sent around this level
                            const relatedNotification = activeIncidentDetail.events?.find(
                              (n) =>
                                n.event_type === "NOTIFICATION_SENT" &&
                                n.level === stageEvt.level &&
                                Math.abs(
                                  new Date(n.created_at).getTime() - new Date(stageEvt.created_at).getTime()
                                ) < 60000
                            );

                            return (
                              <div
                                key={stageEvt.id}
                                className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 font-semibold text-[var(--foreground)]">
                                    <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                                    <span>
                                      {stageEvt.event_type === "SLA_BREACH"
                                        ? "Tier 1 — Initial SLA Breach"
                                        : stageEvt.event_type === "ESCALATION_ADVANCED"
                                        ? `Tier ${stageEvt.level} Advanced (${
                                            stageEvt.metadata?.targetRole || "Next Tier"
                                          })`
                                        : stageEvt.event_type === "SLA_RESOLVED"
                                        ? "SLA Resolved — Cleaned & Inspected"
                                        : "SLA Exhausted — Max Retries Exceeded"}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[var(--sidebar-muted)]">
                                    {formatTimeOnly(stageEvt.created_at)}
                                  </span>
                                </div>

                                {/* Nested Notification Info */}
                                {relatedNotification && (
                                  <div className="ml-5 pl-2 border-l-2 border-purple-500/40 text-[11px] text-[var(--sidebar-muted)] flex items-center gap-1.5 py-0.5">
                                    <Bell className="w-3 h-3 text-purple-500 shrink-0" />
                                    <span>
                                      Notification sent →{" "}
                                      <strong className="text-[var(--foreground)] capitalize">
                                        {relatedNotification.metadata?.targetRole || "Staff"}
                                      </strong>{" "}
                                      ({relatedNotification.metadata?.recipientsCount || 1} recipients)
                                    </span>
                                    <Check className="w-3 h-3 text-emerald-500 ml-auto shrink-0" />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* SECTION C: RAW AUDIT TRAIL TIMELINE                               */}
                  {/* ================================================================= */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)]">
                        C. Complete Chronological Audit Trail
                      </h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      {activeIncidentDetail.events?.map((evt) => {
                        const eventCfg =
                          EVENT_TYPE_CONFIG[evt.event_type] || {
                            label: evt.event_type,
                            icon: Activity,
                            badgeClass: "bg-gray-500/10 text-gray-600 border-gray-500/20",
                          };
                        const EvtIcon = eventCfg.icon;
                        const hasScore =
                          evt.score !== null &&
                          evt.score !== undefined &&
                          !isNaN(Number(evt.score)) &&
                          Number(evt.score) > 0;

                        return (
                          <div
                            key={evt.id}
                            className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${eventCfg.badgeClass} shrink-0`}
                              >
                                <EvtIcon className="w-2.5 h-2.5" />
                                {eventCfg.label}
                              </span>

                              <span className="text-[11px] text-[var(--foreground)] truncate">
                                {evt.metadata?.targetRole
                                  ? `Role: ${evt.metadata.targetRole}`
                                  : evt.review_id
                                  ? `Review #${evt.review_id}`
                                  : evt.actor_user?.name || "System"}
                              </span>

                              {hasScore && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-semibold shrink-0">
                                  Score: {Number(evt.score).toFixed(1)}/10
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] text-[var(--sidebar-muted)] shrink-0 font-mono">
                              {formatTimeOnly(evt.created_at)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-end">
              <button
                onClick={() => setSelectedIncidentId(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] transition-all shadow-xs"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
