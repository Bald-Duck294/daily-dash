"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Check,
  CheckCircle2,
  Clock,
  Star,
  Settings,
  Mail,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "@/shared/api/axios.instance";
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
    image: "/tadoba-form/very_good.png?v=3",
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

// Custom tactile SVG icons matching Screen 2 mockup
const DirtyToiletIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <rect x="6" y="5" width="8" height="12" rx="2" fill="#0284c7" />
    <rect x="5" y="4" width="10" height="2.5" rx="1" fill="#38bdf8" />
    <circle cx="10" cy="8" r="1.2" fill="#ffffff" />
    <path
      d="M12 14h9c2.2 0 4 1.8 4 4 0 4.4-3.6 8-8 8h-2c-1.5 0-3-.5-4-1.5V14z"
      fill="#0284c7"
    />
    <path d="M13 22v5h6v-5" fill="#0369a1" />
    <rect x="11" y="27" width="10" height="2" rx="1" fill="#0284c7" />
  </svg>
);

const FoulOdorIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path
      d="M10 6.5c1.8 3.2-1.8 6.4 0 9.6s-1.8 6.4 0 9.6"
      stroke="#e11d48"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path
      d="M16 4.5c2 3.6-2 7.2 0 10.8s-2 7.2 0 10.8"
      stroke="#e11d48"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
    <path
      d="M22 6.5c1.8 3.2-1.8 6.4 0 9.6s-1.8 6.4 0 9.6"
      stroke="#e11d48"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

const WetFloorIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path
      d="M16 4.5C16 4.5 8.5 14 8.5 20a7.5 7.5 0 0 0 15 0c0-6-7.5-15.5-7.5-15.5z"
      fill="#2563eb"
    />
    <path
      d="M13.5 18a3.5 3.5 0 0 0 3.5 3.5"
      stroke="#bfdbfe"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const NoWaterIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <rect x="4" y="11" width="10" height="5" rx="1.5" fill="#d97706" />
    <path
      d="M12 11h5a4 4 0 0 1 4 4v3.5h-4.5V15a1 1 0 0 0-1-1H12v-3z"
      fill="#f59e0b"
    />
    <rect x="8.5" y="7" width="7" height="4" rx="1.5" fill="#b45309" />
    <rect x="16.5" y="18" width="5" height="3" rx="1" fill="#d97706" />
    <path
      d="M19 23c0-.9 2-3.2 2-3.2s2 2.3 2 3.2a2 2 0 1 1-4 0z"
      fill="#0284c7"
    />
  </svg>
);

const NoSoapIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path
      d="M16 5.5v5"
      stroke="#7e22ce"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M13 5.5h7a2 2 0 0 1 2 2v1"
      stroke="#7e22ce"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <rect x="13" y="10" width="6" height="3" rx="1" fill="#9333ea" />
    <rect x="10" y="13" width="12" height="15" rx="4" fill="#a855f7" />
    <rect
      x="12"
      y="16"
      width="3"
      height="9"
      rx="1.5"
      fill="#f3e8ff"
      fillOpacity="0.75"
    />
  </svg>
);

const SpitStainsIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <circle cx="16" cy="16" r="4.5" fill="#dc2626" />
    <circle cx="16" cy="6.5" r="2.2" fill="#dc2626" />
    <circle cx="16" cy="25.5" r="2.2" fill="#dc2626" />
    <circle cx="6.5" cy="16" r="2.2" fill="#dc2626" />
    <circle cx="25.5" cy="16" r="2.2" fill="#dc2626" />
    <circle cx="9.2" cy="9.2" r="2" fill="#dc2626" />
    <circle cx="22.8" cy="9.2" r="2" fill="#dc2626" />
    <circle cx="9.2" cy="22.8" r="2" fill="#dc2626" />
    <circle cx="22.8" cy="22.8" r="2" fill="#dc2626" />
    <path
      d="M16 11v10M11 16h10M12.5 12.5l7 7M12.5 19.5l7-7"
      stroke="#dc2626"
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  </svg>
);

const FullDustbinIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <rect x="8" y="7" width="16" height="3" rx="1.5" fill="#059669" />
    <rect x="13" y="4.5" width="6" height="2.5" rx="1" fill="#047857" />
    <path
      d="M10 11l1.5 15a2 2 0 0 0 2 1.8h9a2 2 0 0 0 2-1.8l1.5-15H10z"
      fill="#10b981"
    />
    <line
      x1="14"
      y1="14"
      x2="14"
      y2="24"
      stroke="#047857"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <line
      x1="18"
      y1="14"
      x2="18"
      y2="24"
      stroke="#047857"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const PoorLightingIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path
      d="M16 6a7 7 0 0 0-5 11.9c1 1 1.7 2.2 1.8 3.5h6.4c.1-1.3.8-2.5 1.8-3.5A7 7 0 0 0 16 6z"
      fill="#eab308"
    />
    <circle cx="16" cy="12" r="3" fill="#fef08a" />
    <rect x="13.5" y="22.5" width="5" height="2" rx="0.5" fill="#ca8a04" />
    <rect x="14" y="25" width="4" height="2" rx="0.5" fill="#a16207" />
    <line
      x1="16"
      y1="2"
      x2="16"
      y2="4"
      stroke="#ca8a04"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="6"
      y1="12"
      x2="8"
      y2="12"
      stroke="#ca8a04"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="24"
      y1="12"
      x2="26"
      y2="12"
      stroke="#ca8a04"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="8.9"
      y1="5.9"
      x2="10.3"
      y2="7.3"
      stroke="#ca8a04"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="23.1"
      y1="5.9"
      x2="21.7"
      y2="7.3"
      stroke="#ca8a04"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 8 Improvement Issue Cards for Screen 2
