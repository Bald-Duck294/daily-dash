// /* eslint-disable react-hooks/exhaustive-deps */
// "use client";

// import { useState, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { Toaster } from "react-hot-toast";

// import Loader from "@/components/ui/Loader";
// import { useCompanyId } from "@/providers/CompanyProvider";

// import {
//   useCompanies,
//   useDeleteCompany,
//   useToggleCompanyStatus,
// } from "@/features/companies/queries/companies.queries";

// import CompaniesHeader from "@/features/companies/components/CompaniesHeader";
// import CompaniesToolbar from "@/features/companies/components/CompaniesToolbar";
// import CompaniesTable from "@/features/companies/components/CompaniesTable";
// import CompaniesCards from "@/features/companies/components/CompaniesCards";

// export default function CompaniesPage() {
//   const router = useRouter();
//   const { setCompanyId } = useCompanyId();

//   /* ---------------- QUERY ---------------- */
//   const { data, isLoading, isError } = useCompanies();
//   console.log(data, "Data");
//   const companies = data ?? [];

//   const deleteCompany = useDeleteCompany();
//   const toggleStatus = useToggleCompanyStatus();

//   /* ---------------- UI STATE ---------------- */
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);

//   const PAGE_SIZE = 10;

//   /* ---------------- FILTER ---------------- */
//   const filteredCompanies = useMemo(() => {
//     const q = search.toLowerCase();
//     return companies?.data?.filter(
//       (c) =>
//         c.name?.toLowerCase().includes(q) ||
//         c.contact_email?.toLowerCase().includes(q),
//     );
//   }, [companies, search]);

//   /* ---------------- PAGINATION ---------------- */
//   const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE);

//   const paginatedCompanies = useMemo(() => {
//     const start = (page - 1) * PAGE_SIZE;
//     const end = start + PAGE_SIZE;
//     return filteredCompanies.slice(start, end);
//   }, [filteredCompanies, page]);

//   /* ---------------- HANDLERS ---------------- */
//   const handleDelete = (id) => deleteCompany.mutate(id);

//   const handleStatusToggle = (id, status) =>
//     toggleStatus.mutate({ id, status: !status });

//   const handleViewCompany = (id) => {
//     console.log("ROW CLICKED, ID:", id);
//     setCompanyId(String(id));
//     router.push(`/clientDashboard/${id}`);
//   };

//   /* ---------------- STATES ---------------- */
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <Loader size="large" message="Loading organizations..." />
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-500">
//         Failed to load companies.
//       </div>
//     );
//   }

//   /* ---------------- RENDER ---------------- */
//   return (
//     <>
//       <Toaster position="top-center" />

//       <div className="min-h-screen p-4 sm:p-6 bg-[var(--background)]">
//         <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
//           <CompaniesHeader />

//           <CompaniesToolbar
//             search={search}
//             onSearch={setSearch}
//             companies={filteredCompanies}
//           />

//           {/* Desktop Table - Hidden on mobile */}
//           <div className="hidden lg:block">
//             <CompaniesTable
//               companies={paginatedCompanies}
//               onDelete={handleDelete}
//               onToggleStatus={handleStatusToggle}
//               onView={handleViewCompany}
//             />
//           </div>

//           {/* Mobile Cards - Hidden on desktop */}
//           <div className="lg:hidden">
//             <CompaniesCards
//               companies={paginatedCompanies}
//               onDelete={handleDelete}
//               onToggleStatus={handleStatusToggle}
//               onView={handleViewCompany}
//             />
//           </div>

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 pt-4 text-sm text-[var(--sidebar-muted)]">
//               <span className="text-center sm:text-left">
//                 Page {page} of {totalPages}
//               </span>

//               <div className="flex gap-2">
//                 <button
//                   disabled={page === 1}
//                   onClick={() => setPage((p) => p - 1)}
//                   className="
//                     rounded-md border border-[var(--sidebar-border)]
//                     px-3 py-2 sm:py-1
//                     disabled:opacity-50
//                     hover:bg-[var(--sidebar-hover)]
//                     active:bg-[var(--sidebar-hover)]
//                     transition-colors
//                     min-w-[80px] sm:min-w-0
//                   "
//                 >
//                   Previous
//                 </button>

//                 <button
//                   disabled={page === totalPages}
//                   onClick={() => setPage((p) => p + 1)}
//                   className="
//                     rounded-md border border-[var(--sidebar-border)]
//                     px-3 py-2 sm:py-1
//                     disabled:opacity-50
//                     hover:bg-[var(--sidebar-hover)]
//                     active:bg-[var(--sidebar-hover)]
//                     transition-colors
//                     min-w-[80px] sm:min-w-0
//                   "
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

