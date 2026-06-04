/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { State, City } from "country-state-city";

// Providers & Hooks
import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// API (TanStack Query Hooks)
import {
  useLocationById,
  useUpdateLocation,
  useDeleteLocationImage,
} from "@/features/locations/locations.queries";
import { useFacilityCompanies } from "@/features/facilityCompany/facilityCompany.queries";
import { useLocationTypes } from "@/features/locationTypes/locationTypes.queries";

// ✅ NEW: Import Dynamic Schema Hook
import { useLocationSchema } from "@/features/configurations/configurations.queries";

// UI Components
import Loader from "@/components/ui/Loader";
import AvailabilityCard from "../../../components/AvailabilityCard";
import SearchableSelect from "../../../add-location/components/SearchableSelect";
import GoogleMapPicker from "../../../add-location/components/GoogleMapPicker";
import LocationTypeSelect from "../../../add-location/components/LocationTypeSelect";

// Icons
import {
  Building2,
  MapPin,
  Factory,
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
  X,
  Image as ImageIcon,
  Info,
  Save,
  AlertCircle,
  Trash2,
  Star,
} from "lucide-react";
import { FaPerson, FaPersonDress, FaWheelchair } from "react-icons/fa6";
import { MdShower, MdFamilyRestroom } from "react-icons/md";
import { HiOutlineCloudUpload } from "react-icons/hi";

// --- CONFIGURATION CONSTANTS (Phase 2 targets) ---
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

// --- DYNAMIC THEME ENGINE ---
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

const getCategoryIcon = (id, className) => {
  if (id.includes("men") && !id.includes("women"))
    return <FaPerson className={className} />;
  if (id.includes("women")) return <FaPersonDress className={className} />;
  if (id.includes("handicap") || id.includes("disable"))
    return <FaWheelchair className={className} />;
  if (id.includes("family")) return <MdFamilyRestroom className={className} />;
  return <Users className={className} />;
};

const validatePincode = (pincode) => {
  if (!pincode) return true;
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pincode);
};

