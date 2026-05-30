// /* eslint-disable react-hooks/set-state-in-effect */
// "use client";

// import React, { useEffect, useState, useRef, useMemo } from "react";
// import {
//   MapPin,
//   Navigation,
//   Search,
//   X,
//   Plus,
//   AlertTriangle,
//   Power,
//   PowerOff,
//   Users,
//   MoreVertical,
//   ArrowUpDown,
//   ArrowUp,
//   ArrowDown,
//   Star,
//   CheckCircle2,
//   XCircle,
//   Grid3x3,
//   List,
// } from "lucide-react";
// import { useRouter } from "next/navigation";
// import Loader from "@/components/ui/Loader";
// import toast, { Toaster } from "react-hot-toast";
// import LocationActionsMenu from "./components/LocationActionsMenu";
// import { useSelector } from "react-redux";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { MODULES } from "@/shared/constants/permissions";

// // ✅ Import TanStack Query Hooks
// import {
//   useGetAllLocations,
//   useDeleteLocation,
//   useToggleLocationStatus
// } from "@/features/locations/locations.queries";
// import { useFacilityCompanies } from "@/features/facilityCompany/facilityCompany.queries";
// import { useLocationTypes } from "@/features/locationTypes/locationTypes.queries";

// function WashroomsPage() {
//   const router = useRouter();
//   const { companyId } = useCompanyId();
//   const actionsMenuRef = useRef(null);

//   const user = useSelector((state) => state.auth.user);
//   const userRoleId = user?.role_id;

//   useRequirePermission(MODULES.LOCATIONS);
//   const { canAdd, canUpdate, canDelete, hasPermission } = usePermissions();

//   const canAddLocation = canAdd(MODULES.LOCATIONS);
//   const canEditLocation = canUpdate(MODULES.LOCATIONS);
//   const canDeleteLocation = canDelete(MODULES.LOCATIONS);
//   const canToggleStatus = hasPermission(MODULES.LOCATIONS, "toggle_status");
//   const canAssignCleaner = canAdd(MODULES.ASSIGNMENTS);

//   // --- UI & Filter State ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [minRating, setMinRating] = useState("");
//   const [sortBy, setSortBy] = useState("newest");

//   const [nameSortOrder, setNameSortOrder] = useState(null);
//   const [currentScoreSortOrder, setCurrentScoreSortOrder] = useState(null);
//   const [avgScoreSortOrder, setAvgScoreSortOrder] = useState(null);
//   const [statusSortOrder, setStatusSortOrder] = useState(null);
//   const [viewMode, setViewMode] = useState("table");

//   const [selectedLocationTypeId, setSelectedLocationTypeId] = useState("");
//   const [facilityCompanyId, setFacilityCompanyId] = useState("");
//   const [facilityCompanyName, setFacilityCompanyName] = useState("");
//   const [assignmentFilter, setAssignmentFilter] = useState("");

//   // Modals & Menus
//   const [actionsMenuOpen, setActionsMenuOpen] = useState(null);
//   const [deleteModal, setDeleteModal] = useState({ open: false, location: null });
//   const [statusModal, setStatusModal] = useState({ open: false, location: null });
//   const [cleanerModal, setCleanerModal] = useState({ open: false, location: null });

//   // --- API Queries via TanStack ---
//   const { data: rawList = [], isLoading: loadingLocations } = useGetAllLocations(companyId, true);

//   const { data: typesData = [] } = useLocationTypes(companyId);
//   const locationTypes = Array.isArray(typesData) ? typesData : typesData?.data || [];

//   const { data: facilitiesResponse } = useFacilityCompanies(companyId);
//   const facilityCompanies = facilitiesResponse?.data || [];

//   const { mutate: deleteLocation, isPending: deleting } = useDeleteLocation();
//   const { mutate: toggleStatus, isPending: togglingStatus } = useToggleLocationStatus();

//   // Combine loading state
//   const loading = loadingLocations;

//   // --- Filtering & Sorting Logic (Instant via useMemo) ---
//   const filteredList = useMemo(() => {
//     let filtered = [...rawList];

