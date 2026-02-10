// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import {
//   Users,
//   Mail,
//   Phone,
//   Calendar,
//   MapPin,
//   Eye,
//   Edit,
//   Trash2,
//   AlertTriangle,
//   ArrowLeft,
//   UserCheck,
//   UserPlus,
//   Search,
//   ToggleLeft,
//   ToggleRight,
// } from "lucide-react";
// import { AssignmentsApi } from "@/features/assignments/assignments.api";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import Loader from "@/components/ui/Loader";
// import toast, { Toaster } from "react-hot-toast";
// import { useSelector } from "react-redux";

// export default function CleanersPage() {
//   const [assignments, setAssignments] = useState([]);
//   const [filteredAssignments, setFilteredAssignments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deleteModal, setDeleteModal] = useState({
//     open: false,
//     assignment: null,
//   });
//   const [deleting, setDeleting] = useState(false);
//   const [togglingStatus, setTogglingStatus] = useState(null);
//   const [statusModal, setStatusModal] = useState({
//     open: false,
//     assignment: null,
//   });
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { companyId } = useCompanyId();

//   const locationId = searchParams.get("locationId");
//   const locationName = searchParams.get("locationName");

//   const user = useSelector((state) => state.auth.user);
//   const userRoleId = user?.role_id;
//   const isPermitted = userRoleId === 1 || userRoleId === 2;

//   useEffect(() => {
//     if (!locationId || !companyId) {
//       setLoading(false);
//       return;
//     }
//     fetchAssignments();
//     // eslint-disable-next-line
//   }, [locationId, companyId]);

//   useEffect(() => {
//     let filtered = [...assignments];
//     if (searchQuery) {
//       const query = searchQuery.toLowerCase();
//       filtered = filtered.filter((assignment) => {
//         const cleanerName = assignment.cleaner_user?.name?.toLowerCase() || "";
//         const cleanerEmail =
//           assignment.cleaner_user?.email?.toLowerCase() || "";
//         const cleanerPhone =
//           assignment.cleaner_user?.phone?.toLowerCase() || "";

//         return (
//           cleanerName.includes(query) ||
//           cleanerEmail.includes(query) ||
//           cleanerPhone.includes(query)
//         );
//       });
//     }
//     if (statusFilter !== "all") {
//       filtered = filtered.filter(
//         (assignment) =>
//           assignment.status?.toLowerCase() === statusFilter.toLowerCase(),
//       );
//     }
//     setFilteredAssignments(filtered);
//   }, [searchQuery, statusFilter, assignments]);

//   const fetchAssignments = async () => {
//     setLoading(true);
//     try {
//       const response = await AssignmentsApi.getAssignmentsByLocation(
//         locationId,
//         companyId,
//       );
//       if (response.success) {
//         const filteredCleaners = response.data.filter(
//           (item) => item.role_id === 5,
//         );
//         setAssignments(filteredCleaners);
//         setFilteredAssignments(filteredCleaners);
//       } else {
//         toast.error(response.error || "Failed to fetch assignments");
//       }
//     } catch (error) {
//       toast.error("Failed to fetch assignments");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleView = (assignmentId) => {
//     router.push(
//       `/assignments/cleaner/${assignmentId}?companyId=${companyId}&locationId=${locationId}`,
//     );
//   };

//   const handleEdit = (assignmentId) => {
//     router.push(
//       `/assignments/cleaner/${assignmentId}/edit?companyId=${companyId}&locationId=${locationId}`,
//     );
//   };

//   const handleAddCleaner = () => {
//     router.push(
//       `/assignments/cleaner/add?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`,
//     );
//   };

//   const handleToggleStatus = async (assignment) => {
//     setTogglingStatus(assignment.id);
//     try {
//       const currentStatus = assignment.status?.toLowerCase() || "unassigned";
//       const newStatus =
//         currentStatus === "assigned" ? "unassigned" : "assigned";
//       const updateData = { status: newStatus };
//       const response = await AssignmentsApi.updateAssignment(
//         assignment.id,
//         updateData,
//       );
//       if (response.success) {
//         toast.success(`Status changed to ${newStatus}`);
//         setAssignments((prevAssignments) =>
//           prevAssignments.map((a) =>
//             a.id === assignment.id ? { ...a, status: newStatus } : a,
//           ),
//         );
//       } else {
//         toast.error(response.error || "Failed to update status");
//       }
//     } catch (error) {
//       toast.error("Failed to update status");
//     } finally {
//       setTogglingStatus(null);
//     }
//   };

