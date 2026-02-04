"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import Loader from "@/components/ui/Loader";
import {
  Search,
  UserCheck,
  MapPin,
  Trash2,
  Plus,
  Shield, // For Role Filter
  Activity, // For Status Filter
  Calendar,
  Settings,
  ChevronDown,
  User,
  Users,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// Providers & Hooks
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

export default function AssignmentListPage() {
  useRequirePermission(MODULES.ASSIGNMENTS);

  const { canAdd, canUpdate, canDelete } = usePermissions();
  const canAddAssignment = canAdd(MODULES.ASSIGNMENTS);
  const canEditAssignment = canUpdate(MODULES.ASSIGNMENTS);
  const canDeleteAssignment = canDelete(MODULES.ASSIGNMENTS);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Dropdown states for Table Headers
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const statusDropdownRef = useRef(null);
  const roleDropdownRef = useRef(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const { companyId } = useCompanyId();

  // --- API CALLS ---
  const fetchAssignments = async () => {
    if (!companyId || companyId === "null") {
      setLoading(false);
      setHasInitialized(true);
      return;
    }

    if (hasInitialized) setLoading(true);

    try {
      const res = await AssignmentsApi.getAllAssignments(companyId);
      if (res.success) {
        setAssignments(res.data?.data || []);
      } else {
        toast.error(res.error);
        setAssignments([]);
      }
    } catch (error) {
      console.error("Fetch mapping error:", error);
      toast.error("Failed to fetch mappings");
      setAssignments([]);
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  };

  const handleDelete = async (id) => {
    if (!canDeleteAssignment) return toast.error("Permission denied");
    if (!confirm("Are you sure you want to delete this assignment?")) return;

    setDeleting(id);
    try {
      const res = await AssignmentsApi.deleteAssignment(id);
      if (res.success) {
        toast.success("Assignment deleted!");
        fetchAssignments();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to delete assignment");
    } finally {
      setDeleting(null);
    }
  };

  const handleStatusToggle = async (assignment) => {
    if (!canEditAssignment) return toast.error("Permission denied");

    const newStatus =
      assignment.status === "assigned" ? "unassigned" : "assigned";
    if (!confirm(`Change status to "${newStatus}"?`)) return;

    try {
      const res = await AssignmentsApi.updateAssignment(assignment.id, {
        status: newStatus,
        cleaner_user_id: assignment.cleaner_user_id,
        company_id: assignment.company_id || companyId,
        location_id: assignment.location_id,
        role_id: assignment.role_id,
      });

      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        fetchAssignments();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // --- FILTERS & MEMOS ---
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((assignment) => {
        const locationName = assignment.locations?.name?.toLowerCase() || "";
        const userName = assignment.user?.name?.toLowerCase() || "";
        return locationName.includes(query) || userName.includes(query);
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(
        (a) => a.role?.name?.toLowerCase() === roleFilter.toLowerCase(),
      );
    }

    return filtered;
  }, [assignments, searchQuery, statusFilter, roleFilter]);

  const uniqueRoles = useMemo(() => {
    return [...new Set(assignments.map((a) => a.role?.name).filter(Boolean))];
  }, [assignments]);

  const statusCounts = useMemo(() => {
    return {
      all: assignments.length,
      assigned: assignments.filter((a) => a.status === "assigned").length,
      unassigned: assignments.filter((a) => a.status === "unassigned").length,
    };
  }, [assignments]);

  // --- EFFECTS ---
  useEffect(() => {
    fetchAssignments();
  }, [companyId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setShowStatusDropdown(false);
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- RENDER HELPERS ---

  // New Palette for Badges (Matches screenshot)
  const getRoleStyle = (roleName) => {
    const role = roleName?.toLowerCase() || "";
    if (role === "cleaner")
      return "bg-orange-50 text-orange-600 border border-orange-200";
    if (role === "supervisor")
      return "bg-cyan-50 text-cyan-600 border border-cyan-200";
    return "bg-slate-50 text-slate-600 border border-slate-200";
  };

  const getStatusStyle = (status) => {
    if (status === "assigned")
      return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    return "bg-amber-50 text-amber-600 border border-amber-200";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading || !hasInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader size="large" color="#f97316" message="Loading assignments..." />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "var(--assignment-bg)",
      }}
    >

      <Toaster position="top-right" />

      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* === HEADER === */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{
            background: "var(--assignment-surface)",
            border: "1px solid var(--assignment-border)",
            boxShadow: "var(--assignment-shadow)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--assignment-accent-bg)",
                border: "1px solid var(--assignment-accent-border)",
              }}
            >
              <UserCheck
                className="w-6 h-6"
                style={{ color: "var(--assignment-accent-text)" }}
              />
            </div>

            <div>
              <h1
                className="text-xl font-black uppercase tracking-wide"
                style={{ color: "var(--assignment-title)" }}
              >
                Cleaner Assignments
              </h1>

              <p
                className="text-[11px] font-bold uppercase tracking-widest mt-1"
                style={{ color: "var(--assignment-subtitle)" }}
              >
                System Personnel Mapping Registry
              </p>
            </div>
          </div>

          {canAddAssignment && (
            <Link
              href={`/userMapping/add?companyId=${companyId}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl transition-all active:scale-95 font-bold text-sm uppercase tracking-wider"
              style={{
                background: "var(--assignment-primary-bg)",
                color: "var(--assignment-primary-text)",
                boxShadow: "var(--assignment-primary-shadow)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "var(--assignment-primary-hover-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "var(--assignment-primary-bg)";
              }}
            >
              <Plus className="w-4 h-4" />
              Add Cleaner
            </Link>
          )}
        </div>


        {/* === REDESIGNED STATS CARDS (No Flags) === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Staff Card */}
          <div
            className="rounded-2xl p-6 flex items-center justify-between group transition-all relative overflow-hidden"
            style={{
              background: "var(--assignment-surface)",
              border: "1px solid var(--assignment-border)",
              boxShadow: "var(--assignment-shadow)",
            }}
          >
            {/* Side Accent */}
            <div
              className="absolute left-0 top-0 w-1 h-full"
              style={{ background: "var(--assignment-accent-text)" }}
            />

            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--assignment-subtitle)" }}
              >
                Total Staff
              </p>

              <h3
                className="text-3xl font-black"
                style={{ color: "var(--assignment-title)" }}
              >
                {statusCounts.all}
              </h3>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: "var(--assignment-accent-bg)",
                border: "1px solid var(--assignment-accent-border)",
              }}
            >
              <Users
                className="w-6 h-6"
                style={{ color: "var(--assignment-accent-text)" }}
              />
            </div>
          </div>


          {/* Assigned Card */}
          <div
            className="rounded-2xl p-6 flex items-center justify-between group transition-all relative overflow-hidden"
            style={{
              background: "var(--assignment-surface)",
              border: "1px solid var(--assignment-border)",
              boxShadow: "var(--assignment-shadow)",
            }}
          >
            {/* Side Accent */}
            <div
              className="absolute left-0 top-0 w-1 h-full"
              style={{ background: "var(--assignment-success-dot)" }}
            />

            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--assignment-subtitle)" }}
              >
                Assigned
              </p>

              <h3
                className="text-3xl font-black"
                style={{ color: "var(--assignment-title)" }}
              >
                {statusCounts.assigned}
              </h3>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.35)",
              }}
            >
              <CheckCircle
                className="w-6 h-6"
                style={{ color: "var(--assignment-success-dot)" }}
              />
            </div>
          </div>


          {/* Unassigned Card */}
          <div
            className="rounded-2xl p-6 flex items-center justify-between group transition-all relative overflow-hidden"
            style={{
              background: "var(--assignment-surface)",
              border: "1px solid var(--assignment-border)",
              boxShadow: "var(--assignment-shadow)",
            }}
          >
            {/* Side Accent */}
            <div
              className="absolute left-0 top-0 w-1 h-full"
              style={{ background: "var(--assignment-warning-text)" }}
            />

            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: "var(--assignment-subtitle)" }}
              >
                Unassigned
              </p>

              <h3
                className="text-3xl font-black"
                style={{ color: "var(--assignment-title)" }}
              >
                {statusCounts.unassigned}
              </h3>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: "var(--assignment-warning-bg)",
                border: "1px solid var(--assignment-warning-border)",
              }}
            >
              <AlertCircle
                className="w-6 h-6"
                style={{ color: "var(--assignment-warning-text)" }}
              />
            </div>
          </div>

        </div>

        {/* === MAIN TABLE UI === */}
        <div
          className="rounded-2xl overflow-hidden"
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
                    // background: "var(--assignment-header-bg)",
                    borderBottom: "1px solid var(--assignment-divider)",
                    color: "var(--assignment-subtitle)",
                  }}
                  className="text-left"
                >
                  <th className="px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" />
                    Cleaner
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
                  filteredAssignments.map((assignment) => (
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
                              {assignment.user?.email || "No email"}
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
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95 ${canEditAssignment ? "cursor-pointer" : "cursor-default"
                            }`}
                          style={{
                            background:
                              assignment.status === "assigned"
                                ? "var(--assignment-accent-bg)"
                                : "var(--assignment-warning-bg)",
                            border: `1px solid ${assignment.status === "assigned"
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
                            ? new Date(assignment.assigned_on).toLocaleDateString()
                            : "-"}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4 text-right">
                        {canDeleteAssignment && (
                          <button
                            onClick={() => handleDelete(assignment.id)}
                            disabled={deleting === assignment.id}
                            className="w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm"
                            style={{
                              background: "var(--assignment-warning-bg)",
                              border: "1px solid var(--assignment-warning-border)",
                              color: "var(--assignment-warning-text)",
                            }}
                          >
                            {deleting === assignment.id ? (
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
                  style={{ borderBottom: "1px solid var(--assignment-divider)" }}
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
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                      style={{
                        background: "var(--assignment-warning-bg)",
                        border: "1px solid var(--assignment-warning-border)",
                        color: "var(--assignment-warning-text)",
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
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
                    className="inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background:
                        assignment.status === "assigned"
                          ? "var(--assignment-accent-bg)"
                          : "var(--assignment-warning-bg)",
                      border: `1px solid ${assignment.status === "assigned"
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
            className="px-6 py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wide"
            style={{
              borderTop: "1px solid var(--assignment-divider)",
              background: "var(--assignment-accent-bg)",
              color: "var(--assignment-subtitle)",
            }}
          >
            <span>
              Showing {filteredAssignments.length} of {assignments.length} Entries
            </span>

            <div className="flex gap-1">
              <button
                disabled
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                style={{
                  background: "var(--assignment-surface)",
                  border: "1px solid var(--assignment-border)",
                  color: "var(--assignment-subtitle)",
                }}
              >
                <ChevronDown
                  className="w-4 h-4 rotate-90"
                  style={{ color: "var(--assignment-subtitle)" }}
                />
              </button>

              <button
                disabled
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                style={{
                  background: "var(--assignment-surface)",
                  border: "1px solid var(--assignment-border)",
                  color: "var(--assignment-subtitle)",
                }}
              >
                <ChevronDown
                  className="w-4 h-4 -rotate-90"
                  style={{ color: "var(--assignment-subtitle)" }}
                />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
