// /* eslint-disable react-hooks/static-components */
// "use client";

// import { useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import toast, { Toaster } from "react-hot-toast";

// import { useCompanyId } from "@/providers/CompanyProvider";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission.js";
// import { MODULES } from "@/shared/constants/permissions";

// import { useCleanerReviews } from "@/features/cleaners/cleaners.queries.js";

// import {
//   ListChecks,
//   Clock,
//   CheckCircle,
//   Calendar,
//   MapPin,
//   RotateCcw,
//   Eye,
//   Search,
//   BarChart3,
//   X,
//   User,
// } from "lucide-react";

// /* ---------------- helpers ---------------- */

// const cleanString = (str) =>
//   str
//     ? String(str)
//         .replace(/^["'\s]+|["'\s,]+$/g, "")
//         .trim()
//     : "";

// const getTimeElapsed = (startTime) => {
//   const diff = Date.now() - new Date(startTime);
//   const h = Math.floor(diff / 3_600_000);
//   const m = Math.floor((diff % 3_600_000) / 60_000);
//   return h > 0 ? `${h}h ${m}m ago` : `${m}m ago`;
// };

// const getCompletionTime = (start, end) => {
//   const diff = new Date(end) - new Date(start);
//   const h = Math.floor(diff / 3_600_000);
//   const m = Math.floor((diff % 3_600_000) / 60_000);
//   return h > 0 ? `Completed in ${h}h ${m}m` : `Completed in ${m}m`;
// };

// /* ---------------- page ---------------- */

// export default function CleanerReviewPage() {
//   useRequirePermission(MODULES.CLEANER_ACTIVITY);

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { companyId } = useCompanyId();

//   const [filter, setFilter] = useState(searchParams.get("status") || "all");
//   const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
//   const [searchQuery, setSearchQuery] = useState("");

//   /* ---------------- TanStack Query ---------------- */

//   const { data, isLoading, isError, error, refetch } = useCleanerReviews(
//     {
//       status: filter === "all" ? null : filter,
//       date: date || null,
//     },
//     companyId,
//   );

//   /* ---------------- derived data ---------------- */
//   console.log("companyId:", companyId);
//   const reviews = (() => {
//     if (!data) return [];

//     let cleaned = data.map((r) => ({
//       ...r,
//       name: cleanString(r?.cleaner_user?.name),
//       address: cleanString(r?.address),
//     }));

//     if (searchQuery.trim()) {
//       const q = searchQuery.toLowerCase();
//       cleaned = cleaned.filter(
//         (r) =>
//           r?.cleaner_user?.name?.toLowerCase().includes(q) ||
//           r?.location?.name?.toLowerCase().includes(q),
//       );
//     }

//     return cleaned;
//   })();

//   /* ---------------- ui helpers ---------------- */

//   const handleReset = () => {
//     setFilter("all");
//     setDate("");
//     setSearchQuery("");
//     toast.success("Filters reset");
//     refetch();
//   };

//   /* ---------------- error handling ---------------- */

//   if (isError) {
//     toast.error(error?.message || "Failed to load cleaner activity");
//   }

//   const handleChange = (e) => {
//     console.log("in handle change", e.target.value);
//     setDate(e.target.value);
//   };
//   /* ---------------- render ---------------- */

//   return (
//     <>
//       <Toaster position="top-center" />

//       <div className="min-h-screen bg-background text-foreground p-6">
//         <div className="max-w-7xl mx-auto space-y-6">
//           {/* ================= HEADER CARD ================= */}
//           <div className="bg-[var(--surface)] border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//             <div className="flex items-center gap-3">
//               <div className="p-2 rounded-md bg-muted">
//                 <ListChecks className="text-primary" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold">CLEANERS ACTIVITY</h1>
//                 <p className="text-xs text-muted-foreground">
//                   Monitor real-time daily cleaning tasks and progress
//                 </p>
//               </div>
//             </div>

