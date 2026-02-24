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
  TrendingUp,
  Clock,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Camera,
  ChevronLeft,
  ChevronRight,
  User,
  Layers,
  ThumbsUp,
  Share2,
  Car,
  Coins,
  Users,
  Baby,
  Accessibility,
  Package,
  UserCheck,
  Phone,
  Mail,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Wind,
  Trash2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import LocationsApi from "@/features/locations/locations.api";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { CleanerReviewApi } from "@/features/cleanerReview/cleanerReview.api";

import { useCompanyId } from "@/providers/CompanyProvider";
import { usePermissions } from "@/shared/hooks/usePermission";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";

const SingleLocation = () => {
  useRequirePermission(MODULES.LOCATIONS);

  const { canUpdate, canDelete } = usePermissions();
  const canEditLocation = canUpdate(MODULES.LOCATIONS);
  const canDeleteLocation = canDelete(MODULES.LOCATIONS);

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [allLocations, setAllLocations] = useState([]);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);
  const [activeTab, setActiveTab] = useState("user"); // 'user' or 'cleaner'
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    location: null,
  });
  const [deleting, setDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  const [cleanerReviews, setCleanerReviews] = useState([]);
  const [cleanerReviewStats, setCleanerReviewStats] = useState(null);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const urlCompanyId = searchParams.get("companyId");
  const finalCompanyId = companyId || urlCompanyId;

  const userReviewAverage = useMemo(() => {
    if (!location?.ReviewData || location?.ReviewData.length === 0) return null;

    const totalRating = location?.ReviewData.reduce(
      (sum, review) => sum + (review.rating || 0),
      0,
    );
    return (totalRating / location?.ReviewData.length).toFixed(1);
  }, [location?.ReviewData]);

  const userReviewCount = location?.ReviewData?.length || 0;
  const cleanerReviewCount = cleanerReviews.length || 0;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedImageIndex === null) return;

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
  }, [selectedImageIndex, location?.images?.length]);

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || !finalCompanyId) return;

      try {
        setLoading(true);

        const [locationResult, locationsResult, cleanerReviewsResult] =
          await Promise.all([
            LocationsApi.getLocationById(params.id, finalCompanyId),
            LocationsApi.getAllLocations(finalCompanyId),
            CleanerReviewApi.getCleanerReviewsByLocationId(
              params.id,
              finalCompanyId,
              10,
            ),
          ]);

        console.log(locationResult, "locatoin result");
        // console.log(locationsResult, "all loc")
        if (locationResult.success) {
          console.log(locationResult, "location result");
          setLocation(locationResult.data);
        } else {
          setError(locationResult.error);
        }

        if (locationsResult.success) {
          setAllLocations(locationsResult.data);
        }

        if (cleanerReviewsResult.success) {
          console.log("✅ Cleaner reviews loaded:", cleanerReviewsResult?.data);
          setCleanerReviews(cleanerReviewsResult.data?.reviews || []);
          setCleanerReviewStats(cleanerReviewsResult.data?.stats || null);
        } else {
          console.log(
            "No cleaner reviews or error:",
            cleanerReviewsResult.error,
          );
          setCleanerReviews([]);
          setCleanerReviewStats(null);
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

  const handleEdit = () => {
    router.push(
      `/washrooms/item/${params.id}/edit?companyId=${finalCompanyId}`,
    );
  };

  const handleDelete = () => {
    setDeleteModal({ open: true, location });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const result = await LocationsApi.deleteLocation(
        params.id,
        finalCompanyId,
        false,
      );

      if (result.success) {
        toast.success("Location deleted successfully");
        setTimeout(() => {
          router.push(`/washrooms?companyId=${finalCompanyId}`);
        }, 500);
      } else {
        toast.error(result.error || "Failed to delete location");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete location");
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, location: null });
    }
  };

  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  // Handler for previous image
  const handlePreviousImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  // Handler for next image
  const handleNextImage = (e) => {
    e.stopPropagation();
    if (selectedImageIndex < location.images.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };
  const getCurrentLocationIndex = () => {
    return allLocations.findIndex((loc) => loc.id === params.id);
  };

  const handlePrevious = async () => {
    const currentIndex = getCurrentLocationIndex();
    if (currentIndex > 0) {
      setNavigationLoading(true);
      const prevLocation = allLocations[currentIndex - 1];
      router.push(
        `/washrooms/item/${prevLocation.id}?companyId=${finalCompanyId}`,
      );
    }
  };

  const handleNext = async () => {
    const currentIndex = getCurrentLocationIndex();
    if (currentIndex < allLocations.length - 1) {
      setNavigationLoading(true);
      const nextLocation = allLocations[currentIndex + 1];
      router.push(
        `/washrooms/item/${nextLocation.id}?companyId=${finalCompanyId}`,
      );
    }
  };

  const getNavigationInfo = () => {
    const currentIndex = getCurrentLocationIndex();
    return {
      currentIndex,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < allLocations.length - 1,
      previousName:
        currentIndex > 0 ? allLocations[currentIndex - 1]?.name : null,
      nextName:
        currentIndex < allLocations.length - 1
          ? allLocations[currentIndex + 1]?.name
          : null,
    };
  };

  const handleImageLoad = (reviewId) => {
    setImageLoading((prev) => ({ ...prev, [reviewId]: false }));
  };

  const handleImageError = (reviewId) => {
    setImageLoading((prev) => ({ ...prev, [reviewId]: false }));
  };

  // const renderStars = (rating) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  //   const totalStars = 10;
  //   const emptyStars = totalStars - Math.ceil(rating);

  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(
  //       <Star key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />
  //     );
  //   }

  //   if (hasHalfStar) {
  //     stars.push(
  //       <div key="half" className="relative w-4 h-4">
  //         <Star className="w-4 h-4 text-gray-300 absolute" />
  //         <div className="overflow-hidden absolute" style={{ width: '50%' }}>
  //           <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
  //         </div>
  //       </div>
  //     );
  //   }

  //   for (let i = 0; i < emptyStars; i++) {
  //     stars.push(
  //       <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
  //     );
  //   }

  //   return <div className="flex items-center gap-0.5">{stars}</div>;
  // };

  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;

    const stars = [];

    // ✅ Auto-detect scale: if rating > 5, it's 10-point scale, else 5-point
    const isOutOf10 = rating > 5;
    const normalizedRating = isOutOf10 ? rating / 2 : rating; // Convert 10-point to 5-point

    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar =
      normalizedRating % 1 >= 0.25 && normalizedRating % 1 < 0.75;
    const totalStars = 5; // Always display 5 stars
    const emptyStars = totalStars - Math.ceil(normalizedRating);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-amber-400 fill-amber-400"
        />,
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <div className="overflow-hidden absolute" style={{ width: "50%" }}>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
        </div>,
      );
    }

    // Empty stars
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
      <span className="font-medium text-[var(--washroom-text)]">
        {label}
      </span>
      <span className="font-bold text-[var(--washroom-score-text)]">
        {value}
      </span>
    </div>
  );


  const renderUsageCategory = (usageCategory) => {
    if (!usageCategory || Object.keys(usageCategory).length === 0) {
      return null;
    }

    const genderData = [
      {
        key: "men",
        label: "Men",
      },
      {
        key: "women",
        label: "Women",
      },
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
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "var(--washroom-score-bg)",
                      }}
                    >
                      <Users className="w-4 h-4 text-[var(--washroom-score-text)]" />
                    </div>

                    <div>
                      <h4 className="font-semibold text-[var(--washroom-title)]">
                        {label}
                      </h4>
                      <p className="text-xs text-[var(--washroom-subtitle)]">
                        Total: {totalCount} facilities
                      </p>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="space-y-2">
                    {data.wc > 0 && (
                      <FacilityRow label="🚽 Western Toilet (WC)" value={data.wc} />
                    )}

                    {data.indian > 0 && (
                      <FacilityRow label="🚾 Indian Toilet" value={data.indian} />
                    )}

                    {data.urinals > 0 && (
                      <FacilityRow label="🧍 Urinals" value={data.urinals} />
                    )}

                    {data.shower > 0 && (
                      <FacilityRow label="🚿 Shower" value={data.shower} />
                    )}

                    {data.basin > 0 && (
                      <FacilityRow label="🚰 Basin" value={data.basin} />
                    )}

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
      isHandicapAccessible: {
        icon: Accessibility,
        label: "Wheelchair Accessible",
      },
      isStrictlyForHandicap: {
        icon: Accessibility,
        label: "Disabled Only",
      },
      hasBabyChangingStation: {
        icon: Baby,
        label: "Baby Changing",
      },
      hasSanitaryProducts: {
        icon: Package,
        label: "Sanitary Products",
      },
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
          {/* Gender Access */}
          {options.genderAccess &&
            Array.isArray(options.genderAccess) &&
            options.genderAccess.length > 0 &&
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

          {/* Other Options */}
          {Object.entries(options).map(([key, value]) => {
            if (key === "genderAccess") return null;
            if (!optionIcons[key]) return null;
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
    if (!assignedCleaners || assignedCleaners.length === 0) {
      return (
        <div
          className="rounded-lg p-4"
          style={{
            background: "var(--washroom-surface)",
            border: "1px solid var(--washroom-border)",
            boxShadow: "var(--washroom-shadow)",
          }}
        >
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-[var(--washroom-title)]">
            <UserCheck className="w-4 h-4 text-[var(--washroom-subtitle)]" />
            Assigned Cleaners
          </h3>

          <p className="text-sm text-[var(--washroom-subtitle)]">
            No user currently assigned to this location.
          </p>
        </div>
      );
    }

    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: "var(--washroom-surface)",
          border: "1px solid var(--washroom-border)",
          boxShadow: "var(--washroom-shadow)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-[var(--washroom-title)]">
            <UserCheck className="w-4 h-4 text-[var(--washroom-subtitle)]" />
            Assigned Cleaners ({assignedCleaners.length})
          </h3>

          <button
            onClick={() => {
              const params = new URLSearchParams({
                companyId: finalCompanyId,
                locationId: location.id,
                locationName: location.name,
              });
              router.push(`/assignments/cleaner?${params.toString()}`);
            }}
            className="text-xs font-medium flex items-center gap-1 transition-colors"
            style={{ color: "var(--washroom-primary)" }}
          >
            View All
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {assignedCleaners.map((assignment) => (
            <div
              key={assignment.id}
              className="flex items-center justify-between rounded-lg p-3"
              style={{
                background: "var(--washroom-input-bg)",
                border: "1px solid var(--washroom-border)",
              }}
            >
              {/* User Info */}
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

                  {/* Role */}
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

                  {/* Phone */}
                  {assignment.cleaner_user?.phone && (
                    <div className="text-xs mt-1 flex items-center gap-1 text-[var(--washroom-subtitle)]">
                      <Phone className="w-3 h-3" />
                      {assignment.cleaner_user.phone}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
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


  if (loading || navigationLoading) {
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Location not found
          </h2>
          <p className="text-gray-600">
            This washroom doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const navigationInfo = getNavigationInfo();

  const getAvailabilityInfo = () => {
    const schedule = location?.schedule;
    if (!schedule) return null;

    const now = new Date();
    const currentDay = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const currentTime = now.toTimeString().slice(0, 5); // HH:MM (24h)

    // 24 HOURS
    if (schedule.mode === "TWENTY_FOUR_HOURS") {
      return {
        label: "Open 24 Hours",
        isOpen: true,
        description: "Open all day, every day",
      };
    }

    // FIXED HOURS
    if (schedule.mode === "FIXED_HOURS") {
      const { opens_at, closes_at, overnight } = schedule;

      if (!opens_at || !closes_at) {
        return {
          label: "Fixed Hours",
          isOpen: false,
          description: "Hours not configured",
        };
      }

      // Convert stored 12h → 24h for comparison
      const to24Hour = (time12) => {
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

      const open24 = to24Hour(opens_at);
      const close24 = to24Hour(closes_at);

      let isOpen = false;

      if (!overnight) {
        isOpen = currentTime >= open24 && currentTime <= close24;
      } else {
        isOpen = currentTime >= open24 || currentTime <= close24;
      }

      return {
        label: "Fixed Hours",
        isOpen,
        description: `${opens_at} – ${closes_at}`,
      };
    }

    // DAY WISE
    if (schedule.mode === "DAY_WISE") {
      const today = schedule.days?.[currentDay];

      if (!today || !today.open) {
        return {
          label: "Day Wise Schedule",
          isOpen: false,
          description: "Closed Today",
        };
      }

      const to24Hour = (time12) => {
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


  const availabilityInfo = getAvailabilityInfo();



  return (
    <div className="min-h-screen washroom-page">

      {/* Header Navigation */}
      <div
        className="border-b"
        style={{
          background: "var(--washroom-surface)",
          borderColor: "var(--washroom-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            {/* Back Button */}
            <button
              onClick={() =>
                router.push(`/washrooms?companyId=${finalCompanyId}`)
              }
              className="
          flex items-center
          text-sm sm:text-base
          transition-colors
        "
              style={{
                color: "var(--washroom-subtitle)",
              }}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="hidden xs:inline">Back to listings</span>
              <span className="xs:hidden">Back</span>
            </button>

            {/* Navigation Controls */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 w-full sm:w-auto justify-end">
              {/* Previous */}
              <button
                onClick={handlePrevious}
                disabled={!navigationInfo.hasPrevious}
                className="
            flex items-center
            px-2 sm:px-3 py-1.5 sm:py-2
            rounded-lg
            text-xs sm:text-sm
            transition-colors
            disabled:opacity-50
            disabled:cursor-not-allowed
            border
          "
                style={{
                  background: "var(--washroom-surface)",
                  borderColor: "var(--washroom-border)",
                  color: "var(--washroom-text)",
                }}
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-0.5 sm:mr-1" />
                <span className="hidden md:inline max-w-24 truncate">
                  {navigationInfo.previousName}
                </span>
              </button>

              {/* Counter */}
              <span
                className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap border"
                style={{
                  background: "var(--washroom-input-bg)",
                  color: "var(--washroom-text)",
                  borderColor: "var(--washroom-border)",
                }}
              >
                {navigationInfo.currentIndex + 1} / {allLocations.length}
              </span>

              {/* Next */}
              <button
                onClick={handleNext}
                disabled={!navigationInfo.hasNext}
                className="
            flex items-center
            px-2 sm:px-3 py-1.5 sm:py-2
            rounded-lg
            text-xs sm:text-sm
            transition-colors
            disabled:opacity-50
            disabled:cursor-not-allowed
            border
          "
                style={{
                  background: "var(--washroom-surface)",
                  borderColor: "var(--washroom-border)",
                  color: "var(--washroom-text)",
                }}
              >
                <span className="hidden md:inline max-w-24 truncate">
                  {navigationInfo.nextName}
                </span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Info Card - Two Column Layout */}

        {/* Main Info Card - Fully Responsive */}
        <div className="bg-[var(--washroom-surface)] border border-[var(--washroom-border)] shadow-[var(--washroom-shadow)] rounded-lg
 mb-6 sm:mb-8">
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* Left Column - Image */}
              <div className="space-y-3 sm:space-y-4">
                {/* Main Image */}
                <div
                  className="
      aspect-video
      w-full
      rounded-lg
      overflow-hidden
      border
    "
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
                    className="
        w-full h-full object-cover
        cursor-pointer
        transition-opacity
        hover:opacity-90
      "
                    onClick={() =>
                      location.images?.[0] && setSelectedImageIndex(0)
                    }
                  />
                </div>

                {/* Thumbnail Grid */}
                {location.images && location.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {location.images.slice(1, 5).map((img, idx) => (
                      <div
                        key={idx}
                        className="
            aspect-square
            rounded-lg
            overflow-hidden
            cursor-pointer
            transition-opacity
            border
            hover:opacity-90
          "
                        style={{
                          background: "var(--washroom-input-bg)",
                          borderColor: "var(--washroom-border)",
                        }}
                        onClick={() => setSelectedImageIndex(idx + 1)}
                      >
                        <img
                          src={img}
                          alt={`Location ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
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
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-xs text-[var(--washroom-subtitle)]">
                          Availability
                        </p>
                        <p className="text-sm font-semibold text-[var(--washroom-title)]">
                          {availabilityInfo.label}
                        </p>
                      </div>

                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={
                          availabilityInfo.isOpen
                            ? {
                              background: "var(--washroom-status-active-bg)",
                              color: "var(--washroom-status-active-text)",
                            }
                            : {
                              background: "var(--washroom-status-inactive-bg)",
                              color: "var(--washroom-status-inactive-text)",
                            }
                        }
                      >
                        {availabilityInfo.isOpen ? "Open" : "Closed"}
                      </span>
                    </div>

                    {/* Today Summary */}
                    <p className="text-xs text-[var(--washroom-subtitle)] mb-2">
                      {availabilityInfo.description}
                    </p>

                    {/* Weekly Compact Grid */}
                    {availabilityInfo.weeklySchedule && (
                      <div className="grid grid-cols-2 gap-y-1 text-[11px]">
                        {Object.entries(availabilityInfo.weeklySchedule).map(
                          ([day, value]) => (
                            <React.Fragment key={day}>
                              <span className="capitalize text-[var(--washroom-subtitle)]">
                                {day.slice(0, 3)}
                              </span>

                              <span
                                className={
                                  value.open
                                    ? "text-right text-[var(--washroom-title)]"
                                    : "text-right text-gray-400"
                                }
                              >
                                {value.open
                                  ? `${value.opens_at} – ${value.closes_at}`
                                  : "Closed"}
                              </span>
                            </React.Fragment>
                          )
                        )}
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

                  {/* Address Section */}
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
                            style={{
                              background: "var(--washroom-score-bg)",
                            }}
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
                          <span className="font-medium text-[var(--washroom-title)]">
                            City:
                          </span>
                          <span>{location.city}</span>
                        </div>
                      )}
                      {location.state && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[var(--washroom-title)]">
                            State:
                          </span>
                          <span>{location.state}</span>
                        </div>
                      )}
                      {location.pincode && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-[var(--washroom-title)]">
                            Pincode:
                          </span>
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
                <div className="flex flex-col xs:flex-row flex-wrap gap-2 sm:gap-3">
                  <button
                    onClick={() =>
                      handleViewLocation(location.latitude, location.longitude)
                    }
                    className="
        flex items-center justify-center xs:justify-start
        px-4 py-2 sm:py-2.5
        text-sm sm:text-base
        rounded-lg
        transition-colors
      "
                    style={{
                      color: "var(--washroom-primary)",
                      border: "1px solid var(--washroom-primary)",
                      background: "transparent",
                    }}
                  >
                    <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                    Locate on Map
                  </button>

                  {canEditLocation && (
                    <button
                      onClick={handleEdit}
                      className="
          flex items-center justify-center xs:justify-start
          px-4 py-2 sm:py-2.5
          text-sm sm:text-base
          rounded-lg
          transition-colors
        "
                      style={{
                        background: "var(--washroom-primary)",
                        color: "var(--washroom-primary-text)",
                      }}
                    >
                      <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      Edit
                    </button>
                  )}

                  {canDeleteLocation && (
                    <button
                      onClick={handleDelete}
                      className="
          flex items-center justify-center xs:justify-start
          px-4 py-2 sm:py-2.5
          text-sm sm:text-base
          rounded-lg
          transition-colors
        "
                      style={{
                        background: "var(--washroom-delete-bg)",
                        color: "#fff",
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                      Delete
                    </button>
                  )}
                </div>

              </div>

            </div>

            {/* Amenities */}


            {/* Photo Upload Notice */}
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
                    Minimum{" "}
                    <span className="font-bold text-[var(--washroom-title)]">
                      {location.no_of_photos}
                    </span>{" "}
                    photos can be uploaded
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>
        {renderUsageCategory(location.usage_category)}

        {/* Assigned Cleaners */}
        <div className="bg-[var(--washroom-surface)] border border-[var(--washroom-border)] shadow-[var(--washroom-shadow)] rounded-lg
 mb-8 p-6">
          {renderAssignedUsers(location.cleaner_assignments)}
        </div>

        {/* Review Stats */}
        <div className="bg-[var(--washroom-surface)] border border-[var(--washroom-border)] shadow-[var(--washroom-shadow)] rounded-lg
 mb-6">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-[var(--washroom-title)]
 mb-4">
              Review Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    style={{
                      background: "var(--washroom-score-text)",
                    }}
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
                        {userReviewCount} User{" "}
                        {userReviewCount === 1 ? "Review" : "Reviews"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-[var(--washroom-title)]">
                        N/A
                      </div>
                      <p className="text-xs text-[var(--washroom-subtitle)]">
                        {userReviewCount} User{" "}
                        {userReviewCount === 1 ? "Review" : "Reviews"}
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
                    style={{
                      background: "var(--washroom-status-active-text)",
                    }}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex-1">
                  {cleanerReviewStats?.average_score ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(
                          parseFloat(cleanerReviewStats.average_score),
                        )}
                      </div>

                      <div className="text-2xl font-bold text-[var(--washroom-title)]">
                        {parseFloat(cleanerReviewStats.average_score).toFixed(1)}/10
                      </div>

                      <p className="text-xs text-[var(--washroom-subtitle)]">
                        Cleaner{" "}
                        {cleanerReviewCount === 1 ? "Review" : "Reviews"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-[var(--washroom-title)]">
                        N/A
                      </div>
                      <p className="text-xs text-[var(--washroom-subtitle)]">
                        {cleanerReviewCount} Cleaner{" "}
                        {cleanerReviewCount === 1 ? "Review" : "Reviews"}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>


            {/* Overall Hygiene Score - Keep as is */}
            {/* {location.averageRating && (
              <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Overall Hygiene Score</p>
                      <div className="flex items-center gap-2">
                        {renderStars(location.averageRating)}
                        <span className="text-lg font-bold text-gray-900">
                          {location.averageRating.toFixed(1)}/10
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {location.ratingCount} hygiene inspection{location.ratingCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>

        {/* Reviews Section with Tabs */}
        <div className="bg-[var(--washroom-surface)] border border-[var(--washroom-border)] shadow-[var(--washroom-shadow)] rounded-lg
">
          <div
            className="border-b"
            style={{ borderColor: "var(--washroom-border)" }}
          >
            <div className="flex">
              <button
                onClick={() => setActiveTab("user")}
                className="
        flex-1 px-6 py-4 text-center font-medium transition-colors
      "
                style={
                  activeTab === "user"
                    ? {
                      color: "var(--washroom-score-text)",
                      borderBottom: "2px solid var(--washroom-score-text)",
                    }
                    : {
                      color: "var(--washroom-subtitle)",
                    }
                }
              >
                User Reviews ({userReviewCount})
              </button>

              <button
                onClick={() => setActiveTab("cleaner")}
                className="
        flex-1 px-6 py-4 text-center font-medium transition-colors
      "
                style={
                  activeTab === "cleaner"
                    ? {
                      color: "var(--washroom-score-text)",
                      borderBottom: "2px solid var(--washroom-score-text)",
                    }
                    : {
                      color: "var(--washroom-subtitle)",
                    }
                }
              >
                Cleaner Reviews ({cleanerReviewCount})
              </button>
            </div>
          </div>


          <div className="divide-y divide-gray-200">
            {/* ========== USER REVIEWS TAB ========== */}
            {activeTab === "user" && (
              <>
                {location.ReviewData && location.ReviewData.length > 0 ? (
                  location.ReviewData.map((review) => (
                    <div
                      key={review.id}
                      onClick={() =>
                        router.push(
                          `/user-activity/${review.id}?companyId=${finalCompanyId}`,
                        )
                      }
                      className="
            p-6
            cursor-pointer
            transition-colors
            hover:bg-[var(--washroom-table-row-hover)]
          "
                      style={{
                        borderBottom: "1px solid var(--washroom-border)",
                      }}
                    >
                      <div className="flex items-start space-x-4">
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, var(--washroom-primary), var(--washroom-primary-hover))",
                          }}
                        >
                          <User className="w-5 h-5 text-[var(--washroom-primary-text)]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2 gap-3">
                            <div className="flex items-center space-x-2 min-w-0">
                              <span className="text-sm font-medium text-[var(--washroom-title)] truncate">
                                {review.name}
                              </span>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                            </div>

                            <span className="text-sm text-[var(--washroom-subtitle)] whitespace-nowrap">
                              {formatDate(review.created_at)}
                            </span>
                          </div>

                          {/* Review Text */}
                          <p className="text-sm text-[var(--washroom-text)] mb-4">
                            {review.description}
                          </p>

                          {/* Images */}
                          {review.images && review.images.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-[var(--washroom-subtitle)]">
                                <Camera className="w-4 h-4 mr-1" />
                                {review.images.length}{" "}
                                {review.images.length === 1 ? "photo" : "photos"}
                              </div>

                              <div className="flex space-x-2 overflow-x-auto">
                                {review.images.map((url, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="
                          relative
                          w-20 h-20
                          rounded-lg
                          overflow-hidden
                          flex-shrink-0
                          cursor-pointer
                          transition-opacity
                          hover:opacity-90
                        "
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
                                      onLoad={() =>
                                        handleImageLoad(`${review.id}-${imgIndex}`)
                                      }
                                      onError={() =>
                                        handleImageError(`${review.id}-${imgIndex}`)
                                      }
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
                  <div
                    className="p-12 text-center"
                    style={{
                      background: "var(--washroom-surface)",
                    }}
                  >
                    <MessageSquare
                      className="w-12 h-12 mx-auto mb-4"
                      style={{ color: "var(--washroom-subtitle)" }}
                    />
                    <h3 className="text-lg font-medium text-[var(--washroom-title)] mb-2">
                      No user reviews yet
                    </h3>
                    <p className="text-sm text-[var(--washroom-subtitle)]">
                      Be the first to share your experience with this washroom.
                    </p>
                  </div>
                )}
              </>
            )}


            {/* ========== CLEANER REVIEWS TAB ========== */}
            {activeTab === "cleaner" && (
              <>
                {cleanerReviews && cleanerReviews.length > 0 ? (
                  cleanerReviews.map((review) => (
                    <div
                      key={review.id}
                      onClick={() =>
                        router.push(
                          `/cleaners/${review.id}?companyId=${finalCompanyId}`,
                        )
                      }
                      className="
            p-6
            cursor-pointer
            transition-colors
            hover:bg-[var(--washroom-table-row-hover)]
          "
                      style={{
                        borderBottom: "1px solid var(--washroom-border)",
                      }}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start space-x-3 min-w-0">
                            {/* Avatar */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, var(--washroom-status-active-bg), var(--washroom-status-dot-active))",
                              }}
                            >
                              <Shield className="w-5 h-5 text-white" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-[var(--washroom-title)] truncate">
                                  {review.cleaner_user?.name || "Unknown Cleaner"}
                                </span>

                                {/* Status */}
                                <span
                                  className="px-2 py-0.5 rounded-full text-xs font-medium border"
                                  style={
                                    review.status === "completed"
                                      ? {
                                        background:
                                          "var(--washroom-status-active-bg)",
                                        color:
                                          "var(--washroom-status-active-text)",
                                        borderColor:
                                          "var(--washroom-status-active-border)",
                                      }
                                      : {
                                        background:
                                          "var(--washroom-status-inactive-bg)",
                                        color:
                                          "var(--washroom-status-inactive-text)",
                                        borderColor:
                                          "var(--washroom-status-inactive-border)",
                                      }
                                  }
                                >
                                  {review.status}
                                </span>

                                {/* Score */}
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

                              {/* Contact */}
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

                        {/* Comments */}
                        {(review.initial_comment || review.final_comment) && (
                          <div className="space-y-2 text-sm">
                            {review.initial_comment && (
                              <div>
                                <span className="font-medium text-[var(--washroom-title)]">
                                  Initial:
                                </span>{" "}
                                <span className="text-[var(--washroom-text)]">
                                  {review.initial_comment}
                                </span>
                              </div>
                            )}
                            {review.final_comment && (
                              <div>
                                <span className="font-medium text-[var(--washroom-title)]">
                                  Final:
                                </span>{" "}
                                <span className="text-[var(--washroom-text)]">
                                  {review.final_comment}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Before / After Images */}
                        {(review.before_photo?.length > 0 ||
                          review.after_photo?.length > 0) && (
                            <div className="space-y-2">
                              <div className="flex items-center text-sm text-[var(--washroom-subtitle)]">
                                <Camera className="w-4 h-4 mr-1" />
                                Before & After Photos
                              </div>

                              <div className="flex space-x-3">
                                {/* Before */}
                                {review.before_photo?.length > 0 && (
                                  <div className="flex flex-col items-center space-y-1">
                                    <div
                                      className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                                      style={{
                                        background: "var(--washroom-input-bg)",
                                        border:
                                          "2px solid var(--washroom-status-inactive-border)",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(review.before_photo[0], "_blank");
                                      }}
                                    >
                                      <img
                                        src={review.before_photo[0]}
                                        alt="Before cleaning"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="text-xs text-[var(--washroom-subtitle)]">
                                      Before
                                    </span>
                                  </div>
                                )}

                                {/* After */}
                                {review.after_photo?.length > 0 && (
                                  <div className="flex flex-col items-center space-y-1">
                                    <div
                                      className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer transition-opacity hover:opacity-90"
                                      style={{
                                        background: "var(--washroom-input-bg)",
                                        border:
                                          "2px solid var(--washroom-status-active-border)",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(review.after_photo[0], "_blank");
                                      }}
                                    >
                                      <img
                                        src={review.after_photo[0]}
                                        alt="After cleaning"
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <span className="text-xs text-[var(--washroom-subtitle)]">
                                      After
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Tasks */}
                        {review.tasks && review.tasks.length > 0 && (
                          <div
                            className="rounded-lg p-3"
                            style={{
                              background: "var(--washroom-input-bg)",
                            }}
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
                        )}

                        {/* CTA */}
                        <div className="flex justify-end text-sm">
                          <span className="flex items-center gap-1 text-[var(--washroom-score-text)]">
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="p-12 text-center"
                    style={{ background: "var(--washroom-surface)" }}
                  >
                    <Shield
                      className="w-12 h-12 mx-auto mb-4"
                      style={{ color: "var(--washroom-subtitle)" }}
                    />
                    <h3 className="text-lg font-medium text-[var(--washroom-title)] mb-2">
                      No cleaner reviews yet
                    </h3>
                    <p className="text-sm text-[var(--washroom-subtitle)]">
                      Cleaner reviews will appear here once available.
                    </p>
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
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
                  Delete Location
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-5 sm:mb-6">
              <p className="text-sm sm:text-base text-slate-700">
                Are you sure you want to delete &quot;
                <strong className="font-semibold">
                  {deleteModal.location?.name}
                </strong>
                &quot;? This will permanently remove the location and all associated
                data.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, location: null })}
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
                {deleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {deleting ? "Deleting..." : "Delete Location"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedImageIndex !== null && location.images && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Image */}
            <img
              src={location.images[selectedImageIndex]}
              alt={`Location image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg mx-auto"
              style={{ maxHeight: "90vh" }}
            />

            {/* Close Button */}
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>

            {/* Previous Button - ADD THIS */}
            {selectedImageIndex > 0 && (
              <button
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 cursor-pointer bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button - ADD THIS */}
            {selectedImageIndex < location.images.length - 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 cursor-pointer bg-black bg-opacity-50 rounded-full w-12 h-12 flex items-center justify-center"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">
                {selectedImageIndex + 1} of {location.images.length}
              </p>
            </div>

            {/* Keyboard Navigation - ADD THIS */}
            <div className="sr-only">
              Press left/right arrow keys to navigate
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleLocation;
