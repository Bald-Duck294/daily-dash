// "use client";

// import React, { useState, useEffect } from "react";
// import { useRouter, useParams, useSearchParams } from "next/navigation";
// import { State, City } from "country-state-city";
// import {
//   ArrowLeft,
//   Building2,
//   User,
//   Phone,
//   Mail,
//   MapPin,
//   FileText,
//   Calendar,
//   Save,
//   X,
//   Loader2,
// } from "lucide-react";
// import toast, { Toaster } from "react-hot-toast";
// import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
// import Loader from "@/components/ui/Loader";

// // Indian States
// const INDIAN_STATES = [
//   "Andhra Pradesh",
//   "Arunachal Pradesh",
//   "Assam",
//   "Bihar",
//   "Chhattisgarh",
//   "Goa",
//   "Gujarat",
//   "Haryana",
//   "Himachal Pradesh",
//   "Jharkhand",
//   "Karnataka",
//   "Kerala",
//   "Madhya Pradesh",
//   "Maharashtra",
//   "Manipur",
//   "Meghalaya",
//   "Mizoram",
//   "Nagaland",
//   "Odisha",
//   "Punjab",
//   "Rajasthan",
//   "Sikkim",
//   "Tamil Nadu",
//   "Telangana",
//   "Tripura",
//   "Uttar Pradesh",
//   "Uttarakhand",
//   "West Bengal",
//   "Andaman and Nicobar Islands",
//   "Chandigarh",
//   "Dadra and Nagar Haveli and Daman and Diu",
//   "Delhi",
//   "Jammu and Kashmir",
//   "Ladakh",
//   "Lakshadweep",
//   "Puducherry",
// ];

// export default function EditFacilityCompanyPage() {
//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const companyId = searchParams.get("companyId");
//   const facilityCompanyId = params.id;

//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // State filter
//   const [stateSearch, setStateSearch] = useState("");
//   const [showStateDropdown, setShowStateDropdown] = useState(false);

//   const [availableStates, setAvailableStates] = useState([]);
//   const [availableCities, setAvailableCities] = useState([]); // Add this
//   const [citySearch, setCitySearch] = useState(""); // Add this
//   const [showCityDropdown, setShowCityDropdown] = useState(false); // Add this

//   // Form data
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     contact_person_name: "",
//     contact_person_phone: "",
//     contact_person_email: "",
//     address: "",
//     city: "",
//     state: "",
//     pincode: "",
//     registration_number: "",
//     pan_number: "",
//     license_number: "",
//     license_expiry_date: "",
//     contract_start_date: "",
//     contract_end_date: "",
//     description: "",
//     status: true,
//   });

//   // Errors
//   const [errors, setErrors] = useState({});

//   useEffect(() => {
//     if (facilityCompanyId) {
//       fetchFacilityCompany();
//     }
//   }, [facilityCompanyId]);

//   useEffect(() => {
//     const indiaStates = State.getStatesOfCountry("IN");
//     const stateNames = indiaStates.map((state) => state.name);
//     setAvailableStates(stateNames);
//   }, []);

//   const fetchFacilityCompany = async () => {
//     setIsLoading(true);
//     const result = await FacilityCompanyApi.getById(facilityCompanyId);

//     if (result.success) {
//       const data = result.data;
//       setFormData({
//         name: data.name || "",
//         email: data.email || "",
//         phone: data.phone || "",
//         contact_person_name: data.contact_person_name || "",
//         contact_person_phone: data.contact_person_phone || "",
//         contact_person_email: data.contact_person_email || "",
//         address: data.address || "",
//         city: data.city || "",
//         state: data.state || "",
//         pincode: data.pincode || "",
//         registration_number: data.registration_number || "",
//         pan_number: data.pan_number || "",
//         license_number: data.license_number || "",
//         license_expiry_date: data.license_expiry_date
//           ? new Date(data.license_expiry_date).toISOString().split("T")[0]
//           : "",
//         contract_start_date: data.contract_start_date
//           ? new Date(data.contract_start_date).toISOString().split("T")[0]
//           : "",
//         contract_end_date: data.contract_end_date
//           ? new Date(data.contract_end_date).toISOString().split("T")[0]
//           : "",
//         description: data.description || "",
//         status: data.status,
//       });
//       setStateSearch(data.state || "");

