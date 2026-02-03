"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/features/users/users.api";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  UserPlus,
  User,
  MapPin,
  Search,
  ChevronDown,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Loader from "@/components/ui/Loader";

export default function AddAssignmentContent() {
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [status, setStatus] = useState("assigned");
  const [allUsers, setAllUsers] = useState([]);
  const [availableCleaners, setAvailableCleaners] = useState([]);
  const [assignedCleaners, setAssignedCleaners] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const locationId = searchParams.get("locationId");
  const locationName = searchParams.get("locationName");

  const userDropdownRef = useRef(null);

  useEffect(() => {
    if (!companyId || !locationId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userRes = await UsersApi.getAllUsers(companyId);

        if (userRes.success) {
          const cleaners = (userRes.data || []).filter(
            (user) =>
              user.role?.name?.toLowerCase() === "cleaner" ||
              user.role_id === 5,
          );
          setAllUsers(cleaners);

          const assignmentsRes = await AssignmentsApi.getAssignmentsByLocation(
            locationId,
            companyId,
          );

          if (assignmentsRes.success) {
            const filteredCleaners = assignmentsRes.data.filter(
              (item) => item.role_id === 5,
            );
            const assignedCleanerIds = filteredCleaners.map(
              (a) => a.cleaner_user_id,
            );
            setAssignedCleaners(filteredCleaners);

            const available = cleaners.filter(
              (cleaner) => !assignedCleanerIds.includes(cleaner.id),
            );
            setAvailableCleaners(available);
          } else {
            setAvailableCleaners(cleaners);
          }
        }
      } catch (err) {
        toast.error("Failed to fetch cleaners");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId, locationId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCleanerSelect = (cleaner) => {
    setSelectedCleaners((prev) =>
      prev.some((c) => c.id === cleaner.id)
        ? prev.filter((c) => c.id !== cleaner.id)
        : [...prev, cleaner],
    );
  };

  const handleRemoveCleaner = (cleanerId) => {
    setSelectedCleaners((prev) => prev.filter((c) => c.id !== cleanerId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedCleaners.length === 0)
      return toast.error("Please select at least one cleaner.");
    if (!locationId) return toast.error("Location ID is missing.");

    setIsLoading(true);

    try {
      const assignmentData = {
        location_id: locationId,
        cleaner_user_ids: selectedCleaners.map((c) => c.id),
        company_id: companyId,
        status: status,
        role_id: 5,
      };

      const response =
        await AssignmentsApi.createAssignmentsForLocation(assignmentData);

      if (response.success) {
        const { created, skipped } = response.data.data || {};
        if (created > 0)
          toast.success(`${created} cleaner(s) assigned successfully!`);
        if (skipped > 0)
          toast.warning(`${skipped} cleaner(s) were already assigned.`);

        setTimeout(() => {
          router.push(
            `/assignments/cleaner?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`,
          );
        }, 1000);
      } else {
        toast.error(response.error || "Failed to create assignments");
      }
    } catch (error) {
      toast.error("Failed to create assignments");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = availableCleaners.filter((user) =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Assign Cleaners
              </h1>
              {locationName && (
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                  <MapPin size={14} className="text-[#FFAB2D]" />
                  <span className="font-medium">{locationName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Info Banner */}
        {assignedCleaners.length > 0 && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-blue-900">
                Note on Existing Assignments
              </h3>
              <p className="text-xs text-blue-700 mt-1">
                {assignedCleaners.length} cleaner
                {assignedCleaners.length !== 1 ? "s are" : " is"} already
                assigned to this location. The list below only shows available
                staff.
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
        >
          <div className="p-6 md:p-8 space-y-8">
            {/* Cleaner Selection */}
            <div ref={userDropdownRef} className="relative">
              <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
                <span>Select Cleaners</span>
                <span className="text-slate-400 font-normal text-xs">
                  {selectedCleaners.length} selected
                </span>
              </label>

              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                disabled={availableCleaners.length === 0}
                className="w-full flex justify-between items-center text-left px-4 py-3 bg-white border border-slate-300 rounded-xl hover:border-[#FFAB2D] focus:ring-2 focus:ring-[#FFAB2D]/20 transition-all disabled:bg-slate-50 disabled:text-slate-400"
              >
                <span
                  className={
                    selectedCleaners.length
                      ? "text-slate-900 font-medium"
                      : "text-slate-500"
                  }
                >
                  {availableCleaners.length === 0
                    ? "No cleaners available"
                    : selectedCleaners.length > 0
                      ? `${selectedCleaners.length} Cleaner(s) Selected`
                      : "Click to select cleaners..."}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && availableCleaners.length > 0 && (
                <div className=" z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search name..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#FFAB2D] transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto p-2 space-y-1">
                    {filteredUsers.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No cleaners found
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = selectedCleaners.some(
                          (s) => s.id === user.id,
                        );
                        return (
                          <div
                            key={user.id}
                            onClick={() => handleCleanerSelect(user)}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-orange-50 border border-orange-100" : "hover:bg-slate-50 border border-transparent"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-[#FFAB2D] text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-medium ${isSelected ? "text-slate-900" : "text-slate-700"}`}
                                >
                                  {user.name}
                                </p>
                                {user.phone && (
                                  <p className="text-xs text-slate-400">
                                    {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#FFAB2D]" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Tags */}
            {selectedCleaners.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCleaners.map((cleaner) => (
                  <span
                    key={cleaner.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-800 rounded-full text-xs font-bold shadow-sm"
                  >
                    {cleaner.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveCleaner(cleaner.id)}
                      className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Available Count Helper */}
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <UserPlus size={12} /> {availableCleaners.length} cleaner(s)
              available for assignment
            </p>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedCleaners.length === 0}
              className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl bg-[#FFAB2D] hover:bg-[#e89a25] text-white font-bold text-sm shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
            >
              {isLoading ? (
                <Loader size={14} color="white" />
              ) : (
                "Confirm Assignment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
