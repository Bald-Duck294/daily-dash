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
  Star,
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
    image: "/tadoba-form/very_good.png?v=2",
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
    welcomeTitle: "Welcome to Tadoba-Andhari Tiger Reserve",
    recordingRating: "Recording your rating...",
    slowNetworkNotice: "Forest network is slow, taking a moment...",
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
    todayRatingTitle: "Today's Rating",
    ratingsToday: "ratings today",
  },
  hi: {
    welcomeTitle: "ताडोबा-अंधारी टाइगर रिजर्व में आपका स्वागत है",
    recordingRating: "आपकी रेटिंग दर्ज की जा रही है...",
    slowNetworkNotice: "वन क्षेत्र में नेटवर्क धीमा है, कृपया प्रतीक्षा करें...",
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
    todayRatingTitle: "आज की रेटिंग",
    ratingsToday: "रेटिंग्स आज",
  },
  mr: {
    welcomeTitle: "ताडोबा-अंधारी व्याघ्र प्रकल्पात आपले स्वागत आहे",
    recordingRating: "तुमचे रेटिंग नोंदवत आहे...",
    slowNetworkNotice: "वनपरिक्षेत्रात नेटवर्क मंद आहे, थोडा वेळ लागत आहे...",
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
    todayRatingTitle: "आजचे रेटिंग",
    ratingsToday: "आजचे अभिप्राय",
  },
};


// Ambient Falling Forest Leaves configuration for live photo-frame feel
const FALLING_LEAVES = [
  { id: 1, left: "7%", duration: 13, delay: 0, size: "w-6 h-6", anim: "forestLeafFallLeft", img: "/leaf_01.png" },
  { id: 2, left: "17%", duration: 16, delay: 3.5, size: "w-5 h-5", anim: "forestLeafFallRight", img: "/leaf_02.png" },
  { id: 3, left: "28%", duration: 14, delay: 7.2, size: "w-7 h-7", anim: "forestLeafFallLeft", img: "/leaf_03.png" },
  { id: 4, left: "41%", duration: 18, delay: 1.5, size: "w-6 h-6", anim: "forestLeafFallRight", img: "/leaf_04.png" },
  { id: 5, left: "53%", duration: 15, delay: 9.8, size: "w-5 h-5", anim: "forestLeafFallLeft", img: "/leaf_01.png" },
  { id: 6, left: "64%", duration: 13.5, delay: 4.5, size: "w-7 h-7", anim: "forestLeafFallRight", img: "/leaf_02.png" },
  { id: 7, left: "76%", duration: 17, delay: 2.2, size: "w-6 h-6", anim: "forestLeafFallLeft", img: "/leaf_03.png" },
  { id: 8, left: "86%", duration: 15.5, delay: 8.4, size: "w-5 h-5", anim: "forestLeafFallRight", img: "/leaf_04.png" },
  { id: 9, left: "94%", duration: 14, delay: 5.8, size: "w-6 h-6", anim: "forestLeafFallLeft", img: "/leaf_01.png" },
  { id: 10, left: "2%", duration: 19, delay: 11.2, size: "w-7 h-7", anim: "forestLeafFallRight", img: "/leaf_02.png" },
];

