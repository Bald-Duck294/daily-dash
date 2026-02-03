// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import toast, { Toaster } from "react-hot-toast";
// import { UsersApi } from "@/features/users/users.api";
// import { AssignmentsApi } from "@/features/assignments/assignments.api";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import {
//   UserPlus,
//   User,
//   MapPin,
//   Search,
//   ChevronDown,
//   X,
//   ArrowLeft,
//   AlertCircle,
//   CheckCircle2,
//   Users,
// } from "lucide-react";
// import Loader from "@/components/ui/Loader";

// export default function AddSupervisorAssignmentPage() {
//   const [selectedSupervisors, setSelectedSupervisors] = useState([]);
//   const [status, setStatus] = useState("assigned");
//   const [allUsers, setAllUsers] = useState([]);
//   const [availableSupervisors, setAvailableSupervisors] = useState([]);
//   const [assignedSupervisors, setAssignedSupervisors] = useState([]);
//   const [userSearchTerm, setUserSearchTerm] = useState("");
//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { companyId } = useCompanyId();

//   const locationId = searchParams.get("locationId");
//   const locationName = searchParams.get("locationName");

//   const userDropdownRef = useRef(null);

//   useEffect(() => {
//     if (!companyId || !locationId) return;

//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const userRes = await UsersApi.getAllUsers(companyId);
//         if (userRes.success) {
//           const supervisors = (userRes.data || []).filter(
//             (user) =>
//               user.role?.name?.toLowerCase() === "supervisor" ||
//               user.role_id === 3,
//           );
//           setAllUsers(supervisors);

//           const assignmentsRes = await AssignmentsApi.getAssignmentsByLocation(
//             locationId,
//             companyId,
//           );
//           if (assignmentsRes.success) {
//             const assignedSupervisorIds = assignmentsRes.data.map(
//               (a) => a.cleaner_user_id,
//             );
//             setAssignedSupervisors(
//               assignmentsRes.data.filter((item) => item.role_id === 3),
//             );

//             const available = supervisors.filter(
//               (supervisor) => !assignedSupervisorIds.includes(supervisor.id),
//             );
//             setAvailableSupervisors(available);
//           } else {
//             setAvailableSupervisors(supervisors);
//           }
//         }
//       } catch (err) {
//         toast.error("Failed to fetch supervisors");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [companyId, locationId]);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         userDropdownRef.current &&
//         !userDropdownRef.current.contains(event.target)
//       ) {
//         setIsUserDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSupervisorSelect = (supervisor) => {
//     setSelectedSupervisors((prev) =>
//       prev.some((s) => s.id === supervisor.id)
//         ? prev.filter((s) => s.id !== supervisor.id)
//         : [...prev, supervisor],
//     );
//   };

//   const handleRemoveSupervisor = (supervisorId) => {
//     setSelectedSupervisors((prev) => prev.filter((s) => s.id !== supervisorId));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (selectedSupervisors.length === 0)
//       return toast.error("Please select at least one supervisor.");
//     if (!locationId) return toast.error("Location ID is missing.");

//     setIsLoading(true);
//     try {
//       const assignmentData = {
//         location_id: locationId,
//         cleaner_user_ids: selectedSupervisors.map((s) => s.id),
//         company_id: companyId,
//         status: status,
//         role_id: 3,
//       };

//       const response =
//         await AssignmentsApi.createAssignmentsForLocation(assignmentData);

//       if (response.success) {
//         const { created, skipped } = response.data.data || {};
//         if (created > 0)
//           toast.success(`${created} supervisor(s) assigned successfully!`);
//         if (skipped > 0)
//           toast.warning(`${skipped} supervisor(s) were already assigned.`);

//         setTimeout(() => {
//           router.push(
//             `/assignments/supervisor?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`,
//           );
//         }, 1000);
//       } else {
//         toast.error(response.error || "Failed to create assignments");
//       }
//     } catch (error) {
//       toast.error("Failed to create assignments");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const filteredUsers = availableSupervisors.filter((user) =>
//     user.name.toLowerCase().includes(userSearchTerm.toLowerCase()),
//   );

