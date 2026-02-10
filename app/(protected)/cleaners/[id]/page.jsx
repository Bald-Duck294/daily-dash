/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect, useMemo } from "react";
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

  /* ================= keyboard navigation ================= */

  useEffect(() => {
    if (selectedImageIndex === null || !review) return;

    const handleKeyDown = (e) => {
      const allImages = [
        ...(review.before_photo || []),
        ...(review.after_photo || []),
      ];

      switch (e.key) {
        case "Escape":
          setSelectedImageIndex(null);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setSelectedImageIndex(
            selectedImageIndex > 0
              ? selectedImageIndex - 1
              : allImages.length - 1,
          );
          break;
        case "ArrowRight":
          e.preventDefault();
          setSelectedImageIndex(
            selectedImageIndex < allImages.length - 1
              ? selectedImageIndex + 1
              : 0,
          );
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [selectedImageIndex, review]);

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
          <p className="text-sm font-medium">
            Loading review
          </p>

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
            We couldn’t fetch the cleaning review right now.
            This may be due to a network issue or a temporary server problem.
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
            The cleaning review you’re looking for doesn’t exist or may have been
            removed.
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

  /* ================= render ================= */

  return (
    <>
      <Toaster position="top-center" />

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

                <p
                  className="text-sm"
                  style={{ color: "var(--cleaner-subtitle)" }}
                >
                  <strong>Started:</strong>{" "}
                  {new Date(review.created_at).toLocaleString()}
                </p>

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

                {review.status === "completed" && (
                  <p
                    className="text-sm mt-2 flex items-center gap-1"
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
                    className="relative cursor-pointer"
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