export default function TadobaTFeedback() {
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

  // Rating Click Processing & Low Connectivity states
  const [selectedTigerId, setSelectedTigerId] = useState(null);
  const [isProcessingRating, setIsProcessingRating] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [centerOffset, setCenterOffset] = useState(0);

  // Phase 3 (Details) states
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [noIssuesSelected, setNoIssuesSelected] = useState(false);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timers
  const [bouncingTimer, setBouncingTimer] = useState(15); // 15s on bouncing screen
  const [thankYouCountdown, setThankYouCountdown] = useState(3);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Washroom Rating Statistics for Today
  const [todayStats, setTodayStats] = useState({
    avgRating: "4.5",
    count: 52,
    loaded: false,
  });

  const bouncingTimerRef = useRef(null);
  const thankYouTimerRef = useRef(null);
  const roarAudioRef = useRef(null);

  // Preload Tiger Roar Audio Effect for instant playback on tap
  useEffect(() => {
    if (typeof window !== "undefined") {
      const audio = new Audio("/tadoba-form/tiger-roar.mp3");
      audio.preload = "auto";
      audio.volume = 0.65;
      roarAudioRef.current = audio;
    }
  }, []);

  const playTigerRoar = () => {
    try {
      if (roarAudioRef.current) {
        roarAudioRef.current.currentTime = 0;
        const playPromise = roarAudioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Tiger roar audio play error:", err);
          });
        }
      } else if (typeof window !== "undefined") {
        const audio = new Audio("/tadoba-form/tiger-roar.mp3");
        audio.volume = 0.65;
        audio.play().catch(() => {});
      }
    } catch (e) {
      console.warn("Tiger roar audio error:", e);
    }
  };

  // Fetch live stats for today's washroom ratings
  useEffect(() => {
    if (!locationId) return;
    let isMounted = true;

    const fetchStats = async () => {
      try {
        const res = await feedbackApi.getAllUserReviews({
          location_id: locationId,
          limit: 100,
        });

        if (!isMounted) return;

        const reviews = res?.data || (Array.isArray(res) ? res : []);
        const todayStr = new Date().toISOString().slice(0, 10);
        const todayReviews = reviews.filter((r) => r.created_at && r.created_at.startsWith(todayStr));

        if (todayReviews.length > 0) {
          const sum = todayReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
          const avgOn5 = (sum / todayReviews.length / 2).toFixed(1);
          setTodayStats({
            avgRating: avgOn5,
            count: todayReviews.length,
            loaded: true,
          });
        } else if (reviews.length > 0) {
          const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
          const avgOn5 = (sum / reviews.length / 2).toFixed(1);
          setTodayStats({
            avgRating: avgOn5,
            count: reviews.length,
            loaded: true,
          });
        } else {
          const statsRes = await feedbackApi.getToiletReviewStats(locationId);
          if (statsRes?.data?.average_rating) {
            const avgOn5 = (Number(statsRes.data.average_rating) / 2).toFixed(1);
            setTodayStats({
              avgRating: avgOn5,
              count: statsRes.data.total_reviews || 0,
              loaded: true,
            });
          }
        }
      } catch (e) {
        console.warn("Failed to load today's rating stats:", e);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [locationId]);

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
    if (roarAudioRef.current) {
      try {
        roarAudioRef.current.pause();
        roarAudioRef.current.currentTime = 0;
      } catch (_) {}
    }
    setCurrentPhase("rating");
    setSelectedRating(null);
    setSelectedTigerId(null);
    setIsProcessingRating(false);
    setIsSlowNetwork(false);
    setCenterOffset(0);
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
  const handleRatingSelect = async (option, e) => {
    if (isProcessingRating) return;

    // Play realistic tiger roar audio effect immediately on tap
    playTigerRoar();

    // Calculate exact horizontal shift to glide the tapped emoji to the screen center
    if (e && e.currentTarget && typeof window !== "undefined") {
      const rect = e.currentTarget.getBoundingClientRect();
      const elementCenter = rect.left + rect.width / 2;
      const screenCenter = window.innerWidth / 2;
      setCenterOffset(screenCenter - elementCenter);
    } else if (typeof window !== "undefined") {
      const indexMap = { poor: 0, fair: 1, good: 2, very_good: 3, excellent: 4 };
      const idx = indexMap[option.id] ?? 2;
      setCenterOffset((2 - idx) * (window.innerWidth * 0.18));
    }

    // Immediate visual tactile response (0ms) so user knows click was registered
    setSelectedRating(option);
    setSelectedTigerId(option.id);
    setIsProcessingRating(true);
    setIsSlowNetwork(false);

    // Optimistically update today's live washroom rating
    setTodayStats((prev) => {
      const currentCount = prev.count || 0;
      const currentSum = (Number(prev.avgRating) || 4.5) * currentCount;
      const newRatingOn5 = (option.rating || 10) / 2;
      const newCount = currentCount + 1;
      const newAvg = ((currentSum + newRatingOn5) / newCount).toFixed(1);
      return {
        ...prev,
        avgRating: newAvg,
        count: newCount,
      };
    });

    // Forest network delay notification (if >1.8s)
    const slowTimer = setTimeout(() => {
      setIsSlowNetwork(true);
    }, 1800);

    // When the round line finishes its 360° circle (~1020ms), redirect to the next window
    const minDisplayPromise = new Promise((resolve) => setTimeout(resolve, 1020));

    // Fallback timeout of 6s so kiosk never gets stuck in low/no connectivity areas
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 6000)
    );

    try {
      const payload = {
        rating: option.rating,
        location_id: locationId,
        companyId: companyId,
        reason_ids: [0],
        description: "",
      };

      const apiPromise = feedbackApi.submitReview(payload).catch((err) => {
        console.warn("Initial rating submit warning:", err);
        return null;
      });

      const [res] = await Promise.all([
        Promise.race([apiPromise, timeoutPromise]),
        minDisplayPromise,
      ]);

      if (res && !res.timeout) {
        const newId = res?.data?.id || res?.id || (res?.data && res.data[0]?.id);
        if (newId) {
          setSubmittedReviewId(newId.toString());
        }
      }
    } catch (error) {
      console.error("Initial rating save failed:", error);
    } finally {
      clearTimeout(slowTimer);
      setIsProcessingRating(false);
      setIsSlowNetwork(false);
      setSelectedTigerId(null);
      setCenterOffset(0);
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
        className={`h-screen w-full select-none flex flex-col overflow-hidden font-sans relative transition-all duration-300 ${
          currentPhase === "rating"
            ? "bg-cover bg-center bg-no-repeat p-2.5 sm:p-4 md:p-6 lg:p-7 xl:p-8 2xl:p-10"
            : "bg-[#FAF7F2] p-2.5 sm:p-3.5 md:p-5 lg:p-6 xl:p-8 2xl:p-9"
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
        {/* AMBIENT PHOTO-FRAME KEYFRAME STYLES                            */}
        {/* ============================================================== */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes forestLeafFallLeft {
            0% {
              transform: translate3d(0, -60px, 0) rotate(0deg) scale(0.9);
              opacity: 0;
            }
            10% {
              opacity: 0.85;
            }
            50% {
              transform: translate3d(-35px, 50vh, 0) rotate(190deg) scale(1);
            }
            88% {
              opacity: 0.85;
            }
            100% {
              transform: translate3d(25px, 108vh, 0) rotate(380deg) scale(0.95);
              opacity: 0;
            }
          }

          @keyframes forestLeafFallRight {
            0% {
              transform: translate3d(0, -60px, 0) rotate(0deg) scale(0.85);
              opacity: 0;
            }
            10% {
              opacity: 0.8;
            }
            50% {
              transform: translate3d(40px, 52vh, 0) rotate(-160deg) scale(1);
            }
            88% {
              opacity: 0.8;
            }
            100% {
              transform: translate3d(-30px, 108vh, 0) rotate(-340deg) scale(0.9);
              opacity: 0;
            }
          }

          @keyframes drawRoundLine {
            0% {
              stroke-dashoffset: 340;
            }
            100% {
              stroke-dashoffset: 0;
            }
          }

          @keyframes selectedEmojiZoom {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.42) translateY(-6px);
            }
            100% {
              transform: scale(1.38) translateY(-4px);
            }
          }
        `}} />

        {/* ============================================================== */}
        {/* LIVE AMBIENT LAYER: GENTLE FALLING LEAVES (Continuous Forest Breeze) */}
        {/* ============================================================== */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" aria-hidden="true">
          {FALLING_LEAVES.map((leaf) => (
            <div
              key={leaf.id}
              className={`absolute pointer-events-none ${leaf.size}`}
              style={{
                left: leaf.left,
                top: 0,
                animation: `${leaf.anim} ${leaf.duration}s cubic-bezier(0.4, 0, 0.2, 1) infinite`,
                animationDelay: `${leaf.delay}s`,
                willChange: "transform, opacity",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={leaf.img}
                alt=""
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TOP BAR: Left: TATR Logo | Center: Lang Selector | Right: SaafAI */}
        {/* ============================================================== */}
        <header className="w-full max-w-[min(95vw,1750px)] 2xl:max-w-[1920px] mx-auto flex items-center justify-between relative z-20 shrink-0 mb-4 sm:mb-6 md:mb-8 lg:mb-10 px-2 sm:px-4 lg:px-6">
          
          {/* Top Left: TATR Tadoba Logo (Enlarged & Prominent) */}
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tadoba-form/tatr-logo.png"
              alt="TATR - Tadoba Andhari Tiger Reserve"
              className="h-14 sm:h-18 md:h-22 lg:h-26 xl:h-30 2xl:h-36 max-h-[12vh] w-auto object-contain drop-shadow-sm transition-all"
            />
          </div>

          {/* Center: Language Selector Pill */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-white/95 border border-stone-200/90 rounded-full p-1.5 shadow-xs">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "mr", label: "मराठी" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-3.5 py-1.5 sm:px-5 sm:py-2 md:px-6 md:py-2.5 lg:px-7 lg:py-3 rounded-full text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-black transition-all cursor-pointer ${
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

          {/* Top Right: Fullscreen + SaafAI Logo (Enlarged & Prominent) + Today's Rating Column */}
          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <button
              onClick={toggleFullscreen}
              className="p-2 sm:p-2.5 rounded-full bg-white/95 border border-stone-200/90 text-gray-600 hover:text-gray-900 hover:bg-white transition shadow-xs cursor-pointer mt-1"
              title="Toggle Fullscreen Kiosk"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            <div className="flex flex-col items-end">
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-slate-900 tracking-tight leading-none">
                Saaf<span className="text-[#00A3E0]">AI</span>
              </div>
              <span className="text-[8px] sm:text-[9px] md:text-xs lg:text-sm xl:text-base uppercase font-black tracking-[0.24em] text-slate-600 mt-1">
                SMART FACILITY AI
              </span>

              {/* Today's Rating Column below SaafAI Logo */}
              <div className="mt-1.5 sm:mt-2 flex flex-col items-end">
                <div className="bg-white/95 backdrop-blur-md border border-emerald-600/20 rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-xs flex flex-col items-end transition-all">
                  <span className="text-[8px] sm:text-[9px] md:text-[10px] font-black uppercase tracking-[0.16em] text-emerald-800/80">
                    {t.todayRatingTitle}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400 drop-shadow-2xs shrink-0" />
                    <span className="text-sm sm:text-base md:text-lg font-black text-slate-900 leading-none">
                      {todayStats.avgRating}
                    </span>
                    <span className="text-[10px] sm:text-xs font-bold text-slate-400 leading-none">
                      / 5
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/70 rounded-full px-1.5 py-0.5 ml-1 leading-none">
                      {todayStats.count} {t.ratingsToday}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* SCREEN 1: Rating Selection (Prominent Welcome Headline & Interactive Tigers) */}
        {/* ============================================================== */}
        {currentPhase === "rating" && (
          <main className="flex-1 flex flex-col justify-center items-center text-center w-full max-w-[min(95vw,1750px)] 2xl:max-w-[1920px] mx-auto px-2 sm:px-4 pb-2 sm:pb-4">
            
            {/* Prestigious Welcome Headline above Rating */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2.5 px-3.5 py-1 sm:px-4.5 sm:py-1.5 md:px-5 md:py-2 rounded-full bg-emerald-950/10 backdrop-blur-xs border border-emerald-800/20 text-[#1e3a29] font-black text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl uppercase tracking-wider mb-2 sm:mb-2.5 shadow-2xs transition-all">
              <span className="text-emerald-700 text-xs sm:text-sm md:text-base">🌿</span>
              <span>{t.welcomeTitle}</span>
              <span className="text-emerald-700 text-xs sm:text-sm md:text-base">🌿</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-slate-900 tracking-tight mb-0.5 sm:mb-1">
              {t.title}
            </h1>
            <p className="text-slate-700 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mb-2 sm:mb-3 md:mb-3.5 lg:mb-4 font-semibold">
              {t.subtitle}
            </p>

            {/* 5 TIGER RATING BUTTONS IN SINGLE HORIZONTAL ROW */}
            <div className="grid grid-cols-5 gap-2.5 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 2xl:gap-14 w-full max-w-[min(95vw,1700px)] 2xl:max-w-[1850px] px-2 sm:px-4">
              {RATING_OPTIONS.map((option) => {
                const labelText = option.label[lang] || option.label.en;
                const isSelected = selectedTigerId === option.id;
                const isOtherSelected = isProcessingRating && !isSelected;

                return (
                  <div
                    key={option.id}
                    onClick={(e) => !isProcessingRating && handleRatingSelect(option, e)}
                    className={`flex flex-col items-center group transition-all duration-500 transform ${
                      isProcessingRating ? "cursor-wait" : "cursor-pointer active:scale-95 hover:scale-105"
                    } ${
                      isSelected
                        ? "z-50"
                        : isOtherSelected
                        ? "opacity-15 scale-80 filter blur-[8px] sm:blur-[10px] pointer-events-none transition-all duration-500"
                        : "opacity-100"
                    }`}
                    style={
                      isSelected
                        ? {
                            transform: `translate3d(${centerOffset}px, -6px, 0) scale(1.42)`,
                            transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                            zIndex: 50,
                          }
                        : {}
                    }
                  >
                    {/* Emoji Wrapper: Contains Round Line Animation & Tiger Circle */}
                    <div className="relative flex items-center justify-center">
                      {/* Clean Round Line Sweeping Around the Big Emoji */}
                      {isSelected && (
                        <svg
                          viewBox="0 0 120 120"
                          className="absolute -inset-2.5 sm:-inset-3.5 md:-inset-4.5 lg:-inset-5.5 w-[calc(100%+20px)] sm:w-[calc(100%+28px)] md:w-[calc(100%+36px)] lg:w-[calc(100%+44px)] h-[calc(100%+20px)] sm:h-[calc(100%+28px)] md:h-[calc(100%+36px)] lg:h-[calc(100%+44px)] -rotate-90 pointer-events-none z-30 overflow-visible"
                          style={{ filter: "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35))" }}
                        >
                          <defs>
                            <linearGradient id={`roundLineGrad-${option.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                              <stop offset="60%" stopColor="#ffffff" stopOpacity="1" />
                              <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                            </linearGradient>
                          </defs>

                          {/* Subtle Guide Track */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="rgba(255, 255, 255, 0.4)"
                            strokeWidth="3.5"
                          />

                          {/* Round Line Coming Around the Big Emoji */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke={`url(#roundLineGrad-${option.id})`}
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeDasharray="340"
                            strokeDashoffset="340"
                            style={{
                              animation: "drawRoundLine 1.0s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
                            }}
                          />
                        </svg>
                      )}

                      {/* Tiger Emoji Circle - Clean, unobstructed */}
                      <div
                        className={`relative aspect-square w-[clamp(68px,11.5vw,240px)] h-[clamp(68px,11.5vw,240px)] rounded-full overflow-hidden transition-all duration-300 shadow-xl ${
                          isSelected
                            ? "ring-4 sm:ring-6 ring-white shadow-2xl"
                            : "ring-4 sm:ring-6 ring-white/95 group-hover:shadow-2xl group-hover:scale-108"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={option.image}
                          alt={labelText}
                          className="w-full h-full object-cover transition-transform duration-300"
                        />
                      </div>
                    </div>

                    {/* Rating Label Pill Below Tiger - Natural styling, no green checkmark */}
                    <div
                      className={`mt-2 sm:mt-3 md:mt-4 lg:mt-6 px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 lg:px-7 lg:py-3 rounded-full font-black text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl transition-all duration-300 shadow-md ${option.pillBg} ${option.pillText} ${
                        isSelected ? "ring-4 ring-white shadow-xl scale-105" : "group-hover:scale-105"
                      }`}
                    >
                      <span>{labelText}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* SUBTLE LOW CONNECTIVITY NOTICE (Only when forest network lags >2s) */}
            {isSlowNetwork && (
              <div className="mt-4 px-4 py-2 rounded-2xl bg-amber-50/95 border border-amber-300 shadow-lg flex items-center gap-2 text-amber-900 text-xs sm:text-sm font-bold animate-in fade-in duration-300 mx-auto max-w-sm">
                <Clock size={16} className="text-amber-700 animate-spin shrink-0" />
                <span>{t.slowNetworkNotice}</span>
              </div>
            )}
          </main>
        )}

        {/* ============================================================== */}
        {/* SCREEN 2: Bouncing Emoji Screen ("You rated Good" + "Give Feedback" button) */}
        {/* ============================================================== */}
        {currentPhase === "bouncing" && selectedRating && (
          <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 lg:p-8 text-center my-auto animate-in fade-in duration-300 w-full max-w-[min(94vw,1400px)] 2xl:max-w-[1600px] mx-auto">
            
            {/* Big Bouncing Emoji */}
            <div className="w-[clamp(110px,15vw,250px)] h-[clamp(110px,15vw,250px)] rounded-full overflow-hidden shadow-2xl mb-3 sm:mb-5 lg:mb-6 animate-bounce ring-4 sm:ring-8 ring-emerald-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedRating.image}
                alt="Rating submitted"
                className="w-full h-full object-cover"
              />
            </div>

            {/* "You rated Good" Pill */}
            <div
              className={`inline-flex items-center gap-2 sm:gap-3 px-6 py-2 sm:px-8 sm:py-3 md:px-10 md:py-3.5 lg:px-12 lg:py-4 rounded-full font-black text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mb-3 sm:mb-5 shadow-md ${selectedRating.pillBg} ${selectedRating.pillText}`}
            >
              <CheckCircle2 size={20} />
              <span>
                {t.youRated}{" "}
                <span className="font-extrabold underline">{ratingLabel}</span>
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">
              {t.thanksTitle}
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg xl:text-2xl max-w-2xl mx-auto mb-4 sm:mb-6 lg:mb-8 font-medium">
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
                className="px-6 py-3 sm:px-10 sm:py-4 md:px-12 md:py-5 lg:px-16 lg:py-6 rounded-2xl sm:rounded-3xl bg-[#284e3a] hover:bg-[#1e3a29] text-white font-extrabold text-sm sm:text-base md:text-xl lg:text-2xl transition-all shadow-md hover:shadow-xl flex items-center gap-2.5 sm:gap-3 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <MessageSquare size={19} />
                <span>{t.giveFeedbackBtn}</span>
              </button>

              {/* SECONDARY: Next Visitor / Done */}
              <button
                type="button"
                onClick={resetToHome}
                className="px-5 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 rounded-2xl sm:rounded-3xl bg-white hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm md:text-base lg:text-xl border border-stone-200 transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
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
          <main className="flex-1 w-full max-w-[min(95vw,1750px)] 2xl:max-w-[1920px] mx-auto flex flex-col justify-center min-h-0 my-auto py-1 sm:py-2 relative z-20">
            <div className="bg-white rounded-3xl sm:rounded-4xl border border-stone-200/90 shadow-2xl overflow-hidden flex flex-col">
              
              {/* 1. TOP HERO BANNER: Responsive fluid height that adapts to any window size */}
              <div className="relative w-full overflow-hidden bg-[#FAF7F2] border-b border-stone-200 shrink-0 h-[clamp(140px,26vh,380px)] xl:h-[28vh] 2xl:h-[30vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/tadoba_banner_new.png"
                  alt="Your voice cleans India - Tadoba-Andhari Tiger Reserve"
                  className="w-full h-full object-cover object-center block"
                />
              </div>

              {/* 2. BODY CONTENT: Balanced 2-Column Split with Enhanced Kiosk Typography */}
              <div className="p-3 sm:p-5 md:p-6 lg:p-7 xl:p-8 2xl:p-10 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-7 xl:gap-9 items-stretch">
                
                {/* Left Column (5/12): Rating Confirmation & Written Feedback */}
                <div className="md:col-span-5 flex flex-col justify-between gap-3">
                  
                  {/* Selected Rating Badge (Enhanced Visibility) */}
                  <div className="flex items-center gap-3.5 sm:gap-4 p-3 sm:p-4 lg:p-5 bg-emerald-50/90 border border-emerald-200 rounded-2xl sm:rounded-3xl shadow-2xs">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-full overflow-hidden shrink-0 shadow-xs border-2 sm:border-3 border-emerald-400 ring-2 ring-emerald-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedRating.image}
                        alt={selectedRating.id}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs sm:text-sm lg:text-base font-extrabold uppercase tracking-wider text-emerald-800">
                          {t.yourRating}
                        </span>
                        <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-full bg-emerald-200 text-emerald-900 shrink-0 shadow-2xs">
                          {t.recordedBadge}
                        </span>
                      </div>
                      <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-emerald-950 truncate mt-0.5 sm:mt-1">
                        {ratingLabel}
                      </div>
                    </div>
                  </div>

                  {/* Additional Comments Input (Clear & Tactile) */}
                  <div className="flex-1 flex flex-col justify-end">
                    <label className="block text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 mb-1.5 flex items-center gap-2">
                      <MessageSquare size={16} className="text-[#284e3a]" />
                      <span>{t.commentsLabel}</span>
                    </label>
                    <textarea
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      rows={2}
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base lg:text-lg font-medium border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#284e3a] focus:border-[#284e3a] resize-none text-gray-900 placeholder-gray-400 bg-gray-50/70 focus:bg-white transition"
                      placeholder={t.commentsPlaceholder}
                    />
                  </div>
                </div>

                {/* Right Column (7/12): Improvement Issues Checklist & Actions */}
                <div className="md:col-span-7 flex flex-col justify-between gap-3 border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 lg:pl-6 pt-3 md:pt-0">
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                      <div>
                        <h3 className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-black text-gray-900 leading-tight">
                          {t.issuesTitle}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600 hidden sm:block font-medium mt-0.5">
                          {t.issuesSubtitle}
                        </p>
                      </div>

                      {/* No Issues Toggle (Prominent) */}
                      <button
                        type="button"
                        onClick={toggleNoIssues}
                        className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm md:text-base font-black transition flex items-center gap-2 border cursor-pointer shrink-0 ${
                          noIssuesSelected
                            ? "bg-[#284e3a] text-white border-[#284e3a] shadow-xs"
                            : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {noIssuesSelected && <Check size={15} className="stroke-[3]" />}
                        <span>{t.noIssues}</span>
                      </button>
                    </div>

                    {/* Quick Issue Chips Grid (Bold & Clear Kiosk Touch Targets) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3.5 mb-2.5 sm:mb-3.5">
                      {QUICK_ISSUES.map((issue) => {
                        const isSelected = selectedIssues.includes(issue.id);
                        const issueText = issue.label[lang] || issue.label.en;

                        return (
                          <button
                            key={issue.id}
                            type="button"
                            onClick={() => toggleIssueSelection(issue.id)}
                            className={`p-3 sm:p-3.5 lg:p-4.5 rounded-xl sm:rounded-2xl border text-sm sm:text-base md:text-lg lg:text-xl font-extrabold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 min-h-[48px] sm:min-h-[56px] lg:min-h-[64px] ${
                              isSelected
                                ? "bg-rose-500 text-white border-rose-500 shadow-md scale-[1.02]"
                                : "bg-gray-50/90 border-gray-200 text-gray-800 hover:bg-gray-100"
                            }`}
                          >
                            {isSelected && <Check size={16} className="stroke-[3] shrink-0" />}
                            <span className="truncate">{issueText}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Buttons Row (Enlarged Kiosk Touch Targets) */}
                  <div className="flex items-center justify-end gap-3 sm:gap-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSkipPhase3}
                      className="px-6 py-2.5 sm:px-8 sm:py-3.5 lg:px-9 lg:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
                    >
                      {t.skipIssues}
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmitPhase3}
                      disabled={isSubmitting}
                      className="px-7 py-3 sm:px-10 sm:py-4 lg:px-12 lg:py-4.5 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-lg lg:text-xl font-black bg-[#284e3a] hover:bg-[#1e3a29] text-white shadow-md hover:shadow-xl transition flex items-center gap-2.5 cursor-pointer disabled:opacity-70 active:scale-95"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>{t.submitIssues}</span>
                          <Send size={16} />
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
          <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-5 lg:p-8 text-center my-auto animate-in fade-in duration-300 w-full max-w-[min(94vw,1400px)] 2xl:max-w-[1600px] mx-auto">
            {selectedRating && (
              <div className="w-[clamp(90px,14vw,230px)] h-[clamp(90px,14vw,230px)] rounded-full overflow-hidden shadow-xl mb-3 sm:mb-5 animate-bounce">
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

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-slate-900 tracking-tight mb-2 sm:mb-3">
              {t.thanksTitle}
            </h2>

            <p className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl max-w-xl mx-auto mb-4 sm:mb-6 font-medium">
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
              className="px-6 py-2.5 sm:px-8 sm:py-3.5 md:px-10 md:py-4 lg:px-14 lg:py-5 rounded-2xl sm:rounded-3xl bg-[#284e3a] hover:bg-[#1e3a29] text-white font-bold text-xs sm:text-sm md:text-base lg:text-xl transition-all shadow-md flex items-center gap-2.5 cursor-pointer"
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