//   const confirmStatusToggle = async () => {
//     if (!statusModal.assignment) return;
//     const assignment = statusModal.assignment;
//     setTogglingStatus(assignment.id);
//     try {
//       const currentStatus = assignment.status?.toLowerCase() || "unassigned";
//       const newStatus =
//         currentStatus === "assigned" ? "unassigned" : "assigned";
//       const updateData = { status: newStatus };
//       const response = await AssignmentsApi.updateAssignment(
//         assignment.id,
//         updateData,
//       );
//       if (response.success) {
//         toast.success(`Status changed to ${newStatus}`);
//         setAssignments((prevAssignments) =>
//           prevAssignments.map((a) =>
//             a.id === assignment.id ? { ...a, status: newStatus } : a,
//           ),
//         );
//         setStatusModal({ open: false, assignment: null });
//       } else {
//         toast.error(response.error || "Failed to update status");
//       }
//     } catch (error) {
//       toast.error("Failed to update status");
//     } finally {
//       setTogglingStatus(null);
//     }
//   };

//   const handleDelete = (assignment) => {
//     setDeleteModal({ open: true, assignment });
//   };

//   const confirmDelete = async () => {
//     if (!deleteModal.assignment) return;
//     const assignmentId = deleteModal.assignment.id;
//     const cleanerName = deleteModal.assignment.cleaner_user?.name || "Cleaner";
//     setDeleting(true);
//     try {
//       const response = await AssignmentsApi.deleteAssignment(assignmentId);
//       if (response.success) {
//         toast.success(`${cleanerName} removed successfully`);
//         setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
//         setDeleteModal({ open: false, assignment: null });
//       } else {
//         toast.error(response.error || "Failed to remove assignment");
//       }
//     } catch (error) {
//       toast.error("Failed to remove assignment");
//     } finally {
//       setDeleting(false);
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status?.toLowerCase()) {
//       case "assigned":
//         return "bg-green-100 text-green-700";
//       case "active":
//         return "bg-blue-100 text-blue-700";
//       case "unassigned":
//         return "bg-gray-100 text-gray-700";
//       case "released":
//         return "bg-red-100 text-red-700";
//       default:
//         return "bg-slate-100 text-slate-700";
//     }
//   };

//   const clearFilters = () => {
//     setSearchQuery("");
//     setStatusFilter("all");
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader size="large" color="#3b82f6" message="Loading cleaners..." />
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster position="top-right" />
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-3 sm:p-4 md:p-6">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mb-6">
//             <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6">
//               <div className="flex items-center justify-between flex-wrap gap-4">
//                 <div className="flex items-center gap-4">
//                   <button
//                     onClick={() => router.back()}
//                     className="cursor-pointer p-2 hover:bg-white/10 rounded-lg transition-colors"
//                   >
//                     <ArrowLeft className="h-5 w-5 text-white" />
//                   </button>
//                   <div>
//                     <h1 className="text-2xl font-bold text-white">
//                       Assigned Cleaners
//                     </h1>
//                     {locationName && (
//                       <p className="text-slate-300 text-sm mt-1">
//                         <MapPin className="inline h-4 w-4 mr-1" />
//                         {locationName}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <div className="bg-white/10 px-4 py-2 rounded-lg">
//                     <div className="text-white text-sm">
//                       <span className="font-bold text-lg">
//                         {filteredAssignments.length}
//                       </span>
//                       <span className="ml-1">of {assignments.length}</span>
//                     </div>
//                   </div>
//                   {isPermitted && (
//                     <button
//                       onClick={handleAddCleaner}
//                       className=" cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
//                     >
//                       <UserPlus className="h-4 w-4" />
//                       <span>Add Cleaner</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//             {/* Filters Section */}
//             <div className="p-4 bg-slate-50 border-b border-slate-200">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 {/* Search */}
//                 <div className="relative flex-1">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
//                   <input
//                     type="text"
//                     placeholder="Search by name, email, or phone..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
//                   />
//                 </div>
//                 {/* Status Filter */}
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="assigned">Assigned</option>
//                   <option value="unassigned">Unassigned</option>
//                 </select>
//                 {/* Clear Filters */}
//                 {(searchQuery || statusFilter !== "all") && (
//                   <button
//                     onClick={clearFilters}
//                     className=" cursor-pointer px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
//                   >
//                     Clear Filters
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//           {/* --- Responsive Listing Section --- */}
//           {/* Table View: Desktop/Tablet */}
//           <div className="hidden sm:block bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
//             {filteredAssignments.length === 0 ? (
//               <div className="p-12 text-center">
//                 <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-slate-600 mb-2">
//                   {assignments.length === 0
//                     ? "No Cleaners Assigned"
//                     : "No Results Found"}
//                 </h3>
//                 <p className="text-slate-500 mb-4">
//                   {assignments.length === 0
//                     ? "No cleaners are currently assigned to this washroom."
//                     : "Try adjusting your search or filters."}
//                 </p>
//                 {assignments.length === 0 && (
//                   <button
//                     onClick={handleAddCleaner}
//                     className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
//                   >
//                     <UserPlus className="h-4 w-4" />
//                     Add First Cleaner
//                   </button>
//                 )}
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="bg-slate-50 border-b border-slate-200">
//                       <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
//                         Sr. No.
//                       </th>
//                       <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
//                         Cleaner Name
//                       </th>
//                       <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
//                         Phone
//                       </th>
//                       <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
//                         Status
//                       </th>
//                       <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">
//                         Assigned On
//                       </th>
//                       <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredAssignments.map((assignment, index) => (
//                       <tr
//                         key={assignment.id}
//                         className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
//                       >
//                         <td className="py-4 px-6 text-sm text-slate-600 font-medium">
//                           {index + 1}
//                         </td>
//                         <td className="py-4 px-6">
//                           <div className="flex items-center gap-2">
//                             <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                               <Users className="h-4 w-4 text-blue-600" />
//                             </div>
//                             <span className="font-medium text-slate-800">
//                               {assignment.cleaner_user?.name || "Unknown"}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="py-4 px-6">
//                           {assignment.cleaner_user?.phone ? (
//                             <div className="flex items-center gap-2 text-sm text-slate-600">
//                               <Phone className="h-3 w-3 text-slate-400" />
//                               <span>{assignment.cleaner_user.phone}</span>
//                             </div>
//                           ) : (
//                             <span className="text-sm text-slate-400">N/A</span>
//                           )}
//                         </td>
//                         <td className="py-4 px-6">
//                           <button
//                             onClick={() =>
//                               setStatusModal({
//                                 open: true,
//                                 assignment: assignment,
//                               })
//                             }
//                             disabled={togglingStatus === assignment.id}
//                             className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
//                               assignment.status?.toLowerCase() === "assigned"
//                                 ? "bg-green-100 text-green-700 hover:bg-green-200"
//                                 : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                             } disabled:opacity-50 disabled:cursor-not-allowed`}
//                             title="Click to toggle status"
//                           >
//                             {togglingStatus === assignment.id ? (
//                               <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
//                             ) : assignment.status?.toLowerCase() ===
//                               "assigned" ? (
//                               <ToggleRight className="w-3 h-3 cursor-pointer" />
//                             ) : (
//                               <ToggleLeft className="w-3 h-3 cursor-pointer" />
//                             )}
//                             {assignment.status || "N/A"}
//                           </button>
//                         </td>
//                         <td className="py-4 px-6 text-sm text-slate-600">
//                           {new Date(assignment.assigned_on).toLocaleDateString(
//                             "en-US",
//                             {
//                               year: "numeric",
//                               month: "short",
//                               day: "numeric",
//                             },
//                           )}
//                         </td>
//                         <td className="py-4 px-6">
//                           <div className="flex justify-center gap-2">
//                             <button
//                               onClick={() => handleView(assignment.id)}
//                               className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                               title="View Details"
//                             >
//                               <Eye className="h-4 w-4" />
//                             </button>
//                             {isPermitted && (
//                               <button
//                                 onClick={() => handleDelete(assignment)}
//                                 className="cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                 title="Remove Assignment"
//                               >
//                                 <Trash2 className="h-4 w-4" />
//                               </button>
//                             )}
//                           </div>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//             {filteredAssignments.length > 0 && (
//               <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
//                 <div className="flex justify-between items-center text-sm text-slate-600">
//                   <span className="font-medium">
//                     Showing {filteredAssignments.length} of {assignments.length}{" "}
//                     cleaner{assignments.length !== 1 ? "s" : ""}
//                   </span>
//                   <span>Last updated: {new Date().toLocaleTimeString()}</span>
//                 </div>
//               </div>
//             )}
//           </div>
//           {/* Card View: Mobile */}
//           <div className="block sm:hidden">
//             {filteredAssignments.length === 0 ? (
//               <div className="p-8 text-center">
//                 <UserCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
//                 <div className="font-medium text-slate-600">
//                   {assignments.length === 0
//                     ? "No Cleaners Assigned"
//                     : "No Results Found"}
//                 </div>
//                 <div className="text-slate-400 mb-4">
//                   {assignments.length === 0
//                     ? "No cleaners are currently assigned to this washroom."
//                     : "Try adjusting your search or filters."}
//                 </div>
//                 {assignments.length === 0 && (
//                   <button
//                     onClick={handleAddCleaner}
//                     className=" cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
//                   >
//                     <UserPlus className="h-4 w-4" />
//                     Add First Cleaner
//                   </button>
//                 )}
//               </div>
//             ) : (
//               filteredAssignments.map((assignment, idx) => (
//                 <div
//                   key={assignment.id}
//                   className="mb-4 p-4 rounded-xl bg-white border border-slate-200 shadow"
//                 >
//                   <div className="flex items-center gap-3 mb-2">
//                     <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
//                       <Users className="h-4 w-4 text-blue-600" />
//                     </div>
//                     <div>
//                       <div className="font-medium text-slate-800">
//                         {assignment.cleaner_user?.name || "Unknown"}
//                       </div>
//                       {assignment.cleaner_user?.phone && (
//                         <div className="text-xs text-slate-500">
//                           {assignment.cleaner_user.phone}
//                         </div>
//                       )}
//                     </div>
//                     <span
//                       className={`ml-auto inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(assignment.status)}`}
//                     >
//                       {assignment.status || "N/A"}
//                     </span>
//                   </div>
//                   <div className="mb-2 text-sm text-slate-600">
//                     Assigned on:{" "}
//                     {new Date(assignment.assigned_on).toLocaleDateString(
//                       "en-US",
//                       {
//                         year: "numeric",
//                         month: "short",
//                         day: "numeric",
//                       },
//                     )}
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleView(assignment.id)}
//                       className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
//                       title="View Details"
//                     >
//                       <Eye className="h-4 w-4" />
//                     </button>
//                     <button
//                       onClick={() => setStatusModal({ open: true, assignment })}
//                       disabled={togglingStatus === assignment.id}
//                       className={` cursor-pointer p-2 rounded-lg transition-colors ${
//                         assignment.status?.toLowerCase() === "assigned"
//                           ? "bg-green-100 text-green-700 hover:bg-green-200"
//                           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                       }`}
//                       title="Toggle Status"
//                     >
//                       {togglingStatus === assignment.id ? (
//                         <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
//                       ) : assignment.status?.toLowerCase() === "assigned" ? (
//                         <ToggleRight className="w-4 h-4" />
//                       ) : (
//                         <ToggleLeft className="w-4 h-4" />
//                       )}
//                     </button>
//                     {isPermitted && (
//                       <button
//                         onClick={() => handleDelete(assignment)}
//                         className=" cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg"
//                         title="Remove Assignment"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))
//             )}
//             {filteredAssignments.length > 0 && (
//               <div className="text-center py-4 text-slate-600 text-sm">
//                 Showing {filteredAssignments.length} of {assignments.length}{" "}
//                 cleaner{assignments.length !== 1 ? "s" : ""}
//               </div>
//             )}
//           </div>
//           {/* --- Modals (unchanged logic) --- */}
//           {/* ...Status and Delete modal code remains unchanged... */}
//         </div>
//       </div>
//       {/* Status Confirmation Modal */}
//       {statusModal.open && (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
//             <div className="flex items-start gap-4 mb-4">
//               <div
//                 className={`p-3 rounded-full ${
//                   statusModal.assignment?.status?.toLowerCase() === "assigned"
//                     ? "bg-gray-100"
//                     : "bg-green-100"
//                 }`}
//               >
//                 {statusModal.assignment?.status?.toLowerCase() ===
//                 "assigned" ? (
//                   <ToggleLeft className="h-6 w-6 text-gray-600" />
//                 ) : (
//                   <ToggleRight className="h-6 w-6 text-green-600" />
//                 )}
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-slate-800 mb-1">
//                   Change Assignment Status
//                 </h3>
//                 <p className="text-slate-600 text-sm">
//                   Confirm status change for this cleaner
//                 </p>
//               </div>
//             </div>

