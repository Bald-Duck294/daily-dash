"use client";
import React from "react";

export default function CustomDialog({
  isOpen,
  onClose,
  title,
  message,
  type = "warning",
}) {
  if (!isOpen) return null;

  const icons = {
    warning: "⚠️",
    error: "🚨",
    info: "💡",
  };

  const colors = {
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-red-50 text-red-800 border-red-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div
          className={`px-5 py-4 border-b flex items-center gap-3 ${colors[type]}`}
        >
          <span className="text-xl">{icons[type]}</span>
          <h3 className="font-bold text-base">{title}</h3>
        </div>

        <div className="p-6 text-slate-600 text-sm leading-relaxed font-medium">
          {message}
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1F4E79] text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#163a5a] transition-colors shadow-sm w-full"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
