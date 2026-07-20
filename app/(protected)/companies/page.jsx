/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

import Loader from "@/components/ui/Loader";
import { useCompanyId } from "@/providers/CompanyProvider";

import {
  useCompanies,
  useDeleteCompany,
  useToggleCompanyStatus,
  useResetCompanyWorkspace,
} from "@/features/companies/queries/companies.queries";

import CompaniesHeader from "@/features/companies/components/CompaniesHeader";
import CompaniesToolbar from "@/features/companies/components/CompaniesToolbar";
import CompaniesTable from "@/features/companies/components/CompaniesTable";
import CompaniesCards from "@/features/companies/components/CompaniesCards";

export default function CompaniesPage() {
  const router = useRouter();
  const { setCompanyId } = useCompanyId();
  const queryClient = useQueryClient();

  /* ---------------- UI STATE ---------------- */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [companyToReset, setCompanyToReset] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const PAGE_SIZE = 6;

  // Debounce search input (400ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  /* ---------------- QUERIES ---------------- */
  const {
    data,
    isLoading: isCompaniesLoading,
    isError,
    isFetching,
  } = useCompanies(page, PAGE_SIZE, debouncedSearch, sortField, sortOrder);

  // Extract from unified response (totalCount now comes from getAllCompanies)
  const companies = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE) || 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const deleteCompany = useDeleteCompany();
  const toggleStatus = useToggleCompanyStatus();
  const resetWorkspace = useResetCompanyWorkspace();

  /* ---------------- HANDLERS: DELETE ---------------- */
  const handleDelete = (id) => setCompanyToDelete(id);

  const confirmDelete = async () => {
    if (!companyToDelete) return;
    setCompanyToDelete(null);
    setIsDeleting(true);
    try {
      await deleteCompany.mutateAsync(companyToDelete);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["companies"] }),
        queryClient.invalidateQueries({ queryKey: ["companies", "count"] }),
      ]);
      toast.success("Your company has been deleted.");
    } catch (error) {
      const msg = error?.message || error?.response?.data?.message;
      toast.error(msg && msg.length < 100 ? msg : "Something went wrong, please try again later.");
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------------- HANDLERS: RESET WORKSPACE ---------------- */
  const handleReset = (id) => setCompanyToReset(id);

  const confirmReset = async () => {
    if (!companyToReset) return;
    const targetId = companyToReset;
    setCompanyToReset(null);
    setIsResetting(true);
    try {
      await resetWorkspace.mutateAsync(targetId);
      await queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Workspace reset successfully.");
    } catch (error) {
      const status = error?.status;
      if (status === 400) {
        toast.error("Invalid company selected.");
      } else if (status === 403) {
        toast.error("You are not authorized to perform this action.");
      } else if (status === 404) {
        toast.error("Company not found.");
      } else {
        const msg = error?.message;
        toast.error(msg && msg.length < 120 ? msg : "Workspace reset failed. Please try again.");
      }
    } finally {
      setIsResetting(false);
    }
  };

  /* ---------------- HANDLERS: OTHER ---------------- */
  const handleStatusToggle = (id, status) =>
    toggleStatus.mutate({ id, status: !status });

  const handleViewCompany = (id) => {
    setCompanyId(String(id));
    router.push(`/clientDashboard/${id}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (field, order) => {
    setSortField(field || "created_at");
    setSortOrder(order || "desc");
    setPage(1);
  };

  /* ---------------- LOADING & ERROR STATES ---------------- */
  if (isCompaniesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" message="Loading organizations..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Failed to load companies.
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" message="Deleting organization..." />
      </div>
    );
  }

  if (isResetting) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" message="Resetting workspace..." />
      </div>
    );
  }

  /* ---------------- RENDER ---------------- */
  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen sm:p-6 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:mt-[-35px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CompaniesHeader />

            <CompaniesToolbar
              search={search}
              onSearch={setSearch}
              companies={companies}
            />
          </div>

          {/* Sort Order Toggle */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--sidebar-muted)]">Sort:</span>
            <button
              onClick={() => handleSortChange("created_at", "desc")}
              className={`px-3 py-1 rounded-md border transition-colors text-xs font-medium ${sortField === "created_at" && sortOrder === "desc"
                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border-[var(--sidebar-border)]"
                : "bg-[var(--card)] text-[var(--sidebar-muted)] border-[var(--sidebar-border)] hover:bg-[var(--sidebar-hover)]"
                }`}
            >
              Newest First
            </button>
            <button
              onClick={() => handleSortChange("created_at", "asc")}
              className={`px-3 py-1 rounded-md border transition-colors text-xs font-medium ${sortField === "created_at" && sortOrder === "asc"
                ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border-[var(--sidebar-border)]"
                : "bg-[var(--card)] text-[var(--sidebar-muted)] border-[var(--sidebar-border)] hover:bg-[var(--sidebar-hover)]"
                }`}
            >
              Oldest First
            </button>
          </div>

          {/* Loading Overlay for Page Changes */}
          {isFetching && (
            <div className="flex items-center justify-center py-2">
              <div className="flex items-center gap-2 text-sm text-[var(--sidebar-muted)]">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading...</span>
              </div>
            </div>
          )}

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden lg:block md:mt-[-20px]">
            <CompaniesTable
              companies={companies}
              onDelete={handleDelete}
              onToggleStatus={handleStatusToggle}
              onView={handleViewCompany}
              onReset={handleReset}
              sortField={sortField}
              sortOrder={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Mobile Cards - Hidden on desktop */}
          <div className="lg:hidden">
            <CompaniesCards
              companies={companies}
              onDelete={handleDelete}
              onToggleStatus={handleStatusToggle}
              onView={handleViewCompany}
              onReset={handleReset}
            />
          </div>

          {/* Enhanced Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--sidebar-border)]">
              {/* Page Info */}
              <div className="text-sm text-[var(--sidebar-muted)] text-center sm:text-left">
                <span className="font-medium text-[var(--sidebar-foreground)]">
                  Page {page}
                </span>
                <span className="mx-1">of</span>
                <span className="font-medium text-[var(--sidebar-foreground)]">
                  {totalPages}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {totalCount} total{" "}
                  {totalCount === 1 ? "company" : "companies"}
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* First Page Button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!hasPrevPage || isFetching}
                  className="
                    hidden sm:flex items-center justify-center
                    w-9 h-9 rounded-md
                    border border-[var(--sidebar-border)]
                    bg-[var(--card)]
                    text-[var(--sidebar-foreground)]
                    hover:bg-[var(--sidebar-hover)]
                    active:bg-[var(--sidebar-accent)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                  title="First page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
                  </svg>
                </button>

                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!hasPrevPage || isFetching}
                  className="
                    flex items-center justify-center gap-2
                    px-4 py-2 rounded-md
                    border border-[var(--sidebar-border)]
                    bg-[var(--card)]
                    text-[var(--sidebar-foreground)]
                    hover:bg-[var(--sidebar-hover)]
                    active:bg-[var(--sidebar-accent)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                    font-medium text-sm
                  "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers(page, totalPages).map((pageNum, idx) => {
                    if (pageNum === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-9 h-9 flex items-center justify-center text-[var(--sidebar-muted)]"
                        >
                          ...
                        </span>
                      );
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={isFetching}
                        className={`
                          w-9 h-9 rounded-md font-medium text-sm
                          transition-all duration-200
                          ${pageNum === page
                            ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] border-2 border-[var(--sidebar-border)] shadow-sm"
                            : "bg-[var(--card)] text-[var(--sidebar-foreground)] border border-[var(--sidebar-border)] hover:bg-[var(--sidebar-hover)]"
                          }
                          disabled:opacity-40 disabled:cursor-not-allowed
                        `}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!hasNextPage || isFetching}
                  className="
                    flex items-center justify-center gap-2
                    px-4 py-2 rounded-md
                    border border-[var(--sidebar-border)]
                    bg-[var(--card)]
                    text-[var(--sidebar-foreground)]
                    hover:bg-[var(--sidebar-hover)]
                    active:bg-[var(--sidebar-accent)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                    font-medium text-sm
                  "
                >
                  <span className="hidden sm:inline">Next</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>

                {/* Last Page Button */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={!hasNextPage || isFetching}
                  className="
                    hidden sm:flex items-center justify-center
                    w-9 h-9 rounded-md
                    border border-[var(--sidebar-border)]
                    bg-[var(--card)]
                    text-[var(--sidebar-foreground)]
                    hover:bg-[var(--sidebar-hover)]
                    active:bg-[var(--sidebar-accent)]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                  "
                  title="Last page"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== DELETE CONFIRMATION DIALOG ========== */}
      {companyToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setCompanyToDelete(null)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-600 dark:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <div className="mt-0.5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                  Delete Company
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">
                Are you sure you want to permanently delete this company? This will remove all associated data from the system.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-400 font-semibold text-sm mb-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  All of the following will be permanently lost:
                </div>
                <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300 space-y-1.5 marker:text-red-400">
                  <li>All users and admin accounts</li>
                  <li>Locations, assignments &amp; schedules</li>
                  <li>Reviews, scores &amp; activity logs</li>
                  <li>All sessions and authentication data</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setCompanyToDelete(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                Yes, Delete Company
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== RESET WORKSPACE CONFIRMATION DIALOG ========== */}
      {companyToReset && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300"
          onClick={() => setCompanyToReset(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-amber-600 dark:text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div className="mt-0.5">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
                  Reset Workspace
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This will permanently remove the deployed workspace for this company.
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Will be removed */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-400 font-semibold text-sm mb-2.5">
                  The following data will be removed:
                </p>
                <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300 space-y-1 marker:text-red-400">
                  <li>Hierarchy</li>
                  <li>Washrooms</li>
                  <li>Cleaner Users</li>
                  <li>Supervisors</li>
                  <li>Cleaner Assignments</li>
                  <li>Cleaner Activity</li>
                  <li>Cleaner Reviews</li>
                  <li>User Reviews</li>
                  <li>Hygiene Scores</li>
                  <li>Location Types</li>
                </ul>
              </div>

              {/* Will NOT be removed */}
              {/* <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 rounded-lg p-4">
                <p className="text-emerald-800 dark:text-emerald-400 font-semibold text-sm mb-2.5">
                  The following will NOT be removed:
                </p>
                <ul className="list-disc pl-5 text-sm text-emerald-700 dark:text-emerald-300 space-y-1 marker:text-emerald-400">
                  <li>Company</li>
                  <li>Company Profile</li>
                  <li>Administrator</li>
                  <li>Roles</li>
                  <li>Permissions</li>
                  <li>Configurations</li>
                  <li>Templates</li>
                  <li>Subscription</li>
                  <li>Company Limits</li>
                </ul>
              </div> */}

              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                This action cannot be undone.
              </p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
              <button
                onClick={() => setCompanyToReset(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm transition-colors"
              >
                Reset Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper function to generate page numbers with ellipsis
function getPageNumbers(currentPage, totalPages) {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  range.push(1);

  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i > 1 && i < totalPages) {
      range.push(i);
    }
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  let prev = 0;
  for (const i of range) {
    if (prev + 1 !== i) {
      rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    prev = i;
  }

  return rangeWithDots;
}