const QUICK_ISSUES = [
  {
    id: 1,
    icon: DirtyToiletIcon,
    iconBg: "bg-[#e0f2fe]",
    label: { en: "Dirty Toilets", hi: "गंदे शौचालय", mr: "अस्वच्छ शौचालय" },
  },
  {
    id: 3,
    icon: FoulOdorIcon,
    iconBg: "bg-[#ffe4e6]",
    label: { en: "Foul Odor", hi: "बदबू", mr: "दुर्गंधी" },
  },
  {
    id: 2,
    icon: WetFloorIcon,
    iconBg: "bg-[#dbeafe]",
    label: { en: "Wet Floor", hi: "गीला फर्श", mr: "ओला मजला" },
  },
  {
    id: 7,
    icon: NoWaterIcon,
    iconBg: "bg-[#fef3c7]",
    label: { en: "No Water", hi: "पानी नहीं है", mr: "पाणी नाही" },
  },
  {
    id: 14,
    icon: NoSoapIcon,
    iconBg: "bg-[#f3e8ff]",
    label: { en: "No Soap", hi: "साबुन नहीं है", mr: "साबण नाही" },
  },
  {
    id: 4,
    icon: SpitStainsIcon,
    iconBg: "bg-[#fee2e2]",
    label: { en: "Spit Stains", hi: "थूक के दाग", mr: "पानाचे डाग" },
  },
  {
    id: 5,
    icon: FullDustbinIcon,
    iconBg: "bg-[#d1fae5]",
    label: {
      en: "Full Dustbin",
      hi: "कचरा पेटी भरी है",
      mr: "कचराकुंडी भरली आहे",
    },
  },
  {
    id: 17,
    icon: PoorLightingIcon,
    iconBg: "bg-[#fef9c3]",
    label: { en: "Poor Lighting", hi: "कम रोशनी", mr: "कमी प्रकाश" },
  },
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
    resetNow: "Next Visitor",
    issuesTitle: "What could be improved?",
    issuesSubtitle: "Select any issues you observed (optional)",
    washroomRatingTitle: "Washroom Rating",
    gratitudeTitle: "Thank You for Helping Tadoba!",
    gratitudeSubtitle:
      "Our forest hygiene team has been alerted and will attend to these issues promptly.",
    issuesReported: "issues noted",
  },
  hi: {
    welcomeTitle: "ताडोबा-अंधारी टाइगर रिजर्व में आपका स्वागत है",
    recordingRating: "आपकी रेटिंग दर्ज की जा रही है...",
    slowNetworkNotice:
      "वन क्षेत्र में नेटवर्क धीमा है, कृपया प्रतीक्षा करें...",
    title: "अपने शौचालय के अनुभव को रेट करें",
    subtitle: "अपनी तत्काल समीक्षा दर्ज करने के लिए किसी इमोजी पर टैप करें",
    thanksTitle: "आपकी प्रतिक्रिया के लिए धन्यवाद!",
    thanksSubtitle: "आपकी समीक्षा सफलतापूर्वक दर्ज कर ली गई है।",
    youRated: "आपने रेट किया",
    resetNow: "अगला आगंतुक",
    issuesTitle: "क्या सुधार किया जा सकता है?",
    issuesSubtitle: "अपनी देखी गई समस्याएं चुनें (वैकल्पिक)",
    washroomRatingTitle: "शौचालय रेटिंग",
    gratitudeTitle: "ताडोबा को स्वच्छ रखने में मदद के लिए धन्यवाद!",
    gratitudeSubtitle:
      "हमारी वन स्वच्छता टीम को सूचित कर दिया गया है और शीघ्र कार्रवाई की जाएगी।",
    issuesReported: "मुद्दे दर्ज",
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
    resetNow: "पुढील अभ्यागत",
    issuesTitle: "काय सुधारणा केली जाऊ शकते?",
    issuesSubtitle: "तुम्ही अनुभवलेल्या समस्या निवडा (पर्यायी)",
    washroomRatingTitle: "स्वच्छतागृह रेटिंग",
    gratitudeTitle: "ताडोबा स्वच्छ ठेवण्यास मदत केल्याबद्दल धन्यवाद!",
    gratitudeSubtitle:
      "आमच्या वन स्वच्छता पथकाला सूचित करण्यात आले असून लवकरच कार्यवाही केली जाईल.",
    issuesReported: "समस्या नोंदवल्या",
  },
};