//     if (selectedLocationTypeId) {
//       filtered = filtered.filter(
//         (item) => String(item.type_id) === String(selectedLocationTypeId)
//       );
//     }
//     if (facilityCompanyId) {
//       filtered = filtered.filter(
//         (item) => String(item.facility_company_id) === String(facilityCompanyId)
//       );
//     }
//     if (assignmentFilter === "assigned") {
//       filtered = filtered.filter(
//         (item) => item.cleaner_assignments && item.cleaner_assignments.length > 0
//       );
//     } else if (assignmentFilter === "unassigned") {
//       filtered = filtered.filter(
//         (item) => !item.cleaner_assignments || item.cleaner_assignments.length === 0
//       );
//     }
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter((item) =>
//         item.name.toLowerCase().includes(query)
//       );
//     }
//     if (minRating) {
//       filtered = filtered.filter(
//         (item) =>
//           item.averageRating !== null &&
//           parseFloat(item.averageRating) >= parseFloat(minRating)
//       );
//     }

//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case "currentScoreDesc":
//           return (b.currentScore || 0) - (a.currentScore || 0);
//         case "currentScoreAsc":
//           return (a.currentScore || 0) - (b.currentScore || 0);
//         case "avgScoreDesc":
//           return (b.averageRating || 0) - (a.averageRating || 0);
//         case "avgScoreAsc":
//           return (a.averageRating || 0) - (b.averageRating || 0);
//         case "nameAsc":
//           return a.name.localeCompare(b.name);
//         case "nameDesc":
//           return b.name.localeCompare(a.name);
//         case "statusActive":
//           const aStatus = a.status === true || a.status === null ? 1 : 0;
//           const bStatus = b.status === true || b.status === null ? 1 : 0;
//           return bStatus - aStatus;
//         case "statusInactive":
//           const aStatusI = a.status === true || a.status === null ? 0 : 1;
//           const bStatusI = b.status === true || b.status === null ? 0 : 1;
//           return bStatusI - aStatusI;
//         case "asc":
//           return new Date(a.created_at) - new Date(b.created_at);
//         case "desc":
//         default:
//           return new Date(b.created_at) - new Date(a.created_at);
//       }
//     });

//     return filtered;
//   }, [rawList, selectedLocationTypeId, facilityCompanyId, assignmentFilter, searchQuery, minRating, sortBy]);

//   // --- URL Param Sync ---
//   useEffect(() => {
//     const searchParams = new URLSearchParams(window.location.search);
//     const sortByParam = searchParams.get("sortBy");
//     const facilityCompanyIdParam = searchParams.get("facilityCompanyId");
//     const facilityCompanyNameParam = searchParams.get("facilityCompanyName");

//     if (sortByParam === "currentScore") {
//       setSortBy("currentScoreDesc");
//       setCurrentScoreSortOrder("desc");
//     }

//     if (facilityCompanyIdParam) {
//       setFacilityCompanyId(facilityCompanyIdParam);
//       if (facilityCompanyNameParam) {
//         setFacilityCompanyName(decodeURIComponent(facilityCompanyNameParam));
//       }
//     }
//   }, []);

//   // --- Click Outside Menu ---
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
//         setActionsMenuOpen(null);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // --- Handlers ---
//   const handleSort = (column) => {
//     setNameSortOrder(null);
//     setCurrentScoreSortOrder(null);
//     setAvgScoreSortOrder(null);
//     setStatusSortOrder(null);

//     switch (column) {
//       case "name":
//         const newNameOrder = nameSortOrder === "asc" ? "desc" : "asc";
//         setNameSortOrder(newNameOrder);
//         setSortBy(newNameOrder === "asc" ? "nameAsc" : "nameDesc");
//         break;
//       case "currentScore":
//         const newCurrentScoreOrder =
//           currentScoreSortOrder === "desc" ? "asc" : "desc";
//         setCurrentScoreSortOrder(newCurrentScoreOrder);
//         setSortBy(
//           newCurrentScoreOrder === "desc"
//             ? "currentScoreDesc"
//             : "currentScoreAsc"
//         );
//         break;
//       case "avgScore":
//         const newAvgScoreOrder = avgScoreSortOrder === "desc" ? "asc" : "desc";
//         setAvgScoreSortOrder(newAvgScoreOrder);
//         setSortBy(newAvgScoreOrder === "desc" ? "avgScoreDesc" : "avgScoreAsc");
//         break;
//       case "status":
//         const newStatusOrder =
//           statusSortOrder === "active" ? "inactive" : "active";
//         setStatusSortOrder(newStatusOrder);
//         setSortBy(
//           newStatusOrder === "active" ? "statusActive" : "statusInactive"
//         );
//         break;
//     }
//   };

//   const renderSortIcon = (currentOrder) => {
//     if (!currentOrder) {
//       return (
//         <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-blue-500 transition-colors" />
//       );
//     }
//     if (currentOrder === "asc" || currentOrder === "active") {
//       return <ArrowUp className="w-3 h-3 text-orange-500" />;
//     }
//     return <ArrowDown className="w-3 h-3 text-orange-500" />;
//   };

//   const getRatingColor = (rating) => {
//     const actualRating = rating || 0;
//     if (actualRating >= 7.5)
//       return { color: "text-emerald-600", bg: "bg-emerald-50", label: "Amazing" };
//     if (actualRating >= 5)
//       return { color: "text-orange-600", bg: "bg-orange-50", label: "Great" };
//     if (actualRating >= 3)
//       return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Okay" };
//     if (actualRating >= 2)
//       return { color: "text-red-600", bg: "bg-orange-50", label: "Poor" };
//     if (actualRating > 0)
//       return { color: "text-red-600", bg: "bg-red-50", label: "Terrible" };
//     return { color: "text-slate-500", bg: "bg-slate-100", label: "No rating" };
//   };

//   const handleViewLocation = (lat, lng) => {
//     window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
//   };

//   const handleView = (id) => {
//     router.push(`/washrooms/item/${id}?companyId=${companyId}`);
//   };

//   const handleAddToilet = () =>
//     router.push(`/washrooms/add-location?companyId=${companyId}`);

//   const handleAssignWashroom = () =>
//     router.push(`/userMapping/add?companyId=${companyId}`);

//   const confirmStatusToggle = () => {
//     if (!statusModal.location) return;
//     const location = statusModal.location;
//     const isCurrentlyActive = location.status === true || location.status === null;

//     toggleStatus(location.id, {
//       onSuccess: () => {
//         toast.success(`Washroom ${isCurrentlyActive ? "disabled" : "enabled"} successfully`);
//         setStatusModal({ open: false, location: null });
//       },
//       onError: (error) => {
//         toast.error(error.message || "Failed to toggle status");
//       }
//     });
//   };

//   const confirmDelete = () => {
//     if (!deleteModal.location) return;
//     const locationId = deleteModal.location.id;
//     const locationName = deleteModal.location.name;

//     deleteLocation({ id: locationId, companyId, softDelete: true }, {
//       onSuccess: () => {
//         toast.success(`"${locationName}" deleted successfully`);
//         setDeleteModal({ open: false, location: null });
//       },
//       onError: (error) => {
//         toast.error(error.message || "Failed to delete washroom");
//       }
//     });
//   };

//   const clearAllFilters = () => {
//     setSearchQuery("");
//     setMinRating("");
//     setFacilityCompanyId("");
//     setFacilityCompanyName("");
//     setSelectedLocationTypeId("");
//     setAssignmentFilter("");
//     setSortBy("desc");
//     setNameSortOrder(null);
//     setCurrentScoreSortOrder(null);
//     setAvgScoreSortOrder(null);
//     setStatusSortOrder(null);
//   };

//   // Cleaner Badge Rendering
//   const renderCleanerBadge = (locationName, cleaners) => {
//     if (!cleaners || cleaners.length === 0) {
//       return (
//         <span
//           className="text-xs italic"
//           style={{ color: "var(--washroom-text-muted)" }}
//         >
//           Unassigned
//         </span>
//       );
//     }
//     const firstName = cleaners[0].cleaner_user?.name || "Cleaner";
//     return (
//       <div className="flex items-center gap-1.5">
//         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
//         <span className="text-sm text-slate-700 font-medium truncate max-w-[100px]">
//           {firstName}
//         </span>
//         {cleaners.length > 1 && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setCleanerModal({
//                 open: true,
//                 location: { name: locationName, cleaners },
//               });
//             }}
//             className="text-xs text-blue-600 font-bold hover:underline"
//           >
//             +{cleaners.length - 1}
//           </button>
//         )}
//       </div>
//     );
//   };

//   // --- REUSABLE CARD COMPONENT ---
//   const WashroomCard = ({ item, index }) => (
//     <div
//       onClick={() => handleView(item.id)}
//       className="group rounded-2xl p-6 cursor-pointer relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
//       style={{
//         background: "var(--washroom-surface)",
//         border: "1px solid var(--washroom-border)",
//         boxShadow: "var(--washroom-shadow)",
//       }}
//     >
//       <div
//         className="absolute top-0 left-0 w-full h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
//         style={{
//           background: "linear-gradient(90deg, var(--washroom-primary), var(--washroom-primary-hover))",
//         }}
//       />
//       <div className="flex justify-between items-start mb-6">
//         <div className="flex items-center gap-4">
//           <div
//             className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
//             style={{
//               background: "var(--washroom-score-bg)",
//               color: "var(--washroom-score-text)",
//             }}
//           >
//             {item.name?.charAt(0).toUpperCase()}
//           </div>
//           <div>
//             <h3
//               className="font-bold text-lg leading-tight transition-colors"
//               style={{ color: "var(--washroom-title)" }}
//             >
//               {item.name}
//             </h3>
//             <p
//               className="text-xs mt-1 font-medium tracking-wide"
//               style={{ color: "var(--washroom-subtitle)" }}
//             >
//               ID: #{String(index + 1).padStart(2, "0")} • {item.location_types?.name}
//             </p>
//           </div>
//         </div>
//         <div className="relative" onClick={(e) => e.stopPropagation()}>
//           <button
//             onClick={() => setActionsMenuOpen(actionsMenuOpen === item.id ? null : item.id)}
//             className="p-2 rounded-full transition-colors"
//             style={{ color: "var(--washroom-subtitle)" }}
//           >
//             <MoreVertical size={18} />
//           </button>
//           {actionsMenuOpen === item.id && (
//             <LocationActionsMenu
//               item={item}
//               location_id={item.id}
//               onClose={() => setActionsMenuOpen(null)}
//               onDelete={(loc) => setDeleteModal({ open: true, location: loc })}
//               canDeleteLocation={canDeleteLocation}
//               canEditLocation={canEditLocation}
//             />
//           )}
//         </div>
//       </div>
//       <div className="grid grid-cols-2 gap-4 mb-6">
//         <div
//           className="rounded-xl p-3"
//           style={{
//             background: "var(--washroom-input-bg)",
//             border: "1px solid var(--washroom-border)",
//           }}
//         >
//           <p
//             className="text-[10px] font-bold uppercase tracking-wider mb-1"
//             style={{ color: "var(--washroom-subtitle)" }}
//           >
//             Current Score
//           </p>
//           <div className="flex items-baseline gap-1">
//             <span
//               className="text-2xl font-bold"
//               style={{ color: "var(--washroom-title)" }}
//             >
//               {item.currentScore ? Math.round(item.currentScore * 10) / 10 : "-"}
//             </span>
//             <span
//               className="text-xs font-medium"
//               style={{ color: "var(--washroom-subtitle)" }}
//             >
//               / 10
//             </span>
//           </div>
//         </div>
//         <div
//           className="rounded-xl p-3"
//           style={{
//             background: "var(--washroom-input-bg)",
//             border: "1px solid var(--washroom-border)",
//           }}
//         >
//           <p
//             className="text-[10px] font-bold uppercase tracking-wider mb-1"
//             style={{ color: "var(--washroom-subtitle)" }}
//           >
//             Avg Rating
//           </p>
//           <div className="flex items-center gap-1.5">
//             <Star
//               className="w-4 h-4"
//               style={{ color: "var(--washroom-primary)" }}
//               fill="currentColor"
//             />
//             <span
//               className="text-lg font-bold"
//               style={{ color: "var(--washroom-title)" }}
//             >
//               {item.averageRating || "0.0"}
//             </span>
//           </div>
//         </div>
//       </div>
//       <div
//         className="flex items-center justify-between pt-4"
//         style={{ borderTop: "1px solid var(--washroom-border)" }}
//       >
//         <div
//           className="flex items-center gap-2 cursor-pointer"
//           onClick={(e) => {
//             e.stopPropagation();
//             if (canToggleStatus) setStatusModal({ open: true, location: item });
//           }}
//         >
//           <div
//             className="w-2 h-2 rounded-full"
//             style={{
//               background: item.status
//                 ? "var(--washroom-status-dot-active)"
//                 : "var(--washroom-status-dot-inactive)",
//             }}
//           />
//           <span
//             className="text-xs font-bold uppercase tracking-wider"
//             style={{
//               color: item.status
//                 ? "var(--washroom-status-active-text)"
//                 : "var(--washroom-status-inactive-text)",
//             }}
//           >
//             {item.status ? "Active" : "Inactive"}
//           </span>
//         </div>
//         <div className="text-xs font-medium">
//           {renderCleanerBadge(item.name, item.cleaner_assignments)}
//         </div>
//       </div>
//     </div>
//   );

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen px-4">
//         <Loader
//           size="large"
//           color="var(--washroom-primary)"
//           message="Loading washrooms..."
//         />
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster position="top-right" />

//       {/* Main Container */}
//       <div className="min-h-screen p-6 font-sans max-[786px]:flex max-[786px]:items-center max-[786px]:justify-center max-[786px]:mx-auto">
//         <div className="max-w-[1600px] mx-auto w-full">
//           {/* Header Card */}
//           <div
//             className="rounded-2xl p-4 sm:p-6 mb-6"
//             style={{
//               background: "var(--washroom-surface)",
//               border: "1px solid var(--washroom-border)",
//               boxShadow: "var(--washroom-shadow)",
//             }}
//           >
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               {/* Left: Icon + Title */}
//               <div className="flex items-start sm:items-center gap-4">
//                 <div
//                   className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
//                   style={{
//                     background: "var(--washroom-surface)",
//                     border: "1px solid var(--washroom-border)",
//                     boxShadow: "var(--washroom-shadow)",
//                   }}
//                 >
//                   <MapPin
//                     className=" w-6 h-6"
//                     style={{ color: "var(--washroom-text)" }}
//                   />
//                 </div>

//                 <div className="min-w-0">
//                   <h1
//                     className="text-lg sm:text-xl md:text-2xl font-bold"
//                     style={{ color: "var(--washroom-title)" }}
//                   >
//                     WASHROOM LOCATIONS
//                   </h1>
//                   <p
//                     className="text-xs sm:text-sm font-medium uppercase tracking-wider mt-1"
//                     style={{ color: "var(--washroom-subtitle)" }}
//                   >
//                     Overview of details, assignments, and facility ratings
//                   </p>
//                 </div>
//               </div>

//               {/* Right: Actions */}
//               <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//                 {canAddLocation && (
//                   <button
//                     onClick={handleAddToilet}
//                     className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm uppercase tracking-wide"
//                     style={{
//                       background: "var(--washroom-primary)",
//                       color: "var(--washroom-primary-text)",
//                     }}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.style.background = "var(--washroom-primary-hover)")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.currentTarget.style.background = "var(--washroom-primary)")
//                     }
//                   >
//                     <Plus strokeWidth={3} className="w-4 h-4" />
//                     Add Location
//                   </button>
//                 )}

//                 {canAssignCleaner && (
//                   <button
//                     onClick={handleAssignWashroom}
//                     className="w-full sm:w-auto justify-center px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm uppercase tracking-wide"
//                     style={{
//                       background: "var(--washroom-primary)",
//                       color: "var(--washroom-primary-text)",
//                     }}
//                     onMouseEnter={(e) =>
//                       (e.currentTarget.style.background = "var(--washroom-primary-hover)")
//                     }
//                     onMouseLeave={(e) =>
//                       (e.currentTarget.style.background = "var(--washroom-primary)")
//                     }
//                   >
//                     Assign
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Filters Card */}
//           <div
//             className="rounded-2xl p-2 md:p-3 mb-6 flex flex-col xl:flex-row items-center gap-3"
//             style={{
//               background: "var(--washroom-surface)",
//               border: "1px solid var(--washroom-border)",
//               boxShadow: "var(--washroom-shadow)",
//             }}
//           >
//             {/* Search */}
//             <div className="relative flex-1 w-full xl:w-auto min-w-[300px]">
//               <Search
//                 style={{ color: "var(--washroom-text-muted)" }}
//                 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
//               />
//               <input
//                 type="text"
//                 placeholder="Search facility name or ID..."
//                 className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
//                 style={{
//                   background: "var(--washroom-input-bg)",
//                   color: "var(--washroom-text)",
//                   border: "1px solid var(--washroom-border)",
//                 }}
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>

