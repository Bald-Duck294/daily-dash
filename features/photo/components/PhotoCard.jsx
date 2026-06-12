"use client";
import React from "react";

export default function PhotoCard({ photo, isSelected, onToggleSelect, onClickView, hideLabel = false }) {
  // Determine if it's a before or after image to set the badge color
  const isBefore = photo?.image_type?.toLowerCase() === 'before';

  return (
    <div 
      className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 aspect-[4/5] cursor-pointer border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800"
      onClick={() => onClickView(photo)}
    >
      {/* Full Background Image */}
      <img 
        src={photo.image_url} 
        alt={photo.file_name || "Cleaning Photo"} 
        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
      />

      {/* Top Left: Checkbox */}
      <div className="absolute top-3 left-3 z-10" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggleSelect(photo.id)}
          className="w-4 h-4 rounded-sm border-gray-300 bg-white/80 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
        />
      </div>

      {/* Top Right: Status Badges */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5 z-10">
        {/* Before / After Badge */}
        <span className={`px-3 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded shadow-sm text-white backdrop-blur-md ${isBefore ? 'bg-red-600/80' : 'bg-emerald-600/80'}`}>
          {photo.image_type || "Photo"}
        </span>
        
        {/* Quality Score (Mocked or real data if you have it) */}
        <span className="px-2 py-0.5 text-[9px] font-medium tracking-wide rounded bg-black/60 text-gray-200 backdrop-blur-md border border-white/10">
          Quality: {photo.quality_score || "90"}%
        </span>
      </div>

      {/* Bottom: Gradient Overlay & Location Text (Conditionally Hidden) */}
      {!hideLabel && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 pt-12 flex flex-col justify-end pointer-events-none">
          <span className="text-white text-xs font-medium truncate w-full drop-shadow-md">
            {photo.location_name || photo.company_name || "Unknown Location"}
          </span>
        </div>
      )}
    </div>
  );
}