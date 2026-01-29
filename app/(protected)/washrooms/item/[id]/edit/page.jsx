// "use client";

// import React, { useEffect, useState, useRef } from "react";
// import { useParams, useRouter, useSearchParams } from "next/navigation";

// import LocationsApi from "@/features/locations/locations.api";
// import { fetchToiletFeaturesByName } from "@/features/configurations/configurations.api";
// import Loader from "@/components/ui/Loader";
// import { useCompanyId } from "@/providers/CompanyProvider";
// import { usePermissions } from "@/shared/hooks/usePermission";
// import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
// import { MODULES } from "@/shared/constants/permissions";
// import toast, { Toaster } from "react-hot-toast";
// import { FacilityCompanyApi } from "@/features/facilityCompany/facilityCompany.api";
// import {
//   MapPin,
//   Save,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   X,
//   Navigation,
//   Plus,
//   Eye,
//   AlertCircle,
//   Upload,
//   Image as ImageIcon,
//   Trash2,
//   Home,
//   Building2,
//   Users,
//   Camera,
//   Droplets,
//   Armchair,
// } from "lucide-react";

// import { Country, State, City } from "country-state-city";
// import GoogleMapPicker from "@/app/(protected)/add-location/components/GoogleMapPicker";
// import LatLongInput from "@/app/(protected)/add-location/components/LatLongInput";
// // import SearchableSelect from './components/SearchableSelect';
// import SearchableSelect from "../../../add-location/components/SearchableSelect";
// import locationTypesApi from "@/lib/api/locationTypesApi";

// // ✅ Indian States List
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

// const EditLocationPage = () => {
//   useRequirePermission(MODULES.LOCATIONS);

//   const { canUpdate } = usePermissions();
//   const canEditLocation = canUpdate(MODULES.LOCATIONS);

//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [allLocations, setAllLocations] = useState([]);
//   const [navigationLoading, setNavigationLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSearch, setShowSearch] = useState(false);
//   const [toiletFeatures, setToiletFeatures] = useState({});
//   const [selectedFacilityCompany, setSelectedFacilityCompany] = useState();
//   const [facilityCompanies, setFacilityCompanies] = useState([]);

//   // location type select dropdown
//   const [selectedLocationType, setSelectedLocationType] = useState();
//   const [locationTypes, setLocationTypes] = useState([]);

//   //  Image states
//   const [newImages, setNewImages] = useState([]);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
//   const [imagesToDelete, setImagesToDelete] = useState([]);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(null);
//   const fileInputRef = useRef(null);

//   const [availableStates, setAvailableStates] = useState([]);
//   const [availableCities, setAvailableCities] = useState([]);
//   const [availableDistricts, setAvailableDistricts] = useState([]);

//   // ✅ Updated formData with new fields
//   const [formData, setFormData] = useState({
//     name: "",
//     latitude: "",
//     longitude: "",
//     address: "",
//     city: "",
//     state: "",
//     dist: "",
//     pincode: "",
//     facility_companiesId: null,
//     type_id: null,
//     options: {},
//     usage_category: {
//       men: {
//         wc: 0,
//         indian: 0,
//         urinal: 0,
//         shower: 0,
//         basin: 0,
//       },
//       women: {
//         wc: 0,
//         indian: 0,
//         urinal: 0,
//         shower: 0,
//         basin: 0,
//       },
//     },
//   });

//   const params = useParams();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { companyId } = useCompanyId();

//   const urlCompanyId = searchParams.get("companyId");
//   const finalCompanyId = companyId || urlCompanyId;

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!params.id || !finalCompanyId) return;

//       try {
//         setLoading(true);

//         const [
//           locationResult,
//           locationsResult,
//           featuresResult,
//           facilityCompaniesResult,
//           locationTypesResult,
//         ] = await Promise.all([
//           LocationsApi.getLocationById(params.id, finalCompanyId),
//           LocationsApi.getAllLocations(finalCompanyId),
//           fetchToiletFeaturesByName("Toilet_Features"),
//           // FacilityCompanyApi.getAllFacilityCompanies(finalCompanyId)
//           FacilityCompanyApi.getAll(finalCompanyId),
//           locationTypesApi.getAll(finalCompanyId),
//         ]);

//         console.log(locationResult, "locatoin result");
//         console.log(locationTypesResult, "location tyeps result");

//         if (locationResult.success) {
//           setLocation(locationResult.data);
//           setFormData({
//             name: locationResult.data.name,
//             latitude: locationResult.data.latitude?.toString() || "",
//             longitude: locationResult.data.longitude?.toString() || "",
//             address: locationResult.data.address || "",
//             city: locationResult.data.city || "",
//             state: locationResult.data.state || "",
//             dist: locationResult.data.dist || "",
//             pincode: locationResult.data.pincode || "",
//             no_of_photos: locationResult.data.no_of_photos,
//             options: locationResult.data.options || {},

//             usage_category: locationResult.data.usage_category || {
//               men: {
//                 wc: 0,
//                 indian: 0,
//                 urinals: 0,
//               },
//               women: {
//                 wc: 0,
//                 indian: 0,
//                 urinals: 0,
//               },
//             },
//           });

//           setExistingImages(locationResult.data.images || []);
//           setSelectedFacilityCompany(locationResult.data.facility_companiesId);
//           setSelectedLocationType(locationResult.data?.type_id);

//           if (locationResult.data?.state) {
//             const indiaStates = State.getStatesOfCountry("IN");
//             const selectedState = indiaStates.find(
//               (s) => s.name === locationResult?.data?.state,
//             );
//             if (selectedState) {
//               const cities = City.getCitiesOfState("IN", selectedState.isoCode);
//               const cityNames = cities.map((city) => city.name);
//               setAvailableCities(cityNames);
//             }
//           }
//         } else {
//           setError(locationResult.error);
//         }

//         if (locationsResult.success) {
//           setAllLocations(locationsResult.data);
//         }

//         if (facilityCompaniesResult.success) {
//           setFacilityCompanies(facilityCompaniesResult.data);
//         }

//         if (locationTypesResult) {
//           setLocationTypes(locationTypesResult);
//         }
//         if (featuresResult) {
//           const features = {};
//           featuresResult?.data[0]?.description.forEach((feature) => {
//             features[feature.key] = feature;
//           });
//           setToiletFeatures(features);
//         }
//       } catch (err) {
//         setError("Failed to fetch location data");
//         console.error("Error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params.id, finalCompanyId]);

//   // Load Indian states on mount
//   useEffect(() => {
//     const indiaStates = State.getStatesOfCountry("IN");
//     const stateNames = indiaStates.map((state) => state.name);
//     setAvailableStates(stateNames);
//   }, []);

//   // ✅ Image handling functions
//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     const validFiles = [];
//     const invalidFiles = [];

//     files.forEach((file) => {
//       if (file.type.startsWith("image/")) {
//         if (file.size <= 10 * 1024 * 1024) {
//           validFiles.push(file);
//         } else {
//           invalidFiles.push(file.name + " (too large)");
//         }
//       } else {
//         invalidFiles.push(file.name + " (not an image)");
//       }
//     });

//     if (invalidFiles.length > 0) {
//       toast.error(`Invalid files: ${invalidFiles.join(", ")}`);
//     }

//     if (validFiles.length > 0) {
//       setNewImages((prev) => [...prev, ...validFiles]);

//       const newPreviews = validFiles.map((file) => ({
//         file,
//         url: URL.createObjectURL(file),
//         name: file.name,
//         isNew: true,
//       }));

//       setPreviewImages((prev) => [...prev, ...newPreviews]);
//     }

//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   const removeNewImage = (index) => {
//     URL.revokeObjectURL(previewImages[index].url);
//     setNewImages((prev) => prev.filter((_, i) => i !== index));
//     setPreviewImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   const removeExistingImage = (imageUrl) => {
//     setImagesToDelete((prev) => [...prev, imageUrl]);
//     setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const handleMultiselectChange = (key, value, checked) => {
//     const currentValues = formData.options[key] || [];
//     let newValues;

//     if (checked) {
//       newValues = currentValues.includes(value)
//         ? currentValues
//         : [...currentValues, value];
//     } else {
//       newValues = currentValues.filter((v) => v !== value);
//     }

//     handleOptionChange(key, newValues);
//   };

//   const getCurrentLocationIndex = () => {
//     return allLocations.findIndex((loc) => loc.id === params.id);
//   };

