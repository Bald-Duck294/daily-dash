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
} from "lucide-react";
import { FaPerson, FaPersonDress } from "react-icons/fa6";
import { MdShower } from "react-icons/md";
import { HiOutlineCloudUpload } from "react-icons/hi";
import toast from "react-hot-toast";
import { State, City } from "country-state-city";
import AvailabilityCard from "../components/AvailabilityCard";

// API Imports
import { fetchToiletFeaturesById } from "@/features/configurations/configurations.api";
import locationTypesApi from "@/features/locationTypes/locationTypes.api";
import LocationsApi from "@/features/locations/locations.api";
import { AssignmentsApi } from "@/features/assignments/assignments.api";
import { UsersApi } from "@/features/users/users.api";
import FacilityCompanyApi from "@/features/facilityCompany/facilityCompany.api";

// Custom Components (Kept these as they likely contain specific logic like Google Maps loading)
import LocationTypeSelect from "./components/LocationTypeSelect";
import GoogleMapPicker from "./components/GoogleMapPicker";
import SearchableSelect from "./components/SearchableSelect";

// --- CONFIGURATION OBJECT (Based on your JSON) ---
const FEATURE_CONFIG = [
  {
    key: "isPaid",
    label: "Paid Entry Required",
    category: "Access",
    icon: <CreditCard size={14} />,
  },
  {
    key: "isHandicapAccessible",
    label: "Wheelchair Accessible",
    category: "Accessibility",
    icon: <Users size={14} />,
  },
  {
    key: "isStrictlyForHandicap",
    label: "Strictly for Disabled Users",
    category: "Accessibility",
    icon: <Shield size={14} />,
  },
  {
    key: "hasBabyChangingStation",
    label: "Baby Changing Station",
    category: "Family Features",
    icon: <Baby size={14} />,
  },
  {
    key: "hasSanitaryProducts",
    label: "Sanitary Products",
    category: "Amenities",
    icon: <Package size={14} />,
  },
  {
    key: "hasAttendant",
    label: "Attendant Present",
    category: "Service",
    icon: <UserCheck size={14} />,
  },
  {
    key: "is24Hours",
    label: "24/7 Availability",
    category: "Access",
    icon: <Clock size={14} />,
  },
  {
    key: "hasHandDryer",
    label: "Hand Dryer Available",
    category: "Amenities",
    icon: <Wind size={14} />,
  },
];

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

