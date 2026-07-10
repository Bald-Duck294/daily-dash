"use client";
import React, { useRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import axiosInstance from "@/shared/api/axios.instance.js";
import StepHelpDrawer from "@/features/stepper/components/ui/StepHelpDrawer";

const DEPLOY_STEPS = [
  {
    label: "Building topology maps & hierarchy",
    title: "Compiling Facility Structure",
    sub: "Initializing configuration parameters…",
  },
  {
    label: "Allocating facility washroom routes",
    title: "Mapping Washroom Routes",
    sub: "Linking locations to assigned cleaners…",
  },
  {
    label: "Assigning cleaning operators & schedules",
    title: "Assigning Staff Roles",
    sub: "Generating access credentials…",
  },
  {
    label: "Provisioning supervisor & admin accounts",
    title: "Finalising Configuration",
    sub: "Your dashboard is almost ready…",
  },
];

// 📱 PHONE SIMULATOR SIZE OPTIONS
// Swap out the classes below to test different app visibilities.
const phoneSizeClasses = {
  // Option 1 (Compact - Original): wrapper: "w-[360px] h-[680px]", phone: "w-[320px] h-[640px]"
  // Option 2 (Medium - Recommended): wrapper: "w-[390px] h-[750px]", phone: "w-[350px] h-[710px]"
  // Option 3 (Large - Pro Max): wrapper: "w-[430px] h-[840px]", phone: "w-[390px] h-[800px]"

  wrapper: "w-[390px] h-[750px]", // 👈 Change this to test sizes
  phone: "w-[350px] h-[710px]", // 👈 Change this to match the wrapper
};

export default function AppPreviewStep({
  onDeploy,
  onBack,
  isLoading,
  isSuccess,
  summary = { zones: 0, staff: 0, washrooms: 0, cleaners: 0 },
  washroom_data: washrooms = [],
}) {
  const iframeRef = useRef(null);
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth) || {};
  const hasSubmitted = useRef(false);

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Modal State
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [hasDeployed, setHasDeployed] = useState(false);

  const handleDeployClick = () => {
    setShowDeployModal(true);
    setDeployStep(0);
    setIsLive(false);
    onDeploy();
  };

  // Fake animation progression
  useEffect(() => {
    if (showDeployModal && !isLive) {
      const timer = setInterval(() => {
        setDeployStep((prev) => {
          if (prev < 4) return prev + 1;
          return prev;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showDeployModal, isLive]);

  // Sync with actual API success
  useEffect(() => {
    if (deployStep >= 4 && isSuccess) {
      setIsLive(true);
      setHasDeployed(true);
    }
  }, [deployStep, isSuccess]);

  // ─── INTERCEPT IFRAME ACTIONS & INJECT DATA ────────────────────────────
  const handleIframeLoad = () => {
    try {
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentWindow) return;
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument || win.document;

      if (washrooms && washrooms.length > 0) {
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        
        /* 🚀 FORCE HIDE EXTERNAL NAVBARS/SIDEBARS */
        header:not(.preview-header), nav, aside, .stepper-nav {
          display: none !important;
        }

        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float { animation: subtle-float 5s ease-in-out infinite; }
        
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
          70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .pulse-node { border-radius: 50%; animation: pulse-ring 2s infinite; }

        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .animate-breathe { animation: breathe 8s ease-in-out infinite; }

        .premium-card {
          background: linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.92) 100%);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.8);
          box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.05), inset 0 1px 0 rgba(255,255,255,1);
          border-radius: 20px;
        }

        /* Fixed container that ALLOWS vertical scrolling */
        .preview-wrapper {
           position: fixed;
           inset: 0;
           z-index: 100;
           background-color: #f8fafc;
           background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
           background-size: 24px 24px;
           overflow-y: auto;
           overflow-x: hidden;
           display: flex;
           flex-direction: column;
        }
      `}</style>

      {/* ── FULL SCREEN VIEWPORT (Fixed layout, but internally scrollable) ── */}
      <div className="preview-wrapper font-jakarta pb-12 pt-2">
        {/* ── BACKGROUND GLOWS ── */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-100/40 rounded-full blur-[120px] animate-breathe"></div>
          <div className="absolute top-[20%] right-[-5%] w-[30vw] h-[400px] bg-emerald-50/60 rounded-full blur-[100px]"></div>
        </div>

        {/* ── EDUCATIONAL HELP DRAWER ── */}
        <StepHelpDrawer
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          title="App Preview Guide"
        >
          <div className="space-y-5 font-jakarta">
            <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <h3 className="font-bold text-[#0B1B3D] mb-1 text-sm">
                🎉 We are almost done!
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                The washrooms you set up, the usage categories you defined, and
                the cleaners you assigned are now live in this interactive
                preview.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-3 border-b pb-2">
                How to Test the App
              </h3>
              <ul className="space-y-4 text-xs text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-slate-800">Login:</strong> Enter any
                    10-digit mobile number to log in as a cleaner.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-slate-800">Start Task:</strong> Tap
                    the big blue "Start New Cleaning Task" button.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-slate-800">Select Location:</strong>{" "}
                    Choose a washroom from the list you created in Step 2.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-slate-800">Photos & Submit:</strong>{" "}
                    Tap the camera boxes to upload "Before" and "After" photos,
                    review the checklist, and submit.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </StepHelpDrawer>

        {/* ── HEADER (Inline & Centered Properly) ── */}
        <header className="preview-header w-full max-w-[1240px] mx-auto px-6 pt-4 pb-2 flex flex-col md:flex-row items-center justify-between z-50 shrink-0 gap-4 md:gap-0">
          <div className="w-full md:w-[30%] flex justify-start">
            <button
              onClick={onBack}
              className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors w-full md:w-auto justify-center"
            >
              ← Back
            </button>
          </div>

          <div className="w-full md:w-[40%] flex flex-col items-center justify-center text-center">
            <h1 className="text-[22px] md:text-[28px] font-black text-[#0B1B3D] tracking-tight leading-none">
              Test your setup before going live
            </h1>
            <p className="text-xs md:text-[14px] text-slate-500 font-medium mt-1.5">
              Explore the real app experience your cleaners will use every day.
            </p>
            <div className="w-12 h-1 bg-blue-500 rounded-full mt-2 md:mt-3"></div>
          </div>

          <div className="w-full md:w-[30%] flex justify-end gap-3">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="flex-1 md:flex-none bg-white border border-slate-200 text-[#0B1B3D] px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
            >
              <span className="text-amber-500 text-lg leading-none">❓</span>{" "}
              Instructions
            </button>

            {/* DYNAMIC MAIN BUTTON */}
            {hasDeployed || isSuccess ? (
              <a
                href={`/clientDashboard/${user?.company_id || ""}`}
                className="flex-1 md:flex-none bg-[#166534] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#14532d] transition-colors flex items-center justify-center gap-2"
              >
                📊 Go to Dashboard
              </a>
            ) : (
              <button
                onClick={handleDeployClick}
                disabled={isLoading}
                className="flex-1 md:flex-none bg-[#22c55e] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-[#16a34a] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? "⏳ Deploying..." : "🚀 Go Live"}
              </button>
            )}
          </div>
        </header>

        {/* ── MAIN GRID (Flex-1 fills remaining space, centers content) ── */}
        <div className="flex-1 w-full max-w-[1240px] mx-auto px-6 flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-10 relative z-20 mt-4 md:mt-2">
          {/* ── LEFT COLUMN: Platform Summary ── */}
          <div className="w-full sm:w-[320px] lg:w-[280px] xl:w-[300px] flex flex-col gap-4 order-2 lg:order-1 shrink-0">
            <div className="bg-white rounded-[24px] p-5 premium-card border border-slate-100">
              <h3 className="font-bold text-[#0B1B3D] mb-4 flex items-center gap-2.5 text-[15px]">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                Platform Summary
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50/80 rounded-[16px] p-4 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-blue-100/70 text-blue-600 flex items-center justify-center mb-1.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <span className="text-[22px] font-black text-[#0B1B3D] leading-none mb-1 tracking-tight">
                    {summary.zones || "0"}
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Zones
                  </span>
                </div>
                <div className="bg-slate-50/80 rounded-[16px] p-4 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-emerald-100/70 text-emerald-600 flex items-center justify-center mb-1.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <span className="text-[22px] font-black text-[#0B1B3D] leading-none mb-1 tracking-tight">
                    {summary.staff || "0"}
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Staff
                  </span>
                </div>
                <div className="bg-slate-50/80 rounded-[16px] p-4 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-amber-100/70 text-amber-500 flex items-center justify-center mb-1.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="16"
                        height="16"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M9 14h6"></path>
                      <path d="M12 10v8"></path>
                    </svg>
                  </div>
                  <span className="text-[22px] font-black text-[#0B1B3D] leading-none mb-1 tracking-tight">
                    {summary.washrooms || "0"}
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Washrooms
                  </span>
                </div>
                <div className="bg-slate-50/80 rounded-[16px] p-4 flex flex-col items-center justify-center border border-slate-100 shadow-sm">
                  <div className="w-9 h-9 rounded-full bg-rose-100/70 text-rose-500 flex items-center justify-center mb-1.5">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2v20"></path>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <span className="text-[22px] font-black text-[#0B1B3D] leading-none mb-1 tracking-tight">
                    {summary.cleaners || "0"}
                  </span>
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    Cleaners
                  </span>
                </div>
              </div>

              <div className="w-full h-px border-t border-dashed border-slate-200 my-5"></div>

              <div className="flex items-center gap-2 mb-3">
                <div className="text-blue-500 bg-blue-50 w-7 h-7 rounded-full flex items-center justify-center">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <h3 className="font-extrabold text-[#0B1B3D] text-[14px]">
                  Why preview the app?
                </h3>
              </div>
              <ul className="space-y-3">
                {[
                  "See exactly what your cleaners will see",
                  "Verify your data and access",
                  "Ensure a smooth go-live experience",
                  "Build confidence in your setup",
                ].map((text, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <svg
                      className="w-4 h-4 text-blue-500 shrink-0 mt-[2px]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3.5"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                    <span className="text-[12.5px] text-slate-600 font-semibold leading-tight">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── CENTER COLUMN: Phone Simulator ── */}
          <div
            className={`relative flex justify-center shrink-0 order-1 lg:order-2 z-10 mx-auto ${phoneSizeClasses.wrapper}`}
          >
            {/* Background SVG Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0 flex flex-col items-center justify-center w-[600px] h-[600px] opacity-80 hidden md:flex">
              <svg width="600" height="600" viewBox="0 0 600 600">
                <circle
                  cx="300"
                  cy="300"
                  r="280"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.05)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="300"
                  cy="300"
                  r="210"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.1)"
                  strokeWidth="2.5"
                />
                <circle
                  cx="300"
                  cy="300"
                  r="150"
                  fill="rgba(255,255,255,0.4)"
                  stroke="rgba(59, 130, 246, 0.2)"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            {/* Concentric Ellipses (Ripples - Base Platform) */}
            <div
              className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-[550px] h-[110px] rounded-[100%] hidden sm:block"
              style={{ boxShadow: "0 0 0 1px rgba(59, 130, 246, 0.15)" }}
            ></div>
            <div
              className="absolute bottom-[10px] left-1/2 -translate-x-1/2 w-[420px] h-[80px] rounded-[100%] bg-blue-50/40 hidden sm:block"
              style={{ boxShadow: "0 0 0 1.5px rgba(59, 130, 246, 0.25)" }}
            ></div>
            <div
              className="absolute bottom-[30px] left-1/2 -translate-x-1/2 w-[280px] h-[55px] rounded-[100%] bg-white/40 backdrop-blur-sm hidden sm:block"
              style={{ boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.4)" }}
            ></div>

            {/* Phone Frame */}
            <div
              className={`${phoneSizeClasses.phone} bg-white rounded-[44px] border-[10px] border-[#0f172a] relative z-10 flex flex-col overflow-hidden animate-float`}
              style={{
                boxShadow:
                  "0 35px 60px -15px rgba(15, 23, 42, 0.5), 0 0 0 1px #334155",
              }}
            >
              <div className="absolute inset-0 rounded-[34px] shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] pointer-events-none z-50"></div>

              {/* Fake Top Speaker/Camera Notch */}
              <div className="absolute top-0 inset-x-0 h-6 flex justify-center pointer-events-none z-30">
                <div className="w-[35%] h-[18px] bg-[#0f172a] rounded-b-[14px]"></div>
              </div>

              {/* Phone Content (Iframe) */}
              <div className="flex-1 w-full flex flex-col relative bg-white rounded-[32px] overflow-hidden">
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

          {/* ── RIGHT COLUMN: Feature Cards + Connecting Lines ── */}
          <div className="w-full sm:w-[320px] lg:w-[260px] xl:w-[280px] flex flex-col justify-center order-3 z-20 shrink-0 relative">
            <div className="relative flex flex-col gap-4 lg:gap-6 w-full">
              {/* BEAUTIFUL SVG CONNECTING LINES (Hidden on Mobile) */}
              <svg className="hidden lg:block absolute right-[100%] top-0 w-[60px] h-full overflow-visible z-10 pointer-events-none">
                <g
                  stroke="#94a3b8"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Connector 1 */}
                  <path d="M -15,100 C 20,100 20,45 60,45" />
                  <circle
                    cx="-15"
                    cy="100"
                    r="3.5"
                    fill="#3b82f6"
                    className="pulse-node"
                    style={{ color: "#3b82f6" }}
                  />
                  <circle
                    cx="60"
                    cy="45"
                    r="2.5"
                    fill="#94a3b8"
                    stroke="none"
                  />

                  {/* Connector 2 */}
                  <path d="M -15,220 C 20,220 20,135 60,135" />
                  <circle
                    cx="-15"
                    cy="220"
                    r="3.5"
                    fill="#10b981"
                    className="pulse-node"
                    style={{ color: "#10b981" }}
                  />
                  <circle
                    cx="60"
                    cy="135"
                    r="2.5"
                    fill="#94a3b8"
                    stroke="none"
                  />

                  {/* Connector 3 */}
                  <path d="M -15,360 C 20,360 20,225 60,225" />
                  <circle
                    cx="-15"
                    cy="360"
                    r="3.5"
                    fill="#a855f7"
                    className="pulse-node"
                    style={{ color: "#a855f7" }}
                  />
                  <circle
                    cx="60"
                    cy="225"
                    r="2.5"
                    fill="#94a3b8"
                    stroke="none"
                  />

                  {/* Connector 4 */}
                  <path d="M -15,480 C 20,480 20,315 60,315" />
                  <circle
                    cx="-15"
                    cy="480"
                    r="3.5"
                    fill="#f59e0b"
                    className="pulse-node"
                    style={{ color: "#f59e0b" }}
                  />
                  <circle
                    cx="60"
                    cy="315"
                    r="2.5"
                    fill="#94a3b8"
                    stroke="none"
                  />
                </g>
              </svg>

              <div className="premium-card p-4 flex gap-4 items-center relative z-20 h-[90px]">
                <div className="w-11 h-11 rounded-[12px] bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 border border-blue-100">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0B1B3D] text-[14px] mb-0.5">
                    Real App Preview
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug font-semibold">
                    Exactly what cleaners see.
                  </p>
                </div>
              </div>

              <div className="premium-card p-4 flex gap-4 items-center relative z-20 h-[90px]">
                <div className="w-11 h-11 rounded-[12px] bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <rect
                      x="5"
                      y="2"
                      width="14"
                      height="20"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0B1B3D] text-[14px] mb-0.5">
                    Mobile Optimized
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug font-semibold">
                    Fast on any device.
                  </p>
                </div>
              </div>

              <div className="premium-card p-4 flex gap-4 items-center relative z-20 h-[90px]">
                <div className="w-11 h-11 rounded-[12px] bg-purple-50 text-purple-500 flex items-center justify-center shrink-0 border border-purple-100">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <polyline points="9 12 11 14 15 10"></polyline>
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0B1B3D] text-[14px] mb-0.5">
                    Secure & Verified
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug font-semibold">
                    Log in securely with OTP.
                  </p>
                </div>
              </div>

              <div className="premium-card p-4 flex gap-4 items-center relative z-20 h-[90px]">
                <div className="w-11 h-11 rounded-[12px] bg-amber-50 text-amber-500 flex items-center justify-center shrink-0 border border-amber-100">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h4 className="font-extrabold text-[#0B1B3D] text-[14px] mb-0.5">
                    Live-Ready Setup
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-snug font-semibold">
                    All systems ready to launch!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL DEPLOYMENT (Success Match) ── */}
      {showDeployModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-lg p-6 md:p-8 relative animate-in zoom-in-95 duration-300">
            {isLive && (
              <button
                onClick={() => setShowDeployModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            )}

            <div className="flex items-center gap-4 mb-6">
              {!isLive ? (
                <div className="w-12 h-12 border-4 border-slate-100 border-t-[#1F4E79] rounded-full animate-spin shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#d1fae5] text-[#10b981] text-xl font-bold flex items-center justify-center shrink-0 scale-100 animate-in zoom-in-75 duration-300">
                  ✓
                </div>
              )}
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {isLive
                    ? "Facility is Live! 🎉"
                    : DEPLOY_STEPS[Math.min(deployStep, 3)].title}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {isLive
                    ? "Your client dashboard has been generated successfully."
                    : DEPLOY_STEPS[Math.min(deployStep, 3)].sub}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 mb-6">
              {DEPLOY_STEPS.map((step, idx) => {
                const isDone = deployStep > idx || isLive;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-[13.5px] font-bold transition-all duration-300 ${isDone ? "bg-[#d1fae5]/60 text-[#065f46] border border-[#a7f3d0]" : "bg-slate-50 text-slate-400 border border-slate-100 opacity-70"}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${isDone ? "bg-[#10b981] text-white shadow-sm" : "bg-slate-200 text-slate-500"}`}
                    >
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <span>{step.label}</span>
                  </div>
                );
              })}
            </div>

            {isLive && (
              <div className="text-center pt-2 animate-in fade-in slide-in-from-bottom-2">
                <a
                  href={`/clientDashboard/${user?.company_id || ""}`}
                  className="inline-flex items-center justify-center gap-2 w-full bg-[#166534] text-white py-3.5 rounded-xl font-bold text-[14px] hover:bg-[#14532d] shadow-[0_6px_20px_rgba(22,101,52,0.35)] transition-all hover:-translate-y-0.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                  </svg>
                  Open Generated Dashboard
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
                </a>
                <p className="text-[11.5px] text-slate-500 font-medium mt-3">
                  Your facility workspace is operational — cleaning personnel
                  can now access targets.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