//       if (data.state) {
//         const indiaStates = State.getStatesOfCountry("IN");
//         const selectedState = indiaStates.find((s) => s.name === data.state);

//         if (selectedState) {
//           const cities = City.getCitiesOfState("IN", selectedState.isoCode);
//           const cityNames = cities.map((city) => city.name);
//           setAvailableCities(cityNames);
//         }

//         setCitySearch(data.city || ""); // Set city search too
//       }
//     } else {
//       toast.error(result.error || "Failed to load facility company");
//       setTimeout(() => {
//         router.push(`/facility-company?companyId=${companyId}`);
//       }, 2000);
//     }
//     setIsLoading(false);
//   };

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "checkbox" ? checked : value,
//     }));

//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   // Handle state selection
//   const handleStateSelect = (state) => {
//     setFormData((prev) => ({
//       ...prev,
//       state: state,
//     }));

//     setStateSearch(state);
//     setCitySearch(" ");
//     setShowStateDropdown(false);
//     if (errors.state) {
//       setErrors((prev) => ({
//         ...prev,
//         state: "",
//       }));
//     }

//     const indiaStates = State.getStatesOfCountry("IN");
//     const selectedState = indiaStates.find((s) => s.name === state);

//     if (selectedState) {
//       const cities = City.getCitiesOfState("IN", selectedState.isoCode);
//       const cityNames = cities.map((city) => city.name);
//       setAvailableCities(cityNames);
//     } else {
//       setAvailableCities([]);
//     }

//     if (errors.state) {
//       setErrors((prev) => ({
//         ...prev,
//         state: "",
//       }));
//     }
//   };

//   const filteredStates = availableStates.filter((state) =>
//     state.toLowerCase().includes(stateSearch.toLowerCase()),
//   );

//   // ✅ Add this for cities
//   const filteredCities = availableCities.filter((city) =>
//     city.toLowerCase().includes(citySearch.toLowerCase()),
//   );

//   // Validate form
//   const validateForm = () => {
//     const newErrors = {};

//     if (!formData.name?.trim()) {
//       newErrors.name = "Company name is required";
//     }

//     if (!formData.phone?.trim()) {
//       newErrors.phone = "Phone number is required";
//     } else if (!/^\d{10}$/.test(formData.phone.trim())) {
//       newErrors.phone = "Phone number must be 10 digits";
//     }

//     if (!formData.contact_person_name?.trim()) {
//       newErrors.contact_person_name = "Contact person name is required";
//     }

//     if (!formData.city?.trim()) {
//       newErrors.city = "City is required";
//     }

//     if (!formData.state?.trim()) {
//       newErrors.state = "State is required";
//     }

//     if (!formData.pincode?.trim()) {
//       newErrors.pincode = "Pincode is required";
//     } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
//       newErrors.pincode = "Pincode must be 6 digits";
//     }

//     if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//       newErrors.email = "Invalid email format";
//     }

//     if (
//       formData.contact_person_email &&
//       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_person_email)
//     ) {
//       newErrors.contact_person_email = "Invalid email format";
//     }

//     if (
//       formData.contact_person_phone &&
//       !/^\d{10}$/.test(formData.contact_person_phone.trim())
//     ) {
//       newErrors.contact_person_phone = "Phone number must be 10 digits";
//     }

//     if (
//       formData.pan_number &&
//       !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_number)
//     ) {
//       newErrors.pan_number = "Invalid PAN format (e.g., ABCDE1234F)";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // Handle submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       toast.error("Please fix the errors in the form");
//       return;
//     }

//     setIsSubmitting(true);

