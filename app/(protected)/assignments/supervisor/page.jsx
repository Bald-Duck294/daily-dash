"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Phone,
  Eye,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  UserPlus,
  Search,
  MapPin,
  Mail,
  Calendar,
  MoreHorizontal,
  Circle,
} from "lucide-react";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function SupervisorAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    assignment: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    assignment: null,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const locationId = searchParams.get("locationId");
  const locationName = searchParams.get("locationName");

  useEffect(() => {
    if (!locationId || !companyId) {
      setLoading(false);
      return;
    }
    fetchAssignments();
  }, [locationId, companyId]);

  useEffect(() => {
    let filtered = [...assignments];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const user = a.cleaner_user || {};
        return (
          user.name?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone?.toLowerCase().includes(query)
        );
      });
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (a) => a.status?.toLowerCase() === statusFilter.toLowerCase(),
      );
    }
    setFilteredAssignments(filtered);
  }, [searchQuery, statusFilter, assignments]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await AssignmentsApi.getAssignmentsByLocation(
        locationId,
        companyId,
        3,
      );
      if (response.success) {
        setAssignments(response.data);
      } else {
        toast.error(response.error || "Failed to fetch assignments");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id) =>
    router.push(
      `/assignments/supervisor/${id}?companyId=${companyId}&locationId=${locationId}`,
    );
  const handleAddSupervisor = () =>
    router.push(
      `/assignments/supervisor/add?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`,
    );

  const confirmStatusToggle = async () => {
    if (!statusModal.assignment) return;
    const { id, status } = statusModal.assignment;
    setTogglingStatus(id);
    try {
      const newStatus =
        status?.toLowerCase() === "assigned" ? "unassigned" : "assigned";
      const response = await AssignmentsApi.updateAssignment(id, {
        status: newStatus,
      });
      if (response.success) {
        toast.success(`Status updated to ${newStatus}`);
        setAssignments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)),
        );
        setStatusModal({ open: false, assignment: null });
      }
    } finally {
      setTogglingStatus(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.assignment) return;
    setDeleting(true);
    try {
      const response = await AssignmentsApi.deleteAssignment(
        deleteModal.assignment.id,
      );
      if (response.success) {
        toast.success("Supervisor removed");
        setAssignments((prev) =>
          prev.filter((a) => a.id !== deleteModal.assignment.id),
        );
        setDeleteModal({ open: false, assignment: null });
      }
    } finally {
      setDeleting(false);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const close = () => setActiveDropdown(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  if (loading)
    return (
      <div
        className="flex flex-col justify-center items-center h-screen"
        style={{
          background: "var(--supervisor-bg)",
        }}
      >
        <Loader
          size="large"
          color="var(--supervisor-primary-bg)"
        />

        <p
          className="mt-4 text-sm animate-pulse"
          style={{ color: "var(--supervisor-muted)" }}
        >
          Loading supervisors...
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen pb-20"
      style={{
        background: "var(--supervisor-bg)",
        color: "var(--supervisor-text)",
      }}
    >

      <Toaster position="bottom-center" />

      {/* Modern Header */}
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: "var(--supervisor-header-bg)",
          borderBottom: "1px solid var(--supervisor-header-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full transition-colors"
              style={{ color: "var(--supervisor-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--supervisor-dropdown-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1
                className="text-lg font-semibold"
                style={{ color: "var(--supervisor-title)" }}
              >
                Supervisors
              </h1>

              <div
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: "var(--supervisor-primary-bg)" }}
              >
                <MapPin size={12} />
                {locationName || "All Locations"}
              </div>
            </div>
          </div>

          <button
            onClick={handleAddSupervisor}
            className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all active:scale-95"
            style={{
              background: "var(--supervisor-primary-bg)",
              color: "var(--supervisor-primary-text)",
              boxShadow: "var(--supervisor-shadow)",
            }}
            onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "var(--supervisor-primary-bg-hover)")
            }
            onMouseLeave={(e) =>
            (e.currentTarget.style.background =
              "var(--supervisor-primary-bg)")
            }
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>
      </header>


      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Minimal Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "var(--supervisor-muted)" }}
            />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
              style={{
                background: "var(--supervisor-input-bg)",
                border: "1px solid var(--supervisor-input-border)",
                color: "var(--supervisor-text)",
              }}
              onFocus={(e) =>
              (e.currentTarget.style.borderColor =
                "var(--supervisor-input-focus)")
              }
              onBlur={(e) =>
              (e.currentTarget.style.borderColor =
                "var(--supervisor-input-border)")
              }
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-sm cursor-pointer outline-none transition-all"
            style={{
              background: "var(--supervisor-input-bg)",
              border: "1px solid var(--supervisor-input-border)",
              color: "var(--supervisor-muted)",
            }}
            onFocus={(e) =>
            (e.currentTarget.style.borderColor =
              "var(--supervisor-input-focus)")
            }
            onBlur={(e) =>
            (e.currentTarget.style.borderColor =
              "var(--supervisor-input-border)")
            }
          >
            <option value="all">All Status</option>
            <option value="assigned">Active</option>
            <option value="unassigned">Inactive</option>
          </select>
        </div>


        {/* Empty State */}
        {filteredAssignments.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed"
            style={{
              background: "var(--supervisor-surface)",
              borderColor: "var(--supervisor-border)",
            }}
          >
            <Users
              size={48}
              className="mb-4"
              style={{ color: "var(--supervisor-muted)" }}
            />

            <p
              className="text-sm"
              style={{ color: "var(--supervisor-muted)" }}
            >
              No supervisors found matching your criteria.
            </p>
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.map((item) => (
              <div
                key={item.id}
                className="group rounded-2xl p-5 transition-all duration-300 relative"
                style={{
                  background: "var(--supervisor-surface)",
                  border: "1px solid var(--supervisor-border)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow = "var(--supervisor-shadow)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow = "none")
                }
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: "var(--supervisor-accent-bg)",
                        color: "var(--supervisor-accent-text)",
                      }}
                    >
                      {item.cleaner_user?.name?.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3
                        className="font-semibold text-sm truncate max-w-[140px]"
                        style={{ color: "var(--supervisor-title)" }}
                      >
                        {item.cleaner_user?.name}
                      </h3>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Circle
                          size={8}
                          fill={
                            item.status === "assigned"
                              ? "var(--supervisor-status-active-dot)"
                              : "var(--supervisor-status-inactive-dot)"
                          }
                        />
                        <span
                          className="text-[10px] uppercase tracking-wider font-bold"
                          style={{ color: "var(--supervisor-muted)" }}
                        >
                          {item.status === "assigned" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === item.id ? null : item.id,
                        );
                      }}
                      className="p-1 transition-colors"
                      style={{ color: "var(--supervisor-muted)" }}
                    >
                      <MoreHorizontal size={20} />
                    </button>

                    {activeDropdown === item.id && (
                      <div
                        className="absolute right-0 top-7 w-36 rounded-lg py-1 z-20"
                        style={{
                          background: "var(--supervisor-dropdown-bg)",
                          border: "1px solid var(--supervisor-border)",
                          boxShadow: "var(--supervisor-shadow)",
                        }}
                      >
                        <button
                          onClick={() => handleView(item.cleaner_user_id)}
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2"
                          style={{ color: "var(--supervisor-text)" }}
                        >
                          <Eye size={14} /> Profile
                        </button>

                        <button
                          onClick={() =>
                            setStatusModal({ open: true, assignment: item })
                          }
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2"
                          style={{ color: "var(--supervisor-text)" }}
                        >
                          <Users size={14} /> Change Status
                        </button>

                        <button
                          onClick={() =>
                            setDeleteModal({ open: true, assignment: item })
                          }
                          className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 border-t"
                          style={{
                            color: "var(--supervisor-danger)",
                            borderColor: "var(--supervisor-border)",
                          }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2.5 mb-6">
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--supervisor-muted)" }}
                  >
                    <Mail size={14} />
                    <span className="truncate">
                      {item.cleaner_user?.email || "—"}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--supervisor-muted)" }}
                  >
                    <Phone size={14} />
                    <span>{item.cleaner_user?.phone || "—"}</span>
                  </div>

                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--supervisor-muted)" }}
                  >
                    <Calendar size={14} />
                    <span>
                      {new Date(item.assigned_on).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleView(item.cleaner_user_id)}
                  className="w-full py-2.5 rounded-lg text-xs font-semibold transition-all active:scale-[0.98]"
                  style={{
                    background: "var(--supervisor-primary-bg)",
                    color: "var(--supervisor-primary-text)",
                    boxShadow: "var(--supervisor-shadow)",
                  }}
                  onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--supervisor-primary-bg-hover)")
                  }
                  onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    "var(--supervisor-primary-bg)")
                  }
                >
                  View Activity
                </button>

              </div>
            ))}
          </div>

        )}
      </main>

      {/* Minimal Modals */}
      {(deleteModal.open || statusModal.open) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(2, 6, 23, 0.4)",
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="rounded-3xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: "var(--supervisor-surface)",
              border: "1px solid var(--supervisor-border)",
              boxShadow: "var(--supervisor-shadow)",
            }}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{
                background: deleteModal.open
                  ? "var(--supervisor-danger-muted)"
                  : "var(--supervisor-accent-bg)",
                color: deleteModal.open
                  ? "var(--supervisor-danger)"
                  : "var(--supervisor-primary-bg)",
              }}
            >
              {deleteModal.open ? (
                <AlertTriangle size={28} />
              ) : (
                <Users size={28} />
              )}
            </div>

            {/* Title */}
            <h3
              className="text-lg font-bold text-center mb-2"
              style={{ color: "var(--supervisor-title)" }}
            >
              {deleteModal.open ? "Remove Supervisor" : "Update Status"}
            </h3>

            {/* Description */}
            <p
              className="text-center text-sm mb-8 px-2"
              style={{ color: "var(--supervisor-muted)" }}
            >
              {deleteModal.open
                ? `Are you sure you want to remove ${deleteModal.assignment?.cleaner_user?.name}?`
                : `Toggle status for ${statusModal.assignment?.cleaner_user?.name}?`}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal({ open: false, assignment: null });
                  setStatusModal({ open: false, assignment: null });
                }}
                className="flex-1 py-3 text-sm font-semibold transition-colors"
                style={{ color: "var(--supervisor-muted)" }}
              >
                Go Back
              </button>

              <button
                onClick={deleteModal.open ? confirmDelete : confirmStatusToggle}
                disabled={deleting || togglingStatus}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-transform active:scale-95"
                style={{
                  background: deleteModal.open
                    ? "var(--supervisor-danger-bg)"
                    : "var(--supervisor-primary-bg)",
                  color: deleteModal.open
                    ? "var(--supervisor-danger-text)"
                    : "var(--supervisor-primary-text)",
                  boxShadow: "var(--supervisor-shadow)",
                  opacity: deleting || togglingStatus ? 0.6 : 1,
                }}
              >
                {deleting || togglingStatus ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
}
