/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Activity,
  Star,
  AlertTriangle,
  AlertCircle,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";
import { useCleanerReviewById } from "@/features/cleaners/cleaners.queries";

/* ================= helpers ================= */

const cleanString = (str) =>
  str
    ? String(str)
      .replace(/^["'\s]+|["'\s,]+$/g, "")
      .trim()
    : "";

const getCompletionTime = (start, end) => {
  const diff = new Date(end) - new Date(start);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const getTimeElapsed = (start) => {
  const diff = Date.now() - new Date(start);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/* ================= PhotoModal Component ================= */

const PhotoModal = ({ photos, initialIndex = 0, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [photos, initialIndex]);

  const minSwipeDistance = 50;

  if (
    !photos ||
    ((!photos.before || photos.before.length === 0) &&
      (!photos.after || photos.after.length === 0))
  ) {
    return null;
  }

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

  const onTouchStart = (e) => {
    if (zoomLevel === 1) {
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
      ref={(el) => el?.focus()}
      className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 focus:outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110"
        title="Close (Esc)"
      >
        <X size={24} />
      </button>

      <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm font-medium z-20">
        {currentIndex + 1} / {allPhotos.length}
      </div>

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
          cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
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

        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-semibold text-lg shadow-lg ${currentPhoto.color === "blue" ? "bg-blue-500" : "bg-green-500"
            }`}
        >
          {currentPhoto.label}
        </div>
      </div>

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

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full md:hidden">
        Swipe left/right to navigate
      </div>

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

/* ================= page ================= */

export default function ReviewDetails() {
  useRequirePermission(MODULES.CLEANER_REVIEWS);

  const { id } = useParams();
  const router = useRouter();
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);

  /* ================= TanStack Query ================= */

  const { data, isLoading, isError, error } = useCleanerReviewById(id);

  /* ================= normalize review ================= */

  const review = useMemo(() => {
    const raw = data?.data.reviews?.[0];
    if (!raw) return null;

    return {
      ...raw,
      initial_comment: cleanString(raw.initial_comment),
      final_comment: cleanString(raw.final_comment),
    };
  }, [data]);

  /* ================= states ================= */

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: "var(--cleaner-bg)",
        }}
      >
        <div
          className="flex flex-col items-center text-center"
          style={{ color: "var(--cleaner-title)" }}
        >
          {/* Spinner */}
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mb-4"
            style={{
              borderColor: "var(--cleaner-kpi-value)",
              borderTopColor: "transparent",
            }}
          />

          {/* Title */}
          <p className="text-sm font-medium">Loading review</p>

          {/* Helper text */}
          <p
            className="text-xs mt-1"
            style={{ color: "var(--cleaner-subtitle)" }}
          >
            Fetching cleaning details and evidence
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    toast.error(error?.message || "Failed to load review");
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: "var(--cleaner-bg)",
          color: "var(--cleaner-title)",
        }}
      >
        <div
          className="max-w-md w-full text-center rounded-xl p-8"
          style={{
            background: "var(--cleaner-surface)",
            border: "1px solid var(--cleaner-border)",
            boxShadow: "var(--cleaner-shadow)",
          }}
        >
          {/* Icon */}
          <div
            className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "var(--cleaner-danger-bg)",
              border: "1px solid var(--cleaner-border)",
            }}
          >
            <AlertCircle
              size={22}
              style={{ color: "var(--cleaner-danger-text)" }}
            />
          </div>

          {/* Title */}
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--cleaner-title)" }}
          >
            Failed to load review
          </h2>

          {/* Description */}
          <p
            className="text-sm mb-6"
            style={{ color: "var(--cleaner-subtitle)" }}
          >
            We couldn’t fetch the cleaning review right now. This may be due to
            a network issue or a temporary server problem.
          </p>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                background: "var(--cleaner-primary-bg)",
                color: "var(--cleaner-primary-text)",
              }}
            >
              Try again
            </button>

            <button
              onClick={() => router.push("/cleaners")}
              className="px-4 py-2 rounded-lg text-sm font-medium transition"
              style={{
                background: "var(--cleaner-input-bg)",
                border: "1px solid var(--cleaner-border)",
                color: "var(--cleaner-title)",
              }}
            >
              Back to cleaner activity
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: "var(--cleaner-bg)",
          color: "var(--cleaner-title)",
        }}
      >
        <div
          className="max-w-md w-full text-center rounded-xl p-8"
          style={{
            background: "var(--cleaner-surface)",
            border: "1px solid var(--cleaner-border)",
            boxShadow: "var(--cleaner-shadow)",
          }}
        >
          {/* Icon */}
          <div
            className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: "var(--cleaner-input-bg)",
              border: "1px solid var(--cleaner-border)",
            }}
          >
            <AlertTriangle
              size={22}
              style={{ color: "var(--cleaner-header-icon-fg)" }}
            />
          </div>

          {/* Title */}
          <h2
            className="text-lg font-semibold mb-2"
            style={{ color: "var(--cleaner-title)" }}
          >
            Review not found
          </h2>

          {/* Description */}
          <p
            className="text-sm mb-6"
            style={{ color: "var(--cleaner-subtitle)" }}
          >
            The cleaning review you’re looking for doesn’t exist or may have
            been removed.
          </p>

          {/* Action */}
          <button
            onClick={() => router.push("/cleaners")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              background: "var(--cleaner-input-bg)",
              border: "1px solid var(--cleaner-border)",
              color: "var(--cleaner-title)",
            }}
          >
            <ArrowLeft
              size={14}
              style={{ color: "var(--cleaner-header-icon-fg)" }}
            />
            Back to cleaner activity
          </button>
        </div>
      </div>
    );
  }

  const allImages = [
    ...(review.before_photo || []).map((url) => ({ url, type: "before" })),
    ...(review.after_photo || []).map((url) => ({ url, type: "after" })),
  ];

  const formatDateTime12Hr = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true // Forces 12-hour format with AM/PM
    });
  };

  /* ================= render ================= */

  return (
    <>
      <Toaster position="top-center" />

      {selectedImageIndex !== null && (
        <PhotoModal
          photos={{
            before: review.before_photo || [],
            after: review.after_photo || [],
          }}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}

      <div
        className="min-h-screen p-6"
        style={{
          background: "var(--cleaner-bg)",
          color: "var(--cleaner-title)",
        }}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ================= HEADER ================= */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--cleaner-surface)",
              border: "1px solid var(--cleaner-border)",
              boxShadow: "var(--cleaner-shadow)",
            }}
          >
            {/* Back button */}
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition mb-2"
              style={{
                background: "var(--cleaner-input-bg)",
                border: "1px solid var(--cleaner-border)",
                color: "var(--cleaner-title)",
              }}
            >
              <ArrowLeft
                size={14}
                style={{ color: "var(--cleaner-header-icon-fg)" }}
              />
              Back to cleaner activity
            </button>

            {/* Title + Score */}
            <div className="flex flex-wrap items-center gap-3">
              <h1
                className="text-xl font-bold"
                style={{ color: "var(--cleaner-title)" }}
              >
                Cleaning Review – {review.cleaner_user?.name}
              </h1>

              <span
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: "var(--cleaner-status-active-bg)",
                  color: "var(--cleaner-status-active-text)",
                }}
              >
                {review.score}/10
              </span>
            </div>

            {/* Location */}
            <p
              className="flex items-center gap-2 text-sm mt-2"
              style={{ color: "var(--cleaner-subtitle)" }}
            >
              <MapPin
                size={14}
                style={{ color: "var(--cleaner-header-icon-fg)" }}
              />
              {review.location?.name}
            </p>
          </div>

          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ===== LEFT COLUMN ===== */}
            <div className="space-y-6">
              {/* ===== TASK DETAILS ===== */}
              <div
                className="rounded-xl p-5"
                style={{
                  background: "var(--cleaner-surface)",
                  border: "1px solid var(--cleaner-border)",
                  boxShadow: "var(--cleaner-shadow)",
                }}
              >
                <h3
                  className="font-semibold flex items-center gap-2 mb-3"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  <Activity
                    size={16}
                    style={{ color: "var(--cleaner-header-icon-fg)" }}
                  />
                  Task Details
                </h3>

                {/* STARTED TIME */}
                <p
                  className="text-sm"
                  style={{ color: "var(--cleaner-subtitle)" }}
                >
                  <strong>Started:</strong>{" "}
                  {formatDateTime12Hr(review.created_at)}
                </p>

                {/* ONGOING STATUS */}
                {review.status === "ongoing" && (
                  <p
                    className="text-sm mt-2 flex items-center gap-1"
                    style={{ color: "var(--cleaner-primary-text)" }}
                  >
                    <Clock
                      size={14}
                      style={{ color: "var(--cleaner-header-icon-fg)" }}
                    />
                    Running for {getTimeElapsed(review.created_at)}
                  </p>
                )}

                {/* COMPLETED STATUS */}
                {review.status === "completed" && (
                  <div className="mt-2 space-y-1">
                    {/* Optional: Show exact completed timestamp */}
                    <p className="text-sm" style={{ color: "var(--cleaner-subtitle)" }}>
                      <strong>Completed:</strong>{" "}
                      {formatDateTime12Hr(review.updated_at)}
                    </p>

                    {/* Duration */}
                    <p
                      className="text-sm flex items-center gap-1"
                      style={{ color: "var(--cleaner-status-active-text)" }}
                    >
                      <CheckCircle
                        size={14}
                        style={{ color: "var(--cleaner-status-active-text)" }}
                      />
                      Completed in{" "}
                      {getCompletionTime(
                        review.created_at,
                        review.updated_at
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* ===== TASK REVIEW ===== */}
              <div
                className="rounded-xl p-5 space-y-4"
                style={{
                  background: "var(--cleaner-surface)",
                  border: "1px solid var(--cleaner-border)",
                  boxShadow: "var(--cleaner-shadow)",
                }}
              >
                <h3
                  className="font-semibold flex items-center gap-2"
                  style={{ color: "var(--cleaner-title)" }}
                >
                  <Star
                    size={16}
                    style={{ color: "var(--cleaner-header-icon-fg)" }}
                  />
                  Task Review
                </h3>

                {/* Status Row */}
                <div
                  className="rounded-lg p-4 flex items-center justify-between"
                  style={{
                    background: "var(--cleaner-input-bg)",
                    border: "1px solid var(--cleaner-border)",
                  }}
                >
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--cleaner-subtitle)" }}
                    >
                      CLEANING STATUS
                    </p>
                    <p
                      className="font-medium text-sm"
                      style={{ color: "var(--cleaner-title)" }}
                    >
                      {review.status === "completed"
                        ? "Inspected & Completed"
                        : "Work in Progress"}
                    </p>
                  </div>

                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      background: "var(--cleaner-primary-bg)",
                      color: "var(--cleaner-primary-text)",
                    }}
                  >
                    {review.score}/10
                  </span>
                </div>

                {review.initial_comment && (
                  <div>
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: "var(--cleaner-title)" }}
                    >
                      INITIAL OBSERVATION
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--cleaner-subtitle)" }}
                    >
                      {review.initial_comment}
                    </p>
                  </div>
                )}

                {review.final_comment && (
                  <div>
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: "var(--cleaner-title)" }}
                    >
                      POST-CLEANING NOTES
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--cleaner-subtitle)" }}
                    >
                      {review.final_comment}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT COLUMN ===== */}
            <div
              className="lg:col-span-2 rounded-xl p-5"
              style={{
                background: "var(--cleaner-surface)",
                border: "1px solid var(--cleaner-border)",
                boxShadow: "var(--cleaner-shadow)",
              }}
            >
              <h3
                className="font-semibold flex items-center gap-2 mb-4"
                style={{ color: "var(--cleaner-title)" }}
              >
                <ImageIcon
                  size={16}
                  style={{ color: "var(--cleaner-header-icon-fg)" }}
                />
                Visual Evidence ({allImages.length} Photos)
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {allImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setSelectedImageIndex(idx)}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-32 object-cover rounded-lg"
                      style={{
                        border: "1px solid var(--cleaner-border)",
                      }}
                    />

                    {/* BEFORE / AFTER badge */}
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded"
                      style={{
                        background:
                          img.type === "before"
                            ? "var(--cleaner-input-bg)"
                            : "var(--cleaner-primary-bg)",
                        color:
                          img.type === "before"
                            ? "var(--cleaner-subtitle)"
                            : "var(--cleaner-primary-text)",
                        border:
                          img.type === "before"
                            ? "1px solid var(--cleaner-border)"
                            : "none",
                      }}
                    >
                      {img.type.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}