"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Check,
  Send,
  Clock,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { feedbackApi } from "@/features/feedback/feedback.api";

// 5 Tiger Rating Options matching assets in /public/tadoba-form/ (ordered Poor to Excellent)
const RATING_OPTIONS = [
  {
    id: "poor",
    rating: 2,
    image: "/tadoba-form/very_poor.png",
    label: {
      en: "Poor",
      hi: "खराब",
      mr: "वाईट",
    },
    pillBg: "bg-[#fedada] hover:bg-[#fecaca]",
    pillText: "text-[#a32824]",
    border: "border-rose-200",
  },
  {
    id: "fair",
    rating: 4,
    image: "/tadoba-form/fair.png",
    label: {
      en: "Fair",
      hi: "साधारण",
      mr: "साधारण",
    },
    pillBg: "bg-[#fde7d4] hover:bg-[#fed7aa]",
    pillText: "text-[#aa4e18]",
    border: "border-orange-200",
  },
  {
    id: "good",
    rating: 6,
    image: "/tadoba-form/good.png",
    label: {
      en: "Good",
      hi: "अच्छा",
      mr: "चांगले",
    },
    pillBg: "bg-[#fef0cb] hover:bg-[#fef08a]",
    pillText: "text-[#8a600a]",
    border: "border-amber-200",
  },
  {
    id: "very_good",
    rating: 8,
    image: "/tadoba-form/very_good.png",
    label: {
      en: "Very Good",
      hi: "बहुत अच्छा",
      mr: "खूप चांगले",
    },
    pillBg: "bg-[#e2f5cb] hover:bg-[#d9f99d]",
    pillText: "text-[#416914]",
    border: "border-lime-200",
  },
  {
    id: "excellent",
    rating: 10,
    image: "/tadoba-form/excellent.png",
    label: {
      en: "Excellent",
      hi: "उत्कृष्ट",
      mr: "उत्कृष्ट",
    },
    pillBg: "bg-[#d0f5e1] hover:bg-[#bbf7d0]",
    pillText: "text-[#0d6e42]",
    border: "border-emerald-200",
  },
];

// Quick issues list for Phase 3 (Details screen)
const QUICK_ISSUES = [
  { id: 1, label: { en: "Dirty Toilets", hi: "गंदे शौचालय", mr: "अस्वच्छ शौचालय" } },
  { id: 3, label: { en: "Foul Odor", hi: "बदबू", mr: "दुर्गंधी" } },
  { id: 2, label: { en: "Wet Floor", hi: "गीला फर्श", mr: "ओला मजला" } },
  { id: 7, label: { en: "No Water", hi: "पानी नहीं है", mr: "पाणी नाही" } },
  { id: 14, label: { en: "No Soap", hi: "साबुन नहीं है", mr: "साबण नाही" } },
  { id: 4, label: { en: "Spit Stains", hi: "थूक के दाग", mr: "पानाचे डाग" } },
  { id: 5, label: { en: "Full Dustbin", hi: "कचरा पेटी भरी है", mr: "कचराकुंडी भरली आहे" } },
  { id: 17, label: { en: "Poor Lighting", hi: "कम रोशनी", mr: "कमी प्रकाश" } },
];

