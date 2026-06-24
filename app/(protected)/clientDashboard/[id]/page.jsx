
// "use client";

// import { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   MapPin,
//   Users,
//   ClipboardList,
//   CheckCircle2,
//   Activity,
//   Wrench,
//   Sparkles,
//   TrendingUp,
//   ChevronRight,
//   X,
//   UserCheck,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// // Loader imported but removed from full-page block
// import Loader from "@/components/ui/Loader";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { MODULES } from "@/shared/constants/permissions";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import {
//   WashroomCleanlinessChart,
//   CleanerPerformanceChart,
// } from "@/components/graphs/dashboard/dashboardCharts";
// import {
//   useDashboardCounts,
//   useDashboardAllLocations,
//   useDashboardActivities,
//   useWashroomScoresSummary,
//   useCleanerPerformance
// } from "@/features/Dashboard/Dashboard.queries";

// // --- SKELETON COMPONENTS ---

// const StatSkeleton = () => (
//   <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl px-4 py-4 border border-slate-200/40 dark:border-slate-700/40 animate-pulse flex items-center gap-3">
//     <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
//     <div className="flex-1 space-y-2">
//       <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
//       <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
//     </div>
//   </div>
// );

// const CardShellSkeleton = ({ heightClass = "h-[300px]" }) => (
//   <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-200/40 dark:border-slate-700/40 p-6 animate-pulse">
//     <div className="flex items-center justify-between mb-4">
//       <div className="flex items-center gap-4">
//         <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
//         <div className="space-y-2">
//           <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
//           <div className="h-6 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
//         </div>
//       </div>
//       <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
//     </div>
//     <div className={`w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl ${heightClass}`} />
//   </div>
// );

// // --- EXISTING UI COMPONENTS ---

// const CardShell = ({
//   title,
//   subtitle,
//   icon,
//   headerRight,
//   children,
//   onClick,
//   className = "",
// }) => (
//   <div
//     onClick={onClick}
//     className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-700/50 
//     shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]
//     hover:shadow-[0_20px_60px_rgb(6,182,212,0.15)] dark:hover:shadow-[0_20px_60px_rgb(6,182,212,0.25)]
//     transition-all duration-500 hover:-translate-y-1 ${onClick ? "cursor-pointer" : ""} ${className}
//     relative overflow-hidden p-6`}
//   >
//     <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-3xl" />
//     <div className="relative z-10">
//       <div className="flex items-center justify-between mb-4">
//         <div className="flex items-center gap-4">
//           <div
//             className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 
//             flex items-center justify-center text-cyan-600 dark:text-cyan-400
//             shadow-[0_4px_20px_rgb(6,182,212,0.2)]"
//           >
//             {icon}
//           </div>
//           <div>
//             {subtitle && (
//               <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-[0.2em] mb-0.5">
//                 {subtitle}
//               </p>
//             )}
//             <h3 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
//               {title}
//             </h3>
//           </div>
//         </div>
//         {headerRight}
//       </div>
//       {children}
//     </div>
//   </div>
// );

// const SummaryCard = ({ label, value, icon: Icon, color, onClick }) => (
//   <div
//     onClick={onClick}
//     className="
//       group relative 
//       bg-white/95 dark:bg-slate-900/95 
//       backdrop-blur-xl 
//       rounded-2xl 
//       px-4 py-4
//       border border-slate-200/60 dark:border-slate-700/50 
//       shadow-sm hover:shadow-lg overflow-hidden 
//       transition-all duration-300 hover:-translate-y-1 cursor-pointer
//     "
//   >
//     <div
//       className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 blur-2xl transition-all duration-300`}
//     />
//     <div className="relative z-10 flex items-center gap-3">
//       <div
//         className={`h-12 w-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md`}
//       >
//         <Icon size={18} strokeWidth={2.5} />
//       </div>
//       <div>
//         <p className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
//           {value}
//         </p>
//         <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
//           {label}
//         </p>
//       </div>
//     </div>
//   </div>
// );

// const HighlightsCard = ({ locations, onViewAll }) => {
//   const getRankStyle = (index) => {
//     if (index === 0) return "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_4px_16px_rgb(251,191,36,0.4)] text-white ring-2 ring-amber-300/50";
//     if (index === 1) return "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-[0_4px_16px_rgb(148,163,184,0.4)] text-white ring-2 ring-slate-300/50";
//     if (index === 2) return "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-[0_4px_16px_rgb(251,146,60,0.4)] text-white ring-2 ring-orange-300/50";
//     return "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200 font-bold shadow-[0_2px_8px_rgb(0,0,0,0.1)]";
//   };

