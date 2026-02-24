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
import AvailabilityCard from "../../../components/AvailabilityCard";
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
  X,
  Image as ImageIcon,
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

  const defaultSchedule = {
    mode: "TWENTY_FOUR_HOURS",
    opens_at: "",
    closes_at: "",
    overnight: false,
    days: {
      monday: { open: false, opens_at: "", closes_at: "", overnight: false },
      tuesday: { open: false, opens_at: "", closes_at: "", overnight: false },
      wednesday: { open: false, opens_at: "", closes_at: "", overnight: false },
      thursday: { open: false, opens_at: "", closes_at: "", overnight: false },
      friday: { open: false, opens_at: "", closes_at: "", overnight: false },
      saturday: { open: false, opens_at: "", closes_at: "", overnight: false },
      sunday: { open: false, opens_at: "", closes_at: "", overnight: false },
    },
  };



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
    is_public: false,
    options: {},
    usage_category: {
      men: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
      women: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
    },
    schedule: defaultSchedule,

  });

  const to24HourFormat = (time12) => {
    if (!time12) return "";

    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }

    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, "0")}:${minutes}`;
  };

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

          const incomingSchedule = JSON.parse(
            JSON.stringify(data.schedule || defaultSchedule)
          );

          // Convert stored 12h → 24h
          if (incomingSchedule.mode === "FIXED_HOURS") {
            if (incomingSchedule.opens_at)
              incomingSchedule.opens_at = to24HourFormat(incomingSchedule.opens_at);

            if (incomingSchedule.closes_at)
              incomingSchedule.closes_at = to24HourFormat(incomingSchedule.closes_at);
          }

          if (incomingSchedule.mode === "DAY_WISE" && incomingSchedule.days) {
            Object.keys(incomingSchedule.days).forEach((day) => {
              const d = incomingSchedule.days[day];

              if (d.opens_at)
                d.opens_at = to24HourFormat(d.opens_at);

              if (d.closes_at)
                d.closes_at = to24HourFormat(d.closes_at);
            });
          }

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
            is_public: data.is_public ?? false,
            facility_companiesId: data.facility_companiesId,
            type_id: data.type_id,
            usage_category: data.usage_category || {
              men: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
              women: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
            },
            schedule: incomingSchedule,
          });
        }
        else {
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
          [field]: value, // allow "" or number
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
    if (!formData.name.trim()) {
      toast.error("Location name required");
      return;
    }

    setSaving(true);

    try {
      // 🔹 Delete marked images
      for (const imageUrl of imagesToDelete) {
        await LocationsApi.deleteLocationImage(
          params.id,
          imageUrl,
          finalCompanyId
        );
      }

      // 🔹 Convert 24h → 12h
      const to12HourFormat = (time24) => {
        if (!time24) return "";
        const [hour, minute] = time24.split(":");
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12.toString().padStart(2, "0")}:${minute} ${ampm}`;
      };

      // 🔹 Deep clone schedule
      const normalizedSchedule = JSON.parse(
        JSON.stringify(formData.schedule)
      );

      // 🔹 FIXED HOURS
      if (normalizedSchedule.mode === "FIXED_HOURS") {
        const { opens_at, closes_at } = normalizedSchedule;

        if (opens_at && closes_at) {
          normalizedSchedule.overnight =
            closes_at < opens_at;

          normalizedSchedule.opens_at =
            to12HourFormat(opens_at);

          normalizedSchedule.closes_at =
            to12HourFormat(closes_at);
        }
      }

      // 🔹 DAY WISE
      if (normalizedSchedule.mode === "DAY_WISE") {
        Object.keys(normalizedSchedule.days).forEach((day) => {
          const dayData = normalizedSchedule.days[day];

          if (dayData.open && dayData.opens_at && dayData.closes_at) {
            dayData.overnight =
              dayData.closes_at < dayData.opens_at;

            dayData.opens_at =
              to12HourFormat(dayData.opens_at);

            dayData.closes_at =
              to12HourFormat(dayData.closes_at);
          }
        });
      }

      // 🔹 Normalize usage_category
      const normalizedUsageCategory = {
        men: Object.fromEntries(
          Object.entries(formData.usage_category.men).map(
            ([k, v]) => [k, Number(v || 0)]
          )
        ),
        women: Object.fromEntries(
          Object.entries(formData.usage_category.women).map(
            ([k, v]) => [k, Number(v || 0)]
          )
        ),
      };

      // 🔹 Final payload
      const updateData = {
        ...formData,
        name: formData.name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        no_of_photos: formData.no_of_photos || null,
        facility_companiesId: formData.facility_companiesId || null,
        type_id: formData.type_id || null,
        usage_category: normalizedUsageCategory,
        schedule: normalizedSchedule, // ✅ CORRECT FIELD
      };

      const result = await LocationsApi.updateLocation(
        params.id,
        updateData,
        finalCompanyId,
        newImages,
        false
      );

      if (result.success) {
        toast.success("Location updated successfully!");
        setTimeout(
          () => router.push(`/washrooms?companyId=${finalCompanyId}`),
          1000
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
                    Location Hirarchy
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
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                    Toilet Visibility
                  </label>

                  <div className="flex items-center gap-3 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">

                    <span
                      className={`text-xs font-bold transition-colors ${formData.is_public
                        ? "text-cyan-600 dark:text-cyan-400"
                        : "text-slate-400"
                        }`}
                    >
                      Public
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          is_public: !prev.is_public,
                        }))
                      }
                      className={`relative w-11 h-6 rounded-full transition-colors border ${formData.is_public
                        ? "bg-cyan-500/90 border-cyan-500"
                        : "bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600"
                        }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-100 shadow-sm transition-transform ${formData.is_public ? "translate-x-5" : ""
                          }`}
                      />
                    </button>

                    <span
                      className={`text-xs font-bold transition-colors ${!formData.is_public
                        ? "text-rose-500 dark:text-rose-400"
                        : "text-slate-400"
                        }`}
                    >
                      Private
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-1 leading-tight">
                    Private toilets are restricted to the assigned facility company
                  </p>
                </div>

                {/* Photo Count */}
                {/* <div className="space-y-2">
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
                </div> */}
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
                      Men&apos;s Facilities
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
                            step="1"
                            value={formData.usage_category.men[field] ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;

                              if (raw === "") {
                                updateUsageCategory("men", field, "");
                              } else {
                                updateUsageCategory("men", field, Number(raw));
                              }
                            }}
                            onBlur={() => {
                              if (formData.usage_category.men[field] === "") {
                                updateUsageCategory("men", field, 0);
                              }
                            }}
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
                      Women&apos;s Facilities
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
                            step="1"
                            value={formData.usage_category.women[field] ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;

                              if (raw === "") {
                                updateUsageCategory("women", field, "");
                              } else {
                                updateUsageCategory("women", field, Number(raw));
                              }
                            }}
                            onBlur={() => {
                              if (formData.usage_category.women[field] === "") {
                                updateUsageCategory("women", field, 0);
                              }
                            }}
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

            <AvailabilityCard
              schedule={formData.schedule}
              setSchedule={(updatedSchedule) =>
                setFormData((prev) => ({
                  ...prev,
                  schedule: updatedSchedule,
                }))
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

              {/* Map */}
              <div className="mb-4">
                <GoogleMapPicker
                  lat={formData.latitude ? parseFloat(formData.latitude) : null}
                  lng={formData.longitude ? parseFloat(formData.longitude) : null}
                  onSelect={(lat, lng) => {
                    handleInputChange("latitude", lat?.toString() || "");
                    handleInputChange("longitude", lng?.toString() || "");
                  }}
                />
              </div>

              {/* Manual Coordinates */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-cyan-500" />
                  <p className="text-[11px] font-black text-slate-600 uppercase tracking-wider">
                    Manual Coordinates
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude}
                      onChange={(e) =>
                        handleInputChange("latitude", e.target.value)
                      }
                      placeholder="21.145800"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 ml-1">
                      Range: -90 to 90
                    </p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude}
                      onChange={(e) =>
                        handleInputChange("longitude", e.target.value)
                      }
                      placeholder="79.088200"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
                    />
                    <p className="text-[9px] text-slate-400 mt-1 ml-1">
                      Range: -180 to 180
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Coordinates Display */}
              <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl border border-cyan-100/50 dark:border-cyan-800/50">
                <div>
                  <label className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1 block">
                    Current Latitude
                  </label>
                  <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-cyan-200/50 dark:border-cyan-700/50 rounded-lg text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300 shadow-sm">
                    {formData.latitude
                      ? Number(formData.latitude).toFixed(6)
                      : "N/A"}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1 block">
                    Current Longitude
                  </label>
                  <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-cyan-200/50 dark:border-cyan-700/50 rounded-lg text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300 shadow-sm">
                    {formData.longitude
                      ? Number(formData.longitude).toFixed(6)
                      : "N/A"}
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <div className="mt-6 flex items-start gap-3 p-4 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl">
                <Info size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed text-left space-y-1">
                  <p>
                    <span className="font-black text-cyan-600">Option 1:</span>{" "}
                    Drag the map marker to update coordinates automatically
                  </p>
                  <p>
                    <span className="font-black text-cyan-600">Option 2:</span>{" "}
                    Enter lat/long manually
                  </p>
                  <p className="text-amber-600 dark:text-amber-400 font-bold">
                    Address fields will auto-fill when you pin a location
                  </p>
                </div>
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
