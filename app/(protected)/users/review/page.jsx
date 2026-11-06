"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useUserReviews } from "@/features/users/review/reviews.queries";
import { useDropdownLocations } from "@/features/dropdownList/dropdownlist.query";
import { getReasonsList } from "@/features/users/review/reviewReasons";
import {
  MessageSquare,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Eye,
  RotateCcw,
  Cpu,
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

// Helper function to clean malformed strings
const cleanString = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/^["'\s]+|["'\s,]+$/g, "")
    .trim();
};

// Helper to get star rating badge styling (theme-adaptive)
const getRatingColor = (rating) => {
  if (rating >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (rating >= 5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const getRatingBg = (rating) => {
  if (rating >= 8) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
  if (rating >= 5) return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
  return "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
};

// Severity badge colors for reported reasons
const getReasonBadgeStyle = (severity) => {
  switch (severity) {
    case "critical":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "none":
    case "positive":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    default:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  }
};

// Helper to format date and time in AM/PM (e.g. "29 Oct 2026, 09:30 AM")
const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";

  const formattedDate = date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${formattedDate}, ${formattedTime}`;
};

export default function UserReviewsPage() {
  const router = useRouter();
  const { companyId } = useCompanyId();

  // State management
  const [viewMode, setViewMode] = useState("card"); // 'card' | 'list'
  const [dateFilterType, setDateFilterType] = useState("today"); // By default show only today's reviews
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all"); // 'all' | 'high' | 'mid' | 'low'
  const [selectedWashroom, setSelectedWashroom] = useState("all"); // 'all' | locationId
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 50;

  // Fetch washroom locations for the company
  const { data: locationsResponse = [], isLoading: isLoadingLocations } = useDropdownLocations(companyId);
  const locations = useMemo(() => {
    if (Array.isArray(locationsResponse)) return locationsResponse;
    if (Array.isArray(locationsResponse?.data)) return locationsResponse.data;
    return [];
  }, [locationsResponse]);

  // Derive date query parameters for API
  const dateParams = useMemo(() => {
    const now = new Date();
    const toDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    if (dateFilterType === "today") {
      return { date: toDateStr };
    }
    if (dateFilterType === "week") {
      const past = new Date();
      past.setDate(now.getDate() - 7);
      const pastStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`;
      return { from_date: pastStr, to_date: toDateStr };
    }
    if (dateFilterType === "month") {
      const past = new Date();
      past.setDate(now.getDate() - 30);
      const pastStr = `${past.getFullYear()}-${String(past.getMonth() + 1).padStart(2, "0")}-${String(past.getDate()).padStart(2, "0")}`;
      return { from_date: pastStr, to_date: toDateStr };
    }
    if (dateFilterType === "custom") {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      return params;
    }
    return {};
  }, [dateFilterType, fromDate, toDate]);

  const ratingParams = useMemo(() => {
    if (ratingFilter === "high") return { min_rating: 8, max_rating: 10 };
    if (ratingFilter === "mid") return { min_rating: 5, max_rating: 7.99 };
    if (ratingFilter === "low") return { min_rating: 0, max_rating: 4.99 };
    return {};
  }, [ratingFilter]);

  // Fetch reviews using TanStack Query
  const { data, isLoading, isError, error, refetch, isFetching } = useUserReviews({
    company_id: companyId,
    location_id: selectedWashroom !== "all" ? selectedWashroom : undefined,
    limit,
    page,
    search: searchQuery.trim() || undefined,
    issues_only: issuesOnly ? "true" : undefined,
    ...ratingParams,
    ...dateParams,
  });

  const rawReviews = data?.reviews || [];
  const pagination = data?.pagination || {
    total: data?.count ?? rawReviews.length,
    page: 1,
    limit: 50,
    totalPages: 1,
  };
  const stats = data?.stats || {
    total: pagination.total,
    today: 0,
    avgRating: 0,
    issuesCount: 0,
  };

  const filteredReviews = rawReviews;

  // Calculate KPIs from backend stats for 100% accuracy across all reviews
  const kpiStats = useMemo(() => {
    return {
      total: stats?.total ?? 0,
      todaysCount: stats?.today ?? 0,
      avgRating:
        typeof stats?.avgRating === "number"
          ? stats.avgRating.toFixed(1)
          : String(stats?.avgRating || "0.0"),
      issuesCount: stats?.issuesCount ?? 0,
    };
  }, [stats]);

  const handleResetFilters = () => {
    setDateFilterType("today");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
    setRatingFilter("all");
    setSelectedWashroom("all");
    setIssuesOnly(false);
    setPage(1);
    toast.success("Filters reset to Today");
  };

  const handleCardClick = (reviewId) => {
    router.push(`/users/review/${reviewId}${companyId ? `?companyId=${companyId}` : ""}`);
  };

  // Show loader while initial loading
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[75vh] gap-4">
        <Loader size="large" color="#4f46e5" message="Loading user reviews..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-[75vh]">
        <div className="text-center p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)] max-w-md shadow-lg">
          <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold mb-2">Unable to load reviews</h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-6">
            {error?.response?.data?.error || "A connection error occurred while retrieving feedback."}
          </p>
          <button
            onClick={() => refetch()}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-95 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 transition-colors">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">User Reviews</h1>
                  <p className="text-xs sm:text-sm text-[var(--muted-foreground)] mt-0.5">
                    Real-time citizen feedback, ratings, and reported facility issues
                  </p>
                </div>
              </div>
            </div>

            {/* View Mode Toggle & Reset */}
            <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-between md:justify-end">
              <div className="flex items-center p-1 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-sm">
                <button
                  onClick={() => setViewMode("card")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === "card"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--muted)]"
                  }`}
                  title="Card View"
                >
                  <LayoutGrid size={15} />
                  <span>Cards</span>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    viewMode === "list"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--muted)]"
                  }`}
                  title="List View"
                >
                  <ListIcon size={15} />
                  <span>List</span>
                </button>
              </div>

              {(dateFilterType !== "today" || ratingFilter !== "all" || selectedWashroom !== "all" || searchQuery || issuesOnly || fromDate || toDate) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--surface)] hover:bg-[var(--muted)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-foreground transition shadow-sm cursor-pointer"
                  title="Reset all filters"
                >
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>

          {/* KPI Summary Cards (Clickable to quickly filter) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Reviews (Click to view all) */}
            <div
              onClick={() => {
                setDateFilterType("all");
                setIssuesOnly(false);
                setRatingFilter("all");
                setPage(1);
              }}
              className={`bg-[var(--surface)] border rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer hover:border-primary/60 hover:shadow-md select-none group ${
                dateFilterType === "all" && !issuesOnly && ratingFilter === "all"
                  ? "ring-2 ring-blue-500 border-blue-500 bg-blue-500/[0.04]"
                  : "border-[var(--border)]"
              }`}
              title="Click to view all lifetime reviews"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-blue-500 transition-colors">
                  Total Reviews
                </span>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-foreground">{kpiStats.total}</p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1 flex items-center justify-between">
                <span>Lifetime QR submissions</span>
                <span className="text-[10px] font-semibold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Filter →</span>
              </p>
            </div>

            {/* Today's Reviews (Click to view today's reviews) */}
            <div
              onClick={() => {
                setDateFilterType("today");
                setIssuesOnly(false);
                setRatingFilter("all");
                setPage(1);
              }}
              className={`bg-[var(--surface)] border rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer hover:border-indigo-500/60 hover:shadow-md select-none group ${
                dateFilterType === "today" && !issuesOnly && ratingFilter === "all"
                  ? "ring-2 ring-indigo-500 border-indigo-500 bg-indigo-500/[0.04]"
                  : "border-[var(--border)]"
              }`}
              title="Click to view today's reviews"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-indigo-500 transition-colors">
                  Today's Reviews
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <Calendar size={16} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-primary">{kpiStats.todaysCount}</p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1 flex items-center justify-between">
                <span>Submitted in last 24h</span>
                <span className="text-[10px] font-semibold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">Filter →</span>
              </p>
            </div>

            {/* Average Rating (Click to filter great ratings) */}
            <div
              onClick={() => {
                setRatingFilter((prev) => (prev === "high" ? "all" : "high"));
                setIssuesOnly(false);
                setPage(1);
              }}
              className={`bg-[var(--surface)] border rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer hover:border-amber-500/60 hover:shadow-md select-none group ${
                ratingFilter === "high"
                  ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/[0.04]"
                  : "border-[var(--border)]"
              }`}
              title="Click to toggle Great rating (8-10) reviews"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-amber-500 transition-colors">
                  Average Rating
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star size={16} className="fill-current" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl sm:text-3xl font-black text-foreground">{kpiStats.avgRating}</p>
                <span className="text-xs font-bold text-amber-500">/ 10</span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1 flex items-center justify-between">
                <span>Cumulative sentiment score</span>
                <span className="text-[10px] font-semibold text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">Filter →</span>
              </p>
            </div>

            {/* Reported Issues (Click to filter reviews with issues) */}
            <div
              onClick={() => {
                setIssuesOnly((prev) => !prev);
                setPage(1);
              }}
              className={`bg-[var(--surface)] border rounded-2xl p-4 sm:p-5 shadow-sm transition-all cursor-pointer hover:border-rose-500/60 hover:shadow-md select-none group ${
                issuesOnly
                  ? "ring-2 ring-rose-500 border-rose-500 bg-rose-500/[0.04]"
                  : "border-[var(--border)]"
              }`}
              title="Click to toggle reviews with flagged issues"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] group-hover:text-rose-500 transition-colors">
                  Issues Flagged
                </span>
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-black text-rose-500">{kpiStats.issuesCount}</p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1 flex items-center justify-between">
                <span>Reviews with specific issues</span>
                <span className="text-[10px] font-semibold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  {issuesOnly ? "Active ✓" : "Filter →"}
                </span>
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 space-y-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Search by reviewer, phone, email, or washroom location..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-foreground placeholder-[var(--muted-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-foreground cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Washroom Location Dropdown Filter */}
              <div className="relative flex items-center min-w-[200px] sm:min-w-[260px]">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-primary">
                  <MapPin size={15} />
                </div>
                <select
                  value={selectedWashroom}
                  onChange={(e) => {
                    setSelectedWashroom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-[var(--background)] border border-[var(--border)] text-foreground text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer transition appearance-none shadow-2xs"
                  aria-label="Filter by Washroom"
                >
                  <option value="all">
                    All Washrooms {locations.length > 0 ? `(${locations.length})` : ""}
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--muted-foreground)]">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Date Filter Tabs (Today, Week, Month, Custom) */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[var(--background)] border border-[var(--border)]">
                {[
                  { id: "all", label: "All Time" },
                  { id: "today", label: "Today" },
                  { id: "week", label: "This Week" },
                  { id: "month", label: "This Month" },
                  { id: "custom", label: "Custom" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setDateFilterType(tab.id);
                      setPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      dateFilterType === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--surface)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub-Filters: Custom Date Picker & Rating Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
              {/* Rating Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-semibold text-[var(--muted-foreground)] mr-1 flex items-center gap-1">
                  <Filter size={12} /> Rating:
                </span>
                {[
                  { id: "all", label: "All" },
                  { id: "high", label: "★ 8-10 (Great)" },
                  { id: "mid", label: "★ 5-7 (Average)" },
                  { id: "low", label: "★ 1-4 (Poor)" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => {
                      setRatingFilter(pill.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border cursor-pointer ${
                      ratingFilter === pill.id
                        ? "bg-primary/10 border-primary text-primary font-bold"
                        : "bg-transparent border-[var(--border)] text-[var(--muted-foreground)] hover:text-foreground"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}

                {/* Active Issues Flagged Filter Chip */}
                {issuesOnly && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/20 text-rose-500 animate-in fade-in">
                    <AlertCircle size={12} />
                    <span>Issues Only</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIssuesOnly(false);
                        setPage(1);
                      }}
                      className="p-0.5 hover:bg-rose-500/20 rounded-full transition cursor-pointer"
                      title="Clear issues filter"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Active Washroom Filter Chip */}
                {selectedWashroom !== "all" && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 text-primary animate-in fade-in">
                    <MapPin size={12} />
                    <span className="truncate max-w-[200px]">
                      {locations.find((l) => String(l.id) === String(selectedWashroom))?.name || `Washroom #${selectedWashroom}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedWashroom("all");
                        setPage(1);
                      }}
                      className="p-0.5 hover:bg-primary/20 rounded-full transition cursor-pointer"
                      title="Clear washroom filter"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Custom Date Range Picker (shown when 'custom' is active) */}
              {dateFilterType === "custom" && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[var(--surface-muted)]/50 px-2.5 py-1.5 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] whitespace-nowrap">
                      From:
                    </span>
                    <input
                      type="date"
                      value={fromDate}
                      max={toDate || undefined}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFromDate(val);
                        if (toDate && val > toDate) {
                          setToDate(val);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--background)] border border-[var(--border)] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-xs"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[var(--muted-foreground)] whitespace-nowrap">
                      To:
                    </span>
                    <input
                      type="date"
                      value={toDate}
                      min={fromDate || undefined}
                      onChange={(e) => {
                        const val = e.target.value;
                        setToDate(val);
                        if (fromDate && val < fromDate) {
                          setFromDate(val);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--background)] border border-[var(--border)] text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer shadow-xs"
                    />
                  </div>

                  {(fromDate || toDate) && (
                    <button
                      type="button"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                      className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-foreground hover:bg-[var(--surface)] transition cursor-pointer"
                      title="Clear custom date range"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active Filter Summary Bar */}
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] px-1">
            <span>
              Showing{" "}
              <strong className="text-foreground">
                {pagination.total > 0 ? (page - 1) * limit + 1 : 0}
              </strong>
              {" - "}
              <strong className="text-foreground">
                {Math.min(page * limit, pagination.total)}
              </strong>{" "}
              of <strong className="text-foreground">{pagination.total}</strong> reviews
              {isFetching && (
                <span className="ml-2 text-primary font-medium animate-pulse">
                  (Loading...)
                </span>
              )}
            </span>
            {pagination.totalPages > 1 && (
              <span className="text-[11px] font-medium text-[var(--muted-foreground)]">
                Page {page} of {pagination.totalPages}
              </span>
            )}
          </div>

          {/* Content: Card Grid View or List Table View */}
          {filteredReviews.length === 0 ? (
            /* Empty State */
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-20 px-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={32} />
              </div>
              <h3 className="text-xl font-bold text-foreground">No user reviews match your criteria</h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto mt-2">
                Try switching date ranges, clearing your search query, or resetting rating filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs transition shadow-sm hover:opacity-95 cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : viewMode === "card" ? (
            /* ========================================================
               CARD GRID VIEW
               ======================================================== */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredReviews.map((review, idx) => {
                const reasons = getReasonsList(review.reason_ids);
                const displayImages = review.images?.slice(0, 3) || [];
                const reviewerName = cleanString(review.name) || "Anonymous Citizen";
                const locationName = review?.location?.name || "Washroom Facility";
                const serialNumber = (page - 1) * limit + idx + 1;

                return (
                  <div
                    key={review.id}
                    onClick={() => handleCardClick(review.id)}
                    className="group bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0"
                              title={`Review #${serialNumber}`}
                            >
                              #{serialNumber}
                            </span>
                            <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                              {reviewerName}
                            </h3>
                            {String(companyId) !== "95" && review.token_number && (
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                                #{review.token_number}
                              </span>
                            )}
                          </div>
                          <p className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] mt-1 truncate">
                            <MapPin size={12} className="text-primary shrink-0" />
                            <span className="truncate">{locationName}</span>
                          </p>
                        </div>

                        {/* Rating Badges */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <div
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-extrabold ${getRatingBg(
                              review.rating
                            )}`}
                          >
                            <Star size={13} className="fill-current" />
                            <span>{review.rating}/10</span>
                          </div>

                          {review.ai_score !== null && review.ai_score !== undefined && (
                            <div
                              className="flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                              title="AI Hygiene Score"
                            >
                              <Cpu size={11} />
                              <span>AI: {review.ai_score}/10</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selected Reasons / Issues Badges */}
                      {reasons.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {reasons.slice(0, 2).map((r) => (
                            <span
                              key={r.id}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 ${getReasonBadgeStyle(
                                r.severity
                              )}`}
                            >
                              {r.id === 0 ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                              <span>{r.shortText}</span>
                            </span>
                          ))}
                          {reasons.length > 2 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)]">
                              +{reasons.length - 2} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Comment / Description */}
                      {review.description ? (
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-2 mb-3.5 bg-[var(--background)] p-2.5 rounded-xl border border-[var(--border)]">
                          "{cleanString(review.description)}"
                        </p>
                      ) : (
                        <p className="text-xs italic text-[var(--muted-foreground)] opacity-60 mb-3.5">
                          No text feedback provided
                        </p>
                      )}

                      {/* Photos Thumbnails (hidden for company 95) */}
                      {String(companyId) !== "95" && displayImages.length > 0 && (
                        <div className="flex gap-2 mb-3.5">
                          {displayImages.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              className="w-14 h-14 rounded-lg overflow-hidden border border-[var(--border)] bg-[var(--muted)] relative"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imgUrl}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                            </div>
                          ))}
                          {review.images?.length > 3 && (
                            <div className="w-14 h-14 rounded-lg bg-[var(--muted)] border border-[var(--border)] flex flex-col items-center justify-center text-[10px] font-bold text-[var(--muted-foreground)]">
                              +{review.images.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer Info & Details Button */}
                    <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar size={12} className="shrink-0" />
                        <span>{formatDateTime(review.created_at)}</span>
                      </span>

                      <span className="inline-flex items-center gap-1 font-bold text-primary text-xs group-hover:translate-x-0.5 transition-transform shrink-0">
                        <span>Details</span>
                        <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ========================================================
               LIST / TABLE VIEW
               ======================================================== */
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--background)] border-b border-[var(--border)] text-[var(--muted-foreground)] uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th className="py-3.5 px-3 text-center w-12">#</th>
                      <th className="py-3.5 px-4">Reviewer</th>
                      <th className="py-3.5 px-4">Facility / Location</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Reported Issues</th>
                      <th className="py-3.5 px-4">Comment</th>
                      <th className="py-3.5 px-4">Date & Time</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredReviews.map((review, idx) => {
                      const reasons = getReasonsList(review.reason_ids);
                      const reviewerName = cleanString(review.name) || "Anonymous Citizen";
                      const locationName = review?.location?.name || "Washroom Facility";
                      const serialNumber = (page - 1) * limit + idx + 1;

                      return (
                        <tr
                          key={review.id}
                          onClick={() => handleCardClick(review.id)}
                          className="hover:bg-[var(--background)] transition-colors cursor-pointer group"
                        >
                          {/* Serial Number */}
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-xs text-primary/80">
                            #{serialNumber}
                          </td>

                          {/* Reviewer */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                              {reviewerName}
                            </div>
                            {review.phone && (
                              <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
                                <Phone size={10} />
                                <span>{cleanString(review.phone)}</span>
                              </div>
                            )}
                          </td>

                          {/* Location */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-foreground flex items-center gap-1">
                              <MapPin size={12} className="text-primary shrink-0" />
                              <span>{locationName}</span>
                            </div>
                            {review.token_number && (
                              <div className="text-[10px] font-mono text-[var(--muted-foreground)] mt-0.5">
                                Token #{review.token_number}
                              </div>
                            )}
                          </td>

                          {/* Rating */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2.5 py-1 rounded-md border text-xs font-black inline-flex items-center gap-1 ${getRatingBg(
                                  review.rating
                                )}`}
                              >
                                <Star size={12} className="fill-current" />
                                {review.rating}/10
                              </span>
                              {review.ai_score !== null && review.ai_score !== undefined && (
                                <span className="px-2 py-0.5 rounded border text-[10px] font-bold bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                                  AI: {review.ai_score}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Reported Issues */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {reasons.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {reasons.slice(0, 2).map((r) => (
                                  <span
                                    key={r.id}
                                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${getReasonBadgeStyle(
                                      r.severity
                                    )}`}
                                  >
                                    {r.id === 0 ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
                                    <span>{r.shortText}</span>
                                  </span>
                                ))}
                                {reasons.length > 2 && (
                                  <span className="text-[10px] px-1 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                                    +{reasons.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[var(--muted-foreground)] italic text-[11px]">—</span>
                            )}
                          </td>

                          {/* Comment */}
                          <td className="py-3.5 px-4 max-w-sm">
                            {review.description ? (
                              <span className="text-foreground line-clamp-1">
                                "{cleanString(review.description)}"
                              </span>
                            ) : (
                              <span className="text-[var(--muted-foreground)] italic opacity-60">None</span>
                            )}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-[var(--muted-foreground)] whitespace-nowrap">
                            {formatDateTime(review.created_at)}
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-right">
                            <button className="px-3 py-1.5 rounded-lg bg-[var(--background)] hover:bg-primary hover:text-primary-foreground text-foreground font-semibold border border-[var(--border)] transition inline-flex items-center gap-1 cursor-pointer">
                              <Eye size={12} />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm">
              <div className="text-xs text-[var(--muted-foreground)] font-medium">
                Showing{" "}
                <strong className="text-foreground">
                  {(page - 1) * limit + 1}
                </strong>{" "}
                to{" "}
                <strong className="text-foreground">
                  {Math.min(page * limit, pagination.total)}
                </strong>{" "}
                of <strong className="text-foreground">{pagination.total}</strong> reviews
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page <= 1}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={14} />
                  <span>Prev</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - page) <= 1
                    )
                    .reduce((acc, p, i, arr) => {
                      if (i > 0 && p - arr[i - 1] > 1) {
                        acc.push(-1); // ellipsis
                      }
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === -1 ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-1 text-xs text-[var(--muted-foreground)]"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => {
                            setPage(item);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                            page === item
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-foreground"
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => {
                    setPage((p) => Math.min(pagination.totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
