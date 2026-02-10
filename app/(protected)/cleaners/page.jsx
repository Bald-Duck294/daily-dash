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

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission.js";
import { MODULES } from "@/shared/constants/permissions";

import { useCleanerReviews } from "@/features/cleaners/cleaners.queries.js";

import {
  ListChecks,
  Clock,
  Calendar,
  MapPin,
  RotateCcw,
  BarChart3,
  User,
  X, // Imported X icon
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

  const [filter, setFilter] = useState(searchParams.get("status") || "all");

  // Initialize with "Today" so users see relevant data first
  const [date, setDate] = useState(getLocalDateString());
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------------- TanStack Query ---------------- */

  const { data, isLoading, isError, error, refetch } = useCleanerReviews(
    {
      status: filter === "all" ? null : filter,
      date: date || null, // If date is empty string, send null to API (All time)
    },
    companyId,
  );

  /* ---------------- derived data ---------------- */
  const reviews = (() => {
    if (!data) return [];

    let cleaned = data.map((r) => ({
      ...r,
      name: cleanString(r?.cleaner_user?.name),
      address: cleanString(r?.address),
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      cleaned = cleaned.filter(
        (r) =>
          r?.cleaner_user?.name?.toLowerCase().includes(q) ||
          r?.location?.name?.toLowerCase().includes(q),
      );
    }

    return cleaned;
  })();

  /* ---------------- ui helpers ---------------- */

  const handleReset = () => {
    setFilter("all");
    setDate(""); // [FIX] Clear date to show ALL history, instead of resetting to Today
    setSearchQuery("");
    toast.success("Filters reset (Showing all history)");
  };

  /* ---------------- error handling ---------------- */

  if (isError) {
    toast.error(error?.message || "Failed to load cleaner activity");
  }

  /* ---------------- render ---------------- */

  return (
    <>
      <Toaster position="top-center" />

      <div
        className="min-h-screen p-6"
        style={{
          background: "var(--cleaner-bg)",
          color: "var(--cleaner-title)",
        }}
      >

        <div className="max-w-7xl mx-auto space-y-6">

          {/* ================= HEADER CARD ================= */}
          <div
            className="rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
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
    p-3 rounded-xl
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
                  className="text-xl font-bold"
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

            {/* FILTER TOGGLE */}
            <div
              className="flex gap-2 p-1 rounded-lg"
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
                    className="px-4 py-1.5 rounded-md text-sm font-medium transition"
                    style={{
                      background: active
                        ? "var(--cleaner-primary-bg)"
                        : "transparent",
                      color: active
                        ? "var(--cleaner-primary-text)"
                        : "var(--cleaner-subtitle)",
                    }}
                  >
                    {v === "all" ? "All Tasks" : v}
                  </button>
                );
              })}
            </div>
          </div>


          {/* ================= FILTER CARD ================= */}
          <div
            className="rounded-xl p-5 space-y-4"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            {/* TITLE */}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <div
                className="flex items-center justify-center p-2 rounded-lg"
                style={{
                  background: "var(--cleaner-header-icon-bg)",
                  border: "1px solid var(--cleaner-header-icon-border)",
                  boxShadow: "var(--cleaner-header-icon-shadow)",
                }}
              >
                <Calendar
                  size={16}
                  style={{ color: "var(--cleaner-header-icon-fg)" }}
                />
              </div>

              <span style={{ color: "var(--cleaner-title)" }}>
                FILTER BY DATE
              </span>
            </div>


            {/* CONTROLS */}
            <div className="flex flex-wrap gap-4 items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-48 rounded-md px-3 py-2 text-sm"
                style={{
                  background: "var(--cleaner-input-bg)",
                  border: "1px solid var(--cleaner-input-border)",
                  color: "var(--cleaner-input-text)",
                }}
              />

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition"
                style={{
                  background: "var(--cleaner-danger-bg)",
                  color: "var(--cleaner-danger-text)",
                  border: "1px solid var(--cleaner-border)",
                }}
              >
                <RotateCcw size={14} />
                Reset Filters
              </button>
            </div>
          </div>


          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* ===== LEFT: ACTIVITY OVERVIEW ===== */}
            <div
              className="rounded-xl p-5 self-start"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >

              {/* HEADER */}
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="
      flex items-center justify-center
      p-2 rounded-lg
      bg-[var(--cleaner-header-icon-bg)]
      border border-[var(--cleaner-header-icon-border)]
      shadow-[var(--cleaner-header-icon-shadow)]
    "
                >
                  <BarChart3
                    size={16}
                    className="text-[var(--cleaner-header-icon-fg)]"
                  />
                </div>

                <h3 className="font-semibold text-[var(--cleaner-title)]">
                  Activity Overview
                </h3>
              </div>


              {/* COMPLETION RING */}
              <div className="flex items-center gap-4 mb-5">
                {/* KPI RING */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-sm font-semibold"
                  style={{
                    border: "4px solid var(--cleaner-kpi-value)",
                    color: "var(--cleaner-title)",
                    background: "transparent",
                  }}
                >
                  75%
                </div>

                {/* LABELS */}
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    Completion Rate
                  </p>

                  <p
                    className="text-xs"
                    style={{ color: "var(--cleaner-subtitle)" }}
                  >
                    Target:
                    <span
                      className="ml-1 font-medium"
                      style={{ color: "var(--cleaner-kpi-value)" }}
                    >
                      90%
                    </span>
                  </p>
                </div>
              </div>


              {/* PERFORMANCE */}
              <p className="text-xs tracking-wide text-[var(--cleaner-subtitle)]">
                PERFORMANCE SCORE
              </p>

              <p className="font-semibold text-lg text-[var(--cleaner-title)]">
                8.2
                <span className="ml-1 text-sm text-[var(--cleaner-subtitle)]">
                  / 10
                </span>
              </p>

            </div>


            {/* ===== RIGHT: CLEANER CARDS ===== */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {isLoading ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  {/* Spinner */}
                  <div
                    className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4"
                    style={{
                      borderColor: "var(--cleaner-kpi-value)",
                      borderTopColor: "transparent",
                    }}
                  />

                  {/* Text */}
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    Loading cleaner activity
                  </p>

                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--cleaner-subtitle)" }}
                  >
                    Please wait while we fetch the latest updates
                  </p>
                </div>

              ) : reviews.length ? (
                reviews.map((r) => {
                  const active = r.status === "completed";

                  return (
                    <div
                      key={r.id}
                      className="rounded-xl p-5"
                      style={{
                        background: "var(--cleaner-surface)",
                        border: "1px solid var(--cleaner-border)",
                        boxShadow: "var(--cleaner-shadow)",
                      }}
                    >
                      {/* HEADER */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{
                              background: "var(--cleaner-header-icon-bg)",
                              border: "1px solid var(--cleaner-header-icon-border)",
                              boxShadow: "var(--cleaner-header-icon-shadow)",
                            }}
                          >
                            <User
                              size={16}
                              style={{ color: "var(--cleaner-header-icon-fg)" }}
                            />
                          </div>


                          <div>
                            <p
                              className="font-semibold"
                              style={{ color: "var(--cleaner-title)" }}
                            >
                              {r.cleaner_user?.name || "Cleaner"}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: "var(--cleaner-subtitle)" }}
                            >
                              STAFF MEMBER
                            </p>
                          </div>
                        </div>

                        {/* STATUS */}
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium"
                          style={{
                            background: active
                              ? "var(--cleaner-status-active-bg)"
                              : "var(--cleaner-status-inactive-bg)",
                            color: active
                              ? "var(--cleaner-status-active-text)"
                              : "var(--cleaner-status-inactive-text)",
                          }}
                        >
                          {r.status.toUpperCase()}
                        </span>
                      </div>

                      {/* EVIDENCE */}
                      <p
                        className="text-xs mb-2"
                        style={{ color: "var(--cleaner-subtitle)" }}
                      >
                        EVIDENCE LOGS ({r.before_photo?.length || 0})
                      </p>

                      <div className="flex items-center gap-2 mb-4">
                        {(r.before_photo || []).slice(0, 2).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                            style={{ border: "1px solid var(--cleaner-border)" }}
                          />
                        ))}

                        {(r.before_photo?.length || 0) > 2 && (
                          <div
                            className="w-10 h-10 rounded-full text-xs flex items-center justify-center"
                            style={{
                              background: "var(--cleaner-primary-bg)",
                              color: "var(--cleaner-primary-text)",
                            }}
                          >
                            +{r.before_photo.length - 2}
                          </div>
                        )}
                      </div>

                      {/* LOCATION */}
                      <div
                        className="rounded-lg p-3 mb-4"
                        style={{
                          background: "var(--cleaner-input-bg)",
                          border: "1px solid var(--cleaner-border)",
                        }}
                      >
                        <p
                          className="text-sm font-medium flex items-center gap-2"
                          style={{ color: "var(--cleaner-title)" }}
                        >
                          <MapPin size={14} />
                          {r.location?.name}
                        </p>

                        <p
                          className="text-xs mt-1"
                          style={{ color: "var(--cleaner-subtitle)" }}
                        >
                          Started: {new Date(r.created_at).toLocaleString()}
                        </p>

                        {r.status === "ongoing" && (
                          <p
                            className="text-xs mt-1 flex items-center gap-1"
                            style={{ color: "var(--cleaner-primary-text)" }}
                          >
                            <Clock size={12} />
                            {getTimeElapsed(r.created_at)}
                          </p>
                        )}
                      </div>

                      {/* ACTION */}
                      <button
                        onClick={() =>
                          router.push(`/cleaners/${r.id}?companyId=${companyId}`)
                        }
                        className="w-full py-2 rounded-lg text-sm font-medium transition"
                        style={{
                          background: "var(--cleaner-primary-bg)",
                          color: "var(--cleaner-primary-text)",
                        }}
                      >
                        Detailed Report →
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: "var(--cleaner-input-bg)",
                      border: "1px solid var(--cleaner-border)",
                    }}
                  >
                    <ListChecks
                      size={22}
                      style={{ color: "var(--cleaner-header-icon-fg)" }}
                    />
                  </div>

                  {/* Title */}
                  <p
                    className="text-sm font-semibold mb-1"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    No cleaner activity found
                  </p>

                  {/* Helper text */}
                  <p
                    className="text-xs max-w-sm text-center"
                    style={{ color: "var(--cleaner-subtitle)" }}
                  >
                    There are no cleaning tasks matching your current filters.
                    Try changing the date or resetting filters.
                  </p>
                </div>

              )}
            </div>

          </div>
        </div>
      </div >
    </>
  );
}