//             <div className="flex gap-2 bg-muted p-1 rounded-lg">
//               {["all", "ongoing", "completed"].map((v) => (
//                 <button
//                   key={v}
//                   onClick={() => setFilter(v)}
//                   className={`px-4 py-1.5 rounded-md text-sm font-medium transition
//                     ${
//                       filter === v
//                         ? "bg-primary text-primary-foreground"
//                         : "text-muted-foreground hover:bg-muted/70"
//                     }`}
//                 >
//                   {v === "all" ? "All Tasks" : v}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* ================= FILTER CARD ================= */}
//           <div className="bg-[var(--surface)] border border-border rounded-xl p-5 space-y-4">
//             <div className="flex items-center gap-2 text-sm font-semibold">
//               <Calendar className="text-primary" size={16} />
//               FILTER BY DATE
//             </div>

//             <div className="flex flex-wrap gap-4 items-center">
//               <input
//                 type="date"
//                 value={date}
//                 onChange={handleChange}
//                 className="input w-48"
//               />

//               <button onClick={handleReset} className="action">
//                 <RotateCcw size={14} />
//                 Reset
//               </button>
//             </div>
//           </div>

//           {/* ================= MAIN GRID ================= */}
//           <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//             {/* ===== LEFT: ACTIVITY OVERVIEW ===== */}
//             <div className="bg-[var(--surface)] border border-border rounded-xl p-5">
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="p-2 rounded-md bg-muted">
//                   <BarChart3 size={16} className="text-primary" />
//                 </div>
//                 <h3 className="font-semibold">Activity Overview</h3>
//               </div>

//               <div className="flex items-center gap-4 mb-5">
//                 <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center text-sm font-bold text-primary">
//                   75%
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium">Completion Rate</p>
//                   <p className="text-xs text-muted-foreground">
//                     Target: <span className="text-primary">90%</span>
//                   </p>
//                 </div>
//               </div>

//               <p className="text-xs text-muted-foreground">PERFORMANCE SCORE</p>
//               <p className="font-semibold text-lg">
//                 8.2 <span className="text-muted-foreground text-sm">/ 10</span>
//               </p>
//             </div>

//             {/* ===== RIGHT: CLEANER CARDS ===== */}
//             <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
//               {isLoading ? (
//                 <div className="col-span-full text-center text-muted-foreground">
//                   Loading cleaner activity…
//                 </div>
//               ) : reviews.length ? (
//                 reviews.map((r) => (
//                   <div
//                     key={r.id}
//                     className="bg-[var(--surface)] border border-border rounded-xl p-5"
//                   >
//                     {/* Header */}
//                     <div className="flex items-start justify-between mb-4">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
//                           <User size={16} className="text-primary" />
//                         </div>
//                         <div>
//                           <p className="font-semibold">
//                             {r.cleaner_user?.name || "Cleaner"}
//                           </p>
//                           <p className="text-xs text-muted-foreground">
//                             STAFF MEMBER
//                           </p>
//                         </div>
//                       </div>

//                       <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-primary">
//                         {r.status.toUpperCase()}
//                       </span>
//                     </div>

//                     {/* Evidence */}
//                     <p className="text-xs text-muted-foreground mb-2">
//                       EVIDENCE LOGS ({r.before_photo?.length || 0})
//                     </p>

//                     <div className="flex items-center gap-2 mb-4">
//                       {(r.before_photo || []).slice(0, 2).map((img, i) => (
//                         <img
//                           key={i}
//                           src={img}
//                           className="w-10 h-10 rounded-full object-cover border border-border"
//                           alt=""
//                         />
//                       ))}
//                       {(r.before_photo?.length || 0) > 2 && (
//                         <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
//                           +{r.before_photo.length - 2}
//                         </div>
//                       )}
//                     </div>

