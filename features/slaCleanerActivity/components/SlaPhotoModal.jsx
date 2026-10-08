"use client";

import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

/**
 * Isolated Photo Modal supporting Zoom, Drag, Swipe, and Keyboard shortcuts
 */
export default function SlaPhotoModal({ photos, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [photos, initialIndex]);

  const minSwipeDistance = 50;

  if (
    !photos ||
    ((!photos.before || photos.before.length === 0) &&
      (!photos.after || photos.after.length === 0))
  ) {
    return null;
  }

  const allPhotos = [
    ...(photos.before || []).map((url) => ({
      url,
      label: "Before",
      color: "blue",
    })),
    ...(photos.after || []).map((url) => ({
      url,
      label: "After",
      color: "green",
    })),
  ];

  const currentPhoto = allPhotos[currentIndex] || allPhotos[0];

  const goToNext = () => {
    if (currentIndex < allPhotos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetZoom();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetZoom();
    }
  };

  const onTouchStart = (e) => {
    if (zoomLevel === 1) {
      setTouchEnd(null);
      setTouchStart(e.targetTouches[0].clientX);
    }
  };

  const onTouchMove = (e) => {
    if (zoomLevel === 1) {
      setTouchEnd(e.targetTouches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || zoomLevel > 1) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel((prev) => Math.max(prev - 0.5, 1));
    } else {
      resetZoom();
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowLeft":
        goToPrevious();
        break;
      case "ArrowRight":
        goToNext();
        break;
      case "+":
      case "=":
        handleZoomIn();
        break;
      case "-":
      case "_":
        handleZoomOut();
        break;
      case "Escape":
        onClose();
        break;
      default:
        break;
    }
  };

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  return (
    <div
      ref={(el) => el?.focus()}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 focus:outline-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <button
        onClick={onClose}
        className="absolute cursor-pointer top-4 right-4 text-white hover:text-gray-300 bg-black/50 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110"
        title="Close (Esc)"
      >
        <X size={24} />
      </button>

      <div className="absolute top-4 left-4 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium z-20">
        {currentIndex + 1} / {allPhotos.length}
      </div>

      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden pb-24"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        <img
          src={currentPhoto?.url}
          alt={`${currentPhoto?.label} ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            transformOrigin: "center center",
          }}
          onError={(e) => {
            e.target.src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white"%3EImage not found%3C/text%3E%3C/svg%3E';
          }}
          draggable={false}
        />

        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-1.5 rounded-full text-white font-semibold text-sm shadow-lg ${
            currentPhoto?.color === "blue" ? "bg-blue-600" : "bg-emerald-600"
          }`}
        >
          {currentPhoto?.label?.toUpperCase()} PHOTO
        </div>
      </div>

      {currentIndex > 0 && (
        <button
          onClick={goToPrevious}
          className="absolute cursor-pointer left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-20 hidden md:block"
          title="Previous (←)"
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {currentIndex < allPhotos.length - 1 && (
        <button
          onClick={goToNext}
          className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black/50 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-20 hidden md:block"
          title="Next (→)"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Zoom Controls */}
      <div className="absolute right-4 top-20 flex flex-col items-center gap-3 bg-black/50 rounded-full px-3 py-4 z-20">
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel >= 3}
          className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          title="Zoom In (+)"
        >
          <ZoomIn size={20} />
        </button>

        <span className="text-white font-medium text-xs py-1">
          {Math.round(zoomLevel * 100)}%
        </span>

        <button
          onClick={handleZoomOut}
          disabled={zoomLevel <= 1}
          className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          title="Zoom Out (-)"
        >
          <ZoomOut size={20} />
        </button>

        <div className="w-6 h-px bg-gray-600 my-1"></div>

        <button
          onClick={resetZoom}
          disabled={zoomLevel === 1}
          className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
          title="Reset Zoom"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black/50 px-3 py-1 rounded-full md:hidden">
        Swipe left/right to navigate
      </div>

      {/* Bottom Thumbnails */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/60 rounded-lg p-2 max-w-[95vw] overflow-x-auto z-20 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {allPhotos.map((photo, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              resetZoom();
            }}
            className={`relative cursor-pointer flex-shrink-0 w-12 h-12 rounded overflow-hidden border-2 transition-all ${
              idx === currentIndex
                ? photo.color === "blue"
                  ? "border-blue-500 ring-2 ring-blue-400"
                  : "border-green-500 ring-2 ring-green-400"
                : "border-gray-600 hover:border-gray-400"
            }`}
          >
            <img
              src={photo.url}
              alt={`Thumbnail ${idx + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.style.display = "none")}
            />
            <span
              className={`absolute top-0.5 left-0.5 ${
                photo.color === "blue" ? "bg-blue-500" : "bg-green-500"
              } text-white px-1 py-0.2 text-[9px] font-bold rounded`}
            >
              {photo.label[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