//             <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
//               {/* Dropdowns */}
//               <select
//                 className="px-4 py-2.5 border rounded-xl text-sm font-semibold outline-none cursor-pointer min-w-[120px]"
//                 style={{
//                   background: "var(--washroom-surface)",
//                   color: "var(--washroom-text)",
//                   border: "1px solid var(--washroom-border)",
//                 }}
//                 value={selectedLocationTypeId}
//                 onChange={(e) => setSelectedLocationTypeId(e.target.value)}
//               >
//                 <option value="">Types: All</option>
//                 {locationTypes.map((type) => (
//                   <option key={type.id} value={type.id}>
//                     {type.name}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 className="px-4 py-2.5 border rounded-xl text-sm font-semibold outline-none cursor-pointer min-w-[140px]"
//                 style={{
//                   background: "var(--washroom-surface)",
//                   color: "var(--washroom-text)",
//                   border: "1px solid var(--washroom-border)",
//                 }}
//                 value={facilityCompanyId}
//                 onChange={(e) => {
//                   setFacilityCompanyId(e.target.value);
//                   const selected = facilityCompanies.find(
//                     (fc) => fc.id === e.target.value,
//                   );
//                   setFacilityCompanyName(selected?.name || "");
//                 }}
//               >
//                 <option value="">Facility Company: All</option>
//                 {facilityCompanies.map((fc) => (
//                   <option key={fc.id} value={fc.id}>
//                     {fc.name}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 className="px-4 py-2.5 border rounded-xl text-sm font-semibold outline-none cursor-pointer"
//                 style={{
//                   background: "var(--washroom-surface)",
//                   color: "var(--washroom-text)",
//                   border: "1px solid var(--washroom-border)",
//                 }}
//                 value={minRating}
//                 onChange={(e) => setMinRating(e.target.value)}
//               >
//                 <option value="">Rating: All</option>
//                 <option value="2">2+ Stars</option>
//                 <option value="4">4+ Stars</option>
//                 <option value="8">8+ Stars</option>
//               </select>

//               {/* Toggle Buttons */}
//               <div
//                 className="p-1 rounded-xl flex items-center"
//                 style={{
//                   background: "var(--washroom-filter-bg)",
//                   border: "1px solid var(--washroom-border)",
//                 }}
//               >
//                 {/* ALL */}
//                 <button
//                   onClick={() => setAssignmentFilter("")}
//                   className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
//                   style={{
//                     background:
//                       assignmentFilter === ""
//                         ? "var(--washroom-filter-active-bg)"
//                         : "transparent",
//                     color:
//                       assignmentFilter === ""
//                         ? "var(--washroom-filter-active-text)"
//                         : "var(--washroom-filter-text)",
//                     boxShadow:
//                       assignmentFilter === ""
//                         ? "var(--washroom-filter-active-shadow)"
//                         : "none",
//                   }}
//                 >
//                   ALL
//                 </button>

//                 {/* ASSIGNED */}
//                 <button
//                   onClick={() => setAssignmentFilter("assigned")}
//                   className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1"
//                   style={{
//                     background:
//                       assignmentFilter === "assigned"
//                         ? "var(--washroom-filter-active-bg)"
//                         : "transparent",
//                     color:
//                       assignmentFilter === "assigned"
//                         ? "var(--washroom-filter-active-text)"
//                         : "var(--washroom-filter-text)",
//                     boxShadow:
//                       assignmentFilter === "assigned"
//                         ? "var(--washroom-filter-active-shadow)"
//                         : "none",
//                   }}
//                 >
//                   <CheckCircle2 size={12} />
//                   Assigned
//                 </button>

//                 {/* CLEAR FILTERS */}
//                 {(searchQuery ||
//                   minRating ||
//                   facilityCompanyId ||
//                   selectedLocationTypeId ||
//                   assignmentFilter) && (
//                     <button
//                       onClick={clearAllFilters}
//                       className="ml-1 p-1.5 rounded-lg transition-colors"
//                       style={{
//                         color: "var(--washroom-filter-clear)",
//                       }}
//                       onMouseEnter={(e) =>
//                         (e.currentTarget.style.color = "var(--washroom-filter-clear-hover)")
//                       }
//                       onMouseLeave={(e) =>
//                         (e.currentTarget.style.color = "var(--washroom-filter-clear)")
//                       }
//                     >
//                       <XCircle size={18} />
//                     </button>
//                   )}
//               </div>

//               <span
//                 className="text-sm font-medium px-3 py-2 rounded-xl"
//                 style={{
//                   background: "var(--washroom-input-bg)",
//                   color: "var(--washroom-subtitle)",
//                   border: "1px solid var(--washroom-border)",
//                 }}
//               >
//                 {filteredList.length} of {rawList.length}
//               </span>

//               <div
//                 className="flex rounded-xl p-1"
//                 style={{
//                   background: "var(--washroom-input-bg)",
//                   border: "1px solid var(--washroom-border)",
//                 }}
//               >
//                 {/* Grid View */}
//                 <button
//                   onClick={() => setViewMode("grid")}
//                   title="Grid View"
//                   className="cursor-pointer p-2 rounded-lg transition-all"
//                   style={
//                     viewMode === "grid"
//                       ? {
//                         background:
//                           "linear-gradient(90deg, var(--washroom-primary), var(--washroom-primary-hover))",
//                         color: "var(--washroom-primary-text)",
//                         boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
//                       }
//                       : { color: "var(--washroom-subtitle)" }
//                   }
//                 >
//                   <Grid3x3 className="h-5 w-5" />
//                 </button>

//                 {/* Table View */}
//                 <button
//                   onClick={() => setViewMode("table")}
//                   title="Table View"
//                   className="cursor-pointer p-2 rounded-lg transition-all"
//                   style={
//                     viewMode === "table"
//                       ? {
//                         background:
//                           "linear-gradient(90deg, var(--washroom-primary), var(--washroom-primary-hover))",
//                         color: "var(--washroom-primary-text)",
//                         boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
//                       }
//                       : { color: "var(--washroom-subtitle)" }
//                   }
//                 >
//                   <List className="h-5 w-5" />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Table Container */}
//           {filteredList.length === 0 ? (
//             <div
//               className="rounded-2xl p-16 text-center lg:col-span-2"
//               style={{
//                 background: "var(--washroom-surface)",
//                 border: "1px solid var(--washroom-border)",
//                 boxShadow: "var(--washroom-shadow)",
//               }}
//             >
//               <div
//                 className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
//                 style={{ background: "var(--washroom-filter-bg)" }}
//               >
//                 <MapPin
//                   className="h-12 w-12"
//                   style={{ color: "var(--washroom-primary)" }}
//                 />
//               </div>

//               <h3
//                 className="text-2xl font-bold mb-2"
//                 style={{ color: "var(--washroom-title)" }}
//               >
//                 No Washrooms Found
//               </h3>