//             <div className="mb-6">
//               <p className="text-slate-700">
//                 Are you sure you want to change{" "}
//                 <strong>{statusModal.assignment?.cleaner_user?.name}</strong>'s
//                 status to{" "}
//                 <strong
//                   className={
//                     statusModal.assignment?.status?.toLowerCase() === "assigned"
//                       ? "text-gray-700"
//                       : "text-green-700"
//                   }
//                 >
//                   {statusModal.assignment?.status?.toLowerCase() === "assigned"
//                     ? "Unassigned"
//                     : "Assigned"}
//                 </strong>
//                 ?
//               </p>
//             </div>

//             <div className="flex gap-3 justify-end">
//               <button
//                 onClick={() =>
//                   setStatusModal({ open: false, assignment: null })
//                 }
//                 className=" cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
//                 disabled={togglingStatus === statusModal.assignment?.id}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmStatusToggle}
//                 disabled={togglingStatus === statusModal.assignment?.id}
//                 className={` cursor-pointer px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 font-medium ${
//                   statusModal.assignment?.status?.toLowerCase() === "assigned"
//                     ? "bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400"
//                     : "bg-green-600 hover:bg-green-700 disabled:bg-green-400"
//                 }`}
//               >
//                 {togglingStatus === statusModal.assignment?.id && (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 )}
//                 {togglingStatus === statusModal.assignment?.id
//                   ? "Processing..."
//                   : "Confirm Change"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Modal */}
//       {deleteModal.open && (
//         <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
//             <div className="flex items-start gap-4 mb-4">
//               <div className="p-3 bg-red-100 rounded-full">
//                 <AlertTriangle className="h-6 w-6 text-red-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-slate-800 mb-1">
//                   Remove Assignment
//                 </h3>
//                 <p className="text-slate-600 text-sm">
//                   This action cannot be undone
//                 </p>
//               </div>
//             </div>

