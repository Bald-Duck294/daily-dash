// "use client";

// import React, { useState, useEffect } from "react";
// import {
//   Filter,
//   Download,
//   FileText,
//   Calendar,
//   MapPin,
//   RefreshCw,
//   Loader2,
//   ChevronDown,
//   AlertCircle,
//   X,
// } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import ReportsApi from "@/features/reports/reports.api";
// import ReportModal from "./components/ReportModal";
// import Loader from "@/components/ui/Loader";
// import { useSelector } from "react-redux";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { MODULES } from "@/shared/constants/permissions";

// const REPORT_TYPES = [
//   {
//     value: "daily_task",
//     label: "Cleaning Report",
//     description: "View cleaner tasks with AI scores and compliance",
//     endpoint: "daily-task",
//   },
//   {
//     value: "washroom_report",
//     label: "Washroom Report",
//     description: "view single washroom report",
//     endpoint: "washroom-report",
//   },
//   {
//     value: "cleaner_report",
//     label: "Cleaner Report",
//     description: "View individual cleaner or all cleaners performance",
//     endpoint: "cleaner-report",
//   },

//   {
//     value: "detailed_cleaning",
//     label: "Detailed Cleaning Report",
//     description: "Aggregate performance metrics for cleaners.",
//     endpoint: "detailed-cleaning",
//   },
//   {
//     value: "washroom_hygiene_trend",
//     label: "Washroom Hygiene Trend",
//     description: "View daily hygiene scores across all washrooms",
//     endpoint: "washroom-daily-scores",
//   },

//   // {
//   //   value: "zone_wise",
//   //   label: "Zone-wise Report",
//   //   description: "Location-wise cleaner activity and scores",
//   //   endpoint: "zone-wise",
//   // },
//   // {
//   //   value: "ai_scoring",
//   //   label: "AI Scoring Report",
//   //   description: "Track the average AI hygiene score and improvement trend for each location.",
//   //   endpoint: "ai-scoring",
//   // },
//   // {
//   //   value: "cleaner_performance_summary",
//   //   label: "Cleaner Performance Summary",
//   //   description: "Aggregate performance metrics for cleaners.",
//   //   endpoint: "cleaner-performance-summary",
//   // },
// ];

// const getTodayDate = () => {
//   const today = new Date();
//   const year = today.getFullYear();
//   const month = String(today.getMonth() + 1).padStart(2, "0");
//   const day = String(today.getDate()).padStart(2, "0");
//   return `${year}-${month}-${day}`;
// };

// const NoDataModal = ({ isOpen, onClose, filters }) => {
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
//         {/* Header */}
//         <div className="flex items-center justify-between p-6 border-b border-slate-200">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-amber-100 rounded-lg">
//               <AlertCircle className="w-6 h-6 text-amber-600" />
//             </div>
//             <h2 className="text-xl font-bold text-slate-800">No Data Found</h2>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//           >
//             <X className="w-5 h-5 text-slate-500" />
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           <p className="text-slate-600 mb-4">
//             No records found for the selected filters. Please try:
//           </p>
//           <ul className="space-y-2 mb-6">
//             <li className="flex items-start gap-2 text-sm text-slate-600">
//               <span className="text-blue-600 mt-0.5">•</span>
//               <span>Adjusting the date range</span>
//             </li>
//             <li className="flex items-start gap-2 text-sm text-slate-600">
//               <span className="text-blue-600 mt-0.5">•</span>
//               <span>Selecting different filters</span>
//             </li>
//             <li className="flex items-start gap-2 text-sm text-slate-600">
//               <span className="text-blue-600 mt-0.5">•</span>
//               <span>Removing some filter constraints</span>
//             </li>
//           </ul>

