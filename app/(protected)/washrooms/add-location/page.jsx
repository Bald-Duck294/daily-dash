/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";
import {
  Building2,
  MapPin,
  Factory,
  ArrowLeft,
  Users,
  CheckCircle2,
  X,
  Image as ImageIcon,
  ChevronDown,
  Info,
  Shield,
  Star,
  Baby,
  ListChecks,
} from "lucide-react";
import { FaPerson, FaPersonDress, FaWheelchair } from "react-icons/fa6";
import { MdShower, MdFamilyRestroom } from "react-icons/md";
import { HiOutlineCloudUpload } from "react-icons/hi";
import toast from "react-hot-toast";
import { State, City } from "country-state-city";

// UI Components
import AvailabilityCard from "../components/AvailabilityCard";
import LocationTypeSelect from "./components/LocationTypeSelect";
import GoogleMapPicker from "./components/GoogleMapPicker";
import SearchableSelect from "./components/SearchableSelect";

// API & TanStack Hooks
import { useCreateLocation } from "@/features/locations/locations.queries";
import { useFacilityCompanies } from "@/features/facilityCompany/facilityCompany.queries";
import { useLocationTypes } from "@/features/locationTypes/locationTypes.queries";
import { useCreateAssignmentsForLocation } from "@/features/assignments/assignments.queries";
import { useGetUsersByRole } from "@/features/users/users.queries";

// Dynamic Schema Hook
import { useLocationSchema } from "@/features/configurations/configurations.queries";
import Loader from "@/components/ui/Loader";

const validatePincode = (pincode) => {
  if (!pincode) return true;
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pincode);
};

// Dynamic theme colors for generated usage categories
const CATEGORY_THEMES = [
  {
    bg: "bg-cyan-50/50 dark:bg-cyan-900/20",
    border: "border-cyan-100 dark:border-cyan-800",
    textPrimary: "text-cyan-700 dark:text-cyan-400",
    textSecondary: "text-cyan-500",
    iconBg: "bg-white dark:bg-cyan-950",
    inputFocus: "focus:border-cyan-500 focus:ring-cyan-500/10",
  },
  {
    bg: "bg-rose-50/30 dark:bg-rose-900/10",
    border: "border-rose-100/50 dark:border-rose-800/40",
    textPrimary: "text-rose-700 dark:text-rose-400",
    textSecondary: "text-rose-500",
    iconBg: "bg-white dark:bg-rose-950",
    inputFocus: "focus:border-rose-500 focus:ring-rose-500/10",
  },
  {
    bg: "bg-amber-50/30 dark:bg-amber-900/10",
    border: "border-amber-100/50 dark:border-amber-800/40",
    textPrimary: "text-amber-700 dark:text-amber-400",
    textSecondary: "text-amber-500",
    iconBg: "bg-white dark:bg-amber-950",
    inputFocus: "focus:border-amber-500 focus:ring-amber-500/10",
  },
  {
    bg: "bg-emerald-50/30 dark:bg-emerald-900/10",
    border: "border-emerald-100/50 dark:border-emerald-800/40",
    textPrimary: "text-emerald-700 dark:text-emerald-400",
    textSecondary: "text-emerald-500",
    iconBg: "bg-white dark:bg-emerald-950",
    inputFocus: "focus:border-emerald-500 focus:ring-emerald-500/10",
  },
];

// Helper to assign icons based on machine keys
const getCategoryIcon = (id, className) => {
  if (id.includes("men") && !id.includes("women"))
    return <FaPerson className={className} />;
  if (id.includes("women")) return <FaPersonDress className={className} />;
  if (id.includes("handicap") || id.includes("disable"))
    return <FaWheelchair className={className} />;
  if (id.includes("family")) return <MdFamilyRestroom className={className} />;
  if (id.includes("access")) return <Shield className={className} />;
  if (id.includes("amenities")) return <Star className={className} />;
  return <Users className={className} />;
};

