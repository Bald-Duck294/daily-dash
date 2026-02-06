/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect, useRef } from "react";
import { CleanerReviewApi } from "@/features/cleanerReview/cleanerReview.api";
import { useRouter, useSearchParams } from "next/navigation";
import { CompanyApi } from "@/features/companies/api/companies.api.js";
import toast, { Toaster } from "react-hot-toast";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { usePermissions } from "@/shared/hooks/usePermission";
import "../../../app/globals.css";

import {
  Search,
  Filter,
  Edit2,
  Save,
  Building2,
  X,
  Eye,
  Image as ImageIcon,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize2,
} from "lucide-react";
import { MODULES } from "@/shared/constants/permissions.js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
const getScoreColor = (score) => {
  if (score >= 8) return "text-green-600";
  if (score >= 5) return "text-orange-500";
  return "text-red-500";
};

const PhotoModal = ({ photos, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum swipe distance (in px)

  useEffect(() => {
    setCurrentIndex(0);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [photos]);

  const minSwipeDistance = 50;

  if (
    !photos ||
    ((!photos.before || photos.before.length === 0) &&
      (!photos.after || photos.after.length === 0))
  ) {
    return null;
  }

  // Combine all photos with labels
  const allPhotos = [
    ...(photos.before || []).map((url) => ({
      url,
      label: "Before",
      color: "blue",
    })),
    ...(photos.after || []).map((url) => ({
      url,
      label: "After",
      color: "green",
    })),
  ];

  const currentPhoto = allPhotos[currentIndex];

  // Navigation handlers
  const goToNext = () => {
    if (currentIndex < allPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetZoom();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetZoom();
    }
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e) => {
    if (zoomLevel === 1) {
      // Only allow swipe when not zoomed
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e) => {
    if (zoomLevel === 1) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || zoomLevel > 1) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    } else {
      resetZoom();
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Mouse drag handlers for panning
  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowLeft":
        goToPrevious();
        break;
      case "ArrowRight":
        goToNext();
        break;
      case "+":
      case "=":
        handleZoomIn();
        break;
      case "-":
      case "_":
        handleZoomOut();
        break;
      case "Escape":
        onClose();
        break;
      default:
        break;
    }
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110"
        title="Close (Esc)"
      >
        <X size={24} />
      </button>

      {/* Image Counter */}
      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm font-medium z-20">
        {currentIndex + 1} / {allPhotos.length}
      </div>

      {/* Main Image Container with Touch Support */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden pb-24"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          cursor:
            zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        <img
          src={currentPhoto.url}
          alt={`${currentPhoto.label} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transformOrigin: "center center",
          }}
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white"%3EImage not found%3C/text%3E%3C/svg%3E';
          }}
          draggable={false}
        />

        {/* Image Label Badge */}
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-semibold text-lg shadow-lg ${currentPhoto.color === "blue" ? "bg-blue-500" : "bg-green-500"
            }`}
        >
          {currentPhoto.label}
        </div>
      </div>

      {/* Navigation Buttons - Hidden on Mobile/Touch Devices */}
      {currentIndex > 0 && (
        <button
          onClick={goToPrevious}
          className="absolute cursor-pointer left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-20 hidden md:block"
          title="Previous (←)"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {currentIndex < allPhotos.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-20 hidden md:block"
          title="Next (→)"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Zoom Controls - Top Right Position to Avoid Overlap */}
      <div className="absolute right-4 top-20 flex flex-col items-center gap-3 bg-black bg-opacity-50 rounded-full px-3 py-4 z-20">
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          title="Zoom In (+)"
        >
          <ZoomIn size={22} />
        </button>

        <span className="text-white font-medium text-sm py-1">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          title="Zoom Out (-)"
        >
          <ZoomOut size={22} />
        </button>

        <div className="w-6 h-px bg-gray-600 my-1"></div>

        <button
          onClick={resetZoom}
          disabled={zoomLevel === 1}
          className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          title="Reset Zoom"
        >
          <Maximize2 size={20} />
        </button>
      </div>

      {/* Swipe Indicator for Mobile - Optional */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full md:hidden">
        Swipe left/right to navigate
      </div>

      {/* Thumbnail Strip - Compact Single Row at Bottom */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-60 rounded-lg p-2 max-w-[95vw] overflow-x-auto z-20 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {allPhotos.map((photo, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              resetZoom();
            }}
            className={`relative cursor-pointer flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-all ${idx === currentIndex
                ? photo.color === "blue"
                  ? "border-blue-500 ring-2 ring-blue-400"
                  : "border-green-500 ring-2 ring-green-400"
                : "border-gray-600 hover:border-gray-400"
              }`}
          >
            <img
              src={photo.url}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span
              className={`absolute top-0.5 left-0.5 ${photo.color === "blue" ? "bg-blue-500" : "bg-green-500"
                } text-white px-1.5 py-0.5 text-[10px] font-bold rounded`}
            >
              {photo.label[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const EditableScoreCell = ({
  review,
  onSave,
  autoEdit = false,
  isOngoing = false,
  canEdit = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [score, setScore] = useState(review.score || 0);
  const [isSaving, setIsSaving] = useState(false);

  // ✅ Auto-open edit mode if autoEdit is true
  useEffect(() => {
    if (autoEdit && review.status === "completed" && canEdit) {
      setIsEditing(true);
    }
  }, [autoEdit, review.status, canEdit]);

  const handleSave = async () => {
    if (score < 0 || score > 10) {
      toast.error("Score must be between 0 and 10");
      return;
    }

    setIsSaving(true);
    const result = await CleanerReviewApi.updateReviewScore(review.id, score);

    if (result.success) {
      toast.success("Score updated successfully!");
      onSave(review.id, score);
      setIsEditing(false);
    } else {
      toast.error(result.error || "Failed to update score");
    }
    setIsSaving(false);
  };

  const handleCancel = () => {
    setScore(review.score || 0);
    setIsEditing(false);
  };

  // ✅ Handle edit click with permission check
  const handleEditClick = () => {
    if (!canEdit) {
      toast.error("You don't have permission to edit scores");
      return;
    }
    if (isOngoing) {
      toast.error(
        `Cannot edit ongoing review for ${review.cleaner_user?.name || "cleaner"}. Please wait until it's completed.`,
      );
      return;
    }
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          max="10"
          step="0.1"
          value={score}
          onChange={(e) => setScore(parseFloat(e.target.value))}
          className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          autoFocus
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="cursor-pointer p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
          title="Save"
        >
          <Save size={16} />
        </button>
        <button
          onClick={handleCancel}
          disabled={isSaving}
          className="cursor-pointer p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          title="Cancel"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className={`font-semibold ${getScoreColor(review.score)}`}>
        {review.score?.toFixed(1) || "N/A"}
      </span>
      <button
        onClick={handleEditClick}
        className={`cursor-pointer p-1 rounded transition-colors ${!canEdit || isOngoing
            ? "text-slate-300 cursor-not-allowed"
            : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
          }`}
        title={
          !canEdit
            ? "No permission to edit"
            : isOngoing
              ? "Review in progress"
              : "Edit Score"
        }
        disabled={!canEdit || isOngoing}
      >
        <Edit2 size={14} />
      </button>
    </div>
  );
};

export default function ScoreManagement() {
  useRequirePermission({
    module: MODULES.SCORES,
    action: "view",
  });
  const [photoStartIndex, setPhotoStartIndex] = useState(0);
  const { canUpdate } = usePermissions();
  const canEditScores = canUpdate(MODULES.SCORE_MANAGEMENT);

  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewRefs = useRef({});
  const hasHandledNotification = useRef(false);

  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(null);

  /* ================= State ================= */

  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true); // ✅ FIXED

  const [companyFilter, setCompanyFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modifiedFilter, setModifiedFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  /* ================= Fetch Companies (FIXED) ================= */

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoadingCompanies(true);

    try {
      const res = await CompanyApi.getAllCompanies();

      // ✅ API returns RAW ARRAY
      if (Array.isArray(res?.data)) {
        setCompanies(res?.data);
      } else {
        console.error("❌ Unexpected companies response:", res?.data);
        setCompanies([]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch companies:", error);
      toast.error("Failed to load companies");
      setCompanies([]);
    } finally {
      setLoadingCompanies(false); // ✅ REQUIRED
    }
  };

  /* ================= Fetch Reviews ================= */

  useEffect(() => {
    if (companyFilter) fetchReviews();
  }, [companyFilter, dateFilter]);

  const fetchReviews = async () => {
    if (!companyFilter) return;

    setIsLoading(true);

    try {
      const response = await CleanerReviewApi.getAllCleanerReviews(
        { date: dateFilter },
        companyFilter,
      );

      if (!response.success || !Array.isArray(response.data)) {
        toast.error("Failed to load reviews");
        setReviews([]);
        return;
      }

      const normalized = response.data.map((r) => ({
        ...r,
        photos: {
          before: r.before_photo || [],
          after: r.after_photo || [],
        },
      }));

      setReviews(normalized);
    } catch (error) {
      console.error("Fetch reviews error:", error);
      toast.error("Something went wrong while loading reviews");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= Filter Reviews ================= */

  useEffect(() => {
    let filtered = [...reviews];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.cleaner_user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          r.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    if (modifiedFilter === "modified") {
      filtered = filtered.filter((r) => r.is_modified);
    } else if (modifiedFilter === "unmodified") {
      filtered = filtered.filter((r) => !r.is_modified);
    }

    if (scoreFilter === "high") {
      filtered = filtered.filter(
        (r) => typeof r.score === "number" && r.score >= 8,
      );
    } else if (scoreFilter === "medium") {
      filtered = filtered.filter(
        (r) => typeof r.score === "number" && r.score >= 5 && r.score <= 7,
      );
    } else if (scoreFilter === "low") {
      filtered = filtered.filter(
        (r) => typeof r.score === "number" && r.score < 5,
      );
    }

    setFilteredReviews(filtered);
  }, [reviews, searchTerm, statusFilter, modifiedFilter, scoreFilter]);

  /* ================= UI ================= */

  const openPhotoModal = (photos, index = 0) => {
    if (!photos) return;
    setSelectedPhotos(photos);
    setPhotoStartIndex(index);
    setIsPhotoModalOpen(true);
  };

  const PhotoPreviewCell = ({ photos, onOpen, onOpenAt }) => {
    if (!photos) return "—";

    const before = photos.before || [];
    const after = photos.after || [];

    const previews = [
      ...before.slice(0, 1).map((url, i) => ({ url, index: i })),
      ...after.slice(0, 1).map((url, i) => ({
        url,
        index: before.length + i,
      })),
    ];

    if (previews.length === 0) return "—";

    return (
      <div className="flex justify-center gap-2">
        {previews.map((img, i) => (
          <button
            key={i}
            onClick={() => onOpenAt(img.index)}
            className="relative w-10 h-10 rounded border overflow-hidden"
          >
            <img src={img.url} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    );
  };
  return (
    <>
      <Toaster position="top-center" />

      <div
        className="min-h-screen p-6"
        style={{ background: "var(--background)", color: "var(--foreground)" }}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8" style={{ color: "var(--primary)" }} />
            <h1 className="text-2xl font-bold">Score Management</h1>
          </div>

          {/* Filters Card */}
          <div
            className="rounded-xl border p-4 space-y-4"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted-foreground)" }}
              />
              <input
                placeholder="Search by cleaner name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border outline-none"
                style={{
                  background: "var(--report-input-bg)",
                  color: "var(--report-input-text)",
                  borderColor: "var(--report-input-border)",
                }}
              />
            </div>

            {/* Company + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <label
                  className="text-xs font-medium mb-1 flex gap-1"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  <Building2 size={14} /> Company
                </label>

                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>

                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <label
                  className="text-xs font-medium mb-1 block"
                  style={{ color: "var(--muted-foreground)" }}
                >
                  Date
                </label>

                <div className="relative">
                  <Calendar
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--muted-foreground)" }}
                  />
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg border"
                    style={{
                      background: "var(--report-input-bg)",
                      color: "var(--report-input-text)",
                      borderColor: "var(--report-input-border)",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Status / Scores / Range + Reset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-center">
              {/* Status */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                </SelectContent>
              </Select>

              {/* Modified */}
              <Select value={modifiedFilter} onValueChange={setModifiedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Scores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scores</SelectItem>
                  <SelectItem value="modified">Modified Only</SelectItem>
                  <SelectItem value="unmodified">Original Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Score Range */}
              <Select value={scoreFilter} onValueChange={setScoreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Scores Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Scores Range</SelectItem>
                  <SelectItem value="high">High (8–10)</SelectItem>
                  <SelectItem value="medium">Medium (5–7)</SelectItem>
                  <SelectItem value="low">Low (0–4)</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset */}
              <button
                className="px-4 py-2 rounded-lg"
                style={{ background: "var(--muted)", color: "var(--foreground)" }}
                onClick={() => {
                  setCompanyFilter("");
                  setDateFilter("");
                  setStatusFilter("all");
                  setModifiedFilter("all");
                  setScoreFilter("all");
                  setSearchTerm("");
                }}
              >
                Reset Filters
              </button>
            </div>
          </div>



          {/* Table */}
          <div
            className="hidden md:block rounded-xl border overflow-hidden"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead
                  style={{
                    background: "var(--muted)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <tr>
                    <th className="px-4 py-3 text-left">CLEANER</th>
                    <th className="px-4 py-3 text-left">LOCATION</th>
                    <th className="px-4 py-3 text-center">PHOTOS</th>
                    <th className="px-4 py-3 text-center">SCORE</th>
                    <th className="px-4 py-3 text-center">STATUS</th>
                    <th className="px-4 py-3 text-center">MODIFIED</th>
                    <th className="px-4 py-3 text-left">DATE/TIME</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReviews.map((review) => (
                    <tr key={review.id} className="border-t">
                      {/* CLEANER */}
                      <td className="px-4 py-4 font-medium">
                        {review.cleaner_user?.name || "—"}
                      </td>

                      {/* LOCATION */}
                      <td className="px-4 py-4">
                        {review.location?.name || "—"}
                      </td>

                      {/* PHOTOS */}
                      <td className="px-4 py-4 text-center">
                        <PhotoPreviewCell
                          photos={review.photos}
                          onOpenAt={(idx) => openPhotoModal(review.photos, idx)}
                        />
                      </td>

                      {/* SCORE (EditableScoreCell) */}
                      <td className="px-4 py-4 text-center">
                        <EditableScoreCell
                          review={review}
                          canEdit={canEditScores}
                          isOngoing={review.status !== "completed"}
                          onSave={(id, newScore) => {
                            setReviews((prev) =>
                              prev.map((r) =>
                                r.id === id
                                  ? { ...r, score: newScore, is_modified: true }
                                  : r,
                              ),
                            );
                          }}
                        />
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-4 text-center">
                        {review.status === "completed" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-green-700 bg-green-100">
                            <CheckCircle size={14} /> completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-yellow-700 bg-yellow-100">
                            <Clock size={14} /> ongoing
                          </span>
                        )}
                      </td>

                      {/* MODIFIED */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {!review.is_modified ? (
                            <AlertCircle
                              size={18}
                              className="text-orange-500"
                              title="Original Score"
                            />
                          ) : (
                            <CheckCircle
                              size={18}
                              className="text-green-500"
                              title="Modified"
                            />
                          )}
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="px-4 py-4">
                        {new Date(review.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Mobile Cards */}
        <div className="space-y-4 md:hidden">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border p-4 space-y-3"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold">
                    {review.cleaner_user?.name || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {review.location?.name || "—"}
                  </p>
                </div>

                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background:
                      review.status === "completed"
                        ? "rgba(34,197,94,.15)"
                        : "rgba(234,179,8,.15)",
                    color:
                      review.status === "completed"
                        ? "#16a34a"
                        : "#ca8a04",
                  }}
                >
                  {review.status}
                </span>
              </div>

              {/* Score */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Score</span>
                <EditableScoreCell
                  review={review}
                  canEdit={canEditScores}
                  isOngoing={review.status !== "completed"}
                  onSave={(id, newScore) => {
                    setReviews((prev) =>
                      prev.map((r) =>
                        r.id === id
                          ? { ...r, score: newScore, is_modified: true }
                          : r,
                      ),
                    );
                  }}
                />
              </div>

              {/* Photos */}
              <PhotoPreviewCell
                photos={review.photos}
                onOpenAt={(idx) => openPhotoModal(review.photos, idx)}
              />

              {/* Meta */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {review.is_modified ? "Modified" : "Original"}
                </span>
                <span>
                  {new Date(review.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {isPhotoModalOpen && selectedPhotos && (
        <PhotoModal
          photos={selectedPhotos}
          onClose={() => {
            setIsPhotoModalOpen(false);
            setSelectedPhotos(null);
          }}
        />
      )}
    </>
  );
}
