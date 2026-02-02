// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useParams, useSearchParams } from "next/navigation";
// import {
//   ArrowLeft,
//   Building2,
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   FileText,
//   Calendar,
//   Edit,
//   CheckCircle,
//   XCircle,
//   Loader2,
//   Building,
//   Shield,
//   Briefcase,
// } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import Loader from "@/components/ui/Loader";
// import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { MODULES } from "@/shared/constants/permissions";

// export default function ViewFacilityCompanyPage() {
//   useRequirePermission(MODULES.FACILITY_COMPANIES);

//   const { canUpdate } = usePermissions();
//   const canEditFacility = canUpdate(MODULES.FACILITY_COMPANIES);

//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const companyId = searchParams.get("companyId");
//   const facilityCompanyId = params.id;

//   const [facilityCompany, setFacilityCompany] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (facilityCompanyId) {
//       fetchFacilityCompany();
//     }
//   }, [facilityCompanyId]);

//   // const handleViewLocations = () => {
//   //   sessionStorage.setItem('selectedFacilityCompanyId', facilityCompanyId);
//   //   sessionStorage.setItem('selectedFacilityCompanyName', facilityCompany?.name)
//   //   router.push(`/washrooms?companyId=${companyId}`);
//   // }

//   const handleViewLocations = () => {
//     // ✅ Pass facilityCompanyId as URL parameter instead of sessionStorage
//     router.push(
//       `/washrooms?companyId=${companyId}&facilityCompanyId=${facilityCompanyId}&facilityCompanyName=${encodeURIComponent(facilityCompany?.name || "")}`,
//     );
//   };

//   const fetchFacilityCompany = async () => {
//     setIsLoading(true);
//     const result = await FacilityCompanyApi.getById(facilityCompanyId);

//     if (result.success) {
//       setFacilityCompany(result.data);
//     } else {
//       toast.error(result.error || "Failed to load facility company details");
//       setTimeout(() => {
//         router.push(`/facility-company?companyId=${companyId}`);
//       }, 2000);
//     }
//     setIsLoading(false);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "Not specified";
//     return new Date(dateString).toLocaleDateString("en-IN", {
//       day: "2-digit",
//       month: "long",
//       year: "numeric",
//     });
//   };

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
//         <div className="text-center">
//           <Loader size="large" color="#3b82f6" />
//           <p className="mt-4 text-slate-600">
//             Loading facility company details...
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (!facilityCompany) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
//         <div className="text-center">
//           <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
//           <p className="text-slate-600">Facility company not found</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <Toaster position="top-right" />

//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
//         <div className="max-w-5xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() =>
//                     router.push(`/facility-company?companyId=${companyId}`)
//                   }
//                   className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//                 >
//                   <ArrowLeft className="w-5 h-5 text-slate-600" />
//                 </button>
//                 <div className="flex items-center gap-3">
//                   <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
//                     <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
//                   </div>
//                   <div>
//                     <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
//                       {facilityCompany.name}
//                     </h1>
//                     <div className="flex items-center gap-2 mt-1">
//                       {facilityCompany.status ? (
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                           <CheckCircle className="w-3 h-3" />
//                           Active
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
//                           <XCircle className="w-3 h-3" />
//                           Inactive
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
//                 <button
//                   onClick={handleViewLocations}
//                   className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
//                 >
//                   <MapPin className="w-4 h-4" />
//                   View Assigned Washroom(s)
//                 </button>

//                 {/* ✅ Only show Edit button if user has UPDATE permission */}
//                 {canEditFacility && (
//                   <button
//                     onClick={() =>
//                       router.push(
//                         `/facility-company/${facilityCompanyId}/edit?companyId=${companyId}`,
//                       )
//                     }
//                     className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
//                   >
//                     <Edit className="w-4 h-4" />
//                     Edit Details
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Basic Information */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//               <Building2 className="w-5 h-5 text-blue-600" />
//               Basic Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Company Name
//                 </label>
//                 <p className="mt-1 text-slate-800 font-medium">
//                   {facilityCompany.name}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Mail className="w-4 h-4" />
//                   Email
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.email || "Not specified"}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Phone className="w-4 h-4" />
//                   Phone Number
//                 </label>
//                 <p className="mt-1 text-slate-800 font-medium">
//                   {facilityCompany.phone}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Building className="w-4 h-4" />
//                   Organization
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.company?.name || "N/A"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Contact Person Details */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//               <User className="w-5 h-5 text-blue-600" />
//               Contact Person Details
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Contact Person Name
//                 </label>
//                 <p className="mt-1 text-slate-800 font-medium">
//                   {facilityCompany.contact_person_name}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Phone className="w-4 h-4" />
//                   Contact Phone
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.contact_person_phone || "Not specified"}
//                 </p>
//               </div>

