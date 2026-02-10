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
} from "lucide-react";

export default function AddSupervisorAssignmentPage() {
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [status, setStatus] = useState("assigned");
  const [allUsers, setAllUsers] = useState([]);
  const [availableSupervisors, setAvailableSupervisors] = useState([]);
  const [assignedSupervisors, setAssignedSupervisors] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const locationId = searchParams.get("locationId");
  const locationName = searchParams.get("locationName");

  const userDropdownRef = useRef(null);

  // ✅ Fetch supervisors and filter out already assigned ones
  useEffect(() => {
    if (!companyId || !locationId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("in fetch data");
        // Fetch all supervisors
        const userRes = await UsersApi.getAllUsers(companyId);
        console.log("✅ userRes", userRes);

        if (userRes.success) {
          const supervisors = (userRes.data || []).filter(
            (user) =>
              user.role?.name?.toLowerCase() === "supervisor" ||
              user.role_id === 3,
          );
          setAllUsers(supervisors);

          // ✅ Fetch existing assignments for this location
          const assignmentsRes = await AssignmentsApi.getAssignmentsByLocation(
            locationId,
            companyId,
          );
          console.log("✅ assignmentsRes", assignmentsRes);

          if (assignmentsRes.success) {
            const assignedSupervisorIds = assignmentsRes.data.map(
              (a) => a.cleaner_user_id,
            );
            setAssignedSupervisors(
              assignmentsRes.data.filter((item) => item.role_id === 3),
            );

            // ✅ Filter out supervisors who are already assigned
            const available = supervisors.filter(
              (supervisor) => !assignedSupervisorIds.includes(supervisor.id),
            );
            setAvailableSupervisors(available);

            console.log(`✅ Total supervisors: ${supervisors.length}`);
            console.log(`✅ Already assigned: ${assignedSupervisorIds.length}`);
            console.log(`✅ Available to assign: ${available.length}`);
          } else {
            // If fetch fails, show all supervisors
            setAvailableSupervisors(supervisors);
          }
        }
      } catch (err) {
        console.error("❌ Error while fetching:", err);
        toast.error("Failed to fetch supervisors");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId, locationId]);

  // Close dropdown on outside click
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

  const handleSupervisorSelect = (supervisor) => {
    setSelectedSupervisors((prev) =>
      prev.some((s) => s.id === supervisor.id)
        ? prev.filter((s) => s.id !== supervisor.id)
        : [...prev, supervisor],
    );
  };

  const handleRemoveSupervisor = (supervisorId) => {
    setSelectedSupervisors((prev) => prev.filter((s) => s.id !== supervisorId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedSupervisors.length === 0) {
      return toast.error("Please select at least one supervisor.");
    }

    if (!locationId) {
      return toast.error("Location ID is missing.");
    }

    setIsLoading(true);

    try {
      const assignmentData = {
        location_id: locationId,
        cleaner_user_ids: selectedSupervisors.map((s) => s.id),
        company_id: companyId,
        status: status,
        role_id: 3,
      };

      const response =
        await AssignmentsApi.createAssignmentsForLocation(assignmentData);

      if (response.success) {
        const { created, skipped } = response.data.data || {};

        if (created > 0) {
          toast.success(`${created} supervisor(s) assigned successfully!`);
        }

        if (skipped > 0) {
          toast.warning(`${skipped} supervisor(s) were already assigned.`);
        }

        setTimeout(() => {
          router.push(
            `/assignments/supervisor?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`,
          );
        }, 1000);
      } else {
        toast.error(response.error || "Failed to create assignments");
      }
    } catch (error) {
      console.error("Error creating assignments:", error);
      toast.error("Failed to create assignments");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Filter only available supervisors (not assigned)
  const filteredUsers = availableSupervisors.filter((user) =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()),
  );

  return (
    <>
      <Toaster position="top-right" />
      <div
        className="min-h-screen p-4 sm:p-6 md:p-8"
        style={{ background: "var(--supervisor-bg)" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div
            className="rounded-xl overflow-hidden mb-6"
            style={{
              background: "var(--supervisor-surface)",
              border: "1px solid var(--supervisor-border)",
              boxShadow: "var(--supervisor-shadow)",
            }}
          >
            <div
              className="px-6 py-6"
              style={{
                background: "var(--supervisor-header-bg)",
                borderBottom: "1px solid var(--supervisor-header-border)",
              }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--supervisor-muted)" }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex-1">
                  <h1
                    className="text-2xl font-bold flex items-center gap-3"
                    style={{ color: "var(--supervisor-title)" }}
                  >
                    <UserPlus
                      className="w-7 h-7"
                      style={{ color: "var(--supervisor-primary-bg)" }}
                    />
                    Map Supervisors
                  </h1>

                  {locationName && (
                    <p
                      className="text-sm mt-1 flex items-center gap-1"
                      style={{ color: "var(--supervisor-subtitle)" }}
                    >
                      <MapPin className="h-4 w-4" />
                      {locationName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Info Banner - Show if supervisors already assigned */}
          {assignedSupervisors.length > 0 && (
            <div
              className="rounded-lg p-4 mb-6 flex items-start gap-3"
              style={{
                background: "var(--supervisor-dropdown-hover)",
                border: "1px solid var(--supervisor-border)",
              }}
            >
              <AlertCircle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--supervisor-primary-bg)" }}
              />

              <div className="flex-1">
                <h3
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--supervisor-title)" }}
                >
                  {assignedSupervisors.length} supervisor(s) already assigned
                </h3>

                <p
                  className="text-xs"
                  style={{ color: "var(--supervisor-subtitle)" }}
                >
                  Only showing supervisors who haven&apos;t been assigned to this location yet.
                  {availableSupervisors.length === 0 &&
                    " All supervisors are already assigned!"}
                </p>
              </div>
            </div>

          )}

          {/* Form */}
          <div
            className="p-8 rounded-xl"
            style={{
              background: "var(--supervisor-surface)",
              border: "1px solid var(--supervisor-border)",
              boxShadow: "var(--supervisor-shadow)",
            }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Supervisors */}
              <div ref={userDropdownRef}>
                {/* Label */}
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--supervisor-text)" }}
                >
                  Select Supervisors ({selectedSupervisors.length} selected)
                </label>

                <div className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    disabled={availableSupervisors.length === 0}
                    className="w-full flex justify-between items-center text-left px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: "var(--supervisor-input-bg)",
                      border: "1px solid var(--supervisor-input-border)",
                      color: "var(--supervisor-text)",
                      opacity: availableSupervisors.length === 0 ? 0.6 : 1,
                      cursor:
                        availableSupervisors.length === 0 ? "not-allowed" : "pointer",
                    }}
                  >
                    <span>
                      {availableSupervisors.length === 0
                        ? "No supervisors available to assign"
                        : selectedSupervisors.length > 0
                          ? `${selectedSupervisors.length} supervisor(s) selected`
                          : "Click to select supervisors..."}
                    </span>

                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                      style={{ color: "var(--supervisor-muted)" }}
                    />
                  </button>

                  {/* Dropdown */}
                  {isUserDropdownOpen && availableSupervisors.length > 0 && (
                    <div
                      className="absolute z-20 w-full mt-2 rounded-lg shadow-xl max-h-72 flex flex-col"
                      style={{
                        background: "var(--supervisor-dropdown-bg)",
                        border: "1px solid var(--supervisor-dropdown-border)",
                      }}
                    >
                      {/* Search */}
                      <div
                        className="p-3"
                        style={{ borderBottom: "1px solid var(--supervisor-border)" }}
                      >
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "var(--supervisor-muted)" }}
                          />
                          <input
                            type="text"
                            placeholder="Search for a supervisor..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg focus:outline-none"
                            style={{
                              background: "var(--supervisor-input-bg)",
                              border: "1px solid var(--supervisor-input-border)",
                              color: "var(--supervisor-text)",
                            }}
                          />
                        </div>
                      </div>

                      {/* List */}
                      <div className="overflow-y-auto p-2">
                        {filteredUsers.length === 0 ? (
                          <div
                            className="p-4 text-center text-sm"
                            style={{ color: "var(--supervisor-muted)" }}
                          >
                            No supervisors found
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
                              style={{ color: "var(--supervisor-text)" }}
                              onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--supervisor-dropdown-hover)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "transparent")
                              }
                            >
                              <input
                                type="checkbox"
                                checked={selectedSupervisors.some(
                                  (s) => s.id === user.id,
                                )}
                                onChange={() => handleSupervisorSelect(user)}
                                className="h-4 w-4 rounded"
                                style={{ accentColor: "var(--supervisor-primary-bg)" }}
                              />

                              <div className="ml-3 flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{
                                    background: "var(--supervisor-dropdown-hover)",
                                    color: "var(--supervisor-primary-bg)",
                                  }}
                                >
                                  <User className="w-4 h-4" />
                                </div>

                                <div>
                                  <div className="text-sm font-medium">
                                    {user.name}
                                  </div>
                                  {user.phone && (
                                    <div
                                      className="text-xs"
                                      style={{ color: "var(--supervisor-muted)" }}
                                    >
                                      {user.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Supervisors */}
                {selectedSupervisors.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedSupervisors.map((supervisor) => (
                      <div
                        key={supervisor.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{
                          background: "var(--supervisor-dropdown-hover)",
                          color: "var(--supervisor-text)",
                        }}
                      >
                        <User className="w-3 h-3" />
                        <span>{supervisor.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSupervisor(supervisor.id)}
                          style={{ color: "var(--supervisor-muted)" }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Count */}
                <div
                  className="mt-2 text-xs"
                  style={{ color: "var(--supervisor-muted)" }}
                >
                  {availableSupervisors.length} supervisor(s) available to assign
                </div>
              </div>

              {/* Location Info */}
              <div
                className="rounded-lg p-4"
                style={{
                  background: "var(--supervisor-bg)",
                  border: "1px solid var(--supervisor-border)",
                }}
              >
                <div
                  className="flex items-center gap-2 text-sm mb-1"
                  style={{ color: "var(--supervisor-subtitle)" }}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Assigning to Location:</span>
                </div>

                <div
                  className="font-semibold"
                  style={{ color: "var(--supervisor-title)" }}
                >
                  {locationName || "Unknown Location"}
                </div>

                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--supervisor-muted)" }}
                >
                  Status will be set to:{" "}
                  <span
                    className="font-medium"
                    style={{ color: "var(--supervisor-status-active)" }}
                  >
                    Assigned
                  </span>
                </div>
              </div>


              {/* Submit Button */}
              <div
                className="pt-4"
                style={{ borderTop: "1px solid var(--supervisor-border)" }}
              >
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    selectedSupervisors.length === 0 ||
                    availableSupervisors.length === 0
                  }
                  className="w-full px-4 py-3 rounded-lg font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{
                    background: "var(--supervisor-primary-bg)",
                    color: "var(--supervisor-primary-text)",
                    boxShadow: "var(--supervisor-shadow)",
                    opacity:
                      isLoading ||
                        selectedSupervisors.length === 0 ||
                        availableSupervisors.length === 0
                        ? 0.6
                        : 1,
                    cursor:
                      isLoading ||
                        selectedSupervisors.length === 0 ||
                        availableSupervisors.length === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : availableSupervisors.length === 0 ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      All Supervisors Already Assigned
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create {selectedSupervisors.length} Assignment
                      {selectedSupervisors.length !== 1 ? "s" : ""}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
