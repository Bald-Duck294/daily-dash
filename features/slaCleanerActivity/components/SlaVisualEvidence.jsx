"use client";

import { Image as ImageIcon } from "lucide-react";

/**
 * Renders Visual Evidence Photos isolated for an Attempt
 */
export default function SlaVisualEvidence({
  beforePhotos = [],
  afterPhotos = [],
  attemptLabel = "Original Review",
  onPhotoClick,
}) {
  const allAttemptPhotos = [
    ...(beforePhotos || []).map((url) => ({ url, type: "before" })),
    ...(afterPhotos || []).map((url) => ({ url, type: "after" })),
  ];

  if (allAttemptPhotos.length === 0) {
    return (
      <div
        className="rounded-xl p-5 border text-center"
        style={{
          background: "var(--cleaner-surface, #FFFFFF)",
          borderColor: "var(--cleaner-border, #E5E7EB)",
        }}
      >
        <div className="flex items-center gap-2 mb-3 font-semibold text-sm" style={{ color: "var(--cleaner-title)" }}>
          <ImageIcon size={16} className="text-orange-500" />
          <span>Visual Evidence – {attemptLabel}</span>
        </div>
        <p className="text-xs text-muted-foreground py-6">
          No photo evidence was submitted for this attempt.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-5 border"
      style={{
        background: "var(--cleaner-surface, #FFFFFF)",
        borderColor: "var(--cleaner-border, #E5E7EB)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className="font-semibold text-sm flex items-center gap-2"
          style={{ color: "var(--cleaner-title, #111827)" }}
        >
          <ImageIcon
            size={16}
            style={{ color: "var(--cleaner-header-icon-fg, #EA580C)" }}
          />
          Visual Evidence ({allAttemptPhotos.length} Photos) – {attemptLabel}
        </h3>

        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            {beforePhotos.length} Before
          </span>
          <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            {afterPhotos.length} After
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {allAttemptPhotos.map((img, idx) => (
          <div
            key={idx}
            className="group relative cursor-pointer overflow-hidden rounded-lg border transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            style={{ borderColor: "var(--cleaner-border, #E5E7EB)" }}
            onClick={() => onPhotoClick(idx)}
          >
            <img
              src={img.url}
              alt={`${attemptLabel} ${img.type}`}
              className="w-full h-28 sm:h-32 object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23888"%3ENo image%3C/text%3E%3C/svg%3E';
              }}
            />

            {/* Photo type badge */}
            <span
              className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded shadow uppercase ${
                img.type === "before"
                  ? "bg-blue-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {img.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
