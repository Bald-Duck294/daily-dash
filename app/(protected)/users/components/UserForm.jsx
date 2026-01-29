// "use client";

// import { useState, useEffect } from "react";
// import roleApi from "@/features/roles/roles.api";
// import LocationsApi from "@/features/locations/locations.api";
// import { CompanyApi } from "@/features/companies/api/companies.api";
// import { useCompanyId } from "@/providers/CompanyProvider";

// export default function UserForm({
//   initialData,
//   onSubmit,
//   isEditing = false,
//   canSubmit = true,
// }) {
//   const { companyId } = useCompanyId(); // Current user's company context

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     phone: "",
//     role_id: "",
//     company_id: companyId, // Fixed to current company
//     location_ids: [],
//   });

//   const [currentCompany, setCurrentCompany] = useState(null);
//   const [roles, setRoles] = useState([]);
//   const [locations, setLocations] = useState([]);
//   const [canAssignLocation, setCanAssignLocation] = useState(false);
//   const [isLoadingData, setIsLoadingData] = useState(true);

//   const isFormValid = () => {
//     const hasName = formData.name.trim().length > 0;
//     const hasPhone = formData.phone.trim().length === 10;
//     const hasRole = formData.role_id !== "";
//     const hasPassword = isEditing || formData.password.trim().length >= 6;

//     return hasName && hasPhone && hasRole && hasPassword;
//   };
//   // Fetch current company details and company-specific data
//   useEffect(() => {
//     const fetchCompanyData = async () => {
//       if (!companyId) {
//         console.error("No company ID available");
//         setIsLoadingData(false);
//         return;
//       }

//       setIsLoadingData(true);
//       try {
//         // Fetch current company details
//         const companyRes = await CompanyApi.getCompanyById(companyId);
//         if (companyRes.success) {
//           setCurrentCompany(companyRes.data);
//         }

//         // Fetch roles for current company
//         const rolesRes = await roleApi.getAllRoles(companyId);
//         console.log(rolesRes, "roles res");
//         if (rolesRes.success) {
//           const filteredRoles = (rolesRes.data?.roles || []).filter(
//             (role) => role.id !== 1,
//           );
//           console.log(
//             `Filtered ${rolesRes.data?.roles?.length || 0} roles to ${filteredRoles.length} (excluded superadmin)`,
//           );
//           // setRoles(rolesRes.data?.data || []);
//           setRoles(filteredRoles);
//         }

//         // Fetch locations for current company
//         const locationsRes = await LocationsApi.getAllLocations(companyId);
//         if (locationsRes.success) {
//           setLocations(locationsRes.data || []);
//         }
//       } catch (error) {
//         console.error("Error fetching company data:", error);
//       }
//       setIsLoadingData(false);
//     };

//     fetchCompanyData();
//   }, [companyId]);

//   // Pre-fill form if editing
//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         name: initialData.name || "",
//         email: initialData.email || "",
//         password: "", // Never pre-fill password
//         phone: initialData.phone || "",
//         role_id: initialData.role_id || "",
//         company_id: companyId, // Always use current company
//         location_ids:
//           initialData.location_assignments
//             ?.filter((a) => a.is_active)
//             .map((a) => a.location_id.toString()) || [],
//       });
//     }
//   }, [initialData, companyId]);

//   // Determine if location assignment should be visible
//   useEffect(() => {
//     const selectedRole = roles.find(
//       (r) => r.id.toString() === formData.role_id.toString(),
//     );
//     if (selectedRole && ["Admin", "Supervisor"].includes(selectedRole.name)) {
//       setCanAssignLocation(true);
//     } else {
//       setCanAssignLocation(false);
//       setFormData((prev) => ({ ...prev, location_ids: [] }));
//     }
//   }, [formData.role_id, roles]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     if (name === "phone") {
//       const numericValue = value.replace(/\D/g, ""); // Remove non-digits
//       setFormData((prev) => ({ ...prev, [name]: numericValue }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleLocationChange = (e) => {
//     const { value, checked } = e.target;
//     const locId = value;
//     setFormData((prev) => ({
//       ...prev,
//       location_ids: checked
//         ? [...prev.location_ids, locId]
//         : prev.location_ids.filter((id) => id !== locId),
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // Validation
//     if (!companyId) {
//       alert("Company context not available");
//       return;
//     }

