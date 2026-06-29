"use client";
import React, { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axiosInstance from "@/shared/api/axios.instance.js";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";

export default function AppPreviewStep({
  onDeploy,
  onBack,
  isLoading,
  summary = { zones: 0, staff: 0, washrooms: 0, cleaners: 0 },
  washroom_data: washrooms = [],
}) {
  const iframeRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth) || {};
  const hasSubmitted = useRef(false);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // ─── INTERCEPT IFRAME ACTIONS & INJECT DATA ────────────────────────────
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument || win.document;

      if (washrooms && washrooms.length > 0) {
        // 1. INJECT WD (WASHROOM DETAILS) OBJECT FOR THE DETAIL PAGE
        win.WD = {};
        washrooms.forEach((w, i) => {
          const wId = w.temp_id || String(i);
          win.WD[wId] = {
            id: wId,
            name: w.name,
            location_types: { name: (w.type || "Washroom").toUpperCase() },
            averageRating: 10,
            ratingCount: 0,
            address: "Live Facility Preview",
            city: "Workspace",
            state: "Active",
            pincode: "---",
            schedule: { opens_at: "06:00 AM", closes_at: "10:00 PM" },
            options: {
              genderAccess: [w.type || "unisex"],
              hasHandDryer: true,
              isHandicapAccessible: w.type === "accessible",
              hasBabyChangingStation: w.type === "female",
            },
            usage_category: {
              men: {
                wc:
                  w.type === "male" || w.type === "unisex"
                    ? w.wc_count || 0
                    : 0,
                basin:
                  w.type === "male" || w.type === "unisex"
                    ? w.basin_count || 0
                    : 0,
                urinals: w.type === "male" ? w.urinal_count || 0 : 0,
              },
              women: {
                wc:
                  w.type === "female" || w.type === "unisex"
                    ? w.wc_count || 0
                    : 0,
                basin:
                  w.type === "female" || w.type === "unisex"
                    ? w.basin_count || 0
                    : 0,
                urinals: 0,
              },
            },
          };
        });

        // 2. PATCH THE HTML'S DETAIL FUNCTION TO USE OUR DYNAMIC IDs
        if (typeof win.openWashroomDetail === "function") {
          const funcStr = win.openWashroomDetail.toString();
          if (funcStr.includes('WD["409"]')) {
            const patchedStr = funcStr.replace(
              'WD["409"]',
              "WD[id] || Object.values(WD)[0]",
            );
            win.eval(`window.openWashroomDetail = ${patchedStr}`);
          }
        }

        // 3. UPDATE THE "SELECT WASHROOM" LIST UI
        win.washrooms = washrooms.map((w, index) => ({
          id: w.temp_id || String(index),
          name: w.name || "Custom Washroom",
          zone: w.zone_temp_id || null,
          wc: w.wc_count || 2,
          basin: w.basin_count || 2,
        }));

        const selectListContainer = doc.querySelector(".washroom-list");
        if (selectListContainer) {
          selectListContainer.innerHTML = "";
          washrooms.forEach((w, index) => {
            const typeLabel = w.type
              ? w.type.charAt(0).toUpperCase() + w.type.slice(1)
              : "Washroom";
            const btnHTML = `
              <button class="washroom-item" data-dist="Active Location" data-name="${w.name}" data-dest-x="152" data-dest-y="22" onclick="selectWashroom(this)">
                <div class="wi-icon">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.2" stroke-linecap="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div class="wi-info">
                  <div class="wi-name">${w.name}</div>
                  <div class="wi-dist">${typeLabel} &middot; Newly Added</div>
                </div>
                <div class="wi-check">
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </button>`;
            selectListContainer.insertAdjacentHTML("beforeend", btnHTML);
          });
        }

        // 4. UPDATE THE SIDEBAR (DRAWER) UI
        const drawerBody = doc.querySelector(".drawer-body");
        if (drawerBody) {
          drawerBody.innerHTML =
            '<div class="drawer-section-label">Assigned Washrooms</div>';
          washrooms.forEach((w, i) => {
            const wId = w.temp_id || String(i);
            const typeLabel = w.type
              ? w.type.charAt(0).toUpperCase() + w.type.slice(1)
              : "Washroom";
            const btnHTML = `
              <button class="assigned-item" onclick="openWashroomDetail('${w.name}', '${typeLabel}', '${wId}')">
                <div class="assigned-item-icon">📍</div>
                <div>
                  <div class="assigned-item-name">${w.name}</div>
                  <div class="assigned-item-sub">${typeLabel}</div>
                </div>
              </button>
            `;
            drawerBody.insertAdjacentHTML("beforeend", btnHTML);
          });
        }
      }

      // 5. INTERCEPT EXACT "SUBMIT TASK" FUNCTION
      if (typeof win.submitTask === "function") {
        const originalSubmit = win.submitTask;
        win.submitTask = function () {
          originalSubmit.apply(this, arguments);
          const selectedName = win.selectedWashroom
            ? win.selectedWashroom.name
            : washrooms[0]?.name || "Demo Washroom";
          window.parent.postMessage(
            { type: "CLEANING_COMPLETED", washroomName: selectedName },
            "*",
          );
        };
      }
    } catch (err) {
      console.warn("Could not hook into iframe DOM (Check origin):", err);
    }
  };

  // ─── HANDLE BACKEND API CALL ─────────────────────────────────────────
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data?.type === "CLEANING_COMPLETED") {
        if (hasSubmitted.current) return;
        hasSubmitted.current = true;

        try {
          const washroomName = event.data.washroomName;
          const payload = {
            name: `${washroomName} (App Preview)`,
            company_id: user?.company_id || null,
            location_id: null,
          };

          const response = await axiosInstance.post(
            "/cleaner-reviews/demo-completed",
            payload,
          );

          if (response.data?.status === "success") {
            queryClient.invalidateQueries({ queryKey: ["cleanerActivities"] });
            queryClient.invalidateQueries({ queryKey: ["cleanerReviews"] });

            toast.success(
              `${washroomName} task submitted! You can view this live in the Cleaner Activity tab.`,
              {
                duration: 5000,
                style: { background: "#1e293b", color: "#fff" },
              },
            );
          }
        } catch (error) {
          console.error("Failed to log demo activity:", error);
          toast.error("Error communicating with server.");
        } finally {
          setTimeout(() => {
            hasSubmitted.current = false;
          }, 3000);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [queryClient, user]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-20 md:pb-0 w-full relative">
      {/* ── EDUCATIONAL HELP DRAWER ── */}
      <StepHelpDrawer
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        title="App Preview Guide"
      >
        <div className="space-y-6">
          <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-[#1F4E79] mb-1 text-base">
              🎉 We are almost done!
            </h3>
            <p className="text-slate-700">
              The washrooms you set up, the usage categories you defined, and
              the cleaners you assigned are now live in this interactive
              preview.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-3 border-b pb-2">
              How to Test the App
            </h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong className="text-slate-800">Login:</strong> Enter any
                  10-digit mobile number to log in as a cleaner.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong className="text-slate-800">Start Task:</strong> Tap
                  the big blue "Start New Cleaning Task" button.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong className="text-slate-800">Select Location:</strong>{" "}
                  Choose a washroom from the list you created in Step 2.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong className="text-slate-800">Photos & Submit:</strong>{" "}
                  Tap the camera boxes to upload "Before" and "After" photos,
                  review the checklist, and submit for an AI score.
                </div>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 text-base mb-2 border-b pb-2">
              Dashboard Navigation
            </h3>
            <ul className="space-y-3 text-slate-600 list-disc pl-4">
              <li>
                <strong className="text-slate-800">Completed Tab:</strong> Once
                submitted, the task will appear here.
              </li>
              <li>
                <strong className="text-slate-800">Ongoing Tab:</strong> If you
                start a task but don't finish it, it is saved securely in the
                Ongoing tab to resume later.
              </li>
              <li>
                <strong className="text-slate-800">Sidebar Menu (☰):</strong>{" "}
                Tap the top-left menu to see the specific washrooms assigned to
                this cleaner. Tapping one reveals the full location details.
              </li>
            </ul>
          </div>
        </div>
      </StepHelpDrawer>

      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Mobile App Preview
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            View the actual V5 mobile app interface your cleaners will use.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex-1 md:flex-none bg-white text-[#1F4E79] px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <span className="text-lg leading-none">❓</span> Instructions
          </button>
          <button
            onClick={onDeploy}
            disabled={isLoading}
            className="flex-1 md:flex-none bg-[#22c55e] text-white px-8 py-2.5 rounded-lg font-bold text-sm shadow-sm hover:bg-[#16a34a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "⏳ Deploying..." : "🚀 Go Live"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-start justify-center w-full mt-4">
        {/* ── LEFT: PHONE SIMULATOR (No Notch) ── */}
        <div className="w-full flex justify-center py-2 overflow-hidden lg:w-auto lg:flex-shrink-0">
          <div
            className="relative flex flex-col origin-top scale-[0.85] sm:scale-100"
            style={{
              width: "320px",
              height: "660px",
              borderRadius: "44px",
              background: "#1e293b",
              padding: "10px", // Acts as the bezel
              boxShadow:
                "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px #334155",
            }}
          >
            {/* The Screen */}
            <div className="w-full h-full rounded-[34px] overflow-hidden bg-white relative">
              <iframe
                ref={iframeRef}
                onLoad={handleIframeLoad}
                src="/cleaner-preview/index.html"
                className="w-full h-full border-none absolute inset-0"
                title="SaafAI Cleaner App Preview"
              />
            </div>
          </div>
        </div>

        {/* ── RIGHT: SUMMARY PANEL ── */}
        <div className="flex-1 w-full max-w-2xl space-y-6 pt-4 lg:pt-0">
          <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4">
              Platform Summary
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-[#1F4E79]">
                  {summary.zones || "0"}
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Zones
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-[#22c55e]">
                  {summary.staff || "0"}
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Staff
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-[#f59e0b]">
                  {summary.washrooms || "0"}
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Washrooms
                </p>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-2xl font-black text-rose-500">
                  {summary.cleaners || "0"}
                </p>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                  Cleaners
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-sm text-slate-900 mb-3 border-b border-slate-100 pb-2">
              Status
            </h3>
            <p className="text-sm text-slate-600 font-medium">
              All configurations look good! Your facility workspace is ready for
              launch.
            </p>
          </div>

          <button
            onClick={onDeploy}
            disabled={isLoading}
            className="w-full bg-[#22c55e] text-white py-4 rounded-xl font-bold text-base shadow-sm hover:bg-[#16a34a] transition-all hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "⏳ Compiling Workspace..."
              : "🚀 Go Live — View Dashboard"}
          </button>
        </div>
      </div>

      {/* ── BOTTOM GLOBAL NAV ── */}
      <div className="flex justify-start mt-8 pt-5 border-t border-slate-200 w-full">
        <button
          onClick={onBack}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 font-bold text-sm rounded-lg border border-slate-200 bg-white text-slate-700 min-h-[48px] px-6 hover:bg-slate-50 transition-colors shadow-sm"
        >
          ← Back
        </button>
      </div>

      {/* Floating Help Button */}
      <button
        onClick={() => setIsHelpOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-tr from-[#1F4E79] to-[#3a7ca5] text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(31,78,121,0.4)] hover:scale-105 transition-transform"
        title="Need Help?"
      >
        <span className="text-2xl animate-pulse">❓</span>
      </button>
    </div>
  );
}
