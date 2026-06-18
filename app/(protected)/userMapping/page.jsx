"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  UserCheck,
  MapPin,
  Trash2,
  Plus,
  Shield,
  Activity,
  Calendar,
  Settings,
  ChevronDown,
  User,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import ScrollToTop from "@/components/ui/ScrollToTop";
// Providers & Hooks
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// TanStack Query Hooks
import {
  useGetAllAssignments,
  useDeleteAssignment,
  useUpdateAssignment,
} from "@/features/assignments/assignments.queries";

export default function AssignmentListPage() {
  useRequirePermission(MODULES.ASSIGNMENTS);
  const { canAdd, canUpdate, canDelete } = usePermissions();
  const canAddAssignment = canAdd(MODULES.ASSIGNMENTS);
  const canEditAssignment = canUpdate(MODULES.ASSIGNMENTS);
  const canDeleteAssignment = canDelete(MODULES.ASSIGNMENTS);

  // --- PAGINATION STATE ---
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const statusDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);
  const { companyId } = useCompanyId();

  // --- QUERIES & MUTATIONS ---
  const { data: responsePayload, isLoading } = useGetAllAssignments(
    companyId,
    null,
    page,
    limit,
  );
  const deleteMutation = useDeleteAssignment();
  const updateMutation = useUpdateAssignment();

  // Data extraction
  const assignments = responsePayload?.data || [];
  const pagination = responsePayload?.pagination || { total: 0, last_page: 1 };

  // --- FILTERS & MEMOS ---
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((a) => {
        const loc = a.locations?.name?.toLowerCase() || "";
        const user = a.user?.name?.toLowerCase() || "";
        return loc.includes(query) || user.includes(query);
      });
    }

    if (statusFilter !== "all")
      filtered = filtered.filter((a) => a.status === statusFilter);
    if (roleFilter !== "all")
      filtered = filtered.filter(
        (a) => a.role?.name?.toLowerCase() === roleFilter.toLowerCase(),
      );

    return filtered;
  }, [assignments, searchQuery, statusFilter, roleFilter]);

  const uniqueRoles = useMemo(
    () => [...new Set(assignments.map((a) => a.role?.name).filter(Boolean))],
    [assignments],
  );

  const statusCounts = useMemo(
    () => ({
      all: pagination.total || 0, // Using total from pagination for accuracy
      assigned: assignments.filter((a) => a.status === "assigned").length,
      unassigned: assignments.filter((a) => a.status === "unassigned").length,
    }),
    [assignments, pagination.total],
  );

  // --- HANDLERS ---
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      )
        setShowStatusDropdown(false);
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      )
        setShowRoleDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (!canDeleteAssignment) return toast.error("Permission denied");
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setDeletingId(id);
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Assignment deleted!");
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusToggle = async (assignment) => {
    if (!canEditAssignment) return toast.error("Permission denied");
    const newStatus =
      assignment.status === "assigned" ? "unassigned" : "assigned";
    if (!confirm(`Change status to "${newStatus}"?`)) return;

    try {
      await updateMutation.mutateAsync({
        id: assignment.id,
        data: { ...assignment, status: newStatus },
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--assignment-bg)" }}
      >
        <Loader
          size="large"
          color="var(--assignment-accent-text)"
          message="Loading assignments..."
        />
      </div>
    );
  }

  return (
    <div
    id="scroll-container"
      className="min-h-screen p-6"
      style={{
        background: "var(--assignment-bg)",
      }}
    >
      <Toaster position="top-right" />
<ScrollToTop />
      <div className="max-w-[1400px] mx-auto space-y-8 ">
        {/* --- HEADER --- */}
        <div
          className="rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 md:mt-[-30px]"
          style={{
            background: "var(--assignment-surface)",
            border: "1px solid var(--assignment-border)",
            boxShadow: "var(--assignment-shadow)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--assignment-accent-bg)",
                border: "1px solid var(--assignment-accent-border)",
              }}
            >
              <UserCheck
                className="w-5 h-5"
                style={{ color: "var(--assignment-accent-text)" }}
              />
            </div>

            <div>
              <h1
                className="text-lg font-black uppercase tracking-wide"
                style={{ color: "var(--assignment-title)" }}
              >
                Cleaner Assignments
              </h1>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--assignment-subtitle)" }}
              >
                System Personnel Mapping Registry
              </p>
            </div>
          </div>

          {canAddAssignment && (
            <Link
              href={`/userMapping/add?companyId=${companyId}`}
              className="flex items-center gap-2 px-5 py-2 rounded-lg transition-all active:scale-95 font-bold text-xs uppercase tracking-wider"
              style={{
                background: "var(--assignment-primary-bg)",
                color: "var(--assignment-primary-text)",
                boxShadow: "var(--assignment-primary-shadow)",
              }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Cleaner
            </Link>
          )}
        </div>

        {/* --- REDESIGNED COMPACT STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:mt-[-15px]">
          {/* Helper function to generate cards */}
          {[
            {
              title: "Total Staff",
              value: statusCounts.all,
              icon: Users,
              accent: "var(--assignment-accent-text)",
              bg: "var(--assignment-accent-bg)",
            },
            {
              title: "Assigned",
              value: statusCounts.assigned,
              icon: CheckCircle,
              accent: "var(--assignment-success-dot)",
              bg: "rgba(34, 197, 94, 0.12)",
            },
            {
              title: "Unassigned",
              value: statusCounts.unassigned,
              icon: AlertCircle,
              accent: "var(--assignment-warning-text)",
              bg: "var(--assignment-warning-bg)",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="rounded-xl p-4 flex items-center justify-between group transition-all relative overflow-hidden"
              style={{
                background: "var(--assignment-surface)",
                border: "1px solid var(--assignment-border)",
                boxShadow: "var(--assignment-shadow)",
              }}
            >
              <div
                className="absolute left-0 top-0 w-1 h-full"
                style={{ background: card.accent }}
              />

              <div>
                <p
                  className="text-[9px] font-bold uppercase tracking-widest mb-0.5"
                  style={{ color: "var(--assignment-subtitle)" }}
                >
                  {card.title}
                </p>
                <h3
                  className="text-2xl font-black"
                  style={{ color: "var(--assignment-title)" }}
                >
                  {card.value}
                </h3>
              </div>

              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: card.bg,
                  border: `1px solid ${card.accent}40`,
                }}
              >
                <card.icon className="w-5 h-5" style={{ color: card.accent }} />
              </div>
            </div>
          ))}
        </div>

        {/* === MAIN TABLE UI === */}
        <div
          className="rounded-2xl overflow-hidden md:mt-[-15px]"
          style={{
            background: "var(--assignment-surface)",
            border: "1px solid var(--assignment-border)",
            boxShadow: "var(--assignment-shadow)",
          }}
        >
          {/* Search Bar Row */}
          <div
            className="p-5"
            style={{
              borderBottom: "1px solid var(--assignment-divider)",
            }}
          >
            <div className="relative max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "var(--assignment-subtitle)" }}
              />

              <input
                type="text"
                placeholder="Search cleaner or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all"
                style={{
                  background: "var(--assignment-input-bg)",
                  border: "1px solid var(--assignment-input-border)",
                  color: "var(--assignment-input-text)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border =
                    "1px solid var(--assignment-input-focus-border)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border =
                    "1px solid var(--assignment-input-border)";
                }}
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--assignment-divider)",
                    color: "var(--assignment-subtitle)",
                  }}
                  className="text-left"
                >
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-center">
                    #
                  </th>
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5" />
                      Cleaner
                    </div>
                  </th>

                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      Location
                    </div>
                  </th>

                  {/* Role Filter Header */}
                  <th
                    className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider relative"
                    ref={roleDropdownRef}
                  >
                    <button
                      onClick={() => {
                        setShowRoleDropdown(!showRoleDropdown);
                        setShowStatusDropdown(false);
                      }}
                      className="flex items-center gap-1.5 transition-colors"
                      style={{ color: "var(--assignment-subtitle)" }}
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {roleFilter === "all" ? "All Roles" : roleFilter}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showRoleDropdown && (
                      <div
                        className="absolute top-full left-0 mt-2 w-40 rounded-xl z-20 py-1.5"
                        style={{
                          background: "var(--assignment-dropdown-bg)",
                          border: "1px solid var(--assignment-dropdown-border)",
                          boxShadow: "var(--assignment-shadow)",
                        }}
                      >
                        <button
                          onClick={() => {
                            setRoleFilter("all");
                            setShowRoleDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: "var(--assignment-subtitle)" }}
                        >
                          All Roles
                        </button>

                        {uniqueRoles.map((role) => (
                          <button
                            key={role}
                            onClick={() => {
                              setRoleFilter(role);
                              setShowRoleDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider"
                            style={{ color: "var(--assignment-title)" }}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>

                  {/* Status Filter Header */}
                  <th
                    className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider relative"
                    ref={statusDropdownRef}
                  >
                    <button
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowRoleDropdown(false);
                      }}
                      className="flex items-center gap-1.5"
                      style={{ color: "var(--assignment-subtitle)" }}
                    >
                      <Activity className="w-3.5 h-3.5" />
                      {statusFilter === "all" ? "All Status" : statusFilter}
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showStatusDropdown && (
                      <div
                        className="absolute top-full left-0 mt-2 w-40 rounded-xl z-20 py-1.5"
                        style={{
                          background: "var(--assignment-dropdown-bg)",
                          border: "1px solid var(--assignment-dropdown-border)",
                          boxShadow: "var(--assignment-shadow)",
                        }}
                      >
                        <button
                          onClick={() => {
                            setStatusFilter("all");
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: "var(--assignment-subtitle)" }}
                        >
                          All Status
                        </button>

                        <button
                          onClick={() => {
                            setStatusFilter("assigned");
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: "var(--assignment-success-dot)" }}
                        >
                          Assigned
                        </button>

                        <button
                          onClick={() => {
                            setStatusFilter("unassigned");
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider"
                          style={{ color: "var(--assignment-warning-text)" }}
                        >
                          Unassigned
                        </button>
                      </div>
                    )}
                  </th>

                  <th
                    className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{ color: "var(--assignment-subtitle)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--assignment-subtitle)" }}
                      />
                      Assigned On
                    </div>
                  </th>

                  <th
                    className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-right"
                    style={{ color: "var(--assignment-subtitle)" }}
                  >
                    <div className="flex items-center justify-end gap-2">
                      <Settings
                        className="w-3.5 h-3.5"
                        style={{ color: "var(--assignment-subtitle)" }}
                      />
                      Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody
                style={{
                  borderTop: "1px solid var(--assignment-divider)",
                }}
              >
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment, index) => (
                    <tr
                      key={assignment.id}
                      className="transition-colors group"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--assignment-dropdown-hover)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td className="px-6 py-4">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase"
                          style={{
                            background: "var(--assignment-chip-bg)",
                            border: "1px solid var(--assignment-chip-border)",
                            color: "var(--assignment-subtitle)",
                          }}
                        >
                          {/* Sequential math: (page - 1) * limit + current_index + 1 */}
                          {index + 1 + (page - 1) * limit}
                        </div>
                      </td>
                      {/* Cleaner */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black uppercase"
                            style={{
                              background: "var(--assignment-chip-bg)",
                              border: "1px solid var(--assignment-chip-border)",
                              color: "var(--assignment-subtitle)",
                            }}
                          >
                            {getInitials(assignment.user?.name)}
                          </div>

                          <div>
                            <p
                              className="text-xs font-bold"
                              style={{ color: "var(--assignment-title)" }}
                            >
                              {assignment.user?.name || "Unknown User"}
                            </p>
                            <p
                              className="text-[10px] font-medium"
                              style={{ color: "var(--assignment-subtitle)" }}
                            >
                              {assignment.user?.phone || "No phone"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <p
                          className="text-xs font-bold"
                          style={{ color: "var(--assignment-title)" }}
                        >
                          {assignment.locations?.name || "Unassigned Location"}
                        </p>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            background: "var(--assignment-chip-bg)",
                            border: "1px solid var(--assignment-chip-border)",
                            color: "var(--assignment-chip-text)",
                          }}
                        >
                          {assignment.role?.name || "N/A"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStatusToggle(assignment)}
                          disabled={!canEditAssignment}
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95 ${
                            canEditAssignment
                              ? "cursor-pointer"
                              : "cursor-default"
                          }`}
                          style={{
                            background:
                              assignment.status === "assigned"
                                ? "var(--assignment-accent-bg)"
                                : "var(--assignment-warning-bg)",
                            border: `1px solid ${
                              assignment.status === "assigned"
                                ? "var(--assignment-accent-border)"
                                : "var(--assignment-warning-border)"
                            }`,
                            color:
                              assignment.status === "assigned"
                                ? "var(--assignment-accent-text)"
                                : "var(--assignment-warning-text)",
                          }}
                        >
                          {assignment.status}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p
                          className="text-xs font-bold font-mono"
                          style={{ color: "var(--assignment-subtitle)" }}
                        >
                          {assignment.assigned_on
                            ? new Date(
                                assignment.assigned_on,
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {canDeleteAssignment && (
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            disabled={deletingId === assignment.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ml-auto"
                            style={{
                              background: "var(--assignment-warning-bg)",
                              border:
                                "1px solid var(--assignment-warning-border)",
                              color: "var(--assignment-warning-text)",
                            }}
                          >
                            {deletingId === assignment.id ? (
                              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                          style={{ background: "var(--assignment-chip-bg)" }}
                        >
                          <Search
                            className="w-6 h-6"
                            style={{ color: "var(--assignment-subtitle)" }}
                          />
                        </div>
                        <p
                          className="font-medium text-sm"
                          style={{ color: "var(--assignment-subtitle)" }}
                        >
                          No assignments found matching your criteria.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Layout */}
          <div className="md:hidden p-4 space-y-4">
            {filteredAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="rounded-xl p-4 space-y-4"
                style={{
                  background: "var(--assignment-surface)",
                  border: "1px solid var(--assignment-border)",
                  boxShadow: "var(--assignment-shadow)",
                }}
              >
                {/* Header */}
                <div
                  className="flex items-center justify-between pb-3"
                  style={{
                    borderBottom: "1px solid var(--assignment-divider)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black uppercase"
                      style={{
                        background: "var(--assignment-chip-bg)",
                        border: "1px solid var(--assignment-chip-border)",
                        color: "var(--assignment-subtitle)",
                      }}
                    >
                      {getInitials(assignment.user?.name)}
                    </div>

                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--assignment-title)" }}
                      >
                        {assignment.user?.name}
                      </p>
                      <p
                        className="text-[10px] font-medium"
                        style={{ color: "var(--assignment-subtitle)" }}
                      >
                        {assignment.user?.email}
                      </p>
                    </div>
                  </div>

                  {canDeleteAssignment && (
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      disabled={deletingId === assignment.id}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: "var(--assignment-warning-bg)",
                        border: "1px solid var(--assignment-warning-border)",
                        color: "var(--assignment-warning-text)",
                      }}
                    >
                      {deletingId === assignment.id ? (
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase mb-1"
                      style={{ color: "var(--assignment-subtitle)" }}
                    >
                      Location
                    </p>
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--assignment-title)" }}
                    >
                      {assignment.locations?.name || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-[10px] font-bold uppercase mb-1"
                      style={{ color: "var(--assignment-subtitle)" }}
                    >
                      Date
                    </p>
                    <p
                      className="text-sm font-medium font-mono"
                      style={{ color: "var(--assignment-subtitle)" }}
                    >
                      {assignment.assigned_on
                        ? new Date(assignment.assigned_on).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2">
                  <span
                    className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: "var(--assignment-chip-bg)",
                      border: "1px solid var(--assignment-chip-border)",
                      color: "var(--assignment-chip-text)",
                    }}
                  >
                    {assignment.role?.name || "N/A"}
                  </span>

                  <button
                    onClick={() => handleStatusToggle(assignment)}
                    disabled={!canEditAssignment}
                    className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background:
                        assignment.status === "assigned"
                          ? "var(--assignment-accent-bg)"
                          : "var(--assignment-warning-bg)",
                      border: `1px solid ${
                        assignment.status === "assigned"
                          ? "var(--assignment-accent-border)"
                          : "var(--assignment-warning-border)"
                      }`,
                      color:
                        assignment.status === "assigned"
                          ? "var(--assignment-accent-text)"
                          : "var(--assignment-warning-text)",
                    }}
                  >
                    {assignment.status}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination / Footer */}
          <div
            className="flex flex-col md:flex-row justify-between items-center mt-6 p-4 rounded-2xl gap-4"
            style={{
              background: "var(--assignment-surface)",
              border: "1px solid var(--assignment-border)",
            }}
          >
            {/* Items Per Page Dropdown */}
            <div className="w-full md:w-auto flex items-center gap-2">
              <span className="text-xs font-bold uppercase text-slate-500 whitespace-nowrap">
                Items:
              </span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="w-full md:w-auto px-3 py-2 rounded-lg text-sm font-semibold outline-none cursor-pointer border border-transparent focus:border-slate-300 transition-all"
                style={{ background: "var(--assignment-input-bg)" }}
              >
                <option value={15}>15</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Navigation Buttons */}
            <div className="w-full md:w-auto flex items-center justify-center flex-wrap gap-2 md:gap-4">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider disabled:opacity-30 transition-all hover:bg-slate-100"
                style={{ border: "1px solid var(--assignment-border)" }}
              >
                Previous
              </button>

              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap px-2">
                Page {page} of {pagination.last_page}
              </span>

              <button
                onClick={() =>
                  setPage((p) => (p < pagination.last_page ? p + 1 : p))
                }
                disabled={
                  page >= pagination.last_page || pagination.last_page === 0
                }
                className="px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider disabled:opacity-30 transition-all hover:bg-slate-100"
                style={{ border: "1px solid var(--assignment-border)" }}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
