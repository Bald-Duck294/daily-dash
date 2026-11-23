"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Camera,
  MapPin,
  Phone,
  User,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  useCleaningRequests,
  useCleaningRequestStats,
} from "@/features/cleaningTasks/cleaningTasks.queries";
import AssignCleanerModal from "@/features/cleaningTasks/components/AssignCleanerModal";
import ResolveTaskModal from "@/features/cleaningTasks/components/ResolveTaskModal";
import PhotoProofModal from "@/features/cleaningTasks/components/PhotoProofModal";
import Loader from "@/components/ui/Loader";

export default function CleaningTasksPage() {
  const { user } = useSelector((state) => state.auth);
  const searchParams = useSearchParams();
  const { companyId: contextCompanyId } = useCompanyId();

  // Determine active company ID (URL param or Context)
  const activeCompanyId = searchParams.get("companyId") || contextCompanyId || "all";

  // Filter & Search states
  const [activeTab, setActiveTab] = useState("all"); // "all" | "pending" | "in_progress" | "resolved"
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 15;

  // Modals state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Query parameters
  const queryParams = useMemo(
    () => ({
      company_id: activeCompanyId,
      status: activeTab !== "all" ? activeTab : undefined,
      priority: priorityFilter !== "all" ? priorityFilter : undefined,
      search: searchQuery.trim() || undefined,
      page,
      limit,
    }),
    [activeCompanyId, activeTab, priorityFilter, searchQuery, page, limit]
  );

  // Queries
  const {
    data: requestsRes,
    isLoading: requestsLoading,
    isFetching: requestsFetching,
    refetch,
  } = useCleaningRequests(queryParams);

  const { data: statsRes, isLoading: statsLoading } = useCleaningRequestStats(
    activeCompanyId
  );

  const requests = requestsRes?.data || [];
  const pagination = requestsRes?.pagination || { total: 0, page: 1, limit, pages: 1 };
  const stats = statsRes?.data || {
    total: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    urgent: 0,
    auto_assigned: 0,
  };

  const handleOpenAssign = (req) => {
    setSelectedRequest(req);
    setAssignModalOpen(true);
  };

  const handleOpenResolve = (req) => {
    setSelectedRequest(req);
    setResolveModalOpen(true);
  };

  const handleOpenPhotos = (req) => {
    setSelectedRequest(req);
    setSelectedPhotos(req.images || []);
    setPhotoModalOpen(true);
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 animate-pulse">
            <Flame className="w-3 h-3" /> Urgent
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3" /> High
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Low
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <Clock className="w-3.5 h-3.5" /> Pending Allocation
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
            <UserCheck className="w-3.5 h-3.5" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {status || "Unknown"}
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Cleaning Tasks & Requests
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                Manage citizen cleaning tickets and supervise task allocations to cleaners
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={requestsFetching}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${requestsFetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Tickets</span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <span className="text-[11px] text-slate-400">All recorded requests</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Pending Allocation
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
            {stats.pending}
          </div>
          <span className="text-[11px] text-slate-400">Needs cleaner assigned</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              In Progress
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {stats.in_progress}
          </div>
          <span className="text-[11px] text-slate-400">Cleaners on site</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Resolved
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.resolved}
          </div>
          <span className="text-[11px] text-slate-400">Completed cleanings</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
              Urgent / High
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.urgent}
          </div>
          <span className="text-[11px] text-slate-400">Priority intervention</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
            {[
              { id: "all", label: "All Tasks" },
              { id: "pending", label: "Pending" },
              { id: "in_progress", label: "In Progress" },
              { id: "resolved", label: "Resolved" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Priority Filter */}
          <div className="flex items-center gap-2.5 flex-1 md:max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket #, washroom, cleaner..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          {requestsLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader />
              <p className="mt-3 text-xs text-slate-400">Loading cleaning tasks...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-20 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ClipboardList className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No cleaning requests found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                No tickets match your current filters. New citizen QR requests will appear here
                automatically.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-medium">
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Washroom Location</th>
                  <th className="py-3 px-4">Reported Issues</th>
                  <th className="py-3 px-4 text-center">Proof Photos</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Assigned Cleaner</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    {/* Ticket & Time */}
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-200 whitespace-nowrap">
                      <div>#{req.id}</div>
                      <div className="text-[11px] font-sans text-slate-400 font-normal">
                        {req.created_at
                          ? new Date(req.created_at).toLocaleString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </div>
                    </td>

                    {/* Washroom */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="truncate">{req.location?.name || "Unknown"}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate pl-5">
                        {req.location?.address || req.location?.code || "—"}
                      </div>
                    </td>

                    {/* Reported Issues */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(req.issues) && req.issues.length > 0 ? (
                          req.issues.map((issue, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium text-[11px] border border-amber-200/60 dark:border-amber-800/40"
                            >
                              {issue}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            {req.description || "General cleaning"}
                          </span>
                        )}
                      </div>
                      {req.description && Array.isArray(req.issues) && req.issues.length > 0 && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 italic">
                          "{req.description}"
                        </p>
                      )}
                    </td>

                    {/* Photos proof */}
                    <td className="py-3.5 px-4 text-center">
                      {Array.isArray(req.images) && req.images.length > 0 ? (
                        <button
                          onClick={() => handleOpenPhotos(req)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition text-xs font-medium"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>{req.images.length}</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getPriorityBadge(req.priority)}
                    </td>

                    {/* Cleaner */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {req.assigned_cleaner ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                            {req.assigned_cleaner.name?.charAt(0).toUpperCase() || "C"}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {req.assigned_cleaner.name}
                            </div>
                            {req.assigned_cleaner.phone && (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {req.assigned_cleaner.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Not Assigned
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(req.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        {req.status !== "resolved" && (
                          <button
                            onClick={() => handleOpenAssign(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                            title="Allocate task to toilet cleaner"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            {req.assigned_cleaner ? "Reassign" : "Assign"}
                          </button>
                        )}

                        {req.status === "in_progress" && (
                          <button
                            onClick={() => handleOpenResolve(req)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition"
                            title="Mark ticket resolved"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination bar */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 text-xs text-slate-500">
            <div>
              Showing {requests.length} of {pagination.total} tickets
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                Page {page} of {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AssignCleanerModal
        isOpen={assignModalOpen}
        onClose={() => {
          setAssignModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      <ResolveTaskModal
        isOpen={resolveModalOpen}
        onClose={() => {
          setResolveModalOpen(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
      />

      <PhotoProofModal
        isOpen={photoModalOpen}
        onClose={() => {
          setPhotoModalOpen(false);
          setSelectedRequest(null);
          setSelectedPhotos([]);
        }}
        images={selectedPhotos}
        title={`Citizen Photos • Ticket #${selectedRequest?.id || ""}`}
      />
    </div>
  );
}
