"use client";
import React from "react";

export default function StepHelpDrawer({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-[85vw] md:max-w-[400px] bg-white h-full shadow-2xl animate-in slide-in-from-right-8 duration-300 flex flex-col">
        <div className="flex items-center justify-between p-4 md:p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-black text-[#1F4E79] flex items-center gap-2">
            <span className="text-xl">💡</span> {title}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-slate-200/50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-5 md:p-6 overflow-y-auto flex-1 text-slate-600 text-sm space-y-6">
          {children}
        </div>

        <div className="p-4 md:p-5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="w-full bg-[#1F4E79] text-white py-3.5 md:py-3 rounded-lg font-bold text-sm hover:bg-[#163a5a] transition-colors shadow-sm"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
