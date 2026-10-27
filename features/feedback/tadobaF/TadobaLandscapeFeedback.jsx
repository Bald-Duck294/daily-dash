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
        className="h-screen w-full bg-cover bg-bottom bg-no-repeat select-none flex flex-col justify-between overflow-hidden p-3 sm:p-5 lg:p-6 font-sans relative"
        style={{
          backgroundImage: "url('/tadoba-form/tadoba-master-bg-1080p.png')",
          backgroundColor: "#55b7f5",
        }}
      >
        
        {/* ============================================================== */}
        {/* TOP BAR: Left: TATR Logo | Center: Lang Selector | Right: SaafAI */}
        {/* ============================================================== */}
        <header className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 shrink-0 mb-2 sm:mb-3 px-2 sm:px-4">
          
          {/* Top Left: TATR Tadoba Logo (Transparent PNG, no white box) */}
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tadoba-form/tatr-logo.png"
              alt="TATR - Tadoba Andhari Tiger Reserve"
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-sm"
            />
          </div>

          {/* Center: Language Selector Pill */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-white/85 backdrop-blur-xs border border-white/60 rounded-full p-1 shadow-sm">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "mr", label: "मराठी" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    lang === item.code
                      ? "bg-[#284e3a] text-white shadow-xs"
                      : "text-gray-700 hover:text-gray-900 hover:bg-white/60"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Top Right: Fullscreen + SaafAI Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-full bg-white/85 backdrop-blur-xs border border-white/60 text-gray-600 hover:text-gray-900 hover:bg-white transition shadow-sm cursor-pointer"
              title="Toggle Fullscreen Kiosk"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <div className="flex flex-col items-end">
              <div className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">
                Saaf<span className="text-[#00A3E0]">AI</span>
              </div>
              <span className="text-[7px] sm:text-[9px] md:text-[10px] uppercase font-bold tracking-[0.22em] text-slate-600 mt-1">
                SMART FACILITY AI
              </span>
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* SCREEN 1: Rating Selection (Compact Sizing for Horizontal Display) */}
        {/* ============================================================== */}
        {currentPhase === "rating" && (
          <main className="flex-1 flex flex-col justify-center items-center my-auto py-2 sm:py-3 text-center max-w-5xl mx-auto w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-1 sm:mb-2">
              {t.title}
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base mb-5 sm:mb-7 font-semibold">
              {t.subtitle}
            </p>

            {/* 5 TIGER RATING BUTTONS IN SINGLE HORIZONTAL ROW */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 md:gap-6 lg:gap-8 w-full max-w-4xl px-2">
              {RATING_OPTIONS.map((option) => {
                const labelText = option.label[lang] || option.label.en;

                return (
                  <div
                    key={option.id}
                    onClick={() => handleRatingSelect(option)}
                    className="flex flex-col items-center group cursor-pointer transition-all duration-300 transform active:scale-95"
                  >
                    {/* Tiger Emoji Circle - Sized for 31.5cm x 21.5cm horizontal screen */}
                    <div className="relative aspect-square w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full overflow-hidden transition-all duration-300 group-hover:scale-108 group-hover:shadow-2xl shadow-lg ring-3 ring-white/90">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={option.image}
                        alt={labelText}
                        className="w-full h-full object-cover transition-transform duration-300"
                      />
                    </div>

                    {/* Rating Label Pill Below Tiger */}
                    <div
                      className={`mt-2 sm:mt-3 px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full font-bold text-xs sm:text-sm md:text-base transition-all duration-300 shadow-sm group-hover:shadow-md ${option.pillBg} ${option.pillText}`}
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
          <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center my-auto animate-in fade-in duration-300 max-w-xl mx-auto w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-white/80">
            
            {/* Big Bouncing Emoji */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full overflow-hidden shadow-2xl mb-4 animate-bounce ring-4 ring-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedRating.image}
                alt="Rating submitted"
                className="w-full h-full object-cover"
              />
            </div>

            {/* "You rated Good" Pill */}
            <div
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full font-bold text-base sm:text-lg md:text-xl mb-3 shadow-xs ${selectedRating.pillBg} ${selectedRating.pillText}`}
            >
              <CheckCircle2 size={20} />
              <span>
                {t.youRated}{" "}
                <span className="font-extrabold underline">{ratingLabel}</span>
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
              {t.thanksTitle}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-md mx-auto mb-5 font-medium">
              {t.thanksSubtitle}
            </p>

            {/* 15-Second Auto-Reset Timer Bar */}
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(bouncingTimer / 15) * 100}%` }}
              />
            </div>

            <p className="text-xs text-gray-400 mb-6 font-semibold">
              {t.resettingText} {bouncingTimer}s...
            </p>

            {/* Action Buttons: "Give Feedback" (Opens Screen 3) or "Next Visitor" */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              {/* PRIMARY: Give Feedback */}
              <button
                type="button"
                onClick={handleOpenFeedbackDetails}
                className="px-7 sm:px-9 py-3 rounded-2xl bg-[#284e3a] hover:bg-[#1e3a29] text-white font-bold text-sm sm:text-base transition-all shadow-md hover:shadow-lg flex items-center gap-2.5 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <MessageSquare size={18} />
                <span>{t.giveFeedbackBtn}</span>
              </button>

              {/* SECONDARY: Next Visitor / Done */}
              <button
                type="button"
                onClick={resetToHome}
                className="px-5 sm:px-6 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm sm:text-base transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw size={16} />
                <span>{t.resetNow}</span>
              </button>
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* SCREEN 3: Detailed Feedback Window (Horizontal 2-Column Split, No Scroll) */}
        {/* ============================================================== */}
        {currentPhase === "details" && selectedRating && (
          <main className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-stretch min-h-0 py-1">
            
            {/* Left Column (5/12): Banner + Selected Rating */}
            <div className="md:col-span-5 flex flex-col gap-4 bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-white/80 shadow-lg">
              
              {/* Tadoba Header Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-xs h-36 sm:h-44 shrink-0 bg-[#faf8f5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tadoba_banner_new.png"
                  alt="Tadoba-Andhari Tiger Reserve"
                  className="w-full h-full object-cover block"
                />
              </div>

              {/* Selected Rating Card */}
              <div className="flex items-center gap-3.5 p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl shrink-0 shadow-2xs">
                <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-xs border border-emerald-300">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedRating.image}
                    alt={selectedRating.id}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      {t.yourRating}
                    </span>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                      {t.recordedBadge}
                    </span>
                  </div>
                  <div className="text-lg font-extrabold text-emerald-950 truncate mt-0.5">
                    {ratingLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (7/12): Issue Chips + Comments + Submit (Patches Entry) */}
            <div className="md:col-span-7 flex flex-col justify-between bg-white/95 backdrop-blur-md border border-white/80 rounded-3xl p-4 sm:p-5 shadow-lg">
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {t.issuesTitle}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t.issuesSubtitle}
                    </p>
                  </div>

                  {/* No Issues Toggle */}
                  <button
                    type="button"
                    onClick={toggleNoIssues}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                      noIssuesSelected
                        ? "bg-[#284e3a] text-white border-[#284e3a]"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {noIssuesSelected && <Check size={12} />}
                    <span>{t.noIssues}</span>
                  </button>
                </div>

                {/* Quick Issue Chips Grid (2x4 on landscape) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {QUICK_ISSUES.map((issue) => {
                    const isSelected = selectedIssues.includes(issue.id);
                    const issueText = issue.label[lang] || issue.label.en;

                    return (
                      <button
                        key={issue.id}
                        type="button"
                        onClick={() => toggleIssueSelection(issue.id)}
                        className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                            : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {isSelected && <Check size={13} />}
                        <span>{issueText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Additional Comments Input */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t.commentsLabel}
                  </label>
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#284e3a] focus:border-[#284e3a] resize-none text-gray-900 placeholder-gray-400"
                    placeholder={t.commentsPlaceholder}
                  />
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSkipPhase3}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition cursor-pointer"
                >
                  {t.skipIssues}
                </button>

                <button
                  type="button"
                  onClick={handleSubmitPhase3}
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#284e3a] hover:bg-[#1e3a29] text-white shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-70"
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
          </main>
        )}

        {/* ============================================================== */}
        {/* SCREEN 4: Thank You Screen (Auto-resets in 3s) */}
        {/* ============================================================== */}
        {currentPhase === "thankyou" && (
          <main className="flex-1 flex flex-col items-center justify-center p-4 text-center animate-in fade-in duration-300 my-auto">
            {selectedRating && (
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 rounded-full overflow-hidden shadow-xl mb-4 animate-bounce">
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
              className="px-6 py-2.5 rounded-2xl bg-[#284e3a] hover:bg-[#1e3a29] text-white font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer"
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