//             <div className="mb-6">
//               <p className="text-slate-700">
//                 Are you sure you want to remove{" "}
//                 <strong>{deleteModal.assignment?.cleaner_user?.name}</strong>{" "}
//                 from this washroom?
//               </p>
//             </div>

//             <div className="flex gap-3 justify-end">
//               <button
//                 onClick={() =>
//                   setDeleteModal({ open: false, assignment: null })
//                 }
//                 className="cursor-pointer px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
//                 disabled={deleting}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 disabled={deleting}
//                 className=" cursor-pointer px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:bg-red-400"
//               >
//                 {deleting && (
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 )}
//                 {deleting ? "Removing..." : "Remove"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }\

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users,
  Phone,
  Calendar,
  MapPin,
  Eye,
  Trash2,
  AlertTriangle,
  ArrowLeft,
  UserCheck,
  UserPlus,
  Search,
  Grid3x3,
  List,
  Mail,
  Clock,
} from "lucide-react";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

export default function CleanersPage() {
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
  const [viewMode, setViewMode] = useState("grid");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const locationId = searchParams.get("locationId");
  const locationName = searchParams.get("locationName");

  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;
  const isPermitted = userRoleId === 1 || userRoleId === 2;

  // ... all your existing useEffect and functions remain exactly the same ...

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
      filtered = filtered.filter((assignment) => {
        const cleanerName = assignment.cleaner_user?.name?.toLowerCase() || "";
        const cleanerEmail =
          assignment.cleaner_user?.email?.toLowerCase() || "";
        const cleanerPhone =
          assignment.cleaner_user?.phone?.toLowerCase() || "";

        return (
          cleanerName.includes(query) ||
          cleanerEmail.includes(query) ||
          cleanerPhone.includes(query)
        );
      });
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (assignment) =>
          assignment.status?.toLowerCase() === statusFilter.toLowerCase(),
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
      );
      if (response.success) {
        const filteredCleaners = response.data.filter(
          (item) => item.role_id === 5,
        );
        setAssignments(filteredCleaners);
        setFilteredAssignments(filteredCleaners);
      } else {
        toast.error(response.error || "Failed to fetch assignments");
      }
    } catch (error) {
      toast.error("Failed to fetch assignments");
    } finally {
      setLoading(false);
    }
  };

  const handleView = (assignmentId) => {
    router.push(
      `/assignments/cleaner/${assignmentId}?companyId=${companyId}&locationId=${locationId}`,
    );
  };

  const handleAddCleaner = () => {
    router.push(
      `/assignments/cleaner/add?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`,
    );
  };

  const confirmStatusToggle = async () => {
    if (!statusModal.assignment) return;
    const assignment = statusModal.assignment;
    setTogglingStatus(assignment.id);
    try {
      const currentStatus = assignment.status?.toLowerCase() || "unassigned";
      const newStatus =
        currentStatus === "assigned" ? "unassigned" : "assigned";
      const updateData = { status: newStatus };
      const response = await AssignmentsApi.updateAssignment(
        assignment.id,
        updateData,
      );
      if (response.success) {
        toast.success(`Status changed to ${newStatus}`);
        setAssignments((prevAssignments) =>
          prevAssignments.map((a) =>
            a.id === assignment.id ? { ...a, status: newStatus } : a,
          ),
        );
        setStatusModal({ open: false, assignment: null });
      } else {
        toast.error(response.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleDelete = (assignment) => {
    setDeleteModal({ open: true, assignment });
  };

  const confirmDelete = async () => {
    if (!deleteModal.assignment) return;
    const assignmentId = deleteModal.assignment.id;
    const cleanerName = deleteModal.assignment.cleaner_user?.name || "Cleaner";
    setDeleting(true);
    try {
      const response = await AssignmentsApi.deleteAssignment(assignmentId);
      if (response.success) {
        toast.success(`${cleanerName} removed successfully`);
        setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
        setDeleteModal({ open: false, assignment: null });
      } else {
        toast.error(response.error || "Failed to remove assignment");
      }
    } catch (error) {
      toast.error("Failed to remove assignment");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex justify-center items-center h-screen"
        style={{ background: "var(--cleaner-bg)" }}
      >
        <Loader
          size="large"
          color="var(--cleaner-input-focus)"
          message="Loading cleaners..."
        />
      </div>
    );
  }

  return (
    <>
      <div
        className="min-h-screen"
        style={{ background: "var(--cleaner-bg)" }}
      >

        {/* Minimal Header */}
        <div
          className="backdrop-blur-sm border-b"
          style={{
            background: "var(--cleaner-header-bg)",
            borderColor: "var(--cleaner-header-border)",
          }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="cursor-pointer p-2 rounded-lg transition-all"
                  style={{
                    color: "var(--cleaner-subtitle)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--cleaner-primary-text)";
                    e.currentTarget.style.background =
                      "var(--assignment-accent-bg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--cleaner-subtitle)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                <div>
                  <h1
                    className="text-xl font-semibold"
                    style={{ color: "var(--cleaner-title)" }}
                  >
                    Cleaners
                  </h1>

                  {locationName && (
                    <p
                      className="text-sm flex items-center gap-1"
                      style={{ color: "var(--cleaner-subtitle)" }}
                    >
                      <MapPin className="h-3 w-3" />
                      {locationName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--cleaner-subtitle)" }}
                >
                  {assignments.length} cleaners
                </div>

                {isPermitted && (
                  <button
                    onClick={handleAddCleaner}
                    className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm"
                    style={{
                      background: "var(--cleaner-primary-bg)",
                      color: "var(--cleaner-primary-text)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "var(--cleaner-primary-hover-bg)";
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "var(--cleaner-primary-bg)";
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    <UserPlus className="h-4 w-4" />
                    Add Cleaner
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Rest of your content remains exactly the same */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Enhanced Controls */}
          <div
            className="rounded-xl p-4 mb-6"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5"
                  style={{ color: "var(--cleaner-input-placeholder)" }}
                />
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg outline-none text-sm transition-all"
                  style={{
                    background: "var(--cleaner-input-bg)",
                    border: "2px solid var(--cleaner-input-border)",
                    color: "var(--cleaner-input-text)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--cleaner-input-focus)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px color-mix(in srgb, var(--cleaner-input-focus) 25%, transparent)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "var(--cleaner-input-border)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-lg outline-none text-sm cursor-pointer transition-all"
                style={{
                  background: "var(--cleaner-input-bg)",
                  border: "2px solid var(--cleaner-input-border)",
                  color: "var(--cleaner-input-text)",
                }}
                onFocus={(e) =>
                (e.currentTarget.style.borderColor =
                  "var(--cleaner-input-focus)")
                }
                onBlur={(e) =>
                (e.currentTarget.style.borderColor =
                  "var(--cleaner-input-border)")
                }
              >
                <option value="all">All Status</option>
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>

              {/* Count + View Toggle */}
              <div className="flex items-center gap-3">
                <span
                  className="text-sm font-medium px-3 py-2 rounded-lg"
                  style={{
                    background: "var(--muted)",
                    color: "var(--cleaner-subtitle)",
                  }}
                >
                  {filteredAssignments.length} of {assignments.length}
                </span>

                <div
                  className="flex rounded-lg p-1"
                  style={{ background: "var(--muted)" }}
                >
                  <button
                    onClick={() => setViewMode("grid")}
                    className="cursor-pointer p-2 rounded transition-all"
                    style={
                      viewMode === "grid"
                        ? {
                          background: "var(--cleaner-primary-bg)",
                          color: "var(--cleaner-primary-text)",
                          boxShadow: "var(--assignment-primary-shadow)",
                        }
                        : {
                          color: "var(--cleaner-subtitle)",
                        }
                    }
                  >
                    <Grid3x3 className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => setViewMode("table")}
                    className="cursor-pointer p-2 rounded transition-all"
                    style={
                      viewMode === "table"
                        ? {
                          background: "var(--cleaner-primary-bg)",
                          color: "var(--cleaner-primary-text)",
                          boxShadow: "var(--assignment-primary-shadow)",
                        }
                        : {
                          color: "var(--cleaner-subtitle)",
                        }
                    }
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>


          {/* Content - exactly the same as your original */}
          {filteredAssignments.length === 0 ? (
            <div
              className="rounded-xl p-16 text-center"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >
              <div
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  background: "var(--assignment-accent-bg)",
                }}
              >
                <UserCheck
                  className="h-12 w-12"
                  style={{ color: "var(--assignment-accent-text)" }}
                />
              </div>

              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: "var(--cleaner-title)" }}
              >
                {assignments.length === 0
                  ? "No Cleaners Yet"
                  : "No Results Found"}
              </h3>

              <p
                className="mb-6"
                style={{ color: "var(--cleaner-subtitle)" }}
              >
                {assignments.length === 0
                  ? "Get started by adding your first cleaner to this location"
                  : "Try adjusting your search or filter criteria"}
              </p>

              {assignments.length === 0 && isPermitted && (
                <button
                  onClick={handleAddCleaner}
                  className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all"
                  style={{
                    background: "var(--cleaner-primary-bg)",
                    color: "var(--cleaner-primary-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--cleaner-primary-hover-bg)";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--cleaner-primary-bg)";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <UserPlus className="h-5 w-5" />
                  Add First Cleaner
                </button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="group rounded-xl transition-all duration-300 overflow-hidden"
                  style={{
                    background: "var(--cleaner-surface)",
                    border: "1px solid var(--cleaner-border)",
                    borderTop: "4px solid var(--cleaner-input-focus)",
                    boxShadow: "var(--cleaner-shadow)",
                  }}
                >
                  {/* Header strip */}
                  <div
                    className="p-5"
                    style={{ background: "var(--assignment-accent-bg)" }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
                          style={{
                            background: "var(--cleaner-primary-bg)",
                            color: "var(--cleaner-primary-text)",
                            boxShadow: "var(--assignment-primary-shadow)",
                          }}
                        >
                          {assignment.cleaner_user?.name
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </div>

                        <div>
                          <h3
                            className="font-bold text-lg"
                            style={{ color: "var(--cleaner-title)" }}
                          >
                            {assignment.cleaner_user?.name || "Unknown"}
                          </h3>
                          <p
                            className="text-xs"
                            style={{ color: "var(--cleaner-subtitle)" }}
                          >
                            ID: #{index + 1}
                          </p>
                        </div>
                      </div>

                      {/* Status pill */}
                      <button
                        onClick={() => setStatusModal({ open: true, assignment })}
                        disabled={togglingStatus === assignment.id}
                        className="cursor-pointer px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                        style={
                          assignment.status?.toLowerCase() === "assigned"
                            ? {
                              background: "var(--cleaner-status-active-bg)",
                              color: "var(--cleaner-status-active-text)",
                            }
                            : {
                              background: "var(--cleaner-status-inactive-bg)",
                              color: "var(--cleaner-status-inactive-text)",
                            }
                        }
                      >
                        {togglingStatus === assignment.id
                          ? "..."
                          : assignment.status || "N/A"}
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-3">
                    {assignment.cleaner_user?.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--assignment-accent-bg)" }}
                        >
                          <Phone
                            className="h-4 w-4"
                            style={{ color: "var(--assignment-accent-text)" }}
                          />
                        </div>
                        <span
                          className="font-medium"
                          style={{ color: "var(--cleaner-title)" }}
                        >
                          {assignment.cleaner_user.phone}
                        </span>
                      </div>
                    )}

                    {assignment.cleaner_user?.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--assignment-accent-bg)" }}
                        >
                          <Mail
                            className="h-4 w-4"
                            style={{ color: "var(--assignment-accent-text)" }}
                          />
                        </div>
                        <span
                          className="font-medium truncate"
                          style={{ color: "var(--cleaner-title)" }}
                        >
                          {assignment.cleaner_user.email}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-sm">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--assignment-accent-bg)" }}
                      >
                        <Calendar
                          className="h-4 w-4"
                          style={{ color: "var(--assignment-accent-text)" }}
                        />
                      </div>
                      <span style={{ color: "var(--cleaner-subtitle)" }}>
                        Assigned on{" "}
                        {new Date(assignment.assigned_on).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 flex gap-2">
                    <button
                      onClick={() => handleView(assignment.id)}
                      className="cursor-pointer flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all"
                      style={{
                        background: "var(--cleaner-primary-bg)",
                        color: "var(--cleaner-primary-text)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "var(--cleaner-primary-hover-bg)";
                        e.currentTarget.style.transform = "scale(1.05)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "var(--cleaner-primary-bg)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>

                    {isPermitted && (
                      <button
                        onClick={() => handleDelete(assignment)}
                        className="cursor-pointer p-2.5 rounded-lg transition-colors"
                        style={{ color: "var(--cleaner-danger-text)" }}
                        onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--cleaner-danger-bg)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

          ) : (
            <div
              className="rounded-xl overflow-hidden"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr
                      style={{
                        background: "var(--assignment-accent-bg)",
                        borderBottom: "2px solid var(--cleaner-input-focus)",
                      }}
                    >
                      {["#", "Cleaner Name", "Contact", "Status", "Assigned Date", "Actions"].map(
                        (h) => (
                          <th
                            key={h}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${h === "Actions" ? "text-center" : "text-left"
                              }`}
                            style={{ color: "var(--cleaner-subtitle)" }}
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssignments.map((assignment, index) => (
                      <tr
                        key={assignment.id}
                        className="transition-colors"
                        style={{
                          borderBottom: "1px solid var(--cleaner-border)",
                        }}
                        onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "var(--assignment-accent-bg)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        {/* Index */}
                        <td className="px-6 py-4">
                          <span
                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                            style={{
                              background: "var(--cleaner-primary-bg)",
                              color: "var(--cleaner-primary-text)",
                            }}
                          >
                            {index + 1}
                          </span>
                        </td>

                        {/* Cleaner */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                              style={{
                                background: "var(--cleaner-primary-bg)",
                                color: "var(--cleaner-primary-text)",
                              }}
                            >
                              {assignment.cleaner_user?.name
                                ?.charAt(0)
                                .toUpperCase() || "?"}
                            </div>
                            <div>
                              <div
                                className="font-semibold"
                                style={{ color: "var(--cleaner-title)" }}
                              >
                                {assignment.cleaner_user?.name || "Unknown"}
                              </div>
                              <div
                                className="text-xs"
                                style={{ color: "var(--cleaner-subtitle)" }}
                              >
                                {assignment.cleaner_user?.email || "No email"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td
                          className="px-6 py-4 text-sm font-medium"
                          style={{ color: "var(--cleaner-title)" }}
                        >
                          {assignment.cleaner_user?.phone || "—"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <button
                            onClick={() =>
                              setStatusModal({ open: true, assignment })
                            }
                            disabled={togglingStatus === assignment.id}
                            className="cursor-pointer px-4 py-2 rounded-lg text-xs font-bold transition-all"
                            style={
                              assignment.status?.toLowerCase() === "assigned"
                                ? {
                                  background: "var(--cleaner-status-active-bg)",
                                  color: "var(--cleaner-status-active-text)",
                                }
                                : {
                                  background: "var(--cleaner-status-inactive-bg)",
                                  color: "var(--cleaner-status-inactive-text)",
                                }
                            }
                          >
                            {togglingStatus === assignment.id
                              ? "..."
                              : assignment.status || "N/A"}
                          </button>
                        </td>

                        {/* Date */}
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: "var(--cleaner-subtitle)" }}
                        >
                          <div className="flex items-center gap-2">
                            <Clock
                              className="h-4 w-4"
                              style={{ color: "var(--assignment-accent-text)" }}
                            />
                            {new Date(assignment.assigned_on).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleView(assignment.id)}
                              className="cursor-pointer p-2 rounded-lg transition-all"
                              style={{
                                background: "var(--cleaner-primary-bg)",
                                color: "var(--cleaner-primary-text)",
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {isPermitted && (
                              <button
                                onClick={() => handleDelete(assignment)}
                                className="cursor-pointer p-2 rounded-lg transition-colors"
                                style={{ color: "var(--cleaner-danger-text)" }}
                                onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "var(--cleaner-danger-bg)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background = "transparent")
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          )}
        </div>
      </div>

      {/* Modals remain exactly the same */}
      {statusModal.open && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="rounded-2xl max-w-md w-full overflow-hidden"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            {/* Header */}
            <div
              className="p-6"
              style={{ background: "var(--cleaner-primary-bg)" }}
            >
              <h3
                className="text-2xl font-bold"
                style={{ color: "var(--cleaner-primary-text)" }}
              >
                Change Status
              </h3>
            </div>

            {/* Body */}
            <div className="p-6">
              <p
                className="text-base mb-6"
                style={{ color: "var(--cleaner-subtitle)" }}
              >
                Are you sure you want to change{" "}
                <strong style={{ color: "var(--cleaner-title)" }}>
                  {statusModal.assignment?.cleaner_user?.name}
                </strong>{" "}
                status to{" "}
                <strong style={{ color: "var(--assignment-accent-text)" }}>
                  {statusModal.assignment?.status?.toLowerCase() === "assigned"
                    ? "Unassigned"
                    : "Assigned"}
                </strong>
                ?
              </p>

              <div className="flex gap-3">
                {/* Cancel */}
                <button
                  onClick={() =>
                    setStatusModal({ open: false, assignment: null })
                  }
                  className="cursor-pointer flex-1 px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--cleaner-border)",
                    color: "var(--cleaner-title)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--muted)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Cancel
                </button>

                {/* Confirm */}
                <button
                  onClick={confirmStatusToggle}
                  disabled={togglingStatus === statusModal.assignment?.id}
                  className="cursor-pointer flex-1 px-5 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: "var(--cleaner-primary-bg)",
                    color: "var(--cleaner-primary-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--cleaner-primary-hover-bg)";
                    e.currentTarget.style.boxShadow =
                      "var(--assignment-primary-shadow)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--cleaner-primary-bg)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {togglingStatus === statusModal.assignment?.id
                    ? "Processing..."
                    : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>

      )}

      {deleteModal.open && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.5)" }}
        >
          <div
            className="rounded-2xl max-w-md w-full overflow-hidden"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            {/* Header */}
            <div
              className="p-6"
              style={{
                background: "var(--assignment-toast-error-bg)",
                borderBottom: "1px solid var(--assignment-toast-error-border)",
              }}
            >
              <div
                className="flex items-center gap-3"
                style={{ color: "var(--assignment-toast-error-text)" }}
              >
                <AlertTriangle className="h-8 w-8" />
                <h3 className="text-2xl font-bold">Remove Cleaner</h3>
              </div>
            </div>

            {/* Body */}
            <div className="p-6">
              <p
                className="text-base mb-2"
                style={{ color: "var(--cleaner-subtitle)" }}
              >
                Are you sure you want to remove{" "}
                <strong style={{ color: "var(--cleaner-title)" }}>
                  {deleteModal.assignment?.cleaner_user?.name}
                </strong>
                ?
              </p>

              <p
                className="text-sm font-medium mb-6"
                style={{ color: "var(--assignment-toast-error-text)" }}
              >
                This action cannot be undone.
              </p>

              <div className="flex gap-3">
                {/* Cancel */}
                <button
                  onClick={() =>
                    setDeleteModal({ open: false, assignment: null })
                  }
                  disabled={deleting}
                  className="cursor-pointer flex-1 px-5 py-3 rounded-lg text-sm font-semibold transition-colors"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--cleaner-border)",
                    color: "var(--cleaner-title)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--muted)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Cancel
                </button>

                {/* Confirm delete */}
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="cursor-pointer flex-1 px-5 py-3 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                  style={{
                    background: "var(--assignment-toast-error-border)",
                    color: "var(--assignment-toast-error-text)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "var(--assignment-toast-error-text)";
                    e.currentTarget.style.color = "var(--cleaner-surface)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "var(--assignment-toast-error-border)";
                    e.currentTarget.style.color =
                      "var(--assignment-toast-error-text)";
                  }}
                >
                  {deleting ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>
          </div>
        </div>

      )}
    </>
  );
}