//           {/* ✅ Show current filters */}
//           <div className="bg-slate-50 rounded-lg p-4 mb-4">
//             <p className="text-xs font-semibold text-slate-500 mb-2">
//               Current Filters:
//             </p>
//             <div className="space-y-1 text-sm text-slate-700">
//               {filters.zone && (
//                 <p>
//                   Zone: <span className="font-medium">{filters.zone}</span>
//                 </p>
//               )}
//               {filters.location && (
//                 <p>
//                   Location:{" "}
//                   <span className="font-medium">{filters.location}</span>
//                 </p>
//               )}
//               {filters.cleaner && (
//                 <p>
//                   Cleaner:{" "}
//                   <span className="font-medium">{filters.cleaner}</span>
//                 </p>
//               )}
//               {filters.dateRange && (
//                 <p>
//                   Date Range:{" "}
//                   <span className="font-medium">{filters.dateRange}</span>
//                 </p>
//               )}
//               {filters.status && (
//                 <p>
//                   Status: <span className="font-medium">{filters.status}</span>
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//             >
//               Adjust Filters
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const toastInfo = (message) => {
//   toast(message, {
//     icon: "ℹ️",
//     style: {},
//   });
// };
// export default function ReportsPage() {
//   useRequirePermission(MODULES.REPORTS);

//   const { canView } = usePermissions();
//   const canViewReports = canView(MODULES.REPORTS);

//   const { companyId } = useCompanyId();
//   const user = useSelector((state) => state.auth.user);
//   const userRoleId = user?.role_id;
//   const isPermitted = userRoleId === 1 || userRoleId === 2;

//   const todayDate = getTodayDate();

//   // Report type selection
//   const [selectedReportType, setSelectedReportType] = useState("daily_task");

//   // Common filter states
//   const [zones, setZones] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [cleaners, setCleaners] = useState([]);

//   // ✅ Add loading states for each dropdown
//   const [loadingLocations, setLoadingLocations] = useState(false);
//   const [loadingCleaners, setLoadingCleaners] = useState(false);

//   const [selectedZone, setSelectedZone] = useState("");
//   const [selectedLocation, setSelectedLocation] = useState("");
//   const [selectedCleaner, setSelectedCleaner] = useState("");
//   const [startDate, setStartDate] = useState(todayDate);
//   const [endDate, setEndDate] = useState(todayDate);
//   const [statusFilter, setStatusFilter] = useState("all");

//   // Data states
//   const [reportData, setReportData] = useState([]);
//   const [reportMetadata, setReportMetadata] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);

//   const [showNoDataModal, setShowNoDataModal] = useState(false);
//   const [detailedReportDate, setDetailedReportDate] = useState(todayDate);

//   const [flag, setFlag] = useState(true);

//   // ✅ Initial data fetch on mount
//   useEffect(() => {
//     if (companyId) {
//       fetchZones();
//       fetchLocations(); // Load all locations initially
//       fetchCleaners(); // Load all cleaners initially
//     }
//   }, [companyId, selectedReportType]);

//   // ✅ Cascade: When zone changes, reload locations
//   useEffect(() => {
//     if (companyId && selectedZone) {
//       fetchLocationsByZone(selectedZone);
//       setSelectedLocation(""); // Reset location
//       setSelectedCleaner(""); // Reset cleaner
//       setCleaners([]); // Clear cleaners
//     } else if (companyId && !selectedZone) {
//       // If zone is cleared, load all locations
//       fetchLocations();
//       setSelectedLocation("");
//       setSelectedCleaner("");
//     }
//   }, [selectedZone, companyId]);

//   // ✅ Cascade: When location changes, reload cleaners
//   useEffect(() => {
//     if (companyId && selectedLocation) {
//       fetchCleanersByLocation(selectedLocation);
//       setSelectedCleaner(""); // Reset cleaner
//     } else if (companyId && !selectedLocation && !selectedZone) {
//       // If location is cleared and no zone selected, load all cleaners
//       fetchCleaners();
//       setSelectedCleaner("");
//     }
//   }, [selectedLocation, companyId]);

//   useEffect(() => {
//     if (selectedReportType === "washroom_hygiene_trend") {
//       const maxAllowedEndDate = getMaxEndDate(startDate);

//       if (!endDate || endDate > maxAllowedEndDate) {
//         setEndDate(maxAllowedEndDate);
//         toast.success("End date set to maximum allowed (31 days)", {
//           duration: 2000,
//         });
//       }
//     }
//   }, [selectedReportType, startDate]);

//   //  Fetch functions
//   const fetchZones = async () => {
//     try {
//       const response = await ReportsApi.getAvailableZones(companyId);
//       if (response.success) {
//         setZones(response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching zones:", error);
//       toast.error("Failed to load zones");
//     }
//   };

//   const fetchLocations = async () => {
//     setLoadingLocations(true);
//     try {
//       const response = await ReportsApi.getLocationsForReport(companyId);
//       if (response.success) {
//         setLocations(response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching locations:", error);
//       toast.error("Failed to load locations");
//     } finally {
//       setLoadingLocations(false);
//     }
//   };

//   // ✅ Fetch locations filtered by zone
//   const fetchLocationsByZone = async (zoneId) => {
//     setLoadingLocations(true);
//     try {
//       const response = await ReportsApi.getLocationsForReport(
//         companyId,
//         zoneId,
//       );
//       if (response.success) {
//         setLocations(response.data);
//       } else {
//         setLocations([]);
//         toast.error("No locations found for selected zone");
//       }
//     } catch (error) {
//       console.error("Error fetching locations by zone:", error);
//       toast.error("Failed to load locations");
//       setLocations([]);
//     } finally {
//       setLoadingLocations(false);
//     }
//   };

//   const fetchCleaners = async () => {
//     setLoadingCleaners(true);
//     try {
//       const response = await ReportsApi.getCleanersForReport(companyId);
//       if (response.success) {
//         setCleaners(response.data);
//       }
//     } catch (error) {
//       console.error("Error fetching cleaners:", error);
//       toast.error("Failed to load cleaners");
//     } finally {
//       setLoadingCleaners(false);
//     }
//   };

//   // ✅ Fetch cleaners filtered by location
//   const fetchCleanersByLocation = async (locationId) => {
//     setLoadingCleaners(true);
//     try {
//       const response = await ReportsApi.getCleanersForReport(
//         companyId,
//         locationId,
//       );
//       if (response.success) {
//         setCleaners(response.data);
//         if (response.data.length === 0) {
//           toast.error("No cleaners assigned to this washroom");
//         }
//       } else {
//         setCleaners([]);
//       }
//     } catch (error) {
//       console.error("Error fetching cleaners by location:", error);
//       toast.error("Failed to load cleaners");
//       setCleaners([]);
//     } finally {
//       setLoadingCleaners(false);
//     }
//   };

//   // Generate dynamic report name
//   const generateReportName = (defaultReportType) => {
//     const isSingleDate = startDate === endDate;

//     if (selectedReportType === "daily_task") {
//       if (isSingleDate) {
//         return "Daily_Cleaning_Report";
//       } else {
//         return "Cleaning_Report";
//       }
//     }

//     if (selectedReportType === "washroom_report") {
//       if (selectedLocation) {
//         const locationName =
//           locations.find((loc) => loc.id === selectedLocation)?.name ||
//           "Washroom";
//         return isSingleDate
//           ? `${locationName.replace(/\s+/g, "_")}_Daily_Report`
//           : `${locationName.replace(/\s+/g, "_")}_Report`;
//       } else {
//         return "All_Washrooms_Report";
//       }
//     }

//     if (selectedReportType === "cleaner_report") {
//       if (selectedCleaner) {
//         const cleanerName =
//           cleaners.find((c) => c.id === selectedCleaner)?.name || "Cleaner";
//         return isSingleDate
//           ? `${cleanerName.replace(/\s+/g, "_")}_Daily_Report`
//           : `${cleanerName.replace(/\s+/g, "_")}_Report`;
//       } else {
//         return "All_Cleaners_Report";
//       }
//     }

//     if (selectedLocation && selectedReportType === "daily_task") {
//       const locationName =
//         locations.find((loc) => loc.id === parseInt(selectedLocation))?.name ||
//         "Washroom";
//       return isSingleDate
//         ? `${locationName.replace(/\s+/g, "_")}_Daily_Report`
//         : `${locationName.replace(/\s+/g, "_")}_Report`;
//     }

//     return defaultReportType || "Report";
//   };

//   const getCurrentFilters = () => ({
//     zone: selectedZone ? zones.find((z) => z.id === selectedZone)?.name : null,
//     location: selectedLocation
//       ? locations.find((l) => l.id === selectedLocation)?.display_name
//       : null,
//     cleaner: selectedCleaner
//       ? cleaners.find((c) => c.id === selectedCleaner)?.name
//       : null,
//     dateRange: `${startDate || "Beginning"} to ${endDate || "Now"}`,
//     status: statusFilter !== "all" ? statusFilter : null,
//   });

//   const generateReport = async () => {
//     if (!canViewReports) {
//       toast.error("You don't have permission to generate reports");
//       return;
//     }

//     if (!companyId) {
//       toast.error("Company ID is required");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const selectedReport = REPORT_TYPES.find(
//         (r) => r.value === selectedReportType,
//       );

//       let effectiveStartDate = startDate;
//       let effectiveEndDate = endDate;

//       let params = {
//         company_id: companyId,
//         ...(startDate && { start_date: startDate }),
//         ...(endDate && { end_date: endDate }),
//       };

//       let detailed_cleaning_params = {
//         company_id: companyId,
//         ...(detailedReportDate && { detailed_report_date: detailedReportDate }),
//       };
//       if (selectedReportType === "daily_task") {
//         const today = new Date().toISOString().split("T")[0];
//         if (!effectiveStartDate) effectiveStartDate = today;
//         if (!effectiveEndDate) effectiveEndDate = today;
//       }

//       if (selectedReportType === "daily_task") {
//         params = {
//           ...params,
//           ...(selectedLocation && { location_id: selectedLocation }),
//           ...(selectedCleaner && { cleaner_id: selectedCleaner }),
//           ...(selectedZone && { type_id: selectedZone }),
//           ...(statusFilter !== "all" && { status_filter: statusFilter }),
//           ...(effectiveStartDate && { start_date: effectiveStartDate }),
//           ...(effectiveEndDate && { end_date: effectiveEndDate }),
//         };
//       } else if (selectedReportType === "zone_wise") {
//         params = {
//           ...params,
//           ...(selectedZone && { type_id: selectedZone }),
//         };
//       } else if (selectedReportType === "washroom_report") {
//         params = {
//           ...params,
//           ...(selectedLocation && { location_id: selectedLocation }),
//           ...(statusFilter !== "all" && { status_filter: statusFilter }),
//         };
//       } else if (selectedReportType === "cleaner_report") {
//         params = {
//           ...params,
//           ...(selectedCleaner && { cleaner_id: selectedCleaner }),
//           ...(selectedLocation && { location_id: selectedLocation }),
//           ...(statusFilter !== "all" && { status_filter: statusFilter }),
//         };
//       } else if (selectedReportType === "detailed_cleaning") {
//         params = {
//           ...detailed_cleaning_params,
//           // ...(detailedReportDate && { detailed_report_date: detailedReportDate }),
//           ...(selectedCleaner && { cleaner_id: selectedCleaner }),
//           ...(statusFilter !== "all" && { status_filter: statusFilter }),
//           ...(selectedLocation && { location_id: selectedLocation }),
//         };
//       }

//       const response = await ReportsApi.getReport(
//         selectedReport.endpoint,
//         params,
//       );

//       const hasData = response.data && response.data.length > 0;

//       if (response.success || response.status === "success") {
//         if (!hasData) {
//           setShowNoDataModal(true);
//           toast.error("No records found for selected filters");
//           return;
//         }

//         // ✅ Only show Report Modal if data exists
//         const defaultReportType =
//           response.metadata?.report_type || selectedReport.label;
//         const reportName = generateReportName(defaultReportType);

//         const enhancedMetadata = {
//           ...response.metadata,
//           report_type: reportName,
//           dynamic_report_name: reportName,
//         };

//         setReportData(response.data);
//         setReportMetadata(enhancedMetadata);
//         setShowModal(true);
//         toast.success("Report generated successfully!");
//       } else {
//         toast.error(response.error || "Failed to generate report");
//       }
//     } catch (error) {
//       console.error("Error generating report:", error);
//       toast.error("Failed to generate report");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setSelectedZone("");
//     setSelectedLocation("");
//     setSelectedCleaner("");
//     setStartDate(todayDate);
//     setEndDate(todayDate);
//     setStatusFilter("all");
//     setReportData([]);
//     setReportMetadata(null);
//     setShowModal(false);
//     setShowNoDataModal(false);

//     // ✅ Reload all data to original state
//     if (companyId) {
//       fetchLocations();
//       fetchCleaners();
//     }
//   };

//   const handleStartDateChange = (e) => {
//     const newStartDate = e.target.value;

//     // ✅ Check if start date is in future
//     if (newStartDate > todayDate) {
//       toast.error("Start date cannot be in the future");
//       return;
//     }

//     setStartDate(newStartDate);

//     // ✅ Special handling for Washroom Hygiene Trend (31-day limit)
//     if (selectedReportType === "washroom_hygiene_trend") {
//       const maxAllowedEndDate = getMaxEndDate(newStartDate);

//       // If current end date exceeds 31-day limit, adjust it
//       if (endDate && endDate > maxAllowedEndDate) {
//         setEndDate(maxAllowedEndDate);
//         toast;
//       }

//       // If end date is before new start date, set it to start date
//       if (endDate && endDate < newStartDate) {
//         setEndDate(newStartDate);
//         toast.error("End date adjusted to match start date");
//       }
//     } else {
//       // ✅ For other reports, only adjust if end date is before start date
//       if (endDate && newStartDate > endDate) {
//         setEndDate(newStartDate);
//         toast.error("End date adjusted to match start date");
//       }
//     }
//   };

//   const handleEndDateChange = (e) => {
//     const newEndDate = e.target.value;

//     // ✅ Check if end date is in future
//     if (newEndDate > todayDate) {
//       toast.error("End date cannot be in the future");
//       return;
//     }

//     // ✅ Check if end date is before start date
//     if (startDate && newEndDate < startDate) {
//       toast.error("End date cannot be before start date");
//       return;
//     }

//     // ✅ Special handling for Washroom Hygiene Trend (31-day limit)
//     if (selectedReportType === "washroom_hygiene_trend") {
//       const maxAllowedEndDate = getMaxEndDate(startDate);

//       if (newEndDate > maxAllowedEndDate) {
//         toast.error("Date range cannot exceed 31 days");
//         return;
//       }
//     }

//     setEndDate(newEndDate);
//   };

//   const handleDetailedReportDateChange = (e) => {
//     const newDate = e.target.value;

//     if (newDate > todayDate) {
//       setDetailedReportDate(todayDate);
//       toast.error("Date cannot be in the future");
//       return;
//     }

//     setDetailedReportDate(newDate);
//   };

//   const getMaxEndDate = (startDate) => {
//     console.log("in get max  end date");
//     if (!startDate) return new Date().toISOString().split("T")[0];

//     const maxDate = new Date(startDate);
//     maxDate.setDate(maxDate.getDate() + 31);

//     const today = new Date();

//     return maxDate > today
//       ? today.toISOString().split("T")[0]
//       : maxDate.toISOString().split("T")[0];
//   };

//   return (
//     <>
//       <Toaster position="top-right" />

//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="p-3 bg-blue-100 rounded-lg">
//                   <FileText className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-slate-800">
//                     Reports Dashboard
//                   </h1>
//                   <p className="text-sm text-slate-500 mt-1">
//                     Generate and export detailed reports
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* ✅ Permission Warning */}
//           {!canViewReports && (
//             <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
//               <div className="flex items-start gap-3">
//                 <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
//                 <div>
//                   <h4 className="text-sm font-semibold text-red-800 mb-1">
//                     No Permission
//                   </h4>
//                   <p className="text-sm text-red-700">
//                     You don't have permission to generate reports. Please
//                     contact your administrator.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Report Type Selector */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-slate-700 mb-2">
//                 <FileText className="w-4 h-4 inline mr-1" />
//                 Select Report Type
//               </label>
//               <div className="relative">
//                 <select
//                   value={selectedReportType}
//                   onChange={(e) => {
//                     setSelectedReportType(e.target.value);
//                     handleReset();
//                   }}
//                   className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
//                 >
//                   {REPORT_TYPES.map((report) => (
//                     <option key={report.value} value={report.value}>
//                       {report.label}
//                     </option>
//                   ))}
//                 </select>
//                 <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
//               </div>
//               <p className="text-xs text-slate-500 mt-2">
//                 {
//                   REPORT_TYPES.find((r) => r.value === selectedReportType)
//                     ?.description
//                 }
//               </p>
//             </div>
//           </div>

