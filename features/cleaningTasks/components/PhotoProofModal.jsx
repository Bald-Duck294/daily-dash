"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, ExternalLink } from "lucide-react";

export default function PhotoProofModal({ isOpen, onClose, images = [], title = "Proof Photos" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!isOpen) return null;

  // Normalize images array: strings or objects
  const rawList = Array.isArray(images) ? images : [];
  const imageList = rawList
    .map((img) => (typeof img === "string" ? img : img?.url || img?.src || ""))
    .filter(Boolean);

  if (imageList.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            No photos uploaded with this request.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const currentImage = imageList[activeIndex] || imageList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-medium">{title}</span>
            <span className="text-[11px] text-slate-400">
              ({activeIndex + 1} of {imageList.length})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={currentImage}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              title="Open full image"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Viewer */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[350px] max-h-[60vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt="Citizen Complaint Proof"
            className="max-h-[60vh] max-w-full object-contain select-none"
          />

          {imageList.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActiveIndex((prev) => (prev > 0 ? prev - 1 : imageList.length - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setActiveIndex((prev) => (prev < imageList.length - 1 ? prev + 1 : 0))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/90 text-white rounded-full transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {imageList.length > 1 && (
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 overflow-x-auto justify-center">
            {imageList.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                  activeIndex === idx
                    ? "border-indigo-500 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
