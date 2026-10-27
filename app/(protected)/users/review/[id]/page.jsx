"use client";

import React, { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useUserReviewById } from "@/features/users/review/reviews.queries";
import { getReasonsList } from "@/features/users/review/reviewReasons";
import {
  ArrowLeft,
  User,
  Star,
  MapPin,
  Calendar,
  Phone,
  Mail,
  Hash,
  MessageSquare,
  Image as ImageIcon,
  Cpu,
  Eye,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  Tag,
  ShieldAlert,
  Clock,
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

// Rating badge color styles (adaptive for light & dark themes)
const getRatingColor = (rating) => {
  if (rating >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (rating >= 5) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
};

const getRatingBg = (rating) => {
  if (rating >= 8) return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
  if (rating >= 5) return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
  return "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400";
};

const getRatingLabel = (rating) => {
  if (rating >= 9) return "Excellent";
  if (rating >= 7) return "Good";
  if (rating >= 5) return "Average";
  if (rating >= 3) return "Poor";
  return "Terrible";
};

// Severity badge styling for reported issues
const getReasonBadgeStyle = (severity) => {
  switch (severity) {
    case "critical":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    case "high":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "medium":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "none":
    case "positive":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    default:
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  }
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case "critical":
      return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
    case "high":
      return <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />;
    case "medium":
      return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
    case "none":
    case "positive":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
    default:
      return <Tag className="w-4 h-4 text-blue-500 shrink-0" />;
  }
};

export default function SingleUserReviewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId: providerCompanyId } = useCompanyId();
  const id = params?.id;

  const [activeImage, setActiveImage] = useState(null);
  const [copiedToken, setCopiedToken] = useState(false);

  const { data: review, isLoading, isError, error } = useUserReviewById(id);

  // Determine active company ID and company-specific requirements (Company 95)
  const queryCompanyId = searchParams?.get("companyId");
  const activeCompanyId = String(queryCompanyId || providerCompanyId || review?.company_id || "");
  const isCompany95 = activeCompanyId === "95";

  const handleCopy = (text, label = "Item") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
    if (label === "Token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh] bg-background">
        <Loader size="large" color="var(--primary)" message="Loading review details..." />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="flex justify-center items-center h-[70vh] p-4 bg-background">
        <div className="text-center bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)] shadow-xl max-w-md w-full">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Review Not Found</h2>
          <p className="text-[var(--muted-foreground)] text-sm mb-6">
            {error?.response?.data?.error || "We could not find the review requested or an error occurred."}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition shadow-sm"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Parse reported reasons safely
  let rawReasonIds = review.reason_ids;
  if (typeof rawReasonIds === "string") {
    try {
      rawReasonIds = JSON.parse(rawReasonIds);
    } catch {
      rawReasonIds = [];
    }
  }
  const reportedReasons = getReasonsList(rawReasonIds);
  const hasIssues = reportedReasons.length > 0 && !reportedReasons.every((r) => r.id === 0);

  // Location details and washroom link
  const locationId = review.location_id || review.location?.id;
  const washroomUrl = locationId
    ? `/washrooms/item/${locationId}${activeCompanyId ? `?companyId=${activeCompanyId}` : ""}`
    : null;

  // Google Maps link if coordinates are present (only for non-company 95)
  const lat = review.latitude || review.location?.latitude;
  const lng = review.longitude || review.location?.longitude;
  const mapsUrl = !isCompany95 && lat && lng ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}` : null;

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8 transition-colors">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Header & Breadcrumb */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2.5 hover:bg-[var(--muted)] rounded-xl border border-[var(--border)] transition text-foreground"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mb-0.5">
                  <span
                    onClick={() => router.push(activeCompanyId ? `/users/review?companyId=${activeCompanyId}` : "/users/review")}
                    className="hover:underline cursor-pointer"
                  >
                    User Reviews
                  </span>
                  <span>/</span>
                  <span className="font-medium text-foreground">Review #{review.id}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  Review Details
                </h1>
              </div>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Token Number button (hidden for company 95) */}
              {!isCompany95 && review.token_number && (
                <button
                  onClick={() => handleCopy(review.token_number, "Token")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-foreground transition"
                  title="Copy Token Number"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="font-mono">#{review.token_number}</span>
                </button>
              )}

              {/* Open in Google Maps (hidden for company 95) */}
              {!isCompany95 && mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Map</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Option to Open Washroom */}
              {washroomUrl && (
                <button
                  onClick={() => router.push(washroomUrl)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm cursor-pointer"
                  title="Open Washroom Details"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Open Washroom</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT COLUMN: Reviewer & Location */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Reviewer Info Card */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-[var(--border)]">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shadow-inner">
                    {cleanString(review.name)?.[0]?.toUpperCase() || <User size={22} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-bold truncate text-foreground">
                      {cleanString(review.name) || "Anonymous User"}
                    </h2>
                    <span className="inline-block px-2 py-0.5 mt-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-[var(--muted)] text-[var(--muted-foreground)]">
                      Citizen Reviewer
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  {review.phone ? (
                    <div className="flex items-center justify-between group p-2 rounded-xl hover:bg-[var(--muted)] transition">
                      <div className="flex items-center gap-2.5 text-[var(--muted-foreground)]">
                        <Phone className="w-4 h-4 text-primary" />
                        <a
                          href={`tel:${cleanString(review.phone)}`}
                          className="font-medium text-foreground hover:underline"
                        >
                          {cleanString(review.phone)}
                        </a>
                      </div>
                      <button
                        onClick={() => handleCopy(cleanString(review.phone), "Phone number")}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-foreground transition"
                        title="Copy phone"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-[var(--muted-foreground)] p-2">
                      <Phone className="w-4 h-4 opacity-40" />
                      <span className="text-xs opacity-60">No phone provided</span>
                    </div>
                  )}

                  {review.email ? (
                    <div className="flex items-center justify-between group p-2 rounded-xl hover:bg-[var(--muted)] transition">
                      <div className="flex items-center gap-2.5 text-[var(--muted-foreground)] min-w-0">
                        <Mail className="w-4 h-4 text-primary shrink-0" />
                        <a
                          href={`mailto:${cleanString(review.email)}`}
                          className="font-medium text-foreground hover:underline truncate"
                        >
                          {cleanString(review.email)}
                        </a>
                      </div>
                      <button
                        onClick={() => handleCopy(cleanString(review.email), "Email address")}
                        className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-foreground transition shrink-0"
                        title="Copy email"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5 text-[var(--muted-foreground)] p-2">
                      <Mail className="w-4 h-4 opacity-40" />
                      <span className="text-xs opacity-60">No email provided</span>
                    </div>
                  )}

                  {/* Token Ref (hidden for company 95) */}
                  {!isCompany95 && review.token_number && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
                      <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                        <Hash className="w-4 h-4 text-primary" />
                        <span>Token Ref</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-foreground">
                        {review.token_number}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>Submitted</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Info Card */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-indigo-500" />
                    Facility & Location
                  </h3>
                  {/* Code badge (hidden for company 95) */}
                  {!isCompany95 && review.location?.code && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                      {review.location.code}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Washroom Name Box */}
                  <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-[10px] uppercase font-bold tracking-wider text-indigo-600/70 dark:text-indigo-400/70 mb-1">
                      Washroom Name
                    </p>
                    <p className="font-bold text-indigo-700 dark:text-indigo-300 text-lg">
                      {review.location?.name || "Washroom Facility"}
                    </p>

                    {/* Additional location details (hidden for company 95) */}
                    {!isCompany95 && (
                      <>
                        {(review.location?.city || review.location?.state) && (
                          <p className="text-xs text-indigo-600/80 dark:text-indigo-400/80 mt-1">
                            {[review.location?.city, review.location?.state].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {review.toilet_id && (
                          <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">
                            Toilet ID: <span className="font-mono font-medium">{String(review.toilet_id)}</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Option to Open Washroom */}
                  {washroomUrl && (
                    <button
                      onClick={() => router.push(washroomUrl)}
                      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition shadow-sm cursor-pointer"
                    >
                      <MapPin size={14} />
                      <span>Open Washroom</span>
                      <ExternalLink size={14} />
                    </button>
                  )}

                  {/* Lat/Long and Google Maps (hidden for company 95) */}
                  {!isCompany95 && lat && lng && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-[var(--muted)] p-2.5 rounded-xl border border-[var(--border)]">
                          <p className="text-[var(--muted-foreground)] mb-0.5 text-[10px] uppercase font-bold tracking-wider">
                            Latitude
                          </p>
                          <p className="font-mono text-foreground font-semibold">{Number(lat).toFixed(5)}</p>
                        </div>
                        <div className="bg-[var(--muted)] p-2.5 rounded-xl border border-[var(--border)]">
                          <p className="text-[var(--muted-foreground)] mb-0.5 text-[10px] uppercase font-bold tracking-wider">
                            Longitude
                          </p>
                          <p className="font-mono text-foreground font-semibold">{Number(lng).toFixed(5)}</p>
                        </div>
                      </div>

                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1.5 w-full py-2 px-3 text-xs font-semibold rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--muted)] text-foreground transition shadow-sm"
                        >
                          <MapPin size={14} className="text-red-500" />
                          <span>Open Coordinates on Google Maps</span>
                          <ExternalLink size={12} className="opacity-60" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Location Amenities (hidden for company 95) */}
                  {!isCompany95 && review.location?.options && (
                    <div className="pt-3 border-t border-[var(--border)]">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--muted-foreground)] mb-2">
                        Facility Features
                      </p>
                      <div className="flex flex-wrap gap-1.5 text-[11px]">
                        {review.location.options.is24Hours && (
                          <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-foreground border border-[var(--border)]">
                            24 Hours
                          </span>
                        )}
                        {review.location.options.hasAttendant && (
                          <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-foreground border border-[var(--border)]">
                            Attendant
                          </span>
                        )}
                        {review.location.options.hasSanitaryProducts && (
                          <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-foreground border border-[var(--border)]">
                            Sanitary Products
                          </span>
                        )}
                        {review.location.options.isPaid ? (
                          <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-foreground border border-[var(--border)]">
                            Paid Entry
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Free Entry
                          </span>
                        )}
                        {review.location.options.isHandicapAccessible && (
                          <span className="px-2 py-0.5 rounded-md bg-[var(--muted)] text-foreground border border-[var(--border)]">
                            Accessible
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Review Rating, Reasons, Comments & Photos */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* Core Review & Rating Card */}
              <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6 pb-6 border-b border-[var(--border)]">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-foreground text-lg">
                        Citizen Feedback Score
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[var(--muted-foreground)]">
                      <Calendar size={13} />
                      <span>{new Date(review.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}</span>
                    </div>
                  </div>

                  {/* Rating Badges */}
                  <div className="flex items-center gap-3">
                    <div className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border ${getRatingBg(review.rating)}`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">
                        User Rating
                      </span>
                      <div className="flex items-center gap-1.5">
                        <Star size={18} className={`${getRatingColor(review.rating)} fill-current`} />
                        <span className={`text-xl font-black ${getRatingColor(review.rating)}`}>
                          {review.rating}/10
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold mt-0.5 opacity-90">
                        {getRatingLabel(review.rating)}
                      </span>
                    </div>

                    {review.ai_score !== null && review.ai_score !== undefined && (
                      <div className={`flex flex-col items-center justify-center px-4 py-2.5 rounded-xl border ${getRatingBg(review.ai_score)}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-80">
                          AI Cleanliness Score
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Cpu size={18} className={getRatingColor(review.ai_score)} />
                          <span className={`text-xl font-black ${getRatingColor(review.ai_score)}`}>
                            {review.ai_score}/10
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold mt-0.5 opacity-90">
                          Automated Score
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* USER SELECTED REASONS SECTION */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-amber-500" />
                      <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">
                        Reported Issues & Feedback Reasons
                      </h4>
                    </div>
                    {hasIssues ? (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        {reportedReasons.length} {reportedReasons.length === 1 ? "Issue" : "Issues"} Selected
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        No Issues Flagged
                      </span>
                    )}
                  </div>

                  {hasIssues ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {reportedReasons.map((reason) => {
                        const badgeStyle = getReasonBadgeStyle(reason.severity);
                        return (
                          <div
                            key={reason.id}
                            className={`flex items-start gap-3 p-3.5 rounded-xl border ${badgeStyle} transition`}
                          >
                            <div className="mt-0.5">
                              {getSeverityIcon(reason.severity)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">
                                  {reason.category || "General"}
                                </span>
                                <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border border-current opacity-70">
                                  {reason.severity}
                                </span>
                              </div>
                              <p className="text-xs font-bold leading-snug">
                                {reason.text}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                          Washroom Reported in Good Condition
                        </p>
                        <p className="text-xs text-emerald-600/80 dark:text-emerald-400/80 mt-0.5">
                          The citizen did not report any hygiene, maintenance, or amenity issues.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Written Comment / Description */}
                <div>
                  <h4 className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-2.5">
                    Written Feedback / Comment
                  </h4>
                  {review.description ? (
                    <div className="p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm leading-relaxed text-foreground">
                      <div className="italic font-normal">
                        "{cleanString(review.description)}"
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-[var(--muted)]/50 border border-dashed border-[var(--border)] text-xs text-[var(--muted-foreground)] italic">
                      No additional written comment was submitted by the user.
                    </div>
                  )}
                </div>
              </div>

              {/* Uploaded Photos Gallery (hidden for company 95) */}
              {!isCompany95 && (
                <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-foreground text-lg">
                        Attached Photos
                      </h3>
                    </div>
                    {review.images && review.images.length > 0 && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                        {review.images.length} {review.images.length === 1 ? "Photo" : "Photos"}
                      </span>
                    )}
                  </div>

                  {review.images && review.images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {review.images.map((img, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActiveImage(img)}
                          className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] cursor-pointer shadow-sm hover:shadow-md transition"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img}
                            alt={`Review Photo ${idx + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                            <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md w-6 h-6" />
                          </div>
                          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white font-mono">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 flex flex-col items-center justify-center text-[var(--muted-foreground)] bg-[var(--muted)]/40 rounded-xl border border-dashed border-[var(--border)]">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-40" />
                      <p className="text-sm font-medium">No photos were uploaded with this review.</p>
                      <p className="text-xs opacity-70 mt-0.5">Citizens can optionally attach photos when reporting hygiene issues.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {!isCompany95 && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[var(--surface)] rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
              <span className="text-sm font-bold text-foreground">Review Photo Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={activeImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-foreground transition"
                  title="Open original"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => setActiveImage(null)}
                  className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-foreground transition"
                  title="Close preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/5 dark:bg-black/40 overflow-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage}
                alt="Enlarged review photo"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
