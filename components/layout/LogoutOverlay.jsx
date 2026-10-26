"use client";

import React from "react";
import { useSelector } from "react-redux";

export default function LogoutOverlay() {
  const isLoggingOut = useSelector((state) => state.auth?.isLoggingOut);

  if (!isLoggingOut) return null;

  return (
    <div
      id="saafai-logout-overlay"
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-slate-950/75 backdrop-blur-md select-none transition-opacity duration-300"
      style={{ pointerEvents: "all" }}
      role="alertdialog"
      aria-live="assertive"
      aria-label="Logging you out"
    >
      <div className="relative overflow-hidden w-full max-w-sm mx-4 rounded-3xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/90 shadow-2xl shadow-cyan-500/10 p-7 sm:p-8 flex flex-col items-center text-center backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Ambient Gradient Lights */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse delay-500" />

        {/* Mascot / Avatar with Orbital Rings */}
        <div className="relative w-24 h-24 mb-5 flex items-center justify-center">
          {/* Orbital Ring 1 (Clockwise) */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 border-r-blue-500 animate-spin"
            style={{ animationDuration: "1.8s" }}
          />

          {/* Orbital Ring 2 (Counter-Clockwise) */}
          <div
            className="absolute inset-2 rounded-full border border-transparent border-b-cyan-400 border-l-teal-400 animate-spin"
            style={{ animationDuration: "2.4s", animationDirection: "reverse" }}
          />

          {/* Flo Mascot Bubble */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-50 to-white dark:from-slate-800 dark:to-slate-950 flex items-center justify-center shadow-inner overflow-hidden border border-cyan-100 dark:border-cyan-900/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/flo-mascot.webp"
              alt="SaafAI Flo Mascot"
              className="w-12 h-12 object-contain drop-shadow"
            />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Logging you out...
        </h3>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-6">
          Clearing credentials and securing your session. Redirecting to login...
        </p>

        {/* Animated Shimmer Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative mb-4">
          <div className="saafai-logout-progress-bar h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-400" />
        </div>

        {/* Footer brand indicator */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span>SaafAI Secure Session Teardown</span>
        </div>
      </div>

      <style jsx>{`
        .saafai-logout-progress-bar {
          width: 50%;
          animation: logoutProgress 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        @keyframes logoutProgress {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(250%);
          }
        }
      `}</style>
    </div>
  );
}
