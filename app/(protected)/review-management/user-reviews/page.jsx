"use client";

import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Trash2,
  AlertCircle,
  Star,
  MapPin,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  User,
} from "lucide-react";
import ReviewManagementFilters from "@/features/reviewManagement/components/ReviewManagementFilters";
import DeleteWarningModal from "@/features/reviewManagement/components/DeleteWarningModal";
import {
  useGetUserReviewsForManagement,
  useDeleteUserReviews,
} from "@/features/reviewManagement/reviewManagement.queries";

export default function UserReviewsManagementPage() {
  const { user } = useSelector((state) => state.auth);
  const isSuperAdmin = user?.role_id === 1;

  // Active query filters
  const [appliedFilters, setAppliedFilters] = useState({
    company_id: "all",
    start_date: "",
    end_date: "",
    search: "",
    page: 1,
    limit: 15,
  });

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);

  // TanStack Query
  const {
    data: queryResult,
    isLoading,
    isFetching,
  } = useGetUserReviewsForManagement(appliedFilters, isSuperAdmin);

  const reviews = useMemo(() => queryResult?.data || [], [queryResult]);
  const pagination = queryResult?.pagination || {
    page: 1,
    totalPages: 1,
    total: 0,
  };

  // Mutation
  const { mutateAsync: deleteUserReviews, isPending: isDeleting } =
    useDeleteUserReviews();

  // Handlers
  const handleApplyFilters = (newFilters) => {
    setSelectedIds([]);
    setAppliedFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
  };

  const handleResetFilters = () => {
    setSelectedIds([]);
    setAppliedFilters({
      company_id: "all",
      start_date: "",
      end_date: "",
      search: "",
      page: 1,
      limit: 15,
    });
  };

  const handlePageChange = (newPage) => {
    setSelectedIds([]);
    setAppliedFilters((prev) => ({ ...prev, page: newPage }));
  };

  // Multi-select helpers
  const allCurrentPageSelected =
    reviews.length > 0 &&
    reviews.every((r) => selectedIds.includes(String(r.id)));

  const handleToggleSelectAll = () => {
    if (allCurrentPageSelected) {
      const currentIds = reviews.map((r) => String(r.id));
      setSelectedIds((prev) => prev.filter((id) => !currentIds.includes(id)));
    } else {
      const currentIds = reviews.map((r) => String(r.id));
      setSelectedIds((prev) => Array.from(new Set([...prev, ...currentIds])));
    }
  };

  const handleToggleRow = (idStr) => {
    setSelectedIds((prev) =>
      prev.includes(idStr)
        ? prev.filter((item) => item !== idStr)
        : [...prev, idStr]
    );
  };

  // Prompts
  const handlePromptSingleDelete = (idStr) => {
    setItemsToDelete([idStr]);
    setDeleteModalOpen(true);
  };

  const handlePromptBulkDelete = () => {
    if (selectedIds.length === 0) return;
    setItemsToDelete(selectedIds);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    if (itemsToDelete.length === 0) return;
    try {
      await deleteUserReviews(itemsToDelete);
      setSelectedIds((prev) =>
        prev.filter((id) => !itemsToDelete.includes(id))
      );
      setDeleteModalOpen(false);
      setItemsToDelete([]);
    } catch (e) {
      // handled by mutation onError
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Only Superadmin has authorization to access the Review Management
          module and permanently purge review data.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            User Reviews Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Permanently delete public customer reviews and QR feedback entries.
            Use with caution.
          </p>
        </div>
      </div>

      {/* Filter Component */}
      <ReviewManagementFilters
        filters={appliedFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        showCleanerFilter={false}
        isLoading={isLoading || isFetching}
      />

      {/* Bulk Action Sticky Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl shadow-sm animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-red-600 animate-pulse" />
            <span className="text-xs font-bold text-red-800 dark:text-red-300">
              {selectedIds.length} user review
              {selectedIds.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
            >
              Clear Selection
            </button>
            <button
              onClick={handlePromptBulkDelete}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={handleToggleSelectAll}
                    disabled={reviews.length === 0}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-4 px-3 w-16">ID</th>
                <th className="py-4 px-3">Rating</th>
                <th className="py-4 px-3">Feedback / Description</th>
                <th className="py-4 px-3">Washroom / Location</th>
                <th className="py-4 px-3">Submitter</th>
                <th className="py-4 px-3">Organization</th>
                <th className="py-4 px-3 text-center">Photos</th>
                <th className="py-4 px-3">Submitted At</th>
                <th className="py-4 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading user reviews...</span>
                    </div>
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <span className="font-medium">No user reviews found</span>
                      <span className="text-[11px] text-slate-400 max-w-sm">
                        No user feedback matches the selected organization or
                        date criteria.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((r) => {
                  const idStr = String(r.id);
                  const isChecked = selectedIds.includes(idStr);
                  const ratingNum = Number(r.rating || 0);
                  const imagesCount = r.images?.length || 0;

                  return (
                    <tr
                      key={idStr}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked
                          ? "bg-blue-50/40 dark:bg-blue-950/20"
                          : ""
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleRow(idStr)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-slate-600 dark:text-slate-400">
                        #{r.id}
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              ratingNum >= 4
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : ratingNum >= 3
                                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                                : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                            {ratingNum.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-xs">
                        <p className="text-slate-800 dark:text-slate-200 line-clamp-2">
                          {r.description || (
                            <span className="italic text-slate-400">
                              No comment provided
                            </span>
                          )}
                        </p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {r.locations?.display_name ||
                              r.locations?.name ||
                              `Location #${r.location_id || "-"}`}
                          </span>
                        </div>
                        {r.locations?.city && (
                          <div className="text-[10px] text-slate-400 pl-4">
                            {r.locations.city}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {r.name ? (
                          <div className="font-bold text-slate-900 dark:text-white">
                            {r.name}
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium">QR Visitor</span>
                        )}
                        {r.phone && (
                          <div className="text-[11px] text-slate-400">
                            {r.phone}
                          </div>
                        )}
                        {r.token_number && (
                          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">
                            Token: #{r.token_number}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {r.companies?.name || `Company #${r.company_id || "-"}`}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          <ImageIcon className="w-3 h-3 text-slate-400" />
                          {imagesCount}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 text-[11px]">
                        <div>
                          {r.created_at
                            ? new Date(r.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleTimeString(
                                "en-IN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
                            : ""}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handlePromptSingleDelete(idStr)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Delete Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing page{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {pagination.page}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {pagination.totalPages}
              </span>{" "}
              ({pagination.total} total records)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Warning Confirmation Modal */}
      <DeleteWarningModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        selectedCount={itemsToDelete.length}
        itemType="User Review"
        isLoading={isDeleting}
      />
    </div>
  );
}
