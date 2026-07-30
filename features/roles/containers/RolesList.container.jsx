"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { usePermissions } from "@/shared/hooks/usePermission";
import { MODULES } from "@/shared/constants/permissions";

import { useGetUsersByRole, useDeleteUser } from "@/features/users/users.queries";

import RoleHeader from "@/features/roles/components/RoleHeader";
import RoleTable from "@/features/roles/components/RoleTable";
import RoleEmptyState from "@/features/roles/components/RoleEmptyState";
import RoleLoading from "@/features/roles/components/RoleLoading";
import { useCompaniesDropdown } from "@/features/dropdownList/dropdownlist.query";

const ROLE_ID_MAP = {
  superadmin: 1,
  admin: 2,
  supervisor: 3,
  user: 4,
  cleaner: 5,
};

export default function RolesListContainer({ role }) {
  useRequirePermission(MODULES.USERS);

  const roleId = ROLE_ID_MAP[role];
  const { canAdd, canView, canUpdate, canDelete } = usePermissions();

  /* ===============================
     PAGINATION & SEARCH STATE
  ================================ */
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCompany, setSelectedCompany] = useState("");

  /* ===============================
     TANSTACK FETCH & MUTATIONS
  ================================ */
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompaniesDropdown();

  const {
    data: responseData,
    isLoading,
    isError,
    error,
    isFetching,
  } = useGetUsersByRole(roleId, selectedCompany || null, page, limit, debouncedSearch);

  const { mutateAsync: deleteUser } = useDeleteUser();

  const users = responseData?.data ?? [];
  const meta = responseData?.pagination ?? { totalPages: 1, currentPage: 1, totalCount: 0 };

  /* ===============================
     EFFECTS & HANDLERS
  ================================ */
  useEffect(() => {
    if (isError) {
      toast.error(error?.message || "Failed to fetch users");
    }
  }, [isError, error]);

  // Reset to page 1 if search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCompany, limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteUser(id);
        toast.success(`${name} deleted successfully`);

        if (users.length === 1 && page > 1) {
          setPage(page - 1);
        }
      } catch (err) {
        toast.error(err?.message || "Failed to delete user");
      }
    }
  };

  function getPageNumbers(currentPage, totalPages) {
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 pb-8 relative">
      {/* Background Refetch Top Loader */}
      {isFetching && !isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-blue-100 overflow-hidden">
          <div className="h-full bg-blue-600 animate-pulse w-full" />
        </div>
      )}

      {/* Modern Role Header */}
      <RoleHeader
        role={role}
        search={search}
        onSearch={setSearch}
        canAdd={canAdd(MODULES.USERS)}
        companies={companiesData}
        selectedCompany={selectedCompany}
        onCompanyChange={setSelectedCompany}
        isCompaniesLoading={isCompaniesLoading}
      />

      {/* Main Content Area */}
      {isLoading ? (
        <RoleLoading />
      ) : users.length === 0 ? (
        <RoleEmptyState role={role} canAdd={canAdd(MODULES.USERS)} />
      ) : (
        <>
          <RoleTable
            users={users}
            role={role}
            permissions={{
              canView: canView(MODULES.USERS),
              canEdit: canUpdate(MODULES.USERS),
              canDelete: canDelete(MODULES.USERS),
            }}
            onDelete={handleDelete}
            currentPage={page}
            pageSize={limit}
          />

          {/* Modern Pagination Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm gap-4">
            {/* Limit Dropdown & Status */}
            <div className="flex items-center gap-4 text-xs font-bold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <span>Show:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <span className="text-slate-400">|</span>
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{users.length}</strong> of{" "}
                <strong className="text-slate-900 dark:text-white">{meta.totalCount}</strong> users
              </span>
            </div>

            {/* Pagination Nav Controls */}
            {meta.totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  disabled={meta.currentPage === 1 || isFetching}
                  onClick={() => handlePageChange(meta.currentPage - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer"
                >
                  Previous
                </button>

                {getPageNumbers(meta.currentPage, meta.totalPages).map((pageNumber, idx) => (
                  <button
                    key={idx}
                    disabled={pageNumber === "..." || isFetching}
                    onClick={() => pageNumber !== "..." && handlePageChange(pageNumber)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
                      pageNumber === meta.currentPage
                        ? "bg-blue-600 text-white shadow-xs"
                        : pageNumber === "..."
                        ? "border-none cursor-default text-slate-400"
                        : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  disabled={meta.currentPage >= meta.totalPages || isFetching}
                  onClick={() => handlePageChange(meta.currentPage + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}