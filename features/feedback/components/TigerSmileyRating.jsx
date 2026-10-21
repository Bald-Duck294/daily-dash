"use client";

import { useState } from "react";

// Crisp SVG Icons matching the exact design in the reference
const RatingFaceIcon = ({ index, isActive }) => {
  const strokeColor = isActive ? "#1e3a29" : "#284e3a";
  const fillColor = isActive ? "#ecfdf5" : "none";

  switch (index) {
    case 1: // 😢 Crying
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          {/* Eyebrows angled down */}
          <path d="M12 14l4 2" />
          <path d="M28 14l-4 2" />
          {/* Eyes */}
          <circle cx="15" cy="18" r="1.5" fill={strokeColor} />
          <circle cx="25" cy="18" r="1.5" fill={strokeColor} />
          {/* Frown */}
          <path d="M15 28c1.5-2 3.5-3 5-3s3.5 1 5 3" />
          {/* Tear drop */}
          <path
            d="M13 21c0 1.2.8 2 1.8 2s1.8-.8 1.8-2c0-1.2-1.8-3-1.8-3s-1.8 1.8-1.8 3z"
            fill={strokeColor}
            stroke="none"
          />
        </svg>
      );
    case 2: // ☹️ Sad
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          <path d="M13 15l3 1.5" />
          <path d="M27 15l-3 1.5" />
          <circle cx="15" cy="19" r="1.5" fill={strokeColor} />
          <circle cx="25" cy="19" r="1.5" fill={strokeColor} />
          <path d="M14 28c2-2.5 4-3.5 6-3.5s4 1 6 3.5" />
        </svg>
      );
    case 3: // 🙁 Slight frown
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          <circle cx="15" cy="18" r="1.5" fill={strokeColor} />
          <circle cx="25" cy="18" r="1.5" fill={strokeColor} />
          <path d="M15 27c1.5-1.5 3-2.2 5-2.2s3.5.7 5 2.2" />
        </svg>
      );
    case 4: // 😐 Neutral / straight
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          <circle cx="15" cy="18" r="1.5" fill={strokeColor} />
          <circle cx="25" cy="18" r="1.5" fill={strokeColor} />
          <line x1="14" y1="26" x2="26" y2="26" />
        </svg>
      );
    case 5: // 🙂 Slight smile
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          <circle cx="15" cy="18" r="1.5" fill={strokeColor} />
          <circle cx="25" cy="18" r="1.5" fill={strokeColor} />
          <path d="M15 24c1.5 2 3.2 2.8 5 2.8s3.5-.8 5-2.8" />
        </svg>
      );
    case 6: // 😄 Smiling with teeth
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          {/* Smiling curved eyes */}
          <path d="M13 18c.8-1.5 2.2-2 3.5-1.5" />
          <path d="M27 18c-.8-1.5-2.2-2-3.5-1.5" />
          {/* Open smile */}
          <path
            d="M14 23c1.5 4 4 5.5 6 5.5s4.5-1.5 6-5.5z"
            fill={isActive ? strokeColor : "none"}
          />
        </svg>
      );
    case 7: // 😃 Big smile
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          <circle cx="15" cy="17" r="1.5" fill={strokeColor} />
          <circle cx="25" cy="17" r="1.5" fill={strokeColor} />
          <path
            d="M13 22c1.8 5 4.5 7 7 7s5.2-2 7-7H13z"
            fill={isActive ? strokeColor : "none"}
          />
        </svg>
      );
    case 8: // 😆 Laughing squint
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          {/* Squinting > < eyes */}
          <path d="M13 16l3 2.5-3 2.5" />
          <path d="M27 16l-3 2.5 3 2.5" />
          {/* Laughing open mouth */}
          <path
            d="M13 24c1.8 5 4.5 7 7 7s5.2-2 7-7H13z"
            fill={isActive ? strokeColor : "none"}
          />
        </svg>
      );
    case 9: // 🤩 Star Eyes
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="20" cy="20" r="17" fill={fillColor} />
          {/* Star eyes */}
          <path
            d="M15 14l1 2.5 2.5.5-2 1.8.5 2.7-2-1.5-2 1.5.5-2.7-2-1.8 2.5-.5z"
            fill={strokeColor}
            stroke="none"
          />
          <path
            d="M25 14l1 2.5 2.5.5-2 1.8.5 2.7-2-1.5-2 1.5.5-2.7-2-1.8 2.5-.5z"
            fill={strokeColor}
            stroke="none"
          />
          {/* Big open smile */}
          <path
            d="M14 24c1.8 4 4 5.5 6 5.5s4.2-1.5 6-5.5z"
            fill={isActive ? strokeColor : "none"}
          />
        </svg>
      );
    case 10: // 🐯 Cute Tadoba Tiger Face (Exact match to reference!)
      return (
        <svg
          viewBox="0 0 40 40"
          className="w-9 h-9 sm:w-11 sm:h-11"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Tiger Ears */}
          <path d="M10 14c-1-3 1-6 4-5" />
          <path d="M30 14c1-3-1-6-4-5" />
          {/* Head */}
          <circle cx="20" cy="21" r="15" fill={fillColor} />
          {/* Tiger Forehead Stripes */}
          <path d="M20 9v5" />
          <path d="M17 11l2 2" />
          <path d="M23 11l-2 2" />
          {/* Cheek stripes */}
          <path d="M7 21l3-1" />
          <path d="M7 23l3 0" />
          <path d="M33 21l-3-1" />
          <path d="M33 23l-3 0" />
          {/* Eyes */}
          <circle cx="16" cy="20" r="1.5" fill={strokeColor} />
          <circle cx="24" cy="20" r="1.5" fill={strokeColor} />
          {/* Nose & Mouth */}
          <path d="M19 23.5h2l-1 1.5z" fill={strokeColor} />
          <path d="M18 26.5c1 .8 2 .8 2 0s1-.8 2 0" />
        </svg>
      );
    default:
      return null;
  }
};