//               <p
//                 className="mb-6"
//                 style={{ color: "var(--washroom-subtitle)" }}
//               >
//                 Try adjusting your search or filter criteria
//               </p>
//             </div>
//           ) : (
//             <div>
//               <div className="hidden lg:block">
//                 {viewMode === "grid" ? (
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredList.map((item, index) => (
//                       <WashroomCard key={item.id} item={item} index={index} />
//                     ))}
//                   </div>
//                 ) : (
//                   <div
//                     className="rounded-2xl overflow-hidden hidden lg:block"
//                     style={{
//                       background: "var(--washroom-surface)",
//                       border: "1px solid var(--washroom-border)",
//                       boxShadow: "var(--washroom-shadow)",
//                     }}
//                   >
//                     {/* Grid Header */}
//                     <div
//                       className="grid grid-cols-[60px_2fr_1.2fr_100px_100px_1.5fr_1fr_120px_90px] gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest items-center"
//                       style={{
//                         background: "var(--washroom-table-header-bg)",
//                         borderBottom: "1px solid var(--washroom-table-divider)",
//                         color: "var(--washroom-text-muted)",
//                       }}
//                     >
//                       <div className="text-center text-blue-500">#</div>

//                       <button
//                         onClick={() => handleSort("name")}
//                         className="text-left flex items-center gap-1 hover:text-blue-600 group"
//                       >
//                         WASHROOM NAME {renderSortIcon(nameSortOrder)}
//                       </button>

//                       <div className="flex items-center gap-1">
//                         <MapPin size={12} /> ZONE
//                       </div>

//                       <button
//                         onClick={() => handleSort("currentScore")}
//                         className="text-center flex items-center justify-center gap-1 hover:text-blue-600 group"
//                       >
//                         CURRENT SCORE {renderSortIcon(currentScoreSortOrder)}
//                       </button>

//                       <button
//                         onClick={() => handleSort("avgScore")}
//                         className="text-center flex items-center justify-center gap-1 hover:text-blue-600 group"
//                       >
//                         AVERAGE RATING {renderSortIcon(avgScoreSortOrder)}
//                       </button>

//                       <div className="flex items-center gap-1">
//                         <Users size={12} /> CLEANER
//                       </div>

//                       <div className="flex items-center gap-1">FACILITY</div>

//                       <button
//                         onClick={() => handleSort("status")}
//                         className="text-center flex items-center justify-center gap-1 hover:text-blue-600 group"
//                       >
//                         STATUS {renderSortIcon(statusSortOrder)}
//                       </button>

//                       <div className="text-right">ACTION</div>
//                     </div>

//                     {/* Grid Body */}
//                     <div className="divide-y-0">
//                       {filteredList.map((item, index) => (
//                         <div
//                           key={item.id}
//                           onClick={() => handleView(item.id)}
//                           className="grid grid-cols-[60px_2fr_1.2fr_100px_100px_1.5fr_1fr_120px_90px] gap-2 px-6 py-4 items-center cursor-pointer transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-600 hover:bg-blue-50/50"
//                         >
//                           {/* Rank */}
//                           <div className="flex justify-center">
//                             <span
//                               className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg"
//                               style={{
//                                 background: "var(--washroom-muted-bg)",
//                                 color: "var(--washroom-accent)",
//                               }}
//                             >
//                               {String(index + 1).padStart(2, "0")}
//                             </span>
//                           </div>

//                           {/* Name */}
//                           <div className="min-w-0 pr-2">
//                             <p
//                               className="font-bold text-sm truncate"
//                               style={{ color: "var(--washroom-text-strong)" }}
//                             >
//                               {item.name}
//                             </p>
//                             <p
//                               className="text-[10px] mt-0.5 truncate"
//                               style={{ color: "var(--washroom-text-muted)" }}
//                             >
//                               ID: {item.id} • {new Date(item.created_at).toLocaleDateString()}
//                             </p>
//                           </div>

//                           {/* Zone */}
//                           <div className="min-w-0">
//                             <span
//                               className="inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide truncate max-w-full"
//                               style={{
//                                 background: "var(--washroom-muted-bg)",
//                                 color: "var(--washroom-text)",
//                               }}
//                             >
//                               {item.location_types?.name || "N/A"}
//                             </span>
//                           </div>

//                           {/* Current Score */}
//                           <div className="flex justify-center">
//                             <span
//                               className="px-4 py-1.5 rounded-xl text-sm font-bold"
//                               style={{
//                                 background: "var(--washroom-score-bg)",
//                                 color: "var(--washroom-score-text)",
//                                 border: "1px solid var(--washroom-border)",
//                               }}
//                             >
//                               {item.currentScore
//                                 ? Math.round(item.currentScore * 10) / 10
//                                 : "-"}
//                             </span>
//                           </div>

//                           {/* Rating */}
//                           <div className="flex items-center gap-1.5">
//                             <Star
//                               className="w-3.5 h-3.5 text-orange-500"
//                               fill="currentColor"
//                             />
//                             <span className="text-base font-bold text-slate-800">
//                               {item.averageRating || "0.0"}
//                             </span>
//                           </div>

//                           {/* Cleaner */}
//                           <div className="min-w-0">
//                             {renderCleanerBadge(
//                               item.name,
//                               item.cleaner_assignments,
//                             )}
//                           </div>

//                           {/* Facility */}
//                           <div className="min-w-0">
//                             <span
//                               className="text-xs font-medium truncate block"
//                               style={{ color: "var(--washroom-text-muted)" }}
//                             >
//                               {item.facility_companies?.name || "N/A"}
//                             </span>
//                           </div>

//                           {/* Status */}
//                           <div
//                             className="flex justify-center"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             {canToggleStatus && (
//                               <button
//                                 onClick={() =>
//                                   setStatusModal({
//                                     open: true,
//                                     location: item,
//                                   })
//                                 }
//                                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all"
//                                 style={{
//                                   background:
//                                     item.status === true || item.status === null
//                                       ? "var(--washroom-status-active-bg)"
//                                       : "var(--washroom-status-inactive-bg)",
//                                   color:
//                                     item.status === true || item.status === null
//                                       ? "var(--washroom-status-active-text)"
//                                       : "var(--washroom-status-inactive-text)",
//                                   borderColor:
//                                     item.status === true || item.status === null
//                                       ? "var(--washroom-status-active-border)"
//                                       : "var(--washroom-status-inactive-border)",
//                                 }}
//                               >
//                                 <div
//                                   className="h-2 w-2 rounded-full"
//                                   style={{
//                                     background:
//                                       item.status === true || item.status === null
//                                         ? "var(--washroom-status-dot-active)"
//                                         : "var(--washroom-status-dot-inactive)",
//                                   }}
//                                 />
//                                 {item.status ? "Active" : "Inactive"}
//                               </button>
//                             )}
//                           </div>

//                           {/* Action */}
//                           <div
//                             className="flex justify-end gap-1"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <button
//                               onClick={() =>
//                                 handleViewLocation(
//                                   item.latitude,
//                                   item.longitude,
//                                 )
//                               }
//                               className="p-2 rounded-lg transition-colors"
//                               style={{ color: "var(--washroom-icon-muted)" }}
//                               onMouseEnter={(e) =>
//                                 (e.currentTarget.style.background = "var(--washroom-muted-bg)")
//                               }
//                               onMouseLeave={(e) =>
//                                 (e.currentTarget.style.background = "transparent")
//                               }
//                             >
//                               <Navigation size={16} />
//                             </button>

//                             <div
//                               className="relative"
//                               ref={actionsMenuOpen === item.id ? actionsMenuRef : null}
//                             >
//                               <button
//                                 onClick={() =>
//                                   setActionsMenuOpen(
//                                     actionsMenuOpen === item.id ? null : item.id,
//                                   )
//                                 }
//                                 className="p-2 rounded-lg transition-colors"
//                                 style={{ color: "var(--washroom-icon-muted)" }}
//                                 onMouseEnter={(e) =>
//                                   (e.currentTarget.style.background = "var(--washroom-muted-bg)")
//                                 }
//                                 onMouseLeave={(e) =>
//                                   (e.currentTarget.style.background = "transparent")
//                                 }
//                               >
//                                 <MoreVertical size={16} />
//                               </button>

//                               {actionsMenuOpen === item.id && (
//                                 <LocationActionsMenu
//                                   item={item}
//                                   location_id={item.id}
//                                   onClose={() => setActionsMenuOpen(null)}
//                                   onDelete={(location) => setDeleteModal({ open: true, location })}
//                                   canDeleteLocation={canDeleteLocation}
//                                   canEditLocation={canEditLocation}
//                                 />
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Footer */}
//                     <div
//                       className="px-6 py-3 text-xs font-bold uppercase tracking-wider"
//                       style={{
//                         background: "var(--washroom-table-footer-bg)",
//                         borderTop: "1px solid var(--washroom-table-divider)",
//                         color: "var(--washroom-muted-text)",
//                       }}
//                     >
//                       Showing {filteredList.length} washroom records
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Mobile View - Reusing the Card Component */}
//               <div className="lg:hidden">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {filteredList.map((item, index) => (
//                     <WashroomCard key={item.id} item={item} index={index} />
//                   ))}
//                 </div>
//               </div>

//               {/* --- MODALS --- */}

//               {cleanerModal.open && (
//                 <div
//                   className="fixed inset-0 z-50 flex items-center justify-center p-4"
//                   style={{
//                     background: "rgba(0,0,0,0.35)",
//                     backdropFilter: "blur(4px)",
//                   }}
//                   onClick={() => setCleanerModal({ open: false, location: null })}
//                 >
//                   <div
//                     className="rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6"
//                     style={{
//                       background: "var(--washroom-surface)",
//                       border: "1px solid var(--washroom-border)",
//                       boxShadow: "var(--washroom-shadow)",
//                     }}
//                     onClick={(e) => e.stopPropagation()}
//                   >
//                     {/* Header */}
//                     <div className="flex items-center justify-between mb-4">
//                       <h3
//                         className="text-lg font-semibold"
//                         style={{ color: "var(--washroom-title)" }}
//                       >
//                         {cleanerModal.location?.name} – Assigned Cleaners
//                       </h3>
//                       <button
//                         onClick={() => setCleanerModal({ open: false, location: null })}
//                         className="transition-colors"
//                         style={{ color: "var(--washroom-subtitle)" }}
//                       >
//                         <X className="h-5 w-5" />
//                       </button>
//                     </div>

//                     {/* List */}
//                     <div className="space-y-3">
//                       {cleanerModal.location?.cleaners?.map((assignment) => {
//                         const isActive = assignment.status === "assigned";
//                         return (
//                           <div
//                             key={assignment.id}
//                             className="flex items-center gap-3 p-3 rounded-lg"
//                             style={{
//                               background: "var(--washroom-filter-bg)",
//                               border: "1px solid var(--washroom-border)",
//                             }}
//                           >
//                             <div className="flex-1 min-w-0">
//                               <p
//                                 className="font-medium text-sm truncate"
//                                 style={{ color: "var(--washroom-text)" }}
//                               >
//                                 {assignment.cleaner_user?.name || "Unknown"}
//                               </p>
//                               {assignment.cleaner_user?.phone && (
//                                 <p
//                                   className="text-xs"
//                                   style={{ color: "var(--washroom-subtitle)" }}
//                                 >
//                                   {assignment.cleaner_user.phone}
//                                 </p>
//                               )}
//                             </div>