//   const handlePrevious = async () => {
//     const currentIndex = getCurrentLocationIndex();
//     if (currentIndex > 0) {
//       setNavigationLoading(true);
//       const prevLocation = allLocations[currentIndex - 1];
//       router.push(
//         `/washrooms/item/${prevLocation.id}/edit?companyId=${finalCompanyId}`,
//       );
//     }
//   };

//   const handleNext = async () => {
//     const currentIndex = getCurrentLocationIndex();
//     if (currentIndex < allLocations.length - 1) {
//       setNavigationLoading(true);
//       const nextLocation = allLocations[currentIndex + 1];
//       router.push(
//         `/washrooms/item/${nextLocation.id}/edit?companyId=${finalCompanyId}`,
//       );
//     }
//   };

//   const getNavigationInfo = () => {
//     const currentIndex = getCurrentLocationIndex();
//     return {
//       currentIndex,
//       hasPrevious: currentIndex > 0,
//       hasNext: currentIndex < allLocations.length - 1,
//       previousName:
//         currentIndex > 0 ? allLocations[currentIndex - 1]?.name : null,
//       nextName:
//         currentIndex < allLocations.length - 1
//           ? allLocations[currentIndex + 1]?.name
//           : null,
//     };
//   };

//   // const handleInputChange = (field, value) => {
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     [field]: value
//   //   }));
//   // };

//   // const handleInputChange = (field, value) => {
//   //   if (field === 'state') {
//   //     const indiaStates = State.getStatesOfCountry('IN');
//   //     const selectedState = indiaStates.find(s => s.name === value);

//   //     if (selectedState) {
//   //       const cities = City.getCitiesOfState('IN', selectedState.isoCode);
//   //       const cityNames = cities.map(city => city.name);
//   //       setAvailableCities(cityNames);
//   //     } else {
//   //       setAvailableCities([]);
//   //     }

//   //     setFormData(prev => ({
//   //       ...prev,
//   //       state: value,
//   //       city: '' // Reset city when state changes
//   //     }));
//   //   } else {

//   //     setFormData(prev => ({ ...prev, [field]: value }));
//   //   }
//   // };

//   const handleInputChange = (field, value) => {
//     // Handle state change separately
//     if (field === "state") {
//       const indiaStates = State.getStatesOfCountry("IN");
//       const selectedState = indiaStates.find((s) => s.name === value);

//       if (selectedState) {
//         const cities = City.getCitiesOfState("IN", selectedState.isoCode);
//         const cityNames = cities.map((city) => city.name);
//         setAvailableCities(cityNames);
//       } else {
//         setAvailableCities([]);
//       }

//       setFormData((prev) => ({
//         ...prev,
//         state: value,
//         city: "", // Reset city when state changes
//       }));
//       return; // Exit early for state
//     }

//     // Validate coordinates
//     if (field === "latitude") {
//       const lat = parseFloat(value);
//       if (value && (isNaN(lat) || lat < -90 || lat > 90)) {
//         toast.error("Latitude must be between -90 and 90");
//       }
//     }

//     if (field === "longitude") {
//       const lng = parseFloat(value);
//       if (value && (isNaN(lng) || lng < -180 || lng > 180)) {
//         toast.error("Longitude must be between -180 and 180");
//       }
//     }

//     // Update form data for all other fields
//     setFormData((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleOptionChange = (optionKey, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       options: {
//         ...prev.options,
//         [optionKey]: value,
//       },
//     }));
//   };

//   // ✅ Updated save handler with new fields
//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       if (!formData.name.trim()) {
//         toast.error("Location name is required");
//         return;
//       }

//       const updateData = {
//         name: formData.name.trim(),
//         latitude: formData.latitude ? parseFloat(formData.latitude) : null,
//         longitude: formData.longitude ? parseFloat(formData.longitude) : null,
//         address: formData.address.trim() || null,
//         city: formData.city.trim() || null,
//         state: formData.state || null,
//         dist: formData.dist.trim() || null,
//         pincode: formData.pincode.trim() || null,
//         no_of_photos: formData.no_of_photos || null,
//         facility_companiesId: formData.facility_companiesId || null,
//         type_id: formData.type_id || null,
//         options: formData.options,
//         usage_category: formData.usage_category,
//       };

//       // console.log(updateData, "data to be updated")
//       // Handle image deletion first
//       for (const imageUrl of imagesToDelete) {
//         try {
//           await LocationsApi.deleteLocationImage(
//             params.id,
//             imageUrl,
//             finalCompanyId,
//           );
//         } catch (error) {
//           console.error("Error deleting image:", error);
//         }
//       }

//       const result = await LocationsApi.updateLocation(
//         params.id,
//         updateData,
//         finalCompanyId,
//         newImages,
//         false,
//       );

//       if (result.success) {
//         toast.success("Location updated successfully! Redirecting...");

//         previewImages.forEach((preview) => {
//           if (preview.url.startsWith("blob:")) {
//             URL.revokeObjectURL(preview.url);
//           }
//         });

//         router.push(`/washrooms?companyId=${finalCompanyId}`);
//       } else {
//         toast.error(result.error || "Failed to update location");
//         setSaving(false);
//       }
//     } catch (error) {
//       console.error("Save error:", error);
//       toast.error("Failed to update location");
//       setSaving(false);
//     }
//   };

//   // Render option controls
//   const renderOptionControl = (optionKey, feature) => {
//     const currentValue = formData.options[optionKey];

//     switch (feature.type) {
//       case "boolean":
//         return (
//           <div
//             key={optionKey}
//             className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
//           >
//             <div>
//               <label className="font-medium text-slate-800">
//                 {feature.label}
//               </label>
//               {feature.category && (
//                 <p className="text-sm text-slate-500 mt-1">
//                   {feature.category}
//                 </p>
//               )}
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={currentValue ?? feature.defaultValue ?? false}
//                 onChange={(e) =>
//                   handleOptionChange(optionKey, e.target.checked)
//                 }
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
//             </label>
//           </div>
//         );

//       case "multiselect":
//         const selectedValues = currentValue || feature.defaultValue || [];
//         return (
//           <div
//             key={optionKey}
//             className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
//           >
//             <label className="block font-semibold text-slate-800">
//               {feature.label}
//               {feature.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {feature.category && (
//               <p className="text-sm text-slate-500">{feature.category}</p>
//             )}

//             {selectedValues.length > 0 && (
//               <div className="text-sm text-blue-600 font-medium">
//                 {selectedValues.length} selected
//               </div>
//             )}

//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//               {feature.options?.map((option, index) => {
//                 const value =
//                   typeof option === "string" ? option : option.value;
//                 const label =
//                   typeof option === "string" ? option : option.label;
//                 const isSelected = selectedValues.includes(value);

//                 return (
//                   <label
//                     key={index}
//                     className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
//                       isSelected
//                         ? "bg-blue-50 border-blue-500"
//                         : "bg-white border-slate-200 hover:bg-slate-50"
//                     }`}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={(e) =>
//                         handleMultiselectChange(
//                           optionKey,
//                           value,
//                           e.target.checked,
//                         )
//                       }
//                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
//                     />
//                     <span
//                       className={`text-sm font-medium ${
//                         isSelected ? "text-blue-700" : "text-slate-700"
//                       }`}
//                     >
//                       {label}
//                     </span>
//                   </label>
//                 );
//               })}
//             </div>

//             {selectedValues.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {selectedValues.map((value) => {
//                   const option = feature.options?.find(
//                     (opt) =>
//                       (typeof opt === "string" ? opt : opt.value) === value,
//                   );
//                   const label = option
//                     ? typeof option === "string"
//                       ? option
//                       : option.label
//                     : value;

//                   return (
//                     <span
//                       key={value}
//                       className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
//                     >
//                       {label}
//                       <button
//                         type="button"
//                         onClick={() =>
//                           handleMultiselectChange(optionKey, value, false)
//                         }
//                         className="ml-1 text-blue-600 hover:text-blue-800"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         );

//       case "select":
//       case "dropdown":
//         return (
//           <div key={optionKey} className="space-y-2">
//             <label className="block font-semibold text-slate-800">
//               {feature.label}
//               {feature.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {feature.category && (
//               <p className="text-sm text-slate-500">{feature.category}</p>
//             )}
//             <select
//               value={currentValue ?? feature.defaultValue ?? ""}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               required={feature.required}
//             >
//               <option value="">Select {feature.label}</option>
//               {feature.options?.map((option, index) => {
//                 const value =
//                   typeof option === "string" ? option : option.value;
//                 const label =
//                   typeof option === "string" ? option : option.label;
//                 return (
//                   <option key={index} value={value}>
//                     {label}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>
//         );

