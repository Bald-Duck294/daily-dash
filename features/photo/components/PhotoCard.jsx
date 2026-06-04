"use client";
import React from "react";
import { Clock, MapPin, Building, User } from "lucide-react";
import { formatDate } from "@/shared/utils/imageHelpers";

export default function PhotoCard({ photo, isSelected, onToggleSelect, onClickView }) {
  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden cursor-pointer" onClick={() => onClickView(photo)}>
        <img src={photo.image_url} alt={photo.file_name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full shadow-sm ${photo.image_type === 'before' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {photo.image_type.charAt(0).toUpperCase() + photo.image_type.slice(1)}
          </span>
        </div>
      </div>

      <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
        <input 
          type="checkbox" 
          checked={isSelected} 
          onChange={() => onToggleSelect(photo.id)}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer shadow-sm"
        />
      </div>

      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
          <Building className="w-4 h-4 text-gray-500" /> {photo.company_name}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5" /> {photo.location_name}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
          <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {photo.uploaded_by}</span>
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDate(photo.uploaded_at)}</span>
        </div>
      </div>
    </div>
  );
}