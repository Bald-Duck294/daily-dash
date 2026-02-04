/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  X,
  AlertTriangle,
  Building2,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import "../../../app/globals.css";

import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

export default function FacilityCompaniesPage() {
  useRequirePermission(MODULES.FACILITY_COMPANIES);

  const { canAdd, canUpdate, canDelete } = usePermissions();
  const canAddFacility = canAdd(MODULES.FACILITY_COMPANIES);
  const canEditFacility = canUpdate(MODULES.FACILITY_COMPANIES);
  const canDeleteFacility = canDelete(MODULES.FACILITY_COMPANIES);

  const router = useRouter();
  const { companyId } = useCompanyId();

  // State
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    company: null,
  });
  const [statusModal, setStatusModal] = useState({
    show: false,
    company: null,
  });

  // Fetch companies
  const fetchCompanies = async () => {
    if (!companyId) return;

    setIsLoading(true);
    // Include inactive to show all
    const result = await FacilityCompanyApi.getAll(companyId, true);

    if (result.success) {
      setCompanies(result.data);
      setFilteredCompanies(result.data);
    } else {
      toast.error(result.error || "Failed to load facility companies");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, [companyId]);

  // Filter and search
  useEffect(() => {
    let filtered = [...companies];

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((c) => c.status === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((c) => c.status === false);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.includes(query) ||
          c.contact_person_name?.toLowerCase().includes(query),
      );
    }

    setFilteredCompanies(filtered);
  }, [searchQuery, statusFilter, companies]);

  // Handle delete
  const handleDeleteClick = (company) => {
    setDeleteModal({ show: true, company });
  };

  const confirmDelete = async () => {
    if (!canDeleteFacility) {
      toast.error("You don't have permission to delete facility companies");
      return;
    }

    const { company } = deleteModal;
    if (!company) return;

    const result = await FacilityCompanyApi.delete(company.id);

    if (result.success) {
      toast.success("Facility company deleted successfully!");
      fetchCompanies();
      setDeleteModal({ show: false, company: null });
    } else {
      toast.error(result.error || "Failed to delete facility company");
    }
  };

  // Handle status toggle
  const handleStatusClick = (company) => {
    setStatusModal({ show: true, company });
  };

  // const confirmStatusToggle = async () => {
  //     const { company } = statusModal;
  //     if (!company) return;

  //     const result = await FacilityCompanyApi.toggleStatus(company.id);

  //     if (result.success) {
  //         toast.success(result.message || "Status updated successfully!");
  //         fetchCompanies();
  //         setStatusModal({ show: false, company: null });
  //     } else {
  //         toast.error(result.error || "Failed to update status");
  //     }
  // };

  // Format date

  const confirmStatusToggle = async () => {
    const { company } = statusModal;
    if (!company) return;

    const result = await FacilityCompanyApi.toggleStatus(company.id);

    if (result.success) {
      toast.success(result.message || "Status updated successfully!");

      // ✅ Update the state immediately without refetching
      setCompanies((prevCompanies) =>
        prevCompanies.map((c) =>
          c.id === company.id ? { ...c, status: !c.status } : c,
        ),
      );

      setStatusModal({ show: false, company: null });
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      <Toaster position="top-right" />

      <div
        className="
    min-h-screen
    bg-[var(--washroom-bg)]
    p-4 sm:p-6 md:p-8
  "
      >

        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div
            className="
    rounded-xl p-4 sm:p-6 mb-4 sm:mb-6
    bg-[var(--washroom-surface)]
    border border-[var(--washroom-border)]
    shadow-[var(--washroom-shadow)]
  "
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                {/* Icon */}
                <div
                  className="
          inline-flex items-center justify-center
          w-10 h-10 sm:w-11 sm:h-11
          rounded-lg
          bg-[var(--user-add-accent)]
          text-white
        "
                >
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>

                {/* Title */}
                <div>
                  <h1
                    className="
            text-xl sm:text-2xl font-bold
            text-[var(--washroom-title)]
          "
                  >
                    Facility Companies
                  </h1>
                  <p
                    className="
            text-xs sm:text-sm mt-0.5
            text-[var(--washroom-subtitle)]
          "
                  >
                    Manage facility management companies
                  </p>
                </div>
              </div>

              {/* CTA */}
              {canAddFacility && (
                <button
                  onClick={() =>
                    router.push(`/facility-company/add?companyId=${companyId}`)
                  }
                  className="
          inline-flex items-center gap-2
          px-5 py-2.5 text-sm font-bold uppercase
          rounded-lg cursor-pointer
          text-[var(--washroom-primary-text)]
          bg-[var(--washroom-primary)]
          hover:bg-[var(--washroom-primary-hover)]
          shadow-md hover:shadow-lg
          transition-all duration-200
        "
                >
                  <Plus className="w-4 h-4" />
                  Add Facility Company
                </button>
              )}
            </div>
          </div>


          {/* Search and Filters */}
          <div
            className="
    rounded-xl p-4 sm:p-6 mb-4 sm:mb-6
    bg-[var(--washroom-surface)]
    border border-[var(--washroom-border)]
    shadow-[var(--washroom-shadow)]
  "
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="
          absolute left-3 top-1/2 -translate-y-1/2
          w-4 h-4
          text-[var(--washroom-filter-text)]
        "
                />

                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="
          w-full pl-10 pr-4 py-2.5 text-sm rounded-lg
          bg-[var(--washroom-input-bg)]
          border border-[var(--washroom-border)]
          text-[var(--washroom-text)]
          placeholder:text-[var(--washroom-filter-text)]
          focus:outline-none
          focus:border-[var(--primary)]
          focus:ring-2 focus:ring-[color:var(--primary)/25]
        "
                />

                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="
            absolute right-3 top-1/2 -translate-y-1/2
            text-[var(--washroom-filter-clear)]
            hover:text-[var(--washroom-filter-clear-hover)]
          "
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filter toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`
          inline-flex items-center gap-2
          px-4 py-2.5 rounded-lg text-sm font-medium
          border transition-colors
          ${showFilters
                      ? `
                bg-[var(--washroom-filter-active-bg)]
                border-[var(--primary)]
                text-[var(--washroom-filter-active-text)]
              `
                      : `
                bg-[var(--washroom-surface)]
                border-[var(--washroom-border)]
                text-[var(--washroom-text)]
                hover:bg-[var(--washroom-filter-bg)]
              `
                    }
        `}
                >
                  <Filter className="w-4 h-4" />
                  Filters

                  {statusFilter !== "all" && (
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  )}
                </button>
              </div>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div
                className="
        mt-4 pt-4
        border-t border-[var(--washroom-border)]
      "
              >
                <div className="flex flex-wrap gap-2">
                  {/* ALL */}
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${statusFilter === "all"
                        ? "bg-[var(--primary)] text-white"
                        : `
                  bg-[var(--washroom-filter-bg)]
                  text-[var(--washroom-filter-text)]
                  hover:bg-[var(--washroom-table-row-hover)]
                `
                      }
          `}
                  >
                    All ({companies.length})
                  </button>

                  {/* ACTIVE */}
                  <button
                    onClick={() => setStatusFilter("active")}
                    className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${statusFilter === "active"
                        ? `
                  bg-[var(--washroom-status-active-bg)]
                  text-[var(--washroom-status-active-text)]
                `
                        : `
                  bg-[var(--washroom-filter-bg)]
                  text-[var(--washroom-filter-text)]
                  hover:bg-[var(--washroom-table-row-hover)]
                `
                      }
          `}
                  >
                    Active ({companies.filter((c) => c.status).length})
                  </button>

                  {/* INACTIVE */}
                  <button
                    onClick={() => setStatusFilter("inactive")}
                    className={`
            px-3 py-1.5 rounded-full text-sm font-medium transition-colors
            ${statusFilter === "inactive"
                        ? `
                  bg-[var(--washroom-status-inactive-bg)]
                  text-[var(--washroom-status-inactive-text)]
                `
                        : `
                  bg-[var(--washroom-filter-bg)]
                  text-[var(--washroom-filter-text)]
                  hover:bg-[var(--washroom-table-row-hover)]
                `
                      }
          `}
                  >
                    Inactive ({companies.filter((c) => !c.status).length})
                  </button>
                </div>
              </div>
            )}

            {/* Results count */}
            <div className="mt-3 text-sm text-[var(--washroom-filter-text)]">
              Showing {filteredCompanies.length} of {companies.length} facility companies
            </div>
          </div>



          {/* Table/List */}
          {isLoading ? (
            <div
              className="
    rounded-xl p-12 flex flex-col items-center justify-center
    bg-[var(--washroom-surface)]
    border border-[var(--washroom-border)]
    shadow-[var(--washroom-shadow)]
  "
            >
              <Loader2
                className="
      w-12 h-12 mb-4 animate-spin
      text-[var(--primary)]
    "
              />
              <p className="text-[var(--washroom-filter-text)]">
                Loading facility companies...
              </p>
            </div>

          ) : filteredCompanies.length === 0 ? (
            <div
              className="
    rounded-xl p-12 text-center
    bg-[var(--washroom-surface)]
    border border-[var(--washroom-border)]
    shadow-[var(--washroom-shadow)]
  "
            >
              <Building2
                className="
      w-16 h-16 mx-auto mb-4
      text-[var(--washroom-filter-text)]
      opacity-60
    "
              />

              <h3
                className="
      text-lg font-semibold mb-2
      text-[var(--washroom-title)]
    "
              >
                No facility companies found
              </h3>

              <p
                className="
      mb-4
      text-[var(--washroom-subtitle)]
    "
              >
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first facility company"}
              </p>

              {!searchQuery && canAddFacility && (
                <button
                  onClick={() =>
                    router.push(`facility-company/add?companyId=${companyId}`)
                  }
                  className="
        inline-flex items-center gap-2
        px-4 py-2 text-sm font-semibold
        rounded-lg cursor-pointer
        text-[var(--washroom-primary-text)]
        bg-[var(--washroom-primary)]
        hover:bg-[var(--washroom-primary-hover)]
        transition-colors
      "
                >
                  <Plus className="w-4 h-4" />
                  Add Facility Company
                </button>
              )}
            </div>

          ) : (
            <div
              className="
    rounded-xl overflow-hidden
    bg-[var(--washroom-surface)]
    border border-[var(--washroom-border)]
    shadow-[var(--washroom-shadow)]
  "
            >

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead
                    className="
          bg-[var(--washroom-table-header-bg)]
          border-b border-[var(--washroom-border)]
        "
                  >
                    <tr>
                      {["Name", "Contact", "Status", "Created At"].map((h) => (
                        <th
                          key={h}
                          className="
                px-6 py-3 text-left
                text-xs font-semibold uppercase tracking-wider
                text-[var(--washroom-filter-text)]
              "
                        >
                          {h}
                        </th>
                      ))}
                      <th
                        className="
              px-6 py-3 text-right
              text-xs font-semibold uppercase tracking-wider
              text-[var(--washroom-filter-text)]
            "
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--washroom-border)]">
                    {filteredCompanies.map((company) => (
                      <tr
                        key={company.id}
                        className="
        transition-colors
        hover:bg-[var(--washroom-table-row-hover)]
      "
                      >
                        {/* NAME */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="
              inline-flex items-center justify-center
              w-9 h-9 rounded-lg shadow-sm
              bg-[var(--user-add-accent)]
              text-white
            "
                            >
                              <Building2 className="w-5 h-5" />
                            </div>

                            <div>
                              <p className="font-medium text-[var(--washroom-title)]">
                                {company.name}
                              </p>
                              <p className="text-xs text-[var(--washroom-subtitle)]">
                                {company.contact_person_name}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CONTACT */}
                        <td className="px-6 py-4">
                          <div className="space-y-1 text-sm text-[var(--washroom-filter-text)]">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 opacity-60" />
                              {company.phone || "N/A"}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 opacity-60" />
                              {company.email || "N/A"}
                            </div>
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleStatusClick(company)}
                            disabled={!canEditFacility}
                            title={!canEditFacility ? "No permission to update status" : ""}
                            className={`
            inline-flex items-center gap-1.5 px-3 py-1.5
            rounded-full text-xs font-medium
            transition-colors
            ${!canEditFacility ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            ${company.status
                                ? `
                  bg-[var(--washroom-status-active-bg)]
                  text-[var(--washroom-status-active-text)]
                `
                                : `
                  bg-[var(--washroom-status-inactive-bg)]
                  text-[var(--washroom-status-inactive-text)]
                `
                              }
          `}
                          >
                            {company.status ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        {/* CREATED */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-[var(--washroom-filter-text)]">
                            <Calendar className="w-4 h-4 opacity-60" />
                            {formatDate(company.created_at)}
                          </div>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                router.push(`/facility-company/${company.id}?companyId=${companyId}`)
                              }
                              className="btn-icon btn-icon-view"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>

                            {canEditFacility && (
                              <button
                                onClick={() =>
                                  router.push(
                                    `/facility-company/${company.id}/edit?companyId=${companyId}`
                                  )
                                }
                                className="btn-icon btn-icon-edit"
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                            )}

                            {canDeleteFacility && (
                              <button
                                onClick={() => handleDeleteClick(company)}
                                className="btn-icon btn-icon-delete"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-[var(--washroom-border)]">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="
              w-9 h-9 rounded-lg shadow-sm
              flex items-center justify-center
              bg-[var(--user-add-accent)]
              text-white
            "
                        >
                          <Building2 className="w-5 h-5" />
                        </div>

                        <div>
                          <h3 className="font-medium text-[var(--washroom-title)]">
                            {company.name}
                          </h3>
                          <p className="text-xs text-[var(--washroom-subtitle)]">
                            {company.contact_person_name}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStatusClick(company)}
                        disabled={!canEditFacility}
                        className={`
            inline-flex items-center gap-1 px-2 py-1
            rounded-full text-xs font-medium
            ${!canEditFacility ? "opacity-60 cursor-not-allowed" : ""}
            ${company.status
                            ? `
                  bg-[var(--washroom-status-active-bg)]
                  text-[var(--washroom-status-active-text)]
                `
                            : `
                  bg-[var(--washroom-status-inactive-bg)]
                  text-[var(--washroom-status-inactive-text)]
                `
                          }
          `}
                      >
                        {company.status ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </>
                        )}
                      </button>
                    </div>

                    <div className="space-y-2 text-sm text-[var(--washroom-filter-text)] mb-3">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 opacity-60" />
                        {company.phone || "N/A"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 opacity-60" />
                        {company.email || "N/A"}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-60" />
                        {formatDate(company.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div
          className="
    fixed inset-0 z-50 p-4
    flex items-center justify-center
    bg-[rgba(0,0,0,0.5)]
    backdrop-blur-sm
  "
        >

          <div
            className="
    max-w-md w-full p-6 rounded-xl
    bg-[var(--washroom-surface)]
    border border-[var(--washroom-border)]
    shadow-[var(--washroom-shadow)]
  "
          >

            <div className="flex items-center gap-3 mb-4">
              <div
                className="
      p-3 rounded-full
      bg-[var(--washroom-status-inactive-bg)]
    "
              >
                <AlertTriangle
                  className="
        w-6 h-6
        text-[var(--washroom-status-inactive-text)]
      "
                />
              </div>

              <h3
                className="
      text-lg font-semibold
      text-[var(--washroom-title)]
    "
              >
                Delete Facility Company
              </h3>
            </div>

            <p
              className="
    mb-6
    text-[var(--washroom-subtitle)]
  "
            >
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[var(--washroom-title)]">
                {deleteModal.company?.name}
              </span>
              ? This action cannot be undone.
            </p>


            <div className="flex gap-3">
              {/* Cancel */}
              <button
                onClick={() => setDeleteModal({ show: false, company: null })}
                className="
      flex-1 px-4 py-2.5 rounded-lg font-medium
      bg-[var(--washroom-filter-bg)]
      text-[var(--washroom-text)]
      border border-[var(--washroom-border)]
      hover:bg-[var(--washroom-muted-bg)]
      transition-colors
    "
              >
                Cancel
              </button>

              {/* Delete */}
              <button
                onClick={confirmDelete}
                className="
      flex-1 px-4 py-2.5 rounded-lg font-medium
      bg-[var(--washroom-status-inactive-bg)]
      text-[var(--washroom-status-inactive-text)]
      hover:bg-[var(--washroom-delete-bg)]
      transition-colors
    "
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Status Toggle Confirmation Modal */}
      {statusModal.show && (
        <div
          className="
    fixed inset-0 z-50 p-4
    flex items-center justify-center
    bg-[rgba(0,0,0,0.5)]
    backdrop-blur-sm
  "
        >
          <div
            className="
      max-w-md w-full p-6 rounded-xl
      bg-[var(--washroom-surface)]
      border border-[var(--washroom-border)]
      shadow-[var(--washroom-shadow)]
    "
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`
          p-3 rounded-full
          ${statusModal.company?.status
                    ? "bg-[var(--washroom-status-inactive-bg)]"
                    : "bg-[var(--washroom-status-active-bg)]"
                  }
        `}
              >
                {statusModal.company?.status ? (
                  <XCircle
                    className="
              w-6 h-6
              text-[var(--washroom-status-inactive-text)]
            "
                  />
                ) : (
                  <CheckCircle
                    className="
              w-6 h-6
              text-[var(--washroom-status-active-text)]
            "
                  />
                )}
              </div>

              <h3
                className="
          text-lg font-semibold
          text-[var(--washroom-title)]
        "
              >
                {statusModal.company?.status ? "Deactivate" : "Activate"} Company
              </h3>
            </div>

            {/* Body */}
            <p
              className="
        mb-6
        text-[var(--washroom-subtitle)]
      "
            >
              Are you sure you want to{" "}
              {statusModal.company?.status ? "deactivate" : "activate"}{" "}
              <span className="font-semibold text-[var(--washroom-title)]">
                {statusModal.company?.name}
              </span>
              ?
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              {/* Cancel */}
              <button
                onClick={() => setStatusModal({ show: false, company: null })}
                className="
          flex-1 px-4 py-2.5 rounded-lg font-medium
          bg-[var(--washroom-filter-bg)]
          text-[var(--washroom-text)]
          border border-[var(--washroom-border)]
          hover:bg-[var(--washroom-muted-bg)]
          transition-colors
        "
              >
                Cancel
              </button>

              {/* Confirm */}
              <button
                onClick={confirmStatusToggle}
                className={`
          flex-1 px-4 py-2.5 rounded-lg font-medium
          transition-colors
          ${statusModal.company?.status
                    ? `
                bg-[var(--washroom-status-inactive-bg)]
                text-[var(--washroom-status-inactive-text)]
                hover:bg-[var(--washroom-delete-bg)]
              `
                    : `
                bg-[var(--washroom-status-active-bg)]
                text-[var(--washroom-status-active-text)]
              `
                  }
        `}
              >
                {statusModal.company?.status ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        </div>

      )}
    </>
  );
}