/* eslint-disable react-hooks/exhaustive-deps */

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

import Loader from "@/components/ui/Loader";
import { useCompanyId } from "@/providers/CompanyProvider";

import {
  useCompanies,
  useDeleteCompany,
  useToggleCompanyStatus,
} from "@/features/companies/queries/companies.queries";

import CompaniesHeader from "@/features/companies/components/CompaniesHeader";
import CompaniesToolbar from "@/features/companies/components/CompaniesToolbar";
import CompaniesTable from "@/features/companies/components/CompaniesTable";
import CompaniesCards from "@/features/companies/components/CompaniesCards";

export default function CompaniesPage() {
  const router = useRouter();
  const { setCompanyId } = useCompanyId();

  /* ---------------- UI STATE ---------------- */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* ---------------- QUERY WITH PAGINATION ---------------- */
  const { data, isLoading, isError, isFetching } = useCompanies(
    page,
    PAGE_SIZE,
  );

  console.log(data, "Data");

  // Extract companies and pagination from response
  const companies = data?.data ?? [];
  const pagination = data?.pagination ?? null;

  const deleteCompany = useDeleteCompany();
  const toggleStatus = useToggleCompanyStatus();

  /* ---------------- CLIENT-SIDE SEARCH FILTER ---------------- */
  // Note: For large datasets, move search to backend
  const filteredCompanies = useMemo(() => {
    if (!search) return companies;
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q),
    );
  }, [companies, search]);

  console.log(filteredCompanies, "filtered companies");
  /* ---------------- HANDLERS ---------------- */
  const handleDelete = (id) => deleteCompany.mutate(id);

  const handleStatusToggle = (id, status) =>
    toggleStatus.mutate({ id, status: !status });

  const handleViewCompany = (id) => {
    console.log("ROW CLICKED, ID:", id);
    setCompanyId(String(id));
    router.push(`/clientDashboard/${id}`);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------------- LOADING & ERROR STATES ---------------- */
  if (isLoading) {
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

  /* ---------------- RENDER ---------------- */
  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen p-4 sm:p-6 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          <CompaniesHeader />

          <CompaniesToolbar
            search={search}
            onSearch={setSearch}
            companies={filteredCompanies}
          />

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
          <div className="hidden lg:block">
            <CompaniesTable
              companies={filteredCompanies}
              onDelete={handleDelete}
              onToggleStatus={handleStatusToggle}
              onView={handleViewCompany}
            />
          </div>

          {/* Mobile Cards - Hidden on desktop */}
          <div className="lg:hidden">
            <CompaniesCards
              companies={filteredCompanies}
              onDelete={handleDelete}
              onToggleStatus={handleStatusToggle}
              onView={handleViewCompany}
            />
          </div>

          {/* Enhanced Pagination Controls */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[var(--sidebar-border)]">
              {/* Page Info */}
              <div className="text-sm text-[var(--sidebar-muted)] text-center sm:text-left">
                <span className="font-medium text-[var(--sidebar-foreground)]">
                  Page {pagination.currentPage}
                </span>
                <span className="mx-1">of</span>
                <span className="font-medium text-[var(--sidebar-foreground)]">
                  {pagination.totalPages}
                </span>
                <span className="mx-2">•</span>
                <span>
                  {pagination.totalCount} total{" "}
                  {pagination.totalCount === 1 ? "company" : "companies"}
                </span>
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* First Page Button */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={!pagination.hasPrevPage || isFetching}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
                    />
                  </svg>
                </button>

                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!pagination.hasPrevPage || isFetching}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPageNumbers(
                    pagination.currentPage,
                    pagination.totalPages,
                  ).map((pageNum, idx) => {
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
                          ${
                            pageNum === pagination.currentPage
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
                  disabled={!pagination.hasNextPage || isFetching}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>

                {/* Last Page Button */}
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage || isFetching}
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 4.5l7.5 7.5-7.5 7.5m6-15l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Helper function to generate page numbers with ellipsis
function getPageNumbers(currentPage, totalPages) {
  const delta = 2; // Number of pages to show on each side of current page
  const range = [];
  const rangeWithDots = [];

  // Always show first page
  range.push(1);

  for (let i = currentPage - delta; i <= currentPage + delta; i++) {
    if (i > 1 && i < totalPages) {
      range.push(i);
    }
  }

  // Always show last page
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