//                             <span
//                               className="text-xs px-2 py-1 rounded-full font-medium"
//                               style={
//                                 isActive
//                                   ? {
//                                     background: "var(--washroom-status-active-bg)",
//                                     color: "var(--washroom-status-active-text)",
//                                     border: `1px solid var(--washroom-status-active-border)`,
//                                   }
//                                   : {
//                                     background: "var(--washroom-status-inactive-bg)",
//                                     color: "var(--washroom-status-inactive-text)",
//                                     border: `1px solid var(--washroom-status-inactive-border)`,
//                                   }
//                               }
//                             >
//                               {assignment.status || "N/A"}
//                             </span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {statusModal.open && (
//                 <div
//                   className="fixed inset-0 z-50 flex items-center justify-center p-4"
//                   style={{
//                     background: "rgba(0,0,0,0.35)",
//                     backdropFilter: "blur(4px)",
//                   }}
//                 >
//                   <div
//                     className="rounded-xl max-w-md w-full p-6"
//                     style={{
//                       background: "var(--washroom-surface)",
//                       border: "1px solid var(--washroom-border)",
//                       boxShadow: "var(--washroom-shadow)",
//                     }}
//                   >
//                     {/* Header */}
//                     <div className="flex items-center gap-4 mb-4">
//                       <div
//                         className="p-3 rounded-full"
//                         style={
//                           statusModal.location?.status === true ||
//                           statusModal.location?.status === null
//                             ? {
//                               background: "var(--washroom-status-inactive-bg)",
//                               border: `1px solid var(--washroom-status-inactive-border)`,
//                             }
//                             : {
//                               background: "var(--washroom-status-active-bg)",
//                               border: `1px solid var(--washroom-status-active-border)`,
//                             }
//                         }
//                       >
//                         {statusModal.location?.status === true ||
//                         statusModal.location?.status === null ? (
//                           <PowerOff
//                             className="h-6 w-6"
//                             style={{ color: "var(--washroom-status-inactive-text)" }}
//                           />
//                         ) : (
//                           <Power
//                             className="h-6 w-6"
//                             style={{ color: "var(--washroom-status-active-text)" }}
//                           />
//                         )}
//                       </div>

//                       <div>
//                         <h3
//                           className="text-lg font-semibold"
//                           style={{ color: "var(--washroom-title)" }}
//                         >
//                           {statusModal.location?.status === true ||
//                           statusModal.location?.status === null
//                             ? "Disable"
//                             : "Enable"}{" "}
//                           Washroom
//                         </h3>
//                         <p
//                           className="text-sm"
//                           style={{ color: "var(--washroom-subtitle)" }}
//                         >
//                           Confirm status change
//                         </p>
//                       </div>
//                     </div>

//                     {/* Body */}
//                     <div className="mb-6">
//                       <p
//                         className="text-sm"
//                         style={{ color: "var(--washroom-text)" }}
//                       >
//                         Are you sure you want to{" "}
//                         <strong>
//                           {statusModal.location?.status === true ||
//                           statusModal.location?.status === null
//                             ? "disable"
//                             : "enable"}
//                         </strong>{" "}
//                         <strong>“{statusModal.location?.name}”</strong>?
//                       </p>

//                       {/* Disable warning */}
//                       {(statusModal.location?.status === true ||
//                         statusModal.location?.status === null) && (
//                         <div
//                           className="mt-3 p-3 rounded-md text-sm"
//                           style={{
//                             background: "var(--washroom-status-inactive-bg)",
//                             border: `1px solid var(--washroom-status-inactive-border)`,
//                             color: "var(--washroom-status-inactive-text)",
//                           }}
//                         >
//                           ⚠️ Disabling this washroom will automatically{" "}
//                           <strong>unassign all cleaners</strong>.
//                           <br />
//                           They must be <strong>manually re-assigned</strong> when enabled again.
//                         </div>
//                       )}

//                       {/* Enable info */}
//                       {statusModal.location?.status === false && (
//                         <div
//                           className="mt-3 p-3 rounded-md text-sm"
//                           style={{
//                             background: "var(--washroom-score-bg)",
//                             color: "var(--washroom-score-text)",
//                           }}
//                         >
//                           ℹ️ Enabling this washroom will{" "}
//                           <strong>not auto-assign cleaners</strong>.
//                           <br />
//                           Please assign cleaners manually.
//                         </div>
//                       )}
//                     </div>

//                     {/* Actions */}
//                     <div className="flex gap-3 justify-end">
//                       <button
//                         onClick={() => setStatusModal({ open: false, location: null })}
//                         className="px-4 py-2 rounded-lg transition-colors"
//                         style={{
//                           color: "var(--washroom-filter-text)",
//                           background: "transparent",
//                         }}
//                       >
//                         Cancel
//                       </button>

//                       <button
//                         onClick={confirmStatusToggle}
//                         disabled={togglingStatus}
//                         className="px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
//                         style={{
//                           background:
//                             statusModal.location?.status === true ||
//                             statusModal.location?.status === null
//                               ? "var(--washroom-delete-bg)"
//                               : "var(--washroom-primary)",
//                         }}
//                       >
//                         {togglingStatus && (
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                         )}
//                         {togglingStatus
//                           ? "Processing..."
//                           : statusModal.location?.status === true ||
//                             statusModal.location?.status === null
//                           ? "Disable"
//                           : "Enable"}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {deleteModal.open && (
//                 <div
//                   className="fixed inset-0 z-50 flex items-center justify-center p-4"
//                   style={{
//                     background: "rgba(0,0,0,0.35)",
//                     backdropFilter: "blur(4px)",
//                   }}
//                 >
//                   <div
//                     className="rounded-xl max-w-md w-full p-6"
//                     style={{
//                       background: "var(--washroom-surface)",
//                       border: "1px solid var(--washroom-border)",
//                       boxShadow: "var(--washroom-shadow)",
//                     }}
//                   >
//                     {/* Header */}
//                     <div className="flex items-center gap-4 mb-4">
//                       <div
//                         className="p-3 rounded-full"
//                         style={{
//                           background: "var(--washroom-status-inactive-bg)",
//                           border: `1px solid var(--washroom-status-inactive-border)`,
//                         }}
//                       >
//                         <AlertTriangle
//                           className="h-6 w-6"
//                           style={{ color: "var(--washroom-status-inactive-text)" }}
//                         />
//                       </div>

//                       <div>
//                         <h3
//                           className="text-lg font-semibold"
//                           style={{ color: "var(--washroom-title)" }}
//                         >
//                           Delete Washroom
//                         </h3>
//                         <p
//                           className="text-sm"
//                           style={{ color: "var(--washroom-subtitle)" }}
//                         >
//                           This action cannot be undone
//                         </p>
//                       </div>
//                     </div>

//                     {/* Body */}
//                     <div className="mb-6">
//                       <p
//                         className="text-sm"
//                         style={{ color: "var(--washroom-text)" }}
//                       >
//                         Are you sure you want to delete{" "}
//                         <strong>“{deleteModal.location?.name}”</strong>?
//                       </p>

//                       <div
//                         className="mt-3 p-3 rounded-md text-sm"
//                         style={{
//                           background: "var(--washroom-status-inactive-bg)",
//                           border: `1px solid var(--washroom-status-inactive-border)`,
//                           color: "var(--washroom-status-inactive-text)",
//                         }}
//                       >
//                         ⚠️ This will permanently remove the washroom and all related data.
//                       </div>
//                     </div>

//                     {/* Actions */}
//                     <div className="flex gap-3 justify-end">
//                       <button
//                         onClick={() => setDeleteModal({ open: false, location: null })}
//                         disabled={deleting}
//                         className="px-4 py-2 rounded-lg transition-colors"
//                         style={{
//                           color: "var(--washroom-filter-text)",
//                           background: "transparent",
//                         }}
//                       >
//                         Cancel
//                       </button>

//                       <button
//                         onClick={confirmDelete}
//                         disabled={deleting}
//                         className="px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
//                         style={{
//                           background: "var(--washroom-delete-bg)",
//                         }}
//                       >
//                         {deleting && (
//                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                         )}
//                         {deleting ? "Deleting..." : "Delete"}
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }

// export default WashroomsPage;

/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
  Grid3x3,
  List,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import LocationActionsMenu from "./components/LocationActionsMenu";
import { useSelector } from "react-redux";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// ✅ Import TanStack Query Hooks
import {
  useGetAllLocations,
  useDeleteLocation,
  useToggleLocationStatus,
} from "@/features/locations/locations.queries";
import { useFacilityCompanies } from "@/features/facilityCompany/facilityCompany.queries";
import { useLocationTypes } from "@/features/locationTypes/locationTypes.queries";