//           {/* Filters */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
//             <div className="flex items-center gap-2 mb-4">
//               <Filter className="w-5 h-5 text-blue-600" />
//               <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               {/* ✅ Zone Filter - With cascade effect */}
//               {flag &&
//                 (selectedReportType === "daily_task" ||
//                   selectedReportType === "detailed_cleaning" ||
//                   selectedReportType === "zone_wise") &&
//                 isPermitted && (
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       <MapPin className="w-4 h-4 inline mr-1" />
//                       Zone / Location Type
//                     </label>
//                     <select
//                       value={selectedZone}
//                       onChange={(e) => setSelectedZone(e.target.value)}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     >
//                       <option value="">All Zones</option>
//                       {zones.map((zone) => (
//                         <option key={zone.id} value={zone.id}>
//                           {zone.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 )}

//               {/* ✅ Location Filter - Shows loading state and filtered results */}
//               {(selectedReportType === "daily_task" ||
//                 selectedReportType === "detailed_cleaning" ||
//                 selectedReportType === "washroom_report" ||
//                 selectedReportType === "cleaner_report") && (
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     <MapPin className="w-4 h-4 inline mr-1" />
//                     Location / Washroom
//                     {loadingLocations && (
//                       <Loader2 className="w-3 h-3 animate-spin inline ml-2" />
//                     )}
//                   </label>
//                   <select
//                     value={selectedLocation}
//                     onChange={(e) => setSelectedLocation(e.target.value)}
//                     disabled={loadingLocations}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
//                   >
//                     <option value="">
//                       {loadingLocations ? "Loading..." : "All Locations"}
//                     </option>
//                     {locations.map((loc) => (
//                       <option key={loc.id} value={loc.id}>
//                         {loc.display_name}
//                       </option>
//                     ))}
//                   </select>
//                   {selectedZone &&
//                     locations.length === 0 &&
//                     !loadingLocations && (
//                       <p className="text-xs text-amber-600 mt-1">
//                         No locations found for selected zone
//                       </p>
//                     )}
//                 </div>
//               )}

