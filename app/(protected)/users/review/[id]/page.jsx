"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUserReviewById } from "@/features/users/review/reviews.queries";
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
  Eye
} from "lucide-react";
import Loader from "@/components/ui/Loader";

// Helper function to clean malformed strings
const cleanString = (str) => {
  if (!str) return "";
  return String(str).replace(/^["'\s]+|["'\s,]+$/g, "").trim();
};

const getRatingColor = (rating) => {
  if (rating >= 8) return "text-emerald-600";
  if (rating >= 5) return "text-amber-600";
  return "text-red-600";
};

const getRatingBg = (rating) => {
  if (rating >= 8) return "bg-emerald-100 dark:bg-emerald-900/30";
  if (rating >= 5) return "bg-amber-100 dark:bg-amber-900/30";
  return "bg-red-100 dark:bg-red-900/30";
};

export default function SingleUserReviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const { data: review, isLoading, isError, error } = useUserReviewById(id);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader size="large" color="#3b82f6" message="Loading review details..." />
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="text-center bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-red-600 mb-4 font-semibold text-lg">
            Error: {error?.response?.data?.error || "Failed to load review"}
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header & Back Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            Review Details
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LEFT COLUMN (Reviewer & Location) */}
          <div className="space-y-6 md:col-span-1">
            
            {/* Reviewer Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {cleanString(review.name) || "Anonymous User"}
                  </h2>
                  <p className="text-xs text-slate-500">Reviewer</p>
                </div>
              </div>
              
              <div className="space-y-4 text-sm text-slate-600">
                {review.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{cleanString(review.phone)}</span>
                  </div>
                )}
                {review.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="truncate">{cleanString(review.email)}</span>
                  </div>
                )}
                {review.token_number && (
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                      {review.token_number}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Location Info Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                Location
              </h3>
              <div className="space-y-4">
                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <p className="font-semibold text-indigo-900">
                    {review.location?.name || "Unknown Washroom"}
                  </p>
                  {review.toilet_id && (
                    <p className="text-xs text-indigo-700/70 mt-1">
                      ID: {review.toilet_id.toString()}
                    </p>
                  )}
                </div>
                
                {review.latitude && review.longitude && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <p className="text-slate-500 mb-1 text-[10px] uppercase font-bold">Latitude</p>
                      <p className="font-mono text-slate-700">{review.latitude.toFixed(6)}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <p className="text-slate-500 mb-1 text-[10px] uppercase font-bold">Longitude</p>
                      <p className="font-mono text-slate-700">{review.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (Review Content & Photos) */}
          <div className="space-y-6 md:col-span-2">
            
            {/* Core Review Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                    Review Details
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                    <Calendar size={14} />
                    {new Date(review.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border ${getRatingBg(review.rating)} border-current/10`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">User Rating</span>
                    <div className="flex items-center gap-1">
                      <Star size={16} className={`${getRatingColor(review.rating)} fill-current`} />
                      <span className={`text-lg font-bold ${getRatingColor(review.rating)}`}>
                        {review.rating}/10
                      </span>
                    </div>
                  </div>

                  {review.ai_score !== null && (
                    <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-lg border ${getRatingBg(review.ai_score)} border-current/10`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">AI Score</span>
                      <div className="flex items-center gap-1">
                        <Cpu size={16} className={`${getRatingColor(review.ai_score)}`} />
                        <span className={`text-lg font-bold ${getRatingColor(review.ai_score)}`}>
                          {review.ai_score}/10
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {review.description && (
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wide">Comment</p>
                  <p className="text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm leading-relaxed">
                    {cleanString(review.description)}
                  </p>
                </div>
              )}
            </div>

            {/* Photos Gallery */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-500" />
                Uploaded Photos
              </h3>
              
              {review.images && review.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {review.images.map((img, idx) => (
                    <a 
                      key={idx} 
                      href={img} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block group relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={img} 
                        alt={`Review Image ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md w-8 h-8" />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                  <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                  <p>No photos were uploaded with this review.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