const TRANSLATIONS = {
  en: {
    title: "Rate Your Washroom Experience",
    subtitle: "Tap an emoji to record your instant review",
    thanksTitle: "Thank You for Your Feedback!",
    thanksSubtitle: "Your review has been successfully recorded.",
    youRated: "You rated",
    giveFeedbackBtn: "Give Feedback",
    resettingText: "Next visitor in",
    resetNow: "Next Visitor",
    issuesTitle: "What could be improved?",
    issuesSubtitle: "Select any issues you observed (optional):",
    noIssues: "No Issues / Clean",
    commentsLabel: "Additional comments (optional):",
    commentsPlaceholder: "Share more details about your experience...",
    submitIssues: "Submit Feedback",
    skipIssues: "Skip & Finish",
    submitting: "Submitting...",
    ratingSaved: "Rating recorded! Add optional details below:",
    yourRating: "Your Rating:",
    recordedBadge: "Recorded ✓",
  },
  hi: {
    title: "अपने शौचालय के अनुभव को रेट करें",
    subtitle: "अपनी तत्काल समीक्षा दर्ज करने के लिए किसी इमोजी पर टैप करें",
    thanksTitle: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    thanksSubtitle: "आपकी समीक्षा सफलतापूर्वक दर्ज कर ली गई है।",
    youRated: "आपने रेट किया",
    giveFeedbackBtn: "प्रतिक्रिया दें",
    resettingText: "अगले आगंतुक के लिए",
    resetNow: "अगला आगंतुक",
    issuesTitle: "क्या सुधार किया जा सकता है?",
    issuesSubtitle: "अपनी देखी गई समस्याएं चुनें (वैकल्पिक):",
    noIssues: "कोई समस्या नहीं / साफ",
    commentsLabel: "अतिरिक्त टिप्पणी (वैकल्पिक):",
    commentsPlaceholder: "अपने अनुभव के बारे में अधिक विवरण साझा करें...",
    submitIssues: "प्रतिक्रिया जमा करें",
    skipIssues: "छोड़ें और समाप्त करें",
    submitting: "जमा हो रहा है...",
    ratingSaved: "रेटिंग दर्ज हुई! नीचे वैकल्पिक विवरण जोड़ें:",
    yourRating: "आपकी रेटिंग:",
    recordedBadge: "दर्ज हुआ ✓",
  },
  mr: {
    title: "तुमचा स्वच्छतागृह अनुभव रेट करा",
    subtitle: "तुमचा त्वरित अभिप्राय नोंदवण्यासाठी इमोजीवर टॅप करा",
    thanksTitle: "आपल्या अभिप्रायाबद्दल धन्यवाद!",
    thanksSubtitle: "तुमचा अभिप्राय यशस्वीरीत्या नोंदवला गेला आहे.",
    youRated: "तुम्ही रेट केले",
    giveFeedbackBtn: "अभिप्राय नोंदवा",
    resettingText: "पुढील अभ्यागतासाठी",
    resetNow: "पुढील अभ्यागत",
    issuesTitle: "काय सुधारणा केली जाऊ शकते?",
    issuesSubtitle: "तुम्ही अनुभवलेल्या समस्या निवडा (पर्यायी):",
    noIssues: "कोणतीही समस्या नाही / स्वच्छ",
    commentsLabel: "अतिरिक्त टिप्पण्या (पर्यायी):",
    commentsPlaceholder: "तुमच्या अनुभवाबद्दल अधिक माहिती सांगा...",
    submitIssues: "अभिप्राय नोंदवा",
    skipIssues: "वगळा आणि समाप्त करा",
    submitting: "नोंदवत आहे...",
    ratingSaved: "रेटिंग नोंदवले गेले! खालील पर्यायी माहिती जोडा:",
    yourRating: "तुमचे रेटिंग:",
    recordedBadge: "नोंदवले ✓",
  },
};