//     const dataToSend = {
//       ...formData,
//       company_id: companyId, // Ensure company_id is current company
//       role_id: formData.role_id ? parseInt(formData.role_id) : null,
//     };

//     console.log("Submitting user data:", dataToSend);
//     onSubmit(dataToSend);
//   };

//   const inputClass =
//     "w-full px-4 py-2.5 text-md bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition";

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Company Display (Read-only) */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">
//           Company
//         </label>
//         <div className="w-full px-4 py-2.5 text-md bg-gray-50 border border-slate-300 rounded-lg">
//           <div className="flex items-center justify-between">
//             <span className="text-slate-800 font-medium">
//               {currentCompany?.name || "Loading..."}
//             </span>
//             <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
//               Current Company
//             </span>
//           </div>
//         </div>
//         <p className="text-xs text-slate-500 mt-1">
//           New user will be added to your company
//         </p>
//       </div>

//       {/* Name Field */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">
//           Full Name *
//         </label>
//         <input
//           type="text"
//           name="name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//           className={inputClass}
//           placeholder="Enter full name"
//         />
//       </div>

//       {/* Email and Phone */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1">
//             Email{" "}
//           </label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             className={inputClass}
//             placeholder="Enter email address"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1">
//             Phone *
//           </label>
//           <input
//             type="tel"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             className={inputClass}
//             required
//             maxLength={10}
//             pattern="[0-9]{10}"
//             placeholder="Enter 10-digit phone number"
//           />
//         </div>
//       </div>

//       {/* Password Field */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">
//           Password {!isEditing && "*"}
//         </label>
//         <input
//           type="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           required={!isEditing}
//           className={inputClass}
//           placeholder={
//             isEditing
//               ? "Leave blank to keep current password"
//               : "Enter password (min 6 characters)"
//           }
//           minLength={!isEditing ? 6 : undefined}
//         />
//       </div>

//       {/* Role Selection */}
//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1">
//           Role *
//         </label>
//         <select
//           name="role_id"
//           value={formData.role_id}
//           onChange={handleChange}
//           required
//           className={inputClass}
//           disabled={isLoadingData}
//         >
//           <option value="">
//             {isLoadingData ? "Loading roles..." : "Select a role"}
//           </option>
//           {roles.map((role) => (
//             <option key={role.id} value={role.id}>
//               {role.name}
//             </option>
//           ))}
//         </select>
//         {roles.length === 0 && !isLoadingData && (
//           <p className="text-sm text-amber-600 mt-1">
//             No roles available for your company. Contact support.
//           </p>
//         )}
//       </div>

//       {/* Location Assignment */}
//       {canAssignLocation && (
//         <div>
//           <label className="block text-sm font-medium text-slate-700 mb-1">
//             Assign Locations (Optional)
//           </label>
//           <div className="mt-2 p-4 border border-slate-300 rounded-lg max-h-48 overflow-y-auto space-y-2 bg-slate-50">
//             {isLoadingData ? (
//               <p className="text-sm text-slate-500">Loading locations...</p>
//             ) : locations.length > 0 ? (
//               locations.map((loc) => (
//                 <div key={loc.id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={`loc-${loc.id}`}
//                     name="location_ids"
//                     value={loc.id.toString()}
//                     checked={formData.location_ids.includes(loc.id.toString())}
//                     onChange={handleLocationChange}
//                     className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
//                   />
//                   <label
//                     htmlFor={`loc-${loc.id}`}
//                     className="ml-3 text-sm text-slate-700"
//                   >
//                     {loc.name}
//                     {loc.address && (
//                       <span className="text-xs text-slate-500 ml-1">
//                         - {loc.address}
//                       </span>
//                     )}
//                   </label>
//                 </div>
//               ))
//             ) : (
//               <p className="text-sm text-slate-500">
//                 No locations available. Create locations first to assign them.
//               </p>
//             )}
//           </div>
//           {formData.location_ids.length > 0 && (
//             <p className="text-sm text-indigo-600 mt-2">
//               {formData.location_ids.length} location(s) selected
//             </p>
//           )}
//         </div>
//       )}

