"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { UsersApi } from "@/features/users/users.api";
import { LocationsApi } from "@/features/locations/locations.api";
import { AssignmentsApi } from "@/features/assignments/assignments.api";

import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";
import {
  User,
  MapPin,
  Search,
  ChevronDown,
  X,
  CheckSquare,
  Square,
  Users,
  AlertCircle,
  Loader,
  ArrowLeft,
  Check,
  Shield,
  LayoutGrid,
} from "lucide-react";

const AddAssignmentPage = () => {
  useRequirePermission(MODULES.ASSIGNMENTS);

  const { canAdd } = usePermissions();
  const canAddAssignment = canAdd(MODULES.ASSIGNMENTS);

  // --- STATE MANAGEMENT ---
  const [assignmentMode, setAssignmentMode] = useState("multi"); // 'multi' or 'single'
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [singleUser, setSingleUser] = useState("");

  const [allUsers, setAllUsers] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [userAssignedLocations, setUserAssignedLocations] = useState([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAssignments, setIsFetchingAssignments] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { user: loggedInUser } = useSelector((state) => state.auth);
  const { companyId } = useCompanyId();

  const userDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);
  const router = useRouter();

  // --- LOGIC ---
  const assignableUsers = allUsers.filter(
    (u) => u.role_id !== 1 && u.role_id !== 2,
  );

  const uniqueRoles = [
    ...new Set(assignableUsers.map((u) => u.role?.name).filter(Boolean)),
  ];

  // Aesthetic Pill Styles
  const getRoleStyle = (roleName) => {
    if (!roleName) return "bg-slate-100 text-slate-600 border-slate-200";
    const role = roleName.toLowerCase();
    switch (role) {
      case "supervisor":
        return "bg-cyan-50 text-cyan-600 border-cyan-100";
      case "cleaner":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "zonal admin":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "facility supervisor":
        return "bg-teal-50 text-teal-600 border-teal-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  // --- HELPER: SMART LABELS ---
  const getSelectedUsersLabel = () => {
    if (assignmentMode === "single") {
      if (!singleUser) return "Select a user...";
      return (
        assignableUsers.find((u) => u.id === singleUser)?.name || "Unknown User"
      );
    }
    // Multi mode logic
    if (selectedUsers.length === 0) return "Select staff members...";
    if (selectedUsers.length === 1) return selectedUsers[0].name;
    if (selectedUsers.length === 2)
      return `${selectedUsers[0].name}, ${selectedUsers[1].name}`;
    // Truncate for 3+
    return `${selectedUsers[0].name}, ${selectedUsers[1].name} + ${selectedUsers.length - 2} more`;
  };

  const getSelectedLocationsLabel = () => {
    if (selectedLocations.length === 0) return "Select locations...";
    if (selectedLocations.length === 1) return selectedLocations[0].name;
    if (selectedLocations.length === 2)
      return `${selectedLocations[0].name}, ${selectedLocations[1].name}`;
    return `${selectedLocations[0].name}, ${selectedLocations[1].name} + ${selectedLocations.length - 2} more`;
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!companyId) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userRes = await UsersApi.getAllUsers(companyId);
        const locationRes = await LocationsApi.getAllLocations(companyId);
        if (userRes.success) setAllUsers(userRes.data || []);
        if (locationRes.success) setAllLocations(locationRes.data || []);
      } catch (err) {
        console.error("❌ Error while fetching:", err);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [companyId]);

  useEffect(() => {
    if (assignmentMode === "single" && singleUser) {
      fetchUserAssignments(singleUser);
    } else {
      setAvailableLocations(allLocations);
    }
  }, [singleUser, assignmentMode, allLocations]);

  const fetchUserAssignments = async (userId) => {
    setIsFetchingAssignments(true);
    try {
      const response = await AssignmentsApi.getAssignmentsByCleanerId(
        userId,
        companyId,
      );
      if (response.success) {
        const assignedLocationIds = response.data.map((a) => a.location_id);
        setUserAssignedLocations(assignedLocationIds);
        const unassignedLocations = allLocations.filter(
          (loc) => !assignedLocationIds.includes(loc.id),
        );
        setAvailableLocations(unassignedLocations);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAvailableLocations(allLocations);
    } finally {
      setIsFetchingAssignments(false);
    }
  };

  // --- VALIDATION ---
  const validateAssignments = async () => {
    setIsValidating(true);
    const conflicts = [];
    try {
      const usersToCheck =
        assignmentMode === "multi"
          ? selectedUsers
          : [assignableUsers.find((u) => u.id === singleUser)];
      for (const user of usersToCheck) {
        if (!user) continue;
        const response = await AssignmentsApi.getAssignmentsByCleanerId(
          user.id,
          companyId,
        );
        if (response.success) {
          const assignedLocationIds = response.data.map((a) => a.location_id);
          const userConflicts = selectedLocations.filter((loc) =>
            assignedLocationIds.includes(loc.id),
          );
          if (userConflicts.length > 0) {
            conflicts.push({
              userName: user.name,
              locations: userConflicts.map((loc) => loc.name),
            });
          }
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
    return conflicts;
  };

  // --- DROPDOWNS ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      )
        setIsUserDropdownOpen(false);
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      )
        setIsLocationDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- HANDLERS ---

  // ✅ FIX: Aggressively reset all state on mode toggle to prevent "sticking"
  const handleModeToggle = (mode) => {
    setAssignmentMode(mode);
    setSelectedUsers([]);
    setSingleUser("");
    setSelectedLocations([]);
    setUserSearchTerm("");
    setLocationSearchTerm("");
    setSelectedRoleFilter("all");
    setIsUserDropdownOpen(false);
    setIsLocationDropdownOpen(false);
  };

  const handleUserSelect = (user) => {
    if (assignmentMode === "multi") {
      setSelectedUsers((prev) =>
        prev.some((u) => u.id === user.id)
          ? prev.filter((u) => u.id !== user.id)
          : [...prev, user],
      );
    } else {
      setSingleUser(user.id);
      setUserSearchTerm(""); // Clear search so filter resets visually
      setIsUserDropdownOpen(false);
      setSelectedLocations([]);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocations((prev) =>
      prev.some((loc) => loc.id === location.id)
        ? prev.filter((loc) => loc.id !== location.id)
        : [...prev, location],
    );
  };

  const handleSelectAllLocations = () => {
    const locationsToUse =
      assignmentMode === "single" ? availableLocations : allLocations;
    setSelectedLocations(
      selectedLocations.length === locationsToUse.length ? [] : locationsToUse,
    );
  };

  const handleSelectAllUsers = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length ? [] : filteredUsers,
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canAddAssignment) return toast.error("Permission denied");

    // Basic Validation
    if (
      assignmentMode === "multi" &&
      (selectedUsers.length === 0 || selectedLocations.length === 0)
    )
      return toast.error("Select at least one user and location.");
    if (
      assignmentMode === "single" &&
      (!singleUser || selectedLocations.length === 0)
    )
      return toast.error("Select a user and location.");

    // Conflict Check
    const conflicts = await validateAssignments();
    if (conflicts.length > 0) {
      toast.error(
        `Conflict: ${conflicts[0].userName} already assigned to selected locations.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      let successCount = 0;
      let failureCount = 0;

      if (assignmentMode === "multi") {
        const promises = selectedUsers.map(async (user) => {
          const response = await AssignmentsApi.createAssignment({
            cleaner_user_id: user.id,
            location_ids: selectedLocations.map((loc) => loc.id),
            status: "assigned",
            company_id: companyId,
            role_id: user.role_id,
          });
          response.success ? successCount++ : failureCount++;
        });
        await Promise.all(promises);
      } else {
        const selectedUserData = assignableUsers.find(
          (u) => u.id === singleUser,
        );
        const response = await AssignmentsApi.createAssignment({
          cleaner_user_id: singleUser,
          location_ids: selectedLocations.map((loc) => loc.id),
          status: "assigned",
          company_id: companyId,
          role_id: selectedUserData?.role_id,
        });
        response.success ? successCount++ : failureCount++;
      }

      if (successCount > 0) {
        toast.success(`Assignments created successfully!`);
        setTimeout(() => router.push(`/dashboard/cleaner-assignments`), 1000);
      } else {
        toast.error("Failed to create assignments.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- FILTERS ---
  const filteredUsers = assignableUsers.filter((user) => {
    const matchesSearch = user.name
      .toLowerCase()
      .includes(userSearchTerm.toLowerCase());
    const matchesRole =
      selectedRoleFilter === "all" ||
      user.role?.name?.toLowerCase() === selectedRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const filteredLocations = (
    assignmentMode === "single" ? availableLocations : allLocations
  ).filter((loc) =>
    loc.name.toLowerCase().includes(locationSearchTerm.toLowerCase()),
  );

  const locationsToShow =
    assignmentMode === "single" ? availableLocations : allLocations;
  const allLocationsSelected =
    selectedLocations.length === locationsToShow.length &&
    locationsToShow.length > 0;
  const allUsersSelected =
    selectedUsers.length === filteredUsers.length && filteredUsers.length > 0;

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8 pb-10 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
        </div>
        <div className="w-full">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Assignments
          </h1>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
          {/* 1. CONFIGURATION SECTION */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
              <Shield
                size={20}
                className="text-cyan-600 dark:text-cyan-400"
                strokeWidth={2.5}
              />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em] leading-none">
                Assignment Mode
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-80">
                Operational Configuration
              </p>
            </div>

            {/* Toggle Switch - Styled like previous forms */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => handleModeToggle("multi")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${assignmentMode === "multi" ? "bg-white shadow-sm text-cyan-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                Multi
              </button>
              <button
                type="button"
                onClick={() => handleModeToggle("single")}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${assignmentMode === "single" ? "bg-white shadow-sm text-cyan-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                Single
              </button>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="mb-8">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 block ml-1">
              Filter Roles
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedRoleFilter("all")}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedRoleFilter === "all" ? "bg-cyan-50 border-cyan-200 text-cyan-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
              >
                All Roles
              </button>
              {uniqueRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRoleFilter(role)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${selectedRoleFilter === role ? "bg-cyan-50 border-cyan-200 text-cyan-700" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* 2. SELECTION SECTION */}
          <div className="space-y-6">
            {/* User Select */}
            <div ref={userDropdownRef} className="relative">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 block ml-1">
                Select Staff{" "}
                <span className="text-cyan-500">
                  ({selectedUsers.length || (singleUser ? 1 : 0)})
                </span>
              </label>

              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-left flex items-center justify-between hover:border-cyan-400 focus:border-cyan-500 transition-all outline-none"
              >
                {/* ✅ SMART LABEL LOGIC HERE */}
                <span className="text-slate-600 font-medium truncate w-[90%]">
                  {getSelectedUsersLabel()}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isUserDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-80 flex flex-col">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search staff..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-400"
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {assignmentMode === "multi" && (
                    <button
                      type="button"
                      onClick={handleSelectAllUsers}
                      className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest p-3 hover:bg-cyan-50 text-left border-b border-slate-100"
                    >
                      {allUsersSelected ? "Deselect All" : "Select All Visible"}
                    </button>
                  )}

                  <div className="overflow-y-auto p-2 space-y-1">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => handleUserSelect(user)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                            (
                              assignmentMode === "multi"
                                ? selectedUsers.some((u) => u.id === user.id)
                                : singleUser === user.id
                            )
                              ? "bg-cyan-50 border border-cyan-100"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {assignmentMode === "multi" && (
                              <div
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedUsers.some((u) => u.id === user.id) ? "bg-cyan-500 border-cyan-500" : "border-slate-300 bg-white"}`}
                              >
                                {selectedUsers.some(
                                  (u) => u.id === user.id,
                                ) && (
                                  <Check className="w-3.5 h-3.5 text-white" />
                                )}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-700">
                                {user.name}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-1 rounded border ${getRoleStyle(user.role?.name)}`}
                          >
                            {user.role?.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wide">
                        No staff found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Location Select */}
            <div ref={locationDropdownRef} className="relative">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2 block ml-1">
                Select Locations{" "}
                <span className="text-cyan-500">
                  ({selectedLocations.length})
                </span>
              </label>

              <button
                type="button"
                disabled={assignmentMode === "single" && !singleUser}
                onClick={() =>
                  setIsLocationDropdownOpen(!isLocationDropdownOpen)
                }
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-left flex items-center justify-between hover:border-cyan-400 focus:border-cyan-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {/* ✅ SMART LABEL LOGIC HERE */}
                <span className="text-slate-600 font-medium truncate w-[90%]">
                  {assignmentMode === "single" && !singleUser
                    ? "Select a user first to load locations..."
                    : getSelectedLocationsLabel()}
                </span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {isLocationDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden max-h-80 flex flex-col">
                  <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search locations..."
                        className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-cyan-400"
                        value={locationSearchTerm}
                        onChange={(e) => setLocationSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllLocations}
                    className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest p-3 hover:bg-cyan-50 text-left border-b border-slate-100"
                  >
                    {allLocationsSelected
                      ? "Deselect All"
                      : "Select All Visible"}
                  </button>

                  <div className="overflow-y-auto p-2 space-y-1">
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((loc) => (
                        <div
                          key={loc.id}
                          onClick={() => handleLocationSelect(loc)}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                            selectedLocations.some((l) => l.id === loc.id)
                              ? "bg-cyan-50 border border-cyan-100"
                              : "hover:bg-slate-50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedLocations.some((l) => l.id === loc.id) ? "bg-cyan-500 border-cyan-500" : "border-slate-300 bg-white"}`}
                            >
                              {selectedLocations.some(
                                (l) => l.id === loc.id,
                              ) && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-700">
                                {loc.name}
                              </p>
                              <p className="text-[10px] font-medium text-slate-400 truncate max-w-[200px]">
                                {loc.address || "No Address"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs font-medium text-slate-400 uppercase tracking-wide">
                        No locations found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="flex flex-wrap justify-end items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-8 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              isValidating ||
              !canAddAssignment ||
              (assignmentMode === "multi"
                ? !selectedUsers.length || !selectedLocations.length
                : !singleUser || !selectedLocations.length)
            }
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isValidating ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Validating...
              </>
            ) : isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                {assignmentMode === "multi"
                  ? `Create ${selectedUsers.length * selectedLocations.length} Assignments`
                  : `Assign ${selectedLocations.length} Locations`}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddAssignmentPage;