//   return (
//     <CardShell
//       title="Top Rated Washrooms"
//       subtitle="Today's Performance"
//       icon={<Sparkles size={20} />}
//       headerRight={
//         <button
//           onClick={onViewAll}
//           className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white shadow-sm hover:shadow-lg transition-all duration-300"
//         >
//           <ChevronRight size={18} />
//         </button>
//       }
//     >
//       <div className="space-y-3 mt-2 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
//         {locations.length === 0 ? (
//           <div className="text-center py-8 text-slate-400 text-sm font-bold">No data available</div>
//         ) : (
//           locations.map((loc, i) => (
//             <div
//               key={loc.id}
//               className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-50/80 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-800/20 border border-slate-200/50 dark:border-slate-700/50 hover:border-cyan-400/40 hover:shadow-[0_4px_20px_rgb(6,182,212,0.1)] transition-all duration-300 backdrop-blur-sm"
//             >
//               <div className="flex items-center gap-4">
//                 <div className={`h-10 w-10 min-w-[40px] rounded-full flex items-center justify-center text-sm font-extrabold ${getRankStyle(i)}`}>
//                   {i + 1}
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1">{loc.name}</p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 shadow-[0_2px_12px_rgb(0,0,0,0.06)] border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
//                 <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">{parseFloat(loc.currentScore || 0).toFixed(1)}</span>
//                 <TrendingUp size={14} className="text-amber-500" />
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </CardShell>
//   );
// };

// const ActivityCard = ({ items, formatTime, onItemClick }) => (
//   <CardShell title="Cleaner Activity" subtitle="Field Updates" icon={<Activity size={20} />}>
//     <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar mt-2">
//       {items.length === 0 ? (
//         <div className="text-center py-8 text-slate-400 text-sm font-bold">No activities today</div>
//       ) : (
//         items.map((item, i) => (
//           <div
//             key={`${item.type}-${item.id}`}
//             onClick={() => onItemClick && onItemClick(item)}
//             className="flex gap-4 group cursor-pointer p-3 rounded-xl hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/30 dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10 transition-all duration-300 hover:shadow-sm"
//           >
//             <div className="relative flex flex-col items-center mt-1">
//               <div
//                 className={`h-3.5 w-3.5 rounded-full shadow-[0_0_12px] ${
//                   item?.score >= 4 ? "bg-emerald-400 shadow-emerald-400/60" : "bg-cyan-400 shadow-cyan-400/60"
//                 }`}
//               />
//               {i !== items.length - 1 && (
//                 <div className="w-[2px] h-full bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700 my-1.5" />
//               )}
//             </div>
//             <div className="pb-2 flex-1">
//               <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
//                 {item?.text}
//               </p>
//               <div className="flex items-center gap-2 mt-1.5">
//                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatTime(item.timestamp)}</span>
//                 {item.score && (
//                   <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 text-amber-600 dark:text-amber-400 rounded-md shadow-sm">
//                     ★ {item.score}
//                   </span>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   </CardShell>
// );

// const ChartModal = ({ isOpen, onClose, title, children }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-5xl h-[80vh] 
//           rounded-[32px] shadow-[0_20px_80px_rgb(0,0,0,0.2)] dark:shadow-[0_20px_80px_rgb(0,0,0,0.6)]
//           overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50"
//         >
//           <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center backdrop-blur-sm">
//             <h2 className="text-2xl font-black text-slate-800 dark:text-white">{title}</h2>
//             <button
//               onClick={onClose}
//               className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300 hover:shadow-lg"
//             >
//               <X size={24} />
//             </button>
//           </div>
//           <div className="p-6 flex-1 bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-900/50 dark:to-slate-800/30">
//             {children}
//           </div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// export default function ClientDashboard() {
//   const { canView, user } = usePermissions();
//   const router = useRouter();
//   const { companyId } = useCompanyId();

//   // Permissions
//   const canViewLocations = canView(MODULES.LOCATIONS);
//   const canViewCleanerReviews = canView(MODULES.CLEANER_REVIEWS);
//   const canViewUsers = canView(MODULES.USERS);
//   const canViewReports = canView(MODULES.REPORTS);

//   const [activeChartModal, setActiveChartModal] = useState(null);
//   const today = new Date().toISOString().split("T")[0];

//   const activeCompanyIdForLocations = canViewLocations ? companyId : null;
//   const activeCompanyIdForReviews = canViewCleanerReviews ? companyId : null;