//       case "text":
//         return (
//           <div key={optionKey} className="space-y-2">
//             <label className="block font-semibold text-slate-800">
//               {feature.label}
//               {feature.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {feature.category && (
//               <p className="text-sm text-slate-500">{feature.category}</p>
//             )}
//             <input
//               type="text"
//               value={currentValue ?? feature.defaultValue ?? ""}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder={feature.placeholder || `Enter ${feature.label}`}
//               maxLength={feature.maxLength}
//               required={feature.required}
//             />
//           </div>
//         );

//       case "number":
//         return (
//           <div key={optionKey} className="space-y-2">
//             <label className="block font-semibold text-slate-800">
//               {feature.label}
//               {feature.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {feature.category && (
//               <p className="text-sm text-slate-500">{feature.category}</p>
//             )}
//             <input
//               type="number"
//               value={currentValue ?? feature.defaultValue ?? ""}
//               onChange={(e) =>
//                 handleOptionChange(optionKey, parseFloat(e.target.value) || "")
//               }
//               className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               min={feature.min}
//               max={feature.max}
//               step={feature.step || "any"}
//               required={feature.required}
//             />
//           </div>
//         );

//       case "textarea":
//         return (
//           <div key={optionKey} className="space-y-2">
//             <label className="block font-semibold text-slate-800">
//               {feature.label}
//               {feature.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {feature.category && (
//               <p className="text-sm text-slate-500">{feature.category}</p>
//             )}
//             <textarea
//               value={currentValue ?? feature.defaultValue ?? ""}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder={feature.placeholder || `Enter ${feature.label}`}
//               rows={feature.rows || 3}
//               maxLength={feature.maxLength}
//               required={feature.required}
//             />
//           </div>
//         );

//       default:
//         return (
//           <div key={optionKey} className="space-y-2">
//             <label className="block font-semibold text-slate-800">
//               {feature.label}
//             </label>
//             <input
//               type="text"
//               value={currentValue ?? ""}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder={`Enter ${feature.label}`}
//             />
//           </div>
//         );
//     }
//   };

//   // Clean up preview URLs on unmount
//   useEffect(() => {
//     return () => {
//       previewImages.forEach((preview) => {
//         if (preview.url.startsWith("blob:")) {
//           URL.revokeObjectURL(preview.url);
//         }
//       });
//     };
//   }, []);

//   if (loading || navigationLoading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <Loader size="large" color="#3b82f6" message="Loading location..." />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
//           <div className="text-red-500 mb-4">
//             <AlertCircle className="w-12 h-12 mx-auto" />
//           </div>
//           <h2 className="text-xl font-semibold text-slate-900 mb-2">
//             Something went wrong
//           </h2>
//           <p className="text-slate-600 mb-6">{error}</p>
//           <button
//             onClick={() => router.back()}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!location) {
//     return (
//       <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
//         <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
//           <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-slate-900 mb-2">
//             Location not found
//           </h2>
//           <p className="text-slate-600">
//             This location doesn't exist or has been removed.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   const navigationInfo = getNavigationInfo();

//   const updateUsageCategory = (gender, field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       usage_category: {
//         ...prev.usage_category,
//         [gender]: {
//           ...prev.usage_category[gender],
//           [field]: value === "" ? 0 : parseInt(value),
//         },
//       },
//     }));
//   };

//   return (
//     <>
//       <Toaster position="top-right" />

//       <div className="min-h-screen bg-slate-50">
//         {/* Header */}
//         <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
//           <div className="max-w-6xl mx-auto px-4 py-4">
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//               <button
//                 onClick={() =>
//                   router.push(`/washrooms?companyId=${finalCompanyId}`)
//                 }
//                 className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 mr-2" />
//                 <span className="font-medium">Back to Listings</span>
//               </button>

//               {/* Navigation Controls */}
//               <div className="flex items-center gap-2 w-full sm:w-auto">
//                 <button
//                   onClick={handlePrevious}
//                   disabled={!navigationInfo.hasPrevious}
//                   className="flex items-center px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex-1 sm:flex-none justify-center"
//                   title={
//                     navigationInfo.previousName
//                       ? `Previous: ${navigationInfo.previousName}`
//                       : "No previous location"
//                   }
//                 >
//                   <ChevronLeft className="w-4 h-4 mr-1" />
//                   <span className="hidden sm:inline">
//                     {navigationInfo.previousName &&
//                       navigationInfo.previousName.substring(0, 15)}
//                   </span>
//                 </button>

//                 <span className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium whitespace-nowrap">
//                   {navigationInfo.currentIndex + 1} of {allLocations.length}
//                 </span>

//                 <button
//                   onClick={handleNext}
//                   disabled={!navigationInfo.hasNext}
//                   className="flex items-center px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex-1 sm:flex-none justify-center"
//                   title={
//                     navigationInfo.nextName
//                       ? `Next: ${navigationInfo.nextName}`
//                       : "No next location"
//                   }
//                 >
//                   <span className="hidden sm:inline">
//                     {navigationInfo.nextName &&
//                       navigationInfo.nextName.substring(0, 15)}
//                   </span>
//                   <ChevronRight className="w-4 h-4 ml-1" />
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
//           {/* Main Form */}
//           <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
//             {/* Form Header */}
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
//               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//                 <div>
//                   <h1 className="text-2xl font-bold text-white mb-2">
//                     Edit Washroom
//                   </h1>
//                   <p className="text-blue-100 text-sm">
//                     Update location information, address, images, and amenities
//                   </p>
//                 </div>
//                 <button
//                   onClick={() =>
//                     router.push(
//                       `/washrooms/item/${params.id}?companyId=${finalCompanyId}`,
//                     )
//                   }
//                   className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md whitespace-nowrap"
//                 >
//                   <Eye className="w-4 h-4 mr-2" />
//                   View Location
//                 </button>
//               </div>
//             </div>

//             <div className="p-4 sm:p-6 lg:p-8 space-y-8">
//               {/* ========== FACILITY COMPANY SECTION ========== */}
//               <div className="space-y-4 border-t border-slate-200 pt-6 mt-6">
//                 <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                   <Building2 className="w-5 h-5 text-blue-600" />
//                   Facility Company Assignment
//                 </h3>

//                 {/* Current Assignment Display */}
//                 {selectedFacilityCompany && (
//                   <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-sm text-blue-800 font-medium">
//                       Current Assignment:{" "}
//                       <span className="font-bold">
//                         {facilityCompanies.find(
//                           (fc) => fc.id === selectedFacilityCompany,
//                         )?.name || "Unknown Company"}
//                       </span>
//                     </p>
//                   </div>
//                 )}

//                 {/* Current Status if null */}
//                 {!selectedFacilityCompany && (
//                   <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                     <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
//                       <AlertCircle className="w-4 h-4" />
//                       No facility company assigned
//                     </p>
//                   </div>
//                 )}

//                 {/* Facility Company Dropdown */}
//                 <div className="space-y-2">
//                   <label className="block font-semibold text-slate-800">
//                     Select Facility Company
//                   </label>
//                   <select
//                     value={formData.facility_companiesId || ""}
//                     onChange={(e) => {
//                       const newValue =
//                         e.target.value === "" ? null : e.target.value;
//                       handleInputChange("facility_companiesId", newValue);
//                       setSelectedFacilityCompany(newValue);
//                     }}
//                     className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   >
//                     <option value="">-- No Facility Company --</option>
//                     {facilityCompanies.map((company) => (
//                       <option key={company.id} value={company.id}>
//                         {company.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* ========== LOCATION HIERARCHY SECTION ========== */}
//                 <div className="space-y-4 border-t border-slate-200 pt-6 mt-6">
//                   <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                     <Home className="w-5 h-5 text-blue-600" />
//                     Location Hierarchy
//                   </h3>

//                   {/* Current Assignment Display */}
//                   {selectedLocationType && (
//                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                       <p className="text-sm text-blue-800 font-medium">
//                         Current Type:{" "}
//                         <span className="font-bold">
//                           {locationTypes.find(
//                             (lt) => lt.id === selectedLocationType,
//                           )?.name || "Unknown Type"}
//                         </span>
//                       </p>
//                     </div>
//                   )}

//                   {/* Current Status if null */}
//                   {!selectedLocationType && (
//                     <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                       <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
//                         <AlertCircle className="w-4 h-4" />
//                         No location type assigned
//                       </p>
//                     </div>
//                   )}