//               {/* ✅ Cleaner Filter - Shows loading state and filtered results */}
//               {(selectedReportType === "daily_task" ||
//                 selectedReportType === "cleaner_report") && (
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Cleaner
//                     {loadingCleaners && (
//                       <Loader2 className="w-3 h-3 animate-spin inline ml-2" />
//                     )}
//                   </label>
//                   <select
//                     value={selectedCleaner}
//                     onChange={(e) => setSelectedCleaner(e.target.value)}
//                     disabled={loadingCleaners}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
//                   >
//                     <option value="">
//                       {loadingCleaners ? "Loading..." : "All Cleaners"}
//                     </option>
//                     {cleaners.map((cleaner) => (
//                       <option key={cleaner.id} value={cleaner.id}>
//                         {cleaner.name}
//                       </option>
//                     ))}
//                   </select>
//                   {selectedLocation &&
//                     cleaners.length === 0 &&
//                     !loadingCleaners && (
//                       <p className="text-xs text-amber-600 mt-1">
//                         No cleaners assigned to this washroom
//                       </p>
//                     )}
//                 </div>
//               )}

//               {/* ✅ Conditional Date Picker based on Report Type */}
//               {selectedReportType === "detailed_cleaning" ? (
//                 // Single Date for Detailed Cleaning Report
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     <Calendar className="w-4 h-4 inline mr-1" />
//                     Choose Date
//                   </label>
//                   <input
//                     type="date"
//                     value={detailedReportDate}
//                     max={todayDate}
//                     onChange={handleDetailedReportDateChange}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   />
//                   <p className="text-xs text-slate-500 mt-1">
//                     Select a single date for detailed report
//                   </p>
//                 </div>
//               ) : (
//                 // Date Range for Other Reports
//                 <>
//                   {/* Start Date */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       <Calendar className="w-4 h-4 inline mr-1" />
//                       Start Date
//                     </label>
//                     <input
//                       type="date"
//                       value={startDate}
//                       onChange={handleStartDateChange}
//                       max={endDate || todayDate}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                   </div>