//   // --- TanStack Queries ---
//   const { data: statsData = { totalLocations: 0, ongoingTasks: 0, completedTasks: 0, totalRepairs: 0, totalCleaners: 0 }, isLoading: isCountsLoading } = useDashboardCounts(companyId, today);
//   const { data: topLocations = [], isLoading: isTopLocLoading } = useDashboardAllLocations(activeCompanyIdForLocations, today);
//   const { data: recentActivities = [], isLoading: isActivitiesLoading } = useDashboardActivities(activeCompanyIdForReviews, 10, today);
//   const { data: washroomGraphData = [], isLoading: isWashroomLoading } = useWashroomScoresSummary(activeCompanyIdForLocations);
//   const { data: cleanerGraphData = { data: [], today_completed_tasks: 0 }, isLoading: isCleanerLoading } = useCleanerPerformance(activeCompanyIdForReviews);

//   // --- Helpers ---
//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
//     if (diffInHours < 1) {
//       const diffInMinutes = Math.floor((now - date) / (1000 * 60));
//       return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes}m ago`;
//     }
//     return diffInHours < 24 ? `${diffInHours}h ago` : date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
//   };

//   const handleActivityClick = (item) => {
//     const reviewId = item.reviewId || item.id;
//     if (reviewId) router.push(`/cleaners/${reviewId}?companyId=${companyId}`);
//   };

//   // Check empty permissions first
//   if (!canViewLocations && !canViewCleanerReviews && !canViewUsers && !canViewReports) {
//     return (
//       <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
//         <div className="text-center p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 max-w-md">
//           <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//           <h2 className="text-xl font-black text-slate-800 mb-2">Limited Access</h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4 md:p-8">
//       {/* 1. Stats Grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 lg:mt-[-40px]">
//         {isCountsLoading ? (
//           <>
//             {canViewLocations && <StatSkeleton />}
//             {canViewCleanerReviews && <StatSkeleton />}
//             {canViewCleanerReviews && <StatSkeleton />}
//             {canViewReports && <StatSkeleton />}
//             {canViewUsers && <StatSkeleton />}
//           </>
//         ) : (
//           <>
//             {canViewLocations && (
//               <SummaryCard
//                 label="Total Toilets"
//                 value={statsData.totalLocations}
//                 icon={MapPin}
//                 color="from-blue-500 to-cyan-400"
//                 onClick={() => router.push(`/washrooms?companyId=${companyId}`)}
//               />
//             )}
//             {canViewCleanerReviews && (
//               <SummaryCard
//                 label="Ongoing Tasks"
//                 value={statsData.ongoingTasks}
//                 icon={ClipboardList}
//                 color="from-cyan-400 to-teal-400"
//                 onClick={() => router.push(`/cleaners?companyId=${companyId}&status=ongoing`)}
//               />
//             )}
//             {canViewCleanerReviews && (
//               <SummaryCard
//                 label="Completed Tasks"
//                 value={`${statsData.completedTasks}`}
//                 icon={CheckCircle2}
//                 color="from-emerald-400 to-teal-500"
//                 onClick={() => router.push(`/cleaners?companyId=${companyId}&status=completed`)}
//               />
//             )}
//             {canViewReports && (
//               <SummaryCard
//                 label="Total Repairs"
//                 value={statsData.totalRepairs}
//                 icon={Wrench}
//                 color="from-rose-400 to-orange-400"
//                 onClick={() => router.push(`/repairs?companyId=${companyId}`)}
//               />
//             )}
//             {canViewUsers && (
//               <SummaryCard
//                 label="Total Cleaners"
//                 value={statsData.totalCleaners}
//                 icon={UserCheck}
//                 color="from-indigo-400 to-purple-400"
//                 onClick={() => router.push(`/users?flag=cleaner&companyId=${companyId}`)}
//               />
//             )}
//           </>
//         )}
//       </div>

//       {/* 2. Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {canViewLocations && (
//           isWashroomLoading ? (
//             <CardShellSkeleton heightClass="h-[300px]" />
//           ) : (
//             <CardShell
//               title="Cleanliness Trends"
//               subtitle="LAST 7 DAYS PERFORMANCE"
//               icon={<TrendingUp size={20} className="text-blue-500" />}
//               onClick={() => setActiveChartModal("cleanliness")}
//               headerRight={
//                 <button className="p-2.5 bg-blue-50/80 dark:bg-slate-800/80 rounded-xl text-blue-500 hover:bg-blue-500 hover:text-white shadow-sm hover:shadow-lg transition-all duration-300">
//                   <TrendingUp size={18} />
//                 </button>
//               }
//             >
//               <div className="mt-4 border-[1.5px] border-slate-200 dark:border-slate-700 rounded-2xl p-4">
//                 <h3 className="text-center text-slate-400 dark:text-slate-500 font-semibold text-lg mb-4">
//                   Washroom Cleanliness Impact
//                 </h3>
//                 <div className="h-[250px] w-full">
//                   <WashroomCleanlinessChart data={washroomGraphData.slice(0, 4)} />
//                 </div>
//               </div>
//             </CardShell>
//           )
//         )}

