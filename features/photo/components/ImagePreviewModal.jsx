/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { downloadSingleImage } from "@/shared/utils/downloadImages";

export default function ImagePreviewModal({ photo, photosList, onClose, onNavigate }) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Reset transforms when photo changes
    setScale(1);
    setRotation(0);
  }, [photo]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate("prev");
      if (e.key === "ArrowRight") onNavigate("next");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNavigate]);

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
        <button onClick={() => downloadSingleImage(photo.image_url, photo.file_name)} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Download">
          <Download className="w-6 h-6" />
        </button>
        <button onClick={onClose} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors" title="Close">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/50 p-2 rounded-full backdrop-blur-md z-50">
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-2 text-white hover:bg-white/20 rounded-full"><ZoomOut className="w-5 h-5" /></button>
        <span className="text-white text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-2 text-white hover:bg-white/20 rounded-full"><ZoomIn className="w-5 h-5" /></button>
        <div className="w-px h-6 bg-white/30 mx-2"></div>
        <button onClick={() => setRotation(r => r + 90)} className="p-2 text-white hover:bg-white/20 rounded-full"><RotateCw className="w-5 h-5" /></button>
      </div>

      <button onClick={() => onNavigate("prev")} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full z-50 transition-colors">
        <ChevronLeft className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full flex items-center justify-center p-12 overflow-hidden">
        <img 
          src={photo.image_url} 
          alt={photo.file_name} 
          className="max-w-full max-h-full object-contain transition-transform duration-300 ease-out"
          style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
        />
      </div>

      <button onClick={() => onNavigate("next")} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white hover:bg-white/20 rounded-full z-50 transition-colors">
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  );
}