//     const submitData = {
//       ...formData,
//       registration_number: formData.registration_number?.trim() || null,
//       license_expiry_date: formData.license_expiry_date || null,
//       contract_start_date: formData.contract_start_date || null,
//       contract_end_date: formData.contract_end_date || null,
//     };

//     const result = await FacilityCompanyApi.update(
//       facilityCompanyId,
//       submitData,
//     );

//     if (result.success) {
//       toast.success("Facility company updated successfully!");
//       setTimeout(() => {
//         router.push(`/facility-company?companyId=${companyId}`);
//       }, 1000);
//     } else {
//       if (result.error.includes("registration number already exists")) {
//         toast.error("This registration number is already in use.");
//         setErrors((prev) => ({
//           ...prev,
//           registration_number: "Registration number already exists",
//         }));
//       } else {
//         toast.error(result.error || "Failed to update facility company");
//       }
//       setIsSubmitting(false);
//     }
//   };

//   const handleCitySelect = (city) => {
//     setFormData((prev) => ({
//       ...prev,
//       city: city,
//     }));
//     setCitySearch(city);
//     setShowCityDropdown(false);

//     if (errors.city) {
//       setErrors((prev) => ({
//         ...prev,
//         city: "",
//       }));
//     }
//   };

//   // Handle cancel
//   const handleCancel = () => {
//     if (
//       confirm(
//         "Are you sure you want to cancel? All unsaved changes will be lost.",
//       )
//     ) {
//       router.push(`/facility-company?companyId=${companyId}`);
//     }
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

//   return (
//     <>
//       <Toaster position="top-right" />

//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Header */}
//           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() =>
//                   router.push(`/facility-company?companyId=${companyId}`)
//                 }
//                 className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 text-slate-600" />
//               </button>
//               <div className="flex items-center gap-3">
//                 <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
//                   <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
//                 </div>
//                 <div>
//                   <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
//                     Edit Facility Company
//                   </h1>
//                   <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
//                     Update facility company details
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Form - Same structure as Add page but with pre-filled data */}
//           <form onSubmit={handleSubmit}>
//             {/* Basic Information */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                 <Building2 className="w-5 h-5 text-blue-600" />
//                 Basic Information
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {/* Company Name */}
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Company Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     placeholder="Enter company name"
//                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
//                       errors.name
//                         ? "border-red-300 bg-red-50"
//                         : "border-slate-300"
//                     }`}
//                   />
//                   {errors.name && (
//                     <p className="mt-1 text-sm text-red-600">{errors.name}</p>
//                   )}
//                 </div>

//                 {/* Email */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Email
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       placeholder="company@example.com"
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                         errors.email
//                           ? "border-red-300 bg-red-50"
//                           : "border-slate-300"
//                       }`}
//                     />
//                   </div>
//                   {errors.email && (
//                     <p className="mt-1 text-sm text-red-600">{errors.email}</p>
//                   )}
//                 </div>

//                 {/* Phone */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Phone Number <span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
//                     <input
//                       type="tel"
//                       name="phone"
//                       value={formData.phone}
//                       onChange={handleChange}
//                       placeholder="10-digit phone number"
//                       maxLength="10"
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                         errors.phone
//                           ? "border-red-300 bg-red-50"
//                           : "border-slate-300"
//                       }`}
//                     />
//                   </div>
//                   {errors.phone && (
//                     <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
//                   )}
//                 </div>