//                   {/* Location Type Dropdown */}
//                   <div className="space-y-2">
//                     <label className="block font-semibold text-slate-800">
//                       Select Location Type
//                     </label>
//                     <select
//                       value={formData.type_id || ""}
//                       onChange={(e) => {
//                         const newValue =
//                           e.target.value === "" ? null : e.target.value;
//                         handleInputChange("type_id", newValue);
//                         setSelectedLocationType(newValue);
//                       }}
//                       className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     >
//                       <option value="">-- No Location Type --</option>
//                       {locationTypes.map((locationType) => (
//                         <option key={locationType.id} value={locationType.id}>
//                           {locationType.name}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Change Indicator */}
//                   {selectedLocationType !== location?.type_id && (
//                     <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                       <p className="text-sm text-green-700 font-medium">
//                         {selectedLocationType ? (
//                           <>
//                             ✓ Will change from{" "}
//                             <span className="font-bold">
//                               {location?.type_id
//                                 ? locationTypes.find(
//                                     (lt) => lt.id === location.type_id,
//                                   )?.name || "Unknown"
//                                 : "None"}
//                             </span>
//                             {" to "}
//                             <span className="font-bold">
//                               {
//                                 locationTypes.find(
//                                   (lt) => lt.id === selectedLocationType,
//                                 )?.name
//                               }
//                             </span>
//                           </>
//                         ) : (
//                           <>✓ Will remove location type assignment</>
//                         )}
//                       </p>
//                     </div>
//                   )}
//                 </div>

//                 {/* Change Indicator */}
//                 {selectedFacilityCompany !== location?.facility_companiesId && (
//                   <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
//                     <p className="text-sm text-green-700 font-medium">
//                       {selectedFacilityCompany ? (
//                         <>
//                           ✓ Will change from{" "}
//                           <span className="font-bold">
//                             {location?.facility_companiesId
//                               ? facilityCompanies.find(
//                                   (fc) =>
//                                     fc.id === location.facility_companiesId,
//                                 )?.name || "Unknown"
//                               : "None"}
//                           </span>
//                           {" to "}
//                           <span className="font-bold">
//                             {
//                               facilityCompanies.find(
//                                 (fc) => fc.id === selectedFacilityCompany,
//                               )?.name
//                             }
//                           </span>
//                         </>
//                       ) : (
//                         <>✓ Will remove facility company assignment</>
//                       )}
//                     </p>
//                   </div>
//                 )}
//               </div>

//               {/* ========== SECTION 1: BASIC INFORMATION ========== */}
//               <div className="space-y-6">
//                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
//                   <Building2 className="w-6 h-6 text-blue-600" />
//                   Basic Information
//                 </h2>

//                 {/* Location Name */}
//                 <div className="space-y-2">
//                   <label className="block font-semibold text-slate-800">
//                     Location Name <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={(e) => handleInputChange("name", e.target.value)}
//                     className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     placeholder="Enter location name"
//                     required
//                   />
//                 </div>

//                 {/* Coordinates Row */}
//                 {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div className="space-y-2">
//                     <label className="block font-semibold text-slate-800">Latitude</label>
//                     <input
//                       type="number"
//                       step="any"
//                       value={formData.latitude}
//                       onChange={(e) => handleInputChange('latitude', e.target.value)}
//                       className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="e.g., 21.1458"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label className="block font-semibold text-slate-800">Longitude</label>
//                     <input
//                       type="number"
//                       step="any"
//                       value={formData.longitude}
//                       onChange={(e) => handleInputChange('longitude', e.target.value)}
//                       className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       placeholder="e.g., 79.0882"
//                     />
//                   </div>

//                   <div className="space-y-2">
//                     <label className="block font-semibold text-slate-800">View on Map</label>
//                     <button
//                       type="button"
//                       onClick={() => window.open(`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`, '_blank')}
//                       disabled={!formData.latitude || !formData.longitude}
//                       className="w-full flex items-center justify-center px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                     >
//                       <Navigation className="w-4 h-4 mr-2" />
//                       Open in Maps
//                     </button>
//                   </div>
//                 </div> */}

//                 {/* ========== LOCATION COORDINATES WITH MAP ========== */}
//                 <div className="space-y-4 border-t border-slate-200 pt-6 mt-6">
//                   <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                     <MapPin className="w-5 h-5 text-blue-600" />
//                     Location Coordinates
//                   </h3>

//                   {/* Info Banner */}
//                   {/* <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                     <p className="text-sm text-blue-800">
//                       <span className="font-semibold">Interactive Map:</span> Click on the map to select a new location,
//                       or manually enter coordinates below. Changes are synchronized automatically.
//                     </p>
//                   </div> */}

//                   {/* Google Map Picker - Interactive Map */}
//                   <div className="bg-white p-2 border-2 border-slate-300 overflow-hidden">
//                     <GoogleMapPicker
//                       lat={
//                         formData.latitude ? parseFloat(formData.latitude) : null
//                       }
//                       lng={
//                         formData.longitude
//                           ? parseFloat(formData.longitude)
//                           : null
//                       }
//                       onSelect={(lat, lng) => {
//                         handleInputChange("latitude", lat?.toString() || "");
//                         handleInputChange("longitude", lng?.toString() || "");
//                       }}
//                     />
//                   </div>

//                   {/* Manual Lat/Long Input */}
//                   <LatLongInput
//                     lat={
//                       formData.latitude ? parseFloat(formData.latitude) : null
//                     }
//                     lng={
//                       formData.longitude ? parseFloat(formData.longitude) : null
//                     }
//                     onChange={(lat, lng) => {
//                       handleInputChange("latitude", lat?.toString() || "");
//                       handleInputChange("longitude", lng?.toString() || "");
//                     }}
//                   />

//                   {/* Current Coordinates Display */}
//                   {formData.latitude && formData.longitude && (
//                     <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//                       <p className="text-sm text-green-800 font-medium flex items-center gap-2">
//                         <Navigation className="w-4 h-4" />
//                         Current Coordinates:
//                         <span className="font-mono">
//                           {parseFloat(formData.latitude).toFixed(6)},{" "}
//                           {parseFloat(formData.longitude).toFixed(6)}
//                         </span>
//                       </p>
//                       {(formData.latitude !== location?.latitude?.toString() ||
//                         formData.longitude !==
//                           location?.longitude?.toString()) && (
//                         <p className="text-xs text-green-700 mt-2">
//                           ✓ Coordinates have been modified
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {/* No Coordinates Warning */}
//                   {(!formData.latitude || !formData.longitude) && (
//                     <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
//                       <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
//                         <AlertCircle className="w-4 h-4" />
//                         No coordinates set. Click on the map or enter
//                         coordinates manually.
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Number of Photos Field - Simple Version */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Maximum Photos Allowed
//                 </label>
//                 <input
//                   type="number"
//                   min="1"
//                   max="20"
//                   value={formData.no_of_photos}
//                   onChange={(e) =>
//                     handleInputChange("no_of_photos", parseInt(e.target.value))
//                   }
//                   className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter number (1-20)"
//                 />
//               </div>

//               {/* ✅ ADD THIS - Usage Category Section */}
//               {/* ✅ Usage Category Section */}
//               <div className="col-span-2">
//                 <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
//                   <Droplets className="h-5 w-5 text-blue-600" />
//                   Usage Category
//                 </h3>

//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   {/* Men Section */}
//                   <div className="p-5 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-sm">
//                     <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-200">
//                       <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-sm">
//                         <Users className="w-4 h-4 text-white" />
//                       </div>
//                       <h4 className="text-base font-semibold text-blue-800">
//                         Men's Facilities
//                       </h4>
//                     </div>
//                     <div className="space-y-3">
//                       {/* WC */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20">
//                           WC
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.men.wc}
//                           onChange={(e) =>
//                             updateUsageCategory("men", "wc", e.target.value)
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>

//                       {/* Indian */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20">
//                           Indian
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.men.indian}
//                           onChange={(e) =>
//                             updateUsageCategory("men", "indian", e.target.value)
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>

//                       {/* Urinals */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20">
//                           Urinals
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.men.urinals}
//                           onChange={(e) =>
//                             updateUsageCategory(
//                               "men",
//                               "urinals",
//                               e.target.value,
//                             )
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>

//                       {/* ✅ NEW: Shower */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20 flex items-center gap-1">
//                           <Droplets className="w-3.5 h-3.5 text-blue-600" />
//                           Shower
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.men.shower}
//                           onChange={(e) =>
//                             updateUsageCategory("men", "shower", e.target.value)
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>