export default function AddWashroomForm() {
  useRequirePermission(MODULES.LOCATIONS);
  const { canAdd } = usePermissions();
  const canAddLocation = canAdd(MODULES.LOCATIONS);
  const canAssignCleaner = canAdd(MODULES.ASSIGNMENTS);
  const { companyId } = useCompanyId();
  const router = useRouter();

  // Queries
  const { data: facilityCompaniesRes } = useFacilityCompanies(companyId);
  const facilityCompanies = facilityCompaniesRes?.data || [];

  const { data: locationTypesRes } = useLocationTypes(companyId);
  const locationTypes = Array.isArray(locationTypesRes?.data)
    ? locationTypesRes.data
    : Array.isArray(locationTypesRes)
      ? locationTypesRes
      : [];

  const { data: usersData } = useGetUsersByRole(5, companyId);
  const safeUsersArray = Array.isArray(usersData?.data)
    ? usersData.data
    : Array.isArray(usersData)
      ? usersData
      : [];
  const allCleaners = safeUsersArray.filter(
    (u) => parseInt(u.role_id || u.role?.id) === 5,
  );

  // Fetch Dynamic Schema (Provides both Usage Categories & Additional Features)
  const { data: locationSchema, isLoading: isLoadingSchema } =
    useLocationSchema(companyId);

  // Mutations
  const createLocationMutation = useCreateLocation();
  const createAssignmentsMutation = useCreateAssignmentsForLocation();

  // State Management
  const [coverImage, setCoverImage] = useState(null);
  const [otherImages, setOtherImages] = useState([]);
  const coverInputRef = useRef(null);
  const otherInputRef = useRef(null);

  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [cleanerSearchTerm, setCleanerSearchTerm] = useState("");
  const [isCleanerDropdownOpen, setIsCleanerDropdownOpen] = useState(false);
  const cleanerDropdownRef = useRef(null);

  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [pincodeError, setPincodeError] = useState("");
  const [manualCoords, setManualCoords] = useState({
    latitude: "21.1458",
    longitude: "79.0882",
  });

  const [form, setForm] = useState({
    name: "",
    parent_id: null,
    type_id: null,
    facility_company_id: null,
    is_public: false,
    latitude: 21.1458,
    longitude: 79.0882,
    address: "",
    pincode: "",
    state: "",
    city: "",
    dist: "",
    status: true,
    no_of_photos: null,
    options: {}, // Hydrated dynamically
    usage_category: {}, // Hydrated dynamically
    schedule: {
      mode: "TWENTY_FOUR_HOURS",
      opens_at: "",
      closes_at: "",
      overnight: false,
      days: {
        monday: { open: false, opens_at: "", closes_at: "", overnight: false },
        tuesday: { open: false, opens_at: "", closes_at: "", overnight: false },
        wednesday: {
          open: false,
          opens_at: "",
          closes_at: "",
          overnight: false,
        },
        thursday: {
          open: false,
          opens_at: "",
          closes_at: "",
          overnight: false,
        },
        friday: { open: false, opens_at: "", closes_at: "", overnight: false },
        saturday: {
          open: false,
          opens_at: "",
          closes_at: "",
          overnight: false,
        },
        sunday: { open: false, opens_at: "", closes_at: "", overnight: false },
      },
    },
  });

  // ✅ Initialize Dynamic Schemas (Usage Categories AND Additional Features)
  useEffect(() => {
    if (locationSchema) {
      setForm((prev) => {
        let newState = { ...prev };
        let hasChanges = false;

        // 1. Init Usage Categories
        if (
          locationSchema.usageCategories &&
          Object.keys(prev.usage_category).length === 0
        ) {
          const initialUsage = {};
          locationSchema.usageCategories.forEach((category) => {
            initialUsage[category.id] = {};
            category.entities.forEach((entity) => {
              initialUsage[category.id][entity.id] = entity.defaultValue || 0;
            });
          });
          newState.usage_category = initialUsage;
          hasChanges = true;
        }

        // 2. Init Additional Features (Options)
        if (locationSchema.additionalFeatures) {
          const initialOptions = { ...prev.options };
          locationSchema.additionalFeatures.forEach((category) => {
            category.fields.forEach((field) => {
              if (initialOptions[field.key] === undefined) {
                // Ensure multiselect defaults to array
                initialOptions[field.key] =
                  field.type === "multiselect"
                    ? field.defaultValue || []
                    : field.defaultValue;
                hasChanges = true;
              }
            });
          });
          newState.options = initialOptions;
        }

        return hasChanges ? newState : prev;
      });
    }
  }, [locationSchema]);

  useEffect(() => {
    const indiaStates = State.getStatesOfCountry("IN");
    setAvailableStates(indiaStates.map((s) => s.name));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cleanerDropdownRef.current &&
        !cleanerDropdownRef.current.contains(event.target)
      ) {
        setIsCleanerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers ---

  const handleCoordinateChange = (field, value) => {
    setManualCoords((prev) => ({ ...prev, [field]: value }));
  };

  const handleApplyCoordinates = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);

    if (isNaN(lat) || isNaN(lng))
      return toast.error("Invalid coordinates. Please enter valid numbers.");
    if (lat < -90 || lat > 90)
      return toast.error("Latitude must be between -90 and 90");
    if (lng < -180 || lng > 180)
      return toast.error("Longitude must be between -180 and 180");

    handleChange("latitude", lat);
    handleChange("longitude", lng);
    toast.success("Map updated with new coordinates");
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
      );
      const data = await response.json();
      if (data.status === "OK" && data.results[0]) {
        const result = data.results[0];
        let state = "",
          city = "",
          pincode = "",
          district = "";
        result.address_components.forEach((component) => {
          if (component.types.includes("administrative_area_level_1"))
            state = component.long_name;
          if (component.types.includes("locality")) city = component.long_name;
          if (component.types.includes("administrative_area_level_3"))
            district = component.long_name;
          if (component.types.includes("postal_code"))
            pincode = component.long_name;
        });
        handleChange("address", result.formatted_address);
        if (state) handleChange("state", state);
        if (city) handleChange("city", city);
        if (district) handleChange("dist", district);
        if (pincode) handleChange("pincode", pincode);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleMapLocationSelect = async (lat, lng) => {
    handleChange("latitude", lat);
    handleChange("longitude", lng);
    setManualCoords({ latitude: lat.toString(), longitude: lng.toString() });
    const geocoded = await reverseGeocode(lat, lng);
    if (geocoded) toast.success("Location details auto-filled from map");
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "state") {
      const indiaStates = State.getStatesOfCountry("IN");
      const selectedState = indiaStates.find((s) => s.name === value);
      if (selectedState) {
        const cities = City.getCitiesOfState("IN", selectedState.isoCode);
        setAvailableCities(cities.map((c) => c.name));
      } else {
        setAvailableCities([]);
      }
      setForm((prev) => ({ ...prev, city: "" }));
    }
    if (key === "pincode")
      setPincodeError(
        value && !validatePincode(value) ? "Invalid pincode" : "",
      );
  };

  const updateUsageCategory = (categoryId, fieldId, value) => {
    setForm((prev) => ({
      ...prev,
      usage_category: {
        ...prev.usage_category,
        [categoryId]: {
          ...(prev.usage_category[categoryId] || {}),
          [fieldId]: value,
        },
      },
    }));
  };

  // ✅ Generic Option Handlers
  const handleOptionChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }));
  };

  const handleMultiSelectChange = (key, value) => {
    setForm((prev) => {
      const currentArray = prev.options[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((item) => item !== value)
        : [...currentArray, value];
      return { ...prev, options: { ...prev.options, [key]: newArray } };
    });
  };

  // ✅ Conditional Visibility Logic Evaluator
  const isFieldVisible = (field) => {
    if (!field.visibleWhen) return true;
    const targetValue = form.options[field.visibleWhen.field];
    return targetValue === field.visibleWhen.equals;
  };

  // Image Handlers
  const handleCoverImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      if (coverImage) URL.revokeObjectURL(coverImage.url);
      setCoverImage({ file, url: URL.createObjectURL(file), name: file.name });
    } else {
      toast.error("Invalid file. Must be an image under 5MB.");
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleOtherImagesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    );
    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setOtherImages((prev) => [...prev, ...newPreviews]);
    } else {
      toast.error("Some files were invalid (Max 5MB, Images only)");
    }
    if (otherInputRef.current) otherInputRef.current.value = "";
  };

  const removeCoverImage = () => {
    if (coverImage) URL.revokeObjectURL(coverImage.url);
    setCoverImage(null);
  };
  const removeOtherImage = (index) => {
    URL.revokeObjectURL(otherImages[index].url);
    setOtherImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.type_id)
      return toast.error("Please fill in required fields (Name, Type)");

    const to12HourFormat = (time24) => {
      if (!time24) return "";
      const [hour, minute] = time24.split(":");
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return `${hour12.toString().padStart(2, "0")}:${minute} ${ampm}`;
    };

    const normalizedSchedule = JSON.parse(JSON.stringify(form.schedule));
    if (normalizedSchedule.mode === "FIXED_HOURS") {
      const { opens_at, closes_at } = normalizedSchedule;
      if (opens_at && closes_at) {
        normalizedSchedule.overnight = closes_at < opens_at;
        normalizedSchedule.opens_at = to12HourFormat(opens_at);
        normalizedSchedule.closes_at = to12HourFormat(closes_at);
      }
    }
    if (normalizedSchedule.mode === "DAY_WISE") {
      Object.keys(normalizedSchedule.days).forEach((day) => {
        const dayData = normalizedSchedule.days[day];
        if (dayData.open && dayData.opens_at && dayData.closes_at) {
          dayData.overnight = dayData.closes_at < dayData.opens_at;
          dayData.opens_at = to12HourFormat(dayData.opens_at);
          dayData.closes_at = to12HourFormat(dayData.closes_at);
        }
      });
    }

    const normalizedUsage = {};
    Object.keys(form.usage_category).forEach((catId) => {
      normalizedUsage[catId] = Object.fromEntries(
        Object.entries(form.usage_category[catId] || {}).map(([k, v]) => [
          k,
          Number(v || 0),
        ]),
      );
    });

    const normalizedForm = {
      ...form,
      schedule: normalizedSchedule,
      usage_category: normalizedUsage,
      isNewCoverIncluded: !!coverImage, // ✅ Backend flag indicator
    };

    const combinedImages = [];
    if (coverImage) combinedImages.push(coverImage.file);
    otherImages.forEach((img) => combinedImages.push(img.file));

    try {
      const locationRes = await createLocationMutation.mutateAsync({
        data: normalizedForm,
        companyId,
        images: combinedImages,
      });

      const createdId = locationRes?.data?.id || locationRes?.id;

      if (selectedCleaners.length > 0 && createdId) {
        await createAssignmentsMutation.mutateAsync({
          location_id: createdId,
          cleaner_user_ids: selectedCleaners.map((c) => c.id),
          status: "assigned",
          company_id: companyId,
          role_id: 5,
        });
        toast.success(
          `Washroom added & ${selectedCleaners.length} cleaners assigned`,
        );
      } else {
        toast.success("Washroom added successfully");
      }
      setTimeout(() => router.push(`/washrooms?companyId=${companyId}`), 1000);
    } catch (error) {
      toast.error(error.message || "Submission failed");
    }
  };

  const isSubmitting =
    createLocationMutation.isPending || createAssignmentsMutation.isPending;
  const filteredCleaners = allCleaners.filter((c) =>
    c.name?.toLowerCase().includes(cleanerSearchTerm.toLowerCase()),
  );

  const combinedPreviews = [];
  if (coverImage)
    combinedPreviews.push({ ...coverImage, isCover: true, originalIndex: 0 });
  otherImages.forEach((img, index) =>
    combinedPreviews.push({ ...img, isCover: false, originalIndex: index }),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 p-6 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      {/* HEADER */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 py-6 rounded-b-xl shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl transition-all bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Add New Washroom
            </h1>
            <p className="text-xs uppercase tracking-widest mt-1 text-slate-500 dark:text-slate-400">
              Facility Registration
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* === LEFT COLUMN === */}
        <div className="space-y-8">
          {/* 1. WASHROOM ARCHITECTURE CARD */}
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
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  Washroom Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center h-11">
                  <Building2
                    className="absolute left-4 text-slate-400 dark:text-slate-400"
                    size={16}
                  />
                  <input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full h-full pl-11 pr-4 rounded-xl text-sm transition-all outline-none border border-slate-200 bg-white text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    placeholder="Enter washroom name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  Location Hierarchy <span className="text-rose-500">*</span>
                </label>
                <div className="h-11">
                  <LocationTypeSelect
                    types={locationTypes}
                    selectedType={form.type_id}
                    setSelectedType={(id) => handleChange("type_id", id)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  Location (Address)
                </label>
                <div className="relative flex items-center h-11">
                  <MapPin
                    className="absolute left-4 text-slate-400 dark:text-slate-400"
                    size={16}
                  />
                  <input
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className="w-full h-full pl-11 pr-4 rounded-xl text-sm transition-all outline-none border border-slate-200 bg-white text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  Facility Company
                </label>
                <div className="relative flex items-center h-11">
                  <Factory
                    className="absolute left-4 text-slate-400 dark:text-slate-400"
                    size={16}
                  />
                  <select
                    value={form.facility_company_id || ""}
                    onChange={(e) =>
                      handleChange("facility_company_id", e.target.value)
                    }
                    className="w-full h-full pl-11 pr-4 rounded-xl text-sm transition-all outline-none border border-slate-200 bg-white text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
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

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 dark:text-slate-400 uppercase tracking-wider block ml-1">
                  Toilet Visibility
                </label>
                <div className="flex items-center gap-3 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                  <span
                    className={`text-xs font-bold transition-colors ${form.is_public ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"}`}
                  >
                    Public
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        is_public: !prev.is_public,
                      }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors border ${form.is_public ? "bg-cyan-500/90 border-cyan-500" : "bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-100 shadow-sm transition-transform ${form.is_public ? "translate-x-5" : ""}`}
                    />
                  </button>
                  <span
                    className={`text-xs font-bold transition-colors ${!form.is_public ? "text-rose-500 dark:text-rose-400" : "text-slate-400"}`}
                  >
                    Private
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 leading-tight">
                  Private toilets are restricted to the assigned facility
                  company
                </p>
              </div>
            </div>
          </div>

          {/* 1.5 LOCATION INFORMATION CARD */}
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
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  State
                </label>
                <div className="h-11">
                  <SearchableSelect
                    options={availableStates}
                    value={form.state}
                    onChange={(value) => handleChange("state", value)}
                    placeholder="Select state"
                    allowCustom={true}
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  District
                </label>
                <div className="relative flex items-center h-11">
                  <input
                    value={form.dist}
                    onChange={(e) => handleChange("dist", e.target.value)}
                    className="w-full h-full px-4 rounded-xl text-sm transition-all outline-none border border-slate-200 bg-white text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                    placeholder="District name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  City
                </label>
                <div className="h-11">
                  <SearchableSelect
                    options={availableCities}
                    value={form.city}
                    onChange={(value) => handleChange("city", value)}
                    placeholder="Select city"
                    allowCustom={true}
                    className="w-full h-full"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  Pincode
                </label>
                <div className="relative flex items-center h-11">
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className={`w-full h-full px-4 rounded-xl text-sm transition-all outline-none border bg-white text-slate-700 focus:ring-4 focus:ring-cyan-500/10 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-cyan-400/20 ${pincodeError ? "border-rose-500 focus:border-rose-500" : "border-slate-200 dark:border-slate-700 focus:border-cyan-500"}`}
                    placeholder="000000"
                  />
                </div>
                {pincodeError && (
                  <p className="text-[10px] font-bold text-rose-500 ml-1">
                    {pincodeError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 2. DYNAMIC USAGE CATEGORY CARD */}
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

            {isLoadingSchema ? (
              <div className="p-8 flex justify-center">
                <Loader size="small" message="Loading Schema..." />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {locationSchema?.usageCategories?.map((category, index) => {
                  const theme = CATEGORY_THEMES[index % CATEGORY_THEMES.length];
                  return (
                    <div
                      key={category.id}
                      className={`${theme.bg} border ${theme.border} rounded-2xl p-6 transition-all hover:shadow-md`}
                    >
                      <div
                        className={`flex items-center gap-3 mb-6 border-b ${theme.border} pb-4`}
                      >
                        <div
                          className={`h-8 w-8 ${theme.iconBg} rounded-lg shadow-sm border ${theme.border} flex items-center justify-center`}
                        >
                          {getCategoryIcon(
                            category.id,
                            `text-lg ${theme.textSecondary}`,
                          )}
                        </div>
                        <h3
                          className={`text-xs font-black uppercase tracking-widest ${theme.textPrimary}`}
                        >
                          {category.label} Facilities
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {category.entities.map((entity) => (
                          <div key={entity.id} className="mb-0">
                            <label
                              className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ml-1 block ${theme.textSecondary}`}
                            >
                              {entity.label}
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                form.usage_category?.[category.id]?.[
                                  entity.id
                                ] ?? ""
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                updateUsageCategory(
                                  category.id,
                                  entity.id,
                                  raw === "" ? "" : Number(raw),
                                );
                              }}
                              onBlur={() => {
                                if (
                                  form.usage_category?.[category.id]?.[
                                    entity.id
                                  ] === ""
                                ) {
                                  updateUsageCategory(
                                    category.id,
                                    entity.id,
                                    0,
                                  );
                                }
                              }}
                              className={`w-full pl-4 py-2 rounded-xl text-sm outline-none transition-all border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:border-slate-700 focus:ring-4 ${theme.inputFocus}`}
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {(!locationSchema?.usageCategories ||
                  locationSchema.usageCategories.length === 0) && (
                  <p className="text-xs text-slate-500 col-span-2 text-center p-4">
                    No usage categories configured.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* AVAILABILITY CARD */}
          <AvailabilityCard
            schedule={form.schedule}
            setSchedule={(updatedSchedule) =>
              setForm((prev) => ({ ...prev, schedule: updatedSchedule }))
            }
          />
        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-8">
          {/* 4. PIN LOCATION (MAP) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                <MapPin className="text-cyan-600" size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] leading-none">
                  Pin Location
                </h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 opacity-70">
                  Spatial Geo-Point Capture
                </p>
              </div>
            </div>

            <div className="mb-4">
              <GoogleMapPicker
                lat={form.latitude ? parseFloat(form.latitude) : null}
                lng={form.longitude ? parseFloat(form.longitude) : null}
                onSelect={handleMapLocationSelect}
              />
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin
                  size={14}
                  className="text-cyan-500 dark:text-cyan-400"
                />
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-200">
                  Manual Coordinates
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={manualCoords.latitude}
                    onChange={(e) =>
                      handleCoordinateChange("latitude", e.target.value)
                    }
                    placeholder="21.145800"
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono bg-white border border-slate-200 text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={manualCoords.longitude}
                    onChange={(e) =>
                      handleCoordinateChange("longitude", e.target.value)
                    }
                    placeholder="79.088200"
                    className="w-full px-3 py-2.5 rounded-xl text-sm font-mono bg-white border border-slate-200 text-slate-700 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleApplyCoordinates}
                className="w-full mt-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-semibold uppercase tracking-widest hover:brightness-110 transition-all shadow-sm active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <MapPin size={14} /> Update Map Location
              </button>
            </div>
          </div>

          {/* 5. LOCATION IMAGES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                <HiOutlineCloudUpload className="text-cyan-600 text-xl" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-bold uppercase tracking-[0.18em] leading-none text-slate-800 dark:text-slate-100">
                  Location Images
                </h2>
                <p className="text-[10px] font-semibold uppercase tracking-widest mt-1.5 text-slate-500 dark:text-slate-400">
                  Visual Verification Archive
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 space-y-3">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  Cover Image <span className="text-rose-500">*</span>
                </label>
                {!coverImage ? (
                  <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-cyan-400/5 hover:border-cyan-500/30 transition-all duration-300 h-40 flex flex-col justify-center items-center">
                    <ImageIcon size={24} className="text-cyan-600 mb-2" />
                    <p className="text-[10px] font-bold text-slate-500 uppercase">
                      Primary Photo
                    </p>
                    <input
                      ref={coverInputRef}
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*"
                      onChange={handleCoverImageSelect}
                    />
                  </div>
                ) : (
                  <div className="relative group h-40 w-full rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={coverImage.url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={removeCoverImage}
                        className="bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="col-span-1 md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                  Additional Photos
                </label>
                <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-cyan-400/5 hover:border-cyan-500/30 transition-all duration-300 h-40 flex flex-col justify-center items-center">
                  <HiOutlineCloudUpload
                    size={24}
                    className="text-cyan-600 mb-2"
                  />
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Upload Gallery Photos
                  </p>
                  <input
                    ref={otherInputRef}
                    type="file"
                    multiple
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleOtherImagesSelect}
                  />
                </div>
              </div>
            </div>

            {combinedPreviews.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Image Previews ({combinedPreviews.length})
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {combinedPreviews.map((preview, index) => (
                    <div
                      key={index}
                      className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-square"
                    >
                      <img
                        src={preview.url}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                      />
                      {preview.isCover && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1 text-center">
                          <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                            Cover
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          preview.isCover
                            ? removeCoverImage()
                            : removeOtherImage(preview.originalIndex)
                        }
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 group-hover:top-1 group-hover:right-1 transition-all shadow-sm"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 6. ASSIGN CLEANERS */}
          {canAssignCleaner && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <Users className="text-cyan-600 text-xl" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] leading-none text-slate-800 dark:text-slate-100">
                    Assign Cleaners{" "}
                    <span className="text-[10px] opacity-50 ml-1">
                      (Optional)
                    </span>
                  </h2>
                </div>
              </div>

              <div className="relative mb-6" ref={cleanerDropdownRef}>
                <button
                  type="button"
                  onClick={() =>
                    setIsCleanerDropdownOpen(!isCleanerDropdownOpen)
                  }
                  className="w-full text-left pl-4 pr-10 py-3 rounded-xl text-sm border border-slate-200 bg-white text-slate-700 flex justify-between items-center transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                >
                  <span
                    className={
                      selectedCleaners.length
                        ? "text-slate-700 dark:text-slate-200"
                        : "text-slate-400"
                    }
                  >
                    {selectedCleaners.length > 0
                      ? `${selectedCleaners.length} Staff Selected`
                      : "Select available cleaners"}
                  </span>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>

                {isCleanerDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 rounded-xl shadow-xl max-h-60 overflow-y-auto p-2 bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
                    <div className="sticky top-0 z-10 p-2 mb-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <input
                        className="w-full p-2 text-xs rounded-lg border bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 outline-none focus:border-cyan-500"
                        placeholder="Search staff..."
                        value={cleanerSearchTerm}
                        onChange={(e) => setCleanerSearchTerm(e.target.value)}
                      />
                    </div>
                    {filteredCleaners.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        No cleaners found
                      </div>
                    ) : (
                      filteredCleaners.map((cleaner) => (
                        <div
                          key={cleaner.id}
                          className="flex items-center gap-2 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer"
                          onClick={() =>
                            setSelectedCleaners((prev) =>
                              prev.some((c) => c.id === cleaner.id)
                                ? prev.filter((c) => c.id !== cleaner.id)
                                : [...prev, cleaner],
                            )
                          }
                        >
                          <input
                            type="checkbox"
                            checked={selectedCleaners.some(
                              (c) => c.id === cleaner.id,
                            )}
                            readOnly
                            className="rounded text-cyan-500 focus:ring-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                              {cleaner.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {cleaner.email}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ✅ 7. DYNAMIC ADDITIONAL FEATURES CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/5 flex items-center justify-center border border-cyan-500/10">
                <CheckCircle2 className="text-cyan-500/70 text-xl" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">
                  Additional Features & Access
                </h2>
                <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1.5">
                  Operational Rules & Amenities
                </p>
              </div>
            </div>

            {isLoadingSchema ? (
              <div className="p-8 flex justify-center">
                <Loader size="small" message="Loading Features..." />
              </div>
            ) : (
              <div className="space-y-8">
                {locationSchema?.additionalFeatures?.map((category) => (
                  <div
                    key={category.id}
                    className="bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-xl p-5"
                  >
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700/50">
                      <div className="text-cyan-600 dark:text-cyan-400">
                        {getCategoryIcon(category.id, "text-lg")}
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                        {category.label}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                      {category.fields.filter(isFieldVisible).map((field) => (
                        <div key={field.key} className="flex flex-col gap-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                            {field.label}
                          </label>

                          {field.type === "boolean" && (
                            <label className="flex items-center gap-3 cursor-pointer group mt-1">
                              <input
                                type="checkbox"
                                checked={!!form.options[field.key]}
                                onChange={(e) =>
                                  handleOptionChange(
                                    field.key,
                                    e.target.checked,
                                  )
                                }
                                className="w-4 h-4 rounded border border-slate-300 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                              />
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                                {form.options[field.key]
                                  ? "Enabled"
                                  : "Disabled"}
                              </span>
                            </label>
                          )}

                          {(field.type === "number" ||
                            field.type === "text") && (
                            <input
                              type={field.type}
                              value={
                                form.options[field.key] ??
                                field.defaultValue ??
                                ""
                              }
                              onChange={(e) =>
                                handleOptionChange(
                                  field.key,
                                  field.type === "number"
                                    ? Number(e.target.value)
                                    : e.target.value,
                                )
                              }
                              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                              placeholder={field.label}
                            />
                          )}

                          {field.type === "select" && (
                            <select
                              value={
                                form.options[field.key] ??
                                field.defaultValue ??
                                ""
                              }
                              onChange={(e) =>
                                handleOptionChange(field.key, e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                            >
                              <option value="" disabled>
                                Select an option
                              </option>
                              {field.options?.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          )}

                          {field.type === "multiselect" && (
                            <div className="grid grid-cols-2 gap-2 mt-1">
                              {field.options?.map((opt) => (
                                <label
                                  key={opt.value}
                                  className="flex items-center gap-2 cursor-pointer group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={(
                                      form.options[field.key] || []
                                    ).includes(opt.value)}
                                    onChange={() =>
                                      handleMultiSelectChange(
                                        field.key,
                                        opt.value,
                                      )
                                    }
                                    className="w-3.5 h-3.5 rounded border border-slate-300 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                                  />
                                  <span className="text-xs text-slate-600 dark:text-slate-300 group-hover:text-cyan-600 transition-colors">
                                    {opt.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {(!locationSchema?.additionalFeatures ||
                  locationSchema.additionalFeatures.length === 0) && (
                  <p className="text-xs text-slate-500 text-center p-4">
                    No additional features configured.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="flex flex-wrap justify-end items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !canAddLocation}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Saving..." : "Add Washroom"}
        </button>
      </div>
    </div>
  );
}
