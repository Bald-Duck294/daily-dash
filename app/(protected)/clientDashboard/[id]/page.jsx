"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  ClipboardList,
  CheckCircle2,
  Wrench,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Filter,
  Plus,
  UserPlus,
  FileText,
  Activity,
  ArrowUp,
  ArrowDown,
  Calendar,
  MoreVertical,
  BarChart2,
  UserCheck,
  Star,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  WashroomCleanlinessChart,
  CleanerPerformanceChart,
} from "@/components/graphs/dashboard/dashboardCharts";
import {
  useDashboardCounts,
  useDashboardAllLocations,
  useDashboardActivities,
  useWashroomScoresSummary,
  useCleanerPerformance,
  useGetWashroomHygieneHeatmap,
} from "@/features/Dashboard/Dashboard.queries";

// --- SKELETON COMPONENTS ---
const StatSkeleton = () => (
  <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse flex flex-col gap-3">
    <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800" />
    <div className="space-y-2 mt-2">
      <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
      <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
    </div>
  </div>
);

// --- UI COMPONENTS ---
const CardHeader = ({ title, subtitle, icon, rightAction }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      {icon && <div>{icon}</div>}
      <div>
        <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {rightAction && <div className="relative">{rightAction}</div>}
  </div>
);

const CardShell = ({ children, className = "" }) => (
  <div
    className={`bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 ${className}`}
  >
    {children}
  </div>
);

const StatCard = ({
  title,
  value,
  icon: Icon,
  colorClass,
  trend,
  trendValue,
  onClick,
}) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between relative overflow-hidden"
  >
    <div className="flex items-center gap-3">
      <div
        className={`h-9 w-9 rounded-lg flex items-center justify-center text-white ${colorClass}`}
      >
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-none mb-0.5">
          {value || 0}
        </h4>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </p>
      </div>
    </div>

    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold">
      {trend === "up" && (
        <>
          <ArrowUp size={12} className="text-emerald-500" />
          <span className="text-emerald-500">{trendValue}</span>
        </>
      )}
      {trend === "down" && (
        <>
          <ArrowDown size={12} className="text-rose-500" />
          <span className="text-rose-500">{trendValue}</span>
        </>
      )}
      {trend === "neutral" && (
        <>
          <span className="text-slate-400 dark:text-slate-500">—</span>
          <span className="text-slate-400 dark:text-slate-500">
            {trendValue}
          </span>
        </>
      )}
      <span className="text-slate-400 dark:text-slate-500 font-medium ml-1 hidden xl:inline">
        vs last week
      </span>
    </div>
  </div>
);