//                       {/* ✅ NEW: Basin */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20 flex items-center gap-1">
//                           <Armchair className="w-3.5 h-3.5 text-blue-600" />
//                           Basin
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.men.basin}
//                           onChange={(e) =>
//                             updateUsageCategory("men", "basin", e.target.value)
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* Women Section */}
//                   <div className="p-5 border-2 border-pink-200 rounded-xl bg-gradient-to-br from-pink-50 via-white to-pink-50 shadow-sm">
//                     <div className="flex items-center gap-2 mb-4 pb-3 border-b border-pink-200">
//                       <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center shadow-sm">
//                         <Users className="w-4 h-4 text-white" />
//                       </div>
//                       <h4 className="text-base font-semibold text-pink-800">
//                         Women's Facilities
//                       </h4>
//                     </div>
//                     <div className="space-y-3">
//                       {/* WC */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20">
//                           WC
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.women.wc}
//                           onChange={(e) =>
//                             updateUsageCategory("women", "wc", e.target.value)
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
//                         />
//                       </div>

//                       {/* Indian */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20">
//                           Indian
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.women.indian}
//                           onChange={(e) =>
//                             updateUsageCategory(
//                               "women",
//                               "indian",
//                               e.target.value,
//                             )
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
//                         />
//                       </div>

//                       {/* Urinals */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20">
//                           Urinals
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.women.urinals}
//                           onChange={(e) =>
//                             updateUsageCategory(
//                               "women",
//                               "urinals",
//                               e.target.value,
//                             )
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
//                         />
//                       </div>

//                       {/* ✅ NEW: Shower */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20 flex items-center gap-1">
//                           <Droplets className="w-3.5 h-3.5 text-pink-600" />
//                           Shower
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.women.shower}
//                           onChange={(e) =>
//                             updateUsageCategory(
//                               "women",
//                               "shower",
//                               e.target.value,
//                             )
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
//                         />
//                       </div>

//                       {/* ✅ NEW: Basin */}
//                       <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-pink-100/50 transition-colors">
//                         <span className="text-sm font-medium text-slate-700 w-20 flex items-center gap-1">
//                           <Armchair className="w-3.5 h-3.5 text-pink-600" />
//                           Basin
//                         </span>
//                         <input
//                           type="number"
//                           min="0"
//                           placeholder="0"
//                           value={formData.usage_category.women.basin}
//                           onChange={(e) =>
//                             updateUsageCategory(
//                               "women",
//                               "basin",
//                               e.target.value,
//                             )
//                           }
//                           className="flex-1 p-2.5 text-sm border-2 border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* ========== SECTION 2: ADDRESS DETAILS ========== */}
//               {/* Address Details */}
//               <div className="space-y-6 border-t border-slate-200 pt-8">
//                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
//                   <MapPin className="w-6 h-6 text-blue-600" />
//                   Address Details
//                 </h2>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   {/* State */}
//                   <SearchableSelect
//                     options={availableStates}
//                     value={formData.state}
//                     onChange={(value) => handleInputChange("state", value)}
//                     placeholder="Select or type state"
//                     label="State"
//                     allowCustom={true}
//                   />

//                   {/* City */}
//                   <SearchableSelect
//                     options={availableCities}
//                     value={formData.city}
//                     onChange={(value) => handleInputChange("city", value)}
//                     placeholder="Select or type city"
//                     label="City"
//                     allowCustom={true}
//                   />

//                   {/* District */}
//                   <SearchableSelect
//                     options={[]}
//                     value={formData.dist}
//                     onChange={(value) => handleInputChange("dist", value)}
//                     placeholder="Enter district name"
//                     label="District"
//                     allowCustom={true}
//                   />

//                   {/* Pincode */}
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Pincode
//                     </label>
//                     <input
//                       type="text"
//                       placeholder="Enter 6-digit pincode"
//                       value={formData.pincode}
//                       onChange={(e) =>
//                         handleInputChange("pincode", e.target.value)
//                       }
//                       maxLength={6}
//                       className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                     />
//                   </div>
//                 </div>

//                 {/* Full Address */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Full Address
//                   </label>
//                   <textarea
//                     placeholder="Enter complete address"
//                     value={formData.address}
//                     onChange={(e) =>
//                       handleInputChange("address", e.target.value)
//                     }
//                     rows={3}
//                     className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
//                   />
//                 </div>
//               </div>

//               {/* ========== SECTION 3: IMAGES ========== */}
//               <div className="space-y-6 border-t border-slate-200 pt-8">
//                 <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
//                   <ImageIcon className="w-6 h-6 text-blue-600" />
//                   Location Images
//                   {(existingImages.length > 0 || previewImages.length > 0) && (
//                     <span className="text-sm font-normal text-slate-500">
//                       ({existingImages.length + previewImages.length} total)
//                     </span>
//                   )}
//                 </h2>

//                 {/* Upload Area */}
//                 <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
//                   <input
//                     ref={fileInputRef}
//                     type="file"
//                     accept="image/*"
//                     multiple
//                     onChange={handleFileSelect}
//                     className="hidden"
//                   />

//                   <div className="space-y-4">
//                     <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
//                       <Upload className="h-8 w-8 text-blue-600" />
//                     </div>

//                     <div>
//                       <button
//                         type="button"
//                         onClick={triggerFileInput}
//                         className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
//                       >
//                         <Plus className="h-5 w-5" />
//                         {existingImages.length === 0 &&
//                         previewImages.length === 0
//                           ? "Add Images"
//                           : "Add More Images"}
//                       </button>
//                       <p className="text-sm text-slate-500 mt-2">
//                         Select multiple images (max 10MB each)
//                       </p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Current Images */}
//                 {(existingImages.length > 0 || previewImages.length > 0) && (
//                   <div className="space-y-4">
//                     <div className="flex items-center justify-between">
//                       <h4 className="font-semibold text-slate-700">
//                         Current Images (
//                         {existingImages.length + previewImages.length})
//                       </h4>

//                       {(existingImages.length > 0 ||
//                         previewImages.length > 0) && (
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setImagesToDelete((prev) => [
//                               ...prev,
//                               ...existingImages,
//                             ]);
//                             setExistingImages([]);
//                             previewImages.forEach((preview) =>
//                               URL.revokeObjectURL(preview.url),
//                             );
//                             setNewImages([]);
//                             setPreviewImages([]);
//                             toast.success("All images marked for removal");
//                           }}
//                           className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                           Clear All
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//                       {/* Existing Images */}
//                       {existingImages.map((imageUrl, index) => (
//                         <div
//                           key={`existing-${index}`}
//                           className="relative group bg-white rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//                         >
//                           <img
//                             src={imageUrl}
//                             alt={`Existing ${index + 1}`}
//                             className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                             onClick={() => setSelectedImageIndex(index)}
//                           />

//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               removeExistingImage(imageUrl);
//                               toast.success("Image marked for deletion");
//                             }}
//                             className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
//                           >
//                             <X className="h-4 w-4" />
//                           </button>

//                           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
//                             <p className="text-xs text-white font-medium">
//                               Existing
//                             </p>
//                           </div>
//                         </div>
//                       ))}

//                       {/* New Images */}
//                       {previewImages.map((preview, index) => (
//                         <div
//                           key={`new-${index}`}
//                           className="relative group bg-white rounded-lg border-2 border-green-500 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
//                         >
//                           <img
//                             src={preview.url}
//                             alt={`New ${index + 1}`}
//                             className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                             onClick={() =>
//                               setSelectedImageIndex(
//                                 existingImages.length + index,
//                               )
//                             }
//                           />

//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               removeNewImage(index);
//                               toast.success("New image removed");
//                             }}
//                             className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
//                           >
//                             <X className="h-4 w-4" />
//                           </button>

//                           <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/80 to-transparent p-2">
//                             <p className="text-xs text-white font-medium truncate">
//                               New
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Status Indicators */}
//                     <div className="space-y-2">
//                       {imagesToDelete.length > 0 && (
//                         <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
//                           <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
//                           <div className="flex-1">
//                             <p className="text-sm text-red-600 font-medium">
//                               {imagesToDelete.length} existing image(s) will be
//                               deleted when you save
//                             </p>
//                           </div>
//                           <button
//                             type="button"
//                             onClick={() => {
//                               setExistingImages((prev) => [
//                                 ...prev,
//                                 ...imagesToDelete,
//                               ]);
//                               setImagesToDelete([]);
//                               toast.success("Image deletions cancelled");
//                             }}
//                             className="text-xs text-red-600 hover:text-red-700 underline"
//                           >
//                             Undo
//                           </button>
//                         </div>
//                       )}

//                       {newImages.length > 0 && (
//                         <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
//                           <Plus className="h-4 w-4 text-green-600 flex-shrink-0" />
//                           <p className="text-sm text-green-600 font-medium">
//                             {newImages.length} new image(s) will be added when
//                             you save
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* ========== SECTION 4: AMENITIES & FEATURES ========== */}
//               {Object.keys(toiletFeatures).length > 0 && (
//                 <div className="space-y-6 border-t border-slate-200 pt-8">
//                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
//                     <MapPin className="w-6 h-6 text-blue-600" />
//                     Amenities & Features
//                   </h2>
//                   <div className="grid grid-cols-1 gap-4">
//                     {Object.entries(toiletFeatures).map(([key, feature]) =>
//                       renderOptionControl(key, feature),
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* Action Buttons */}
//               <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
//                 <button
//                   type="button"
//                   onClick={() => router.back()}
//                   className="w-full sm:w-auto px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
//                   disabled={saving}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="button"
//                   onClick={handleSave}
//                   disabled={saving || !canEditLocation}
//                   className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
//                 >
//                   {saving ? (
//                     <>
//                       <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="w-5 h-5 mr-2" />
//                       Save Changes
//                     </>
//                   )}