//                     {/* Location */}
//                     <div className="bg-muted rounded-lg p-3 mb-4">
//                       <p className="text-sm font-medium flex items-center gap-2">
//                         <MapPin size={14} />
//                         {r.location?.name}
//                       </p>
//                       <p className="text-xs text-muted-foreground mt-1">
//                         Started: {new Date(r.created_at).toLocaleString()}
//                       </p>
//                       {r.status === "ongoing" && (
//                         <p className="text-xs text-primary mt-1">
//                           <Clock size={12} className="inline mr-1" />
//                           {getTimeElapsed(r.created_at)}
//                         </p>
//                       )}
//                     </div>

//                     <button
//                       onClick={() =>
//                         router.push(`/cleaners/${r.id}?companyId=${companyId}`)
//                       }
//                       className="w-full py-2 rounded-lg border border-border text-primary text-sm font-medium hover:bg-muted transition"
//                     >
//                       Detailed Report →
//                     </button>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-span-full text-center text-muted-foreground">
//                   No cleaner activity found
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect, useMemo,useRef} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission.js";
import { MODULES } from "@/shared/constants/permissions";

// IMPORT BOTH HOOKS HERE
import { useCleanerReview } from "@/features/cleaners/cleaners.queries.js";
import { useCleanersDropdown } from "@/features/dropdownList/dropdownlist.query";

import {
  ListChecks,
  Clock,
  Calendar,
  MapPin,
  RotateCcw,
  BarChart3,
  User,
  ChevronDown,
} from "lucide-react";

/* ---------------- helpers ---------------- */

