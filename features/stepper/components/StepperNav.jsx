"use client";
import React from "react";

export const SETUP_STEPS = [
  { id: 1, label: "Hierarchy" },
  { id: 2, label: "Washrooms" },
  { id: 3, label: "Users" },
  { id: 4, label: "App Preview" },
  { id: 5, label: "Dashboard" },
];

export default function StepperNav({ currentStep, onStepChange }) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between px-3 md:px-6 py-3.5 gap-2 md:gap-4 mx-auto w-full">
        {/* ── LEFT: Branding ── */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/flo-mascot.webp"
            alt="SaafAI Mascot"
            className="w-8 h-8 object-contain shrink-0"
          />
          <span className="font-black text-xl text-[#0f172a] hidden sm:block tracking-tight">
            Saaf<span className="bg-gradient-to-r from-[#6C5CE7] to-[#00D2D3] bg-clip-text text-transparent">AI</span>
          </span>
          <span className="hidden lg:block text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
            Onboarding
          </span>
        </div>

        {/* ── MIDDLE: Stepper Nodes ── */}
        <div className="flex items-center justify-center flex-1 max-w-4xl overflow-x-hidden">
          <div className="flex items-center w-full px-1 sm:px-2 justify-center">
            {SETUP_STEPS.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const isFuture = step.id > currentStep;

              return (
                <React.Fragment key={step.id}>
                  {/* Step Node - Added py-2 for 44px touch target on mobile */}
                  <div
                    onClick={() => {
                      if (isCompleted && onStepChange) onStepChange(step.id);
                    }}
                    className={`flex items-center gap-2.5 rounded-lg transition-all relative group select-none py-2
                      ${isCompleted ? "cursor-pointer hover:opacity-80" : "cursor-default"}
                    `}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all z-10
                        ${isActive ? "bg-[#1a4b6c] text-white ring-[3px] ring-[#e2e8f0]" : ""}
                        ${isCompleted ? "bg-[#2E7D32] text-white" : ""}
                        ${isFuture ? "bg-white text-slate-400 border-2 border-slate-200" : ""}
                      `}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                      ) : (
                        step.id
                      )}
                    </div>
                    <span
                      className={`hidden md:block whitespace-nowrap text-[13px] tracking-wide
                      ${isActive ? "font-bold text-[#1a4b6c]" : ""}
                      ${isCompleted ? "font-semibold text-slate-600" : ""}
                      ${isFuture ? "font-medium text-slate-400" : ""}
                    `}
                    >
                      {step.label}
                    </span>
                  </div>

                  {/* Connecting Line - Responsively shrinks on mobile */}
                  {index < SETUP_STEPS.length - 1 && (
                    <div
                      className={`flex-1 mx-1 sm:mx-2 md:mx-4 h-[2.5px] rounded-full transition-all duration-300 min-w-[8px] sm:min-w-[16px]
                      ${isCompleted ? "bg-[#2E7D32]" : ""}
                      ${isActive ? "bg-[#1a4b6c]" : ""}
                      ${isFuture ? "bg-slate-200" : ""}
                    `}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: User Actions ── */}
        <div className="flex items-center gap-4 shrink-0 pl-1 sm:pl-2">
          <div className="hidden lg:flex items-center gap-1.5 text-[#2E7D32] font-semibold text-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              ></path>
            </svg>
            Saved
          </div>
          <div className="w-9 h-9 rounded-full bg-[#1a4b6c] flex items-center justify-center text-white font-bold text-sm cursor-pointer shadow-sm hover:opacity-90 transition-opacity">
            D
          </div>
        </div>
      </div>
    </header>
  );
}