//       <div className="flex justify-end gap-4 pt-4">
//         <button
//           type="button"
//           onClick={() => window.history.back()}
//           className="cursor-pointer px-6 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
//         >
//           Cancel
//         </button>

//         <button
//           type="submit"
//           className="cursor-pointer px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
//           disabled={isLoadingData || !isFormValid() || !canSubmit}
//         >
//           {isEditing ? "Save Changes" : "Create User"}
//         </button>
//       </div>
//     </form>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import roleApi from "@/features/roles/roles.api";
import LocationsApi from "@/features/locations/locations.api";
import { CompanyApi } from "@/features/companies/api/companies.api";
import { useCompanyId } from "@/providers/CompanyProvider";

export default function UserForm({
  initialData,
  onSubmit,
  isEditing = false,
  canSubmit = true,
}) {
  const { companyId } = useCompanyId();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role_id: "",
    company_id: companyId,
    location_ids: [],
  });

  const [currentCompany, setCurrentCompany] = useState(null);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [canAssignLocation, setCanAssignLocation] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isFormValid = () => {
    const hasName = formData.name.trim().length > 0;
    const hasPhone = formData.phone.trim().length === 10;
    const hasRole = formData.role_id !== "";
    const hasPassword = isEditing || formData.password.trim().length >= 6;
    return hasName && hasPhone && hasRole && hasPassword;
  };

  console.log(isFormValid(), "is form valid ");
  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!companyId) {
        setIsLoadingData(false);
        return;
      }

      setIsLoadingData(true);
      try {
        const companyRes = await CompanyApi.getCompanyById(companyId);
        if (companyRes.success) {
          setCurrentCompany(companyRes.data);
        }

        const rolesRes = await roleApi.getAllRoles(companyId);
        if (rolesRes.success) {
          const filteredRoles = (rolesRes.data?.roles || []).filter(
            (role) => role.id !== 1,
          );
          setRoles(filteredRoles);
        }

        const locationsRes = await LocationsApi.getAllLocations(companyId);
        if (locationsRes.success) {
          setLocations(locationsRes.data || []);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
      setIsLoadingData(false);
    };

    fetchCompanyData();
  }, [companyId]);

  useEffect(() => {
    console.log(initialData, "initial data");
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        phone: initialData.phone || "",
        role_id: initialData.role_id || "",
        company_id: companyId,
        location_ids:
          initialData.location_assignments
            ?.filter((a) => a.is_active)
            .map((a) => a.location_id.toString()) || [],
      });
    }
  }, [initialData, companyId]);

  useEffect(() => {
    const selectedRole = roles.find(
      (r) => r.id.toString() === formData.role_id.toString(),
    );
    if (selectedRole && ["Admin", "Supervisor"].includes(selectedRole.name)) {
      setCanAssignLocation(true);
    } else {
      setCanAssignLocation(false);
      setFormData((prev) => ({ ...prev, location_ids: [] }));
    }
  }, [formData.role_id, roles]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLocationChange = (e) => {
    const { value, checked } = e.target;
    const locId = value;
    setFormData((prev) => ({
      ...prev,
      location_ids: checked
        ? [...prev.location_ids, locId]
        : prev.location_ids.filter((id) => id !== locId),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!companyId) {
      alert("Company context not available");
      return;
    }

    console.log(formData, "form Data");

    const dataToSend = {
      ...formData,
      company_id: companyId,
      role_id: formData.role_id ? parseInt(formData.role_id) : null,
    };

    onSubmit(dataToSend);
  };

  const inputClass =
    "w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400";

  const labelClass =
    "block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Operation Node Section */}
      {/* <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            ASSIGNED OPERATION NODE
          </h3>
          <p className="text-xs text-slate-600">
            Select the operation node for this user
          </p>
        </div>
      </div> */}

      <div class="flex items-center gap-3">
        <div class="h-10 w-10 rounded-xl bg-[#CBF3F0] flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-building2 lucide-building-2 text-[#FF9F1C]"
            aria-hidden="true"
          >
            <path d="M10 12h4"></path>
            <path d="M10 8h4"></path>
            <path d="M14 21v-3a2 2 0 0 0-4 0v3"></path>
            <path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path>
            <path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-sm font-black text-slate-800 uppercase tracking-tight">
            Assigned Operation Node
          </h3>
          <p class="text-xs font-medium text-slate-500">
            Select the operation node for this user
          </p>
        </div>
      </div>
      {/* User Information Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2 className="text-base font-bold text-slate-800">
            User Information
          </h2>
        </div>

        {/* Full Name */}
        <div>
          <label className={labelClass}>Full Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="Legal Name"
          />
        </div>

        {/* Email and Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
              placeholder="staff@saaf.ai"
            />
          </div>
          <div>
            <label className={labelClass}>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={inputClass}
              required
              maxLength={10}
              pattern="[0-9]{10}"
              placeholder="Mobile Number"
            />
          </div>
        </div>
      </div>

      {/* Access & Security Section */}
      <div className="space-y-5 pt-4">
        <div className="flex items-center gap-2 mb-4">
          <svg
            className="w-5 h-5 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-base font-bold text-slate-800">
            Access & Security
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Password {!isEditing && "*"}
              </span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditing}
              className={inputClass}
              placeholder="••••••"
              minLength={!isEditing ? 6 : undefined}
            />
          </div>

          {/* Access Level */}
          <div>
            <label className={labelClass}>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                Access Level *
              </span>
            </label>
            <select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required
              className={inputClass}
              disabled={isLoadingData}
            >
              <option value="">
                {isLoadingData ? "Loading roles..." : "Cleaner"}
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Location Assignment */}
      {canAssignLocation && (
        <div className="pt-4">
          <label className={labelClass}>Assign Locations (Optional)</label>
          <div className="mt-2 p-4 border border-slate-300 rounded-lg max-h-48 overflow-y-auto space-y-2.5 bg-slate-50">
            {isLoadingData ? (
              <p className="text-sm text-slate-500">Loading locations...</p>
            ) : locations.length > 0 ? (
              locations.map((loc) => (
                <label
                  key={loc.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 p-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    name="location_ids"
                    value={loc.id.toString()}
                    checked={formData.location_ids.includes(loc.id.toString())}
                    onChange={handleLocationChange}
                    className="h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-slate-700 font-medium">
                    {loc.name}
                    {loc.address && (
                      <span className="text-xs text-slate-500 ml-2 font-normal">
                        {loc.address}
                      </span>
                    )}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No locations available. Create locations first to assign them.
              </p>
            )}
          </div>
          {formData.location_ids.length > 0 && (
            <p className="text-xs text-teal-600 mt-2 font-medium">
              ✓ {formData.location_ids.length} location(s) selected
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="cursor-pointer px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          CANCEL
        </button>

        <button
          type="submit"
          className="cursor-pointer px-6 py-2.5 text-sm font-semibold text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-all shadow-sm hover:shadow-md disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
          disabled={isLoadingData || !isFormValid() || !canSubmit}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          {isEditing ? "SAVE CHANGES" : "CREATE USER"}
        </button>
      </div>
    </form>
  );
}
