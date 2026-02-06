// "use client";

// import { useState, useEffect } from "react";
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
// import Loader from "@/components/ui/Loader";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { MODULES } from "@/shared/constants/permissions";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import { DashboardApi } from "@/features/Dashboard/Dashboard.api";
// import {
//   WashroomCleanlinessChart,
//   CleanerPerformanceChart,
// } from "@/components/graphs/dashboard/dashboardCharts";

// /* --- UI COMPONENTS --- */

// // 1. Glass Card Shell
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
//     className={`bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/5 ${onClick ? "cursor-pointer" : ""} ${className}`}
//   >
//     <div className="flex items-center justify-between mb-4">
//       <div className="flex items-center gap-4">
//         <div className="h-12 w-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center text-cyan-600">
//           {icon}
//         </div>
//         <div>
//           {subtitle && (
//             <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-0.5">
//               {subtitle}
//             </p>
//           )}
//           <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
//             {title}
//           </h3>
//         </div>
//       </div>
//       {headerRight}
//     </div>
//     {children}
//   </div>
// );

// // 2. Summary Card
// const SummaryCard = ({ label, value, icon: Icon, color, onClick }) => (
//   <div
//     onClick={onClick}
//     className="group relative bg-white dark:bg-slate-900 rounded-[28px] p-5 border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer"
//   >
//     <div
//       className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}
//     />
//     <div className="relative z-10 flex items-center gap-4">
//       <div
//         className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg`}
//       >
//         <Icon size={20} strokeWidth={2.5} />
//       </div>
//       <div>
//         <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
//           {value}
//         </p>
//         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
//           {label}
//         </p>
//       </div>
//     </div>
//   </div>
// );

// // 3. Highlights List
// const HighlightsCard = ({ locations, onViewAll }) => {
//   const rankStyles = [
//     {
//       bg: "bg-gradient-to-br from-amber-400 to-amber-500",
//       shadow: "shadow-amber-400/30",
//     },
//     {
//       bg: "bg-gradient-to-br from-slate-300 to-slate-400",
//       shadow: "shadow-slate-300/30",
//     },
//     {
//       bg: "bg-gradient-to-br from-orange-300 to-orange-400",
//       shadow: "shadow-orange-300/30",
//     },
//   ];

//   return (
//     <CardShell
//       title="Top Rated Facilities"
//       subtitle="Today's Performance"
//       icon={<Sparkles size={20} />}
//       headerRight={
//         <button
//           onClick={onViewAll}
//           className="p-2 rounded-xl bg-slate-50 text-cyan-600 hover:bg-cyan-500 hover:text-white transition-all"
//         >
//           <ChevronRight size={18} />
//         </button>
//       }
//     >
//       <div className="space-y-3 mt-2">
//         {locations.length === 0 ? (
//           <div className="text-center py-8 text-slate-400 text-sm font-bold">
//             No data available
//           </div>
//         ) : (
//           locations.map((loc, i) => (
//             <div
//               key={loc.id}
//               className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-cyan-400/30 transition-all"
//             >
//               <div className="flex items-center gap-4">
//                 <div
//                   className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-extrabold ${rankStyles[i]?.bg || "bg-slate-200"} ${rankStyles[i]?.shadow || ""}`}
//                 >
//                   {i + 1}
//                 </div>
//                 <div>
//                   <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
//                     {loc.name}
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100">
//                 <span className="text-sm font-black text-cyan-600">
//                   {parseFloat(loc.currentScore || 0).toFixed(1)}
//                 </span>
//                 <TrendingUp size={14} className="text-amber-400" />
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </CardShell>
//   );
// };