//                   {/* End Date */}
//                   {/* End Date */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       <Calendar className="w-4 h-4 inline mr-1" />
//                       End Date
//                       {selectedReportType === "washroom_hygiene_trend" && (
//                         <span className="text-xs text-amber-600 ml-2">
//                           (Max 31 days from start)
//                         </span>
//                       )}
//                     </label>
//                     <input
//                       type="date"
//                       value={endDate}
//                       min={startDate}
//                       max={
//                         selectedReportType === "washroom_hygiene_trend"
//                           ? getMaxEndDate(startDate) // ✅ Dynamic 31-day limit
//                           : todayDate // ✅ Normal limit (today)
//                       }
//                       onChange={handleEndDateChange}
//                       className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                     />
//                     {selectedReportType === "washroom_hygiene_trend" &&
//                       startDate && (
//                         <p className="text-xs text-slate-500 mt-1">
//                           Max date: {getMaxEndDate(startDate)}
//                         </p>
//                       )}
//                   </div>
//                 </>
//               )}

//               {/* Status Filter */}
//               {(selectedReportType === "daily_task" ||
//                 selectedReportType === "washroom_report" ||
//                 selectedReportType === "cleaner_report") && (
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Status
//                   </label>
//                   <select
//                     value={statusFilter}
//                     onChange={(e) => setStatusFilter(e.target.value)}
//                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//                   >
//                     <option value="all">All Status</option>
//                     <option value="completed">Completed</option>
//                     <option value="ongoing">Ongoing</option>
//                   </select>
//                 </div>
//               )}
//             </div>

//             {/* Action Buttons */}
//             <div className="flex flex-wrap gap-3 mt-6">
//               <button
//                 onClick={generateReport}
//                 disabled={isLoading || !canViewReports}
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
//                 title={
//                   !canViewReports
//                     ? "You don't have permission to generate reports"
//                     : ""
//                 }
//               >
//                 {isLoading ? (
//                   <>
//                     <Loader2 className="w-4 h-4 animate-spin" />
//                     Generating...
//                   </>
//                 ) : (
//                   <>
//                     <FileText className="w-4 h-4" />
//                     Generate Report
//                   </>
//                 )}
//               </button>

//               <button
//                 onClick={handleReset}
//                 className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 Reset Filters
//               </button>
//             </div>
//           </div>

//           {/* Loading State */}
//           {isLoading && (
//             <div className="flex justify-center items-center h-96 bg-white rounded-lg border border-slate-200">
//               <Loader
//                 size="large"
//                 color="#3b82f6"
//                 message="Generating report..."
//               />
//             </div>
//           )}

//           {/* Empty State */}
//           {!isLoading && !showModal && !showNoDataModal && (
//             <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
//               <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//               <p className="text-slate-500 text-lg">No report generated yet</p>
//               <p className="text-slate-400 text-sm mt-2">
//                 Select your filters and click "Generate Report" to view data
//               </p>
//             </div>
//           )}
//         </div>
//       </div>
//       <NoDataModal
//         isOpen={showNoDataModal}
//         onClose={() => setShowNoDataModal(false)}
//         filters={getCurrentFilters()}
//       />
//       {/* Report Modal */}
//       {showModal && reportData && reportMetadata && (
//         <ReportModal
//           reportType={selectedReportType}
//           data={reportData}
//           metadata={reportMetadata}
//           onClose={() => setShowModal(false)}
//         />
//       )}
//     </>
//   );
// }
"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Filter,
  Calendar,
  MapPin,
  Loader2,
  ChevronDown,
  AlertCircle,
  X,
  Settings2,
  Check,
  ChevronRight,
  Users,
  Activity,
  ArrowRight,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ReportsApi from "@/features/reports/reports.api";
import ReportModal from "./components/ReportModal"; // Your existing modal
import { useSelector } from "react-redux";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

const REPORT_TYPES = [
  {
    value: "daily_task",
    label: "Cleaning Report",
    description: "View cleaner tasks with AI scores and compliance",
    endpoint: "daily-task",
  },
  {
    value: "washroom_report",
    label: "Washroom Report",
    description: "View single washroom report",
    endpoint: "washroom-report",
  },
  {
    value: "cleaner_report",
    label: "Cleaner Report",
    description: "View individual cleaner performance",
    endpoint: "cleaner-report",
  },
  {
    value: "detailed_cleaning",
    label: "Detailed Cleaning Report",
    description: "Aggregate performance metrics for cleaners.",
    endpoint: "detailed-cleaning",
  },
  {
    value: "washroom_hygiene_trend",
    label: "Washroom Hygiene Trend",
    description: "View daily hygiene scores across all washrooms",
    endpoint: "washroom-daily-scores",
  },
];

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// --- Helper Components for the new UI ---