export default function TigerSmileyRating({
  rating,
  onRatingChange,
  ratingLabels = {},
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const ratings = [
    { value: 1, labelKey: "veryPoor" },
    { value: 2, labelKey: "poor" },
    { value: 3, labelKey: "belowAverage" },
    { value: 4, labelKey: "fair" },
    { value: 5, labelKey: "average" },
    { value: 6, labelKey: "good" },
    { value: 7, labelKey: "veryGood" },
    { value: 8, labelKey: "great" },
    { value: 9, labelKey: "excellent" },
    { value: 10, labelKey: "outstanding" },
  ];

  return (
    <div className="space-y-4">
      {/* 2 Rows of 5 Smileys (Exact match to reference) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 max-w-lg mx-auto">
        {ratings.map((item) => {
          const isSelected = rating === item.value;
          const isHovered = hoverRating === item.value;
          const isActive = isSelected || isHovered;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onRatingChange(item.value)}
              onMouseEnter={() => setHoverRating(item.value)}
              onMouseLeave={() => setHoverRating(0)}
              className="group flex flex-col items-center justify-center p-1 transition-all duration-200 cursor-pointer"
            >
              <div
                className={`w-11 h-11 xs:w-12 xs:h-12 sm:w-13 sm:h-13 rounded-full border flex items-center justify-center transition-all duration-200 ${
                  isSelected
                    ? "bg-emerald-100/90 border-[#284e3a] scale-110 shadow-xs ring-2 ring-[#284e3a]/30 ring-offset-1"
                    : isHovered
                      ? "bg-[#eaf1ea] border-stone-300 scale-105"
                      : "bg-[#f4f7f4]/90 border-stone-200/90 hover:bg-[#ebf2eb]"
                }`}
              >
                <RatingFaceIcon index={item.value} isActive={isActive} />
              </div>
              <span
                className={`text-xs sm:text-sm font-semibold mt-1.5 transition-colors ${
                  isSelected
                    ? "text-[#284e3a] font-bold scale-105"
                    : "text-stone-700"
                }`}
              >
                {item.value}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Label Display */}
      {rating > 0 &&
        ratingLabels[ratings.find((r) => r.value === rating)?.labelKey] && (
          <div className="text-center pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs sm:text-sm font-semibold border border-emerald-200/60 shadow-2xs">
              <span>
                {
                  ratingLabels[
                    ratings.find((r) => r.value === rating)?.labelKey
                  ]
                }
              </span>
              <span className="text-emerald-700 font-bold">({rating}/10)</span>
            </span>
          </div>
        )}
    </div>
  );
}
