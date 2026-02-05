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

/* eslint-disable react-hooks/immutability */
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--facility-bg)" }}
      >
        <Loader size="large" color="var(--primary)" />
      </div>

    );
  }

  if (!facilityCompany) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: "var(--facility-bg)" }}
      >
        <div className="text-center">
          <Building2
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--facility-muted-text)" }}
          />

          <p
            className="font-medium"
            style={{ color: "var(--facility-muted-text)" }}
          >
            Facility company not found
          </p>

          <button
            onClick={() => router.back()}
            className="mt-4 font-bold transition-colors"
            style={{ color: "var(--primary)" }}
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

      <div
        className="min-h-screen p-6 flex justify-center pb-20"
        style={{ background: "var(--facility-bg)" }}
      >

        <div className="w-full max-w-5xl space-y-8">
          {/* --- HEADER --- */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Back button */}
              <button
                onClick={() =>
                  router.push(`/facility-company?companyId=${companyId}`)
                }
                className="p-2 rounded-xl transition-colors shadow-sm"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  color: "var(--facility-muted-text)",
                }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div>
                {/* Title */}
                <h1
                  className="text-2xl font-bold"
                  style={{ color: "var(--facility-title)" }}
                >
                  {facilityCompany.name}
                </h1>

                <div className="flex items-center gap-2 mt-1">
                  {/* Status badge */}
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide"
                    style={{
                      background: facilityCompany.status
                        ? "var(--facility-status-active-bg)"
                        : "var(--facility-status-inactive-bg)",
                      color: facilityCompany.status
                        ? "var(--facility-status-active-text)"
                        : "var(--facility-status-inactive-text)",
                      borderColor: "var(--facility-border)",
                    }}
                  >
                    {facilityCompany.status ? (
                      <Check size={12} strokeWidth={3} />
                    ) : (
                      <X size={12} strokeWidth={3} />
                    )}
                    {facilityCompany.status ? "Active" : "Inactive"}
                  </span>

                  {/* Created date */}
                  <span
                    className="text-xs flex items-center gap-1"
                    style={{ color: "var(--facility-muted-text)" }}
                  >
                    <Clock size={12} /> Added {formatDate(facilityCompany.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 w-full sm:w-auto">
              {/* View washrooms */}
              <button
                onClick={handleViewLocations}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-sm font-bold text-xs uppercase tracking-wide"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  color: "var(--facility-muted-text)",
                }}
              >
                <MapPin className="w-4 h-4" /> View Washrooms
              </button>

              {/* Edit CTA */}
              {canEditFacility && (
                <button
                  onClick={() =>
                    router.push(
                      `/facility-company/${facilityCompanyId}/edit?companyId=${companyId}`,
                    )
                  }
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl transition-all shadow-lg font-bold text-xs uppercase tracking-wide"
                  style={{
                    background: "var(--facility-primary-bg)",
                    color: "var(--facility-primary-text)",
                  }}
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
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <Building2 size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Company Profile
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Primary Information
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  {[
                    ["Company Name", facilityCompany.name],
                    ["Organization", facilityCompany.company?.name || "N/A"],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        {label}
                      </label>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}

                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Email Address
                    </label>
                    <a
                      href={`mailto:${facilityCompany.email}`}
                      className="text-sm font-medium flex items-center gap-1 hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      {facilityCompany.email || "N/A"} <ExternalLink size={12} />
                    </a>
                  </div>

                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Phone Number
                    </label>
                    <a
                      href={`tel:${facilityCompany.phone}`}
                      className="text-sm font-medium transition-colors"
                      style={{ color: "var(--facility-title)" }}
                    >
                      {facilityCompany.phone || "N/A"}
                    </a>
                  </div>
                </div>
              </div>

              {/* 2. ADDRESS */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <MapPin size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Location
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Headquarters Address
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      background: "var(--facility-muted-bg)",
                      border: "1px solid var(--facility-border)",
                    }}
                  >
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      {facilityCompany.address || "No address provided"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      ["City", facilityCompany.city],
                      ["State", facilityCompany.state],
                      ["Pincode", facilityCompany.pincode],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <label
                          className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                          style={{ color: "var(--facility-muted-text)" }}
                        >
                          {label}
                        </label>
                        <p
                          className="text-sm font-bold font-mono"
                          style={{ color: "var(--facility-title)" }}
                        >
                          {value || "N/A"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. BUSINESS & LEGAL */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <Shield size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Legal Details
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Registration & Compliance
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  {[
                    ["GST / Reg Number", facilityCompany.registration_number],
                    ["PAN Number", facilityCompany.pan_number],
                    ["License Number", facilityCompany.license_number],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        {label}
                      </label>
                      <p
                        className="text-sm font-bold font-mono"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {value || "—"}
                      </p>
                    </div>
                  ))}

                  <div>
                    <label
                      className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      License Expiry
                    </label>
                    <p
                      className="text-sm font-bold"
                      style={{
                        color:
                          new Date(facilityCompany.license_expiry_date) < new Date()
                            ? "var(--facility-status-inactive-text)"
                            : "var(--facility-status-active-text)",
                      }}
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
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Primary Contact
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Representative
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Contact card */}
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: "var(--facility-muted-bg)",
                      border: "1px solid var(--facility-border)",
                    }}
                  >
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm"
                      style={{
                        background: "var(--facility-icon-bg)",
                        color: "var(--facility-icon-text)",
                      }}
                    >
                      {facilityCompany.contact_person_name?.charAt(0)}
                    </div>
                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {facilityCompany.contact_person_name}
                      </p>
                      <p
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        Key Contact
                      </p>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-3 pt-2">
                    {[
                      [Phone, facilityCompany.contact_person_phone],
                      [Mail, facilityCompany.contact_person_email],
                    ].map(([Icon, value], i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg"
                        style={{
                          background: "var(--facility-muted-bg)",
                          border: "1px solid var(--facility-border)",
                        }}
                      >
                        <Icon size={16} style={{ color: "var(--facility-muted-text)" }} />
                        <span
                          className="text-xs font-medium truncate"
                          style={{ color: "var(--facility-title)" }}
                        >
                          {value || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 5. CONTRACT DETAILS */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "var(--facility-surface)",
                  border: "1px solid var(--facility-border)",
                  boxShadow: "var(--facility-shadow)",
                }}
              >
                <div
                  className="flex items-center gap-3 mb-6 pb-4"
                  style={{ borderBottom: "1px solid var(--facility-border)" }}
                >
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: "var(--facility-icon-bg)",
                      color: "var(--facility-icon-text)",
                    }}
                  >
                    <Briefcase size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2
                      className="text-sm font-black uppercase tracking-[0.15em]"
                      style={{ color: "var(--facility-title)" }}
                    >
                      Contract Info
                    </h2>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80"
                      style={{ color: "var(--facility-muted-text)" }}
                    >
                      Duration & Terms
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    ["Start Date", facilityCompany.contract_start_date],
                    ["End Date", facilityCompany.contract_end_date],
                  ].map(([label, date]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center p-3 rounded-xl"
                      style={{ background: "var(--facility-muted-bg)" }}
                    >
                      <span
                        className="text-xs font-bold uppercase"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        {label}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: "var(--facility-title)" }}
                      >
                        {formatDate(date)}
                      </span>
                    </div>
                  ))}

                  {facilityCompany.description && (
                    <div
                      className="mt-4 pt-4"
                      style={{ borderTop: "1px solid var(--facility-border)" }}
                    >
                      <label
                        className="text-[10px] font-bold uppercase tracking-wider block mb-2"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        Notes / Description
                      </label>
                      <p
                        className="text-xs italic leading-relaxed"
                        style={{ color: "var(--facility-muted-text)" }}
                      >
                        &quot;{facilityCompany.description}&quot;
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