//               <div className="md:col-span-2">
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Mail className="w-4 h-4" />
//                   Contact Email
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.contact_person_email || "Not specified"}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Address Details */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//               <MapPin className="w-5 h-5 text-blue-600" />
//               Address Details
//             </h2>

//             <div className="space-y-4">
//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Full Address
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.address || "Not specified"}
//                 </p>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="text-sm font-medium text-slate-500">
//                     City
//                   </label>
//                   <p className="mt-1 text-slate-800">
//                     {facilityCompany.city || "N/A"}
//                   </p>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-slate-500">
//                     State
//                   </label>
//                   <p className="mt-1 text-slate-800">
//                     {facilityCompany.state || "N/A"}
//                   </p>
//                 </div>

//                 <div>
//                   <label className="text-sm font-medium text-slate-500">
//                     Pincode
//                   </label>
//                   <p className="mt-1 text-slate-800">
//                     {facilityCompany.pincode || "N/A"}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Business & Legal Information */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//               <Shield className="w-5 h-5 text-blue-600" />
//               Business & Legal Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Registration Number (GST)
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.registration_number || "Not specified"}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   PAN Number
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.pan_number || "Not specified"}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   License Number
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {facilityCompany.license_number || "Not specified"}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   License Expiry Date
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {formatDate(facilityCompany.license_expiry_date)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Contract Details */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//               <Briefcase className="w-5 h-5 text-blue-600" />
//               Contract Details
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   Contract Start Date
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {formatDate(facilityCompany.contract_start_date)}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
//                   <Calendar className="w-4 h-4" />
//                   Contract End Date
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {formatDate(facilityCompany.contract_end_date)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Performance Metrics */}
//           {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//               <FileText className="w-5 h-5 text-blue-600" />
//               Performance & Additional Info
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="text-sm font-medium text-slate-500">Rating</label>
//                 <p className="mt-1 text-slate-800 font-medium text-2xl">
//                   {facilityCompany.rating || 0} / 10
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Total Locations Managed
//                 </label>
//                 <p className="mt-1 text-slate-800 font-medium text-2xl">
//                   {facilityCompany.total_locations_managed || 0}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Active Locations
//                 </label>
//                 <p className="mt-1 text-slate-800 font-medium text-2xl">
//                   {facilityCompany.active_locations || 0}
//                 </p>
//               </div>
//             </div>

//             {facilityCompany.description && (
//               <div className="mt-6">
//                 <label className="text-sm font-medium text-slate-500">Description</label>
//                 <p className="mt-1 text-slate-800 whitespace-pre-wrap">
//                   {facilityCompany.description}
//                 </p>
//               </div>
//             )}
//           </div> */}

//           {/* Assigned Locations */}
//           {/* {facilityCompany.locations && facilityCompany.locations.length > 0 && (
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                 <MapPin className="w-5 h-5 text-blue-600" />
//                 Assigned Locations ({facilityCompany.locations.length})
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//                 {facilityCompany.locations.map((location) => (
//                   <div
//                     key={location.id}
//                     className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
//                   >
//                     <p className="font-medium text-slate-800">{location.name}</p>
//                     {location.address && (
//                       <p className="text-xs text-slate-500 mt-1">{location.address}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )} */}

//           {/* Metadata */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
//             <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//               <Calendar className="w-5 h-5 text-blue-600" />
//               Record Information
//             </h2>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Created At
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {formatDate(facilityCompany.created_at)}
//                 </p>
//               </div>

//               <div>
//                 <label className="text-sm font-medium text-slate-500">
//                   Last Updated
//                 </label>
//                 <p className="mt-1 text-slate-800">
//                   {formatDate(facilityCompany.updated_at)}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit,
  Check,
  X,
  Shield,
  Briefcase,
  Clock,
  ExternalLink,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

export default function ViewFacilityCompanyPage() {
  useRequirePermission(MODULES.FACILITY_COMPANIES);

  const { canUpdate } = usePermissions();
  const canEditFacility = canUpdate(MODULES.FACILITY_COMPANIES);

  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const facilityCompanyId = params.id;

  const [facilityCompany, setFacilityCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (facilityCompanyId) {
      fetchFacilityCompany();
    }
  }, [facilityCompanyId]);

  const handleViewLocations = () => {
    router.push(
      `/washrooms?companyId=${companyId}&facilityCompanyId=${facilityCompanyId}&facilityCompanyName=${encodeURIComponent(facilityCompany?.name || "")}`,
    );
  };

  const fetchFacilityCompany = async () => {
    setIsLoading(true);
    const result = await FacilityCompanyApi.getById(facilityCompanyId);

    if (result.success) {
      setFacilityCompany(result.data);
    } else {
      toast.error(result.error || "Failed to load facility company details");
      setTimeout(() => {
        router.push(`/facility-company?companyId=${companyId}`);
      }, 2000);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader size="large" color="#3b82f6" />
      </div>
    );
  }

  if (!facilityCompany) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">
            Facility company not found
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-slate-50/50 p-6 flex justify-center pb-20">
        <div className="w-full max-w-5xl space-y-8">
          {/* --- HEADER --- */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(`/facility-company?companyId=${companyId}`)
                }
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {facilityCompany.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide ${facilityCompany.status ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"}`}
                  >
                    {facilityCompany.status ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <X size={12} strokeWidth={3} />
                    )}
                    {facilityCompany.status ? "Active" : "Inactive"}
                  </span>
                  <span className="text-slate-400 text-xs flex items-center gap-1">
                    <Clock size={12} /> Added{" "}
                    {formatDate(facilityCompany.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleViewLocations}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-wide"
              >
                <MapPin className="w-4 h-4 text-blue-500" /> View Washrooms
              </button>

              {canEditFacility && (
                <button
                  onClick={() =>
                    router.push(
                      `/facility-company/${facilityCompanyId}/edit?companyId=${companyId}`,
                    )
                  }
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200/50 transition-all font-bold text-xs uppercase tracking-wide"
                >
                  <Edit className="w-4 h-4" /> Edit Company
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - MAIN INFO */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. BASIC INFO */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                    <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">
                      Company Profile
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                      Primary Information
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Company Name
                    </label>
                    <p className="text-sm font-bold text-slate-700">
                      {facilityCompany.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <a
                      href={`mailto:${facilityCompany.email}`}
                      className="text-sm font-medium text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {facilityCompany.email || "N/A"}{" "}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Phone Number
                    </label>
                    <a
                      href={`tel:${facilityCompany.phone}`}
                      className="text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors"
                    >
                      {facilityCompany.phone || "N/A"}
                    </a>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Organization
                    </label>
                    <p className="text-sm font-medium text-slate-700">
                      {facilityCompany.company?.name || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. ADDRESS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-600">
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">
                      Location
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                      Headquarters Address
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                      {facilityCompany.address || "No address provided"}
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        City
                      </label>
                      <p className="text-sm font-bold text-slate-700">
                        {facilityCompany.city || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        State
                      </label>
                      <p className="text-sm font-bold text-slate-700">
                        {facilityCompany.state || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Pincode
                      </label>
                      <p className="text-sm font-bold text-slate-700 font-mono">
                        {facilityCompany.pincode || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. BUSINESS & LEGAL */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600">
                    <Shield size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">
                      Legal Details
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                      Registration & Compliance
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      GST / Reg Number
                    </label>
                    <p className="text-sm font-bold text-slate-700 font-mono tracking-wide">
                      {facilityCompany.registration_number || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      PAN Number
                    </label>
                    <p className="text-sm font-bold text-slate-700 font-mono tracking-wide">
                      {facilityCompany.pan_number || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      License Number
                    </label>
                    <p className="text-sm font-medium text-slate-700">
                      {facilityCompany.license_number || "—"}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      License Expiry
                    </label>
                    <p
                      className={`text-sm font-bold ${new Date(facilityCompany.license_expiry_date) < new Date() ? "text-red-500" : "text-emerald-600"}`}
                    >
                      {formatDate(facilityCompany.license_expiry_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - CONTACT & CONTRACT */}
            <div className="space-y-6">
              {/* 4. CONTACT PERSON */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">
                      Primary Contact
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                      Representative
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">
                      {facilityCompany.contact_person_name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {facilityCompany.contact_person_name}
                      </p>
                      <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wide">
                        Key Contact
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Phone size={16} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-600">
                          {facilityCompany.contact_person_phone || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="flex items-center gap-3">
                        <Mail size={16} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[180px]">
                          {facilityCompany.contact_person_email || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. CONTRACT DETAILS */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
                    <Briefcase size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.15em]">
                      Contract Info
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                      Duration & Terms
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      Start Date
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {formatDate(facilityCompany.contract_start_date)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                    <span className="text-xs font-bold text-slate-500 uppercase">
                      End Date
                    </span>
                    <span className="text-sm font-bold text-slate-700">
                      {formatDate(facilityCompany.contract_end_date)}
                    </span>
                  </div>

                  {facilityCompany.description && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                        Notes / Description
                      </label>
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        "{facilityCompany.description}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
