"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  ListChecks,
  Calendar,
  RotateCcw,
  Search,
  ChevronDown,
  ShieldCheck,
  Filter,
} from "lucide-react";

import { useCompanyId } from "@/providers/CompanyProvider";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useCompanySlaConfig } from "@/features/companies/queries/sla.queries";
import { useCleanersDropdown } from "@/features/dropdownList/dropdownlist.query";

import {
  useSlaCleanerActivities,
} from "../slaCleanerActivity.queries";
import SlaCleanerActivityCard from "./SlaCleanerActivityCard";
import { getLocalDateString } from "../utils/slaActivityUtils";

export default function SlaCleanerActivityList() {
  useRequirePermission(MODULES.CLEANER_REVIEWS);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  // Filters State
  const [filter, setFilter] = useState(searchParams.get("status") || "all");
  const [slaStatus, setSlaStatus] = useState(searchParams.get("sla_status") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [datePreset, setDatePreset] = useState(searchParams.get("datePreset") || "today");
  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || getLocalDateString()
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("endDate") || getLocalDateString()
  );
  const [selectedCleanerId, setSelectedCleanerId] = useState(
    searchParams.get("cleanerId") || "all"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 15);

  // Dropdown States
  const [isCleanerDropdownOpen, setIsCleanerDropdownOpen] = useState(false);
  const cleanerDropdownRef = useRef(null);

  // Permissions & SLA config
  const { hasPermission } = usePermissions();
  const canManageReviews = hasPermission("cleaner_reviews", "manage");
  const { data: slaConfig } = useCompanySlaConfig(companyId, true);
  const isSlaEnabled = slaConfig?.enabled !== false;

  // TanStack Queries
  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useSlaCleanerActivities(
    {
      status: filter === "all" ? null : filter,
      sla_status: slaStatus === "all" ? null : slaStatus,
      start_date: startDate || null,
      end_date: endDate || startDate || null,
      cleaner_id: selectedCleanerId === "all" ? null : selectedCleanerId,
      search: searchQuery || null,
      page,
      limit,
    },
    companyId
  );

  const { data: cleanersDropdownList = [] } = useCleanersDropdown(companyId);

  const activities = response?.data || [];
  const pagination = response?.pagination || {};

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cleanerDropdownRef.current &&
        !cleanerDropdownRef.current.contains(event.target)
      ) {
        setIsCleanerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update URL parameters
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("status", filter);
    params.set("sla_status", slaStatus);
    params.set("cleanerId", selectedCleanerId);
    params.set("datePreset", datePreset);
    params.set("startDate", startDate);
    params.set("endDate", endDate);
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    if (searchQuery) {
      params.set("search", searchQuery);
    }

    const newQueryString = `?${params.toString()}`;
    if (window.location.search !== newQueryString) {
      router.replace(newQueryString, { scroll: false });
    }
  }, [
    filter,
    slaStatus,
    selectedCleanerId,
    datePreset,
    startDate,
    endDate,
    page,
    limit,
    searchQuery,
    router,
  ]);

  // Handle Preset Date changes
  useEffect(() => {
    const todayStr = getLocalDateString();
    const todayObj = new Date();

    if (datePreset === "today") {
      setStartDate((prev) => (prev !== todayStr ? todayStr : prev));
      setEndDate((prev) => (prev !== todayStr ? todayStr : prev));
    } else if (datePreset === "this_month") {
      const firstDay = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
      const lastDay = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0);
      const formatLocal = (d) =>
        new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .split("T")[0];

      const newStart = formatLocal(firstDay);
      const newEnd = formatLocal(lastDay);

      setStartDate((prev) => (prev !== newStart ? newStart : prev));
      setEndDate((prev) => (prev !== newEnd ? newEnd : prev));
    } else if (datePreset === "all") {
      setStartDate((prev) => (prev !== "" ? "" : prev));
      setEndDate((prev) => (prev !== "" ? "" : prev));
    }
  }, [datePreset]);

  // Reset pagination on filter change
  useEffect(() => {
    setPage((prev) => (prev !== 1 ? 1 : prev));
  }, [filter, slaStatus, datePreset, startDate, endDate, selectedCleanerId, searchQuery]);

  const handleReset = () => {
    setFilter("all");
    setSlaStatus("all");
    setDatePreset("all");
    setSearchQuery("");
    setSelectedCleanerId("all");
    setPage(1);
    toast.success("Filters reset");
  };

  if (isError) {
    toast.error(error?.message || "Failed to load SLA cleaner activity");
  }

  return (
    <>
      <Toaster position="top-center" />

      <div
        className="min-h-screen p-2 sm:p-4 lg:p-6 md:mt-[-25px]"
        style={{
          background: "var(--cleaner-bg, #F9FAFB)",
          color: "var(--cleaner-title, #111827)",
        }}
      >
        <div className="w-full 2xl:max-w-[1800px] mx-auto space-y-4">
          {/* ================= HEADER CARD ================= */}
          <div
            className="rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            style={{
              background: "var(--cleaner-header-bg, #FFFFFF)",
              border: "1px solid var(--cleaner-header-border, #E5E7EB)",
              boxShadow: "var(--cleaner-shadow, 0 1px 3px rgba(0,0,0,0.05))",
            }}
          >
            {/* Title & Icon */}
            <div className="flex items-center gap-3">
              <div
                className="flex items-center justify-center p-2.5 rounded-xl shrink-0"
                style={{
                  background: "var(--cleaner-header-icon-bg, #FFF7ED)",
                  border: "1px solid var(--cleaner-header-icon-border, #FFEDD5)",
                }}
              >
                <ShieldCheck
                  size={18}
                  style={{ color: "var(--cleaner-header-icon-fg, #EA580C)" }}
                />
              </div>

              <div>
                <h1
                  className="text-lg font-bold leading-none mb-1 flex items-center gap-2"
                  style={{ color: "var(--cleaner-title, #111827)" }}
                >
                  SLA CLEANER ACTIVITY
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    SLA + Retry Mode
                  </span>
                </h1>
                <p
                  className="text-xs"
                  style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                >
                  Grouped cleaning lifecycles, real-time SLA breach monitoring, and retry progression
                </p>
              </div>
            </div>

            {/* Status Toggle */}
            <div
              className="flex gap-1.5 p-1 rounded-lg self-start md:self-auto"
              style={{
                background: "var(--cleaner-input-bg, #F3F4F6)",
                border: "1px solid var(--cleaner-border, #E5E7EB)",
              }}
            >
              {["all", "ongoing", "completed"].map((v) => {
                const active = filter === v;
                return (
                  <button
                    key={v}
                    onClick={() => setFilter(v)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer flex-1 md:flex-auto text-center"
                    style={{
                      background: active
                        ? "var(--cleaner-primary-bg, #EA580C)"
                        : "transparent",
                      color: active
                        ? "var(--cleaner-primary-text, #FFFFFF)"
                        : "var(--cleaner-subtitle, #6B7280)",
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
            className="rounded-xl p-4 flex flex-col xl:flex-row xl:items-center justify-between gap-4"
            style={{
              background: "var(--cleaner-surface, #FFFFFF)",
              border: "1px solid var(--cleaner-border, #E5E7EB)",
              boxShadow: "var(--cleaner-shadow, 0 1px 3px rgba(0,0,0,0.05))",
            }}
          >
            {/* Title Left */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <div
                className="flex items-center justify-center p-1.5 rounded-lg"
                style={{
                  background: "var(--cleaner-header-icon-bg, #FFF7ED)",
                  border: "1px solid var(--cleaner-header-icon-border, #FFEDD5)",
                }}
              >
                <Calendar
                  size={14}
                  style={{ color: "var(--cleaner-header-icon-fg, #EA580C)" }}
                />
              </div>
              <span style={{ color: "var(--cleaner-title, #111827)" }}>
                LIFECYCLE FILTERS
              </span>
            </div>

            {/* Controls Right */}
            <div className="flex flex-wrap items-end gap-3 w-full xl:w-auto">
              {/* SLA Status Filter */}
              <div className="flex flex-col gap-1 flex-grow sm:flex-grow-0">
                <label
                  className="text-[11px] font-medium"
                  style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                >
                  SLA Status
                </label>
                <div className="relative w-full sm:w-44">
                  <select
                    value={slaStatus}
                    onChange={(e) => setSlaStatus(e.target.value)}
                    className="w-full rounded-md px-2.5 py-1.5 text-xs appearance-none outline-none cursor-pointer"
                    style={{
                      background: "var(--cleaner-input-bg, #F9FAFB)",
                      border: "1px solid var(--cleaner-input-border, #E5E7EB)",
                      color: "var(--cleaner-title, #111827)",
                    }}
                  >
                    <option value="all">All SLA States</option>
                    <option value="no_breach">No SLA Breach</option>
                    <option value="breached">SLA Breached / Retry Req.</option>
                    <option value="in_progress">Retry In Progress</option>
                    <option value="resolved">SLA Resolved</option>
                    <option value="exhausted">SLA Exhausted</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                  />
                </div>
              </div>

              {/* Cleaner Dropdown */}
              <div
                className="flex flex-col gap-1 flex-grow sm:flex-grow-0"
                ref={cleanerDropdownRef}
              >
                <label
                  className="text-[11px] font-medium"
                  style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                >
                  Cleaner
                </label>
                <div className="relative w-full sm:w-44">
                  <div
                    onClick={() => setIsCleanerDropdownOpen(!isCleanerDropdownOpen)}
                    className="w-full rounded-md px-2.5 py-1.5 text-xs flex justify-between items-center cursor-pointer select-none"
                    style={{
                      background: "var(--cleaner-input-bg, #F9FAFB)",
                      border: "1px solid var(--cleaner-input-border, #E5E7EB)",
                      color: "var(--cleaner-title, #111827)",
                    }}
                  >
                    <span className="truncate">
                      {selectedCleanerId === "all"
                        ? "All Cleaners"
                        : cleanersDropdownList.find(
                            (c) => String(c.id) === String(selectedCleanerId)
                          )?.name || "All Cleaners"}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`transition-transform duration-200 text-muted-foreground ${
                        isCleanerDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {isCleanerDropdownOpen && (
                    <div
                      className="absolute left-0 top-full mt-1 w-full rounded-md shadow-lg z-50 overflow-hidden"
                      style={{
                        background: "var(--cleaner-surface, #FFFFFF)",
                        border: "1px solid var(--cleaner-border, #E5E7EB)",
                      }}
                    >
                      <ul className="max-h-60 overflow-y-auto scrollbar-thin">
                        <li
                          onClick={() => {
                            setSelectedCleanerId("all");
                            setIsCleanerDropdownOpen(false);
                          }}
                          className="px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-muted"
                          style={{
                            color: "var(--cleaner-title, #111827)",
                            background:
                              selectedCleanerId === "all"
                                ? "var(--cleaner-input-bg, #F3F4F6)"
                                : "transparent",
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
                            className="px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-muted"
                            style={{
                              color: "var(--cleaner-title, #111827)",
                              background:
                                String(selectedCleanerId) === String(c.id)
                                  ? "var(--cleaner-input-bg, #F3F4F6)"
                                  : "transparent",
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
              <div className="flex flex-col gap-1 flex-grow sm:flex-grow-0">
                <label
                  className="text-[11px] font-medium"
                  style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                >
                  Date Range
                </label>
                <div className="relative w-full sm:w-36">
                  <select
                    value={datePreset}
                    onChange={(e) => setDatePreset(e.target.value)}
                    className="w-full rounded-md px-2.5 py-1.5 text-xs appearance-none outline-none cursor-pointer"
                    style={{
                      background: "var(--cleaner-input-bg, #F9FAFB)",
                      border: "1px solid var(--cleaner-input-border, #E5E7EB)",
                      color: "var(--cleaner-title, #111827)",
                    }}
                  >
                    <option value="today">Today</option>
                    <option value="this_month">This Month</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Date</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                  />
                </div>
              </div>

              {/* Custom Date Inputs */}
              {datePreset === "custom" && (
                <>
                  <div className="flex flex-col gap-1 flex-grow sm:flex-grow-0">
                    <label
                      className="text-[11px] font-medium"
                      style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full sm:w-32 rounded-md px-2.5 py-1.5 text-xs outline-none"
                      style={{
                        background: "var(--cleaner-input-bg, #F9FAFB)",
                        border: "1px solid var(--cleaner-input-border, #E5E7EB)",
                        color: "var(--cleaner-title, #111827)",
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-grow sm:flex-grow-0">
                    <label
                      className="text-[11px] font-medium"
                      style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                      className="w-full sm:w-32 rounded-md px-2.5 py-1.5 text-xs outline-none"
                      style={{
                        background: "var(--cleaner-input-bg, #F9FAFB)",
                        border: "1px solid var(--cleaner-input-border, #E5E7EB)",
                        color: "var(--cleaner-title, #111827)",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Search input */}
              <div className="flex flex-col gap-1 flex-grow sm:flex-grow-0">
                <label
                  className="text-[11px] font-medium"
                  style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                >
                  Search
                </label>
                <div className="relative w-full sm:w-44">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cleaner or Washroom..."
                    className="w-full rounded-md pl-7 pr-2.5 py-1.5 text-xs outline-none"
                    style={{
                      background: "var(--cleaner-input-bg, #F9FAFB)",
                      border: "1px solid var(--cleaner-input-border, #E5E7EB)",
                      color: "var(--cleaner-title, #111827)",
                    }}
                  />
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition h-[28px] cursor-pointer flex-grow sm:flex-grow-0 mt-2 sm:mt-0"
                style={{
                  background: "var(--cleaner-danger-bg, #FEE2E2)",
                  color: "var(--cleaner-danger-text, #DC2626)",
                  border: "1px solid var(--cleaner-border, #FECACA)",
                }}
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>
          </div>

          {/* ================= MAIN ACTIVITIES GRID ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 mt-4">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mb-3"
                  style={{
                    borderColor: "var(--cleaner-kpi-value, #EA580C)",
                    borderTopColor: "transparent",
                  }}
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--cleaner-title, #111827)" }}
                >
                  Loading SLA cleaner activities...
                </p>
              </div>
            ) : activities.length ? (
              <>
                {activities.map((activity) => (
                  <SlaCleanerActivityCard
                    key={activity.activity_id}
                    activity={activity}
                    companyId={companyId}
                    canManageReviews={canManageReviews}
                    isSlaEnabled={isSlaEnabled}
                    onNavigateDetail={(id) =>
                      router.push(`/slaCleanerActivity/${id}?companyId=${companyId}`)
                    }
                  />
                ))}

                {/* ================= PAGINATION CONTROLS ================= */}
                <div
                  className="col-span-full flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 p-3 rounded-xl"
                  style={{
                    background: "var(--cleaner-surface, #FFFFFF)",
                    border: "1px solid var(--cleaner-border, #E5E7EB)",
                  }}
                >
                  {/* Rows per page */}
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px]"
                      style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                    >
                      Rows per page:
                    </span>
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="rounded px-1.5 py-0.5 text-xs outline-none cursor-pointer border"
                      style={{
                        background: "var(--cleaner-input-bg, #F9FAFB)",
                        borderColor: "var(--cleaner-input-border, #E5E7EB)",
                        color: "var(--cleaner-title, #111827)",
                      }}
                    >
                      <option value={15}>15</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Metadata */}
                  <div
                    className="text-[11px]"
                    style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                  >
                    Showing{" "}
                    {pagination.total_items === 0
                      ? 0
                      : (page - 1) * limit + 1}{" "}
                    to{" "}
                    {Math.min(page * limit, pagination.total_items || 0)} of{" "}
                    {pagination.total_items || 0} lifecycles
                  </div>

                  {/* Page Navigation */}
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={!pagination.has_prev_page}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 rounded text-[11px] font-medium transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border"
                      style={{
                        background: "var(--cleaner-input-bg, #F9FAFB)",
                        borderColor: "var(--cleaner-border, #E5E7EB)",
                        color: "var(--cleaner-title, #111827)",
                      }}
                    >
                      Previous
                    </button>

                    <div
                      className="text-[11px] font-medium px-1"
                      style={{ color: "var(--cleaner-title, #111827)" }}
                    >
                      Page {page} of {pagination.total_pages || 1}
                    </div>

                    <button
                      disabled={!pagination.has_next_page}
                      onClick={() => setPage((p) => p + 1)}
                      className="px-2.5 py-1 rounded text-[11px] font-medium transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border"
                      style={{
                        background: "var(--cleaner-input-bg, #F9FAFB)",
                        borderColor: "var(--cleaner-border, #E5E7EB)",
                        color: "var(--cleaner-title, #111827)",
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3 border"
                  style={{
                    background: "var(--cleaner-input-bg, #F9FAFB)",
                    borderColor: "var(--cleaner-border, #E5E7EB)",
                  }}
                >
                  <ListChecks
                    size={20}
                    style={{ color: "var(--cleaner-header-icon-fg, #EA580C)" }}
                  />
                </div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--cleaner-title, #111827)" }}
                >
                  No SLA cleaner activities found
                </p>
                <p
                  className="text-xs max-w-xs text-center"
                  style={{ color: "var(--cleaner-subtitle, #6B7280)" }}
                >
                  There are no cleaning activity lifecycles matching your current filters. Try adjusting date or resetting filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