// --- HELPERS ---
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const stopDate = new Date(endDate);
  while (currentDate <= stopDate) {
    dates.push(new Date(currentDate).toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export default function ClientDashboard() {
  const { canView } = usePermissions();
  const router = useRouter();
  const { companyId } = useCompanyId();

  // Permissions
  const canViewLocations = canView(MODULES.LOCATIONS);
  const canViewCleanerReviews = canView(MODULES.CLEANER_REVIEWS);
  const canViewUsers = canView(MODULES.USERS);
  const canViewReports = canView(MODULES.REPORTS);

  const todayDate = new Date();
  const todayStr = todayDate.toISOString().split("T")[0];

  // Filters State
  const [dateRange, setDateRange] = useState({
    startDate: todayStr,
    endDate: todayStr,
  });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [tempDates, setTempDates] = useState({
    startDate: todayStr,
    endDate: todayStr,
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const filterMenuRef = useRef(null);

  const activeCompanyIdForLocations = canViewLocations ? companyId : null;
  const activeCompanyIdForReviews = canViewCleanerReviews ? companyId : null;

  // --- Core Dashboard Data Hooks ---
  const { data: statsData = {}, isLoading: isCountsLoading } =
    useDashboardCounts(companyId, dateRange);
  const { data: topLocations = [], isLoading: isTopLocLoading } =
    useDashboardAllLocations(activeCompanyIdForLocations, dateRange);
  const { data: recentActivities = [], isLoading: isActivitiesLoading } =
    useDashboardActivities(activeCompanyIdForReviews, 500, dateRange);
  const { data: washroomGraphData = [], isLoading: isWashroomLoading } =
    useWashroomScoresSummary(activeCompanyIdForLocations, dateRange);

  // Cleaner Performance Hook
  let cleanerStartDateStr = dateRange.startDate;
  let cleanerEndDateStr = dateRange.endDate;

  const cStart = new Date(cleanerStartDateStr);
  const cEnd = new Date(cleanerEndDateStr);
  const diffDaysCleaner = Math.ceil(
    Math.abs(cEnd - cStart) / (1000 * 60 * 60 * 24),
  );

  if (diffDaysCleaner < 6) {
    const forcedStart = new Date(cEnd);
    forcedStart.setDate(cEnd.getDate() - 6);
    cleanerStartDateStr = forcedStart.toISOString().split("T")[0];
  }

  const { data: cleanerResponse, isLoading: isCleanerLoading } =
    useCleanerPerformance(activeCompanyIdForReviews, {
      startDate: cleanerStartDateStr,
      endDate: cleanerEndDateStr,
    });

  const cleanerGraphData = cleanerResponse?.data || [];
  const cleanerStats = cleanerResponse?.stats || {
    totalTasks: 0,
    averagePerDay: 0,
    bestDay: "-",
    bestDayCount: 0,
    completionRate: 0,
  };

  const getCleanerPerformanceTitle = () => {
    if (!dateRange.startDate || !dateRange.endDate)
      return "WEEKLY CLEANER PERFORMANCE";
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) return "WEEKLY CLEANER PERFORMANCE";
    if (diffDays >= 28) return "MONTHLY CLEANER PERFORMANCE";

    return `CLEANER PERFORMANCE (${start.toLocaleDateString("en-US", { day: "numeric", month: "short" }).toUpperCase()} TO ${end.toLocaleDateString("en-US", { day: "numeric", month: "short" }).toUpperCase()})`;
  };

  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  // --- Report Hook for Heatmap ---
  let heatmapStartDateStr = dateRange.startDate;
  let heatmapEndDateStr = dateRange.endDate;

  const hStart = new Date(heatmapStartDateStr);
  const hEnd = new Date(heatmapEndDateStr);
  const diffDaysHeatmap = Math.ceil(
    Math.abs(hEnd - hStart) / (1000 * 60 * 60 * 24),
  );

  if (diffDaysHeatmap === 0) {
    const forcedStart = new Date(hEnd);
    forcedStart.setDate(hEnd.getDate() - 29);
    heatmapStartDateStr = forcedStart.toISOString().split("T")[0];
  } else if (diffDaysHeatmap < 28) {
    const forcedEnd = new Date(hStart);
    forcedEnd.setDate(hStart.getDate() + 29);
    heatmapEndDateStr = forcedEnd.toISOString().split("T")[0];
  }

  const { data: heatmapResponse, isLoading: isHeatmapLoading } =
    useGetWashroomHygieneHeatmap({
      company_id: companyId,
      start_date: heatmapStartDateStr,
      end_date: heatmapEndDateStr,
    });
  const rawHeatmapData = heatmapResponse?.data || [];
  const heatmapData = [...rawHeatmapData].sort((a, b) => {
    const getCount = (row) =>
      row.daily_scores
        ? Object.values(row.daily_scores).filter(
            (val) => val !== null && val !== undefined && val !== "",
          ).length
        : 0;
    return getCount(b) - getCount(a);
  });
  const heatmapDatesArray = getDatesInRange(
    heatmapStartDateStr,
    heatmapEndDateStr,
  ).reverse();

  const applyDateFilter = () => {
    setDateRange(tempDates);
    setShowFilterMenu(false);
  };

  const handlePresetSelect = (preset) => {
    const today = new Date();
    const endStr = today.toISOString().split("T")[0];
    let startStr = endStr;

    if (preset === "week") {
      const d = new Date();
      d.setDate(today.getDate() - 7);
      startStr = d.toISOString().split("T")[0];
    } else if (preset === "month") {
      const d = new Date();
      d.setDate(today.getDate() - 30);
      startStr = d.toISOString().split("T")[0];
    }

    const newRange = { startDate: startStr, endDate: endStr };
    setDateRange(newRange);
    setTempDates(newRange);
    setShowFilterMenu(false);
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getScoreForDate = (row, dateStr) => {
    if (!row.daily_scores) return null;
    return row.daily_scores[dateStr] ?? null;
  };

  const getHeatmapColor = (score) => {
    if (score === null || score === undefined || score === "")
      return "bg-slate-50 dark:bg-slate-800/50 text-transparent";
    const num = Number(score);
    if (num >= 9)
      return "bg-emerald-200/60 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300";
    if (num >= 7)
      return "bg-blue-200/60 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300";
    if (num >= 5)
      return "bg-orange-200/60 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300";
    return "bg-red-200/60 dark:bg-red-500/20 text-red-800 dark:text-red-300";
  };

  if (
    !canViewLocations &&
    !canViewCleanerReviews &&
    !canViewUsers &&
    !canViewReports
  ) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Limited Access
      </div>
    );
  }

  const overallScore =
    washroomGraphData.length > 0
      ? (
          washroomGraphData.reduce(
            (acc, curr) => acc + Number(curr.average_score || 0),
            0,
          ) / washroomGraphData.length
        ).toFixed(2)
      : "0.0";

  const groupedActivities = recentActivities.reduce((acc, activity) => {
    let actDateStr = "Today";
    if (activity.timestamp) {
      const d = new Date(activity.timestamp);
      const isToday = d.toDateString() === new Date().toDateString();
      actDateStr = isToday
        ? "Today"
        : d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
    }
    if (!acc[actDateStr]) acc[actDateStr] = [];
    acc[actDateStr].push(activity);
    return acc;
  }, {});

  const isSlaEnabled = Boolean(statsData?.isSlaEnabled);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-3 sm:p-4 md:p-6 font-sans md:mt-[-10px]">
      {/* SLA Status Header Badge (Displayed only if company SLA is ON) */}
      {isSlaEnabled && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/20 mb-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>SLA Management Active</span>
            <span className="text-slate-400 dark:text-slate-600 font-normal">|</span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Pass Threshold: <strong className="text-emerald-700 dark:text-emerald-300">{statsData.slaThreshold || 8.0}/10</strong>
            </span>
            <span className="text-slate-400 dark:text-slate-600 font-normal">|</span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Max Retries: <strong className="text-cyan-700 dark:text-cyan-300">{statsData.slaMaxRetries || 2}</strong>
            </span>
          </div>
          <button
            onClick={() => router.push(`/sla-management?companyId=${companyId}`)}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-white underline underline-offset-2 inline-flex items-center gap-1 transition-colors"
          >
            Manage SLA <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mt-[-30px]">
        {isCountsLoading ? (
          Array(5)
            .fill(0)
            .map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            {canViewLocations && (
              <StatCard
                title="Total Toilets"
                value={statsData.totalLocations}
                icon={MapPin}
                colorClass="bg-blue-500"
                trend="up"
                trendValue="↑ 8%"
                onClick={() => router.push(`/washrooms?companyId=${companyId}`)}
              />
            )}
            {canViewCleanerReviews && (
              <StatCard
                title="Ongoing Tasks"
                value={statsData.ongoingTasks}
                icon={ClipboardList}
                colorClass="bg-emerald-500"
                trend="neutral"
                trendValue="No change"
                onClick={() =>
                  router.push(`/cleaners?companyId=${companyId}&status=ongoing`)
                }
              />
            )}
            {canViewCleanerReviews && (
              <StatCard
                title="Completed Tasks"
                value={statsData.completedTasks}
                icon={CheckCircle2}
                colorClass="bg-cyan-400"
                trend="up"
                trendValue="↑ 25%"
                onClick={() =>
                  router.push(
                    `/cleaners?companyId=${companyId}&status=completed`,
                  )
                }
              />
            )}
            {canViewReports && (
              <StatCard
                title="Total Repairs"
                value={statsData.totalRepairs}
                icon={Wrench}
                colorClass="bg-amber-500"
                trend="neutral"
                trendValue="No change"
                onClick={() => router.push(`/repairs?companyId=${companyId}`)}
              />
            )}
            {canViewUsers && (
              <StatCard
                title="Total Cleaners"
                value={statsData.totalCleaners}
                icon={UserCheck}
                colorClass="bg-purple-500"
                trend="up"
                trendValue="↑ 9%"
                onClick={() =>
                  router.push(`/users?flag=cleaner&companyId=${companyId}`)
                }
              />
            )}
          </>
        )}
      </div>

      {/* 2. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch md:mt-[-15px]">
        {/* Cleanliness Overview */}
        {canViewLocations && (
          <CardShell className="h-full flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 mb-4">
              <div className="flex items-start md:items-center gap-3">
                <div className="text-cyan-500 mt-0.5 md:mt-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                    CLEANLINESS OVERVIEW
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Top 5 Locations by Cleanliness Score
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
                  Current Score
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>{" "}
                  Average Score
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mt-6 flex-1 gap-8 md:gap-0 w-full">
              <div className="relative shrink-0 h-40 w-40 flex items-center justify-center rounded-full border-[12px] border-emerald-400 dark:border-emerald-500 border-r-emerald-200 dark:border-r-emerald-900">
                <div className="text-center">
                  <span className="text-4xl font-black text-slate-800 dark:text-white">
                    {overallScore}
                  </span>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">
                    Overall Score
                  </p>
                </div>
              </div>

              <div className="flex-1 w-full ml-0 md:ml-8 flex flex-col justify-center space-y-6">
                {isWashroomLoading ? (
                  <Loader />
                ) : (
                  washroomGraphData.slice(0, 5).map((loc, i) => (
                    <div
                      key={loc.location_id || i}
                      className="flex items-center justify-between text-[11px] font-semibold w-full"
                    >
                      <span
                        className="text-slate-600 dark:text-slate-300 w-1/3 truncate pr-2"
                        title={loc.location_name}
                      >
                        {loc.location_name}
                      </span>
                      <div className="flex-1 flex flex-col gap-1.5 mx-2">
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{
                              width: `${(Number(loc.current_score || 0) / 10) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="bg-blue-400 h-full rounded-full"
                            style={{
                              width: `${(Number(loc.average_score || 0) / 10) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-8 text-right shrink-0 flex flex-col gap-0.5">
                        <span className="text-slate-800 dark:text-slate-100 font-bold leading-none">
                          {Number(loc.current_score || 0).toFixed(2)}
                        </span>
                        <span className="text-slate-400 dark:text-slate-500 font-semibold leading-none text-[9px]">
                          {Number(loc.average_score || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="mt-auto text-center md:text-right pt-8 md:pt-6">
              <button
                onClick={() => router.push(`/washrooms?companyId=${companyId}`)}
                className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1"
              >
                View All Locations <ChevronRight size={16} />
              </button>
            </div>
          </CardShell>
        )}

        {/* Weekly Cleaner Performance */}
        {canViewCleanerReviews && (
          <CardShell className="h-full flex flex-col">
            <CardHeader
              title={getCleanerPerformanceTitle()}
              icon={
                <div className="text-violet-500 dark:text-violet-400">
                  <BarChart2 size={18} strokeWidth={2.5} />
                </div>
              }
            />
            {isCleanerLoading ? (
              <Loader />
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="h-[220px] w-full mt-2 relative z-10">
                  <CleanerPerformanceChart
                    data={cleanerGraphData}
                    isDarkMode={isDarkMode}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-6 md:gap-y-4 mt-auto pt-6 border-t border-slate-100/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-b-[20px] -mx-6 -mb-6 px-6 pb-6">
                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Total Tasks
                      <br />
                      Completed
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-[26px] font-black text-blue-600 dark:text-blue-400 leading-none">
                        {cleanerStats.totalTasks || 0}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mb-0.5">
                        ↑ 18%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Average / Day
                      <br />
                      &nbsp;
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-[26px] font-black text-violet-600 dark:text-violet-400 leading-none">
                        {cleanerStats.averagePerDay || 0}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mb-0.5">
                        ↑ 12%
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Best Day
                      <br />
                      &nbsp;
                    </p>
                    <div className="flex flex-col justify-end h-[26px]">
                      <span className="text-lg font-black text-violet-700 dark:text-violet-400 leading-none tracking-tight mb-1">
                        {cleanerStats.bestDay || "-"}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                        {cleanerStats.bestDayCount || 0} Tasks
                      </span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">
                      Completion Rate
                      <br />
                      &nbsp;
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-[26px] font-black text-violet-600 dark:text-violet-400 leading-none">
                        {cleanerStats.completionRate || 0}%
                      </span>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mb-0.5">
                        ↑ 12%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardShell>
        )}
      </div>

      {/* 3. HEATMAP ROW */}
      {canViewReports && (
        <CardShell className="mb-6">
          <CardHeader
            title={`HYGIENE PERFORMANCE HEATMAP (${heatmapDatesArray.length} DAYS)`}
            subtitle={
              heatmapDatesArray.length > 0
                ? `Scores by washroom (0-10) • ${new Date(
                    heatmapDatesArray[heatmapDatesArray.length - 1],
                  ).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })} - ${new Date(heatmapDatesArray[0]).toLocaleDateString(
                    "en-US",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}`
                : "Daily hygiene scores by washroom (0-10)"
            }
            icon={<Sparkles size={18} className="text-cyan-500" />}
          />

          <div className="flex gap-3 md:gap-6 mb-6 text-[11px] font-bold text-slate-600 dark:text-slate-300 justify-center flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400"></div>{" "}
              Excellent (9-10)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500"></div>{" "}
              Good (7-8.9)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"></div>{" "}
              Average (5-6.9)
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500"></div>{" "}
              Poor ({`<5`})
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div>{" "}
              No Inspection
            </div>
          </div>

          {isHeatmapLoading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : (
            <div className="w-full overflow-x-auto overflow-y-auto max-h-[330px] pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 transition-colors">
              <div className="w-max min-w-full border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs bg-white dark:bg-slate-900 shadow-sm relative">
                <div className="flex font-bold text-slate-600 dark:text-slate-300 mb-1 border-b border-slate-100 dark:border-slate-800 pb-2 sticky top-0 bg-white dark:bg-slate-900 z-20">
                  <div className="w-36 md:w-72 flex-shrink-0 pl-3 md:pl-4 sticky left-0 bg-white dark:bg-slate-900 z-30 border-r border-slate-50 dark:border-slate-800 flex">
                    <div className="w-8 mr-2 flex-shrink-0">Sr. No.</div>
                    <div className="flex-1">Washroom</div>
                  </div>
                  {heatmapDatesArray.map((dateStr) => {
                    const dateObj = new Date(dateStr);
                    const day = dateObj.getDate();
                    const month = dateObj.toLocaleDateString("en-US", {
                      month: "short",
                    });
                    return (
                      <div
                        key={dateStr}
                        className="w-8 flex-shrink-0 text-center flex flex-col items-center justify-center leading-none pb-[2px]"
                        title={dateObj.toLocaleDateString("en-US", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      >
                        <span className="text-[11px] mb-[2px]">{day}</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-tighter">
                          {month}
                        </span>
                      </div>
                    );
                  })}
                  <div className="w-14 flex-shrink-0 flex items-center justify-center sticky right-0 bg-white dark:bg-slate-900 z-30 border-l border-slate-100 dark:border-slate-800 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">
                    Avg
                  </div>
                </div>

                {heatmapData.length > 0 ? (
                  heatmapData.map((row, i) => {
                    const rowAvg = row.average_score
                      ? Number(row.average_score).toFixed(1)
                      : "-";

                    return (
                      <div
                        key={row.washroom_id || i}
                        className="flex h-10 items-stretch group"
                      >
                        <div
                          className="w-36 md:w-72 flex-shrink-0 text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 pl-3 md:pl-4 pr-2 truncate flex items-center border-b border-slate-200 dark:border-slate-900 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-50 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors"
                          title={row.washroom_name}
                        >
                          <div className="w-8 mr-2 flex-shrink-0 text-slate-500">
                            {i + 1}
                          </div>
                          <div className="flex-1 truncate">
                            {row.washroom_name}
                          </div>
                        </div>

                        {heatmapDatesArray.map((dateStr, j) => {
                          const score = getScoreForDate(row, dateStr);
                          return (
                            <div
                              key={j}
                              className={`w-8 flex-shrink-0 flex items-center justify-center font-bold text-[10px] border-r border-b border-slate-200 dark:border-slate-900 transition-colors hover:brightness-95 cursor-pointer ${getHeatmapColor(score)}`}
                            >
                              {score !== null &&
                              score !== undefined &&
                              score !== ""
                                ? Number(score).toFixed(1)
                                : "-"}
                            </div>
                          );
                        })}

                        <div className="w-14 flex-shrink-0 flex items-center justify-center font-black text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-900 sticky right-0 bg-white dark:bg-slate-900 z-10 border-l border-slate-100 dark:border-slate-800 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                          {rowAvg}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No data available for the selected range.
                  </div>
                )}
              </div>
            </div>
          )}
        </CardShell>
      )}

      {/* 4. BOTTOM COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
        {/* 1. TOP RATED WASHROOMS CARD */}
        {canViewLocations && (
          <CardShell className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <span className="text-amber-500">🏆</span> TOP RATED WASHROOMS
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 transition-colors">
              <div className="space-y-4">
                {isTopLocLoading ? (
                  <Loader />
                ) : (
                  topLocations.map((loc, i) => {
                    const score = Number(loc.currentScore || 0);
                    const rating = Math.round(score);

                    return (
                      <div
                        key={loc.id || i}
                        className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-blue-500" : i === 2 ? "bg-purple-500" : i === 3 ? "bg-teal-500" : "bg-slate-400 dark:bg-slate-600"}`}
                          >
                            {i + 1}
                          </div>
                          <div>
                            <p
                              className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate w-32"
                              title={loc.name}
                            >
                              {loc.name}
                            </p>

                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(10)].map((_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  size={9}
                                  className={
                                    starIndex < rating
                                      ? "text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500"
                                      : "text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100">
                            {score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

                {!isTopLocLoading && topLocations.length === 0 && (
                  <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-bold">
                    No washrooms found
                  </div>
                )}
              </div>
            </div>
          </CardShell>
        )}

        {/* 2. LIVE ACTIVITY FEED CARD */}
        {canViewCleanerReviews && (
          <CardShell className="h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Activity
                  size={16}
                  className="text-purple-500 dark:text-purple-400"
                />{" "}
                LIVE ACTIVITY FEED
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 transition-colors">
              {isActivitiesLoading ? (
                <Loader />
              ) : Object.entries(groupedActivities).length > 0 ? (
                Object.entries(groupedActivities).map(
                  ([dateLabel, activitiesForDate]) => (
                    <div key={dateLabel} className="mb-6 last:mb-0">
                      <div className="sticky top-0 z-20 bg-[#f8fafc] dark:bg-slate-950/90 py-2 mb-4 backdrop-blur-sm -mx-2 px-2">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-full shadow-sm">
                          {dateLabel}
                        </span>
                      </div>
                      {activitiesForDate.map((activity, i) => {
                        const isCleaner = activity.type === "cleaner";
                        const isCompleted = isCleaner
                          ? activity.activityType === "success"
                          : activity.activityType === "success" ||
                            activity.text?.toLowerCase().includes("complete") ||
                            activity.text?.toLowerCase().includes("finish");

                        const bgClass = isCompleted
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50"
                          : "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/50";
                        const dotClass = isCompleted
                          ? "bg-emerald-500"
                          : "bg-orange-500";

                        const formatTimeOnly = (isoString) => {
                          if (!isoString) return "";
                          return new Date(isoString).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        };

                        const scoreVal = activity.score || activity.rating;

                        return (
                          <div
                            key={activity.id || i}
                            className="relative flex items-center justify-between group is-active mb-5"
                          >
                            <div
                              className={`flex items-center justify-center w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${dotClass} shadow shrink-0 z-10`}
                            ></div>

                            <div
                              className={`w-[calc(100%-2rem)] flex flex-col md:flex-row md:items-center justify-between p-2.5 rounded-xl border ${bgClass}`}
                            >
                              <div className="flex flex-col gap-1 w-full md:w-auto flex-1">
                                {isCleaner ? (
                                  <>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                                        {activity.cleanerName} -{" "}
                                        {activity.locationName}
                                      </p>
                                      {/* SLA Badges (Only rendered when SLA is active for this washroom) */}
                                      {activity.is_sla_enabled && activity.sla_tag && (
                                        <span
                                          className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                                            activity.is_retry
                                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700/50"
                                              : activity.is_breached
                                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300 dark:border-rose-700/50"
                                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/50"
                                          }`}
                                        >
                                          {activity.is_retry ? "🔄 " : activity.is_breached ? "⚠️ " : "✓ "}
                                          {activity.sla_tag}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                                      <span>
                                        Started:{" "}
                                        {formatTimeOnly(activity.startedAt)}
                                      </span>
                                      {activity.endedAt && (
                                        <>
                                          <span className="text-slate-300 dark:text-slate-600">
                                            •
                                          </span>
                                          <span>
                                            Ended:{" "}
                                            {formatTimeOnly(activity.endedAt)}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">
                                    {activity.text}
                                  </p>
                                )}
                              </div>
                              <div className="text-left md:text-right mt-2 md:mt-0 md:ml-4 shrink-0 flex md:block items-center justify-between md:justify-end gap-3 w-full md:w-auto">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap">
                                  {formatTime(activity.timestamp)}
                                </span>
                                {scoreVal && (
                                  <div
                                    className={`text-[10px] font-bold ${isCompleted ? "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50" : "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50"} px-2 py-0.5 rounded ml-auto md:ml-0 md:mb-1 inline-block`}
                                  >
                                    {Number(scoreVal).toFixed(1)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ),
                )
              ) : (
                <p className="text-slate-400 dark:text-slate-500 text-xs italic text-center mt-4">
                  No recent activities
                </p>
              )}
            </div>
          </CardShell>
        )}
      </div>

      {/* 5. QUICK ACTIONS */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 rounded-2xl p-6">
          <div>
            <h3 className="text-white font-black text-lg">QUICK ACTIONS</h3>
            <p className="text-slate-400 text-xs mt-1">
              Perform common actions quickly
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                router.push(`/washrooms/add-location?companyId=${companyId}`)
              }
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              <Plus size={14} className="text-emerald-400" />
              Add Washroom
            </button>
            <button
              onClick={() =>
                router.push(`/userMapping/add?companyId=${companyId}`)
              }
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors"
            >
              <UserPlus size={14} className="text-blue-400" />
              Assign Cleaner
            </button>
          </div>
        </div>
      </div>

      {/* Global Date Filter FAB */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
        ref={filterMenuRef}
      >
        <AnimatePresence>
          {showFilterMenu && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl rounded-2xl p-5 w-[280px]"
            >
              <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-3">
                Dashboard Date Filter
              </h4>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => handlePresetSelect("today")}
                  className="text-xs py-2 px-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  Today
                </button>
                <button
                  onClick={() => handlePresetSelect("week")}
                  className="text-xs py-2 px-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  This Week
                </button>
                <button
                  onClick={() => handlePresetSelect("month")}
                  className="text-xs py-2 px-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold"
                >
                  This Month
                </button>
                <button
                  onClick={() => handlePresetSelect("today")}
                  className="text-xs py-2 px-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 font-bold"
                >
                  Reset
                </button>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  Custom Range
                </h4>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={tempDates.startDate}
                    onChange={(e) =>
                      setTempDates({
                        ...tempDates,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={tempDates.endDate}
                    onChange={(e) =>
                      setTempDates({
                        ...tempDates,
                        endDate: e.target.value,
                      })
                    }
                    className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <button
                  onClick={applyDateFilter}
                  className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold text-xs py-2.5 rounded-lg mt-2 transition-colors"
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className={`flex items-center justify-center p-4 rounded-full shadow-lg transition-all ${
            showFilterMenu
              ? "bg-slate-700 text-white rotate-180"
              : dateRange.startDate !== todayStr ||
                  dateRange.endDate !== todayStr
                ? "bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-105 shadow-emerald-500/30 ring-4 ring-emerald-500/20"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105 shadow-blue-500/30"
          }`}
        >
          {showFilterMenu ? (
            <ChevronRight size={24} className="rotate-90" />
          ) : (
            <Filter size={24} />
          )}
          {!showFilterMenu &&
            (dateRange.startDate !== todayStr ||
              dateRange.endDate !== todayStr) && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-white rounded-full shadow border-2 border-emerald-500"></span>
            )}
        </button>
      </div>
    </div>
  );
}
