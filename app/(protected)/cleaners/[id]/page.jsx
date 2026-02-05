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
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading review…
      </div>
    );
  }

  if (isError) {
    toast.error(error?.message || "Failed to load review");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Failed to load review
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Review not found
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

      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* ================= HEADER ================= */}
          <div className="bg-[var(--surface)] border border-border rounded-xl p-5">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-primary mb-3"
            >
              <ArrowLeft size={16} />
              Back to cleaner activity
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold">
                Cleaning Review – {review.cleaner_user?.name}
              </h1>

              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-primary">
                {review.score}/10
              </span>
            </div>

            <p className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
              <MapPin size={14} />
              {review.location?.name}
            </p>
          </div>

          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ===== LEFT COLUMN ===== */}
            <div className="space-y-6">
              {/* Task Details */}
              <div className="bg-[var(--surface)] border border-border rounded-xl p-5">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <Activity size={16} />
                  Task Details
                </h3>

                <p className="text-sm text-muted-foreground">
                  <strong>Started:</strong>{" "}
                  {new Date(review.created_at).toLocaleString()}
                </p>

                {review.status === "ongoing" && (
                  <p className="text-sm text-primary mt-2">
                    <Clock size={14} className="inline mr-1" />
                    Running for {getTimeElapsed(review.created_at)}
                  </p>
                )}

                {review.status === "completed" && (
                  <p className="text-sm text-emerald-600 mt-2">
                    <CheckCircle size={14} className="inline mr-1" />
                    Completed in{" "}
                    {getCompletionTime(review.created_at, review.updated_at)}
                  </p>
                )}
              </div>

              {/* Task Review */}
              <div className="bg-[var(--surface)] border border-border rounded-xl p-5 space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Star size={16} />
                  Task Review
                </h3>

                <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      CLEANING STATUS
                    </p>
                    <p className="font-medium text-sm">
                      {review.status === "completed"
                        ? "Inspected & Completed"
                        : "Work in Progress"}
                    </p>
                  </div>

                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[color-mix(in srgb,var(--primary) 15%,transparent)] text-primary">
                    {review.score}/10
                  </span>
                </div>

                {review.initial_comment && (
                  <div>
                    <p className="text-xs font-semibold mb-1">
                      INITIAL OBSERVATION
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.initial_comment}
                    </p>
                  </div>
                )}

                {review.final_comment && (
                  <div>
                    <p className="text-xs font-semibold mb-1">
                      POST-CLEANING NOTES
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {review.final_comment}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ===== RIGHT COLUMN ===== */}
            <div className="lg:col-span-2 bg-[var(--surface)] border border-border rounded-xl p-5">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <ImageIcon size={16} />
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
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <span
                      className={`absolute top-2 left-2 px-2 py-0.5 text-xs font-semibold rounded ${
                        img.type === "before"
                          ? "bg-muted text-muted-foreground"
                          : "bg-[color-mix(in srgb,var(--primary) 20%,transparent)] text-primary"
                      }`}
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