export default function TadobaLandscapeFeedback() {
  const searchParams = useSearchParams();

  // Language management - shared and consistent across all screens
  const [lang, setLang] = useState("en"); // 'en' | 'hi' | 'mr'

  // Kiosk Location / Company resolution & persistence
  const rawLoc = searchParams.get("locationId");
  const locMatch = rawLoc ? rawLoc.toString().match(/\d+/) : null;
  const rawComp = searchParams.get("companyId");
  const compMatch = rawComp ? rawComp.toString().match(/\d+/) : null;

  const [locationId, setLocationId] = useState("2248");
  const [companyId, setCompanyId] = useState("95");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLoc = localStorage.getItem("saafai_kiosk_locationId");
      const savedComp = localStorage.getItem("saafai_kiosk_companyId");

      const finalLoc = locMatch ? locMatch[0] : savedLoc || "2248";
      const finalComp = compMatch ? compMatch[0] : savedComp || "95";

      setLocationId(finalLoc);
      setCompanyId(finalComp);

      if (locMatch?.[0]) localStorage.setItem("saafai_kiosk_locationId", locMatch[0]);
      if (compMatch?.[0]) localStorage.setItem("saafai_kiosk_companyId", compMatch[0]);
    }
  }, [locMatch, compMatch]);

  // Screen Flow:
  // 1. 'rating'   : Home screen with 5 emojis
  // 2. 'bouncing' : Bouncing emoji screen with "You rated [Good]", 15s timer, "Give Feedback" button
  // 3. 'details'  : Horizontal 2-column detailed feedback window (banner, issue chips, comments)
  // 4. 'thankyou' : Final brief confirmation screen
  const [currentPhase, setCurrentPhase] = useState("rating");
  const [selectedRating, setSelectedRating] = useState(null);
  const [submittedReviewId, setSubmittedReviewId] = useState(null);

  // Phase 3 (Details) states
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [noIssuesSelected, setNoIssuesSelected] = useState(false);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timers
  const [bouncingTimer, setBouncingTimer] = useState(15); // 15s on bouncing screen
  const [thankYouCountdown, setThankYouCountdown] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const bouncingTimerRef = useRef(null);
  const thankYouTimerRef = useRef(null);

  // Handle Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Reset form completely back to Screen 1 (Home)
  const resetToHome = () => {
    if (bouncingTimerRef.current) clearInterval(bouncingTimerRef.current);
    if (thankYouTimerRef.current) clearInterval(thankYouTimerRef.current);
    setCurrentPhase("rating");
    setSelectedRating(null);
    setSubmittedReviewId(null);
    setSelectedIssues([]);
    setNoIssuesSelected(false);
    setComments("");
    setIsSubmitting(false);
    setBouncingTimer(15);
    setThankYouCountdown(3);
  };

  // 15-Second Auto-Reset Timer for Screen 2 (Bouncing Emoji Screen)
  useEffect(() => {
    if (currentPhase === "bouncing") {
      setBouncingTimer(15);

      bouncingTimerRef.current = setInterval(() => {
        setBouncingTimer((prev) => {
          if (prev <= 1) {
            clearInterval(bouncingTimerRef.current);
            resetToHome();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (bouncingTimerRef.current) clearInterval(bouncingTimerRef.current);
      };
    }
  }, [currentPhase]);


  // 3-Second Timer for Screen 4 (Thank You)
  useEffect(() => {
    if (currentPhase === "thankyou") {
      setThankYouCountdown(3);

      thankYouTimerRef.current = setInterval(() => {
        setThankYouCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(thankYouTimerRef.current);
            resetToHome();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (thankYouTimerRef.current) clearInterval(thankYouTimerRef.current);
      };
    }
  }, [currentPhase]);

  // Phase 1: Tap Rating Emoji -> Immediately records review (POST) and moves to Screen 2 (Bouncing Emoji)
  const handleRatingSelect = async (option) => {
    setSelectedRating(option);
    try {
      setIsSubmitting(true);
      const payload = {
        rating: option.rating,
        location_id: locationId,
        companyId: companyId,
        reason_ids: [0],
        description: "",
      };

      const res = await feedbackApi.submitReview(payload);
      const newId = res?.data?.id || res?.id || (res?.data && res.data[0]?.id);
      if (newId) {
        setSubmittedReviewId(newId.toString());
      }
    } catch (error) {
      console.error("Initial rating save failed:", error);
    } finally {
      setIsSubmitting(false);
      // Advance to Screen 2 (Bouncing Emoji Screen with "You rated Good")
      setCurrentPhase("bouncing");
    }
  };

  // Phase 2 -> Phase 3: Click "Give Feedback" button
  const handleOpenFeedbackDetails = () => {
    if (bouncingTimerRef.current) clearInterval(bouncingTimerRef.current);
    setCurrentPhase("details");
  };

  // Phase 3: Toggle Issue Selection
  const toggleIssueSelection = (issueId) => {
    setNoIssuesSelected(false);
    setSelectedIssues((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
  };

  const toggleNoIssues = () => {
    if (noIssuesSelected) {
      setNoIssuesSelected(false);
    } else {
      setNoIssuesSelected(true);
      setSelectedIssues([]);
    }
  };

  // Phase 3: Submit Details -> PATCHes the existing review (Only 1 entry created)
  const handleSubmitPhase3 = async () => {
    try {
      setIsSubmitting(true);
      if (submittedReviewId) {
        const finalReasons = noIssuesSelected
          ? [0]
          : selectedIssues.length > 0
          ? selectedIssues
          : [0];

        await feedbackApi.patchReview(submittedReviewId, {
          reason_ids: finalReasons,
          description: comments?.trim() || "",
        });
      }
      setCurrentPhase("thankyou");
    } catch (error) {
      console.error("Patching review details failed:", error);
      setCurrentPhase("thankyou");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Phase 3: Skip & Finish
  const handleSkipPhase3 = () => {
    resetToHome();
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const ratingLabel = selectedRating
    ? selectedRating.label[lang] || selectedRating.label.en
    : "";

  return (
    <>
      <Toaster position="top-center" />

      {/* HORIZONTAL KIOSK CONTAINER (Optimized for 31.5cm x 21.5cm Landscape Screen) */}
      <div
        className={`h-screen w-full select-none flex flex-col justify-between overflow-hidden font-sans relative transition-all duration-300 ${
          currentPhase === "rating"
            ? "bg-cover bg-center bg-no-repeat p-3 sm:p-5 lg:p-6"
            : "bg-[#FAF7F2] p-2.5 sm:p-3.5 lg:p-4"
        }`}
        style={
          currentPhase === "rating"
            ? {
                backgroundImage: "url('/tadoba-form/tadoba-clean-bg.jpg')",
                backgroundColor: "#bfe5fe",
              }
            : {
                backgroundColor: "#FAF7F2",
              }
        }
      >
        
        {/* ============================================================== */}
        {/* TOP BAR: Left: TATR Logo | Center: Lang Selector | Right: SaafAI */}
        {/* ============================================================== */}
        <header className="w-full max-w-[94vw] 2xl:max-w-[1600px] mx-auto flex items-center justify-between relative z-20 shrink-0 mb-1 sm:mb-3 px-3 sm:px-6">
          
          {/* Top Left: TATR Tadoba Logo (Transparent PNG, no white box) */}
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tadoba-form/tatr-logo.png"
              alt="TATR - Tadoba Andhari Tiger Reserve"
              className="h-12 sm:h-16 md:h-18 lg:h-22 xl:h-24 w-auto object-contain drop-shadow-xs"
            />
          </div>

          {/* Center: Language Selector Pill */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-white/90 border border-stone-200/90 rounded-full p-1 shadow-2xs">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "mr", label: "मराठी" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-bold transition-all cursor-pointer ${
                    lang === item.code
                      ? "bg-[#284e3a] text-white shadow-xs"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top Right: Fullscreen + SaafAI Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 lg:p-3 rounded-full bg-white/90 border border-stone-200/90 text-gray-600 hover:text-gray-900 hover:bg-white transition shadow-2xs cursor-pointer"
              title="Toggle Fullscreen Kiosk"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <div className="flex flex-col items-end">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Saaf<span className="text-[#00A3E0]">AI</span>
              </div>
              <span className="text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] uppercase font-bold tracking-[0.24em] text-slate-500 mt-0.5">
                SMART FACILITY AI
              </span>
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* SCREEN 1: Rating Selection (Well-Balanced Tiger Emojis)       */}
        {/* ============================================================== */}
        {currentPhase === "rating" && (
          <main className="flex-1 flex flex-col justify-center items-center my-auto py-2 sm:py-4 text-center w-full max-w-[94vw] 2xl:max-w-[1600px] mx-auto px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-slate-900 tracking-tight mb-2 sm:mb-4">
              {t.title}
            </h1>
            <p className="text-slate-700 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-10 font-semibold">
              {t.subtitle}
            </p>

            {/* 5 TIGER RATING BUTTONS IN SINGLE HORIZONTAL ROW */}
            <div className="grid grid-cols-5 gap-3 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12 w-full max-w-6xl xl:max-w-7xl 2xl:max-w-[1550px] px-2 sm:px-4">
              {RATING_OPTIONS.map((option) => {
                const labelText = option.label[lang] || option.label.en;

                return (
                  <div
                    key={option.id}
                    onClick={() => handleRatingSelect(option)}
                    className="flex flex-col items-center group cursor-pointer transition-all duration-300 transform active:scale-95"
                  >
                    {/* Tiger Emoji Circle - Increased by ~30px for Optimal Touch Target */}
                    <div className="relative aspect-square w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 2xl:w-60 2xl:h-60 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:shadow-2xl shadow-xl ring-4 sm:ring-6 ring-white/95">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={option.image}
                        alt={labelText}
                        className="w-full h-full object-cover transition-transform duration-300"
                      />
                    </div>

                    {/* Rating Label Pill Below Tiger */}
                    <div
                      className={`mt-3 sm:mt-4 lg:mt-6 px-4 py-1.5 sm:px-6 sm:py-2.5 lg:px-7 lg:py-3 rounded-full font-black text-xs sm:text-base md:text-lg lg:text-xl xl:text-2xl transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-105 ${option.pillBg} ${option.pillText}`}
                    >
                      {labelText}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* SCREEN 2: Bouncing Emoji Screen ("You rated Good" + "Give Feedback" button) */}
        {/* ============================================================== */}
        {currentPhase === "bouncing" && selectedRating && (
          <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center my-auto animate-in fade-in duration-300 w-full max-w-[92vw] xl:max-w-5xl mx-auto">
            
            {/* Big Bouncing Emoji */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 md:w-56 md:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-full overflow-hidden shadow-2xl mb-4 sm:mb-6 animate-bounce ring-4 sm:ring-8 ring-emerald-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedRating.image}
                alt="Rating submitted"
                className="w-full h-full object-cover"
              />
            </div>

            {/* "You rated Good" Pill */}
            <div
              className={`inline-flex items-center gap-2.5 sm:gap-3 px-8 py-3 sm:px-10 sm:py-4 rounded-full font-black text-lg sm:text-2xl md:text-3xl lg:text-4xl mb-4 sm:mb-6 shadow-md ${selectedRating.pillBg} ${selectedRating.pillText}`}
            >
              <CheckCircle2 size={20} />
              <span>
                {t.youRated}{" "}
                <span className="font-extrabold underline">{ratingLabel}</span>
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight mb-2 sm:mb-4">
              {t.thanksTitle}
            </h2>

            <p className="text-slate-600 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl max-w-2xl mx-auto mb-5 sm:mb-8 font-medium">
              {t.thanksSubtitle}
            </p>

            {/* 15-Second Auto-Reset Timer Bar */}
            <div className="w-full max-w-xs bg-gray-200/80 rounded-full h-2.5 overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(bouncingTimer / 15) * 100}%` }}
              />
            </div>

            <p className="text-xs text-gray-500 mb-6 font-semibold">
              {t.resettingText} {bouncingTimer}s...
            </p>

            {/* Action Buttons: "Give Feedback" (Opens Screen 3) or "Next Visitor" */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {/* PRIMARY: Give Feedback */}
              <button
                type="button"
                onClick={handleOpenFeedbackDetails}
                className="px-8 sm:px-12 lg:px-14 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl bg-[#284e3a] hover:bg-[#1e3a29] text-white font-extrabold text-base sm:text-xl lg:text-2xl transition-all shadow-md hover:shadow-xl flex items-center gap-3 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <MessageSquare size={19} />
                <span>{t.giveFeedbackBtn}</span>
              </button>

              {/* SECONDARY: Next Visitor / Done */}
              <button
                type="button"
                onClick={resetToHome}
                className="px-6 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 rounded-2xl sm:rounded-3xl bg-white hover:bg-gray-100 text-gray-700 font-bold text-sm sm:text-lg lg:text-xl border border-stone-200 transition-all flex items-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <RotateCcw size={16} />
                <span>{t.resetNow}</span>
              </button>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* SCREEN 3: Detailed Feedback Window (Properly Sized Hero Banner, No Scroll) */}
        {/* ============================================================== */}
        {currentPhase === "details" && selectedRating && (
          <main className="flex-1 w-full max-w-[94vw] xl:max-w-7xl 2xl:max-w-[1550px] mx-auto flex flex-col justify-center min-h-0 my-auto py-1 sm:py-3 relative z-20">
            <div className="bg-white rounded-3xl sm:rounded-4xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col">
              
              {/* 1. TOP HERO BANNER: Full-width uncropped banner with comfortable generous height */}
              <div className="relative w-full overflow-hidden bg-[#FAF7F2] border-b border-stone-200 shrink-0 h-[26vh] min-h-[170px] max-h-[380px] xl:h-[30vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tadoba_banner_new.png"
                  alt="Your voice cleans India - Tadoba-Andhari Tiger Reserve"
                  className="w-full h-full object-cover object-center block"
                />
              </div>

              {/* 2. BODY CONTENT: Balanced 2-Column Split */}
              <div className="p-4 sm:p-6 lg:p-7 xl:p-8 grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 xl:gap-8 items-stretch">
                
                {/* Left Column (5/12): Rating Confirmation & Written Feedback */}
                <div className="md:col-span-5 flex flex-col justify-between gap-2.5">
                  
                  {/* Selected Rating Badge */}
                  <div className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 lg:p-5 bg-emerald-50/90 border border-emerald-200 rounded-2xl sm:rounded-3xl shadow-2xs">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden shrink-0 shadow-xs border-2 sm:border-3 border-emerald-400 ring-2 ring-emerald-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedRating.image}
                        alt={selectedRating.id}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] sm:text-xs lg:text-sm font-bold uppercase tracking-wider text-emerald-800">
                          {t.yourRating}
                        </span>
                        <span className="text-[11px] sm:text-xs lg:text-sm font-black px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 shrink-0">
                          {t.recordedBadge}
                        </span>
                      </div>
                      <div className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-black text-emerald-950 truncate mt-0.5">
                        {ratingLabel}
                      </div>
                    </div>
                  </div>

                  {/* Additional Comments Input */}
                  <div className="flex-1 flex flex-col justify-end">
                    <label className="block text-xs sm:text-sm lg:text-base font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                      <MessageSquare size={13} className="text-[#284e3a]" />
                      <span>{t.commentsLabel}</span>
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={2}
                      className="w-full px-3.5 py-2 sm:py-3 text-xs sm:text-sm lg:text-base border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#284e3a] focus:border-[#284e3a] resize-none text-gray-900 placeholder-gray-400 bg-gray-50/70 focus:bg-white transition"
                      placeholder={t.commentsPlaceholder}
                    />
                  </div>
                </div>

                {/* Right Column (7/12): Improvement Issues Checklist & Actions */}
                <div className="md:col-span-7 flex flex-col justify-between gap-2.5 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 lg:pl-5 pt-2.5 md:pt-0">
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div>
                        <h3 className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 leading-tight">
                          {t.issuesTitle}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 hidden sm:block font-medium">
                          {t.issuesSubtitle}
                        </p>
                      </div>

                      {/* No Issues Toggle */}
                      <button
                        type="button"
                        onClick={toggleNoIssues}
                        className={`px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm lg:text-base font-bold transition flex items-center gap-1.5 border cursor-pointer shrink-0 ${
                          noIssuesSelected
                            ? "bg-[#284e3a] text-white border-[#284e3a] shadow-xs"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {noIssuesSelected && <Check size={12} className="stroke-[3]" />}
                        <span>{t.noIssues}</span>
                      </button>
                    </div>

                    {/* Quick Issue Chips Grid (2x4 on landscape) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 mb-2.5 sm:mb-3.5">
                      {QUICK_ISSUES.map((issue) => {
                        const isSelected = selectedIssues.includes(issue.id);
                        const issueText = issue.label[lang] || issue.label.en;

                        return (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => toggleIssueSelection(issue.id)}
                            className={`p-2.5 sm:p-3.5 lg:p-4 rounded-xl sm:rounded-2xl border text-xs sm:text-sm lg:text-base font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 min-h-[46px] sm:min-h-[54px] lg:min-h-[60px] ${
                              isSelected
                                ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                                : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {isSelected && <Check size={11} className="stroke-[3]" />}
                            <span className="truncate">{issueText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSkipPhase3}
                      className="px-5 py-2.5 sm:px-7 sm:py-3.5 lg:px-8 lg:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm lg:text-base font-bold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                    >
                      {t.skipIssues}
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitPhase3}
                      disabled={isSubmitting}
                      className="px-6 py-2.5 sm:px-9 sm:py-3.5 lg:px-12 lg:py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm lg:text-base xl:text-lg font-extrabold bg-[#284e3a] hover:bg-[#1e3a29] text-white shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer disabled:opacity-70 active:scale-95"
                    >
                      {isSubmitting ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{t.submitIssues}</span>
                          <Send size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* SCREEN 4: Thank You Screen (Auto-resets in 3s) */}
        {/* ============================================================== */}
        {currentPhase === "thankyou" && (
          <main className="flex-1 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300 my-auto">
            {selectedRating && (
              <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 rounded-full overflow-hidden shadow-xl mb-4 animate-bounce">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedRating.image}
                  alt="Review submitted"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-bold mb-2 shadow-xs">
              <CheckCircle2 size={15} />
              <span>Review Recorded Successfully</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              {t.thanksTitle}
            </h2>

            <p className="text-gray-600 text-xs sm:text-sm md:text-base max-w-lg mx-auto mb-5 font-medium">
              {t.thanksSubtitle}
            </p>

            {/* Countdown bar */}
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-1.5 overflow-hidden mb-3">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(thankYouCountdown / 3) * 100}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 mb-4 font-semibold">
              {t.resettingText} {thankYouCountdown}s...
            </p>

            <button
              onClick={resetToHome}
              className="px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl sm:rounded-3xl bg-[#284e3a] hover:bg-[#1e3a29] text-white font-bold text-sm sm:text-base lg:text-lg transition-all shadow-md flex items-center gap-2.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              <span>{t.resetNow}</span>
            </button>
          </main>
        )}

      </div>
    </>
  );
}