// Ambient Falling Forest Leaves configuration
const FALLING_LEAVES = [
  {
    id: 1,
    left: "7%",
    duration: 13,
    delay: 0,
    size: "w-6 h-6",
    anim: "forestLeafFallLeft",
    img: "/leaf_01.png",
  },
  {
    id: 2,
    left: "17%",
    duration: 16,
    delay: 3.5,
    size: "w-5 h-5",
    anim: "forestLeafFallRight",
    img: "/leaf_02.png",
  },
  {
    id: 3,
    left: "28%",
    duration: 14,
    delay: 7.2,
    size: "w-7 h-7",
    anim: "forestLeafFallLeft",
    img: "/leaf_03.png",
  },
  {
    id: 4,
    left: "41%",
    duration: 18,
    delay: 1.5,
    size: "w-6 h-6",
    anim: "forestLeafFallRight",
    img: "/leaf_04.png",
  },
  {
    id: 5,
    left: "53%",
    duration: 15,
    delay: 9.8,
    size: "w-5 h-5",
    anim: "forestLeafFallLeft",
    img: "/leaf_01.png",
  },
  {
    id: 6,
    left: "64%",
    duration: 13.5,
    delay: 4.5,
    size: "w-7 h-7",
    anim: "forestLeafFallRight",
    img: "/leaf_02.png",
  },
  {
    id: 7,
    left: "76%",
    duration: 17,
    delay: 2.2,
    size: "w-6 h-6",
    anim: "forestLeafFallLeft",
    img: "/leaf_03.png",
  },
  {
    id: 8,
    left: "86%",
    duration: 15.5,
    delay: 8.4,
    size: "w-5 h-5",
    anim: "forestLeafFallRight",
    img: "/leaf_04.png",
  },
  {
    id: 9,
    left: "94%",
    duration: 14,
    delay: 5.8,
    size: "w-6 h-6",
    anim: "forestLeafFallLeft",
    img: "/leaf_01.png",
  },
  {
    id: 10,
    left: "2%",
    duration: 19,
    delay: 11.2,
    size: "w-7 h-7",
    anim: "forestLeafFallRight",
    img: "/leaf_02.png",
  },
];