function WashroomsPage() {
  const router = useRouter();
  const { companyId } = useCompanyId();
  const actionsMenuRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;

  useRequirePermission(MODULES.LOCATIONS);
  const { canAdd, canUpdate, canDelete, hasPermission } = usePermissions();

  const canAddLocation = canAdd(MODULES.LOCATIONS);
  const canEditLocation = canUpdate(MODULES.LOCATIONS);
  const canDeleteLocation = canDelete(MODULES.LOCATIONS);
  const canToggleStatus = hasPermission(MODULES.LOCATIONS, "toggle_status");
  const canAssignCleaner = canAdd(MODULES.ASSIGNMENTS);

  // --- UI, Filter & Pagination State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // NEW: Pagination States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  const [nameSortOrder, setNameSortOrder] = useState(null);
  const [currentScoreSortOrder, setCurrentScoreSortOrder] = useState(null);
  const [avgScoreSortOrder, setAvgScoreSortOrder] = useState(null);
  const [statusSortOrder, setStatusSortOrder] = useState(null);
  const [viewMode, setViewMode] = useState("table");

  const [selectedLocationTypeId, setSelectedLocationTypeId] = useState("");
  const [facilityCompanyId, setFacilityCompanyId] = useState("");
  const [facilityCompanyName, setFacilityCompanyName] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState("");

  // Modals & Menus
  const [actionsMenuOpen, setActionsMenuOpen] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    location: null,
  });
  const [statusModal, setStatusModal] = useState({
    open: false,
    location: null,
  });
  const [cleanerModal, setCleanerModal] = useState({
    open: false,
    location: null,
  });

  // --- API Queries via TanStack ---
  // UPDATED: Pass page and limit, and destructure the new response format
  const { data: responseData, isLoading: loadingLocations } =
    useGetAllLocations(companyId, true, null, page, limit);

  const rawList = responseData?.data || [];
  const pagination = responseData?.pagination || { total: 0, last_page: 1 };

  const { data: typesData = [] } = useLocationTypes(companyId);
  const locationTypes = Array.isArray(typesData)
    ? typesData
    : typesData?.data || [];

  const { data: facilitiesResponse } = useFacilityCompanies(companyId);
  const facilityCompanies = facilitiesResponse?.data || [];

  const { mutate: deleteLocation, isPending: deleting } = useDeleteLocation();
  const { mutate: toggleStatus, isPending: togglingStatus } =
    useToggleLocationStatus();

  // Combine loading state
  const loading = loadingLocations;

  // --- Filtering & Sorting Logic (Instant via useMemo) ---
  const filteredList = useMemo(() => {
    let filtered = [...rawList];

    if (selectedLocationTypeId) {
      filtered = filtered.filter(
        (item) => String(item.type_id) === String(selectedLocationTypeId),
      );
    }
    if (facilityCompanyId) {
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

    return filtered;
  }, [
    rawList,
    selectedLocationTypeId,
    facilityCompanyId,
    assignmentFilter,
    searchQuery,
    minRating,
    sortBy,
  ]);

  // --- URL Param Sync ---
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

  // --- Click Outside Menu ---
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

  // --- Handlers ---

  // NEW: Handler to change items per page and reset to page 1
  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setPage(1);
  };

  const handleSort = (column) => {
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

  const confirmStatusToggle = () => {
    if (!statusModal.location) return;
    const location = statusModal.location;
    const isCurrentlyActive =
      location.status === true || location.status === null;

    toggleStatus(location.id, {
      onSuccess: () => {
        toast.success(
          `Washroom ${isCurrentlyActive ? "disabled" : "enabled"} successfully`,
        );
        setStatusModal({ open: false, location: null });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to toggle status");
      },
    });
  };

  const confirmDelete = () => {
    if (!deleteModal.location) return;
    const locationId = deleteModal.location.id;
    const locationName = deleteModal.location.name;

    deleteLocation(
      { id: locationId, companyId, softDelete: true },
      {
        onSuccess: () => {
          toast.success(`"${locationName}" deleted successfully`);
          setDeleteModal({ open: false, location: null });
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete washroom");
        },
      },
    );
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
    setPage(1); // Reset page on clear filter
  };

  // Cleaner Badge Rendering
  const renderCleanerBadge = (locationName, cleaners) => {
    if (!cleaners || cleaners.length === 0) {
      return (
        <span
          className="text-xs italic"
          style={{ color: "var(--washroom-text-muted)" }}
        >
          Unassigned
        </span>
      );
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

  // --- REUSABLE CARD COMPONENT ---
const WashroomCard = ({ item, index }) => (
    <div
      onClick={() => handleView(item.id)}
      // REMOVED: overflow-hidden
      className="group rounded-2xl p-6 cursor-pointer relative transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--washroom-surface)",
        border: "1px solid var(--washroom-border)",
        boxShadow: "var(--washroom-shadow)",
      }}
    >
      <div
        // ADDED: rounded-t-2xl so it doesn't poke out of the top corners
        className="absolute top-0 left-0 w-full h-1 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl"
        style={{
          background:
            "linear-gradient(90deg, var(--washroom-primary), var(--washroom-primary-hover))",
        }}
      />
      <div className="flex justify-between items-start mb-6">
        {/* ... Rest of WashroomCard stays exactly the same ... */}
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{
              background: "var(--washroom-score-bg)",
              color: "var(--washroom-score-text)",
            }}
          >
            {item.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3
              className="font-bold text-lg leading-tight transition-colors"
              style={{ color: "var(--washroom-title)" }}
            >
              {item.name}
            </h3>
            <p
              className="text-xs mt-1 font-medium tracking-wide"
              style={{ color: "var(--washroom-subtitle)" }}
            >
              ID: #{String(index + 1).padStart(2, "0")} •{" "}
              {item.location_types?.name}
            </p>
          </div>
        </div>
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() =>
              setActionsMenuOpen(actionsMenuOpen === item.id ? null : item.id)
            }
            className="p-2 rounded-full transition-colors"
            style={{ color: "var(--washroom-subtitle)" }}
          >
            <MoreVertical size={18} />
          </button>
          {actionsMenuOpen === item.id && (
            <LocationActionsMenu
              item={item}
              location_id={item.id}
              onClose={() => setActionsMenuOpen(null)}
              onDelete={(loc) => setDeleteModal({ open: true, location: loc })}
              canDeleteLocation={canDeleteLocation}
              canEditLocation={canEditLocation}
            />
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-xl p-3"
          style={{
            background: "var(--washroom-input-bg)",
            border: "1px solid var(--washroom-border)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: "var(--washroom-subtitle)" }}
          >
            Current Score
          </p>
          <div className="flex items-baseline gap-1">
            <span
              className="text-2xl font-bold"
              style={{ color: "var(--washroom-title)" }}
            >
              {item.currentScore
                ? Math.round(item.currentScore * 10) / 10
                : "-"}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--washroom-subtitle)" }}
            >
              / 10
            </span>
          </div>
        </div>
        <div
          className="rounded-xl p-3"
          style={{
            background: "var(--washroom-input-bg)",
            border: "1px solid var(--washroom-border)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-1"
            style={{ color: "var(--washroom-subtitle)" }}
          >
            Avg Rating
          </p>
          <div className="flex items-center gap-1.5">
            <Star
              className="w-4 h-4"
              style={{ color: "var(--washroom-primary)" }}
              fill="currentColor"
            />
            <span
              className="text-lg font-bold"
              style={{ color: "var(--washroom-title)" }}
            >
              {item.averageRating || "0.0"}
            </span>
          </div>
        </div>
      </div>
      <div
        className="flex items-center justify-between pt-4"
        style={{ borderTop: "1px solid var(--washroom-border)" }}
      >
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (canToggleStatus) setStatusModal({ open: true, location: item });
          }}
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{
              background: item.status
                ? "var(--washroom-status-dot-active)"
                : "var(--washroom-status-dot-inactive)",
            }}
          />
          <span
            className="text-xs font-bold uppercase tracking-wider"
            style={{
              color: item.status
                ? "var(--washroom-status-active-text)"
                : "var(--washroom-status-inactive-text)",
            }}
          >
            {item.status ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="text-xs font-medium">
          {renderCleanerBadge(item.name, item.cleaner_assignments)}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <Loader
          size="large"
          color="var(--washroom-primary)"
          message="Loading washrooms..."
        />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      {/* Main Container */}
      <div className="min-h-screen p-6 font-sans">
        <div className="max-w-[1600px] mx-auto w-full">
          {/* Header Card */}
          <div
            className="rounded-2xl p-4 sm:p-6 mb-6 md:mt-[-30px]"
            style={{
              background: "var(--washroom-surface)",
              border: "1px solid var(--washroom-border)",
              boxShadow: "var(--washroom-shadow)",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              {/* Left */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    background: "var(--washroom-surface)",
                    border: "1px solid var(--washroom-border)",
                    boxShadow: "var(--washroom-shadow)",
                  }}
                >
                  <MapPin
                    className="w-5 h-5"
                    style={{ color: "var(--washroom-text)" }}
                  />
                </div>

                <div className="min-w-0 leading-tight">
                  <h1
                    className="text-base sm:text-lg font-bold"
                    style={{ color: "var(--washroom-title)" }}
                  >
                    WASHROOM LOCATIONS
                  </h1>

                  <p
                    className="text-[11px] sm:text-xs uppercase tracking-wide"
                    style={{ color: "var(--washroom-subtitle)" }}
                  >
                    Overview of details, assignments, and facility ratings
                  </p>
                </div>
              </div>

              {/* Right */}
              <div className="flex gap-2 w-full md:w-auto">
                {canAddLocation && (
                  <button
                    onClick={handleAddToilet}
                    className="px-5 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-2 uppercase tracking-wide"
                    style={{
                      background: "var(--washroom-primary)",
                      color: "var(--washroom-primary-text)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--washroom-primary-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "var(--washroom-primary)")
                    }
                  >
                    <Plus strokeWidth={3} className="w-4 h-4" />
                    Add Location
                  </button>
                )}

                {canAssignCleaner && (
                  <button
                    onClick={handleAssignWashroom}
                    className="px-5 py-2 rounded-lg font-semibold text-xs transition-all uppercase tracking-wide"
                    style={{
                      background: "var(--washroom-primary)",
                      color: "var(--washroom-primary-text)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--washroom-primary-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "var(--washroom-primary)")
                    }
                  >
                    Assign
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filters Card */}
          <div
            className="rounded-xl p-2 mb-4 flex flex-col xl:flex-row items-center gap-2"
            style={{
              background: "var(--washroom-surface)",
              border: "1px solid var(--washroom-border)",
              boxShadow: "var(--washroom-shadow)",
            }}
          >
            {/* Search */}
            <div className="relative flex-1 w-full xl:w-auto min-w-[260px]">
              <Search
                style={{ color: "var(--washroom-text-muted)" }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              />

              <input
                type="text"
                placeholder="Search facility name or ID..."
                className="w-full pl-10 pr-3 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: "var(--washroom-input-bg)",
                  color: "var(--washroom-text)",
                  border: "1px solid var(--washroom-border)",
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
              {/* Dropdowns */}
              <select
                className="px-3 py-2 border rounded-lg text-xs font-medium outline-none cursor-pointer min-w-[110px]"
                style={{
                  background: "var(--washroom-surface)",
                  color: "var(--washroom-text)",
                  border: "1px solid var(--washroom-border)",
                }}
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
                className="px-3 py-2 border rounded-lg text-xs font-medium outline-none cursor-pointer min-w-[130px]"
                style={{
                  background: "var(--washroom-surface)",
                  color: "var(--washroom-text)",
                  border: "1px solid var(--washroom-border)",
                }}
                value={facilityCompanyId}
                onChange={(e) => {
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
                className="px-3 py-2 border rounded-lg text-xs font-medium outline-none cursor-pointer"
                style={{
                  background: "var(--washroom-surface)",
                  color: "var(--washroom-text)",
                  border: "1px solid var(--washroom-border)",
                }}
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="">Rating: All</option>
                <option value="2">2+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="8">8+ Stars</option>
              </select>

              {/* Toggle Buttons */}
              <div
                className="p-1 rounded-lg flex items-center"
                style={{
                  background: "var(--washroom-filter-bg)",
                  border: "1px solid var(--washroom-border)",
                }}
              >
                {/* ALL */}
                <button
                  onClick={() => setAssignmentFilter("")}
                  className="px-3 py-1 rounded-md text-[11px] font-semibold uppercase transition-all"
                  style={{
                    background:
                      assignmentFilter === ""
                        ? "var(--washroom-filter-active-bg)"
                        : "transparent",

                    color:
                      assignmentFilter === ""
                        ? "var(--washroom-filter-active-text)"
                        : "var(--washroom-filter-text)",
                  }}
                >
                  ALL
                </button>

                {/* ASSIGNED */}
                <button
                  onClick={() => setAssignmentFilter("assigned")}
                  className="px-3 py-1 rounded-md text-[11px] font-semibold uppercase transition-all flex items-center gap-1"
                  style={{
                    background:
                      assignmentFilter === "assigned"
                        ? "var(--washroom-filter-active-bg)"
                        : "transparent",

                    color:
                      assignmentFilter === "assigned"
                        ? "var(--washroom-filter-active-text)"
                        : "var(--washroom-filter-text)",
                  }}
                >
                  <CheckCircle2 size={11} />
                  Assigned
                </button>

                {/* CLEAR */}
                {(searchQuery ||
                  minRating ||
                  facilityCompanyId ||
                  selectedLocationTypeId ||
                  assignmentFilter) && (
                  <button
                    onClick={clearAllFilters}
                    className="ml-1 p-1 rounded-md transition-colors"
                    style={{
                      color: "var(--washroom-filter-clear)",
                    }}
                  >
                    <XCircle size={16} />
                  </button>
                )}
              </div>

              {/* Count */}
              <span
                className="text-xs font-medium px-2.5 py-2 rounded-lg"
                style={{
                  background: "var(--washroom-input-bg)",
                  color: "var(--washroom-subtitle)",
                  border: "1px solid var(--washroom-border)",
                }}
              >
                {filteredList.length} / {pagination.total}
              </span>

              {/* View Switch */}
              <div
                className="flex rounded-lg p-1"
                style={{
                  background: "var(--washroom-input-bg)",
                  border: "1px solid var(--washroom-border)",
                }}
              >
                <button
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className="cursor-pointer p-1.5 rounded-md transition-all"
                  style={
                    viewMode === "grid"
                      ? {
                          background:
                            "linear-gradient(90deg, var(--washroom-primary), var(--washroom-primary-hover))",

                          color: "var(--washroom-primary-text)",
                        }
                      : { color: "var(--washroom-subtitle)" }
                  }
                >
                  <Grid3x3 className="h-4 w-4" />
                </button>

                <button
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className="cursor-pointer p-1.5 rounded-md transition-all"
                  style={
                    viewMode === "table"
                      ? {
                          background:
                            "linear-gradient(90deg, var(--washroom-primary), var(--washroom-primary-hover))",

                          color: "var(--washroom-primary-text)",
                        }
                      : { color: "var(--washroom-subtitle)" }
                  }
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          {filteredList.length === 0 ? (
            <div
              className="rounded-2xl p-16 text-center lg:col-span-2"
              style={{
                background: "var(--washroom-surface)",
                border: "1px solid var(--washroom-border)",
                boxShadow: "var(--washroom-shadow)",
              }}
            >
              <div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: "var(--washroom-filter-bg)" }}
              >
                <MapPin
                  className="h-12 w-12"
                  style={{ color: "var(--washroom-primary)" }}
                />
              </div>

              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--washroom-title)" }}
              >
                No Washrooms Found
              </h3>

              <p className="mb-6" style={{ color: "var(--washroom-subtitle)" }}>
                Try adjusting your search or filter criteria
              </p>
            </div>
          ) : (
            <div>
              <div className="hidden lg:block">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredList.map((item, index) => (
                      <WashroomCard
                        key={item.id}
                        item={item}
                        index={index + (page - 1) * limit}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="rounded-2xl  hidden lg:block"
                    style={{
                      background: "var(--washroom-surface)",
                      border: "1px solid var(--washroom-border)",
                      boxShadow: "var(--washroom-shadow)",
                    }}
                  >
                    {/* Grid Header */}
                    <div
                      className="grid grid-cols-[60px_2fr_1.2fr_100px_100px_1.5fr_1fr_120px_90px] gap-2 px-6 py-4 text-[11px] font-bold uppercase tracking-widest items-center rounded-t-2xl"
                      style={{
                        background: "var(--washroom-table-header-bg)",
                        borderBottom: "1px solid var(--washroom-table-divider)",
                        color: "var(--washroom-text-muted)",
                      }}
                    >
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
                    <div className="divide-y-0">
                      {filteredList.map((item, index) => (
                        <div
                          key={item.id}
                          onClick={() => handleView(item.id)}
                          className={`grid grid-cols-[60px_2fr_1.2fr_100px_100px_1.5fr_1fr_120px_90px] gap-2 px-6 py-4 items-center cursor-pointer transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-600 hover:bg-blue-50/50 ${
                            index === filteredList.length - 1 ? 'rounded-b-2xl' : ''
                          }`}
                        >
                          {/* Rank */}
                          <div className="flex justify-center">
                            <span
                              className="w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg"
                              style={{
                                background: "var(--washroom-muted-bg)",
                                color: "var(--washroom-accent)",
                              }}
                            >
                              {String(index + 1 + (page - 1) * limit).padStart(
                                2,
                                "0",
                              )}
                            </span>
                          </div>

                          {/* Name */}
                          <div className="min-w-0 pr-2">
                            <p
                              className="font-bold text-sm truncate"
                              style={{ color: "var(--washroom-text-strong)" }}
                            >
                              {item.name}
                            </p>
                            <p
                              className="text-[10px] mt-0.5 truncate"
                              style={{ color: "var(--washroom-text-muted)" }}
                            >
                              ID: {item.id} •{" "}
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Zone */}
                          <div className="min-w-0">
                            <span
                              className="inline-block text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide truncate max-w-full"
                              style={{
                                background: "var(--washroom-muted-bg)",
                                color: "var(--washroom-text)",
                              }}
                            >
                              {item.location_types?.name || "N/A"}
                            </span>
                          </div>

                          {/* Current Score */}
                          <div className="flex justify-center">
                            <span
                              className="px-4 py-1.5 rounded-xl text-sm font-bold"
                              style={{
                                background: "var(--washroom-score-bg)",
                                color: "var(--washroom-score-text)",
                                border: "1px solid var(--washroom-border)",
                              }}
                            >
                              {item.currentScore
                                ? Math.round(item.currentScore * 10) / 10
                                : "-"}
                            </span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1.5">
                            <Star
                              className="w-3.5 h-3.5 text-orange-500"
                              fill="currentColor"
                            />
                            <span className="text-base font-bold text-slate-800">
                              {item.averageRating || "0.0"}
                            </span>
                          </div>

                          {/* Cleaner */}
                          <div className="min-w-0">
                            {renderCleanerBadge(
                              item.name,
                              item.cleaner_assignments,
                            )}
                          </div>

                          {/* Facility */}
                          <div className="min-w-0">
                            <span
                              className="text-xs font-medium truncate block"
                              style={{ color: "var(--washroom-text-muted)" }}
                            >
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
                                  setStatusModal({
                                    open: true,
                                    location: item,
                                  })
                                }
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all"
                                style={{
                                  background:
                                    item.status === true || item.status === null
                                      ? "var(--washroom-status-active-bg)"
                                      : "var(--washroom-status-inactive-bg)",
                                  color:
                                    item.status === true || item.status === null
                                      ? "var(--washroom-status-active-text)"
                                      : "var(--washroom-status-inactive-text)",
                                  borderColor:
                                    item.status === true || item.status === null
                                      ? "var(--washroom-status-active-border)"
                                      : "var(--washroom-status-inactive-border)",
                                }}
                              >
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{
                                    background:
                                      item.status === true ||
                                      item.status === null
                                        ? "var(--washroom-status-dot-active)"
                                        : "var(--washroom-status-dot-inactive)",
                                  }}
                                />
                                {item.status ? "Active" : "Inactive"}
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
                                handleViewLocation(
                                  item.latitude,
                                  item.longitude,
                                )
                              }
                              className="p-2 rounded-lg transition-colors"
                              style={{ color: "var(--washroom-icon-muted)" }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--washroom-muted-bg)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <Navigation size={16} />
                            </button>

                            <div
                              className="relative"
                              ref={
                                actionsMenuOpen === item.id
                                  ? actionsMenuRef
                                  : null
                              }
                            >
                              <button
                                onClick={() =>
                                  setActionsMenuOpen(
                                    actionsMenuOpen === item.id
                                      ? null
                                      : item.id,
                                  )
                                }
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: "var(--washroom-icon-muted)" }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "var(--washroom-muted-bg)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "transparent")
                                }
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
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile View - Reusing the Card Component */}
              <div className="lg:hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredList.map((item, index) => (
                    <WashroomCard
                      key={item.id}
                      item={item}
                      index={index + (page - 1) * limit}
                    />
                  ))}
                </div>
              </div>

              {/* NEW: Pagination Controls Footer */}
              <div
                className="flex flex-col sm:flex-row justify-between items-center mt-6 p-4 rounded-2xl"
                style={{
                  background: "var(--washroom-surface)",
                  border: "1px solid var(--washroom-border)",
                  boxShadow: "var(--washroom-shadow)",
                }}
              >
                {/* Dropdown for Items Per Page */}
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--washroom-subtitle)" }}
                  >
                    Items per page:
                  </span>
                  <select
                    value={limit}
                    onChange={handleLimitChange}
                    className="px-3 py-1.5 border rounded-lg text-sm font-semibold outline-none cursor-pointer transition-all"
                    style={{
                      background: "var(--washroom-input-bg)",
                      color: "var(--washroom-text)",
                      border: "1px solid var(--washroom-border)",
                    }}
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {/* Prev/Next Buttons */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setPage((old) => Math.max(old - 1, 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
                    style={{
                      background: "var(--washroom-filter-bg)",
                      color: "var(--washroom-text)",
                      border: "1px solid var(--washroom-border)",
                    }}
                  >
                    Previous
                  </button>

                  <span
                    className="text-sm font-bold"
                    style={{ color: "var(--washroom-title)" }}
                  >
                    Page {page} of {pagination.last_page}
                  </span>

                  <button
                    onClick={() =>
                      setPage((old) =>
                        old < pagination.last_page ? old + 1 : old,
                      )
                    }
                    disabled={
                      page >= pagination.last_page || pagination.last_page === 0
                    }
                    className="px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200"
                    style={{
                      background: "var(--washroom-filter-bg)",
                      color: "var(--washroom-text)",
                      border: "1px solid var(--washroom-border)",
                    }}
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* --- MODALS --- */}

              {cleanerModal.open && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(4px)",
                  }}
                  onClick={() =>
                    setCleanerModal({ open: false, location: null })
                  }
                >
                  <div
                    className="rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto p-6"
                    style={{
                      background: "var(--washroom-surface)",
                      border: "1px solid var(--washroom-border)",
                      boxShadow: "var(--washroom-shadow)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: "var(--washroom-title)" }}
                      >
                        {cleanerModal.location?.name} – Assigned Cleaners
                      </h3>
                      <button
                        onClick={() =>
                          setCleanerModal({ open: false, location: null })
                        }
                        className="transition-colors"
                        style={{ color: "var(--washroom-subtitle)" }}
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* List */}
                    <div className="space-y-3">
                      {cleanerModal.location?.cleaners?.map((assignment) => {
                        const isActive = assignment.status === "assigned";
                        return (
                          <div
                            key={assignment.id}
                            className="flex items-center gap-3 p-3 rounded-lg"
                            style={{
                              background: "var(--washroom-filter-bg)",
                              border: "1px solid var(--washroom-border)",
                            }}
                          >
                            <div className="flex-1 min-w-0">
                              <p
                                className="font-medium text-sm truncate"
                                style={{ color: "var(--washroom-text)" }}
                              >
                                {assignment.cleaner_user?.name || "Unknown"}
                              </p>
                              {assignment.cleaner_user?.phone && (
                                <p
                                  className="text-xs"
                                  style={{ color: "var(--washroom-subtitle)" }}
                                >
                                  {assignment.cleaner_user.phone}
                                </p>
                              )}
                            </div>

                            <span
                              className="text-xs px-2 py-1 rounded-full font-medium"
                              style={
                                isActive
                                  ? {
                                      background:
                                        "var(--washroom-status-active-bg)",
                                      color:
                                        "var(--washroom-status-active-text)",
                                      border: `1px solid var(--washroom-status-active-border)`,
                                    }
                                  : {
                                      background:
                                        "var(--washroom-status-inactive-bg)",
                                      color:
                                        "var(--washroom-status-inactive-text)",
                                      border: `1px solid var(--washroom-status-inactive-border)`,
                                    }
                              }
                            >
                              {assignment.status || "N/A"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {statusModal.open && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div
                    className="rounded-xl max-w-md w-full p-6"
                    style={{
                      background: "var(--washroom-surface)",
                      border: "1px solid var(--washroom-border)",
                      boxShadow: "var(--washroom-shadow)",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="p-3 rounded-full"
                        style={
                          statusModal.location?.status === true ||
                          statusModal.location?.status === null
                            ? {
                                background:
                                  "var(--washroom-status-inactive-bg)",
                                border: `1px solid var(--washroom-status-inactive-border)`,
                              }
                            : {
                                background: "var(--washroom-status-active-bg)",
                                border: `1px solid var(--washroom-status-active-border)`,
                              }
                        }
                      >
                        {statusModal.location?.status === true ||
                        statusModal.location?.status === null ? (
                          <PowerOff
                            className="h-6 w-6"
                            style={{
                              color: "var(--washroom-status-inactive-text)",
                            }}
                          />
                        ) : (
                          <Power
                            className="h-6 w-6"
                            style={{
                              color: "var(--washroom-status-active-text)",
                            }}
                          />
                        )}
                      </div>

                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: "var(--washroom-title)" }}
                        >
                          {statusModal.location?.status === true ||
                          statusModal.location?.status === null
                            ? "Disable"
                            : "Enable"}{" "}
                          Washroom
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: "var(--washroom-subtitle)" }}
                        >
                          Confirm status change
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="mb-6">
                      <p
                        className="text-sm"
                        style={{ color: "var(--washroom-text)" }}
                      >
                        Are you sure you want to{" "}
                        <strong>
                          {statusModal.location?.status === true ||
                          statusModal.location?.status === null
                            ? "disable"
                            : "enable"}
                        </strong>{" "}
                        <strong>“{statusModal.location?.name}”</strong>?
                      </p>

                      {/* Disable warning */}
                      {(statusModal.location?.status === true ||
                        statusModal.location?.status === null) && (
                        <div
                          className="mt-3 p-3 rounded-md text-sm"
                          style={{
                            background: "var(--washroom-status-inactive-bg)",
                            border: `1px solid var(--washroom-status-inactive-border)`,
                            color: "var(--washroom-status-inactive-text)",
                          }}
                        >
                          ⚠️ Disabling this washroom will automatically{" "}
                          <strong>unassign all cleaners</strong>.
                          <br />
                          They must be <strong>
                            manually re-assigned
                          </strong>{" "}
                          when enabled again.
                        </div>
                      )}

                      {/* Enable info */}
                      {statusModal.location?.status === false && (
                        <div
                          className="mt-3 p-3 rounded-md text-sm"
                          style={{
                            background: "var(--washroom-score-bg)",
                            color: "var(--washroom-score-text)",
                          }}
                        >
                          ℹ️ Enabling this washroom will{" "}
                          <strong>not auto-assign cleaners</strong>.
                          <br />
                          Please assign cleaners manually.
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() =>
                          setStatusModal({ open: false, location: null })
                        }
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                          color: "var(--washroom-filter-text)",
                          background: "transparent",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={confirmStatusToggle}
                        disabled={togglingStatus}
                        className="px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
                        style={{
                          background:
                            statusModal.location?.status === true ||
                            statusModal.location?.status === null
                              ? "var(--washroom-delete-bg)"
                              : "var(--washroom-primary)",
                        }}
                      >
                        {togglingStatus && (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        )}
                        {togglingStatus
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
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{
                    background: "rgba(0,0,0,0.35)",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  <div
                    className="rounded-xl max-w-md w-full p-6"
                    style={{
                      background: "var(--washroom-surface)",
                      border: "1px solid var(--washroom-border)",
                      boxShadow: "var(--washroom-shadow)",
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="p-3 rounded-full"
                        style={{
                          background: "var(--washroom-status-inactive-bg)",
                          border: `1px solid var(--washroom-status-inactive-border)`,
                        }}
                      >
                        <AlertTriangle
                          className="h-6 w-6"
                          style={{
                            color: "var(--washroom-status-inactive-text)",
                          }}
                        />
                      </div>

                      <div>
                        <h3
                          className="text-lg font-semibold"
                          style={{ color: "var(--washroom-title)" }}
                        >
                          Delete Washroom
                        </h3>
                        <p
                          className="text-sm"
                          style={{ color: "var(--washroom-subtitle)" }}
                        >
                          This action cannot be undone
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="mb-6">
                      <p
                        className="text-sm"
                        style={{ color: "var(--washroom-text)" }}
                      >
                        Are you sure you want to delete{" "}
                        <strong>“{deleteModal.location?.name}”</strong>?
                      </p>

                      <div
                        className="mt-3 p-3 rounded-md text-sm"
                        style={{
                          background: "var(--washroom-status-inactive-bg)",
                          border: `1px solid var(--washroom-status-inactive-border)`,
                          color: "var(--washroom-status-inactive-text)",
                        }}
                      >
                        ⚠️ This will permanently remove the washroom and all
                        related data.
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() =>
                          setDeleteModal({ open: false, location: null })
                        }
                        disabled={deleting}
                        className="px-4 py-2 rounded-lg transition-colors"
                        style={{
                          color: "var(--washroom-filter-text)",
                          background: "transparent",
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        onClick={confirmDelete}
                        disabled={deleting}
                        className="px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
                        style={{
                          background: "var(--washroom-delete-bg)",
                        }}
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
          )}
        </div>
      </div>
    </>
  );
}

export default WashroomsPage;
