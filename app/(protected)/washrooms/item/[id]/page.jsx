/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Star,
  Edit,
  Calendar,
  Navigation,
  User,
  Layers,
  Users,
  Baby,
  Accessibility,
  Package,
  UserCheck,
  Phone,
  Mail,
  Camera,
  ChevronLeft,
  ChevronRight,
  Shield,
  Trash2,
  AlertTriangle,
  Clock,
  Wind,
  Coins,
  MessageSquare,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";

import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

// ✅ Import TanStack Query Hooks (Removed useGetAllLocations)
import { 
  useLocationById, 
  useDeleteLocation 
} from "@/features/locations/locations.queries"; 
import { 
  useCleanerReviewsByLocationId 
} from "@/features/cleanerReview/cleanerReview.queries"; 


const SingleLocation = () => {
  useRequirePermission(MODULES.LOCATIONS);

  const { canUpdate, canDelete } = usePermissions();
  const canEditLocation = canUpdate(MODULES.LOCATIONS);
  const canDeleteLocation = canDelete(MODULES.LOCATIONS);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const urlCompanyId = searchParams.get("companyId");
  const finalCompanyId = companyId || urlCompanyId;

  // --- Local UI State ---
  const [imageLoading, setImageLoading] = useState({});
  const [activeTab, setActiveTab] = useState("user"); // 'user' or 'cleaner'
  const [deleteModal, setDeleteModal] = useState({ open: false });
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  // --- API Queries via TanStack ---
  
  // 1. Get specific location details
  const { 
    data: location, 
    isLoading: loadingLocation, 
    isError: isLocationError, 
    error: locationError 
  } = useLocationById(params.id, finalCompanyId);

  // 2. Get cleaner reviews for this location
  const { 
    data: cleanerReviewsData, 
    isLoading: loadingReviews 
  } = useCleanerReviewsByLocationId(params.id, finalCompanyId, 10);

  // 3. Delete Mutation
  const { mutate: deleteLocation, isPending: deleting } = useDeleteLocation();

  // Extract cleaner reviews data safely
const cleanerReviews = cleanerReviewsData?.data?.reviews || cleanerReviewsData?.reviews || [];
  const cleanerReviewStats = cleanerReviewsData?.data?.stats || cleanerReviewsData?.stats || null;

  // Combined Loading & Error States
  const loading = loadingLocation || loadingReviews;
  const error = isLocationError ? locationError?.message : null;

  // --- Derived State & Memos ---
  const reviewData = location?.ReviewData;

  const userReviewAverage = useMemo(() => {
    if (!reviewData || reviewData.length === 0) return null;

    const totalRating = reviewData.reduce(
      (sum, review) => sum + (review.rating || 0),
      0,
    );
    return (totalRating / reviewData.length).toFixed(1);
  }, [reviewData]); 

  const userReviewCount = reviewData?.length || 0;
  const cleanerReviewCount = cleanerReviews.length || 0;

  // --- Keypress Effects ---
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedImageIndex === null || !location?.images) return;

      if (e.key === "ArrowLeft" && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      } else if (
        e.key === "ArrowRight" &&
        selectedImageIndex < location.images.length - 1
      ) {
        setSelectedImageIndex(selectedImageIndex + 1);
      } else if (e.key === "Escape") {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [selectedImageIndex, location?.images]);


  // --- Handlers ---
  const handleEdit = () => {
    router.push(`/washrooms/item/${params.id}/edit?companyId=${finalCompanyId}`);
  };

  const handleDelete = () => {
    setDeleteModal({ open: true });
  };

  const confirmDelete = () => {
    deleteLocation(
      { id: params.id, companyId: finalCompanyId, softDelete: false },
      {
        onSuccess: () => {
          toast.success("Location deleted successfully");
          setDeleteModal({ open: false });
          setTimeout(() => {
            router.push(`/washrooms?companyId=${finalCompanyId}`);
          }, 500);
        },
        onError: (err) => {
          toast.error(err.message || "Failed to delete location");
        }
      }
    );
  };

  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handlePreviousImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex < location.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleImageLoad = (reviewId) => {
    setImageLoading((prev) => ({ ...prev, [reviewId]: false }));
  };

  const handleImageError = (reviewId) => {
    setImageLoading((prev) => ({ ...prev, [reviewId]: false }));
  };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;

    const stars = [];
    const isOutOf10 = rating > 5;
    const normalizedRating = isOutOf10 ? rating / 2 : rating;

    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.25 && normalizedRating % 1 < 0.75;
    const totalStars = 5;
    const emptyStars = totalStars - Math.ceil(normalizedRating);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />);
    }
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <div className="overflow-hidden absolute" style={{ width: "50%" }}>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
        </div>
      );
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
  };

  const FacilityRow = ({ label, value }) => (
    <div
      className="flex items-center justify-between rounded-md px-3 py-2 text-sm"
      style={{
        background: "var(--washroom-surface)",
        border: "1px solid var(--washroom-border)",
      }}
    >
      <span className="font-medium text-[var(--washroom-text)]">{label}</span>
      <span className="font-bold text-[var(--washroom-score-text)]">{value}</span>
    </div>
  );

  const renderUsageCategory = (usageCategory) => {
    if (!usageCategory || Object.keys(usageCategory).length === 0) return null;

    const genderData = [
      { key: "men", label: "Men" },
      { key: "women", label: "Women" },
    ];

    return (
      <div
        className="rounded-lg mb-8"
        style={{
          background: "var(--washroom-surface)",
          border: "1px solid var(--washroom-border)",
          boxShadow: "var(--washroom-shadow)",
        }}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--washroom-title)]">
            <Package className="w-5 h-5 text-[var(--washroom-subtitle)]" />
            Washroom Facilities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {genderData.map(({ key, label }) => {
              const data = usageCategory[key];
              if (!data) return null;

              const totalCount =
                (data.wc || 0) +
                (data.indian || 0) +
                (data.urinals || 0) +
                (data.shower || 0) +
                (data.basin || 0);

              return (
                <div
                  key={key}
                  className="rounded-lg p-4"
                  style={{
                    background: "var(--washroom-input-bg)",
                    border: "1px solid var(--washroom-border)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--washroom-score-bg)" }}
                    >
                      <Users className="w-4 h-4 text-[var(--washroom-score-text)]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-[var(--washroom-title)]">{label}</h4>
                      <p className="text-xs text-[var(--washroom-subtitle)]">
                        Total: {totalCount} facilities
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {data.wc > 0 && <FacilityRow label="🚽 Western Toilet (WC)" value={data.wc} />}
                    {data.indian > 0 && <FacilityRow label="🚾 Indian Toilet" value={data.indian} />}
                    {data.urinals > 0 && <FacilityRow label="🧍 Urinals" value={data.urinals} />}
                    {data.shower > 0 && <FacilityRow label="🚿 Shower" value={data.shower} />}
                    {data.basin > 0 && <FacilityRow label="🚰 Basin" value={data.basin} />}
                    {totalCount === 0 && (
                      <div className="text-center py-2 text-sm text-[var(--washroom-subtitle)]">
                        No facilities available
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderLocationOptions = (options) => {
    if (!options || Object.keys(options).length === 0) return null;

    const optionIcons = {
      isPaid: { icon: Coins, label: "Paid Entry" },
      isHandicapAccessible: { icon: Accessibility, label: "Wheelchair Accessible" },
      isStrictlyForHandicap: { icon: Accessibility, label: "Disabled Only" },
      hasBabyChangingStation: { icon: Baby, label: "Baby Changing" },
      hasSanitaryProducts: { icon: Package, label: "Sanitary Products" },
      is24Hours: { icon: Clock, label: "24/7 Open" },
      hasAttendant: { icon: Shield, label: "Has Attendant" },
      hasHandDryer: { icon: Wind, label: "Hand Dryer" },
    };

    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: "var(--washroom-input-bg)",
          border: "1px solid var(--washroom-border)",
        }}
      >
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[var(--washroom-title)]">
          <Package className="w-4 h-4 text-[var(--washroom-subtitle)]" />
          Amenities & Features
        </h3>
        <div className="flex flex-wrap gap-2">
          {options.genderAccess &&
            Array.isArray(options.genderAccess) &&
            options.genderAccess.map((gender) => (
              <span
                key={gender}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                style={{
                  background: "var(--washroom-surface)",
                  color: "var(--washroom-text)",
                  borderColor: "var(--washroom-border)",
                }}
              >
                <Users className="w-3 h-3 mr-1 text-[var(--washroom-subtitle)]" />
                {gender.charAt(0).toUpperCase() + gender.slice(1)}
              </span>
            ))}
          {Object.entries(options).map(([key, value]) => {
            if (key === "genderAccess" || !optionIcons[key]) return null;
            if (typeof value === "boolean" && value !== true) return null;
            if (value === null || value === undefined || value === "") return null;

            const { icon: Icon, label } = optionIcons[key];
            return (
              <span
                key={key}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border"
                style={{
                  background: "var(--washroom-surface)",
                  color: "var(--washroom-text)",
                  borderColor: "var(--washroom-border)",
                }}
              >
                <Icon className="w-3 h-3 mr-1 text-[var(--washroom-score-text)]" />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

const renderAssignedUsers = (assignedCleaners) => {
    // 1. Filter the array to ONLY include users with the role "cleaner"
    const actualCleaners = assignedCleaners?.filter(
      (assignment) => assignment?.role?.name?.toLowerCase() === "cleaner"
    ) || [];

    // 2. Use the filtered array for our checks and rendering
    if (!actualCleaners || actualCleaners.length === 0) {
      return (
        <div className="flex flex-col h-full">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[var(--washroom-title)]">
            <UserCheck className="w-5 h-5 text-[var(--washroom-subtitle)]" />
            Assigned Cleaners
          </h3>
          <p className="text-sm text-[var(--washroom-subtitle)]">
            No cleaners currently assigned to this location.
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-[var(--washroom-title)]">
            <UserCheck className="w-5 h-5 text-[var(--washroom-subtitle)]" />
            Assigned Cleaners ({actualCleaners.length})
          </h3>
          <button
            onClick={() => {
              const paramsObj = new URLSearchParams({
                companyId: finalCompanyId,
                locationId: location.id,
                locationName: location.name,
              });
              router.push(`/assignments/cleaner?${paramsObj.toString()}`);
            }}
            className="text-xs font-medium flex items-center gap-1 transition-colors hover:underline"
            style={{ color: "var(--washroom-primary)" }}
          >
            View All
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-3">
          {/* 3. Map over the filtered array instead of the raw array */}
          {actualCleaners.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between rounded-lg p-3"
              style={{
                background: "var(--washroom-input-bg)",
                border: "1px solid var(--washroom-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "var(--washroom-score-bg)",
                    color: "var(--washroom-score-text)",
                  }}
                >
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-medium text-sm text-[var(--washroom-text)]">
                    {assignment?.cleaner_user?.name || "Unknown"}
                  </div>
                  {assignment?.role && (
                    <div
                      className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "var(--washroom-score-bg)",
                        color: "var(--washroom-score-text)",
                      }}
                    >
                      {assignment.role.name}
                    </div>
                  )}
                  {assignment.cleaner_user?.phone && (
                    <div className="text-xs mt-1 flex items-center gap-1 text-[var(--washroom-subtitle)]">
                      <Phone className="w-3 h-3" />
                      {assignment.cleaner_user.phone}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={
                    assignment.status === "assigned"
                      ? {
                        background: "var(--washroom-status-active-bg)",
                        color: "var(--washroom-status-active-text)",
                        border: `1px solid var(--washroom-status-active-border)`,
                      }
                      : assignment.status === "active"
                        ? {
                          background: "var(--washroom-score-bg)",
                          color: "var(--washroom-score-text)",
                        }
                        : {
                          background: "var(--washroom-input-bg)",
                          color: "var(--washroom-subtitle)",
                        }
                  }
                >
                  {assignment.status}
                </div>
                <div className="text-xs mt-1 text-[var(--washroom-subtitle)]">
                  {formatDate(assignment.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getAvailabilityInfo = () => {
    const schedule = location?.schedule;
    if (!schedule) return null;

    const now = new Date();
    const currentDay = now.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5);

    if (schedule.mode === "TWENTY_FOUR_HOURS") {
      return {
        label: "Open 24 Hours",
        isOpen: true,
        description: "Open all day, every day",
      };
    }

    const to24Hour = (time12) => {
      const [time, modifier] = time12.split(" ");
      let [hours, minutes] = time.split(":");
      if (modifier === "PM" && hours !== "12") hours = String(parseInt(hours, 10) + 12);
      if (modifier === "AM" && hours === "12") hours = "00";
      return `${hours.padStart(2, "0")}:${minutes}`;
    };

    if (schedule.mode === "FIXED_HOURS") {
      const { opens_at, closes_at, overnight } = schedule;
      if (!opens_at || !closes_at) {
        return { label: "Fixed Hours", isOpen: false, description: "Hours not configured" };
      }

      const open24 = to24Hour(opens_at);
      const close24 = to24Hour(closes_at);
      let isOpen = false;

      if (!overnight) {
        isOpen = currentTime >= open24 && currentTime <= close24;
      } else {
        isOpen = currentTime >= open24 || currentTime <= close24;
      }

      return { label: "Fixed Hours", isOpen, description: `${opens_at} – ${closes_at}` };
    }

    if (schedule.mode === "DAY_WISE") {
      const today = schedule.days?.[currentDay];
      if (!today || !today.open) {
        return { label: "Day Wise Schedule", isOpen: false, description: "Closed Today" };
      }

      const open24 = to24Hour(today.opens_at);
      const close24 = to24Hour(today.closes_at);
      let isOpen = false;

      if (!today.overnight) {
        isOpen = currentTime >= open24 && currentTime <= close24;
      } else {
        isOpen = currentTime >= open24 || currentTime <= close24;
      }

      return {
        label: "Day Wise Schedule",
        isOpen,
        description: `${today.opens_at} – ${today.closes_at}`,
        weeklySchedule: schedule.days,
      };
    }

    return null;
  };

  // --- Renders ---
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" color="#3b82f6" message="Loading location..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-red-500 mb-4">
            <MapPin className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Location not found</h2>
          <p className="text-gray-600">This washroom doesn&apos;t exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const availabilityInfo = getAvailabilityInfo();

  return (
    <div className="min-h-screen washroom-page">
      {/* Header Navigation - Cleaned up to only show Back button */}
     <div 
     className="md:mt-[-12px]"
     style={{ background: "var(--washroom-surface)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-2">
          <button
            onClick={() => router.push(`/washrooms?companyId=${finalCompanyId}`)}
            className="inline-flex items-center text-sm font-medium transition-all group border px-4 py-2 rounded-lg cursor-pointer"
            style={{ 
              color: "var(--washroom-subtitle)",
              borderColor: "var(--washroom-border)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--washroom-primary)";
              e.currentTarget.style.borderColor = "var(--washroom-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--washroom-subtitle)";
              e.currentTarget.style.borderColor = "var(--washroom-border)";
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to listings
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-3 pb-8">
        <div className="bg-[var(--washroom-surface)] border border-[var(--washroom-border)] shadow-[var(--washroom-shadow)] rounded-lg mb-6 sm:mb-8">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* Left Column - Image */}
              <div className="space-y-3 sm:space-y-4">
                <div
                  className="aspect-video w-full rounded-lg overflow-hidden border"
                  style={{
                    background: "var(--washroom-input-bg)",
                    borderColor: "var(--washroom-border)",
                  }}
                >
                  <img
                    src={
                      location.images?.[0] ||
                      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                    }
                    alt={location.name}
                    className="w-full h-full object-cover cursor-pointer transition-opacity hover:opacity-90"
                    onClick={() => location.images?.[0] && setSelectedImageIndex(0)}
                  />
                </div>

                {location.images && location.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {location.images.slice(1, 5).map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer transition-opacity border hover:opacity-90"
                        style={{
                          background: "var(--washroom-input-bg)",
                          borderColor: "var(--washroom-border)",
                        }}
                        onClick={() => setSelectedImageIndex(idx + 1)}
                      >
                        <img src={img} alt={`Location ${idx + 2}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {availabilityInfo && (
                  <div
                    className="rounded-lg border p-3"
                    style={{
                      background: "var(--washroom-input-bg)",
                      borderColor: "var(--washroom-border)",
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-[var(--washroom-subtitle)]">Availability</p>
                        <p className="text-sm font-semibold text-[var(--washroom-title)]">
                          {availabilityInfo.label}
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={
                          availabilityInfo.isOpen
                            ? { background: "var(--washroom-status-active-bg)", color: "var(--washroom-status-active-text)" }
                            : { background: "var(--washroom-status-inactive-bg)", color: "var(--washroom-status-inactive-text)" }
                        }
                      >
                        {availabilityInfo.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--washroom-subtitle)] mb-2">
                      {availabilityInfo.description}
                    </p>
                    {availabilityInfo.weeklySchedule && (
                      <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                        {Object.entries(availabilityInfo.weeklySchedule).map(([day, value]) => (
                          <React.Fragment key={day}>
                            <span className="capitalize text-[var(--washroom-subtitle)]">{day.slice(0, 3)}</span>
                            <span className={value.open ? "text-right text-[var(--washroom-title)]" : "text-right text-gray-400"}>
                              {value.open ? `${value.opens_at} – ${value.closes_at}` : "Closed"}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-[var(--washroom-title)]">
                    {location.name}
                  </h1>

                  <div className="space-y-2 sm:space-y-3 text-sm sm:text-base text-[var(--washroom-text)]">
                    {location.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-[var(--washroom-subtitle)]" />
                        <span>{location.address}</span>
                      </div>
                    )}

                    {location.location_types && (
                      <div
                        className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg"
                        style={{
                          background: "var(--washroom-input-bg)",
                          border: "1px solid var(--washroom-border)",
                        }}
                      >
                        <div className="flex-shrink-0">
                          <div
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center"
                            style={{ background: "var(--washroom-score-bg)" }}
                          >
                            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--washroom-score-text)]" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-medium uppercase tracking-wide text-[var(--washroom-subtitle)]">
                            Location Hierarchy / Zone
                          </span>
                          <span className="text-sm font-semibold mt-0.5 text-[var(--washroom-title)]">
                            {location.location_types.name}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm">
                      {location.city && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[var(--washroom-title)]">City:</span>
                          <span>{location.city}</span>
                        </div>
                      )}
                      {location.state && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[var(--washroom-title)]">State:</span>
                          <span>{location.state}</span>
                        </div>
                      )}
                      {location.pincode && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[var(--washroom-title)]">Pincode:</span>
                          <span>{location.pincode}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--washroom-subtitle)]">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span>Created on {formatDate(location.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 sm:mt-8">
                  {renderLocationOptions(location.options)}
                </div>

              {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => handleViewLocation(location.latitude, location.longitude)}
                    className="flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-colors"
                    style={{
                      color: "var(--washroom-primary)",
                      border: "1px solid var(--washroom-primary)",
                      background: "transparent",
                    }}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Locate on Map
                  </button>

                  {canEditLocation && (
                    <button
                      onClick={handleEdit}
                      className="flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-colors hover:opacity-90"
                      style={{
                        background: "var(--washroom-primary)",
                        color: "var(--washroom-primary-text)",
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  )}

                  {canDeleteLocation && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg transition-colors hover:opacity-90"
                      style={{
                        background: "var(--washroom-delete-bg)",
                        color: "#fff",
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  )}
                </div>

                {location.no_of_photos && (
                  <div
                    className="mt-4 flex items-start gap-2 sm:gap-3 p-3 rounded-r-lg"
                    style={{
                      background: "var(--washroom-input-bg)",
                      borderLeft: "4px solid var(--washroom-primary)",
                      borderTop: "1px solid var(--washroom-border)",
                      borderRight: "1px solid var(--washroom-border)",
                      borderBottom: "1px solid var(--washroom-border)",
                    }}
                  >
                    <Camera
                      className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5"
                      style={{ color: "var(--washroom-primary)" }}
                    />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--washroom-title)]">
                        Photo Upload Limit
                      </p>
                      <p className="text-xs text-[var(--washroom-subtitle)] mt-0.5">
                        Minimum <span className="font-bold text-[var(--washroom-title)]">{location.no_of_photos}</span> photos can be uploaded
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {renderUsageCategory(location.usage_category)}

     {/* --- Side-by-Side: Assigned Cleaners & Review Stats (SINGLE OUTER BOX) --- */}
        <div className="bg-[var(--washroom-surface)] border border-[var(--washroom-border)] shadow-[var(--washroom-shadow)] rounded-lg mb-6 sm:mb-8 p-4 sm:p-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* LEFT: Assigned Cleaners (Inner Box) */}
            <div className="border border-[var(--washroom-border)] rounded-xl p-4 sm:p-6 flex flex-col">
              {renderAssignedUsers(location.cleaner_assignments)}
            </div>

            {/* RIGHT: Review Statistics (Inner Box) */}
            <div className="border border-[var(--washroom-border)] rounded-xl p-4 sm:p-6 flex flex-col">
              <h2 className="text-lg font-semibold text-[var(--washroom-title)] mb-4">
                Review Statistics
              </h2>
              
              <div className="flex flex-col gap-4">
                
                {/* User Reviews */}
                <div
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{
                    background: "var(--washroom-score-bg)",
                    border: "1px solid var(--washroom-border)",
                  }}
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "var(--washroom-score-text)" }}
                    >
                      <User className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    {userReviewAverage ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          {renderStars(parseFloat(userReviewAverage))}
                        </div>
                        <div className="text-2xl font-bold text-[var(--washroom-title)]">
                          {userReviewAverage}/10
                        </div>
                        <p className="text-xs text-[var(--washroom-subtitle)]">
                          {userReviewCount} User {userReviewCount === 1 ? "Review" : "Reviews"}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-[var(--washroom-title)]">N/A</div>
                        <p className="text-xs text-[var(--washroom-subtitle)]">
                          {userReviewCount} User {userReviewCount === 1 ? "Review" : "Reviews"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Cleaner Reviews */}
                <div
                  className="flex items-center gap-4 p-4 rounded-lg"
                  style={{
                    background: "var(--washroom-input-bg)",
                    border: "1px solid var(--washroom-border)",
                  }}
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: "var(--washroom-status-active-text)" }}
                    >
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    {cleanerReviewStats?.average_score ? (
                      <>
                        <div className="flex items-center gap-2 mb-1">
                          {renderStars(parseFloat(cleanerReviewStats.average_score))}
                        </div>
                        <div className="text-2xl font-bold text-[var(--washroom-title)]">
                          {parseFloat(cleanerReviewStats.average_score).toFixed(1)}/10
                        </div>
                        <p className="text-xs text-[var(--washroom-subtitle)]">
                          {cleanerReviewCount} Cleaner {cleanerReviewCount === 1 ? "Review" : "Reviews"}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-2xl font-bold text-[var(--washroom-title)]">N/A</div>
                        <p className="text-xs text-[var(--washroom-subtitle)]">
                          {cleanerReviewCount} Cleaner {cleanerReviewCount === 1 ? "Review" : "Reviews"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section with Tabs */}
       <div className="bg-[var(--washroom-surface)] border border-[var(--washroom-border)] shadow-[var(--washroom-shadow)] rounded-lg">
          <div className="border-b" style={{ borderColor: "var(--washroom-border)" }}>
            <div className="flex">
              <button
                onClick={() => setActiveTab("user")}
                className="flex-1 px-6 py-4 text-center font-medium transition-colors"
                style={
                  activeTab === "user"
                    ? { color: "var(--washroom-score-text)", borderBottom: "2px solid var(--washroom-score-text)" }
                    : { color: "var(--washroom-subtitle)" }
                }
              >
                User Reviews ({userReviewCount})
              </button>
              <button
                onClick={() => setActiveTab("cleaner")}
                className="flex-1 px-6 py-4 text-center font-medium transition-colors"
                style={
                  activeTab === "cleaner"
                    ? { color: "var(--washroom-score-text)", borderBottom: "2px solid var(--washroom-score-text)" }
                    : { color: "var(--washroom-subtitle)" }
                }
              >
                Cleaner Reviews ({cleanerReviewCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {/* USER REVIEWS TAB */}
            {activeTab === "user" && (
              <>
                {location.ReviewData && location.ReviewData.length > 0 ? (
                  location.ReviewData.map((review) => (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/user-activity/${review.id}?companyId=${finalCompanyId}`)}
                      className="p-6 cursor-pointer transition-colors hover:bg-[var(--washroom-table-row-hover)]"
                      style={{ borderBottom: "1px solid var(--washroom-border)" }}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, var(--washroom-primary), var(--washroom-primary-hover))" }}
                        >
                          <User className="w-5 h-5 text-[var(--washroom-primary-text)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2 gap-3">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-sm font-medium text-[var(--washroom-title)] truncate">
                                {review.name}
                              </span>
                              <div className="flex items-center">{renderStars(review.rating)}</div>
                            </div>
                            <span className="text-sm text-[var(--washroom-subtitle)] whitespace-nowrap">
                              {formatDate(review.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--washroom-text)] mb-4">{review.description}</p>
                          {review.images && review.images.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-[var(--washroom-subtitle)]">
                                <Camera className="w-4 h-4 mr-1" />
                                {review.images.length} {review.images.length === 1 ? "photo" : "photos"}
                              </div>
                              <div className="flex space-x-2 overflow-x-auto">
                                {review.images.map((url, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer transition-opacity hover:opacity-90"
                                    style={{
                                      background: "var(--washroom-input-bg)",
                                      border: "1px solid var(--washroom-border)",
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(url, "_blank");
                                    }}
                                  >
                                    <img
                                      src={url}
                                      alt={`Review photo ${imgIndex + 1}`}
                                      className="w-full h-full object-cover"
                                      onLoad={() => handleImageLoad(`${review.id}-${imgIndex}`)}
                                      onError={() => handleImageError(`${review.id}-${imgIndex}`)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center" style={{ background: "var(--washroom-surface)" }}>
                    <MessageSquare className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--washroom-subtitle)" }} />
                    <h3 className="text-lg font-medium text-[var(--washroom-title)] mb-2">No user reviews yet</h3>
                    <p className="text-sm text-[var(--washroom-subtitle)]">Be the first to share your experience with this washroom.</p>
                  </div>
                )}
              </>
            )}

            {/* CLEANER REVIEWS TAB */}
            {activeTab === "cleaner" && (
              <>
                {cleanerReviews && cleanerReviews.length > 0 ? (
                  cleanerReviews.map((review) => (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/cleaners/${review.id}?companyId=${finalCompanyId}`)}
                      className="p-6 cursor-pointer transition-colors hover:bg-[var(--washroom-table-row-hover)]"
                      style={{ borderBottom: "1px solid var(--washroom-border)" }}
                    >
                      <div className="space-y-4">
                        {/* 1. Header (Name, Status, Score, Date) */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: "linear-gradient(135deg, var(--washroom-status-active-bg), var(--washroom-status-dot-active))" }}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-[var(--washroom-title)] truncate">
                                  {review.cleaner_user?.name || "Unknown Cleaner"}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-medium border"
                                  style={
                                    review.status === "completed"
                                      ? {
                                        background: "var(--washroom-status-active-bg)",
                                        color: "var(--washroom-status-active-text)",
                                        borderColor: "var(--washroom-status-active-border)",
                                      }
                                      : {
                                        background: "var(--washroom-status-inactive-bg)",
                                        color: "var(--washroom-status-inactive-text)",
                                        borderColor: "var(--washroom-status-inactive-border)",
                                      }
                                  }
                                >
                                  {review.status}
                                </span>
                                {review.score && (
                                  <span
                                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                                    style={{
                                      background: "var(--washroom-score-bg)",
                                      color: "var(--washroom-score-text)",
                                    }}
                                  >
                                    Score: {review.score}/10
                                  </span>
                                )}
                              </div>
                              {review.cleaner_user && (
                                <div className="text-xs text-[var(--washroom-subtitle)] flex flex-wrap gap-3">
                                  {review.cleaner_user.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {review.cleaner_user.email}
                                    </span>
                                  )}
                                  {review.cleaner_user.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {review.cleaner_user.phone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-[var(--washroom-subtitle)] whitespace-nowrap">
                            {formatDate(review.created_at)}
                          </span>
                        </div>

                        {/* 2. Flex Container to Split Left (Comments/Photos) and Right (Tasks) */}
                        <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-2">
                          
                          {/* Left Column: Comments & Photos */}
                          <div className="flex-1 space-y-4">
                            {(review.initial_comment || review.final_comment) && (
                              <div className="space-y-2 text-sm">
                                {review.initial_comment && (
                                  <div>
                                    <span className="font-medium text-[var(--washroom-title)]">Initial: </span>
                                    <span className="text-[var(--washroom-text)]">{review.initial_comment}</span>
                                  </div>
                                )}
                                {review.final_comment && (
                                  <div>
                                    <span className="font-medium text-[var(--washroom-title)]">Final: </span>
                                    <span className="text-[var(--washroom-text)]">{review.final_comment}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {(review.before_photo?.length > 0 || review.after_photo?.length > 0) && (
                              <div className="space-y-2">
                                <div className="flex items-center text-sm text-[var(--washroom-subtitle)]">
                                  <Camera className="w-4 h-4 mr-1" />
                                  Before & After Photos
                                </div>
                                <div className="flex space-x-3">
                                  {review.before_photo?.length > 0 && (
                                    <div className="flex flex-col items-center space-y-1">
                                      <div
                                        className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                                        style={{
                                          background: "var(--washroom-input-bg)",
                                          border: "2px solid var(--washroom-status-inactive-border)",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(review.before_photo[0], "_blank");
                                        }}
                                      >
                                        <img src={review.before_photo[0]} alt="Before cleaning" className="w-full h-full object-cover" />
                                      </div>
                                      <span className="text-xs text-[var(--washroom-subtitle)]">Before</span>
                                    </div>
                                  )}
                                  {review.after_photo?.length > 0 && (
                                    <div className="flex flex-col items-center space-y-1">
                                      <div
                                        className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                                        style={{
                                          background: "var(--washroom-input-bg)",
                                          border: "2px solid var(--washroom-status-active-border)",
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(review.after_photo[0], "_blank");
                                        }}
                                      >
                                        <img src={review.after_photo[0]} alt="After cleaning" className="w-full h-full object-cover" />
                                      </div>
                                      <span className="text-xs text-[var(--washroom-subtitle)]">After</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Tasks Completed */}
                          {review.tasks && review.tasks.length > 0 && (
                            <div className="w-full md:w-5/12 lg:w-1/3 xl:w-2/5">
                              <div
                                className="rounded-lg p-3 h-full"
                                style={{ background: "var(--washroom-input-bg)" }}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="w-4 h-4 text-[var(--washroom-status-active-text)]" />
                                  <span className="text-sm font-medium text-[var(--washroom-title)]">
                                    Tasks Completed ({review.tasks.length})
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {review.tasks.slice(0, 5).map((task, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-0.5 text-xs rounded-full border"
                                      style={{
                                        background: "var(--washroom-surface)",
                                        color: "var(--washroom-text)",
                                        borderColor: "var(--washroom-border)",
                                      }}
                                    >
                                      {task}
                                    </span>
                                  ))}
                                  {review.tasks.length > 5 && (
                                    <span
                                      className="px-2 py-0.5 text-xs rounded-full font-medium"
                                      style={{
                                        background: "var(--washroom-score-bg)",
                                        color: "var(--washroom-score-text)",
                                      }}
                                    >
                                      +{review.tasks.length - 5} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* 3. Footer (View Details) */}
                        <div className="flex justify-end text-sm pt-2">
                          <span className="flex items-center gap-1 text-[var(--washroom-score-text)]">
                            View Details <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center" style={{ background: "var(--washroom-surface)" }}>
                    <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--washroom-subtitle)" }} />
                    <h3 className="text-lg font-medium text-[var(--washroom-title)] mb-2">No cleaner reviews yet</h3>
                    <p className="text-sm text-[var(--washroom-subtitle)]">Cleaner reviews will appear here once available.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">Delete Location</h3>
                <p className="text-slate-600 text-xs sm:text-sm">This action cannot be undone</p>
              </div>
            </div>
            <div className="mb-5 sm:mb-6">
              <p className="text-sm sm:text-base text-slate-700">
                Are you sure you want to delete &quot;<strong className="font-semibold">{location?.name}</strong>&quot;? 
                This will permanently remove the location and all associated data.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                onClick={() => setDeleteModal({ open: false })}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150 font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed font-medium"
              >
                {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                {deleting ? "Deleting..." : "Delete Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {selectedImageIndex !== null && location?.images && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={location.images[selectedImageIndex]}
              alt={`Location image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg mx-auto"
              style={{ maxHeight: "90vh" }}
            />
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            {selectedImageIndex > 0 && (
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 cursor-pointer bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {selectedImageIndex < location.images.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 cursor-pointer bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">
                {selectedImageIndex + 1} of {location.images.length}
              </p>
            </div>
            <div className="sr-only">Press left/right arrow keys to navigate</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleLocation;