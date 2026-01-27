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

  /* ---------------- QUERY ---------------- */
  const { data, isLoading, isError } = useCompanies();
  const companies = data ?? [];

  const deleteCompany = useDeleteCompany();
  const toggleStatus = useToggleCompanyStatus();

  /* ---------------- UI STATE ---------------- */
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 10;

  /* ---------------- FILTER ---------------- */
  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase();
    return companies.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.contact_email?.toLowerCase().includes(q)
    );
  }, [companies, search]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredCompanies.length / PAGE_SIZE);

  const paginatedCompanies = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredCompanies.slice(start, end);
  }, [filteredCompanies, page]);

  /* ---------------- HANDLERS ---------------- */
  const handleDelete = (id) => deleteCompany.mutate(id);

  const handleStatusToggle = (id, status) =>
    toggleStatus.mutate({ id, status: !status });

  const handleViewCompany = (id) => {
    setCompanyId(String(id));
    router.push(`/clientDashboard/${id}`);
  };

  /* ---------------- STATES ---------------- */
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
        <div className="max-w-7xl mx-auto space-y-6">
          <CompaniesHeader />

          <CompaniesToolbar
            search={search}
            onSearch={setSearch}
            companies={filteredCompanies}
          />

          {/* Desktop */}
          <div className="hidden md:block">
            <CompaniesTable
              companies={paginatedCompanies}
              onDelete={handleDelete}
              onToggleStatus={handleStatusToggle}
              onView={handleViewCompany}
            />
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <CompaniesCards
              companies={paginatedCompanies}
              onDelete={handleDelete}
              onToggleStatus={handleStatusToggle}
              onView={handleViewCompany}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 text-sm text-[var(--sidebar-muted)]">
              <span>
                Page {page} of {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="
                    rounded-md border border-[var(--sidebar-border)]
                    px-3 py-1
                    disabled:opacity-50
                    hover:bg-[var(--sidebar-hover)]
                  "
                >
                  Previous
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="
                    rounded-md border border-[var(--sidebar-border)]
                    px-3 py-1
                    disabled:opacity-50
                    hover:bg-[var(--sidebar-hover)]
                  "
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