// // 4. Activity List
// const ActivityCard = ({ items, formatTime }) => (
//   <CardShell
//     title="Cleaner Activity"
//     subtitle="Field Updates"
//     icon={<Activity size={20} />}
//   >
//     <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mt-2">
//       {items.length === 0 ? (
//         <div className="text-center py-8 text-slate-400 text-sm font-bold">
//           No activities today
//         </div>
//       ) : (
//         items.map((item, i) => (
//           <div key={`${item.type}-${item.id}`} className="flex gap-4 group">
//             <div className="relative flex flex-col items-center">
//               <div
//                 className={`h-3 w-3 rounded-full shadow-[0_0_8px] ${item.rating >= 4 ? "bg-emerald-400 shadow-emerald-400" : "bg-cyan-400 shadow-cyan-400"}`}
//               />
//               {i !== items.length - 1 && (
//                 <div className="w-[2px] h-full bg-slate-100 dark:bg-slate-800 my-1" />
//               )}
//             </div>
//             <div className="pb-4">
//               <p className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-cyan-600 transition-colors">
//                 {item.text}
//               </p>
//               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
//                 {formatTime(item.timestamp)}{" "}
//                 {item.rating && `• Rating: ${item.rating}`}
//               </p>
//             </div>
//           </div>
//         ))
//       )}
//     </div>
//   </CardShell>
// );

// // 5. Modal
// const ChartModal = ({ isOpen, onClose, title, children }) => (
//   <AnimatePresence>
//     {isOpen && (
//       <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
//         <motion.div
//           initial={{ scale: 0.95, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           exit={{ scale: 0.95, opacity: 0 }}
//           className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
//         >
//           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
//             <h2 className="text-2xl font-black text-slate-800">{title}</h2>
//             <button
//               onClick={onClose}
//               className="p-2 hover:bg-slate-100 rounded-full transition-colors"
//             >
//               <X size={24} />
//             </button>
//           </div>
//           <div className="p-6 flex-1 bg-slate-50/50">{children}</div>
//         </motion.div>
//       </div>
//     )}
//   </AnimatePresence>
// );

// /* --- MAIN PAGE --- */

// export default function ClientDashboard() {
//   const { canView, user } = usePermissions();
//   const router = useRouter();
//   const { companyId } = useCompanyId();

//   // Permissions
//   const canViewLocations = canView(MODULES.LOCATIONS);
//   const canViewCleanerReviews = canView(MODULES.CLEANER_REVIEWS);
//   const canViewUsers = canView(MODULES.USERS);
//   const canViewReports = canView(MODULES.REPORTS);

//   // State
//   const [isLoading, setIsLoading] = useState(true);
//   const [statsData, setStatsData] = useState({
//     totalLocations: 0,
//     ongoingTasks: 0,
//     completedTasks: 0,
//     totalRepairs: 0,
//     totalCleaners: 0,
//   });
//   const [topLocations, setTopLocations] = useState([]);
//   const [recentActivities, setRecentActivities] = useState([]);

//   // Graphs
//   const [washroomGraphData, setWashroomGraphData] = useState([]);
//   const [cleanerGraphData, setCleanerGraphData] = useState({
//     data: [],
//     today_completed_tasks: 0,
//   });

//   const [activeChartModal, setActiveChartModal] = useState(null);

//   const getTodayDate = () => new Date().toISOString().split("T")[0];

//   const formatTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
//     if (diffInHours < 1) {
//       const diffInMinutes = Math.floor((now - date) / (1000 * 60));
//       return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes}m ago`;
//     }
//     return diffInHours < 24
//       ? `${diffInHours}h ago`
//       : date.toLocaleTimeString("en-US", {
//           hour: "2-digit",
//           minute: "2-digit",
//         });
//   };

//   useEffect(() => {
//     if (!companyId) return;

//     const fetchDash = async () => {
//       setIsLoading(true);
//       const today = getTodayDate();

//       try {
//         const promises = [
//           DashboardApi.getCounts(companyId, today),
//           canViewLocations
//             ? DashboardApi.getTopLocations(companyId, 5, today)
//             : Promise.resolve({ success: true, data: [] }),
//           canViewCleanerReviews
//             ? DashboardApi.getActivities(companyId, 10, today)
//             : Promise.resolve({ success: true, data: [] }),
//           canViewLocations
//             ? DashboardApi.getWashroomScoresSummary(companyId)
//             : Promise.resolve({ success: true, data: [] }),
//           canViewCleanerReviews
//             ? DashboardApi.getCleanerPerformance(companyId)
//             : Promise.resolve({
//                 success: true,
//                 data: [],
//                 today_completed_tasks: 0,
//               }),
//         ];

//         const [countRes, topLocRes, activityRes, washroomRes, cleanerRes] =
//           await Promise.all(promises);