export default function TadobaTFeedback() {
  const searchParams = useSearchParams();

  // Language management - shared and consistent across screens
  const [lang, setLang] = useState("en"); // 'en' | 'hi' | 'mr'

  // Kiosk Location / Company resolution & persistence
  const rawLoc = searchParams.get("locationId") || "";
  const rawLinked =
    searchParams.get("linkedLocations") ||
    searchParams.get("linkedLocationIds") ||
    "";
  const rawComp = searchParams.get("companyId") || "";

  const extractIds = (str) => {
    if (!str) return [];
    const matches = str.toString().match(/\d+/g);
    return matches ? matches : [];
  };

  const [locationIds, setLocationIds] = useState(["2248"]);
  const [companyId, setCompanyId] = useState("95");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryLocs = [...extractIds(rawLoc), ...extractIds(rawLinked)];
      const savedLocsStr = localStorage.getItem("saafai_kiosk_locationIds");
      const savedComp = localStorage.getItem("saafai_kiosk_companyId");
      const compMatch = rawComp ? rawComp.toString().match(/\d+/) : null;

      let finalLocs = ["2248"];
      if (queryLocs.length > 0) {
        finalLocs = [...new Set(queryLocs)];
      } else if (savedLocsStr) {
        try {
          const parsed = JSON.parse(savedLocsStr);
          if (Array.isArray(parsed) && parsed.length > 0) finalLocs = parsed;
        } catch {
          const singleSaved = localStorage.getItem("saafai_kiosk_locationId");
          if (singleSaved) finalLocs = [singleSaved];
        }
      } else {
        const singleSaved = localStorage.getItem("saafai_kiosk_locationId");
        if (singleSaved) finalLocs = [singleSaved];
      }

      const finalComp = compMatch ? compMatch[0] : savedComp || "95";

      setLocationIds(finalLocs);
      setCompanyId(finalComp);

      if (queryLocs.length > 0) {
        localStorage.setItem(
          "saafai_kiosk_locationIds",
          JSON.stringify(finalLocs),
        );
        localStorage.setItem("saafai_kiosk_locationId", finalLocs.join(","));
      }
      if (compMatch?.[0]) {
        localStorage.setItem("saafai_kiosk_companyId", compMatch[0]);
      }
    }
  }, [rawLoc, rawLinked, rawComp]);

  // Screen Flow:
  // 1. 'rating'   : Home screen with 5 emojis
  // 2. 'bouncing' : Screen 2 (Rating Confirmation + Enlarged Issues Grid)
  const [currentPhase, setCurrentPhase] = useState("rating");
  const [selectedRating, setSelectedRating] = useState(null);
  const [submittedReviewIds, setSubmittedReviewIds] = useState([]);

  // Rating Click Processing & Low Connectivity states
  const [selectedTigerId, setSelectedTigerId] = useState(null);
  const [isProcessingRating, setIsProcessingRating] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [centerOffset, setCenterOffset] = useState(0);

  // Screen 2 states
  const [selectedIssues, setSelectedIssues] = useState([]);
  const [showGratitude, setShowGratitude] = useState(false);

  // Timers: 20-Second Normal Redirect Timer
  const [bouncingTimer, setBouncingTimer] = useState(20);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live Washroom Cleanliness Rating
  const [washroomRating, setWashroomRating] = useState("0.0");

  const bouncingTimerRef = useRef(null);
  const gratitudeTimeoutRef = useRef(null);
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

  // Fetch washroom average rating across all linked locations
  useEffect(() => {
    if (!locationIds || locationIds.length === 0) return;
    let isMounted = true;

    const fetchWashroomScore = async () => {
      try {
        const scorePromises = locationIds.map(async (locId) => {
          try {
            const locRes = await axiosInstance.get(
              `/locations/${locId}${companyId ? `?companyId=${companyId}` : ""}`,
            );
            const locData = locRes?.data?.data || locRes?.data || locRes;
            const avgScore =
              locData?.averageRating ??
              locData?.average_cleaning_score ??
              locData?.current_cleaning_score;
            if (
              avgScore !== null &&
              avgScore !== undefined &&
              !isNaN(avgScore) &&
              Number(avgScore) > 0
            ) {
              return Number(avgScore);
            }

            const cleanerRes = await axiosInstance.get(
              `/cleaner-reviews/location/${locId}${companyId ? `?company_id=${companyId}` : ""}`,
            );
            const cleanerAvg = cleanerRes?.data?.data?.stats?.average_score;
            if (
              cleanerAvg !== null &&
              cleanerAvg !== undefined &&
              !isNaN(cleanerAvg) &&
              Number(cleanerAvg) > 0
            ) {
              return Number(cleanerAvg);
            }
          } catch (err) {
            console.warn(`Error fetching score for location ${locId}:`, err);
          }
          return null;
        });

        const scores = (await Promise.all(scorePromises)).filter(
          (s) => s !== null && s > 0,
        );
        if (!isMounted) return;

        if (scores.length > 0) {
          const combinedAvg =
            scores.reduce((sum, val) => sum + val, 0) / scores.length;
          setWashroomRating(combinedAvg.toFixed(1));
        } else {
          setWashroomRating("0.0");
        }
      } catch (e) {
        console.warn("Could not fetch washroom cleaner ratings:", e);
        if (isMounted) setWashroomRating("0.0");
      }
    };

    fetchWashroomScore();
    const interval = setInterval(fetchWashroomScore, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [locationIds, companyId]);

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
    if (gratitudeTimeoutRef.current) clearTimeout(gratitudeTimeoutRef.current);
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
    setSubmittedReviewIds([]);
    setSelectedIssues([]);
    setShowGratitude(false);
    setBouncingTimer(20);
  };

  // 20-Second Auto-Reset Timer for Screen 2
  useEffect(() => {
    if (currentPhase === "bouncing") {
      setBouncingTimer(20);

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

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (bouncingTimerRef.current) clearInterval(bouncingTimerRef.current);
      if (gratitudeTimeoutRef.current) clearTimeout(gratitudeTimeoutRef.current);
    };
  }, []);

  // Phase 1: Tap Rating Emoji -> Immediately records review (POST) and moves directly to Screen 2
  const handleRatingSelect = async (option, e) => {
    if (isProcessingRating) return;

    // Play realistic tiger roar audio effect immediately on tap
    playTigerRoar();

    // Calculate exact horizontal shift to glide the tapped emoji toward center
    if (e && e.currentTarget && typeof window !== "undefined") {
      const rect = e.currentTarget.getBoundingClientRect();
      const elementCenter = rect.left + rect.width / 2;
      const screenCenter = window.innerWidth / 2;
      setCenterOffset(screenCenter - elementCenter);
    } else if (typeof window !== "undefined") {
      const indexMap = {
        poor: 0,
        fair: 1,
        good: 2,
        very_good: 3,
        excellent: 4,
      };
      const idx = indexMap[option.id] ?? 2;
      setCenterOffset((2 - idx) * (window.innerWidth * 0.18));
    }

    // Immediate visual response
    setSelectedRating(option);
    setSelectedTigerId(option.id);
    setIsProcessingRating(true);
    setIsSlowNetwork(false);

    // Forest network delay notification (if >1.8s)
    const slowTimer = setTimeout(() => {
      setIsSlowNetwork(true);
    }, 1800);

    // When the round line finishes its 360° circle (~1020ms), redirect to Screen 2
    const minDisplayPromise = new Promise((resolve) =>
      setTimeout(resolve, 1020),
    );

    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ timeout: true }), 6000),
    );

    try {
      // Submit in parallel to all linked locations
      const submitPromises = locationIds.map(async (locId) => {
        const payload = {
          rating: option.rating,
          location_id: locId,
          companyId: companyId,
          reason_ids: [0],
          description: "",
        };
        try {
          return await feedbackApi.submitReview(payload);
        } catch (err) {
          console.warn(
            `Initial rating submit error for location ${locId}:`,
            err,
          );
          return null;
        }
      });

      const apiPromise = Promise.all(submitPromises);

      const [responses] = await Promise.all([
        Promise.race([apiPromise, timeoutPromise]),
        minDisplayPromise,
      ]);

      if (Array.isArray(responses)) {
        const createdIds = responses
          .map(
            (res) => res?.data?.id || res?.id || (res?.data && res.data[0]?.id),
          )
          .filter(Boolean)
          .map((id) => id.toString());
        setSubmittedReviewIds(createdIds);
      }
    } catch (error) {
      console.error("Initial rating save failed:", error);
    } finally {
      clearTimeout(slowTimer);
      setIsProcessingRating(false);
      setIsSlowNetwork(false);
      setSelectedTigerId(null);
      setCenterOffset(0);
      // Advance directly to Screen 2
      setCurrentPhase("bouncing");
    }
  };

  // Screen 2: Toggle Issue Selection -> Auto-saves & triggers Token of Gratitude after 3.5s
  const toggleIssueSelection = async (issueId) => {
    // Clear any existing gratitude debounce timer
    if (gratitudeTimeoutRef.current) {
      clearTimeout(gratitudeTimeoutRef.current);
    }

    const updatedIssues = selectedIssues.includes(issueId)
      ? selectedIssues.filter((id) => id !== issueId)
      : [...selectedIssues, issueId];

    setSelectedIssues(updatedIssues);

    // If reasons are selected, trigger token of gratitude after 3.5 seconds of inactivity
    if (updatedIssues.length > 0) {
      gratitudeTimeoutRef.current = setTimeout(() => {
        setShowGratitude(true);
        // After showing gratitude for 3.5s, return smoothly to Screen 1
        gratitudeTimeoutRef.current = setTimeout(() => {
          resetToHome();
        }, 3500);
      }, 3500);
    } else {
      setShowGratitude(false);
    }

    // Immediately patch review in backend
    if (submittedReviewIds.length > 0) {
      try {
        const finalReasons = updatedIssues.length > 0 ? updatedIssues : [0];
        await Promise.all(
          submittedReviewIds.map((reviewId) =>
            feedbackApi
              .patchReview(reviewId, {
                reason_ids: finalReasons,
                description: "",
              })
              .catch((err) =>
                console.warn(
                  `Auto-patch review failed for ID ${reviewId}:`,
                  err,
                ),
              ),
          ),
        );
      } catch (e) {
        console.warn("Auto-save issue error:", e);
      }
    }
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const ratingLabel = selectedRating
    ? selectedRating.label[lang] || selectedRating.label.en
    : "";

  // Helper to split 2-word labels onto 2 lines matching mockup
  const renderLabel = (text) => {
    if (!text) return null;
    const parts = text.split(" ");
    if (parts.length === 2) {
      return (
        <>
          <span>{parts[0]}</span>
          <br />
          <span>{parts[1]}</span>
        </>
      );
    }
    return <span>{text}</span>;
  };

  return (
    <>
      <Toaster position="top-center" />

      {/* HORIZONTAL KIOSK CONTAINER (Optimized for 31.5cm x 21.5cm Landscape Screen) */}
      <div
        className={`h-screen w-full select-none flex flex-col overflow-hidden font-sans relative transition-all duration-300 ${
          currentPhase === "rating"
            ? "bg-cover bg-center bg-no-repeat p-2.5 sm:p-4 md:p-6 lg:p-7 xl:p-8 2xl:p-10"
            : "bg-[#FAF7F2] p-2.5 sm:p-3.5 md:p-5 lg:p-6 xl:p-7 2xl:p-8"
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes forestLeafFallLeft {
            0% {
              transform: translate3d(0, -60px, 0) rotate(0deg) scale(0.9);
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
            }
          }

          @keyframes forestLeafFallRight {
            0% {
              transform: translate3d(0, -60px, 0) rotate(0deg) scale(0.85);
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
        `,
          }}
        />

        {/* ============================================================== */}
        {/* LIVE AMBIENT LAYER: GENTLE FALLING LEAVES                      */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden z-10"
          aria-hidden="true"
        >
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
        <header className="w-full max-w-[min(95vw,1750px)] 2xl:max-w-[1920px] mx-auto flex items-center justify-between relative z-20 shrink-0 mb-2 sm:mb-4 md:mb-5 lg:mb-6 px-2 sm:px-4 lg:px-6">
          {/* Top Left: TATR Tadoba Logo */}
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tadoba-form/tatr_logo_png.png"
              alt="TATR - Tadoba Andhari Tiger Reserve"
              className="h-14 sm:h-18 md:h-22 lg:h-26 xl:h-28 2xl:h-36 min-h-[52px] sm:min-h-[68px] md:min-h-[82px] lg:min-h-[98px] max-h-[16vh] w-auto object-contain drop-shadow-md transition-all select-none"
            />
          </div>

          {/* Center: Language Selector Pill */}
          <div className="flex items-center justify-center">
            <div className="flex items-center bg-white/95 border border-stone-200/90 rounded-full p-1 sm:p-1.5 shadow-xs">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिंदी" },
                { code: "mr", label: "मराठी" },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => setLang(item.code)}
                  className={`px-3 py-1 sm:px-4.5 sm:py-1.5 md:px-5 md:py-2 lg:px-6 lg:py-2.5 rounded-full text-xs sm:text-sm md:text-base lg:text-lg font-black transition-all cursor-pointer ${
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

          {/* Top Right: Fullscreen + SaafAI Logo + Cleanliness Score */}
          <div className="flex items-start gap-2 sm:gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 rounded-full bg-white/95 border border-stone-200/90 text-gray-600 hover:text-gray-900 hover:bg-white transition shadow-xs cursor-pointer mt-1"
              title="Toggle Fullscreen Kiosk"
            >
              {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
            </button>

            <div className="flex flex-col items-end">
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-none">
                Saaf<span className="text-[#00A3E0]">AI</span>
              </div>
              <span className="text-[7px] sm:text-[8px] md:text-[10px] lg:text-xs uppercase font-black tracking-[0.24em] text-slate-600 mt-0.5 sm:mt-1">
                SMART FACILITY AI
              </span>

              {/* Washroom Cleanliness Rating Column below SaafAI Logo */}
              <div className="mt-1 sm:mt-1.5 flex flex-col items-end">
                <div className="bg-white/95 backdrop-blur-md border border-emerald-600/20 rounded-xl px-2 py-0.5 sm:px-2.5 sm:py-1 shadow-xs flex flex-col items-end transition-all">
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.16em] text-emerald-800/80">
                    {t.washroomRatingTitle || "Washroom Rating"}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500 fill-amber-400 drop-shadow-2xs shrink-0" />
                    <span className="text-xs sm:text-sm md:text-base font-black text-slate-900 leading-none">
                      {washroomRating || "0.0"}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 leading-none">
                      / 10
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* SCREEN 1: Rating Selection (Welcome Headline & Interactive Tigers) */}
        {/* ============================================================== */}
        {currentPhase === "rating" && (
          <main className="flex-1 flex flex-col justify-center items-center text-center w-full max-w-[min(95vw,1750px)] 2xl:max-w-[1920px] mx-auto px-2 sm:px-4 pb-2 sm:pb-4">
            {/* Prestigious Welcome Headline above Rating */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-950/10 backdrop-blur-xs border border-emerald-800/20 text-[#1e3a29] font-black text-xs sm:text-sm md:text-base lg:text-lg uppercase tracking-wider mb-1.5 sm:mb-2 shadow-2xs transition-all">
              <span className="text-emerald-700 text-xs sm:text-sm">🌿</span>
              <span>{t.welcomeTitle}</span>
              <span className="text-emerald-700 text-xs sm:text-sm">🌿</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black text-slate-900 tracking-tight mb-0.5 sm:mb-1">
              {t.title}
            </h1>
            <p className="text-slate-700 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-2 sm:mb-3 md:mb-4 font-semibold">
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
                    onClick={(e) =>
                      !isProcessingRating && handleRatingSelect(option, e)
                    }
                    className={`flex flex-col items-center group transition-all duration-500 transform ${
                      isProcessingRating
                        ? "cursor-wait"
                        : "cursor-pointer active:scale-95 hover:scale-105"
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
                            transition:
                              "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
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
                          style={{
                            filter:
                              "drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35))",
                          }}
                        >
                          <defs>
                            <linearGradient
                              id={`roundLineGrad-t-${option.id}`}
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="#ffffff"
                                stopOpacity="0.8"
                              />
                              <stop
                                offset="60%"
                                stopColor="#ffffff"
                                stopOpacity="1"
                              />
                              <stop
                                offset="100%"
                                stopColor="#ffffff"
                                stopOpacity="1"
                              />
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
                            stroke={`url(#roundLineGrad-t-${option.id})`}
                            strokeWidth="5.5"
                            strokeLinecap="round"
                            strokeDasharray="340"
                            strokeDashoffset="340"
                            style={{
                              animation:
                                "drawRoundLine 1.0s cubic-bezier(0.25, 0.1, 0.25, 1) forwards",
                            }}
                          />
                        </svg>
                      )}

                      {/* Tiger Emoji Circle */}
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

                    {/* Rating Label Pill Below Tiger */}
                    <div
                      className={`mt-2 sm:mt-3 md:mt-4 lg:mt-6 px-3 py-1 sm:px-4 sm:py-1.5 md:px-5 md:py-2 lg:px-7 lg:py-3 rounded-full font-black text-xs sm:text-sm md:text-base lg:text-xl xl:text-2xl transition-all duration-300 shadow-md ${option.pillBg} ${option.pillText} ${
                        isSelected
                          ? "ring-4 ring-white shadow-xl scale-105"
                          : "group-hover:scale-105"
                      }`}
                    >
                      <span>{labelText}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* BRANDING FOOTER: Developed & Managed by SaafAI */}
            <div className="w-full flex items-center justify-center gap-2.5 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8 z-20 shrink-0 select-none">
              <div className="hidden sm:block h-[1.5px] w-10 sm:w-16 md:w-24 lg:w-32 bg-slate-400/50 rounded-full" />
              <div className="flex items-center gap-2 sm:gap-2.5 text-left">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-800 stroke-[1.8] shrink-0" />
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                    Developed & Managed by{" "}
                    <span className="font-black text-slate-900">
                      Saaf<span className="text-[#00A3E0]">AI</span>
                    </span>
                  </div>
                  <div className="text-[10px] sm:text-xs font-medium text-slate-500 leading-snug">
                    AI-Powered Hygiene Intelligence Platform
                  </div>
                </div>
              </div>

              <div className="h-6 sm:h-7 w-[1px] bg-slate-300 mx-1 sm:mx-2 shrink-0" />

              <div className="flex items-center gap-2 sm:gap-2.5 text-left">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-slate-800 stroke-[1.8] shrink-0" />
                <div className="flex flex-col">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight leading-snug">
                    Want a similar solution?
                  </div>
                  <div className="text-[10px] sm:text-xs font-medium text-slate-600 leading-snug">
                    Contact:{" "}
                    <a
                      href="mailto:info@saafai.in"
                      className="font-bold text-[#00A3E0] hover:underline"
                    >
                      info@saafai.in
                    </a>
                  </div>
                </div>
              </div>
              <div className="hidden sm:block h-[1.5px] w-10 sm:w-16 md:w-24 lg:w-32 bg-slate-400/50 rounded-full" />
            </div>

            {/* SUBTLE LOW CONNECTIVITY NOTICE */}
            {isSlowNetwork && (
              <div className="mt-3 px-3 py-1.5 rounded-2xl bg-amber-50/95 border border-amber-300 shadow-lg flex items-center gap-2 text-amber-900 text-xs font-bold animate-in fade-in duration-300 mx-auto max-w-sm">
                <Clock
                  size={15}
                  className="text-amber-700 animate-spin shrink-0"
                />
                <span>{t.slowNetworkNotice}</span>
              </div>
            )}
          </main>
        )}

        {/* ============================================================== */}
        {/* SCREEN 2: Rating Confirmation & Enlarged What Could Be Improved */}
        {/* ============================================================== */}
        {currentPhase === "bouncing" && selectedRating && (
          <main className="flex-1 flex flex-col justify-center items-center w-full max-w-[min(96vw,1750px)] 2xl:max-w-[1900px] mx-auto px-2 sm:px-4 md:px-6 relative z-20 my-auto animate-in fade-in duration-300">
            <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-7 lg:gap-10 xl:gap-12 items-center">
              
              {/* LEFT COLUMN: Rating Confirmation with Bouncing Tiger Avatar */}
              <div className="md:col-span-5 flex flex-col items-center text-center justify-center">
                {/* Selected Tiger Avatar with animate-bounce */}
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-50 lg:h-50 xl:w-56 xl:h-56 rounded-full overflow-hidden shadow-2xl ring-4 sm:ring-8 ring-amber-100/90 bg-white animate-bounce">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedRating.image}
                    alt="Selected rating"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rating Pill: "✓ You rated Good" */}
                <div
                  className={`inline-flex items-center gap-2 px-5 py-2 sm:px-7 sm:py-2.5 md:px-8 md:py-3 rounded-full font-black text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl shadow-xs mt-3 sm:mt-4 ${selectedRating.pillBg} ${selectedRating.pillText}`}
                >
                  <Check size={18} className="stroke-[3]" />
                  <span>
                    {t.youRated}{" "}
                    <span className="underline decoration-2 underline-offset-4">
                      {ratingLabel}
                    </span>
                  </span>
                </div>

                {/* Headline */}
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-[#132f20] tracking-tight leading-tight mt-3 sm:mt-4">
                  {t.thanksTitle}
                </h2>

                {/* Subtitle */}
                <p className="text-slate-600 text-xs sm:text-sm md:text-base lg:text-lg font-medium mt-1 sm:mt-1.5 max-w-md">
                  {t.thanksSubtitle}
                </p>
              </div>

              {/* Subtle Vertical Divider Line (Visible on Tablet/Desktop) */}
              <div className="hidden md:block col-span-1 h-64 lg:h-80 w-px bg-stone-300/80 mx-auto" />

              {/* RIGHT COLUMN: "What could be improved?" OR Token of Gratitude */}
              <div className="md:col-span-6 flex flex-col justify-center">
                <div className="bg-[#edf7f0]/90 border border-[#cbe4d2] rounded-3xl sm:rounded-4xl p-4 sm:p-6 md:p-7 lg:p-8 shadow-xs min-h-[350px] sm:min-h-[390px] flex flex-col justify-center transition-all duration-500">
                  {showGratitude ? (
                    /* TOKEN OF GRATITUDE (Shown after 3.5s of selecting reasons) */
                    <div className="flex flex-col items-center justify-center text-center my-auto py-3 sm:py-5 animate-in zoom-in-95 fade-in duration-500">
                      {/* Animated Check & Leaf Emblem */}
                      <div className="relative mb-3 sm:mb-4">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg ring-4 ring-emerald-200">
                          <CheckCircle2 className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 stroke-[2.2]" />
                        </div>
                        <div className="absolute -top-1 -right-1 text-lg sm:text-xl animate-bounce">
                          🌿
                        </div>
                      </div>

                      {/* Selected Issues Count Pill */}
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 rounded-full bg-emerald-200/80 text-emerald-900 font-black text-xs sm:text-sm md:text-base mb-2 sm:mb-3 shadow-2xs">
                        <span>
                          {selectedIssues.length} {t.issuesReported}
                        </span>
                      </div>

                      {/* Gratitude Title */}
                      <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#132f20] tracking-tight leading-tight">
                        {t.gratitudeTitle}
                      </h3>

                      {/* Gratitude Subtitle */}
                      <p className="text-xs sm:text-sm md:text-base lg:text-lg text-slate-700 font-medium max-w-md mt-1.5 sm:mt-2 leading-relaxed">
                        {t.gratitudeSubtitle}
                      </p>
                    </div>
                  ) : (
                    /* WHAT COULD BE IMPROVED ISSUES GRID */
                    <>
                      {/* Header */}
                      <div className="mb-3 sm:mb-4">
                        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#132f20] tracking-tight">
                          {t.issuesTitle}
                        </h3>
                        <p className="text-xs sm:text-sm md:text-base text-slate-600 font-semibold mt-0.5 sm:mt-1">
                          {t.issuesSubtitle}
                        </p>
                      </div>

                      {/* 2x4 Grid of 8 Issue Cards */}
                      <div className="grid grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4 lg:gap-4.5">
                        {QUICK_ISSUES.map((issue) => {
                          const isSelected = selectedIssues.includes(issue.id);
                          const issueText = issue.label[lang] || issue.label.en;
                          const IconComp = issue.icon;

                          return (
                            <button
                              key={issue.id}
                              type="button"
                              onClick={() => toggleIssueSelection(issue.id)}
                              className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3.5 md:p-4 rounded-2xl sm:rounded-3xl transition-all cursor-pointer select-none text-center min-h-[92px] sm:min-h-[108px] md:min-h-[120px] lg:min-h-[132px] ${
                                isSelected
                                  ? "bg-emerald-50 border-2 sm:border-3 border-emerald-600 ring-2 ring-emerald-500/25 shadow-md scale-[1.03]"
                                  : "bg-white border border-stone-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 active:scale-95"
                              }`}
                            >
                              {/* Selected check badge */}
                              {isSelected && (
                                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <Check size={11} className="stroke-[3]" />
                                </div>
                              )}

                              {/* Icon Circle */}
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center mb-1.5 shrink-0 transition-transform ${
                                  issue.iconBg
                                } ${isSelected ? "scale-105" : ""}`}
                              >
                                <IconComp className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
                              </div>

                              {/* Label */}
                              <span className="text-xs sm:text-sm md:text-base font-black text-slate-800 leading-snug">
                                {renderLabel(issueText)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* BOTTOM ACTION: Next Visitor Button */}
            <div className="flex items-center justify-center mt-4 sm:mt-6 md:mt-7 relative z-20">
              <button
                type="button"
                onClick={resetToHome}
                className="px-8 py-2.5 sm:px-10 sm:py-3 md:px-12 md:py-3.5 rounded-full bg-white hover:bg-stone-50 text-slate-800 font-extrabold text-xs sm:text-sm md:text-base lg:text-lg border border-stone-300 shadow-2xs hover:shadow-md transition-all flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95"
              >
                <RotateCcw size={18} className="stroke-[2.2]" />
                <span>{t.resetNow}</span>
              </button>
            </div>

            {/* Auto-reset indicator bar (subtle) */}
            <div className="w-full max-w-xs bg-stone-200/60 rounded-full h-1 overflow-hidden mt-2.5 sm:mt-3 opacity-50">
              <div
                className="bg-emerald-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(bouncingTimer / 20) * 100}%` }}
              />
            </div>
          </main>
        )}

        {/* ============================================================== */}
        {/* BOTTOM CORNER FOLIAGE: Left and Right Corner Leaves (Flush)    */}
        {/* ============================================================== */}
        {currentPhase !== "rating" && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tadoba-form/tadoba_leaves_left.png"
              alt=""
              className="absolute bottom-0 left-0 w-[clamp(160px,24vw,390px)] h-auto max-h-[32vh] object-contain object-left-bottom pointer-events-none z-10 select-none -mb-0.5"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/tadoba-form/tadoba_leaves_right.png"
              alt=""
              className="absolute bottom-0 right-0 w-[clamp(180px,27vw,430px)] h-auto max-h-[32vh] object-contain object-right-bottom pointer-events-none z-10 select-none -mb-0.5"
            />
          </>
        )}
      </div>
    </>
  );
}