const NoDataModal = ({ isOpen, onClose, filters }) => {
  if (!isOpen) return null;
  return (
    <div
      className="
    fixed inset-0
    flex items-center justify-center
    z-50 p-4
    bg-black/50 backdrop-blur-sm
  "
    >
      <div
        className="
      max-w-md w-full
      rounded-2xl
      animate-in fade-in zoom-in duration-200
      bg-[var(--surface)]
      border border-[var(--border)]
      shadow-[var(--card-shadow)]
    "
      >
        {/* Header */}
        <div
          className="
        flex items-center justify-between
        p-6
        border-b border-[var(--border)]
      "
        >
          <div className="flex items-center gap-3">
            <div
              className="
            p-2 rounded-xl
            bg-[var(--accent-yellow)]
          "
            >
              <AlertCircle className="w-6 h-6 text-[var(--washroom-primary)]" />
            </div>
            <h2 className="text-lg font-bold text-[var(--foreground)]">
              No Data Found
            </h2>
          </div>

          <button
            onClick={onClose}
            className="
          p-2 rounded-full
          transition-colors
          hover:bg-[var(--muted)]
        "
          >
            <X className="w-5 h-5 text-[var(--muted-foreground)]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm mb-4 text-[var(--muted-foreground)]">
            No records found for the selected filters.
          </p>

          <div
            className="
          rounded-xl p-4 mb-4
          bg-[var(--muted)]
          border border-[var(--border)]
        "
          >
            <p
              className="
            text-[10px] mb-2
            uppercase tracking-widest font-bold
            text-[var(--muted-foreground)]
          "
            >
              Current Filters
            </p>

            <div className="space-y-1 text-sm text-[var(--foreground)]">
              {filters.dateRange && (
                <p>
                  <span className="font-semibold">Date:</span>{" "}
                  {filters.dateRange}
                </p>
              )}
              {filters.location && (
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {filters.location}
                </p>
              )}
              {filters.cleaner && (
                <p>
                  <span className="font-semibold">Cleaner:</span>{" "}
                  {filters.cleaner}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="
          w-full py-3 rounded-xl
          font-bold text-sm
          transition-all
          bg-[var(--primary)]
          text-[var(--primary-foreground)]
          hover:opacity-90
        "
          >
            Adjust Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default function ReportsPage() {
  useRequirePermission(MODULES.REPORTS);

  const { canView } = usePermissions();
  const canViewReports = canView(MODULES.REPORTS);

  const { companyId } = useCompanyId();
  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;
  const isPermitted = userRoleId === 1 || userRoleId === 2;

  const todayDate = getTodayDate();

  // State Management
  const [selectedReportType, setSelectedReportType] = useState("daily_task");

  // Filters
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [cleaners, setCleaners] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingCleaners, setLoadingCleaners] = useState(false);

  const [selectedZone, setSelectedZone] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCleaner, setSelectedCleaner] = useState("");
  const [startDate, setStartDate] = useState(todayDate);
  const [endDate, setEndDate] = useState(todayDate);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detailedReportDate, setDetailedReportDate] = useState(todayDate);

  // Data & Modal States
  const [reportData, setReportData] = useState([]);
  const [reportMetadata, setReportMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showNoDataModal, setShowNoDataModal] = useState(false);

  // Flag for zone permission logic
  const [flag] = useState(true);

  // --- Effects (Data Fetching) ---
  useEffect(() => {
    if (companyId) {
      fetchZones();
      fetchLocations();
      fetchCleaners();
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId && selectedZone) {
      fetchLocationsByZone(selectedZone);
      setSelectedLocation("");
      setSelectedCleaner("");
    } else if (companyId && !selectedZone) {
      fetchLocations();
    }
  }, [selectedZone, companyId]);

  useEffect(() => {
    if (companyId && selectedLocation) {
      fetchCleanersByLocation(selectedLocation);
      setSelectedCleaner("");
    } else if (companyId && !selectedLocation && !selectedZone) {
      fetchCleaners();
    }
  }, [selectedLocation, companyId]);

  useEffect(() => {
    if (selectedReportType === "washroom_hygiene_trend") {
      const maxAllowedEndDate = getMaxEndDate(startDate);
      if (!endDate || endDate > maxAllowedEndDate) {
        setEndDate(maxAllowedEndDate);
        toast.success("End date set to max allowed (31 days)");
      }
    }
  }, [selectedReportType, startDate]);

  // --- API Functions ---
  const fetchZones = async () => {
    try {
      const response = await ReportsApi.getAvailableZones(companyId);
      if (response.success) setZones(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchLocations = async () => {
    setLoadingLocations(true);
    try {
      const response = await ReportsApi.getLocationsForReport(companyId);
      if (response.success) setLocations(response.data);
    } catch (error) {
      toast.error("Failed to load locations");
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchLocationsByZone = async (zoneId) => {
    setLoadingLocations(true);
    try {
      const response = await ReportsApi.getLocationsForReport(
        companyId,
        zoneId,
      );
      if (response.success) setLocations(response.data);
      else setLocations([]);
    } catch (error) {
      setLocations([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchCleaners = async () => {
    setLoadingCleaners(true);
    try {
      const response = await ReportsApi.getCleanersForReport(companyId);
      if (response.success) setCleaners(response.data);
    } catch (error) {
      toast.error("Failed to load cleaners");
    } finally {
      setLoadingCleaners(false);
    }
  };

  const fetchCleanersByLocation = async (locationId) => {
    setLoadingCleaners(true);
    try {
      const response = await ReportsApi.getCleanersForReport(
        companyId,
        locationId,
      );
      if (response.success) setCleaners(response.data);
      else setCleaners([]);
    } catch (error) {
      setCleaners([]);
    } finally {
      setLoadingCleaners(false);
    }
  };

  // --- Helper Logic ---
  const getMaxEndDate = (startDate) => {
    if (!startDate) return new Date().toISOString().split("T")[0];
    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + 31);
    const today = new Date();
    return maxDate > today
      ? today.toISOString().split("T")[0]
      : maxDate.toISOString().split("T")[0];
  };

  const generateReportName = (defaultReportType) => {
    const isSingleDate = startDate === endDate;
    let name = defaultReportType || "Report";
    // (Logic preserved from original, simplified for brevity in this snippet)
    return name;
  };

  const getCurrentFilters = () => ({
    zone: selectedZone ? zones.find((z) => z.id === selectedZone)?.name : null,
    location: selectedLocation
      ? locations.find((l) => l.id === selectedLocation)?.display_name
      : null,
    cleaner: selectedCleaner
      ? cleaners.find((c) => c.id === selectedCleaner)?.name
      : null,
    dateRange: `${startDate || "Start"} to ${endDate || "End"}`,
    status: statusFilter !== "all" ? statusFilter : null,
  });

  // --- Handlers ---
  const handleStartDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate > todayDate)
      return toast.error("Start date cannot be in the future");
    setStartDate(newDate);
    // Logic for end date adjustments preserved
    if (endDate && newDate > endDate) setEndDate(newDate);
  };

  const handleEndDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate > todayDate)
      return toast.error("End date cannot be in the future");
    if (startDate && newDate < startDate)
      return toast.error("End date cannot be before start date");
    setEndDate(newDate);
  };

  const handleDetailedReportDateChange = (e) => {
    const newDate = e.target.value;

    if (newDate > todayDate) {
      setDetailedReportDate(todayDate);
      toast.error("Date cannot be in the future");
      return;
    }

    setDetailedReportDate(newDate);
  };

  const handleReset = () => {
    setSelectedZone("");
    setSelectedLocation("");
    setSelectedCleaner("");
    setStartDate(todayDate);
    setEndDate(todayDate);
    setStatusFilter("all");
    if (companyId) {
      fetchLocations();
      fetchCleaners();
    }
  };

  // --- Generate Report Function (Preserved) ---
  const generateReport = async () => {
    if (!canViewReports) return toast.error("You don't have permission");
    if (!companyId) return toast.error("Company ID is required");

    setIsLoading(true);
    try {
      const selectedReport = REPORT_TYPES.find(
        (r) => r.value === selectedReportType,
      );
      let effectiveStartDate = startDate || todayDate;
      let effectiveEndDate = endDate || todayDate;

      let params = {
        company_id: companyId,
        start_date: effectiveStartDate,
        end_date: effectiveEndDate,
      };

      // Construct Params based on Report Type
      if (selectedReportType === "daily_task") {
        params = {
          ...params,
          ...(selectedLocation && { location_id: selectedLocation }),
          ...(selectedCleaner && { cleaner_id: selectedCleaner }),
          ...(selectedZone && { type_id: selectedZone }),
          ...(statusFilter !== "all" && { status_filter: statusFilter }),
        };
      } else if (selectedReportType === "zone_wise") {
        params = { ...params, ...(selectedZone && { type_id: selectedZone }) };
      } else if (selectedReportType === "washroom_report") {
        params = {
          ...params,
          ...(selectedLocation && { location_id: selectedLocation }),
          ...(statusFilter !== "all" && { status_filter: statusFilter }),
        };
      } else if (selectedReportType === "cleaner_report") {
        params = {
          ...params,
          ...(selectedCleaner && { cleaner_id: selectedCleaner }),
          ...(selectedLocation && { location_id: selectedLocation }),
          ...(statusFilter !== "all" && { status_filter: statusFilter }),
        };
      } else if (selectedReportType === "detailed_cleaning") {
        params = {
          company_id: companyId,
          ...(detailedReportDate && {
            detailed_report_date: detailedReportDate,
          }),
          ...(selectedCleaner && { cleaner_id: selectedCleaner }),
          ...(statusFilter !== "all" && { status_filter: statusFilter }),
          ...(selectedLocation && { location_id: selectedLocation }),
        };
      }

      const response = await ReportsApi.getReport(
        selectedReport.endpoint,
        params,
      );

      if (response.success || response.status === "success") {
        if (!response.data || response.data.length === 0) {
          setShowNoDataModal(true);
        } else {
          const defaultReportType =
            response.metadata?.report_type || selectedReport.label;
          const reportName = generateReportName(defaultReportType);
          const enhancedMetadata = {
            ...response.metadata,
            report_type: reportName,
            dynamic_report_name: reportName,
          };

          setReportData(response.data);
          setReportMetadata(enhancedMetadata);
          setShowModal(true); // ✅ Triggers your existing ReportModal
          toast.success("Report generated successfully!");
        }
      } else {
        toast.error(response.error || "Failed to generate report");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div
        className="
    min-h-screen
    p-4 md:p-8
    font-sans
    bg-[var(--background)]
  "
      >

        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div
                className="
        p-3 rounded-xl
        bg-[var(--report-surface)]
        border border-[var(--report-border)]
        shadow-[var(--report-shadow)]
      "
              >
                <FileText className="w-6 h-6 text-[var(--primary)]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[var(--report-title)]">
                  ANALYTICS REPORTS
                </h1>
                <p className="text-sm font-medium mt-1 text-[var(--report-subtitle)]">
                  Select a module and configure parameters to generate insights
                </p>
              </div>
            </div>
          </div>


          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Sidebar Selection */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div
                className="
      rounded-2xl p-2 sticky top-6
      bg-[var(--report-surface)]
      border border-[var(--report-border)]
      shadow-[var(--report-shadow)]
    "
              >
                <div className="flex items-center gap-2 px-4 py-3 mb-2">
                  <Filter size={16} className="text-[var(--report-subtitle)]" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-[var(--report-subtitle)]">
                    Report Modules
                  </span>
                </div>

                <div className="space-y-1">
                  {REPORT_TYPES.map((report) => {
                    const isActive = selectedReportType === report.value;

                    return (
                      <button
                        key={report.value}
                        onClick={() => {
                          setSelectedReportType(report.value);
                          handleReset();
                        }}
                        className={`
              w-full px-4 py-4 rounded-xl border transition-all
              flex items-center justify-between text-left outline-none
              ${isActive
                            ? `
                    bg-[var(--report-sidebar-active-bg)]
                    border-[var(--report-sidebar-active-border)]
                    text-[var(--report-sidebar-active-text)]
                    shadow-[var(--report-shadow)]
                  `
                            : `
                    bg-transparent
                    border-transparent
                    text-[var(--foreground)]
                    hover:bg-[var(--report-sidebar-hover)]
                  `
                          }
            `}
                      >
                        <span className="text-xs font-bold tracking-tight">
                          {report.label}
                        </span>

                        {isActive ? (
                          <Check
                            size={16}
                            className="text-[var(--report-sidebar-active-text)]"
                          />
                        ) : (
                          <ChevronRight
                            size={16}
                            className="
                  text-[var(--muted-foreground)]
                  opacity-0 group-hover:opacity-100
                  transition-opacity
                "
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>


            {/* RIGHT COLUMN: Configuration Card */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div
                className="
      h-full p-6 md:p-8 rounded-2xl
      bg-[var(--report-surface)]
      border border-[var(--report-border)]
      shadow-[var(--report-shadow)]
    "
              >
                {/* Config Header */}
                <div
                  className="
        flex items-center gap-3 mb-8 pb-6
        border-b border-[var(--report-divider)]
      "
                >
                  <div className="p-2 rounded-lg bg-[var(--muted)]">
                    <Settings2 size={20} className="text-[var(--primary)]" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase text-[var(--report-title)]">
                      Configure{" "}
                      {
                        REPORT_TYPES.find((r) => r.value === selectedReportType)?.label
                      }
                    </h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5 text-[var(--report-subtitle)]">
                      Define your filters
                    </p>
                  </div>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mb-8">

                  {/* Zone Selection */}
                  {flag &&
                    (selectedReportType === "daily_task" ||
                      selectedReportType === "detailed_cleaning" ||
                      selectedReportType === "zone_wise") &&
                    isPermitted && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--report-subtitle)]">
                          <MapPin size={14} className="text-[var(--primary)]" /> Zone
                        </label>
                        <div className="relative">
                          <select
                            value={selectedZone}
                            onChange={(e) => setSelectedZone(e.target.value)}
                            className="
                  w-full px-4 py-3 text-sm font-medium rounded-xl
                  bg-[var(--report-input-bg)]
                  border border-[var(--report-input-border)]
                  text-[var(--report-input-text)]
                  focus:border-[var(--report-input-focus)]
                  outline-none appearance-none transition-all
                "
                          >
                            <option value="">All Zones</option>
                            {zones.map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--report-input-placeholder)] pointer-events-none"
                          />
                        </div>
                      </div>
                    )}

                  {/* Location Selection */}
                  {[
                    "daily_task",
                    "detailed_cleaning",
                    "washroom_report",
                    "cleaner_report",
                  ].includes(selectedReportType) && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--report-subtitle)]">
                          <MapPin size={14} className="text-[var(--primary)]" />
                          Location
                          {loadingLocations && (
                            <Loader2 size={12} className="animate-spin ml-2" />
                          )}
                        </label>
                        <div className="relative">
                          <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            disabled={loadingLocations}
                            className="
                w-full px-4 py-3 text-sm font-medium rounded-xl
                bg-[var(--report-input-bg)]
                border border-[var(--report-input-border)]
                text-[var(--report-input-text)]
                focus:border-[var(--report-input-focus)]
                outline-none appearance-none transition-all
                disabled:opacity-60
              "
                          >
                            <option value="">
                              {loadingLocations ? "Loading..." : "All Locations"}
                            </option>
                            {locations.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.display_name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--report-input-placeholder)] pointer-events-none"
                          />
                        </div>
                      </div>
                    )}

                  {/* Cleaner Selection */}
                  {[
                    "daily_task",
                    "cleaner_report",
                    "detailed_cleaning",
                  ].includes(selectedReportType) && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--report-subtitle)]">
                          <Users size={14} className="text-[var(--primary)]" />
                          Cleaner
                          {loadingCleaners && (
                            <Loader2 size={12} className="animate-spin ml-2" />
                          )}
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCleaner}
                            onChange={(e) => setSelectedCleaner(e.target.value)}
                            disabled={loadingCleaners}
                            className="
                w-full px-4 py-3 text-sm font-medium rounded-xl
                bg-[var(--report-input-bg)]
                border border-[var(--report-input-border)]
                text-[var(--report-input-text)]
                focus:border-[var(--report-input-focus)]
                outline-none appearance-none transition-all
                disabled:opacity-60
              "
                          >
                            <option value="">
                              {loadingCleaners ? "Loading..." : "All Cleaners"}
                            </option>
                            {cleaners.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--report-input-placeholder)] pointer-events-none"
                          />
                        </div>
                      </div>
                    )}

                  {/* Status Selection */}
                  {[
                    "daily_task",
                    "washroom_report",
                    "cleaner_report",
                    "detailed_cleaning",
                  ].includes(selectedReportType) && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--report-subtitle)]">
                          <Activity size={14} className="text-[var(--primary)]" />
                          Status
                        </label>
                        <div className="relative">
                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="
                w-full px-4 py-3 text-sm font-medium rounded-xl
                bg-[var(--report-input-bg)]
                border border-[var(--report-input-border)]
                text-[var(--report-input-text)]
                focus:border-[var(--report-input-focus)]
                outline-none appearance-none transition-all
              "
                          >
                            <option value="all">All Status</option>
                            <option value="completed">Completed</option>
                            <option value="ongoing">Ongoing</option>
                          </select>
                          <ChevronDown
                            size={16}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--report-input-placeholder)] pointer-events-none"
                          />
                        </div>
                      </div>
                    )}

                  {/* Date Pickers */}
                  {selectedReportType === "detailed_cleaning" ? (
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--report-subtitle)]">
                        <Calendar size={14} className="text-[var(--primary)]" />
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={detailedReportDate}
                        max={todayDate}
                        onChange={handleDetailedReportDateChange}
                        className="
              w-full px-4 py-3 text-sm font-medium rounded-xl
              bg-[var(--report-input-bg)]
              border border-[var(--report-input-border)]
              text-[var(--report-input-text)]
              focus:border-[var(--report-input-focus)]
              outline-none transition-all
            "
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--report-subtitle)]">
                          <Calendar size={14} className="text-[var(--primary)]" />
                          Start Date
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          max={endDate || todayDate}
                          onChange={handleStartDateChange}
                          className="
                w-full px-4 py-3 text-sm font-medium rounded-xl
                bg-[var(--report-input-bg)]
                border border-[var(--report-input-border)]
                text-[var(--report-input-text)]
                focus:border-[var(--report-input-focus)]
                outline-none transition-all
              "
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-wide flex items-center gap-2 text-[var(--report-subtitle)]">
                          <Calendar size={14} className="text-[var(--primary)]" />
                          End Date
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          min={startDate}
                          max={
                            selectedReportType === "washroom_hygiene_trend"
                              ? getMaxEndDate(startDate)
                              : todayDate
                          }
                          onChange={handleEndDateChange}
                          className="
                w-full px-4 py-3 text-sm font-medium rounded-xl
                bg-[var(--report-input-bg)]
                border border-[var(--report-input-border)]
                text-[var(--report-input-text)]
                focus:border-[var(--report-input-focus)]
                outline-none transition-all
              "
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Footer Buttons */}
                <div
                  className="
        flex justify-end gap-3 pt-6
        border-t border-[var(--report-divider)]
      "
                >
                  <button
                    onClick={handleReset}
                    className="
          px-6 py-3 rounded-xl
          border border-[var(--report-btn-secondary-border)]
          bg-[var(--report-btn-secondary-bg)]
          text-[var(--report-btn-secondary-text)]
          font-bold text-[11px] uppercase tracking-widest
          hover:bg-[var(--muted)]
          transition-all
        "
                  >
                    Reset Filters
                  </button>

                  <button
                    onClick={generateReport}
                    disabled={isLoading || !canViewReports}
                    style={{
                      backgroundImage: "var(--report-btn-primary-bg)",
                    }}
                    className="
    px-8 py-3 rounded-xl
    text-[var(--report-btn-primary-text)]
    font-bold text-[11px] uppercase tracking-widest
    shadow-[var(--report-shadow)]
    transition-all
    flex items-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
  "
                    onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundImage =
                      "var(--report-btn-primary-hover-bg)")
                    }
                    onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundImage =
                      "var(--report-btn-primary-bg)")
                    }
                  >
                    {isLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ArrowRight size={16} />
                    )}
                    {isLoading ? "Generating..." : "Generate Report"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- MODALS (Preserved Logic) --- */}
      <NoDataModal
        isOpen={showNoDataModal}
        onClose={() => setShowNoDataModal(false)}
        filters={getCurrentFilters()}
      />

      {/* Existing Report Modal is triggered here */}
      {showModal && reportData && reportMetadata && (
        <ReportModal
          reportType={selectedReportType}
          data={reportData}
          metadata={reportMetadata}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
