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
    <div className="min-h-screen bg-slate-50/50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-[1400px] mx-auto space-y-8">
        {/* === HEADER === */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
              <UserCheck className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide">
                User Mapping
              </h1>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                System Personnel Mapping Registry
              </p>
            </div>
          </div>

          {canAddAssignment && (
            <Link
              href={`/userMapping/add?companyId=${companyId}`}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200/50 transition-all active:scale-95 font-bold text-sm uppercase tracking-wider"
            >
              <Plus className="w-4 h-4" />
              Add Mapping
            </Link>
          )}
        </div>

        {/* === REDESIGNED STATS CARDS (No Flags) === */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Staff Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-blue-500"></div>{" "}
            {/* Side Accent */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Total Staff
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {statusCounts.all}
              </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>

          {/* Assigned Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500"></div>{" "}
            {/* Side Accent */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Assigned
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {statusCounts.assigned}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>

          {/* Unassigned Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute left-0 top-0 w-1 h-full bg-amber-500"></div>{" "}
            {/* Side Accent */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Unassigned
              </p>
              <h3 className="text-3xl font-black text-slate-800">
                {statusCounts.unassigned}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
          </div>
        </div>

        {/* === MAIN TABLE UI === */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Search Bar Row */}
          <div className="p-5 border-b border-slate-100">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search cleaner or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:outline-none focus:ring-2 focus:ring-orange-100 focus:border-orange-400 transition-all placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-left">
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Cleaner
                  </th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </div>
                  </th>

                  {/* Role Filter Header */}
                  <th
                    className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider relative"
                    ref={roleDropdownRef}
                  >
                    <button
                      onClick={() => {
                        setShowRoleDropdown(!showRoleDropdown);
                        setShowStatusDropdown(false);
                      }}
                      className="flex items-center gap-1.5 hover:text-orange-500 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      {roleFilter === "all" ? "All Roles" : roleFilter}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showRoleDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5">
                        <button
                          onClick={() => {
                            setRoleFilter("all");
                            setShowRoleDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-wider"
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
                            className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-wider"
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    )}
                  </th>

                  {/* Status Filter Header */}
                  <th
                    className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider relative"
                    ref={statusDropdownRef}
                  >
                    <button
                      onClick={() => {
                        setShowStatusDropdown(!showStatusDropdown);
                        setShowRoleDropdown(false);
                      }}
                      className="flex items-center gap-1.5 hover:text-orange-500 transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      {statusFilter === "all" ? "All Status" : statusFilter}
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {showStatusDropdown && (
                      <div className="absolute top-full left-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl z-20 py-1.5">
                        <button
                          onClick={() => {
                            setStatusFilter("all");
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 uppercase tracking-wider"
                        >
                          All Status
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter("assigned");
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 uppercase tracking-wider"
                        >
                          Assigned
                        </button>
                        <button
                          onClick={() => {
                            setStatusFilter("unassigned");
                            setShowStatusDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-amber-600 hover:bg-amber-50 uppercase tracking-wider"
                        >
                          Unassigned
                        </button>
                      </div>
                    )}
                  </th>

                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" /> Assigned On
                    </div>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Settings className="w-3.5 h-3.5" /> Action
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Cleaner */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black border border-slate-200 uppercase">
                            {getInitials(assignment.user?.name)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              {assignment.user?.name || "Unknown User"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {assignment.user?.email || "No email"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-600">
                          {assignment.locations?.name || "Unassigned Location"}
                        </p>
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleStyle(assignment.role?.name)}`}
                        >
                          {assignment.role?.name || "N/A"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleStatusToggle(assignment)}
                          disabled={!canEditAssignment}
                          className={`inline-block px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-transform active:scale-95 ${getStatusStyle(assignment.status)} ${canEditAssignment ? "cursor-pointer" : "cursor-default"}`}
                        >
                          {assignment.status}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-500 font-mono">
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
                            disabled={deleting === assignment.id}
                            className="w-8 h-8 rounded-full border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm"
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
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                          <Search className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">
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
                className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black border border-slate-200">
                      {getInitials(assignment.user?.name)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">
                        {assignment.user?.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {assignment.user?.email}
                      </p>
                    </div>
                  </div>
                  {canDeleteAssignment && (
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Location
                    </p>
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {assignment.locations?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Date
                    </p>
                    <p className="text-sm font-medium text-slate-700 font-mono">
                      {assignment.assigned_on
                        ? new Date(assignment.assigned_on).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getRoleStyle(assignment.role?.name)}`}
                  >
                    {assignment.role?.name || "N/A"}
                  </span>
                  <button
                    onClick={() => handleStatusToggle(assignment)}
                    className={`inline-block px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(assignment.status)}`}
                  >
                    {assignment.status}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination / Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wide">
            <span>
              Showing {filteredAssignments.length} of {assignments.length}{" "}
              Entries
            </span>
            <div className="flex gap-1">
              <button
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors"
                disabled
              >
                <ChevronDown className="w-4 h-4 rotate-90 text-slate-400" />
              </button>
              <button
                className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 transition-colors"
                disabled
              >
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
