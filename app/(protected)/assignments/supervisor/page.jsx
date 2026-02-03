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
      <div className="flex flex-col justify-center items-center h-screen bg-white">
        <Loader size="large" color="#f97316" />
        <p className="mt-4 text-slate-400 text-sm animate-pulse">
          Loading supervisors...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-20">
      <Toaster position="bottom-center" />

      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">
                Supervisors
              </h1>
              <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                <MapPin size={12} />
                {locationName || "All Locations"}
              </div>
            </div>
          </div>
          <button
            onClick={handleAddSupervisor}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Minimal Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 transition-all shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-orange-300 cursor-pointer shadow-sm text-slate-600"
          >
            <option value="all">All Status</option>
            <option value="assigned">Active</option>
            <option value="unassigned">Inactive</option>
          </select>
        </div>

        {/* Empty State */}
        {filteredAssignments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Users className="text-slate-200 mb-4" size={48} />
            <p className="text-slate-400 text-sm">
              No supervisors found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAssignments.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl p-5 border border-slate-100 hover:border-orange-100 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
                      {item.cleaner_user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 text-sm truncate max-w-[140px]">
                        {item.cleaner_user?.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Circle
                          size={8}
                          fill={
                            item.status === "assigned" ? "#10b981" : "#cbd5e1"
                          }
                          className={
                            item.status === "assigned"
                              ? "text-emerald-500"
                              : "text-slate-300"
                          }
                        />
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          {item.status === "assigned" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdown(
                          activeDropdown === item.id ? null : item.id,
                        );
                      }}
                      className="p-1 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {activeDropdown === item.id && (
                      <div className="absolute right-0 top-7 w-36 bg-white border border-slate-100 rounded-lg shadow-lg py-1 z-20">
                        <button
                          onClick={() => handleView(item.cleaner_user_id)}
                          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-orange-50 flex items-center gap-2"
                        >
                          <Eye size={14} /> Profile
                        </button>
                        <button
                          onClick={() =>
                            setStatusModal({ open: true, assignment: item })
                          }
                          className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-orange-50 flex items-center gap-2"
                        >
                          <Users size={14} /> Change Status
                        </button>
                        <button
                          onClick={() =>
                            setDeleteModal({ open: true, assignment: item })
                          }
                          className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-50 flex items-center gap-2 border-t border-slate-50"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Mail size={14} className="text-slate-300" />
                    <span className="truncate">
                      {item.cleaner_user?.email || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone size={14} className="text-slate-300" />
                    <span>{item.cleaner_user?.phone || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={14} className="text-slate-300" />
                    <span>
                      {new Date(item.assigned_on).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleView(item.cleaner_user_id)}
                  className="w-full py-2 bg-slate-50 group-hover:bg-orange-50 text-slate-500 group-hover:text-orange-600 rounded-lg text-xs font-semibold transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${deleteModal.open ? "bg-red-50 text-red-500" : "bg-orange-50 text-orange-500"}`}
            >
              {deleteModal.open ? (
                <AlertTriangle size={28} />
              ) : (
                <Users size={28} />
              )}
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
              {deleteModal.open ? "Remove Supervisor" : "Update Status"}
            </h3>
            <p className="text-center text-slate-400 text-sm mb-8 px-2">
              {deleteModal.open
                ? `Are you sure you want to remove ${deleteModal.assignment?.cleaner_user?.name}?`
                : `Toggle status for ${statusModal.assignment?.cleaner_user?.name}?`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteModal({ open: false, assignment: null });
                  setStatusModal({ open: false, assignment: null });
                }}
                className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-slate-600"
              >
                Go Back
              </button>
              <button
                onClick={deleteModal.open ? confirmDelete : confirmStatusToggle}
                disabled={deleting || togglingStatus}
                className={`flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-transform active:scale-95 ${deleteModal.open ? "bg-red-500 shadow-red-200" : "bg-orange-500 shadow-orange-200"}`}
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
  