const cleanString = (str) =>
  str
    ? String(str)
      .replace(/^["'\s]+|["'\s,]+$/g, "")
      .trim()
    : "";

const getTimeElapsed = (startTime) => {
  const diff = Date.now() - new Date(startTime);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m ago` : `${m}m ago`;
};

// Helper to get local date string YYYY-MM-DD
const getLocalDateString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const localDate = new Date(now.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
};

/* ---------------- page ---------------- */

export default function CleanerReviewPage() {
  useRequirePermission(MODULES.CLEANER_REVIEWS);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  // Basic Filters
  const [filter, setFilter] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery] = useState("");


  const [isCleanerDropdownOpen, setIsCleanerDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Advanced Filters
  const [datePreset, setDatePreset] = useState("today"); // 'all', 'today', 'this_month', 'custom'
  const [startDate, setStartDate] = useState(getLocalDateString());
  const [endDate, setEndDate] = useState(getLocalDateString());
  const [selectedCleanerId, setSelectedCleanerId] = useState("all");

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  /* ---------------- Date Preset Logic ---------------- */
  useEffect(() => {
    const todayStr = getLocalDateString();
    const todayObj = new Date();

    if (datePreset === "today") {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (datePreset === "this_month") {
      const firstDay = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
      const lastDay = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0);

      const formatLocal = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split("T")[0];

      setStartDate(formatLocal(firstDay));
      setEndDate(formatLocal(lastDay));
    } else if (datePreset === "all") {
      setStartDate("");
      setEndDate("");
    }
  }, [datePreset]);

  // Reset page to 1 if any filter changes
  useEffect(() => {
    setPage(1);
  }, [filter, datePreset, startDate, endDate, selectedCleanerId]);

  /* ---------------- TanStack Queries ---------------- */

  // 1. Fetch Main Table Data
  const { data: response, isLoading, isError, error } = useCleanerReview(
    {
      status: filter === "all" ? null : filter,
      start_date: startDate || null,
      end_date: endDate || startDate || null,
      cleaner_id: selectedCleanerId === "all" ? null : selectedCleanerId,
      page,
      limit
    },
    companyId,
  );

  // 2. Fetch Dropdown Data (Independent of table filters)
  const { data: cleanersDropdownList = [] } = useCleanersDropdown(companyId);

  // Extract arrays safely to prevent crashes
  const rawReviews = response?.data || [];
  const pagination = response?.pagination || {};

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCleanerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- derived data ---------------- */
  const reviews = useMemo(() => {
    if (!rawReviews || rawReviews.length === 0) return [];

    let cleaned = rawReviews.map((r) => ({
      ...r,
      name: cleanString(r?.cleaner_user?.name),
      address: cleanString(r?.address),
    }));

    // Client-side fallback for cleaner filtering
    if (selectedCleanerId !== "all") {
      cleaned = cleaned.filter(r => String(r.cleaner_user?.id) === String(selectedCleanerId));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cleaned = cleaned.filter(
        (r) =>
          r?.cleaner_user?.name?.toLowerCase().includes(q) ||
          r?.location?.name?.toLowerCase().includes(q),
      );
    }

    return cleaned;
  }, [rawReviews, searchQuery, selectedCleanerId]);

  /* ---------------- ui helpers ---------------- */
  const handleReset = () => {
    setFilter("all");
    setDatePreset("all");
    setSearchQuery("");
    setSelectedCleanerId("all");
    setPage(1);
    toast.success("Filters reset");
  };

  if (isError) {
    toast.error(error?.message || "Failed to load cleaner activity");
  }
useEffect(() => {
  const cleanerIdFromUrl = searchParams.get("cleanerId");
  const dateFromUrl = searchParams.get("date");

  if (cleanerIdFromUrl) {
    setSelectedCleanerId(cleanerIdFromUrl);
  }

  if (dateFromUrl) {
    setDatePreset("custom"); // Set to custom so it doesn't default to 'today'
    setStartDate(dateFromUrl);
    setEndDate(dateFromUrl);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams]);

  /* ---------------- render ---------------- */
  return (
 <>
      <Toaster position="top-center" />

      <div
        className="min-h-screen p-4 md:p-6 md:mt-[-25px]"
        style={{
          background: "var(--cleaner-bg)",
          color: "var(--cleaner-title)",
        }}
      >
        <div className="max-w-7xl mx-auto space-y-4">

          {/* ================= HEADER CARD ================= */}
          <div
            className="rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            style={{
              background: "var(--cleaner-header-bg)",
              border: "1px solid var(--cleaner-header-border)",
              backdropFilter: "blur(6px)",
            }}
          >
            {/* LEFT */}
            <div className="flex items-center gap-3">
              <div
                className="
                  flex items-center justify-center
                  p-2.5 rounded-xl
                  bg-[var(--cleaner-header-icon-bg)]
                  border border-[var(--cleaner-header-icon-border)]
                  shadow-[var(--cleaner-header-icon-shadow)]
                "
              >
                <ListChecks
                  size={18}
                  className="text-[var(--cleaner-header-icon-fg)]"
                />
              </div>

              <div>
                <h1
                  className="text-lg font-bold leading-none mb-1"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  CLEANERS ACTIVITY
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "var(--cleaner-subtitle)" }}
                >
                  Monitor real-time daily cleaning tasks and progress
                </p>
              </div>
            </div>

            {/* STATUS TOGGLE */}
            <div
              className="flex gap-1.5 p-1 rounded-lg"
              style={{
                background: "var(--cleaner-input-bg)",
                border: "1px solid var(--cleaner-border)",
              }}
            >
              {["all", "ongoing", "completed"].map((v) => {
                const active = filter === v;

                return (
                  <button
                    key={v}
                    onClick={() => setFilter(v)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
                    style={{
                      background: active
                        ? "var(--cleaner-primary-bg)"
                        : "transparent",
                      color: active
                        ? "var(--cleaner-primary-text)"
                        : "var(--cleaner-subtitle)",
                    }}
                  >
                    {v === "all" ? "All Tasks" : v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

        {/* ================= FILTER CARD ================= */}
          <div
            className="rounded-xl p-4 flex flex-wrap items-center justify-between gap-4" // Changed to flex, items-center, justify-between
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            {/* TITLE - Left Side */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <div
                className="flex items-center justify-center p-1.5 rounded-lg"
                style={{
                  background: "var(--cleaner-header-icon-bg)",
                  border: "1px solid var(--cleaner-header-icon-border)",
                }}
              >
                <Calendar
                  size={14}
                  style={{ color: "var(--cleaner-header-icon-fg)" }}
                />
              </div>
              <span style={{ color: "var(--cleaner-title)" }}>
                ACTIVITY FILTERS
              </span>
            </div>

            {/* CONTROLS - Right Side */}
            <div className="flex flex-wrap items-end gap-3">
              
              {/* Cleaner Dropdown */}
              <div className="flex flex-col gap-1" ref={dropdownRef}>
                <label className="text-[11px] font-medium" style={{ color: "var(--cleaner-subtitle)" }}>
                  Cleaner
                </label>
                <div className="relative w-44">
                  <div
                    onClick={() => setIsCleanerDropdownOpen(!isCleanerDropdownOpen)}
                    className="w-full rounded-md px-2.5 py-1.5 text-xs flex justify-between items-center cursor-pointer select-none"
                    style={{
                      background: "var(--cleaner-input-bg)",
                      border: "1px solid var(--cleaner-input-border)",
                      color: "var(--cleaner-title)",
                    }}
                  >
                    <span className="truncate">
                      {selectedCleanerId === "all"
                        ? "All Cleaners"
                        : cleanersDropdownList.find((c) => c.id === selectedCleanerId)?.name || "All Cleaners"}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 ${isCleanerDropdownOpen ? "rotate-180" : ""}`}
                      style={{ color: "var(--cleaner-subtitle)" }}
                    />
                  </div>

                  {isCleanerDropdownOpen && (
                    <div
                      className="absolute left-0 top-full mt-1 w-full rounded-md shadow-lg z-50 overflow-hidden"
                      style={{
                        background: "var(--cleaner-surface)",
                        border: "1px solid var(--cleaner-border)",
                      }}
                    >
                      <ul className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        <li
                          onClick={() => {
                            setSelectedCleanerId("all");
                            setIsCleanerDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs cursor-pointer transition-colors hover:opacity-80"
                          style={{
                            color: "var(--cleaner-title)",
                            background: selectedCleanerId === "all" ? "var(--cleaner-input-bg)" : "transparent",
                          }}
                        >
                          All Cleaners
                        </li>
                        {cleanersDropdownList.map((c) => (
                          <li
                            key={c.id}
                            onClick={() => {
                              setSelectedCleanerId(c.id);
                              setIsCleanerDropdownOpen(false);
                            }}
                            className="px-3 py-2 text-xs cursor-pointer transition-colors hover:opacity-80"
                            style={{
                              color: "var(--cleaner-title)",
                              background: selectedCleanerId === c.id ? "var(--cleaner-input-bg)" : "transparent",
                            }}
                          >
                            {c.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Date Preset Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium" style={{ color: "var(--cleaner-subtitle)" }}>
                  Date Range
                </label>
                <div className="relative w-36">
                  <select
                    value={datePreset}
                    onChange={(e) => setDatePreset(e.target.value)}
                    className="w-full rounded-md px-2.5 py-1.5 text-xs appearance-none outline-none cursor-pointer"
                    style={{
                      background: "var(--cleaner-input-bg)",
                      border: "1px solid var(--cleaner-input-border)",
                      color: "var(--cleaner-title)",
                    }}
                  >
                    <option value="today">Today</option>
                    <option value="this_month">This Month</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Date</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--cleaner-subtitle)" }} />
                </div>
              </div>

              {/* Custom Date Inputs */}
              {datePreset === "custom" && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium" style={{ color: "var(--cleaner-subtitle)" }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-32 rounded-md px-2.5 py-1.5 text-xs outline-none"
                      style={{
                        background: "var(--cleaner-input-bg)",
                        border: "1px solid var(--cleaner-input-border)",
                        color: "var(--cleaner-input-text)",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-medium" style={{ color: "var(--cleaner-subtitle)" }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-32 rounded-md px-2.5 py-1.5 text-xs outline-none"
                      style={{
                        background: "var(--cleaner-input-bg)",
                        border: "1px solid var(--cleaner-input-border)",
                        color: "var(--cleaner-input-text)",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition h-[28px] cursor-pointer"
                style={{
                  background: "var(--cleaner-danger-bg)",
                  color: "var(--cleaner-danger-text)",
                  border: "1px solid var(--cleaner-border)",
                }}
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          </div>

          {/* ================= MAIN GRID ================= */}
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* UPDATED: md:grid-cols-2 xl:grid-cols-3 handles the 3-columns layout! */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
                    style={{
                      borderColor: "var(--cleaner-kpi-value)",
                      borderTopColor: "transparent",
                    }}
                  />
                  <p className="text-sm font-medium" style={{ color: "var(--cleaner-title)" }}>
                    Loading cleaner activity
                  </p>
                </div>
              ) : reviews.length ? (
                <>
                  {reviews.map((r) => {
                    const active = r.status === "completed";

                    // === COMBINED PHOTOS & LOGIC ===
                    const allPhotos = [...(r.before_photo || []), ...(r.after_photo || [])];
                    const totalPhotos = allPhotos.length;
                    const displayPhotos = allPhotos.slice(0, 2);
                    const remainingCount = totalPhotos - 2;

                    return (
                      <div
                        key={r.id}
                        className="rounded-xl p-4 flex flex-col"
                        style={{
                          background: "var(--cleaner-surface)",
                          border: "1px solid var(--cleaner-border)",
                          boxShadow: "var(--cleaner-shadow)",
                        }}
                      >
                        {/* HEADER */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center"
                              style={{
                                background: "var(--cleaner-header-icon-bg)",
                                border: "1px solid var(--cleaner-header-icon-border)",
                              }}
                            >
                              <User
                                size={14}
                                style={{ color: "var(--cleaner-header-icon-fg)" }}
                              />
                            </div>
                            <div>
                              <p
                                className="text-sm font-semibold truncate max-w-[100px]"
                                style={{ color: "var(--cleaner-title)", overflow: "hidden" }}
                                title={r.cleaner_user?.name || "Cleaner"}
                              >
                                {r.cleaner_user?.name || "Cleaner"}
                              </p>
                              <p
                                className="text-[10px]"
                                style={{ color: "var(--cleaner-subtitle)" }}
                              >
                                STAFF MEMBER
                              </p>
                            </div>
                          </div>

                          {/* STATUS */}
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                            style={{
                              background: active
                                ? "var(--cleaner-status-active-bg)"
                                : "var(--cleaner-status-inactive-bg)",
                              color: active
                                ? "var(--cleaner-status-active-text)"
                                : "var(--cleaner-status-inactive-text)",
                            }}
                          >
                            {r.status}
                          </span>
                        </div>

                        {/* EVIDENCE */}
                        <p
                          className="text-[10px] mb-1.5 uppercase tracking-wide"
                          style={{ color: "var(--cleaner-subtitle)" }}
                        >
                          EVIDENCE LOGS ({totalPhotos})
                        </p>

                        <div className="flex items-center gap-1.5 mb-3">
                          {displayPhotos.map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt="Evidence"
                              className="w-8 h-8 rounded-full object-cover"
                              style={{ border: "1px solid var(--cleaner-border)" }}
                            />
                          ))}

                          {remainingCount > 0 && (
                            <div
                              className="w-8 h-8 rounded-full text-[10px] font-bold flex items-center justify-center"
                              style={{
                                background: "var(--cleaner-kpi-value, #FFB800)",
                                color: "#000000",
                              }}
                            >
                              +{remainingCount}
                            </div>
                          )}
                        </div>

                        {/* LOCATION */}
                        <div
                          className="rounded-lg p-2.5 mb-3 mt-auto"
                          style={{
                            background: "var(--cleaner-input-bg)",
                            border: "1px solid var(--cleaner-border)",
                          }}
                        >
                          <p
                            className="text-xs font-medium flex items-center gap-1.5"
                            style={{ color: "var(--cleaner-title)" }}
                          >
                            <MapPin size={12} className="flex-shrink-0" />
                            <span className="truncate">{r.location?.name}</span>
                          </p>
                          <p
                            className="text-[10px] mt-1 pl-4"
                            style={{ color: "var(--cleaner-subtitle)" }}
                          >
                            Started: {new Date(r.created_at).toLocaleString()}
                          </p>
                          {r.status === "ongoing" && (
                            <p
                              className="text-[10px] mt-0.5 pl-4 flex items-center gap-1"
                              style={{ color: "var(--cleaner-primary-text)" }}
                            >
                              <Clock size={10} />
                              {getTimeElapsed(r.created_at)}
                            </p>
                          )}
                        </div>

                        {/* ACTION */}
                        <button
                          onClick={() =>
                            router.push(`/cleaners/${r.id}?companyId=${companyId}`)
                          }
                          className="w-full py-1.5 rounded-md text-xs font-medium transition cursor-pointer"
                          style={{
                            background: "var(--cleaner-primary-bg)",
                            color: "var(--cleaner-primary-text)",
                          }}
                        >
                          Detailed Report →
                        </button>
                      </div>
                    );
                  })}

                  {/* ================= PAGINATION CONTROLS ================= */}
                  <div
                    className="col-span-full flex flex-col sm:flex-row items-center justify-between gap-3 mt-2 p-3 rounded-xl"
                    style={{
                      background: "var(--cleaner-surface)",
                      border: "1px solid var(--cleaner-border)",
                    }}
                  >
                    {/* Limit Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]" style={{ color: "var(--cleaner-subtitle)" }}>
                        Rows per page:
                      </span>
                      <select
                        value={limit}
                        onChange={(e) => {
                          setLimit(Number(e.target.value));
                          setPage(1); // Reset to first page
                        }}
                        className="rounded px-1.5 py-0.5 text-xs outline-none cursor-pointer"
                        style={{
                          background: "var(--cleaner-input-bg)",
                          border: "1px solid var(--cleaner-input-border)",
                          color: "var(--cleaner-title)",
                        }}
                      >
                        <option value={15}>15</option>
                        <option value={30}>30</option>
                        <option value={50}>50</option>
                      </select>
                    </div>

                    {/* Metadata */}
                    <div className="text-[11px]" style={{ color: "var(--cleaner-subtitle)" }}>
                      Showing {pagination.total_items === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, pagination.total_items || 0)} of {pagination.total_items || 0} entries
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-1.5">
                      <button
                        disabled={!pagination.has_prev_page}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-2 py-1 rounded text-[11px] font-medium transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                          background: "var(--cleaner-input-bg)",
                          border: "1px solid var(--cleaner-border)",
                          color: "var(--cleaner-title)",
                        }}
                      >
                        Previous
                      </button>

                      <div className="text-[11px] font-medium px-1" style={{ color: "var(--cleaner-title)" }}>
                        Page {page} of {pagination.total_pages || 1}
                      </div>

                      <button
                        disabled={!pagination.has_next_page}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-2 py-1 rounded text-[11px] font-medium transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                          background: "var(--cleaner-input-bg)",
                          border: "1px solid var(--cleaner-border)",
                          color: "var(--cleaner-title)",
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: "var(--cleaner-input-bg)",
                      border: "1px solid var(--cleaner-border)",
                    }}
                  >
                    <ListChecks size={18} style={{ color: "var(--cleaner-header-icon-fg)" }} />
                  </div>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--cleaner-title)" }}>
                    No cleaner activity found
                  </p>
                  <p className="text-xs max-w-xs text-center" style={{ color: "var(--cleaner-subtitle)" }}>
                    There are no cleaning tasks matching your current filters. Try changing the date or resetting filters.
                  </p>
                </div>
              )}
            </div>

           </div>
        </div>
      </div>
    </>
  );
}