//         if (countRes.success) setStatsData(countRes.data);
//         if (topLocRes.success) setTopLocations(topLocRes.data);
//         if (activityRes.success) setRecentActivities(activityRes.data);
//         if (washroomRes.success) setWashroomGraphData(washroomRes.data);
//         if (cleanerRes.success) setCleanerGraphData(cleanerRes);
//       } catch (error) {
//         console.error("Dashboard fetch error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchDash();
//   }, [companyId, canViewLocations, canViewCleanerReviews]);

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader size="large" color="#06b6d4" message="Loading Insights..." />
//       </div>
//     );
//   }

//   if (
//     !canViewLocations &&
//     !canViewCleanerReviews &&
//     !canViewUsers &&
//     !canViewReports
//   ) {
//     return (
//       <div className="flex flex-col justify-center items-center h-screen bg-slate-50">
//         <div className="text-center p-8 bg-white rounded-3xl shadow-sm border border-slate-100 max-w-md">
//           <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//           <h2 className="text-xl font-black text-slate-800 mb-2">
//             Limited Access
//           </h2>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4 md:p-8 bg-slate-50 dark:bg-[#0B0E14] transition-colors duration-300 font-sans">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
//         <div>
//           <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
//             Dashboard
//           </h1>
//           <p className="text-sm font-bold text-slate-400">
//             Municipal washroom & cleaner fleet overview
//           </p>
//         </div>
//         <div className="flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-cyan-500/10 shadow-sm backdrop-blur-md">
//           <Sparkles className="h-4 w-4 text-cyan-500" />
//           <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
//             Fresh Insights Ready
//           </span>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//         {canViewLocations && (
//           <SummaryCard
//             label="Total Toilets"
//             value={statsData.totalLocations}
//             icon={MapPin}
//             color="from-blue-500 to-cyan-400"
//             onClick={() => router.push(`/washrooms?companyId=${companyId}`)}
//           />
//         )}
//         {canViewCleanerReviews && (
//           <SummaryCard
//             label="Ongoing Tasks"
//             value={statsData.ongoingTasks}
//             icon={ClipboardList}
//             color="from-cyan-400 to-teal-400"
//             onClick={() =>
//               router.push(
//                 `/cleaner-review?companyId=${companyId}&status=ongoing`,
//               )
//             }
//           />
//         )}
//         {canViewCleanerReviews && (
//           <SummaryCard
//             label="Completed Tasks"
//             value={`${statsData.completedTasks}`}
//             icon={CheckCircle2}
//             color="from-emerald-400 to-teal-500"
//             onClick={() =>
//               router.push(
//                 `/cleaner-review?companyId=${companyId}&status=completed`,
//               )
//             }
//           />
//         )}
//         {canViewReports && (
//           <SummaryCard
//             label="Total Repairs"
//             value={statsData.totalRepairs}
//             icon={Wrench}
//             color="from-rose-400 to-orange-400"
//             onClick={() => router.push(`/repairs?companyId=${companyId}`)}
//           />
//         )}
//         {canViewUsers && (
//           <SummaryCard
//             label="Total Cleaners"
//             value={statsData.totalCleaners}
//             icon={UserCheck}
//             color="from-indigo-400 to-purple-400"
//             onClick={() =>
//               router.push(`/users?flag=cleaner&companyId=${companyId}`)
//             }
//           />
//         )}
//       </div>

//       {/* Charts Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
//         {canViewLocations && (
//           <CardShell
//             title="Cleanliness Trends"
//             subtitle="Top 5 Locations"
//             icon={<TrendingUp size={20} />}
//             onClick={() => setActiveChartModal("cleanliness")}
//             headerRight={
//               <button className="p-2 bg-slate-50 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors">
//                 <ChevronRight size={18} />
//               </button>
//             }
//           >
//             <div className="h-[300px] w-full mt-4">
//               <WashroomCleanlinessChart data={washroomGraphData.slice(0, 4)} />
//             </div>
//           </CardShell>
//         )}

