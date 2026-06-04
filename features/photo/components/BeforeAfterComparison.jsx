"use client";
import React from "react";
import { Clock, MapPin, Building } from "lucide-react";
import { formatDate } from "@/shared/utils/imageHelpers";

export default function BeforeAfterComparison({ pair, selectedIds, onToggleSelect, onClickView }) {
  const { before, after } = pair;
  const company = before?.company_name || after?.company_name;
  const location = before?.location_name || after?.location_name;
  const date = before?.uploaded_at || after?.uploaded_at;

  const renderSide = (photo, label) => {
    if (!photo) return <div className="flex-1 bg-gray-100 dark:bg-gray-800 flex items-center justify-center min-h-[200px] text-gray-400">No {label} Image</div>;
    const isSelected = selectedIds.has(photo.id);

    return (
      <div className="flex-1 relative group cursor-pointer" onClick={() => onClickView(photo)}>
        <img src={photo.image_url} alt={photo.file_name} className="object-cover w-full h-full min-h-[200px] group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(photo.id)} className="w-5 h-5 rounded text-blue-600 shadow-sm" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 text-xs rounded backdrop-blur-sm">
          {label}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white"><Building className="w-4 h-4" /> {company}</span>
          <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><MapPin className="w-4 h-4" /> {location}</span>
        </div>
        <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Clock className="w-4 h-4" /> {formatDate(date)}</span>
      </div>
      <div className="flex flex-col md:flex-row h-64 overflow-hidden">
        {renderSide(before, "Before")}
        <div className="w-1 bg-gray-200 dark:bg-gray-700 z-10"></div>
        {renderSide(after, "After")}
      </div>
    </div>
  );
}