//                   {/* <>
//                     <Save className="w-5 h-5 mr-2" />
//                     Save Changes
//                   </> */}
//                 </button>
//                 {!canEditLocation && (
//                   <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg mb-6">
//                     <div className="flex items-start gap-3">
//                       <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
//                       <div>
//                         <p className="text-sm font-semibold text-amber-800">
//                           Read-Only Mode
//                         </p>
//                         <p className="text-sm text-amber-700">
//                           You don't have permission to edit this location
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Image Modal */}
//       {selectedImageIndex !== null && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
//           onClick={() => setSelectedImageIndex(null)}
//         >
//           <div className="relative max-w-4xl max-h-full">
//             {(() => {
//               const isExistingImage =
//                 selectedImageIndex < existingImages.length;
//               const imageUrl = isExistingImage
//                 ? existingImages[selectedImageIndex]
//                 : previewImages[selectedImageIndex - existingImages.length]
//                     ?.url;

//               return (
//                 <img
//                   src={imageUrl}
//                   alt={`Full view ${selectedImageIndex + 1}`}
//                   className="max-w-full max-h-full object-contain rounded-lg"
//                   style={{ maxHeight: "90vh" }}
//                 />
//               );
//             })()}

//             <button
//               onClick={() => setSelectedImageIndex(null)}
//               className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
//             >
//               ×
//             </button>

//             <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
//               <p className="text-sm">
//                 Image {selectedImageIndex + 1} of{" "}
//                 {existingImages.length + previewImages.length}
//                 {selectedImageIndex < existingImages.length
//                   ? " (Existing)"
//                   : " (New)"}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default EditLocationPage;

"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { Country, State, City } from "country-state-city";

// Providers & Hooks
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// API
import LocationsApi from "@/features/locations/locations.api";
import { fetchToiletFeaturesByName } from "@/features/configurations/configurations.api";
import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";
import locationTypesApi from "@/features/locationTypes/locationTypes.api";

// UI Components
import Loader from "@/components/ui/Loader";
// import LocationTypeSelect from "@/app/(protected)/add-location/components/LocationTypeSelect";
// import GoogleMapPicker from "@/app/(protected)/add-location/components/GoogleMapPicker";
// import SearchableSelect from "@/app/(protected)/add-location/components/SearchableSelect";
import SearchableSelect from "../../../add-location/components/SearchableSelect";
import GoogleMapPicker from "../../../add-location/components/GoogleMapPicker";
import LocationTypeSelect from "../../../add-location/components/LocationTypeSelect";
// Icons
import {
  Building2,
  MapPin,
  Factory,
  Camera,
  ArrowLeft,
  Users,
  User,
  User2,
  VenusAndMars,
  Baby,
  CheckCircle2,
  Wind,
  Shield,
  Package,
  UserCheck,
  Clock,
  CreditCard,
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Search,
  ChevronDown,
  Mail,
  Phone,
  Droplets,
  Armchair,
  Info,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { FaPerson, FaPersonDress } from "react-icons/fa6";
import { MdShower } from "react-icons/md";
import { HiOutlineCloudUpload } from "react-icons/hi";

// Configuration Constants
const GENDER_OPTIONS = [
  {
    label: "Male",
    value: "male",
    category: "Access",
    icon: <User size={14} />,
  },
  {
    label: "Female",
    value: "female",
    category: "Access",
    icon: <User2 size={14} />,
  },
  {
    label: "Unisex / All Genders",
    value: "unisex",
    category: "Access",
    icon: <VenusAndMars size={14} />,
  },
  {
    label: "Family Room",
    value: "family",
    category: "Family Features",
    icon: <Baby size={14} />,
  },
  {
    label: "Children Only",
    value: "children",
    category: "Access",
    icon: <Baby size={14} />,
  },
];

const validatePincode = (pincode) => {
  if (!pincode) return true;
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pincode);
};

