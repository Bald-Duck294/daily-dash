"use client";

import { useState } from "react";
// import { useGetUserReviewsQuery } from "@/store/slices/reviewSlice";
// import { useUserReviews } from "@/features/users/review/reviews.queries";
import { useUserReviews } from "@/features/users/review/reviews.queries";
import { useRouter } from "next/navigation";
import { useCompanyId } from "@/providers/CompanyProvider";
import {
  MessageSquare,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Eye,
  RotateCcw,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

// Helper function to clean malformed strings
const cleanString = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/^["'\s]+|["'\s,]+$/g, "")
    .trim();
};

// Helper to get star rating color
const getRatingColor = (rating) => {
  if (rating >= 8) return "text-emerald-600";
  if (rating >= 5) return "text-amber-600";
  return "text-red-600";
};

// Helper to get star rating background
const getRatingBg = (rating) => {
  if (rating >= 8) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (rating >= 5) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-red-100 dark:bg-red-900/30";
};

// Skeleton component for loading state
const ReviewCardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
      <div className="w-16 h-8 bg-slate-200 rounded"></div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="w-20 h-20 bg-slate-200 rounded"></div>
      <div className="w-20 h-20 bg-slate-200 rounded"></div>
    </div>
    <div className="w-full h-4 bg-slate-200 rounded mb-2"></div>
    <div className="w-2/3 h-4 bg-slate-200 rounded"></div>
  </div>
);

export default function UserReviewsPage() {
  const router = useRouter();
  const [toiletId, setToiletId] = useState("");
  const [limit, setLimit] = useState(50);
  const { companyId } = useCompanyId();

  // Fetch reviews using Tanstack Query
  const { data, isLoading, isError, error, refetch, isFetching } =
    useUserReviews({
      ...(toiletId && { toilet_id: toiletId }),
      limit,
      company_id: companyId,
    });

  console.log("data", data);

  const handleReset = () => {
    setToiletId("");
    setLimit(50);
    toast.success("Filters reset");
  };

  const handleCardClick = (userId) => {
    router.push(`/users/${userId}/activity?companyId=${companyId}`);
  };

  // Show loader while fetching
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" color="#3b82f6" message="Loading reviews..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error: {error?.response?.data?.error || "Failed to load reviews"}
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { reviews, count } = data || { reviews: [], count: 0 };

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">User Reviews</h1>
              </div>
              <div className="text-sm text-muted-foreground">
                Total Reviews: <span className="font-bold">{count}</span>
              </div>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[var(--surface)] border border-border rounded-lg p-4 animate-pulse"
                >
                  <div className="h-5 bg-muted rounded mb-3" />
                  <div className="flex gap-2 mb-3">
                    <div className="w-20 h-20 bg-muted rounded" />
                    <div className="w-20 h-20 bg-muted rounded" />
                  </div>
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-4 w-2/3 bg-muted rounded" />
                </div>
              ))
            ) : reviews.length > 0 ? (
              reviews.map((review) => {
                const displayImages = review.images?.slice(0, 2) || [];

                return (
                  <div
                    key={review.id}
                    onClick={() => handleCardClick(review.user_id)}
                    className="bg-[var(--surface)] border border-border rounded-lg p-4 cursor-pointer transition hover:shadow-md"
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold">
                          {cleanString(review.name) || "Anonymous"}
                        </h3>
                        {review.toilet_id && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Toilet Name: {review?.location?.name || "unknown"}
                          </p>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-md ${getRatingBg(
                          review.rating,
                        )}`}
                      >
                        <Star
                          size={14}
                          className={`${getRatingColor(review.rating)} fill-current`}
                        />
                        <span
                          className={`text-sm font-bold ${getRatingColor(
                            review.rating,
                          )}`}
                        >
                          {review.rating}/10
                        </span>
                      </div>
                    </div>

                    {/* Images */}
                    {displayImages.length > 0 && (
                      <div className="flex gap-2 mb-3">
                        {displayImages.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Review ${index + 1}`}
                            className="w-20 h-20 object-cover rounded border border-border"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ))}
                        {review.images?.length > 2 && (
                          <div className="w-20 h-20 bg-muted rounded border border-border flex flex-col items-center justify-center">
                            <ImageIcon
                              size={20}
                              className="text-muted-foreground"
                            />
                            <span className="text-xs text-muted-foreground mt-1">
                              +{review.images.length - 2}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Description */}
                    {review.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {cleanString(review.description)}
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                      {review.phone && (
                        <p className="flex items-center gap-2">
                          <Phone size={12} />
                          {cleanString(review.phone)}
                        </p>
                      )}
                      {review.email && (
                        <p className="flex items-center gap-2">
                          <Mail size={12} />
                          {cleanString(review.email)}
                        </p>
                      )}
                    </div>

                    {/* Date & Location */}
                    <div className="space-y-1 mb-3 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar size={12} />
                        {new Date(review.created_at).toLocaleString()}
                      </p>
                      {review.latitude && review.longitude && (
                        <p className="flex items-center gap-2">
                          <MapPin size={12} />
                          {review.latitude.toFixed(4)},{" "}
                          {review.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <div className="pt-3 border-t border-border">
                      <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:opacity-90 transition">
                        <Eye size={14} />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-[var(--surface)] border border-border rounded-lg py-16 text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold">No Reviews Found</h3>
                <p className="text-muted-foreground mt-2">
                  There are no reviews matching the current filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
