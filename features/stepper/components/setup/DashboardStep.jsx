"use client";
import React, { useState, useEffect } from "react";

const DEPLOY_STEPS = [
  {
    id: "dt1",
    label: "Building topology maps & hierarchy",
    title: "Compiling Facility Structure",
    sub: "Initializing configuration parameters…",
  },
  {
    id: "dt2",
    label: "Allocating facility washroom routes",
    title: "Mapping Washroom Routes",
    sub: "Linking locations to assigned cleaners…",
  },
  {
    id: "dt3",
    label: "Assigning cleaning operators & schedules",
    title: "Assigning Staff Roles",
    sub: "Generating access credentials…",
  },
  {
    id: "dt4",
    label: "Provisioning supervisor & admin accounts",
    title: "Finalising Configuration",
    sub: "Your dashboard is almost ready…",
  },
];

export default function DashboardStep({ onBack }) {
  const [completedSteps, setCompletedSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Progress individual compiler tasks every 1000ms
    DEPLOY_STEPS.forEach((step, index) => {
      const taskTimeout = setTimeout(() => {
        setCompletedSteps((prev) => [...prev, step.id]);
        setCurrentStepIndex(index + 1);
      }, index * 1000);

      return () => clearTimeout(taskTimeout);
    });

    // Complete overall compilation and toggle Live view at 4400ms
    const liveTimeout = setTimeout(() => {
      setIsLive(true);
    }, 4400);

    return () => {
      clearTimeout(liveTimeout);
    };
  }, []);

  const currentHeaderTitle = isLive
    ? "Facility is Live! 🎉"
    : DEPLOY_STEPS[currentStepIndex]?.title ||
      DEPLOY_STEPS[DEPLOY_STEPS.length - 1].title;

  const currentHeaderSubtitle = isLive
    ? "Your client dashboard has been generated successfully."
    : DEPLOY_STEPS[currentStepIndex]?.sub ||
      DEPLOY_STEPS[DEPLOY_STEPS.length - 1].sub;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Top action header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-black text-slate-900">
            Dashboard Preview
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Your Safai workspace has been compiled and deployed. Your live
            client dashboard is ready.
          </p>
        </div>
        <a
          href="/clientDashboard/29"
          className="inline-flex items-center gap-2 font-semibold text-sm rounded-lg bg-[#1F4E79] text-white px-5 py-2.5 transition-all hover:bg-[#163a5a] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(31,78,121,0.3)] active:translate-y-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          Open Dashboard
        </a>
      </div>

      {/* Deploy Animation Summary Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-5 mb-6">
          {!isLive ? (
            <div className="w-12 h-12 border-4 border-slate-100 border-t-[#1F4E79] rounded-full animate-spin shrink-0" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#d1fae5] text-[#10b981] text-xl font-bold flex items-center justify-center shrink-0 scale-100 animate-in zoom-in-75 duration-300">
              ✓
            </div>
          )}
          <div>
            <h2 className="text-base font-black text-slate-900 transition-all">
              {currentHeaderTitle}
            </h2>
            <p className="text-xs mt-0.5 text-slate-500 transition-all">
              {currentHeaderSubtitle}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {DEPLOY_STEPS.map((step, idx) => {
            const isDone = completedSteps.includes(step.id);
            return (
              <div
                key={step.id}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-lg text-sm font-semibold border transition-all duration-300
                  ${
                    isDone
                      ? "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]"
                      : "bg-slate-50 text-slate-400 border-slate-200 opacity-60"
                  }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold transition-all duration-300
                    ${
                      isDone
                        ? "bg-[#10b981] border-[#10b981] text-white"
                        : "border-slate-300 text-slate-400"
                    }`}
                >
                  {isDone ? "✓" : idx + 1}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            );
          })}
        </div>

        {isLive && (
          <div className="mt-6 pt-6 border-t border-slate-100 text-center animate-in fade-in slide-in-from-top-3 duration-500">
            <a
              href="/clientDashboard/29"
              className="inline-flex items-center gap-2 font-bold text-sm rounded-lg bg-[#2E7D32] text-white px-6 py-3 shadow-md hover:bg-[#1b5e20] hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
              Open Generated Dashboard
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
            <p className="text-[11px] text-slate-400 mt-3">
              Your facility workspace is operational — cleaning personnel can
              now access targets.
            </p>
          </div>
        )}
      </div>

      {/* Embedded Client Dashboard Sandbox Frame */}
      {isLive && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
          <div className="flex items-center justify-between p-3 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-2">
              <span className="text-[#1F4E79] text-sm">📊</span>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Live Dashboard Preview
              </p>
              <span className="inline-flex items-center gap-1 bg-[#d1fae5] text-[#065f46] text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse"></span>
                LIVE
              </span>
            </div>
            <a
              href="/clientDashboard/29"
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 bg-white text-[10px] font-bold text-[#1F4E79] hover:bg-blue-50 hover:border-[#1F4E79] transition-colors"
            >
              ⤢ Open Full
            </a>
          </div>
          <div className="h-[560px] relative bg-slate-50">
            <iframe
              src="/clientDashboard/29"
              className="w-full h-full border-none"
              title="SaafAI Client Dashboard"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* Bottom Back Button Navigation */}
      <div className="flex justify-start mt-5">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 font-semibold text-xs rounded-lg border border-slate-200 bg-white text-slate-700 px-4 py-2.5 hover:bg-slate-50 hover:border-[#1F4E79] transition-all"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