const EditLocationPage = () => {
  // --- PERMISSIONS & HOOKS ---
  useRequirePermission(MODULES.LOCATIONS);
  const { canUpdate } = usePermissions();
  const canEditLocation = canUpdate(MODULES.LOCATIONS);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();
  const urlCompanyId = searchParams.get("companyId");
  const finalCompanyId = companyId || urlCompanyId;

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Data State
  const [location, setLocation] = useState(null);
  const [allLocations, setAllLocations] = useState([]);
  const [toiletFeatures, setToiletFeatures] = useState({});
  const [facilityCompanies, setFacilityCompanies] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);

  // Selection State
  const [selectedFacilityCompany, setSelectedFacilityCompany] = useState();
  const [selectedLocationType, setSelectedLocationType] = useState();
  const [navigationLoading, setNavigationLoading] = useState(false);

  // Locations & Address
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Images
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const fileInputRef = useRef(null);

  // Form Data
  const [formData, setFormData] = useState({
    name: "",
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    state: "",
    dist: "",
    pincode: "",
    facility_companiesId: null,
    type_id: null,
    no_of_photos: null,
    options: {},
    usage_category: {
      men: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
      women: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
    },
  });

  // --- INITIAL DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || !finalCompanyId) return;

      try {
        setLoading(true);
        const [
          locationResult,
          locationsResult,
          featuresResult,
          facilityCompaniesResult,
          locationTypesResult,
        ] = await Promise.all([
          LocationsApi.getLocationById(params.id, finalCompanyId),
          LocationsApi.getAllLocations(finalCompanyId),
          fetchToiletFeaturesByName("Toilet_Features"),
          FacilityCompanyApi.getAll(finalCompanyId),
          locationTypesApi.getAll(finalCompanyId),
        ]);

        if (locationResult.success) {
          const data = locationResult.data;
          setLocation(data);

          // Populate Form
          setFormData({
            name: data.name,
            latitude: data.latitude?.toString() || "",
            longitude: data.longitude?.toString() || "",
            address: data.address || "",
            city: data.city || "",
            state: data.state || "",
            dist: data.dist || "",
            pincode: data.pincode || "",
            no_of_photos: data.no_of_photos,
            options: data.options || {},
            facility_companiesId: data.facility_companiesId,
            type_id: data.type_id,
            usage_category: data.usage_category || {
              men: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
              women: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
            },
          });

          // Populate Aux States
          setExistingImages(data.images || []);
          setSelectedFacilityCompany(data.facility_companiesId);
          setSelectedLocationType(data.type_id);

          // Populate Cities if State exists
          if (data.state) {
            const indiaStates = State.getStatesOfCountry("IN");
            const selectedState = indiaStates.find(
              (s) => s.name === data.state,
            );
            if (selectedState) {
              const cities = City.getCitiesOfState("IN", selectedState.isoCode);
              setAvailableCities(cities.map((city) => city.name));
            }
          }
        } else {
          setError(locationResult.error);
        }

        if (locationsResult.success) setAllLocations(locationsResult.data);
        if (facilityCompaniesResult.success)
          setFacilityCompanies(facilityCompaniesResult.data);
        if (locationTypesResult) setLocationTypes(locationTypesResult);

        if (featuresResult) {
          const features = {};
          featuresResult?.data[0]?.description.forEach((feature) => {
            features[feature.key] = feature;
          });
          setToiletFeatures(features);
        }
      } catch (err) {
        setError("Failed to fetch location data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, finalCompanyId]);

  // Load States
  useEffect(() => {
    const indiaStates = State.getStatesOfCountry("IN");
    setAvailableStates(indiaStates.map((s) => s.name));
  }, []);

  // --- HANDLERS ---

  // Navigation
  const getCurrentLocationIndex = () =>
    allLocations.findIndex((loc) => loc.id === params.id);
  const navigationInfo = {
    currentIndex: getCurrentLocationIndex(),
    hasPrevious: getCurrentLocationIndex() > 0,
    hasNext: getCurrentLocationIndex() < allLocations.length - 1,
    previousName:
      getCurrentLocationIndex() > 0
        ? allLocations[getCurrentLocationIndex() - 1]?.name
        : null,
    nextName:
      getCurrentLocationIndex() < allLocations.length - 1
        ? allLocations[getCurrentLocationIndex() + 1]?.name
        : null,
  };

  const handlePrevious = () => {
    if (navigationInfo.hasPrevious) {
      setNavigationLoading(true);
      const prevLocation = allLocations[navigationInfo.currentIndex - 1];
      router.push(
        `/washrooms/item/${prevLocation.id}/edit?companyId=${finalCompanyId}`,
      );
    }
  };

  const handleNext = () => {
    if (navigationInfo.hasNext) {
      setNavigationLoading(true);
      const nextLocation = allLocations[navigationInfo.currentIndex + 1];
      router.push(
        `/washrooms/item/${nextLocation.id}/edit?companyId=${finalCompanyId}`,
      );
    }
  };

  // Inputs
  const handleInputChange = (field, value) => {
    if (field === "state") {
      const indiaStates = State.getStatesOfCountry("IN");
      const selectedState = indiaStates.find((s) => s.name === value);
      if (selectedState) {
        const cities = City.getCitiesOfState("IN", selectedState.isoCode);
        setAvailableCities(cities.map((city) => city.name));
      } else {
        setAvailableCities([]);
      }
      setFormData((prev) => ({ ...prev, state: value, city: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateUsageCategory = (gender, field, value) => {
    setFormData((prev) => ({
      ...prev,
      usage_category: {
        ...prev.usage_category,
        [gender]: {
          ...prev.usage_category[gender],
          [field]: value === "" ? 0 : parseInt(value),
        },
      },
    }));
  };

  const handleOptionChange = (optionKey, value) => {
    setFormData((prev) => ({
      ...prev,
      options: { ...prev.options, [optionKey]: value },
    }));
  };

  const handleMultiselectChange = (key, value, checked) => {
    const currentValues = formData.options[key] || [];
    let newValues = checked
      ? [...currentValues, value]
      : currentValues.filter((v) => v !== value);
    handleOptionChange(key, newValues);
  };

  const handleGenderAccessChange = (value) => {
    const currentAccess = formData.options.genderAccess || [];
    const newAccess = currentAccess.includes(value)
      ? currentAccess.filter((item) => item !== value)
      : [...currentAccess, value];
    handleOptionChange("genderAccess", newAccess);
  };

  // Images
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024,
    );

    if (validFiles.length > 0) {
      setNewImages((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        isNew: true,
      }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(previewImages[index].url);
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setImagesToDelete((prev) => [...prev, imageUrl]);
    setExistingImages((prev) => prev.filter((img) => img !== imageUrl));
  };

  const restoreImage = () => {
    if (imagesToDelete.length === 0) return;
    const lastDeleted = imagesToDelete[imagesToDelete.length - 1];
    setExistingImages((prev) => [...prev, lastDeleted]);
    setImagesToDelete((prev) => prev.slice(0, -1));
  };

  // Save
  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Location name required");

    setSaving(true);
    try {
      // 1. Delete marked images
      for (const imageUrl of imagesToDelete) {
        await LocationsApi.deleteLocationImage(
          params.id,
          imageUrl,
          finalCompanyId,
        );
      }

      // 2. Update Data & Upload New Images
      const updateData = {
        ...formData,
        name: formData.name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        no_of_photos: formData.no_of_photos || null,
        facility_companiesId: formData.facility_companiesId || null,
        type_id: formData.type_id || null,
      };

      const result = await LocationsApi.updateLocation(
        params.id,
        updateData,
        finalCompanyId,
        newImages,
        false,
      );

      if (result.success) {
        toast.success("Location updated successfully!");
        setTimeout(
          () => router.push(`/washrooms?companyId=${finalCompanyId}`),
          1000,
        );
      } else {
        toast.error(result.error || "Update failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  // --- RENDER HELPERS ---
  if (loading || navigationLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="large" color="#3b82f6" />
      </div>
    );
  if (error || !location)
    return (
      <div className="p-8 text-center text-red-500">
        {error || "Location not found"}
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8 pb-10 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
        {/* --- HEADER --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() =>
              router.push(`/washrooms?companyId=${finalCompanyId}`)
            }
            className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            <span className="ml-2 font-bold text-sm uppercase tracking-wider">
              Back to Listings
            </span>
          </button>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrevious}
              disabled={!navigationInfo.hasPrevious}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title={navigationInfo.previousName || "No previous"}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
              {navigationInfo.currentIndex + 1} / {allLocations.length}
            </span>
            <button
              onClick={handleNext}
              disabled={!navigationInfo.hasNext}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
              title={navigationInfo.nextName || "No next"}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="w-full">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Edit Washroom
          </h1>
        </div>

        {/* --- MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* === LEFT COLUMN === */}
          <div className="space-y-8">
            {/* 1. ARCHITECTURE CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <Building2
                    size={20}
                    className="text-cyan-600 dark:text-cyan-400"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em] leading-none">
                    Washroom Architecture
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-80">
                    Primary Facility Configuration
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Washroom Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center h-11">
                    <Building2
                      className="absolute left-4 text-slate-400"
                      size={16}
                    />
                    <input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
                      placeholder="Enter washroom name"
                    />
                  </div>
                </div>

                {/* Facility Type */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Facility Type
                  </label>
                  <div className="h-11">
                    <LocationTypeSelect
                      types={locationTypes}
                      selectedType={formData.type_id}
                      setSelectedType={(id) => handleInputChange("type_id", id)}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Location (Address)
                  </label>
                  <div className="relative flex items-center h-11">
                    <MapPin
                      className="absolute left-4 text-slate-400"
                      size={16}
                    />
                    <input
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>

                {/* Facility Company */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Maintenance Company
                  </label>
                  <div className="relative flex items-center h-11">
                    <Factory
                      className="absolute left-4 text-slate-400"
                      size={16}
                    />
                    <select
                      value={formData.facility_companiesId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "facility_companiesId",
                          e.target.value === "" ? null : e.target.value,
                        )
                      }
                      className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none appearance-none"
                    >
                      <option value="">Select Provider</option>
                      {facilityCompanies.map((fc) => (
                        <option key={fc.id} value={fc.id}>
                          {fc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Photo Count */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Required Photo Count
                  </label>
                  <div className="relative flex items-center h-11">
                    <Camera
                      className="absolute left-4 text-slate-400"
                      size={16}
                    />
                    <input
                      type="number"
                      value={formData.no_of_photos || ""}
                      onChange={(e) =>
                        handleInputChange("no_of_photos", e.target.value)
                      }
                      className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 1.5 LOCATION INFO CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <MapPin
                    size={20}
                    className="text-cyan-600 dark:text-cyan-400"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.15em] leading-none">
                    Location Information
                  </h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-80">
                    Geographic Placement Details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {/* State */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    State
                  </label>
                  <div className="h-11">
                    <SearchableSelect
                      options={availableStates}
                      value={formData.state}
                      onChange={(value) => handleInputChange("state", value)}
                      placeholder="Select state"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* District */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    District
                  </label>
                  <div className="relative flex items-center h-11">
                    <input
                      value={formData.dist}
                      onChange={(e) =>
                        handleInputChange("dist", e.target.value)
                      }
                      className="w-full h-full px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 transition-all outline-none"
                      placeholder="Enter district"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    City
                  </label>
                  <div className="h-11">
                    <SearchableSelect
                      options={availableCities}
                      value={formData.city}
                      onChange={(value) => handleInputChange("city", value)}
                      placeholder="Select city"
                      className="w-full h-full"
                    />
                  </div>
                </div>

                {/* Pincode */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Pincode
                  </label>
                  <div className="relative flex items-center h-11">
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) =>
                        handleInputChange("pincode", e.target.value)
                      }
                      className="w-full h-full px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 transition-all outline-none"
                      placeholder="000000"
                    />
                  </div>
                </div>

                {/* Full Address Textarea */}
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Full Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 transition-all outline-none resize-none"
                    placeholder="Enter complete street address..."
                  />
                </div>
              </div>
            </div>

            {/* 2. USAGE CATEGORY CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <MdShower className="text-cyan-600 dark:text-cyan-400 text-xl" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] leading-none">
                    Usage Category
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-70">
                    Facility Capacity Metrics
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* MEN'S */}
                <div className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                    <div className="h-8 w-8 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                      <FaPerson className="text-cyan-600 text-lg" />
                    </div>
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">
                      Men's Facilities
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {["wc", "indian", "urinals", "shower", "basin"].map(
                      (field) => (
                        <div key={field} className="mb-0">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1 block">
                            {field}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.usage_category.men[field]}
                            onChange={(e) =>
                              updateUsageCategory("men", field, e.target.value)
                            }
                            className="w-full pl-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* WOMEN'S */}
                <div className="bg-rose-50/30 dark:bg-rose-900/5 border border-rose-100/50 rounded-2xl p-6 transition-all hover:shadow-md">
                  <div className="flex items-center gap-3 mb-6 border-b border-rose-100/50 pb-4">
                    <div className="h-8 w-8 bg-white rounded-lg shadow-sm border border-rose-100 flex items-center justify-center">
                      <FaPersonDress className="text-rose-500 text-lg" />
                    </div>
                    <h3 className="text-xs font-black text-rose-700 uppercase tracking-widest">
                      Women's Facilities
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {["wc", "indian", "urinals", "shower", "basin"].map(
                      (field) => (
                        <div key={field} className="mb-0">
                          <label className="text-[10px] font-bold text-rose-300 uppercase tracking-wider mb-1.5 ml-1 block">
                            {field}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={formData.usage_category.women[field]}
                            onChange={(e) =>
                              updateUsageCategory(
                                "women",
                                field,
                                e.target.value,
                              )
                            }
                            className="w-full pl-4 py-2 rounded-xl border border-rose-200 bg-white text-sm focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all"
                            placeholder="0"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. GENDER ACCESS CARD */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/5 flex items-center justify-center border border-cyan-500/10">
                  <Users className="text-cyan-500/70 text-xl" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">
                    Available for Gender*
                  </h2>
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1.5">
                    Operational Access Mapping
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {GENDER_OPTIONS.map((item) => (
                  <label
                    key={item.value}
                    className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.options.genderAccess?.includes(
                          item.value,
                        )}
                        onChange={() => handleGenderAccessChange(item.value)}
                        className="w-4 h-4 rounded border border-slate-200 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 group-hover:text-cyan-500/70 transition-colors">
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors tracking-tight">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-normal text-slate-400 lowercase tracking-tight mt-0.5">
                        {item.category}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="space-y-8">
            {/* 4. PIN LOCATION (MAP) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <MapPin
                    className="text-cyan-600"
                    size={20}
                    strokeWidth={2.5}
                  />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] leading-none">
                    Pin Location
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-70">
                    Spatial Geo-Point Capture
                  </p>
                </div>
              </div>

              {/* Map */}
              <div className="mb-4">
                <GoogleMapPicker
                  lat={formData.latitude ? parseFloat(formData.latitude) : null}
                  lng={
                    formData.longitude ? parseFloat(formData.longitude) : null
                  }
                  onSelect={(lat, lng) => {
                    handleInputChange("latitude", lat?.toString() || "");
                    handleInputChange("longitude", lng?.toString() || "");
                  }}
                />
              </div>

              {/* Coordinates */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Latitude
                  </label>
                  <div className="px-4 py-3 bg-cyan-400/5 border border-cyan-500/10 rounded-xl text-sm font-mono font-bold text-cyan-700 shadow-sm">
                    {formData.latitude
                      ? Number(formData.latitude).toFixed(6)
                      : "N/A"}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                    Longitude
                  </label>
                  <div className="px-4 py-3 bg-cyan-400/5 border border-cyan-500/10 rounded-xl text-sm font-mono font-bold text-cyan-700 shadow-sm">
                    {formData.longitude
                      ? Number(formData.longitude).toFixed(6)
                      : "N/A"}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 bg-slate-50/50 border border-slate-100 rounded-xl">
                <Info size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                <p className="text-[10px] font-medium text-slate-500 italic leading-relaxed text-left">
                  Search an address above or drag the red marker.{" "}
                  <span className="font-black text-cyan-600 uppercase ml-1">
                    Coordinates are automatically captured.
                  </span>
                </p>
              </div>
            </div>

            {/* 5. LOCATION IMAGES (Upload + Existing + New) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <HiOutlineCloudUpload className="text-cyan-600 text-xl" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] leading-none">
                    Location Images
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-70">
                    Visual Verification Archive
                  </p>
                </div>
              </div>

              {/* Upload Box */}
              <div className="group relative border-2 border-dashed border-slate-200 rounded-[24px] p-8 text-center bg-slate-50/50 hover:bg-cyan-400/5 hover:border-cyan-500/30 transition-all duration-300 mt-6">
                <div className="flex flex-col items-center">
                  <div className="mb-5 p-5 rounded-full bg-white shadow-sm border border-slate-100 text-cyan-600 group-hover:scale-110 transition-transform duration-300">
                    <ImageIcon size={32} strokeWidth={1.5} />
                  </div>
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-1">
                    Drag or Drop images here
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-6">
                    Supports JPG, PNG (Max 5MB each)
                  </p>
                  <div className="bg-slate-900 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest pointer-events-none">
                    Choose Images
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Mixed Image Grid (Existing + New) */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {/* Existing Images */}
                {existingImages.map((imgUrl, idx) => (
                  <div
                    key={`existing-${idx}`}
                    className="relative group aspect-square"
                  >
                    <img
                      src={imgUrl}
                      alt="existing"
                      className="w-full h-full object-cover rounded-lg border border-slate-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => removeExistingImage(imgUrl)}
                        className="bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-slate-900/70 text-white text-[8px] px-1 rounded">
                      Existing
                    </span>
                  </div>
                ))}

                {/* New Images */}
                {previewImages.map((preview, idx) => (
                  <div
                    key={`new-${idx}`}
                    className="relative group aspect-square"
                  >
                    <img
                      src={preview.url}
                      alt="new"
                      className="w-full h-full object-cover rounded-lg border border-green-200"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={() => removeNewImage(idx)}
                        className="bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:scale-110 transition-transform"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-green-600/90 text-white text-[8px] px-1 rounded">
                      New
                    </span>
                  </div>
                ))}
              </div>

              {/* Deletion Warning */}
              {imagesToDelete.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500" />
                    <p className="text-xs text-red-600 font-medium">
                      {imagesToDelete.length} images marked for deletion.
                    </p>
                  </div>
                  <button
                    onClick={restoreImage}
                    className="text-[10px] font-bold text-red-600 underline hover:text-red-800"
                  >
                    Undo Last
                  </button>
                </div>
              )}
            </div>

            {/* 6. ADDITIONAL FEATURES (Dynamic from API) */}
            {Object.keys(toiletFeatures).length > 0 && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <div className="h-10 w-10 rounded-xl bg-cyan-400/5 flex items-center justify-center border border-cyan-500/10">
                    <CheckCircle2 className="text-cyan-500/70 text-xl" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em] leading-none">
                      Additional Features
                    </h2>
                    <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1.5">
                      Operational Feature Mapping
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {Object.entries(toiletFeatures).map(([key, feature]) => {
                    // Logic handles standard boolean features mostly
                    if (feature.type === "boolean") {
                      return (
                        <label
                          key={key}
                          className="flex items-start gap-4 group cursor-pointer p-2 rounded-xl hover:bg-slate-50/50 transition-colors"
                        >
                          <div className="relative flex items-center mt-0.5">
                            <input
                              type="checkbox"
                              checked={!!formData.options[key]}
                              onChange={(e) =>
                                handleOptionChange(key, e.target.checked)
                              }
                              className="w-4 h-4 rounded border border-slate-200 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              {/* Static icon fallback since API doesn't return components */}
                              <span className="text-slate-400 group-hover:text-cyan-500/70 transition-colors">
                                <CheckCircle2 size={14} />
                              </span>
                              <span className="text-sm font-medium text-slate-500 group-hover:text-slate-600 transition-colors tracking-tight">
                                {feature.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-normal text-slate-400 lowercase tracking-tight mt-0.5">
                              {feature.category || "amenity"}
                            </span>
                          </div>
                        </label>
                      );
                    }
                    // Handle other types (multiselect/text) if necessary here
                    return null;
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="flex flex-wrap justify-end items-center gap-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !canEditLocation}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditLocationPage;