export default function AddWashroomForm() {
  // --- PERMISSIONS & HOOKS ---
  useRequirePermission(MODULES.LOCATIONS);
  const { canAdd } = usePermissions();
  const canAddLocation = canAdd(MODULES.LOCATIONS);
  const canAssignCleaner = canAdd(MODULES.ASSIGNMENTS);
  const { companyId } = useCompanyId();
  const router = useRouter();

  // --- STATE MANAGEMENT ---
  const [features, setFeatures] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [facilityCompanies, setFacilityCompanies] = useState([]);
  const [selectedFacilityCompany, setSelectedFacilityCompany] = useState(null);

  // Images
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const fileInputRef = useRef(null);

  // Cleaners
  const [allCleaners, setAllCleaners] = useState([]);
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [cleanerSearchTerm, setCleanerSearchTerm] = useState("");
  const [isCleanerDropdownOpen, setIsCleanerDropdownOpen] = useState(false);
  const cleanerDropdownRef = useRef(null);

  // Location Data
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const [manualCoords, setManualCoords] = useState({
    latitude: "",
    longitude: "",
  });
  // Form State
  const [form, setForm] = useState({
    name: "",
    parent_id: null,
    type_id: null,
    facility_company_id: null,
    is_public: true,
    latitude: 21.1458, // Default to Nagpur as per screenshot
    longitude: 79.0882,
    address: "",
    pincode: "",
    state: "",
    city: "",
    dist: "",
    status: true,
    no_of_photos: null,
    options: {
      genderAccess: [], // Multiselect array
      // boolean keys will be added dynamically
    },
    usage_category: {
      men: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
      women: { wc: 0, indian: 0, urinals: 0, shower: 0, basin: 0 },
    },
    schedule: {
      mode: "TWENTY_FOUR_HOURS", // default

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
    },

  });

  // --- INITIAL DATA LOADING ---
  useEffect(() => {
    const indiaStates = State.getStatesOfCountry("IN");
    setAvailableStates(indiaStates.map((s) => s.name));
  }, []);

  useEffect(() => {
    setManualCoords({
      latitude: form.latitude.toString(),
      longitude: form.longitude.toString(),
    });
  }, []);
  useEffect(() => {
    async function loadInitialData() {
      if (!companyId) return;

      try {
        // 1. Facility Companies
        const facilities = await FacilityCompanyApi.getAll(companyId, false);
        if (facilities.success) setFacilityCompanies(facilities.data || []);

        // 2. Config & Types
        const config = await fetchToiletFeaturesById(8);
        setFeatures(config || []);
        // debugger;  


        const types = await locationTypesApi.getAll(companyId);
        setLocationTypes(Array.isArray(types) ? types : []);

        // 3. Cleaners
        const cleaners = await UsersApi.getAllUsers(companyId, 5);
        if (cleaners.success) {
          setAllCleaners(
            (cleaners.data || []).filter(
              (u) => parseInt(u.role_id || u.role?.id) === 5,
            ),
          );
        }
      } catch (err) {
        console.error("Error loading initial data", err);
      }
    }
    loadInitialData();
  }, [companyId]);

  // --- HANDLERS ---

  // Cleaners Dropdown Close
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

  const handleCoordinateChange = (field, value) => {
    setManualCoords((prev) => ({ ...prev, [field]: value }));
  };
  const handleApplyCoordinates = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      toast.error("Invalid coordinates. Please enter valid numbers.");
      return;
    }

    if (lat < -90 || lat > 90) {
      toast.error("Latitude must be between -90 and 90");
      return;
    }

    if (lng < -180 || lng > 180) {
      toast.error("Longitude must be between -180 and 180");
      return;
    }

    // Update form state (this will trigger map update)
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
        const addressComponents = result.address_components;

        // Extract location details
        let state = "";
        let city = "";
        let pincode = "";
        let district = "";

        addressComponents.forEach((component) => {
          if (component.types.includes("administrative_area_level_1")) {
            state = component.long_name;
          }
          if (component.types.includes("locality")) {
            city = component.long_name;
          }
          if (component.types.includes("administrative_area_level_3")) {
            district = component.long_name;
          }
          if (component.types.includes("postal_code")) {
            pincode = component.long_name;
          }
        });

        // Update form with geocoded data
        handleChange("address", result.formatted_address);
        if (state) handleChange("state", state);
        if (city) handleChange("city", city);
        if (district) handleChange("dist", district);
        if (pincode) handleChange("pincode", pincode);

        return true;
      }
      return false;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return false;
    }
  };

  const handleMapLocationSelect = async (lat, lng) => {
    // Update coordinates
    handleChange("latitude", lat);
    handleChange("longitude", lng);

    // Update manual input fields
    setManualCoords({
      latitude: lat.toString(),
      longitude: lng.toString(),
    });

    // Reverse geocode to fill address fields
    const geocoded = await reverseGeocode(lat, lng);
    if (geocoded) {
      toast.success("Location details auto-filled from map");
    }
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

    if (key === "pincode") {
      setPincodeError(
        value && !validatePincode(value) ? "Invalid pincode" : "",
      );
    }
  };

  // Special handler for the Options JSON object (Features & Access)
  const handleOptionChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      options: {
        ...prev.options,
        [key]: value,
      },
    }));
  };

  const handleGenderAccessChange = (value) => {
    setForm((prev) => {
      const currentAccess = prev.options.genderAccess || [];
      const newAccess = currentAccess.includes(value)
        ? currentAccess.filter((item) => item !== value)
        : [...currentAccess, value];
      return {
        ...prev,
        options: { ...prev.options, genderAccess: newAccess },
      };
    });
  };

  const updateUsageCategory = (gender, field, value) => {
    setForm((prev) => ({
      ...prev,
      usage_category: {
        ...prev.usage_category,
        [gender]: {
          ...prev.usage_category[gender],
          [field]: value, // <-- allow "" or number
        },
      },
    }));
  };


  // Image Handlers
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024,
    );

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    } else {
      toast.error("Some files were invalid (Max 5MB, Images only)");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previewImages[index].url);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };


  // Submit Handler
  const handleSubmit = async () => {
    if (!form.name || !form.type_id) {
      toast.error("Please fill in required fields (Name, Type)");
      return;
    }

    const to12HourFormat = (time24) => {
      if (!time24) return "";

      const [hour, minute] = time24.split(":");
      const h = parseInt(hour, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;

      return `${hour12.toString().padStart(2, "0")}:${minute} ${ampm}`;
    };

    // 🔹 Deep copy schedule
    const normalizedSchedule = JSON.parse(
      JSON.stringify(form.schedule)
    );

    // 🔹 FIXED HOURS
    if (normalizedSchedule.mode === "FIXED_HOURS") {
      const { opens_at, closes_at } = normalizedSchedule;

      if (opens_at && closes_at) {
        normalizedSchedule.overnight = closes_at < opens_at;

        normalizedSchedule.opens_at = to12HourFormat(opens_at);
        normalizedSchedule.closes_at = to12HourFormat(closes_at);
      }
    }

    // 🔹 DAY WISE
    if (normalizedSchedule.mode === "DAY_WISE") {
      Object.keys(normalizedSchedule.days).forEach((day) => {
        const dayData = normalizedSchedule.days[day];

        if (dayData.open && dayData.opens_at && dayData.closes_at) {
          dayData.overnight =
            dayData.closes_at < dayData.opens_at;

          dayData.opens_at = to12HourFormat(dayData.opens_at);
          dayData.closes_at = to12HourFormat(dayData.closes_at);
        }
      });
    }

    // 🔹 Normalize usage_category
    const normalizedUsage = {
      men: Object.fromEntries(
        Object.entries(form.usage_category.men).map(
          ([k, v]) => [k, Number(v || 0)]
        )
      ),
      women: Object.fromEntries(
        Object.entries(form.usage_category.women).map(
          ([k, v]) => [k, Number(v || 0)]
        )
      ),
    };

    const normalizedForm = {
      ...form,
      schedule: normalizedSchedule, // 🔥 IMPORTANT
      usage_category: normalizedUsage,
    };

    setSubmitting(true);

    try {
      const locationRes = await LocationsApi.postLocation(
        normalizedForm,
        companyId,
        images
      );

      if (locationRes?.success) {
        const createdId = locationRes?.data?.data?.id;

        if (selectedCleaners.length > 0 && createdId) {
          await AssignmentsApi.createAssignmentsForLocation({
            location_id: createdId,
            cleaner_user_ids: selectedCleaners.map((c) => c.id),
            status: "assigned",
            company_id: companyId,
            role_id: 5,
          });

          toast.success(
            `Washroom added & ${selectedCleaners.length} cleaners assigned`
          );
        } else {
          toast.success("Washroom added successfully");
        }

        setTimeout(
          () => router.push(`/washrooms?companyId=${companyId}`),
          1000
        );
      } else {
        toast.error(locationRes?.error || "Failed to create location");
      }
    } catch (error) {
      console.error(error);
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Cleaners
  const filteredCleaners = allCleaners.filter((c) =>
    c.name?.toLowerCase().includes(cleanerSearchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      {/* --- HEADER --- */}
        <div className="
  w-full
  bg-white dark:bg-slate-900
  border-b border-slate-200 dark:border-slate-800
  px-8 py-6
">
        <div className="flex items-center gap-4">

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="
        p-2 rounded-xl transition-all
        bg-slate-100 hover:bg-slate-200
        text-slate-600
        dark:bg-slate-800 dark:hover:bg-slate-700
        dark:text-slate-300
      "
          >
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>

          {/* Title Section */}
          <div>
            <h1 className="
        text-xl md:text-2xl font-semibold tracking-tight
        text-slate-900 dark:text-white
      ">
              Add New Washroom
            </h1>

            <p className="
        text-xs uppercase tracking-widest mt-1
        text-slate-500 dark:text-slate-400
      ">
              Facility Registration
            </p>
          </div>

        </div>
      </div>


      {/* --- MAIN GRID LAYOUT --- */}
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
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 uppercase tracking-wider block ml-1">
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
                    className="
  w-full h-full pl-11 pr-4 rounded-xl text-sm transition-all outline-none
  border border-slate-200 bg-white text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"

                    placeholder="Enter washroom name"
                  />
                </div>
              </div>

              {/* Location Type (Replaces simple text input) */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
uppercase tracking-wider block ml-1">
                  Location Hirarchy <span className="text-rose-500">*</span>
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

              {/* Address/Location */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 uppercase tracking-wider block ml-1">
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
                    className="
  w-full h-full pl-11 pr-4 rounded-xl text-sm transition-all outline-none
  border border-slate-200 bg-white text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"

                    placeholder="Enter full address"
                  />
                </div>
              </div>

              {/* Facility Company */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 uppercase tracking-wider block ml-1">
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
                    className="
  w-full h-full pl-11 pr-4 rounded-xl text-sm transition-all outline-none
  border border-slate-200 bg-white text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"

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

              {/* Public / Private Toggle */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 dark:text-slate-400 uppercase tracking-wider block ml-1">
                  Toilet Visibility
                </label>

                <div className="flex items-center gap-3 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                  {/* Public */}
                  <span
                    className={`text-xs font-bold transition-colors ${form.is_public
                      ? "text-cyan-600 dark:text-cyan-400"
                      : "text-slate-400"
                      }`}
                  >
                    Public
                  </span>

                  {/* Toggle */}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        is_public: !prev.is_public,
                      }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors border ${form.is_public
                      ? "bg-cyan-500/90 border-cyan-500"
                      : "bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600"
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-100 shadow-sm transition-transform ${form.is_public ? "translate-x-5" : ""
                        }`}
                    />
                  </button>

                  {/* Private */}
                  <span
                    className={`text-xs font-bold transition-colors ${!form.is_public
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

              {/* Image Count */}
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
                    value={form.no_of_photos || ""}
                    onChange={(e) =>
                      handleChange("no_of_photos", e.target.value)
                    }
                    className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none"
                    placeholder="0"
                  />
                </div>
              </div> */}
            </div>

            {/* Hidden Pincode/State/City logic can go here if needed visually, otherwise logic handles it via map/address */}
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
              {/* State */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 uppercase tracking-wider block ml-1">
                  State
                </label>
                <div className="h-11">
                  <SearchableSelect
                    options={availableStates}
                    value={form.state}
                    onChange={(value) => handleChange("state", value)}
                    placeholder="Select or type state"
                    // label="State"
                    allowCustom={true}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* District */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
uppercase tracking-wider block ml-1">
                  District
                </label>
                <div className="relative flex items-center h-11">
                  <input
                    value={form.dist}
                    onChange={(e) => handleChange("dist", e.target.value)}
                    className="
  w-full h-full px-4 rounded-xl text-sm transition-all outline-none
  border border-slate-200 bg-white text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"

                    placeholder="Enter district name"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 uppercase tracking-wider block ml-1">
                  City
                </label>
                <div className="h-11">
                  <SearchableSelect
                    options={availableCities}
                    value={form.city}
                    onChange={(value) => handleChange("city", value)}
                    placeholder="Select or type city"
                    // label="City"
                    allowCustom={true}
                    className="w-full h-full"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 uppercase tracking-wider block ml-1">
                  Pincode
                </label>
                <div className="relative flex items-center h-11">
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className={`
  w-full h-full px-4 rounded-xl text-sm transition-all outline-none
  border border-slate-200 bg-white text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10
  
${pincodeError
                        ? "border-rose-500 dark:border-rose-500"
                        : "border-slate-200 dark:border-slate-700"}

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
`}

                    placeholder="000000"
                  />
                </div>
                {pincodeError && (
                  <p className="text-[10px] font-bold text-rose-500 ml-1">
                    {pincodeError}
                  </p>
                )}
              </div>

              {/* Full Address */}
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-300
 uppercase tracking-wider block ml-1">
                  Full Address
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={3}
                  className="
  w-full h-full px-4 rounded-xl text-sm transition-all outline-none
  border border-slate-200 bg-white text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"

                  placeholder="Enter complete street address, landmark, and building details"
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
              {/* MEN'S SECTION */}
              <div className="bg-slate-50/50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="h-8 w-8 bg-white rounded-lg shadow-sm border border-slate-100 flex items-center justify-center">
                    <FaPerson className="text-cyan-600 text-lg" />
                  </div>
                  <h3 className="  text-xs font-bold uppercase tracking-widest
  text-slate-700
  dark:text-slate-200">
                    Men&apos;s Facilities
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {["wc", "indian", "urinals", "shower", "basin"].map(
                    (field) => (
                      <div key={field} className="mb-0">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400
 uppercase tracking-wider mb-1.5 ml-1 block">
                          {field}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={form.usage_category.men[field] ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;

                            if (raw === "") {
                              updateUsageCategory("men", field, "");
                            } else {
                              updateUsageCategory("men", field, Number(raw));
                            }
                          }}
                          onBlur={() => {
                            if (form.usage_category.men[field] === "") {
                              updateUsageCategory("men", field, 0);
                            }
                          }}
                          className="
  w-full pl-4 py-2 rounded-xl text-sm outline-none transition-all
  border border-slate-200 bg-white text-slate-800
  focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-500

  dark:bg-slate-900
  dark:border-slate-700
  dark:text-slate-100
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"
                          placeholder="0"
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* WOMEN'S SECTION */}
              <div className="
                    bg-rose-50/30
                 dark:bg-rose-900/10
                   border border-rose-100/50
                       dark:border-rose-800/40
                       rounded-2xl p-6
                       transition-all hover:shadow-md
                     ">

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
                          value={form.usage_category.women[field] ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;

                            if (raw === "") {
                              updateUsageCategory("women", field, "");
                            } else {
                              updateUsageCategory("women", field, Number(raw));
                            }
                          }}
                          onBlur={() => {
                            if (form.usage_category.women[field] === "") {
                              updateUsageCategory("women", field, 0);
                            }
                          }}
                          className="
  w-full pl-4 py-2 rounded-xl text-sm outline-none transition-all
  border border-rose-200 bg-white text-slate-800
  focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500

  dark:bg-slate-900
  dark:border-rose-800
  dark:text-slate-100
  dark:placeholder-slate-500
  dark:focus:border-rose-400
  dark:focus:ring-rose-400/20
"
                        />

                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. AVAILABLE FOR GENDER (From JSON Schema) */}
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
                      checked={form.options.genderAccess?.includes(item.value)}
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
            schedule={form.schedule}
            setSchedule={(updatedSchedule) =>
              setForm((prev) => ({
                ...prev,
                schedule: updatedSchedule,
              }))
            }
          />



        </div>

        {/* === RIGHT COLUMN === */}
        <div className="space-y-8">
          {/* 4. PIN LOCATION (Map) */}
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

            {/* Map Component */}
            <div className="mb-4">
              <GoogleMapPicker
                lat={form.latitude}
                lng={form.longitude}
                onSelect={handleMapLocationSelect}
              />
            </div>

            {/* Manual Coordinate Input Section - ENHANCED */}
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={14} className="text-cyan-500 dark:text-cyan-400" />
                <p className="
  text-[11px] font-semibold uppercase tracking-wider
  text-slate-600
  dark:text-slate-200
">

                  Manual Coordinates
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400
 uppercase tracking-wider mb-2 block">
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
                    className="
  w-full px-3 py-2.5 rounded-xl text-sm font-mono
  bg-white border border-slate-200 text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10
  transition-all outline-none

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"

                  />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500
 mt-1 ml-1">
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
                    value={manualCoords.longitude}
                    onChange={(e) =>
                      handleCoordinateChange("longitude", e.target.value)
                    }
                    placeholder="79.088200"
                    className="
  w-full px-3 py-2.5 rounded-xl text-sm font-mono
  bg-white border border-slate-200 text-slate-700
  focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10
  transition-all outline-none

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:placeholder-slate-500
  dark:focus:border-cyan-400
  dark:focus:ring-cyan-400/20
"

                  />
                  <p className="text-[9px] text-slate-400 dark:text-slate-500
 mt-1 ml-1">
                    Range: -180 to 180
                  </p>
                </div>
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApplyCoordinates}
                className="
  w-full mt-2 px-4 py-2.5 rounded-xl
  bg-gradient-to-r from-cyan-500 to-blue-500
  text-white text-xs font-semibold uppercase tracking-widest
  hover:brightness-110 transition-all
  shadow-sm active:scale-[0.98]
  flex items-center justify-center gap-2
"

              >
                <MapPin size={14} />
                Update Map Location
              </button>
            </div>

            {/* Current Coordinates Display */}
            <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 dark:from-cyan-900/10 dark:to-blue-900/10 rounded-xl border border-cyan-100/50 dark:border-cyan-800/50">
              <div>
                <label className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1 block">
                  Current Latitude
                </label>
                <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-cyan-200/50 dark:border-cyan-700/50 rounded-lg text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300 shadow-sm">
                  {Number(form.latitude).toFixed(6)}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider mb-1 block">
                  Current Longitude
                </label>
                <div className="px-3 py-2 bg-white dark:bg-slate-800 border border-cyan-200/50 dark:border-cyan-700/50 rounded-lg text-sm font-mono font-bold text-cyan-700 dark:text-cyan-300 shadow-sm">
                  {Number(form.longitude).toFixed(6)}
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
                  Enter lat/long manually and click &quot;Update Map Location&quot;
                </p>
                <p className="text-amber-600 dark:text-amber-400 font-bold">
                  Address fields will auto-fill when you pin a location on the
                  map
                </p>
              </div>
            </div>
          </div>

          {/* 5. LOCATION IMAGES */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                <HiOutlineCloudUpload className="text-cyan-600 text-xl" />
              </div>
              <div className="text-left">
                <h2 className="
    text-sm font-bold uppercase tracking-[0.18em] leading-none
    text-slate-800
    dark:text-slate-100
  ">
                  Location Images
                </h2>

                <p className="
    text-[10px] font-semibold uppercase tracking-widest mt-1.5
    text-slate-500
    dark:text-slate-400
  ">
                  Visual Verification Archive
                </p>
              </div>
            </div>

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

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-4">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview.url}
                      alt="preview"
                      className="w-full h-16 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 6. ASSIGN CLEANERS */}
          {canAssignCleaner && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <Users className="text-cyan-600 text-xl" />
                </div>
                <div className="text-left">
                  <h2 className="
  text-sm font-semibold uppercase tracking-[0.18em] leading-none
  text-slate-800
  dark:text-slate-100
">

                    Assign Cleaners{" "}
                    <span className="text-[10px] opacity-50 ml-1">
                      (Optional)
                    </span>
                  </h2>
                  <p className="
  text-[10px] font-medium uppercase tracking-widest mt-1.5
  text-slate-500
  dark:text-slate-400
">

                    Personnel Mapping Architecture
                  </p>
                </div>
              </div>

              <div className="relative mb-6" ref={cleanerDropdownRef}>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 ml-1 block">
                  Staff Selection
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setIsCleanerDropdownOpen(!isCleanerDropdownOpen)
                  }
                  className="
  w-full text-left pl-4 pr-10 py-3 rounded-xl text-sm
  border border-slate-200 bg-white text-slate-700
  focus:border-cyan-500 flex justify-between items-center transition

  dark:bg-slate-800
  dark:border-slate-700
  dark:text-slate-200
  dark:focus:border-cyan-400
"

                >
                  <span
                    className={
                      selectedCleaners.length
                        ? "text-slate-700"
                        : "text-slate-400"
                    }
                  >
                    {selectedCleaners.length > 0
                      ? `${selectedCleaners.length} Staff Selected`
                      : "Select available cleaners"}
                  </span>
                  <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                </button>

                {isCleanerDropdownOpen && (
                  <div className="
  absolute z-10 w-full mt-2 rounded-xl shadow-xl
  max-h-60 overflow-y-auto p-2
  bg-white border border-slate-200
  dark:bg-slate-800 dark:border-slate-700
">
                    <div className="
  sticky top-0 z-10 p-2 mb-2
  bg-white border-b border-slate-200
  dark:bg-slate-800
  dark:border-slate-700
">

                      <input
                        className="
  w-full p-2 text-xs rounded-lg transition
  border border-slate-200 bg-slate-50 text-slate-700
  dark:bg-slate-900
  dark:border-slate-700
  dark:text-slate-200
"

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
                          onClick={() => {
                            setSelectedCleaners((prev) =>
                              prev.some((c) => c.id === cleaner.id)
                                ? prev.filter((c) => c.id !== cleaner.id)
                                : [...prev, cleaner],
                            );
                          }}
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
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200
">
                              {cleaner.name}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-400
">
                              {cleaner.email}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Staff Visualization */}
              <div className="grid grid-cols-2 gap-4">
                {selectedCleaners.slice(0, 2).map((cleaner, i) => (
                  <div
                    key={cleaner.id}
                    className="h-24 bg-cyan-50/30 border border-cyan-100 rounded-2xl flex flex-col items-center justify-center"
                  >
                    <UserCheck className="h-5 w-5 text-cyan-600 mb-2" />
                    <p className="text-[10px] font-black text-cyan-700 uppercase tracking-widest text-center px-2 truncate w-full">
                      {cleaner.name}
                    </p>
                    <p className="text-[9px] text-cyan-500">Slot 0{i + 1}</p>
                  </div>
                ))}
                {selectedCleaners.length < 2 && (
                  <div className="h-24 bg-slate-50/50 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Empty Slot
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 7. ADDITIONAL FEATURES (From JSON Schema) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-b border-slate-200 dark:border-slate-700
">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/5 flex items-center justify-center border border-cyan-500/10">
                <CheckCircle2 className="text-cyan-500/70 text-xl" />
              </div>
              <div className="text-left">
                <h2 className="
  text-sm font-semibold uppercase tracking-[0.18em] leading-none
  text-slate-800
  dark:text-slate-100
">

                  Additional Features
                </h2>
                <p className="
  text-[10px] font-medium uppercase tracking-widest mt-1.5
  text-slate-500
  dark:text-slate-400
">
                  Operational Feature Mapping
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
              {FEATURE_CONFIG.map((item) => (
                <label
                  key={item.key}
                  className="
  flex items-start gap-4 group cursor-pointer p-3 rounded-xl
  transition-colors
  hover:bg-slate-50/70
  dark:hover:bg-slate-800/60
"

                >
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      checked={!!form.options[item.key]}
                      onChange={(e) =>
                        handleOptionChange(item.key, e.target.checked)
                      }
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
      </div>

      {/* --- FOOTER ACTIONS --- */}
      <div className="flex flex-wrap justify-end items-center gap-4 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 px-8 py-3 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
        >
          Cancel
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting || !canAddLocation}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? "Saving..." : "Add Washroom"}
        </button>
      </div>
    </div>
  );
}