//   return (
//     <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
//       <Toaster position="top-right" />

//       {/* Header */}
//       <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
//         <div className="max-w-4xl mx-auto px-6 py-4">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => router.back()}
//               className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
//             >
//               <ArrowLeft size={20} />
//             </button>
//             <div>
//               <h1 className="text-xl font-bold text-slate-800">
//                 Assign Supervisors
//               </h1>
//               {locationName && (
//                 <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
//                   <MapPin size={14} className="text-[#FFAB2D]" />
//                   <span className="font-medium">{locationName}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
//         {/* Info Banner */}
//         {assignedSupervisors.length > 0 && (
//           <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <h3 className="text-sm font-bold text-blue-900">
//                 Note on Existing Assignments
//               </h3>
//               <p className="text-xs text-blue-700 mt-1">
//                 {assignedSupervisors.length} supervisor
//                 {assignedSupervisors.length !== 1 ? "s are" : " is"} already
//                 assigned to this location. The list below only shows available
//                 staff.
//               </p>
//             </div>
//           </div>
//         )}

//         <form
//           onSubmit={handleSubmit}
//           // className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
//           className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-[0_20px_30px_rgba(0,0,0,0.08)]"
//         >
//           <div className="p-6 md:p-8 space-y-8">
//             {/* Supervisor Selection */}
//             <div ref={userDropdownRef} className="relative">
//               <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between">
//                 <span>Select Supervisors</span>
//                 <span className="text-slate-400 font-normal text-xs">
//                   {selectedSupervisors.length} selected
//                 </span>
//               </label>

//               <button
//                 type="button"
//                 onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                 disabled={availableSupervisors.length === 0}
//                 className="w-full flex justify-between items-center text-left px-4 py-3 bg-white border border-slate-300 rounded-xl hover:border-[#FFAB2D] focus:ring-2 focus:ring-[#FFAB2D]/20 transition-all disabled:bg-slate-50 disabled:text-slate-400"
//               >
//                 <span
//                   className={
//                     selectedSupervisors.length
//                       ? "text-slate-900 font-medium"
//                       : "text-slate-500"
//                   }
//                 >
//                   {availableSupervisors.length === 0
//                     ? "No supervisors available"
//                     : selectedSupervisors.length > 0
//                       ? `${selectedSupervisors.length} Supervisor(s) Selected`
//                       : "Click to select supervisors..."}
//                 </span>
//                 <ChevronDown
//                   className={`w-5 h-5 text-slate-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""}`}
//                 />
//               </button>

//               {/* Dropdown Menu */}
//               {isUserDropdownOpen && availableSupervisors.length > 0 && (
//                 <div className="absolute z-20 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 flex flex-col animate-in fade-in zoom-in-95 duration-100">
//                   <div className="p-3 border-b border-slate-100 bg-slate-50/50">
//                     <div className="relative">
//                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                       <input
//                         type="text"
//                         placeholder="Search name..."
//                         value={userSearchTerm}
//                         onChange={(e) => setUserSearchTerm(e.target.value)}
//                         className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#FFAB2D] transition-colors"
//                         autoFocus
//                       />
//                     </div>
//                   </div>
//                   <div className="overflow-y-auto p-2 space-y-1">
//                     {filteredUsers.length === 0 ? (
//                       <div className="p-8 text-center text-sm text-slate-500">
//                         No supervisors found
//                       </div>
//                     ) : (
//                       filteredUsers.map((user) => {
//                         const isSelected = selectedSupervisors.some(
//                           (s) => s.id === user.id,
//                         );
//                         return (
//                           <div
//                             key={user.id}
//                             onClick={() => handleSupervisorSelect(user)}
//                             className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected ? "bg-orange-50 border border-orange-100" : "hover:bg-slate-50 border border-transparent"}`}
//                           >
//                             <div className="flex items-center gap-3">
//                               <div
//                                 className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isSelected ? "bg-[#FFAB2D] text-white" : "bg-slate-100 text-slate-500"}`}
//                               >
//                                 {user.name?.charAt(0).toUpperCase()}
//                               </div>
//                               <div>
//                                 <p
//                                   className={`text-sm font-medium ${isSelected ? "text-slate-900" : "text-slate-700"}`}
//                                 >
//                                   {user.name}
//                                 </p>
//                                 {user.phone && (
//                                   <p className="text-xs text-slate-400">
//                                     {user.phone}
//                                   </p>
//                                 )}
//                               </div>
//                             </div>
//                             {isSelected && (
//                               <CheckCircle2 className="w-5 h-5 text-[#FFAB2D]" />
//                             )}
//                           </div>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Selected Tags */}
//             {selectedSupervisors.length > 0 && (
//               <div className="flex flex-wrap gap-2">
//                 {selectedSupervisors.map((supervisor) => (
//                   <span
//                     key={supervisor.id}
//                     className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-100 text-orange-800 rounded-full text-xs font-bold shadow-sm"
//                   >
//                     {supervisor.name}
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveSupervisor(supervisor.id)}
//                       className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
//                     >
//                       <X size={12} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             )}