//         {canViewCleanerReviews && (
//           <CardShell
//             title="Top Cleaners"
//             subtitle="Efficiency Metrics"
//             icon={<Users size={20} />}
//             onClick={() => setActiveChartModal("performance")}
//             headerRight={
//               <button className="p-2 bg-slate-50 rounded-lg hover:bg-cyan-500 hover:text-white transition-colors">
//                 <ChevronRight size={18} />
//               </button>
//             }
//           >
//             <div className="h-[300px] w-full mt-4">
//               <CleanerPerformanceChart
//                 data={cleanerGraphData.data}
//                 todayCount={cleanerGraphData.today_completed_tasks}
//               />
//             </div>
//           </CardShell>
//         )}
//       </div>

//       {/* Bottom Lists */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         {canViewLocations && (
//           <HighlightsCard
//             locations={topLocations}
//             onViewAll={() =>
//               router.push(
//                 `/washrooms?companyId=${companyId}&sortBy=currentScore`,
//               )
//             }
//           />
//         )}
//         {canViewCleanerReviews && (
//           <ActivityCard items={recentActivities} formatTime={formatTime} />
//         )}
//       </div>

//       {/* Modals */}
//       <ChartModal
//         isOpen={activeChartModal === "cleanliness"}
//         onClose={() => setActiveChartModal(null)}
//         title="Detailed Cleanliness Analysis"
//       >
//         <div className="h-full w-full">
//           <WashroomCleanlinessChart data={washroomGraphData.slice(0, 15)} />
//         </div>
//       </ChartModal>

//       <ChartModal
//         isOpen={activeChartModal === "performance"}
//         onClose={() => setActiveChartModal(null)}
//         title="Weekly Cleaner Performance"
//       >
//         <div className="h-full w-full">
//           <CleanerPerformanceChart
//             data={cleanerGraphData.data}
//             todayCount={cleanerGraphData.today_completed_tasks}
//           />
//         </div>
//       </ChartModal>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Users,
  ClipboardList,
  CheckCircle2,
  Activity,
  Wrench,
  Sparkles,
  TrendingUp,
  ChevronRight,
  X,
  UserCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";
import { useCompanyId } from "@/providers/CompanyProvider";
import { DashboardApi } from "@/features/Dashboard/Dashboard.api";
import {
  WashroomCleanlinessChart,
  CleanerPerformanceChart,
} from "@/components/graphs/dashboard/dashboardCharts";

/* --- UI COMPONENTS --- */