//         {canViewCleanerReviews && (
//           isCleanerLoading ? (
//             <CardShellSkeleton heightClass="h-[300px]" />
//           ) : (
//             <CardShell
//               title="Top Cleaners"
//               subtitle="EFFICIENCY METRICS"
//               icon={<Users size={20} className="text-teal-500" />}
//               onClick={() => setActiveChartModal("performance")}
//               headerRight={
//                 <button className="p-2.5 bg-teal-50/80 dark:bg-slate-800/80 rounded-xl text-teal-500 hover:bg-teal-500 hover:text-white shadow-sm hover:shadow-lg transition-all duration-300">
//                   <Users size={18} />
//                 </button>
//               }
//             >
//               <div className="mt-4 border-[1.5px] border-slate-200 dark:border-slate-700 rounded-2xl p-4">
//                 <h3 className="text-center text-slate-400 dark:text-slate-500 font-semibold text-lg mb-4">
//                   Cleaner Performance This Week
//                 </h3>
//                 <div className="h-[250px] w-full relative">
//                   <CleanerPerformanceChart
//                     data={cleanerGraphData.data}
//                     todayCount={cleanerGraphData.today_completed_tasks}
//                   />
//                 </div>
//               </div>
//             </CardShell>
//           )
//         )}
//       </div>

//       {/* 3. Bottom Lists */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {canViewLocations && (
//           isTopLocLoading ? (
//             <CardShellSkeleton heightClass="h-[420px]" />
//           ) : (
//             <HighlightsCard
//               locations={topLocations}
//               onViewAll={() => router.push(`/washrooms?companyId=${companyId}&sortBy=currentScore`)}
//             />
//           )
//         )}
//         {canViewCleanerReviews && (
//           isActivitiesLoading ? (
//             <CardShellSkeleton heightClass="h-[420px]" />
//           ) : (
//             <ActivityCard
//               items={recentActivities}
//               formatTime={formatTime}
//               onItemClick={handleActivityClick}
//             />
//           )
//         )}
//       </div>

//       {/* Modals */}
//       <ChartModal isOpen={activeChartModal === "cleanliness"} onClose={() => setActiveChartModal(null)} title="Detailed Cleanliness Analysis">
//         <div className="h-full w-full">
//           <WashroomCleanlinessChart data={washroomGraphData.slice(0, 15)} />
//         </div>
//       </ChartModal>

//       <ChartModal isOpen={activeChartModal === "performance"} onClose={() => setActiveChartModal(null)} title="Weekly Cleaner Performance">
//         <div className="h-full w-full">
//           <CleanerPerformanceChart data={cleanerGraphData.data} todayCount={cleanerGraphData.today_completed_tasks} />
//         </div>
//       </ChartModal>
//     </div>
//   );
// }

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
  Star
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
  useCleanerPerformance
} from "@/features/Dashboard/Dashboard.queries";
import { useGetWashroomHygieneHeatmap } from "@/features/Dashboard/Dashboard.queries";

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
        {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {rightAction && <div className="relative">{rightAction}</div>}
  </div>
);