//             {/* Location Context Card */}
//             <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
//               <div className="flex items-center gap-2 mb-1">
//                 <MapPin className="w-4 h-4 text-[#FFAB2D]" />
//                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
//                   Target Location
//                 </h4>
//               </div>
//               <p className="text-slate-900 font-semibold text-sm pl-6">
//                 {locationName || "Unknown Location"}
//               </p>
//             </div>
//           </div>

//           {/* Footer */}
//           <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => router.back()}
//               disabled={isLoading}
//               className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isLoading || selectedSupervisors.length === 0}
//               className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-[#FFAB2D] hover:bg-[#e89a25] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {isLoading && <Loader size={14} color="white" />}
//               {isLoading ? "Assigning..." : "Confirm Assignment"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/features/users/users.api";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  MapPin,
  Search,
  ChevronDown,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import Loader from "@/components/ui/Loader";

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

  useEffect(() => {
    if (!companyId || !locationId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userRes = await UsersApi.getAllUsers(companyId);
        if (userRes.success) {
          const supervisors = (userRes.data || []).filter(
            (user) =>
              user.role?.name?.toLowerCase() === "supervisor" ||
              user.role_id === 3,
          );
          setAllUsers(supervisors);

          const assignmentsRes = await AssignmentsApi.getAssignmentsByLocation(
            locationId,
            companyId,
          );
          if (assignmentsRes.success) {
            const assignedSupervisorIds = assignmentsRes.data.map(
              (a) => a.cleaner_user_id,
            );
            setAssignedSupervisors(
              assignmentsRes.data.filter((item) => item.role_id === 3),
            );

            const available = supervisors.filter(
              (supervisor) => !assignedSupervisorIds.includes(supervisor.id),
            );
            setAvailableSupervisors(available);
          } else {
            setAvailableSupervisors(supervisors);
          }
        }
      } catch (err) {
        toast.error("Failed to fetch supervisors");
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
    if (selectedSupervisors.length === 0)
      return toast.error("Please select at least one supervisor.");
    if (!locationId) return toast.error("Location ID is missing.");

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
        if (created > 0)
          toast.success(`${created} supervisor(s) assigned successfully!`);
        if (skipped > 0)
          toast.warning(`${skipped} supervisor(s) were already assigned.`);

        setTimeout(() => {
          router.push(
            `/assignments/supervisor?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`,
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

  const filteredUsers = availableSupervisors.filter((user) =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-900 pb-12">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Assign Supervisors
              </h1>
              <p className="text-xs text-slate-500">
                Manage supervision for your locations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] border border-slate-100 overflow-hidden ring-1 ring-slate-900/5"
        >
          {/* Form Header / Location Context */}
          <div className="bg-slate-50/50 p-6 md:p-8 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-[#FFAB2D]/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-[#FFAB2D]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Target Location
                </h4>
                <p className="text-lg font-bold text-slate-800">
                  {locationName || "Unknown Location"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Info Banner */}
            {assignedSupervisors.length > 0 && (
              <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-blue-900">
                    Assignment Status
                  </h3>
                  <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                    This location already has{" "}
                    <span className="font-bold">
                      {assignedSupervisors.length}
                    </span>{" "}
                    active supervisor
                    {assignedSupervisors.length !== 1 ? "s" : ""}.
                  </p>
                </div>
              </div>
            )}

            {/* Supervisor Selection */}
            <div ref={userDropdownRef} className="relative group">
              <label className="block text-sm font-bold text-slate-700 mb-3 flex justify-between items-end">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#FFAB2D]" />
                  Select Supervisors
                </span>
                {selectedSupervisors.length > 0 && (
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold">
                    {selectedSupervisors.length} Selected
                  </span>
                )}
              </label>

              <button
                type="button"
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                disabled={availableSupervisors.length === 0}
                className="w-full flex justify-between items-center text-left px-5 py-4 bg-white border border-slate-200 rounded-2xl hover:border-orange-300 hover:ring-4 hover:ring-orange-500/5 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-400 shadow-sm"
              >
                <span
                  className={
                    selectedSupervisors.length
                      ? "text-slate-900 font-semibold"
                      : "text-slate-400"
                  }
                >
                  {availableSupervisors.length === 0
                    ? "No supervisors available"
                    : selectedSupervisors.length > 0
                      ? `${selectedSupervisors.length} Supervisor(s) Selected`
                      : "Search and select supervisors..."}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isUserDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {isUserDropdownOpen && availableSupervisors.length > 0 && (
                <div className="absolute z-20 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  <div className="p-3 border-b border-slate-50 bg-slate-50/50 sticky top-0">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Type to search..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-[#FFAB2D] focus:ring-2 focus:ring-[#FFAB2D]/10 transition-all"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-64 p-2 space-y-1">
                    {filteredUsers.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No supervisors matching "{userSearchTerm}"
                      </div>
                    ) : (
                      filteredUsers.map((user) => {
                        const isSelected = selectedSupervisors.some(
                          (s) => s.id === user.id,
                        );
                        return (
                          <div
                            key={user.id}
                            onClick={() => handleSupervisorSelect(user)}
                            className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${isSelected ? "bg-orange-50 border border-orange-100 shadow-sm" : "hover:bg-slate-50 border border-transparent"}`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${isSelected ? "bg-[#FFAB2D] text-white" : "bg-slate-100 text-slate-500"}`}
                              >
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-bold ${isSelected ? "text-slate-900" : "text-slate-700"}`}
                                >
                                  {user.name}
                                </p>
                                {user.phone && (
                                  <p className="text-xs text-slate-400 font-medium">
                                    {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="bg-white rounded-full p-1 shadow-sm">
                                <CheckCircle2 className="w-5 h-5 text-[#FFAB2D]" />
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Selected Tags Display */}
            {selectedSupervisors.length > 0 && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {selectedSupervisors.map((supervisor) => (
                  <span
                    key={supervisor.id}
                    className="inline-flex items-center gap-2 pl-3 pr-1.5 py-1.5 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 text-orange-800 rounded-full text-xs font-bold shadow-sm group hover:shadow-md transition-all"
                  >
                    {supervisor.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveSupervisor(supervisor.id)}
                      className="w-5 h-5 flex items-center justify-center hover:bg-white rounded-full transition-colors text-orange-400 hover:text-red-500"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="text-slate-500 font-bold text-sm hover:text-slate-800 transition-colors px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedSupervisors.length === 0}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-[#FFAB2D] to-[#f59e0b] hover:to-[#d97706] text-white font-bold text-sm shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            >
              {isLoading && <Loader size={16} color="white" />}
              {isLoading ? "Assigning..." : "Confirm Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