// 1. Enhanced Glass Card Shell with deeper shadows
const CardShell = ({
  title,
  subtitle,
  icon,
  headerRight,
  children,
  onClick,
  className = "",
}) => (
  <div
    onClick={onClick}
    className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[32px] border border-slate-200/60 dark:border-slate-700/50 
    shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)]
    hover:shadow-[0_20px_60px_rgb(6,182,212,0.15)] dark:hover:shadow-[0_20px_60px_rgb(6,182,212,0.25)]
    transition-all duration-500 hover:-translate-y-1 ${onClick ? "cursor-pointer" : ""} ${className}
    relative overflow-hidden p-6`}
  >
    {/* Ambient glow effect */}
    <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-400/10 dark:bg-cyan-400/5 rounded-full blur-3xl" />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 
            flex items-center justify-center text-cyan-600 dark:text-cyan-400
            shadow-[0_4px_20px_rgb(6,182,212,0.2)]"
          >
            {icon}
          </div>
          <div>
            {subtitle && (
              <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-0.5">
                {subtitle}
              </p>
            )}
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
        </div>
        {headerRight}
      </div>
      {children}
    </div>
  </div>
);

// 2. Enhanced Summary Card with stronger elevation
const SummaryCard = ({ label, value, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    className="group relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-[28px] p-6 
    border border-slate-200/60 dark:border-slate-700/50 
    shadow-[0_4px_24px_rgb(0,0,0,0.06)] dark:shadow-[0_4px_24px_rgb(0,0,0,0.3)]
    hover:shadow-[0_12px_48px_rgb(6,182,212,0.18)] dark:hover:shadow-[0_12px_48px_rgb(6,182,212,0.3)]
    overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer"
  >
    {/* Gradient background blur */}
    <div
      className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${color} 
      opacity-[0.08] group-hover:opacity-[0.15] blur-3xl transition-all duration-500`}
    />

    <div className="relative z-10 flex items-center gap-4">
      <div
        className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white 
        shadow-[0_8px_24px] shadow-current/30 group-hover:shadow-current/50 transition-shadow duration-500`}
      >
        <Icon size={22} strokeWidth={2.5} />
      </div>
      <div>
        <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-0.5">
          {value}
        </p>
        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {label}
        </p>
      </div>
    </div>
  </div>
);

// 3. Enhanced Highlights List with refined ranking badges
const HighlightsCard = ({ locations, onViewAll }) => {
  const getRankStyle = (index) => {
    if (index === 0)
      return "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 shadow-[0_4px_16px_rgb(251,191,36,0.4)] text-white ring-2 ring-amber-300/50";
    if (index === 1)
      return "bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500 shadow-[0_4px_16px_rgb(148,163,184,0.4)] text-white ring-2 ring-slate-300/50";
    if (index === 2)
      return "bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-[0_4px_16px_rgb(251,146,60,0.4)] text-white ring-2 ring-orange-300/50";
    return "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-200 font-bold shadow-[0_2px_8px_rgb(0,0,0,0.1)]";
  };

  return (
    <CardShell
      title="Top Rated Facilities"
      subtitle="Today's Performance"
      icon={<Sparkles size={20} />}
      headerRight={
        <button
          onClick={onViewAll}
          className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-cyan-600 dark:text-cyan-400
          hover:bg-cyan-500 hover:text-white shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <ChevronRight size={18} />
        </button>
      }
    >
      <div className="space-y-3 mt-2">
        {locations.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm font-bold">
            No data available
          </div>
        ) : (
          locations.map((loc, i) => (
            <div
              key={loc.id}
              className="flex items-center justify-between p-4 rounded-2xl 
              bg-gradient-to-r from-slate-50/80 to-slate-100/40 dark:from-slate-800/40 dark:to-slate-800/20
              border border-slate-200/50 dark:border-slate-700/50 
              hover:border-cyan-400/40 hover:shadow-[0_4px_20px_rgb(6,182,212,0.1)]
              transition-all duration-300 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-extrabold ${getRankStyle(i)}`}
                >
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                    {loc.name}
                  </p>
                </div>
              </div>
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl 
              bg-white/90 dark:bg-slate-800/90 shadow-[0_2px_12px_rgb(0,0,0,0.06)]
              border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
              >
                <span className="text-sm font-black text-cyan-600 dark:text-cyan-400">
                  {parseFloat(loc.currentScore || 0).toFixed(1)}
                </span>
                <TrendingUp size={14} className="text-amber-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </CardShell>
  );
};