const CardShell = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon: Icon, colorClass, trend, trendValue, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between relative overflow-hidden"
  >
    <div className="flex items-center gap-3">
      <div className={`h-9 w-9 rounded-lg flex items-center justify-center text-white ${colorClass}`}>
        <Icon size={18} strokeWidth={2.5} />
      </div>
      <div>
        {/* ADDED dark:text-white here */}
        <h4 className="text-xl font-bold text-slate-800 dark:text-white leading-none mb-0.5">{value || 0}</h4>
        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      </div>
    </div>

    <div className="mt-2.5 flex items-center gap-1.5 text-[10px] font-semibold">
      {trend === "up" && <><ArrowUp size={12} className="text-emerald-500" /><span className="text-emerald-500">{trendValue}</span></>}
      {trend === "down" && <><ArrowDown size={12} className="text-rose-500" /><span className="text-rose-500">{trendValue}</span></>}
      {trend === "neutral" && <><span className="text-slate-400 dark:text-slate-500">—</span><span className="text-slate-400 dark:text-slate-500">{trendValue}</span></>}
      <span className="text-slate-400 dark:text-slate-500 font-medium ml-1 hidden xl:inline">vs last week</span>
    </div>
  </div>
);
// --- HELPERS ---
const getDatesInRange = (startDate, endDate) => {
  const dates = [];
  let currentDate = new Date(startDate);
  const stopDate = new Date(endDate);
  while (currentDate <= stopDate) {
    dates.push(new Date(currentDate).toISOString().split('T')[0]);
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
  const thirtyDaysAgoObj = new Date();
  thirtyDaysAgoObj.setDate(todayDate.getDate() - 30);
  const thirtyDaysAgoStr = thirtyDaysAgoObj.toISOString().split("T")[0];

  // Filters State
  const [dateRange, setDateRange] = useState({ startDate: thirtyDaysAgoStr, endDate: todayStr });
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [tempDates, setTempDates] = useState({ startDate: thirtyDaysAgoStr, endDate: todayStr });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const filterMenuRef = useRef(null);

  const activeCompanyIdForLocations = canViewLocations ? companyId : null;
  const activeCompanyIdForReviews = canViewCleanerReviews ? companyId : null;

  // --- Core Dashboard Data Hooks ---
  const { data: statsData = {}, isLoading: isCountsLoading } = useDashboardCounts(companyId, todayStr);
  const { data: topLocations = [], isLoading: isTopLocLoading } = useDashboardAllLocations(activeCompanyIdForLocations, todayStr);
  const { data: recentActivities = [], isLoading: isActivitiesLoading } = useDashboardActivities(activeCompanyIdForReviews, 5, todayStr);
  const { data: washroomGraphData = [], isLoading: isWashroomLoading } = useWashroomScoresSummary(activeCompanyIdForLocations);

  // Cleaner Performance Hook
  const { data: cleanerResponse, isLoading: isCleanerLoading } = useCleanerPerformance(activeCompanyIdForReviews);

  // Safely extract data and stats
  const cleanerGraphData = cleanerResponse?.data || [];
  const cleanerStats = cleanerResponse?.stats || {
    totalTasks: 0,
    averagePerDay: 0,
    bestDay: '-',
    bestDayCount: 0,
    completionRate: 0
  };


  useEffect(() => {
    // Check initial state
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    // Watch for changes to the 'class' attribute on the <html> tag
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
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  // 2. Pass the single object to the hook (API WILL NOW FIRE)
  const { data: heatmapResponse, isLoading: isHeatmapLoading } = useGetWashroomHygieneHeatmap({
    company_id: companyId,
    start_date: formattedStartDate,
    end_date: formattedEndDate
  });
  const heatmapData = heatmapResponse?.data || [];
  const heatmapDatesArray = getDatesInRange(dateRange.startDate, dateRange.endDate);

  const applyDateFilter = () => {
    setDateRange(tempDates);
    setShowFilterMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateString) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    return `${Math.floor(diffInMinutes / 60)}h ago`;
  };

  const getScoreForDate = (row, dateStr) => {
    if (row.daily_scores && row.daily_scores[dateStr] !== undefined) {
      return row.daily_scores[dateStr];
    }
    return null;
  };

  const getHeatmapColor = (score) => {
    if (score === null || score === undefined || score === "") return "bg-slate-50 dark:bg-slate-800/50 text-transparent";
    const num = Number(score);
    if (num >= 9) return "bg-emerald-200/60 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300";
    if (num >= 7) return "bg-blue-200/60 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300";
    if (num >= 5) return "bg-orange-200/60 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300";
    return "bg-red-200/60 dark:bg-red-500/20 text-red-800 dark:text-red-300";
  };

  if (!canViewLocations && !canViewCleanerReviews && !canViewUsers && !canViewReports) {
    return <div className="p-8 text-center text-slate-500 dark:text-slate-400">Limited Access</div>;
  }

  const overallScore = washroomGraphData.length > 0
    ? (washroomGraphData.reduce((acc, curr) => acc + Number(curr.average_score || 0), 0) / washroomGraphData.length).toFixed(2)
    : "0.0";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 font-sans md:mt-[-10px]">

      {/* 1. TOP STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6 md:mt-[-30px]">
        {isCountsLoading ? (
          Array(5).fill(0).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            {canViewLocations && (
              <StatCard title="Total Toilets" value={statsData.totalLocations} icon={MapPin} colorClass="bg-blue-500" trend="up" trendValue="↑ 8%" onClick={() => router.push(`/washrooms?companyId=${companyId}`)} />
            )}
            {canViewCleanerReviews && (
              <StatCard title="Ongoing Tasks" value={statsData.ongoingTasks} icon={ClipboardList} colorClass="bg-emerald-500" trend="neutral" trendValue="No change" onClick={() => router.push(`/cleaners?companyId=${companyId}&status=ongoing`)} />
            )}
            {canViewCleanerReviews && (
              <StatCard title="Completed Tasks" value={statsData.completedTasks} icon={CheckCircle2} colorClass="bg-cyan-400" trend="up" trendValue="↑ 25%" onClick={() => router.push(`/cleaners?companyId=${companyId}&status=completed`)} />
            )}
            {canViewReports && (
              <StatCard title="Total Repairs" value={statsData.totalRepairs} icon={Wrench} colorClass="bg-amber-500" trend="neutral" trendValue="No change" onClick={() => router.push(`/repairs?companyId=${companyId}`)} />
            )}
            {canViewUsers && (
              <StatCard title="Total Cleaners" value={statsData.totalCleaners} icon={UserCheck} colorClass="bg-purple-500" trend="up" trendValue="↑ 9%" onClick={() => router.push(`/users?flag=cleaner&companyId=${companyId}`)} />
            )}
          </>
        )}
      </div>

      {/* 2. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch md:mt-[-15px]">

        {/* Cleanliness Overview */}
        {canViewLocations && (
          <CardShell className="h-full flex flex-col">
            {/* HEADER - Stacks on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0 mb-4">
              <div className="flex items-start md:items-center gap-3">
                <div className="text-cyan-500 mt-0.5 md:mt-0"><Sparkles size={18} /></div>
                <div>
                  <h3 className="text-[13px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">CLEANLINESS OVERVIEW</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Top 5 Locations by Cleanliness Score</p>
                </div>
              </div>
              {/* Allowed legend to wrap on small screens */}
              <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Current Score</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Average Score</div>
              </div>
            </div>

            {/* MAIN CONTENT - Column on mobile, row on desktop */}
            <div className="flex flex-col md:flex-row items-center justify-between mt-6 flex-1 gap-8 md:gap-0 w-full">

              {/* Circular Score - Added shrink-0 so it doesn't get distorted */}
              <div className="relative shrink-0 h-40 w-40 flex items-center justify-center rounded-full border-[12px] border-emerald-400 dark:border-emerald-500 border-r-emerald-200 dark:border-r-emerald-900">
                <div className="text-center">
                  <span className="text-4xl font-black text-slate-800 dark:text-white">{overallScore}</span>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Overall Score</p>
                </div>
              </div>

              {/* Bar Charts - Changed ml-8 to md:ml-8 so it doesn't push off-screen on mobile */}
              <div className="flex-1 w-full ml-0 md:ml-8 flex flex-col justify-center space-y-6">
                {isWashroomLoading ? <Loader /> : washroomGraphData.slice(0, 5).map((loc, i) => (
                  <div key={loc.location_id || i} className="flex items-center justify-between text-[11px] font-semibold w-full">
                    <span className="text-slate-600 dark:text-slate-300 w-1/3 truncate pr-2" title={loc.location_name}>{loc.location_name}</span>
                    <div className="flex-1 flex flex-col gap-1.5 mx-2">
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${(Number(loc.current_score || 0) / 10) * 100}%` }} />
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${(Number(loc.average_score || 0) / 10) * 100}%` }} />
                      </div>
                    </div>
                    {/* Added shrink-0 to prevent number clipping on narrow screens */}
                    <div className="w-8 text-right shrink-0 flex flex-col gap-0.5">
                      <span className="text-slate-800 dark:text-slate-100 font-bold leading-none">{Number(loc.current_score || 0).toFixed(2)}</span>
                      <span className="text-slate-400 dark:text-slate-500 font-semibold leading-none text-[9px]">{Number(loc.average_score || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER - Centered on mobile, right-aligned on desktop */}
            <div className="mt-auto text-center md:text-right pt-8 md:pt-6">
              <button onClick={() => router.push(`/washrooms?companyId=${companyId}`)} className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1">
                View All Locations <ChevronRight size={16} />
              </button>
            </div>
          </CardShell>
        )}

        {/* Weekly Cleaner Performance */}
        {canViewCleanerReviews && (
          <CardShell className="h-full flex flex-col">
            <CardHeader
              title="WEEKLY CLEANER PERFORMANCE"
              icon={<div className="text-violet-500 dark:text-violet-400"><BarChart2 size={18} strokeWidth={2.5} /></div>}
            />
            {isCleanerLoading ? <Loader /> : (
              <div className="flex-1 flex flex-col">
                {/* Chart Area */}
                <div className="h-[220px] w-full mt-2 relative z-10">
                  <CleanerPerformanceChart data={cleanerGraphData} isDarkMode={isDarkMode} />
                </div>

                {/* Stats Grid - Updated to 2 columns on mobile, 4 on desktop */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 gap-y-6 md:gap-y-4 mt-auto pt-6 border-t border-slate-100/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 rounded-b-[20px] -mx-6 -mb-6 px-6 pb-6">

                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">Total Tasks<br />Completed</p>
                    <div className="flex items-end gap-2">
                      <span className="text-[26px] font-black text-blue-600 dark:text-blue-400 leading-none">{cleanerStats.totalTasks || 0}</span>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mb-0.5">↑ 18%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">Average / Day<br />&nbsp;</p>
                    <div className="flex items-end gap-2">
                      <span className="text-[26px] font-black text-violet-600 dark:text-violet-400 leading-none">{cleanerStats.averagePerDay || 0}</span>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mb-0.5">↑ 12%</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">Best Day<br />&nbsp;</p>
                    <div className="flex flex-col justify-end h-[26px]">
                      <span className="text-lg font-black text-violet-700 dark:text-violet-400 leading-none tracking-tight mb-1">{cleanerStats.bestDay || '-'}</span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">{cleanerStats.bestDayCount || 0} Tasks</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 mb-2">Completion Rate<br />&nbsp;</p>
                    <div className="flex items-end gap-2">
                      <span className="text-[26px] font-black text-violet-600 dark:text-violet-400 leading-none">{cleanerStats.completionRate || 0}%</span>
                      <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 mb-0.5">↑ 12%</span>
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
            subtitle="Daily hygiene scores by washroom (0-10)"
            icon={<Sparkles size={18} className="text-cyan-500" />}
            rightAction={
              <div className="flex items-center gap-2 md:gap-3 relative" ref={filterMenuRef}>
                {/* Hidden on very small screens to prevent overflow */}
                <div className="hidden md:flex text-xs font-semibold text-slate-600 dark:text-slate-300 items-center gap-1 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                  {dateRange.startDate} to {dateRange.endDate} <Calendar size={14} className="ml-2 text-slate-400 dark:text-slate-500" />
                </div>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Filter size={14} />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronRight size={14} className={showFilterMenu ? "rotate-90 transition-transform" : "transition-transform"} />
                </button>
                <MoreVertical size={16} className="text-slate-400 dark:text-slate-500 cursor-pointer hidden sm:block" />

                {/* Filter Dropdown */}
                <AnimatePresence>
                  {showFilterMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 md:right-8 top-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-4 w-[250px] md:w-72 z-50"
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-3">Custom Date Range</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Start Date</label>
                          <input
                            type="date"
                            value={tempDates.startDate}
                            onChange={(e) => setTempDates({ ...tempDates, startDate: e.target.value })}
                            className="w-full text-sm p-2 border border-slate-200 dark:border-slate-700 bg-transparent text-slate-800 dark:text-slate-200 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">End Date</label>
                          <input
                            type="date"
                            value={tempDates.endDate}
                            onChange={(e) => setTempDates({ ...tempDates, endDate: e.target.value })}
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
              </div>
            }
          />

          {/* Heatmap Legend - Reduced gap on mobile */}
          <div className="flex gap-3 md:gap-6 mb-6 text-[11px] font-bold text-slate-600 dark:text-slate-300 justify-center flex-wrap">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400"></div> Excellent (9-10)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400 dark:bg-blue-500"></div> Good (7-8.9)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400 dark:bg-amber-500"></div> Average (5-6.9)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-400 dark:bg-rose-500"></div> Poor ({`<5`})</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700"></div> No Inspection</div>
          </div>

          {isHeatmapLoading ? (
            <div className="py-12"><Loader /></div>
          ) : (
            <div className="w-full overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 transition-colors">
              <div className="w-max min-w-full border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden text-xs bg-white dark:bg-slate-900 shadow-sm relative">

                {/* Table Header */}
                <div className="flex font-bold text-slate-600 dark:text-slate-300 mb-1 border-b border-slate-100 dark:border-slate-800 pb-2">
                  {/* Reduced left column width on mobile from w-64 to w-28 */}
                  <div className="w-28 md:w-64 flex-shrink-0 pl-3 md:pl-4 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-50 dark:border-slate-800">Washroom</div>
                  {heatmapDatesArray.map((dateStr) => {
                    const day = new Date(dateStr).getDate();
                    return (
                      <div key={dateStr} className="w-8 flex-shrink-0 text-center">{day}</div>
                    );
                  })}
                  <div className="w-14 flex-shrink-0 text-center sticky right-0 bg-white dark:bg-slate-900 z-10 border-l border-slate-100 dark:border-slate-800 shadow-[-4px_0_10px_rgba(0,0,0,0.02)]">Avg</div>
                </div>

                {/* Table Rows */}
                {heatmapData.length > 0 ? heatmapData.map((row, i) => {
                  const rowAvg = row.average_score ? Number(row.average_score).toFixed(1) : "-";

                  return (
                    <div key={row.washroom_id || i} className="flex h-10 items-stretch group">

                      {/* Reduced left column width on mobile from w-64 to w-28, adjusted text size slightly to prevent too much cutting off */}
                      <div className="w-28 md:w-64 flex-shrink-0 text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-200 pl-3 md:pl-4 pr-2 truncate flex items-center border-b border-white dark:border-slate-900 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-50 dark:border-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors" title={row.washroom_name}>
                        {row.washroom_name}
                      </div>

                      {/* Solid Grid Cells */}
                      {heatmapDatesArray.map((dateStr, j) => {
                        const score = getScoreForDate(row, dateStr);
                        return (
                          <div key={j} className={`w-8 flex-shrink-0 flex items-center justify-center font-bold text-[10px] border-r border-b border-white dark:border-slate-900 transition-colors hover:brightness-95 cursor-pointer ${getHeatmapColor(score)}`}>
                            {score !== null && score !== undefined && score !== "" ? Number(score).toFixed(1) : ''}
                          </div>
                        )
                      })}

                      <div className="w-14 flex-shrink-0 flex items-center justify-center font-black text-slate-800 dark:text-slate-100 border-b border-white dark:border-slate-900 sticky right-0 bg-white dark:bg-slate-900 z-10 border-l border-slate-100 dark:border-slate-800 shadow-[-4px_0_10px_rgba(0,0,0,0.02)] group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                        {rowAvg}
                      </div>
                    </div>
                  );
                }) : (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-semibold">No data available for the selected range.</div>
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

            {/* Styled Scrollable Container */}
            <div className="flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 transition-colors">
              <div className="space-y-4">
                {isTopLocLoading ? (
                  <Loader />
                ) : (
                  topLocations.map((loc, i) => {
                    const score = Number(loc.currentScore || 0);
                    const rating = Math.round(score);

                    return (
                      <div key={loc.id || i} className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-purple-500' : i === 3 ? 'bg-teal-500' : 'bg-slate-400 dark:bg-slate-600'}`}>
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate w-32" title={loc.name}>{loc.name}</p>

                            <div className="flex gap-0.5 mt-0.5">
                              {[...Array(10)].map((_, starIndex) => (
                                <Star
                                  key={starIndex}
                                  size={9}
                                  className={
                                    starIndex < rating
                                      ? "text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500"
                                      // Increased contrast for uncolored stars here:
                                      : "text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-black text-slate-800 dark:text-slate-100">{score.toFixed(1)}</span>
                        </div>
                      </div>
                    );
                  })
                )}

                {!isTopLocLoading && topLocations.length === 0 && (
                  <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs font-bold">No washrooms found</div>
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
                <Activity size={16} className="text-purple-500 dark:text-purple-400" /> LIVE ACTIVITY FEED
              </h3>
            </div>

            {/* Styled Scrollable Container */}
            <div className="flex-1 overflow-y-auto pr-2 relative before:absolute before:inset-0 before:ml-1.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-300 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600 transition-colors">
              {isActivitiesLoading ? (
                <Loader />
              ) : (
                recentActivities.map((activity, i) => {
                  const typeStr = activity.type?.toLowerCase() || '';
                  const isCompleted = typeStr.includes('complete') || typeStr.includes('finish');

                  const bgClass = isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/50'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/50';
                  const dotClass = isCompleted
                    ? 'bg-emerald-500'
                    : 'bg-blue-500';

                  return (
                    <div key={activity.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-5">
                      <div className={`flex items-center justify-center w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${dotClass} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10`}></div>

                      <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] flex items-center justify-between p-2.5 rounded-xl border ${bgClass}`}>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 leading-tight line-clamp-2">{activity.text}</p>
                        </div>
                        <div className="text-right ml-2 shrink-0">
                          {activity.score && (
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded mb-1">
                              {activity.score}
                            </div>
                          )}
                          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{formatTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardShell>
        )}
      </div>

      {/* 5. QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-4">
        <div className="mb-4 md:mb-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">QUICK ACTIONS</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Perform common actions quickly</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => router.push(`/washrooms/add-location?companyId=${companyId}`)}
            className="bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Plus size={14} className="text-emerald-400" /> Add Washroom
          </button>
          <button
            onClick={() => router.push(`/userMapping/add?companyId=${companyId}`)}
            className="bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <UserPlus size={14} className="text-blue-400" /> Assign Cleaner
          </button>
        </div>
      </div>
    </div>
  );
}