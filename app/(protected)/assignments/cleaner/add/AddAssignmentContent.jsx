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
    <>
      <Toaster position="top-right" />
      <div
        className="min-h-screen p-4 sm:p-6 md:p-8"
        style={{ background: "var(--cleaner-bg)" }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div
            className="rounded-xl overflow-hidden mb-6"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            <div
              className="px-6 py-6"
              style={{
                background: "var(--cleaner-primary-bg)",
              }}
            >
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: "var(--cleaner-primary-text)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.opacity = "0.85")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.opacity = "1")
                  }
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div className="flex-1">
                  <h1
                    className="text-2xl font-bold flex items-center gap-3"
                    style={{ color: "var(--cleaner-primary-text)" }}
                  >
                    <UserPlus className="w-7 h-7" />
                    Map Cleaners
                  </h1>

                  {locationName && (
                    <p
                      className="text-sm mt-1 flex items-center gap-1"
                      style={{
                        color: "var(--cleaner-primary-text)",
                        opacity: 0.85,
                      }}
                    >
                      <MapPin className="h-4 w-4" />
                      {locationName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info Banner - Show if cleaners already assigned */}
          {assignedCleaners.length > 0 && (
            <div
              className="rounded-lg p-4 mb-6 flex items-start gap-3"
              style={{
                background: "var(--assignment-warning-bg)",
                border: "1px solid var(--assignment-warning-border)",
              }}
            >
              <AlertCircle
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: "var(--assignment-warning-text)" }}
              />

              <div className="flex-1">
                <h3
                  className="text-sm font-semibold mb-1"
                  style={{ color: "var(--assignment-warning-text)" }}
                >
                  {assignedCleaners.length} cleaner(s) already assigned
                </h3>

                <p
                  className="text-xs"
                  style={{ color: "var(--assignment-warning-text)" }}
                >
                  Only showing cleaners who haven&apos;t been assigned to this location yet.
                  {availableCleaners.length === 0 &&
                    " All cleaners are already assigned!"}
                </p>
              </div>
            </div>

          )}

          {/* Form */}
          <div
            className="p-8 rounded-xl"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Select Cleaners */}
              <div ref={userDropdownRef}>
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  Select Cleaners ({selectedCleaners.length} selected)
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    disabled={availableCleaners.length === 0}
                    className="w-full flex justify-between items-center text-left px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: "var(--cleaner-input-bg)",
                      border: "1px solid var(--cleaner-border)",
                      color: "var(--cleaner-text)",
                      opacity: availableCleaners.length === 0 ? 0.6 : 1,
                    }}
                  >
                    <span>
                      {availableCleaners.length === 0
                        ? "No cleaners available to assign"
                        : selectedCleaners.length > 0
                          ? `${selectedCleaners.length} cleaner(s) selected`
                          : "Click to select cleaners..."}
                    </span>

                    <ChevronDown
                      className="w-5 h-5 transition-transform"
                      style={{ color: "var(--muted-foreground)" }}
                    />
                  </button>

                  {isUserDropdownOpen && availableCleaners.length > 0 && (
                    <div
                      className="absolute z-20 w-full mt-2 rounded-lg max-h-72 flex flex-col"
                      style={{
                        background: "var(--cleaner-surface)",
                        border: "1px solid var(--cleaner-border)",
                        boxShadow: "var(--cleaner-shadow)",
                      }}
                    >
                      {/* Search */}
                      <div
                        className="p-3"
                        style={{ borderBottom: "1px solid var(--cleaner-border)" }}
                      >
                        <div className="relative">
                          <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                            style={{ color: "var(--muted-foreground)" }}
                          />
                          <input
                            type="text"
                            placeholder="Search for a cleaner..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
                            style={{
                              background: "var(--cleaner-input-bg)",
                              border: "1px solid var(--cleaner-border)",
                              color: "var(--cleaner-text)",
                            }}
                          />
                        </div>
                      </div>

                      {/* List */}
                      <div className="overflow-y-auto p-2">
                        {filteredUsers.length === 0 ? (
                          <div
                            className="p-4 text-center text-sm"
                            style={{ color: "var(--muted-foreground)" }}
                          >
                            No cleaners found
                          </div>
                        ) : (
                          filteredUsers.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center p-3 rounded-lg cursor-pointer transition-colors"
                              onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--assignment-accent-bg)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background = "transparent")
                              }
                            >
                              <input
                                type="checkbox"
                                checked={selectedCleaners.some(
                                  (c) => c.id === user.id,
                                )}
                                onChange={() => handleCleanerSelect(user)}
                                className="h-4 w-4 rounded"
                                style={{
                                  accentColor: "var(--assignment-accent-text)",
                                }}
                              />

                              <div className="ml-3 flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{
                                    background: "var(--assignment-accent-bg)",
                                    color: "var(--assignment-accent-text)",
                                  }}
                                >
                                  <User className="w-4 h-4" />
                                </div>

                                <div>
                                  <div
                                    className="text-sm font-medium"
                                    style={{ color: "var(--cleaner-title)" }}
                                  >
                                    {user.name}
                                  </div>
                                  {user.phone && (
                                    <div
                                      className="text-xs"
                                      style={{ color: "var(--muted-foreground)" }}
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

                {/* Selected Cleaners Chips */}
                {selectedCleaners.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCleaners.map((cleaner) => (
                      <div
                        key={cleaner.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium"
                        style={{
                          background: "var(--assignment-chip-bg)",
                          border: "1px solid var(--assignment-chip-border)",
                          color: "var(--assignment-chip-text)",
                        }}
                      >
                        <User className="w-3 h-3" />
                        <span>{cleaner.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCleaner(cleaner.id)}
                          style={{ opacity: 0.8 }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Available count */}
                <div
                  className="mt-2 text-xs"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  {availableCleaners.length} cleaner(s) available to assign
                </div>
              </div>

              {/* Location Info */}
              <div
                className="rounded-lg p-4"
                style={{
                  background: "var(--cleaner-muted-bg)",
                  border: "1px solid var(--cleaner-border)",
                }}
              >
                <div
                  className="flex items-center gap-2 text-sm mb-1"
                  style={{ color: "var(--cleaner-subtitle)" }}
                >
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Assigning to Location:</span>
                </div>

                <div
                  className="font-semibold"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  {locationName || "Unknown Location"}
                </div>

                <div
                  className="text-xs mt-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Status will be set to:{" "}
                  <span
                    className="font-medium"
                    style={{ color: "var(--assignment-accent-text)" }}
                  >
                    Assigned
                  </span>
                </div>
              </div>


              {/* Submit Button */}
              <div
                className="pt-4"
                style={{ borderTop: "1px solid var(--cleaner-border)" }}
              >
                <button
                  type="submit"
                  disabled={
                    isLoading ||
                    selectedCleaners.length === 0 ||
                    availableCleaners.length === 0
                  }
                  className="w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: "var(--cleaner-primary-bg)",
                    color: "var(--cleaner-primary-text)",
                    opacity:
                      isLoading ||
                        selectedCleaners.length === 0 ||
                        availableCleaners.length === 0
                        ? 0.6
                        : 1,
                    cursor:
                      isLoading ||
                        selectedCleaners.length === 0 ||
                        availableCleaners.length === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.filter = "brightness(0.95)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.filter = "none")
                  }
                >
                  {isLoading ? (
                    <>
                      <div
                        className="w-5 h-5 rounded-full animate-spin"
                        style={{
                          border: "2px solid var(--cleaner-primary-text)",
                          borderTopColor: "transparent",
                        }}
                      />
                      Processing...
                    </>
                  ) : availableCleaners.length === 0 ? (
                    <>
                      <AlertCircle className="w-5 h-5" />
                      All Cleaners Already Assigned
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Create {selectedCleaners.length} Assignment
                      {selectedCleaners.length !== 1 ? "s" : ""}
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