// 4. Enhanced Activity List
const ActivityCard = ({ items, formatTime, onItemClick }) => (
  <CardShell
    title="Cleaner Activity"
    subtitle="Field Updates"
    icon={<Activity size={20} />}
  >
    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar mt-2">
      {items.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm font-bold">
          No activities today
        </div>
      ) : (
        items.map((item, i) => (
          <div
            key={`${item.type}-${item.id}`}
            onClick={() => onItemClick && onItemClick(item)}
            className="flex gap-4 group cursor-pointer p-3 rounded-xl 
            hover:bg-gradient-to-r hover:from-cyan-50/50 hover:to-blue-50/30
            dark:hover:from-cyan-900/10 dark:hover:to-blue-900/10
            transition-all duration-300 hover:shadow-sm"
          >
            <div className="relative flex flex-col items-center mt-1">
              <div
                className={`h-3.5 w-3.5 rounded-full shadow-[0_0_12px] ${
                  item?.score >= 4
                    ? "bg-emerald-400 shadow-emerald-400/60"
                    : "bg-cyan-400 shadow-cyan-400/60"
                }`}
              />
              {i !== items.length - 1 && (
                <div className="w-[2px] h-full bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700 my-1.5" />
              )}
            </div>
            <div className="pb-2 flex-1">
              <p
                className="text-sm font-bold text-slate-700 dark:text-slate-300 
              group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2"
              >
                {item?.text}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {formatTime(item.timestamp)}
                </span>
                {item.score && (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 
                  bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20
                  text-amber-600 dark:text-amber-400 rounded-md shadow-sm"
                  >
                    ★ {item.score}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </CardShell>
);

// 5. Enhanced Modal
const ChartModal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl w-full max-w-5xl h-[80vh] 
          rounded-[32px] shadow-[0_20px_80px_rgb(0,0,0,0.2)] dark:shadow-[0_20px_80px_rgb(0,0,0,0.6)]
          overflow-hidden flex flex-col border border-slate-200/50 dark:border-slate-700/50"
        >
          <div className="p-6 border-b border-slate-200/60 dark:border-slate-700/60 flex justify-between items-center backdrop-blur-sm">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all duration-300
              hover:shadow-lg"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 flex-1 bg-gradient-to-br from-slate-50/50 to-slate-100/30 dark:from-slate-900/50 dark:to-slate-800/30">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

/* --- MAIN PAGE --- */

export default function ClientDashboard() {
  const { canView, user } = usePermissions();
  const router = useRouter();
  const { companyId } = useCompanyId();

  // Permissions
  const canViewLocations = canView(MODULES.LOCATIONS);
  const canViewCleanerReviews = canView(MODULES.CLEANER_REVIEWS);
  const canViewUsers = canView(MODULES.USERS);
  const canViewReports = canView(MODULES.REPORTS);

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalLocations: 0,
    ongoingTasks: 0,
    completedTasks: 0,
    totalRepairs: 0,
    totalCleaners: 0,
  });
  const [topLocations, setTopLocations] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Graphs
  const [washroomGraphData, setWashroomGraphData] = useState([]);
  const [cleanerGraphData, setCleanerGraphData] = useState({
    data: [],
    today_completed_tasks: 0,
  });

  const [activeChartModal, setActiveChartModal] = useState(null);

  const getTodayDate = () => new Date().toISOString().split("T")[0];

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes}m ago`;
    }
    return diffInHours < 24
      ? `${diffInHours}h ago`
      : date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const handleActivityClick = (item) => {
    const reviewId = item.reviewId || item.id;
    if (reviewId) {
      router.push(`/cleaners/${reviewId}?companyId=${companyId}`);
    }
  };

  useEffect(() => {
    if (!companyId) return;

    const fetchDash = async () => {
      setIsLoading(true);
      const today = getTodayDate();

      try {
        const promises = [
          DashboardApi.getCounts(companyId, today),
          canViewLocations
            ? DashboardApi.getTopLocations(companyId, 5, today)
            : Promise.resolve({ success: true, data: [] }),
          canViewCleanerReviews
            ? DashboardApi.getActivities(companyId, 10, today)
            : Promise.resolve({ success: true, data: [] }),
          canViewLocations
            ? DashboardApi.getWashroomScoresSummary(companyId)
            : Promise.resolve({ success: true, data: [] }),
          canViewCleanerReviews
            ? DashboardApi.getCleanerPerformance(companyId)
            : Promise.resolve({
                success: true,
                data: [],
                today_completed_tasks: 0,
              }),
        ];

        const [countRes, topLocRes, activityRes, washroomRes, cleanerRes] =
          await Promise.all(promises);

        if (countRes.success) setStatsData(countRes.data);
        if (topLocRes.success) setTopLocations(topLocRes.data);
        if (activityRes.success) setRecentActivities(activityRes.data);
        if (washroomRes.success) setWashroomGraphData(washroomRes.data);
        if (cleanerRes.success) setCleanerGraphData(cleanerRes);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDash();
  }, [companyId, canViewLocations, canViewCleanerReviews]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-[#0B0E14] dark:to-slate-950">
        <Loader size="large" color="#06b6d4" message="Loading Insights..." />
      </div>
    );
  }

  if (
    !canViewLocations &&
    !canViewCleanerReviews &&
    !canViewUsers &&
    !canViewReports
  ) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center p-8 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 max-w-md">
          <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-800 mb-2">
            Limited Access
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-slate-100 via-slate-300/60 to-slate-200 
dark:from-[#0B0E14] dark:via-slate-950 dark:to-slate-900"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Municipal washroom & cleaner fleet overview
          </p>
        </div>
        <div
          className="flex items-center gap-3 px-6 py-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
        rounded-2xl border border-cyan-500/20 shadow-[0_4px_20px_rgb(6,182,212,0.1)]"
        >
          <Sparkles className="h-4 w-4 text-cyan-500" />
          <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
            Fresh Insights Ready
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {canViewLocations && (
          <SummaryCard
            label="Total Toilets"
            value={statsData.totalLocations}
            icon={MapPin}
            color="from-blue-500 to-cyan-400"
            onClick={() => router.push(`/washrooms?companyId=${companyId}`)}
          />
        )}
        {canViewCleanerReviews && (
          <SummaryCard
            label="Ongoing Tasks"
            value={statsData.ongoingTasks}
            icon={ClipboardList}
            color="from-cyan-400 to-teal-400"
            onClick={() =>
              router.push(
                `/cleaners?companyId=${companyId}&status=ongoing`,
              )
            }
          />
        )}
        {canViewCleanerReviews && (
          <SummaryCard
            label="Completed Tasks"
            value={`${statsData.completedTasks}`}
            icon={CheckCircle2}
            color="from-emerald-400 to-teal-500"
            onClick={() =>
              router.push(
                `/cleaners?companyId=${companyId}&status=completed`,
              )
            }
          />
        )}
        {canViewReports && (
          <SummaryCard
            label="Total Repairs"
            value={statsData.totalRepairs}
            icon={Wrench}
            color="from-rose-400 to-orange-400"
            onClick={() => router.push(`/repairs?companyId=${companyId}`)}
          />
        )}
        {canViewUsers && (
          <SummaryCard
            label="Total Cleaners"
            value={statsData.totalCleaners}
            icon={UserCheck}
            color="from-indigo-400 to-purple-400"
            onClick={() =>
              router.push(`/users?flag=cleaner&companyId=${companyId}`)
            }
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {canViewLocations && (
          <CardShell
            title="Cleanliness Trends"
            subtitle="Top 5 Locations"
            icon={<TrendingUp size={20} />}
            onClick={() => setActiveChartModal("cleanliness")}
            headerRight={
              <button
                className="p-2.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl 
              hover:bg-cyan-500 hover:text-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <ChevronRight size={18} />
              </button>
            }
          >
            <div className="h-[300px] w-full mt-4">
              <WashroomCleanlinessChart data={washroomGraphData.slice(0, 4)} />
            </div>
          </CardShell>
        )}

        {canViewCleanerReviews && (
          <CardShell
            title="Top Cleaners"
            subtitle="Efficiency Metrics"
            icon={<Users size={20} />}
            onClick={() => setActiveChartModal("performance")}
            headerRight={
              <button
                className="p-2.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl 
              hover:bg-cyan-500 hover:text-white shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <ChevronRight size={18} />
              </button>
            }
          >
            <div className="h-[300px] w-full mt-4">
              <CleanerPerformanceChart
                data={cleanerGraphData.data}
                todayCount={cleanerGraphData.today_completed_tasks}
              />
            </div>
          </CardShell>
        )}
      </div>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {canViewLocations && (
          <HighlightsCard
            locations={topLocations}
            onViewAll={() =>
              router.push(
                `/washrooms?companyId=${companyId}&sortBy=currentScore`,
              )
            }
          />
        )}
        {canViewCleanerReviews && (
          <ActivityCard
            items={recentActivities}
            formatTime={formatTime}
            onItemClick={handleActivityClick}
          />
        )}
      </div>

      {/* Modals */}
      <ChartModal
        isOpen={activeChartModal === "cleanliness"}
        onClose={() => setActiveChartModal(null)}
        title="Detailed Cleanliness Analysis"
      >
        <div className="h-full w-full">
          <WashroomCleanlinessChart data={washroomGraphData.slice(0, 15)} />
        </div>
      </ChartModal>

      <ChartModal
        isOpen={activeChartModal === "performance"}
        onClose={() => setActiveChartModal(null)}
        title="Weekly Cleaner Performance"
      >
        <div className="h-full w-full">
          <CleanerPerformanceChart
            data={cleanerGraphData.data}
            todayCount={cleanerGraphData.today_completed_tasks}
          />
        </div>
      </ChartModal>
    </div>
  );
}
