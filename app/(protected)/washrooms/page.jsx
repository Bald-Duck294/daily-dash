"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MapPin,
  Navigation,
  Search,
  X,
  Plus,
  AlertTriangle,
  Power,
  PowerOff,
  Users,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  CheckCircle2,
  XCircle,
  EllipsisVertical,
} from "lucide-react";
import LocationsApi from "@/features/locations/locations.api";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
import LocationActionsMenu from "./components/LocationActionsMenu";
import { useSelector } from "react-redux";
import locationTypesApi from "@/features/locationTypes/locationTypes.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

function WashroomsPage() {
  // State Management (Preserved)
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [nameSortOrder, setNameSortOrder] = useState(null);
  const [currentScoreSortOrder, setCurrentScoreSortOrder] = useState(null);
  const [avgScoreSortOrder, setAvgScoreSortOrder] = useState(null);
  const [statusSortOrder, setStatusSortOrder] = useState(null);

  const [deleteModal, setDeleteModal] = useState({
    open: false,
    location: null,
  });
  const [actionsMenuOpen, setActionsMenuOpen] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const { companyId } = useCompanyId();
  const actionsMenuRef = useRef(null);
  const [statusModal, setStatusModal] = useState({
    open: false,
    location: null,
  });
  const [locationTypes, setLocationTypes] = useState([]);
  const [selectedLocationTypeId, setSelectedLocationTypeId] = useState("");
  const [facilityCompanyId, setFacilityCompanyId] = useState("");
  const [facilityCompanyName, setFacilityCompanyName] = useState("");
  const [facilityCompanies, setFacilityCompanies] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [cleanerModal, setCleanerModal] = useState({
    open: false,
    location: null,
  });

  const router = useRouter();

  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;

  useRequirePermission(MODULES.LOCATIONS);
  const { canAdd, canUpdate, canDelete, hasPermission } = usePermissions();

  const canAddLocation = canAdd(MODULES.LOCATIONS);
  const canEditLocation = canUpdate(MODULES.LOCATIONS);
  const canDeleteLocation = canDelete(MODULES.LOCATIONS);
  const canToggleStatus = hasPermission(MODULES.LOCATIONS, "toggle_status");
  const canAssignCleaner = canAdd(MODULES.ASSIGNMENTS);

  // console.log(facilityCompanyId, "facility company id selected");
  // console.log(typeof facilityCompanyId, "fac type");
  // --- Helpers & Logic ---

  const handleSort = (column) => {
    // Reset all other sorts
    setNameSortOrder(null);
    setCurrentScoreSortOrder(null);
    setAvgScoreSortOrder(null);
    setStatusSortOrder(null);

    switch (column) {
      case "name":
        const newNameOrder = nameSortOrder === "asc" ? "desc" : "asc";
        setNameSortOrder(newNameOrder);
        setSortBy(newNameOrder === "asc" ? "nameAsc" : "nameDesc");
        break;
      case "currentScore":
        const newCurrentScoreOrder =
          currentScoreSortOrder === "desc" ? "asc" : "desc";
        setCurrentScoreSortOrder(newCurrentScoreOrder);
        setSortBy(
          newCurrentScoreOrder === "desc"
            ? "currentScoreDesc"
            : "currentScoreAsc",
        );
        break;
      case "avgScore":
        const newAvgScoreOrder = avgScoreSortOrder === "desc" ? "asc" : "desc";
        setAvgScoreSortOrder(newAvgScoreOrder);
        setSortBy(newAvgScoreOrder === "desc" ? "avgScoreDesc" : "avgScoreAsc");
        break;
      case "status":
        const newStatusOrder =
          statusSortOrder === "active" ? "inactive" : "active";
        setStatusSortOrder(newStatusOrder);
        setSortBy(
          newStatusOrder === "active" ? "statusActive" : "statusInactive",
        );
        break;
    }
  };

  const renderSortIcon = (currentOrder) => {
    if (!currentOrder) {
      return (
        <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
      );
    }
    if (currentOrder === "asc" || currentOrder === "active") {
      return <ArrowUp className="w-3 h-3 text-orange-500" />;
    }
    return <ArrowDown className="w-3 h-3 text-orange-500" />;
  };

  // --- Effects (API Calls) ---

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sortByParam = searchParams.get("sortBy");
    const facilityCompanyIdParam = searchParams.get("facilityCompanyId");
    const facilityCompanyNameParam = searchParams.get("facilityCompanyName");

    if (sortByParam === "currentScore") {
      setSortBy("currentScoreDesc");
      setCurrentScoreSortOrder("desc");
    }

    if (facilityCompanyIdParam) {
      setFacilityCompanyId(facilityCompanyIdParam);
      if (facilityCompanyNameParam) {
        setFacilityCompanyName(decodeURIComponent(facilityCompanyNameParam));
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionsMenuRef.current &&
        !actionsMenuRef.current.contains(event.target)
      ) {
        setActionsMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocationTypes = async () => {
      try {
        const response = await locationTypesApi.getAll(companyId);
        setLocationTypes(response);
      } catch (error) {
        console.error("Error fetching location types:", error);
      }
    };

    const fetchFacilityCompanies = async () => {
      try {
        const response = await FacilityCompanyApi.getAll(companyId);
        if (response.success) {
          setFacilityCompanies(response.data);
        }
      } catch (error) {
        console.error("Error fetching facility companies:", error);
      }
    };

    if (companyId && companyId !== "null" && companyId !== null) {
      fetchLocationTypes();
      fetchFacilityCompanies();
    }
  }, [companyId]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await LocationsApi.getAllLocations(companyId, true);
      setList(response.data);
    } catch (error) {
      console.error("Error fetching list:", error);
      toast.error("Failed to fetch washrooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId || companyId === "null" || companyId === null) {
      setLoading(false);
      return;
    }
    fetchList();
  }, [companyId]);

  useEffect(() => {
    let filtered = [...list];

    if (selectedLocationTypeId) {
      filtered = filtered.filter(
        (item) => String(item.type_id) === String(selectedLocationTypeId),
      );
    }
    if (facilityCompanyId) {
      console.log(facilityCompanyId, "id of facility");
      filtered = filtered.filter(
        (item) =>
          String(item.facility_company_id) === String(facilityCompanyId),
      );
    }
    if (assignmentFilter === "assigned") {
      filtered = filtered.filter(
        (item) =>
          item.cleaner_assignments && item.cleaner_assignments.length > 0,
      );
    } else if (assignmentFilter === "unassigned") {
      filtered = filtered.filter(
        (item) =>
          !item.cleaner_assignments || item.cleaner_assignments.length === 0,
      );
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(query),
      );
    }
    if (minRating) {
      filtered = filtered.filter(
        (item) =>
          item.averageRating !== null &&
          parseFloat(item.averageRating) >= parseFloat(minRating),
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "currentScoreDesc":
          return (b.currentScore || 0) - (a.currentScore || 0);
        case "currentScoreAsc":
          return (a.currentScore || 0) - (b.currentScore || 0);
        case "avgScoreDesc":
          return (b.averageRating || 0) - (a.averageRating || 0);
        case "avgScoreAsc":
          return (a.averageRating || 0) - (b.averageRating || 0);
        case "nameAsc":
          return a.name.localeCompare(b.name);
        case "nameDesc":
          return b.name.localeCompare(a.name);
        case "statusActive":
          const aStatus = a.status === true || a.status === null ? 1 : 0;
          const bStatus = b.status === true || b.status === null ? 1 : 0;
          return bStatus - aStatus;
        case "statusInactive":
          const aStatusI = a.status === true || a.status === null ? 0 : 1;
          const bStatusI = b.status === true || b.status === null ? 0 : 1;
          return bStatusI - aStatusI;
        case "asc":
          return new Date(a.created_at) - new Date(b.created_at);
        case "desc":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredList(filtered);
  }, [
    searchQuery,
    minRating,
    sortBy,
    list,
    facilityCompanyId,
    selectedLocationTypeId,
    assignmentFilter,
  ]);

  // --- Handlers ---

  const renderRating = (rating, reviewCount = 0) => {
    if (!rating) {
      return <span className="text-sm text-slate-400">—</span>;
    }

    const smartRound = (rating) => {
      const rounded = Math.round(rating * 10) / 10;
      return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    };

    const { color, bg, label } = getRatingColor(rating);

    return (
      <div
        className={`inline-flex flex-col items-center gap-0.5 px-3 py-1.5 ${bg} rounded-lg`}
      >
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-base ${color}`}>
            {smartRound(rating)}
          </span>
          <span className={`text-xs font-medium ${color}`}>{label}</span>
        </div>
        {reviewCount > 0 && (
          <span className="text-xs text-slate-500">
            {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
          </span>
        )}
      </div>
    );
  };
  const getRatingColor = (rating) => {
    const actualRating = rating || 0;
    if (actualRating >= 7.5)
      return {
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        label: "Amazing",
      };
    if (actualRating >= 5)
      return { color: "text-orange-600", bg: "bg-orange-50", label: "Great" };
    if (actualRating >= 3)
      return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Okay" };
    if (actualRating >= 2)
      return { color: "text-red-600", bg: "bg-orange-50", label: "Poor" };
    if (actualRating > 0)
      return { color: "text-red-600", bg: "bg-red-50", label: "Terrible" };
    return { color: "text-slate-500", bg: "bg-slate-100", label: "No rating" };
  };
  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handleView = (id) => {
    router.push(`/washrooms/item/${id}?companyId=${companyId}`);
  };

  const handleAddToilet = () =>
    router.push(`/washrooms/add-location?companyId=${companyId}`);
  const handleAssignWashroom = () =>
    router.push(`/userMapping/add?companyId=${companyId}`);

  const confirmStatusToggle = async () => {
    if (!statusModal.location) return;
    const location = statusModal.location;
    setTogglingStatus(location.id);
    try {
      const response = await LocationsApi.toggleStautsLocations(location.id);
      if (response.success) {
        let newStatus = null;
        if (response.data?.data?.status !== undefined)
          newStatus = response.data.data.status;
        else if (response.data?.status !== undefined)
          newStatus = response.data.status;
        else
          newStatus = !(location.status === true || location.status === null);

        toast.success(
          `Washroom ${newStatus ? "enabled" : "disabled"} successfully`,
        );
        setList((prevList) =>
          prevList.map((item) =>
            item.id === location.id ? { ...item, status: newStatus } : item,
          ),
        );
        setStatusModal({ open: false, location: null });
      } else {
        toast.error(response.error || "Failed to toggle status");
      }
    } catch (error) {
      console.error("Toggle status error:", error);
      toast.error("Failed to toggle status");
    } finally {
      setTogglingStatus(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.location) return;
    const locationId = deleteModal.location.id;
    const locationName = deleteModal.location.name;
    setDeleting(true);
    try {
      const response = await LocationsApi.deleteLocation(
        locationId,
        companyId,
        true,
      );
      if (response && response.success) {
        toast.success(`"${locationName}" deleted successfully`);
        setList((prevList) =>
          prevList.filter((item) => item.id !== locationId),
        );
        setDeleteModal({ open: false, location: null });
      } else {
        toast.error(response.error || "Failed to delete washroom");
      }
    } catch (error) {
      console.error("Exception during delete:", error);
      toast.error("Failed to delete washroom");
    } finally {
      setDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setMinRating("");
    setFacilityCompanyId("");
    setFacilityCompanyName("");
    setSelectedLocationTypeId("");
    setAssignmentFilter("");
    setSortBy("desc");
    setNameSortOrder(null);
    setCurrentScoreSortOrder(null);
    setAvgScoreSortOrder(null);
    setStatusSortOrder(null);
  };

  // --- Render Helpers ---

  // Cleaner Badge Rendering
  const renderCleanerBadge = (locationName, cleaners) => {
    if (!cleaners || cleaners.length === 0) {
      return <span className="text-xs text-slate-300 italic">Unassigned</span>;
    }
    const firstName = cleaners[0].cleaner_user?.name || "Cleaner";
    return (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span className="text-sm text-slate-700 font-medium truncate max-w-[100px]">
          {firstName}
        </span>
        {cleaners.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCleanerModal({
                open: true,
                location: { name: locationName, cleaners },
              });
            }}
            className="text-xs text-blue-600 font-bold hover:underline"
          >
            +{cleaners.length - 1}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen px-4 bg-slate-50">
        <Loader size="large" color="#FFAB2D" message="Loading washrooms..." />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      {/* Main Container */}
      <div
        className="min-h-screen bg-[#F8F9FA] p-6 font-sans 
       max-[786px]:flex
    max-[786px]:items-center
    max-[786px]:justify-center
    max-[786px]:mx-auto
      "
      >
        <div className="max-w-[1600px] mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Left: Icon + Title */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm shrink-0">
                  <MapPin className="text-slate-800 w-6 h-6" />
                </div>

                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 tracking-tight leading-tight">
                    WASHROOM LOCATIONS
                  </h1>
                  <p className="text-slate-400 text-xs sm:text-sm font-medium uppercase tracking-wider mt-1">
                    Overview of details, assignments, and facility ratings
                  </p>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                {canAddLocation && (
                  <button
                    onClick={handleAddToilet}
                    className="w-full sm:w-auto justify-center bg-[#FFAB2D] hover:bg-[#f39c12] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm uppercase tracking-wide"
                  >
                    <Plus strokeWidth={3} className="w-4 h-4" />
                    Add Location
                  </button>
                )}

                {canAssignCleaner && (
                  <button
                    onClick={handleAssignWashroom}
                    className="w-full sm:w-auto justify-center bg-[#FFAB2D] hover:bg-[#f39c12] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm uppercase tracking-wide"
                  >
                    Assign
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="bg-white rounded-2xl p-2 md:p-3 shadow-sm border border-slate-100 mb-6 flex flex-col xl:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full xl:w-auto min-w-[300px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search facility name or ID..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 focus:ring-2 focus:ring-orange-200 focus:border-orange-400 outline-none transition-all placeholder:text-slate-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
              {/* Dropdowns */}
              <select
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer min-w-[120px]"
                value={selectedLocationTypeId}
                onChange={(e) => setSelectedLocationTypeId(e.target.value)}
              >
                <option value="">Types: All</option>
                {locationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer min-w-[140px]"
                value={facilityCompanyId}
                onChange={(e) => {
                  // console.log(e.target.value, "e.target.value 1");
                  // console.log(typeof e.target.value, "e.target.value");
                  setFacilityCompanyId(e.target.value);
                  const selected = facilityCompanies.find(
                    (fc) => fc.id === e.target.value,
                  );
                  setFacilityCompanyName(selected?.name || "");
                }}
              >
                <option value="">Facility Company: All</option>
                {facilityCompanies.map((fc) => (
                  <option key={fc.id} value={fc.id}>
                    {fc.name}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 outline-none cursor-pointer"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Rating: All</option>
                <option value="2">2+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="8">8+ Stars</option>
              </select>

              {/* Toggle Buttons */}
              <div className="bg-slate-50 p-1 rounded-xl border border-slate-100 flex items-center">
                <button
                  onClick={() => setAssignmentFilter("")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${assignmentFilter === "" ? "bg-white text-blue-500 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setAssignmentFilter("assigned")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 uppercase tracking-wider ${assignmentFilter === "assigned" ? "bg-white text-blue-500 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
                >
                  <CheckCircle2 size={12} /> Assigned
                </button>
                {(searchQuery ||
                  minRating ||
                  facilityCompanyId ||
                  selectedLocationTypeId ||
                  assignmentFilter) && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-1 p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hidden lg:block">
            {/* Grid Header - FIXED WIDTHS to prevent scroll */}
            <div className="grid grid-cols-[60px_2fr_1.2fr_100px_100px_1.5fr_1fr_120px_90px] gap-2 px-6 py-4 bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-widest items-center">
              <div className="text-center text-blue-500">#</div>

              <button
                onClick={() => handleSort("name")}
                className="text-left flex items-center gap-1 hover:text-blue-600 group"
              >
                WASHROOM NAME {renderSortIcon(nameSortOrder)}
              </button>

              <div className="flex items-center gap-1">
                <MapPin size={12} /> ZONE
              </div>

              <button
                onClick={() => handleSort("currentScore")}
                className="text-center flex items-center justify-center gap-1 hover:text-blue-600 group"
              >
                CURRENT SCORE {renderSortIcon(currentScoreSortOrder)}
              </button>

              <button
                onClick={() => handleSort("avgScore")}
                className="text-center flex items-center justify-center gap-1 hover:text-blue-600 group"
              >
                AVERAGE RATING {renderSortIcon(avgScoreSortOrder)}
              </button>

              <div className="flex items-center gap-1">
                <Users size={12} /> CLEANER
              </div>

              <div className="flex items-center gap-1">FACILITY</div>

              <button
                onClick={() => handleSort("status")}
                className="text-center flex items-center justify-center gap-1 hover:text-blue-600 group"
              >
                STATUS {renderSortIcon(statusSortOrder)}
              </button>

              <div className="text-right">ACTION</div>
            </div>

            {/* Grid Body */}
            <div className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700">
                    No washrooms found
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                filteredList.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleView(item.id)}
                    className="grid grid-cols-[60px_2fr_1.2fr_100px_100px_1.5fr_1fr_120px_90px] gap-2 px-6 py-4 items-center hover:bg-blue-50/30 transition-colors cursor-pointer group border-l-4 border-l-transparent hover:border-l-blue-500"
                  >
                    {/* Rank */}
                    <div className="flex justify-center">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-100 text-blue-600 text-xs font-bold rounded-lg group-hover:bg-white group-hover:shadow-sm">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Name */}
                    <div className="min-w-0 pr-2">
                      <p className="font-bold text-slate-700 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        ID: {item.id} •{" "}
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Zone */}
                    <div className="min-w-0">
                      <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide truncate max-w-full">
                        {item.location_types?.name || "N/A"}
                      </span>
                    </div>

                    {/* Current Score */}
                    <div className="flex justify-center">
                      <span className="px-4 py-1.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold">
                        {item.currentScore
                          ? Math.round(item.currentScore * 10) / 10
                          : "-"}
                      </span>
                    </div>

                    {/* Rating */}
                    <div className="flex justify-center items-center gap-1.5">
                      <Star
                        size={14}
                        className="text-orange-400 fill-orange-400"
                      />
                      <span className="text-sm font-bold text-slate-700">
                        {item.averageRating || "0.0"}
                      </span>
                    </div>

                    {/* Cleaner */}
                    <div className="min-w-0">
                      {renderCleanerBadge(item.name, item.cleaner_assignments)}
                    </div>

                    {/* Facility */}
                    <div className="min-w-0">
                      <span className="text-xs font-medium text-slate-500 truncate block">
                        {item.facility_companies?.name || "N/A"}
                      </span>
                    </div>

                    {/* Status */}
                    <div
                      className="flex justify-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {canToggleStatus && (
                        <button
                          onClick={() =>
                            setStatusModal({ open: true, location: item })
                          }
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                            item.status === true || item.status === null
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
                              : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
                          }`}
                        >
                          {item.status === true || item.status === null ? (
                            <>
                              <div className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                              </div>
                              Active
                            </>
                          ) : (
                            <>
                              <div className="h-2 w-2 rounded-full bg-red-500"></div>
                              Inactive
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Action */}
                    <div
                      className="flex justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          handleViewLocation(item.latitude, item.longitude)
                        }
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Navigation size={16} />
                      </button>
                      <div
                        className="relative"
                        ref={
                          actionsMenuOpen === item.id ? actionsMenuRef : null
                        }
                      >
                        <button
                          onClick={() =>
                            setActionsMenuOpen(
                              actionsMenuOpen === item.id ? null : item.id,
                            )
                          }
                          className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {actionsMenuOpen === item.id && (
                          <LocationActionsMenu
                            item={item}
                            location_id={item.id}
                            onClose={() => setActionsMenuOpen(null)}
                            onDelete={(location) =>
                              setDeleteModal({ open: true, location })
                            }
                            canDeleteLocation={canDeleteLocation}
                            canEditLocation={canEditLocation}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Showing {filteredList.length} washroom records
            </div>
          </div>

          {/* Mobile Card View (Keep for responsiveness) */}
          <div className="lg:hidden">
            {filteredList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">
                  No washrooms found
                </h3>
                <p className="text-sm text-slate-500">
                  Try adjusting your search filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredList.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleView(item.id)}
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-slate-700 text-white rounded flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-800 text-sm truncate">
                            {item.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-1 flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setStatusModal({ open: true, location: item })
                          }
                          className={`p-1.5 rounded transition-all ${
                            item.status === true || item.status === null
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {item.status === true || item.status === null ? (
                            <Power className="w-4 h-4" />
                          ) : (
                            <PowerOff className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleViewLocation(item.latitude, item.longitude)
                          }
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Navigation className="h-4 w-4" />
                        </button>
                        <div
                          className="relative"
                          ref={
                            actionsMenuOpen === item.id ? actionsMenuRef : null
                          }
                        >
                          <button
                            onClick={() =>
                              setActionsMenuOpen(
                                actionsMenuOpen === item.id ? null : item.id,
                              )
                            }
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </button>
                          {actionsMenuOpen === item.id && (
                            <LocationActionsMenu
                              item={item}
                              onClose={() => setActionsMenuOpen(null)}
                              onDelete={(location) =>
                                setDeleteModal({ open: true, location })
                              }
                              onEdit={(locationId) =>
                                router.push(`/locations/${locationId}/edit`)
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                          Zone
                        </label>
                        {item?.location_types?.name ? (
                          <span className="inline-flex items-center text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md font-medium">
                            {item.location_types.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Current Score
                          </label>
                          {renderRating(item.currentScore, 0)}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">
                            Average Rating
                          </label>
                          {renderRating(item.averageRating, item.ratingCount)}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                          Cleaner
                        </label>
                        {renderCleanerBadge(
                          item.name,
                          item.cleaner_assignments,
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">
                          Facility Company
                        </label>
                        {item.facility_companies?.name ? (
                          <span className="text-sm text-slate-700 font-medium">
                            {item.facility_companies.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* --- MODALS (Re-styled but logic preserved) --- */}

          {cleanerModal.open && (
            // console.log("cleaner modal", cleanerModal),
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setCleanerModal({ open: false, location: null })}
            >
              <div
                className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-y-scroll p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    {cleanerModal.location?.name} - Assigned Cleaners
                  </h3>
                  <button
                    onClick={() =>
                      setCleanerModal({ open: false, location: null })
                    }
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {cleanerModal.location?.cleaners?.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">
                          {assignment.cleaner_user?.name || "Unknown"}
                        </p>
                        {assignment.cleaner_user?.phone && (
                          <p className="text-xs text-slate-500">
                            {assignment.cleaner_user.phone}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${assignment.status === "assigned" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {assignment.status || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {statusModal.open && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`p-3 rounded-full ${statusModal.location?.status === true || statusModal.location?.status === null ? "bg-red-100" : "bg-green-100"}`}
                  >
                    {statusModal.location?.status === true ||
                    statusModal.location?.status === null ? (
                      <PowerOff className="h-6 w-6 text-red-600" />
                    ) : (
                      <Power className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {statusModal.location?.status === true ||
                      statusModal.location?.status === null
                        ? "Disable"
                        : "Enable"}{" "}
                      Washroom
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Confirm status change
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-slate-700">
                    Are you sure you want to{" "}
                    {statusModal.location?.status === true ||
                    statusModal.location?.status === null
                      ? "disable"
                      : "enable"}
                    <strong> "{statusModal.location?.name}"</strong>?
                  </p>

                  {(statusModal.location?.status === true ||
                    statusModal.location?.status === null) && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-3 rounded-md border border-red-200">
                      ⚠️ Disabling this washroom will automatically{" "}
                      <strong>unassign all cleaners</strong> currently assigned
                      to it.
                      <br />
                      They will need to be <strong>
                        manually re-assigned
                      </strong>{" "}
                      when the washroom is enabled again.
                    </p>
                  )}

                  {statusModal.location?.status === false && (
                    <p className="text-sm text-blue-700 mt-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                      ℹ️ Enabling this washroom will{" "}
                      <strong>not automatically assign cleaners</strong>.
                      <br />
                      Please assign cleaners manually after activation.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setStatusModal({ open: false, location: null })
                    }
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusToggle}
                    disabled={togglingStatus === statusModal.location?.id}
                    className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${statusModal.location?.status === true || statusModal.location?.status === null ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    {togglingStatus === statusModal.location?.id && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {togglingStatus === statusModal.location?.id
                      ? "Processing..."
                      : statusModal.location?.status === true ||
                          statusModal.location?.status === null
                        ? "Disable"
                        : "Enable"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteModal.open && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Delete Washroom
                    </h3>
                    <p className="text-slate-600 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-slate-700">
                    Are you sure you want to delete "
                    <strong>{deleteModal.location?.name}</strong>"?
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setDeleteModal({ open: false, location: null })
                    }
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {deleting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default WashroomsPage;