//                 {/* Status Toggle */}
//                 <div className="md:col-span-2">
//                   <label className="flex items-center gap-2 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       name="status"
//                       checked={formData.status}
//                       onChange={handleChange}
//                       className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
//                     />
//                     <span className="text-sm font-medium text-slate-700">
//                       Active Status
//                     </span>
//                   </label>
//                   <p className="text-xs text-slate-500 mt-1 ml-6">
//                     {formData.status
//                       ? "Company is currently active"
//                       : "Company is currently inactive"}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* Contact Person Details - Same as Add page */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                 <User className="w-5 h-5 text-blue-600" />
//                 Contact Person Details
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Contact Person Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="contact_person_name"
//                     value={formData.contact_person_name}
//                     onChange={handleChange}
//                     placeholder="Enter contact person name"
//                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       errors.contact_person_name
//                         ? "border-red-300 bg-red-50"
//                         : "border-slate-300"
//                     }`}
//                   />
//                   {errors.contact_person_name && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.contact_person_name}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Contact Person Phone
//                   </label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
//                     <input
//                       type="tel"
//                       name="contact_person_phone"
//                       value={formData.contact_person_phone}
//                       onChange={handleChange}
//                       placeholder="10-digit phone number"
//                       maxLength="10"
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                         errors.contact_person_phone
//                           ? "border-red-300 bg-red-50"
//                           : "border-slate-300"
//                       }`}
//                     />
//                   </div>
//                   {errors.contact_person_phone && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.contact_person_phone}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Contact Person Email
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
//                     <input
//                       type="email"
//                       name="contact_person_email"
//                       value={formData.contact_person_email}
//                       onChange={handleChange}
//                       placeholder="person@example.com"
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                         errors.contact_person_email
//                           ? "border-red-300 bg-red-50"
//                           : "border-slate-300"
//                       }`}
//                     />
//                   </div>
//                   {errors.contact_person_email && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.contact_person_email}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Address Details - Same as Add page with state dropdown */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                 <MapPin className="w-5 h-5 text-blue-600" />
//                 Address Details
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="md:col-span-2">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Address
//                   </label>
//                   <textarea
//                     name="address"
//                     value={formData.address}
//                     onChange={handleChange}
//                     placeholder="Enter full address"
//                     rows="3"
//                     className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div className="relative">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     State <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={stateSearch || formData.state}
//                     onChange={(e) => {
//                       setStateSearch(e.target.value);
//                       setShowStateDropdown(true);
//                       setFormData((prev) => ({ ...prev, state: "" }));
//                     }}
//                     onFocus={() => setShowStateDropdown(true)}
//                     placeholder="Search and select state"
//                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       errors.state
//                         ? "border-red-300 bg-red-50"
//                         : "border-slate-300"
//                     }`}
//                   />
//                   {errors.state && (
//                     <p className="mt-1 text-sm text-red-600">{errors.state}</p>
//                   )}

//                   {showStateDropdown && filteredStates.length > 0 && (
//                     <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                       {filteredStates.map((state) => (
//                         <button
//                           key={state}
//                           type="button"
//                           onClick={() => handleStateSelect(state)}
//                           className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm"
//                         >
//                           {state}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* City - Searchable Dropdown */}
//                 <div className="relative">
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     City <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={citySearch || formData.city}
//                     onChange={(e) => {
//                       setCitySearch(e.target.value);
//                       setShowCityDropdown(true);
//                       if (!e.target.value) {
//                         setFormData((prev) => ({ ...prev, city: "" }));
//                       }
//                     }}
//                     onFocus={() => {
//                       if (formData.state) {
//                         setShowCityDropdown(true);
//                       }
//                     }}
//                     placeholder={
//                       formData.state
//                         ? "Search and select city"
//                         : "Select state first"
//                     }
//                     disabled={!formData.state}
//                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       errors.city
//                         ? "border-red-300 bg-red-50"
//                         : "border-slate-300"
//                     } ${!formData.state ? "bg-slate-100 cursor-not-allowed" : ""}`}
//                   />
//                   {errors.city && (
//                     <p className="mt-1 text-sm text-red-600">{errors.city}</p>
//                   )}
//                   {!formData.state && (
//                     <p className="mt-1 text-xs text-slate-500">
//                       Please select a state first
//                     </p>
//                   )}