const EditLocationPage = () => {
  useRequirePermission(MODULES.LOCATIONS);
  const { canUpdate } = usePermissions();
  const canEditLocation = canUpdate(MODULES.LOCATIONS);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();
  const urlCompanyId = searchParams.get("companyId");
  const finalCompanyId = companyId || urlCompanyId;

  // Queries
  const {
    data: locationData,
    isLoading: isLocationLoading,
    error: locationError,
  } = useLocationById(params.id, finalCompanyId);
  const { data: facilityCompaniesRes } = useFacilityCompanies(finalCompanyId);
  const { data: locationTypesResult = [] } = useLocationTypes(finalCompanyId);

  // ✅ Fetch Dynamic Schema
  const { data: locationSchema, isLoading: isLoadingSchema } =
    useLocationSchema(finalCompanyId);

  const facilityCompanies = facilityCompaniesRes?.data || [];
  const locationTypes = locationTypesResult?.data || locationTypesResult;

  // Mutations
  const updateLocationMutation = useUpdateLocation();
  const deleteImageMutation = useDeleteLocationImage();

  // State
  const [saving, setSaving] = useState(false);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);

  // Image States
  const [newCoverImage, setNewCoverImage] = useState(null);
  const [newOtherImages, setNewOtherImages] = useState([]);
  const [existingCover, setExistingCover] = useState(null);
  const [existingOtherImages, setExistingOtherImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  const [coverActionModal, setCoverActionModal] = useState({ isOpen: false });
  const coverInputRef = useRef(null);
  const otherInputRef = useRef(null);

  // Unified Previews
  const combinedPreviews = useMemo(() => {
    const previews = [];
    if (newCoverImage)
      previews.push({ url: newCoverImage.url, isCover: true, isNew: true });
    else if (existingCover)
      previews.push({ url: existingCover, isCover: true, isNew: false });

    existingOtherImages.forEach((imgUrl) =>
      previews.push({
        url: imgUrl,
        isCover: false,
        isNew: false,
        originalUrl: imgUrl,
      }),
    );
    newOtherImages.forEach((img, index) =>
      previews.push({
        url: img.url,
        isCover: false,
        isNew: true,
        originalIndex: index,
      }),
    );
    return previews;
  }, [newCoverImage, existingCover, existingOtherImages, newOtherImages]);

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
    usage_category: {}, // Starts empty, hydrated by locationData and Schema
    schedule: defaultSchedule,
  });

  const [pincodeError, setPincodeError] = useState("");
  const [manualCoords, setManualCoords] = useState({
    latitude: "",
    longitude: "",
  });

  const to24HourFormat = (time12) => {
    if (!time12) return "";
    const [time, modifier] = time12.split(" ");
    let [hours, minutes] = time.split(":");
    if (modifier === "PM" && hours !== "12")
      hours = String(parseInt(hours, 10) + 12);
    if (modifier === "AM" && hours === "12") hours = "00";
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  // Hydrate Form Data from Backend
  useEffect(() => {
    if (locationData) {
      const incomingSchedule = JSON.parse(
        JSON.stringify(locationData.schedule || defaultSchedule),
      );
      if (incomingSchedule.mode === "FIXED_HOURS") {
        if (incomingSchedule.opens_at)
          incomingSchedule.opens_at = to24HourFormat(incomingSchedule.opens_at);
        if (incomingSchedule.closes_at)
          incomingSchedule.closes_at = to24HourFormat(
            incomingSchedule.closes_at,
          );
      }
      if (incomingSchedule.mode === "DAY_WISE" && incomingSchedule.days) {
        Object.keys(incomingSchedule.days).forEach((day) => {
          const d = incomingSchedule.days[day];
          if (d.opens_at) d.opens_at = to24HourFormat(d.opens_at);
          if (d.closes_at) d.closes_at = to24HourFormat(d.closes_at);
        });
      }

      setFormData({
        name: locationData.name,
        latitude: locationData.latitude?.toString() || "",
        longitude: locationData.longitude?.toString() || "",
        address: locationData.address || "",
        city: locationData.city || "",
        state: locationData.state || "",
        dist: locationData.dist || "",
        pincode: locationData.pincode || "",
        no_of_photos: locationData.no_of_photos,
        options: locationData.options || {},
        is_public: locationData.is_public ?? false,
        facility_companiesId: locationData.facility_companiesId,
        type_id: locationData.type_id,
        usage_category: locationData.usage_category || {}, // Load existing usage data
        schedule: incomingSchedule,
      });

      setManualCoords({
        latitude: locationData.latitude?.toString() || "",
        longitude: locationData.longitude?.toString() || "",
      });

      if (locationData.images && locationData.images.length > 0) {
        setExistingCover(locationData.images[0]);
        setExistingOtherImages(locationData.images.slice(1));
      }
    }
  }, [locationData]);

  useEffect(() => {
    const indiaStates = State.getStatesOfCountry("IN");
    setAvailableStates(indiaStates.map((s) => s.name));
  }, []);

  // Handlers
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
    if (field === "pincode")
      setPincodeError(
        value && !validatePincode(value) ? "Invalid pincode" : "",
      );
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateUsageCategory = (categoryId, fieldId, value) => {
    setFormData((prev) => ({
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

  const handleOptionChange = (optionKey, value) => {
    setFormData((prev) => ({
      ...prev,
      options: { ...prev.options, [optionKey]: value },
    }));
  };

  const handleGenderAccessChange = (value) => {
    const currentAccess = formData.options.genderAccess || [];
    const newAccess = currentAccess.includes(value)
      ? currentAccess.filter((item) => item !== value)
      : [...currentAccess, value];
    handleOptionChange("genderAccess", newAccess);
  };

  const handleCoordinateChange = (field, value) =>
    setManualCoords((prev) => ({ ...prev, [field]: value }));

  const handleApplyCoordinates = () => {
    const lat = parseFloat(manualCoords.latitude);
    const lng = parseFloat(manualCoords.longitude);

    if (isNaN(lat) || isNaN(lng)) return toast.error("Invalid coordinates.");
    if (lat < -90 || lat > 90)
      return toast.error("Latitude must be between -90 and 90");
    if (lng < -180 || lng > 180)
      return toast.error("Longitude must be between -180 and 180");

    handleInputChange("latitude", lat);
    handleInputChange("longitude", lng);
    toast.success("Map updated with new coordinates");
  };

  const handleCoverImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024) {
      if (newCoverImage) URL.revokeObjectURL(newCoverImage.url);
      setNewCoverImage({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      });
      if (existingCover) {
        setImagesToDelete((prev) => [...prev, existingCover]);
        setExistingCover(null);
      }
    } else {
      toast.error("Invalid file. Must be an image under 5MB.");
    }
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleOtherImagesSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const validFiles = files.filter(
      (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024,
    );
    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));
      setNewOtherImages((prev) => [...prev, ...newPreviews]);
    } else {
      toast.error("Some files were invalid.");
    }
    if (otherInputRef.current) otherInputRef.current.value = "";
  };

  const removeNewCover = () => {
    if (newCoverImage) URL.revokeObjectURL(newCoverImage.url);
    setNewCoverImage(null);
  };
  // 1. Trigger the modal instead of deleting immediately
  const promptRemoveExistingCover = () => {
    setCoverActionModal({ isOpen: true });
  };

  // 2. Action: Delete it permanently
  const confirmDeleteCover = () => {
    if (existingCover) {
      setImagesToDelete((prev) => [...prev, existingCover]);
      setExistingCover(null);
    }
    setCoverActionModal({ isOpen: false });
  };

  // 3. Action: Move to gallery
  const confirmMoveCoverToGallery = () => {
    if (existingCover) {
      // Prevent duplicates in the gallery
      if (!existingOtherImages.includes(existingCover)) {
        setExistingOtherImages((prev) => [...prev, existingCover]);
      }
      setExistingCover(null); // Clear the cover so a new one can be uploaded
    }
    setCoverActionModal({ isOpen: false });
  };

  const removeNewOther = (index) => {
    URL.revokeObjectURL(newOtherImages[index].url);
    setNewOtherImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingOther = (imgUrl) => {
    setImagesToDelete((prev) => [...prev, imgUrl]);
    setExistingOtherImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  const restoreImage = () => {
    if (imagesToDelete.length === 0) return;
    const lastDeleted = imagesToDelete[imagesToDelete.length - 1];
    if (locationData?.images?.[0] === lastDeleted) {
      setExistingCover(lastDeleted);
      if (newCoverImage) removeNewCover();
    } else {
      setExistingOtherImages((prev) => [...prev, lastDeleted]);
    }
    setImagesToDelete((prev) => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return toast.error("Location name required");
    // ✅ 1. NEW: Prevent saving if they deleted/moved the cover without uploading a new one
    if (!newCoverImage && !existingCover) {
      return toast.error("A Cover Image is required.");
    }
    setSaving(true);

    try {
      // 1. Delete marked images
      for (const imageUrl of imagesToDelete) {
        await deleteImageMutation.mutateAsync({
          locationId: params.id,
          imageUrl,
          companyId: finalCompanyId,
        });
      }

      // 2. Format Schedule
      const to12HourFormat = (time24) => {
        if (!time24) return "";
        const [hour, minute] = time24.split(":");
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        return `${hour12.toString().padStart(2, "0")}:${minute} ${ampm}`;
      };

      const normalizedSchedule = JSON.parse(JSON.stringify(formData.schedule));
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

      // ✅ 3. Dynamic Normalization
      const normalizedUsageCategory = {};
      Object.keys(formData.usage_category || {}).forEach((catId) => {
        normalizedUsageCategory[catId] = Object.fromEntries(
          Object.entries(formData.usage_category[catId] || {}).map(([k, v]) => [
            k,
            Number(v || 0),
          ]),
        );
      });

      const updateData = {
        ...formData,
        name: formData.name.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        no_of_photos: formData.no_of_photos || null,
        facility_companiesId: formData.facility_companiesId || null,
        type_id: formData.type_id || null,
        usage_category: normalizedUsageCategory,
        schedule: normalizedSchedule,
        isNewCoverIncluded: !!newCoverImage,
      };

      const combinedNewImages = [];
      if (newCoverImage) combinedNewImages.push(newCoverImage.file);
      newOtherImages.forEach((img) => combinedNewImages.push(img.file));

      await updateLocationMutation.mutateAsync({
        id: params.id,
        data: updateData,
        companyId: finalCompanyId,
        images: combinedNewImages,
        replaceImages: false,
      });

      toast.success("Location updated successfully!");
      setTimeout(
        () => router.push(`/washrooms?companyId=${finalCompanyId}`),
        1000,
      );
    } catch (err) {
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  // ✅ NEW: Swap any gallery image to become the new cover
  const handleMakeCover = (preview) => {
    // 1. Move the current cover down to the gallery pool
    if (newCoverImage) {
      setNewOtherImages((prev) => [newCoverImage, ...prev]);
      setNewCoverImage(null);
    } else if (existingCover) {
      setExistingOtherImages((prev) => [existingCover, ...prev]);
      setExistingCover(null);
    }

    // 2. Promote the selected gallery image to be the new cover
    if (preview.isNew) {
      // Promoting a newly uploaded file
      const imageToPromote = newOtherImages[preview.originalIndex];
      setNewCoverImage(imageToPromote);
      setNewOtherImages((prev) =>
        prev.filter((_, i) => i !== preview.originalIndex),
      );
    } else {
      // Promoting an existing database URL
      const imageToPromoteUrl = preview.originalUrl;
      setExistingCover(imageToPromoteUrl);
      setExistingOtherImages((prev) =>
        prev.filter((url) => url !== imageToPromoteUrl),
      );
    }
  };

  if (isLocationLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader size="large" color="#06b6d4" />
      </div>
    );
  if (locationError || !locationData)
    return (
      <div className="p-8 text-center text-red-500">
        {locationError?.message || "Location not found"}
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-8 pb-10 p-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-center justify-start gap-4">
          <button
            onClick={() =>
              router.push(`/washrooms?companyId=${finalCompanyId}`)
            }
            className="flex items-center p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
            <span className="ml-2 font-bold text-sm uppercase tracking-wider">
              Back to Listings
            </span>
          </button>
        </div>
        <div className="w-full mt-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Edit Washroom
          </h1>
        </div>

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
                      value={formData.name || ""}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      placeholder="Enter washroom name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Location Hierarchy
                  </label>
                  <div className="h-11">
                    <LocationTypeSelect
                      types={locationTypes}
                      selectedType={formData.type_id || ""}
                      setSelectedType={(id) => handleInputChange("type_id", id)}
                      className="w-full"
                    />
                  </div>
                </div>

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
                      value={formData.address || ""}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      placeholder="Enter full address"
                    />
                  </div>
                </div>

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
                      className="w-full h-full pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all outline-none appearance-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
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
                  <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider block ml-1">
                    Toilet Visibility
                  </label>
                  <div className="flex items-center gap-3 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                    <span
                      className={`text-xs font-bold transition-colors ${formData.is_public ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400"}`}
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
                      className={`relative w-11 h-6 rounded-full transition-colors border ${formData.is_public ? "bg-cyan-500/90 border-cyan-500" : "bg-slate-300 dark:bg-slate-600 border-slate-300 dark:border-slate-600"}`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-100 shadow-sm transition-transform ${formData.is_public ? "translate-x-5" : ""}`}
                      />
                    </button>
                    <span
                      className={`text-xs font-bold transition-colors ${!formData.is_public ? "text-rose-500 dark:text-rose-400" : "text-slate-400"}`}
                    >
                      Private
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 ml-1 leading-tight">
                    Restricted to the assigned facility company
                  </p>
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
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    State
                  </label>
                  <div className="h-11">
                    <SearchableSelect
                      options={availableStates}
                      value={formData.state || ""}
                      onChange={(value) => handleInputChange("state", value)}
                      placeholder="Select state"
                      allowCustom={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    District
                  </label>
                  <div className="relative flex items-center h-11">
                    <input
                      value={formData.dist || ""}
                      onChange={(e) =>
                        handleInputChange("dist", e.target.value)
                      }
                      className="w-full h-full px-4 rounded-xl border border-slate-200 bg-slate-50/30 text-sm focus:border-cyan-500 transition-all outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
                      placeholder="Enter district"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    City
                  </label>
                  <div className="h-11">
                    <SearchableSelect
                      options={availableCities}
                      value={formData.city || ""}
                      onChange={(value) => handleInputChange("city", value)}
                      placeholder="Select city"
                      allowCustom={true}
                      className="w-full h-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block ml-1">
                    Pincode
                  </label>
                  <div className="relative flex items-center h-11">
                    <input
                      type="text"
                      maxLength={6}
                      value={formData.pincode || ""}
                      onChange={(e) =>
                        handleInputChange("pincode", e.target.value)
                      }
                      className={`w-full h-full px-4 rounded-xl border bg-white text-sm focus:border-cyan-500 transition-all outline-none dark:bg-slate-800 dark:text-slate-200 ${pincodeError ? "border-rose-500" : "border-slate-200 dark:border-slate-700"}`}
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
                    const theme =
                      CATEGORY_THEMES[index % CATEGORY_THEMES.length];
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
                                  formData.usage_category?.[category.id]?.[
                                    entity.id
                                  ] ??
                                  entity.defaultValue ??
                                  ""
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
                                    formData.usage_category?.[category.id]?.[
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
                    className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          formData.options.genderAccess?.includes(item.value) ||
                          false
                        }
                        onChange={() => handleGenderAccessChange(item.value)}
                        className="w-4 h-4 rounded border border-slate-200 text-cyan-500 focus:ring-0 cursor-pointer accent-cyan-500"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 group-hover:text-cyan-500/70 transition-colors">
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors tracking-tight">
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
                setFormData((prev) => ({ ...prev, schedule: updatedSchedule }))
              }
            />
          </div>

          {/* === RIGHT COLUMN === */}
          <div className="space-y-8">
            {/* 4. PIN LOCATION (MAP) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/10 flex items-center justify-center border border-cyan-500/10 shadow-sm">
                  <MapPin
                    className="text-cyan-600"
                    size={20}
                    strokeWidth={2.5}
                  />
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

              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-cyan-500" />
                  <p className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider">
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
                      value={manualCoords.latitude}
                      onChange={(e) =>
                        handleCoordinateChange("latitude", e.target.value)
                      }
                      placeholder="21.145800"
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
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
                      className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono text-slate-700 dark:text-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none"
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
                  {!newCoverImage && !existingCover ? (
                    <div className="group relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/50 hover:bg-cyan-400/5 transition-all h-40 flex flex-col justify-center items-center">
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
                    <div className="relative group h-40 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                      <img
                        src={newCoverImage ? newCoverImage.url : existingCover}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={
                            newCoverImage
                              ? removeNewCover
                              : promptRemoveExistingCover
                          }
                          className="bg-rose-500 text-white rounded-full p-2 hover:bg-rose-600 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div
                        className={`absolute bottom-2 left-2 text-white text-[9px] px-2 py-1 rounded font-bold uppercase tracking-wider ${newCoverImage ? "bg-green-600/90" : "bg-slate-900/70"}`}
                      >
                        {newCoverImage ? "New Cover" : "Existing Cover"}
                      </div>
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-3">
                  <label className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider block ml-1">
                    Additional Photos
                  </label>
                  <div className="group relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center bg-slate-50/50 dark:bg-slate-800/50 hover:bg-cyan-400/5 transition-all h-40 flex flex-col justify-center items-center">
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
                        className={`relative group rounded-xl overflow-hidden border aspect-square ${preview.isNew ? "border-green-200" : "border-slate-200 dark:border-slate-700"}`}
                      >
                        <img
                          src={preview.url}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Cover Badge */}
                        {preview.isCover && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-1 text-center">
                            <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                              Cover
                            </span>
                          </div>
                        )}

                        {/* New/Existing Badge */}
                        {!preview.isCover && (
                          <span
                            className={`absolute bottom-1 right-1 text-white text-[8px] px-1 rounded ${preview.isNew ? "bg-green-600/90" : "bg-slate-900/70"}`}
                          >
                            {preview.isNew ? "New" : "Existing"}
                          </span>
                        )}

                        {/* ✅ NEW: Make Cover Button (Only shows on non-cover images) */}
                        {!preview.isCover && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleMakeCover(preview);
                            }}
                            className="absolute top-2 left-2 bg-slate-900/60 backdrop-blur-sm text-white rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-cyan-500 shadow-sm flex items-center gap-1.5"
                            title="Set as Cover Image"
                          >
                            <Star size={12} strokeWidth={2.5} />
                            <span className="text-[8px] font-bold uppercase tracking-wider">
                              Set Cover
                            </span>
                          </button>
                        )}

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            if (preview.isCover) {
                              preview.isNew
                                ? removeNewCover()
                                : promptRemoveExistingCover(); // Using your prompt from earlier
                            } else {
                              preview.isNew
                                ? removeNewOther(preview.originalIndex)
                                : removeExistingOther(preview.originalUrl);
                            }
                          }}
                          className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 group-hover:top-1 group-hover:right-1 transition-all shadow-sm"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {imagesToDelete.length > 0 && (
                <div className="mt-6 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-rose-500" />
                    <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {imagesToDelete.length} images marked for deletion.
                    </p>
                  </div>
                  <button
                    onClick={restoreImage}
                    type="button"
                    className="text-[10px] font-bold text-rose-600 dark:text-rose-400 underline hover:text-rose-800"
                  >
                    Undo Last
                  </button>
                </div>
              )}
            </div>

            {/* 6. ADDITIONAL FEATURES */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-xl bg-cyan-400/5 flex items-center justify-center border border-cyan-500/10">
                  <CheckCircle2 className="text-cyan-500/70 text-xl" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-[0.2em] leading-none">
                    Additional Features
                  </h2>
                  <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest mt-1.5">
                    Operational Feature Mapping
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                {FEATURE_CONFIG.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-4 group cursor-pointer p-2 rounded-xl hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="relative flex items-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={!!formData.options[item.key]}
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
                        <span className="text-sm font-medium text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors tracking-tight">
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
        <div className="flex flex-wrap justify-end items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={saving || updateLocationMutation.isPending}
            className="flex items-center gap-2 px-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={
              saving || updateLocationMutation.isPending || !canEditLocation
            }
            className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-10 py-3 rounded-xl text-sm font-bold shadow-lg hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving || updateLocationMutation.isPending ? (
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

      {/* --- MODALS --- */}
      {coverActionModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                Cover Image Action
              </h3>
              <button
                onClick={() => setCoverActionModal({ isOpen: false })}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Would you like to permanently delete this cover image, or move it
              to your additional gallery photos?
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={confirmMoveCoverToGallery}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900/40 rounded-xl text-sm font-bold transition-colors"
              >
                <ImageIcon size={16} /> Move to Additional Photos
              </button>

              <button
                onClick={confirmDeleteCover}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-sm font-bold transition-colors"
              >
                <Trash2 size={16} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditLocationPage;