//                   {/* City Dropdown */}
//                   {showCityDropdown &&
//                     filteredCities.length > 0 &&
//                     formData.state && (
//                       <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
//                         {filteredCities.map((city) => (
//                           <button
//                             key={city}
//                             type="button"
//                             onClick={() => handleCitySelect(city)}
//                             className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm"
//                           >
//                             {city}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Pincode <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     name="pincode"
//                     value={formData.pincode}
//                     onChange={handleChange}
//                     placeholder="6-digit pincode"
//                     maxLength="6"
//                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       errors.pincode
//                         ? "border-red-300 bg-red-50"
//                         : "border-slate-300"
//                     }`}
//                   />
//                   {errors.pincode && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.pincode}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Business/Legal Information - Same as Add page */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                 <FileText className="w-5 h-5 text-blue-600" />
//                 Business & Legal Information
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Registration Number (GST)
//                   </label>
//                   <input
//                     type="text"
//                     name="registration_number"
//                     value={formData.registration_number}
//                     onChange={handleChange}
//                     placeholder="Enter GST number"
//                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       errors.registration_number
//                         ? "border-red-300 bg-red-50"
//                         : "border-slate-300"
//                     }`}
//                   />
//                   {errors.registration_number && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.registration_number}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     PAN Number
//                   </label>
//                   <input
//                     type="text"
//                     name="pan_number"
//                     value={formData.pan_number}
//                     onChange={handleChange}
//                     placeholder="ABCDE1234F"
//                     maxLength="10"
//                     className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                       errors.pan_number
//                         ? "border-red-300 bg-red-50"
//                         : "border-slate-300"
//                     }`}
//                   />
//                   {errors.pan_number && (
//                     <p className="mt-1 text-sm text-red-600">
//                       {errors.pan_number}
//                     </p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     License Number
//                   </label>
//                   <input
//                     type="text"
//                     name="license_number"
//                     value={formData.license_number}
//                     onChange={handleChange}
//                     placeholder="Enter license number"
//                     className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
//                     <Calendar className="w-4 h-4 text-slate-400" />
//                     License Expiry Date
//                   </label>
//                   <input
//                     type="date"
//                     name="license_expiry_date"
//                     value={formData.license_expiry_date}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Contract Details - Same as Add page */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//               <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
//                 <Calendar className="w-5 h-5 text-blue-600" />
//                 Contract Details
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Contract Start Date
//                   </label>
//                   <input
//                     type="date"
//                     name="contract_start_date"
//                     value={formData.contract_start_date}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Contract End Date
//                   </label>
//                   <input
//                     type="date"
//                     name="contract_end_date"
//                     value={formData.contract_end_date}
//                     onChange={handleChange}
//                     className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Description */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
//               <h2 className="text-lg font-semibold text-slate-800 mb-4">
//                 Additional Information
//               </h2>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Description
//                 </label>
//                 <textarea
//                   name="description"
//                   value={formData.description}
//                   onChange={handleChange}
//                   placeholder="Enter any additional details"
//                   rows="4"
//                   className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   type="button"
//                   onClick={handleCancel}
//                   disabled={isSubmitting}
//                   className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <X className="w-5 h-5" />
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={isSubmitting}
//                   className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="w-5 h-5 animate-spin" />
//                       Updating...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-5 h-5" />
//                       Update Facility Company
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </form>
//         </div>
//       </div>

//       {/* Click outside to close state dropdown */}
//       {(showStateDropdown || showCityDropdown) && (
//         <div
//           className="fixed inset-0 z-0"
//           onClick={() => {
//             setShowStateDropdown(false);
//             setShowCityDropdown(false);
//           }}
//         />
//       )}
//     </>
//   );
// }

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { State, City } from "country-state-city";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Save,
  X,
  Loader2,
  ChevronDown,
  Search,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
import Loader from "@/components/ui/Loader";

export default function EditFacilityCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const facilityCompanyId = params.id;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown States
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  const stateRef = useRef(null);
  const cityRef = useRef(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    contact_person_name: "",
    contact_person_phone: "",
    contact_person_email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    registration_number: "",
    pan_number: "",
    license_number: "",
    license_expiry_date: "",
    contract_start_date: "",
    contract_end_date: "",
    description: "",
    status: true,
  });

  const [errors, setErrors] = useState({});

  // --- INITIAL LOAD ---
  useEffect(() => {
    const indiaStates = State.getStatesOfCountry("IN");
    setAvailableStates(indiaStates.map((s) => s.name));
  }, []);

  useEffect(() => {
    if (facilityCompanyId) fetchFacilityCompany();
  }, [facilityCompanyId]);

  // --- CLICK OUTSIDE ---
  useEffect(() => {
    const listener = (e) => {
      if (stateRef.current && !stateRef.current.contains(e.target))
        setShowStateDropdown(false);
      if (cityRef.current && !cityRef.current.contains(e.target))
        setShowCityDropdown(false);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  // --- FETCH DATA ---
  const fetchFacilityCompany = async () => {
    setIsLoading(true);
    const result = await FacilityCompanyApi.getById(facilityCompanyId);
    if (result.success) {
      const data = result.data;
      setFormData({
        ...data,
        license_expiry_date: data.license_expiry_date
          ? new Date(data.license_expiry_date).toISOString().split("T")[0]
          : "",
        contract_start_date: data.contract_start_date
          ? new Date(data.contract_start_date).toISOString().split("T")[0]
          : "",
        contract_end_date: data.contract_end_date
          ? new Date(data.contract_end_date).toISOString().split("T")[0]
          : "",
      });

      // Pre-fill location
      setStateSearch(data.state || "");
      setCitySearch(data.city || "");

      if (data.state) {
        const indiaStates = State.getStatesOfCountry("IN");
        const selectedState = indiaStates.find((s) => s.name === data.state);
        if (selectedState) {
          const cities = City.getCitiesOfState("IN", selectedState.isoCode);
          setAvailableCities(cities.map((c) => c.name));
        }
      }
    } else {
      toast.error(result.error || "Failed to load details");
      router.push(`/facility-company?companyId=${companyId}`);
    }
    setIsLoading(false);
  };

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStateSelect = (state) => {
    setFormData((prev) => ({ ...prev, state: state, city: "" }));
    setStateSearch(state);
    setCitySearch("");
    setShowStateDropdown(false);

    const indiaStates = State.getStatesOfCountry("IN");
    const selectedState = indiaStates.find((s) => s.name === state);
    if (selectedState) {
      const cities = City.getCitiesOfState("IN", selectedState.isoCode);
      setAvailableCities(cities.map((c) => c.name));
    } else {
      setAvailableCities([]);
    }
    if (errors.state) setErrors((prev) => ({ ...prev, state: "" }));
  };

  const handleCitySelect = (city) => {
    setFormData((prev) => ({ ...prev, city: city }));
    setCitySearch(city);
    setShowCityDropdown(false);
    if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
  };

  // --- FILTERS ---
  const filteredStates = availableStates.filter((s) =>
    s.toLowerCase().includes(stateSearch.toLowerCase()),
  );
  const filteredCities = availableCities.filter((c) =>
    c.toLowerCase().includes(citySearch.toLowerCase()),
  );

  // --- VALIDATE ---
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Required";
    if (!formData.phone?.trim()) newErrors.phone = "Required";
    else if (!/^\d{10}$/.test(formData.phone.trim()))
      newErrors.phone = "Must be 10 digits";
    if (!formData.contact_person_name?.trim())
      newErrors.contact_person_name = "Required";
    if (!formData.state?.trim()) newErrors.state = "Required";
    if (!formData.city?.trim()) newErrors.city = "Required";
    if (!formData.pincode?.trim()) newErrors.pincode = "Required";
    else if (!/^\d{6}$/.test(formData.pincode.trim()))
      newErrors.pincode = "Must be 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return toast.error("Please fix errors");

    setIsSubmitting(true);
    const submitData = {
      ...formData,
      registration_number: formData.registration_number?.trim() || null,
      license_expiry_date: formData.license_expiry_date || null,
      contract_start_date: formData.contract_start_date || null,
      contract_end_date: formData.contract_end_date || null,
    };

    const result = await FacilityCompanyApi.update(
      facilityCompanyId,
      submitData,
    );
    if (result.success) {
      toast.success("Updated successfully!");
      setTimeout(
        () => router.push(`/facility-company?companyId=${companyId}`),
        1000,
      );
    } else {
      toast.error(result.error || "Update failed");
      setIsSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size="large" color="#3b82f6" />
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 flex justify-center pb-20">
        <div className="w-full max-w-5xl space-y-6">
          {/* HEADER */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-slate-500"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Edit Facility Company
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. BASIC INFO */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                  <Building2 size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Basic Information
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Company Identity
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Company Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none ${errors.name ? "border-rose-300" : "border-slate-200"}`}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="phone"
                      maxLength="10"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full h-11 pl-10 pr-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none ${errors.phone ? "border-rose-300" : "border-slate-200"}`}
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-slate-200 bg-slate-50/50 w-fit">
                    <input
                      type="checkbox"
                      name="status"
                      checked={formData.status}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Active Status
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 2. CONTACT PERSON */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600">
                  <User size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Contact Person
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Representative Details
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="contact_person_name"
                    value={formData.contact_person_name}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none ${errors.contact_person_name ? "border-rose-300" : "border-slate-200"}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="contact_person_phone"
                      value={formData.contact_person_phone}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      name="contact_person_email"
                      value={formData.contact_person_email}
                      onChange={handleChange}
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. ADDRESS */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-orange-600">
                  <MapPin size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Location
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Headquarters Address
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Full Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none resize-none"
                  />
                </div>

                <div className="space-y-2" ref={stateRef}>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      value={stateSearch || formData.state}
                      onChange={(e) => {
                        setStateSearch(e.target.value);
                        setShowStateDropdown(true);
                        if (!e.target.value)
                          setFormData((p) => ({ ...p, state: "", city: "" }));
                      }}
                      onFocus={() => setShowStateDropdown(true)}
                      className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none ${errors.state ? "border-rose-300" : "border-slate-200"}`}
                      placeholder="Search State"
                    />
                    {showStateDropdown && filteredStates.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredStates.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStateSelect(s)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2" ref={cityRef}>
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      value={citySearch || formData.city}
                      onChange={(e) => {
                        setCitySearch(e.target.value);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() =>
                        formData.state && setShowCityDropdown(true)
                      }
                      disabled={!formData.state}
                      className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none ${errors.city ? "border-rose-300" : "border-slate-200"} ${!formData.state && "opacity-60 cursor-not-allowed"}`}
                      placeholder={
                        formData.state ? "Search City" : "Select State First"
                      }
                    />
                    {showCityDropdown && filteredCities.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredCities.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => handleCitySelect(c)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50"
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    name="pincode"
                    maxLength="6"
                    value={formData.pincode}
                    onChange={handleChange}
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none ${errors.pincode ? "border-rose-300" : "border-slate-200"}`}
                  />
                </div>
              </div>
            </div>

            {/* 4. BUSINESS & LEGAL */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-teal-50 flex items-center justify-center border border-teal-100 text-teal-600">
                  <FileText size={20} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em]">
                    Legal Details
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-80">
                    Registration & Contract
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    GST / Reg Number
                  </label>
                  <input
                    name="registration_number"
                    value={formData.registration_number}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    PAN Number
                  </label>
                  <input
                    name="pan_number"
                    value={formData.pan_number}
                    onChange={handleChange}
                    maxLength="10"
                    className={`w-full h-11 px-4 rounded-xl border bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none ${errors.pan_number ? "border-rose-300" : "border-slate-200"}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    License Expiry
                  </label>
                  <input
                    type="date"
                    name="license_expiry_date"
                    value={formData.license_expiry_date}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Contract Start
                  </label>
                  <input
                    type="date"
                    name="contract_start_date"
                    value={formData.contract_start_date}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Contract End
                  </label>
                  <input
                    type="date"
                    name="contract_end_date"
                    value={formData.contract_end_date}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-200 font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSubmitting ? "Updating..." : "Update Company"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
