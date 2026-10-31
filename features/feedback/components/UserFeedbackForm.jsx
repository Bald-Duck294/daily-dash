"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

import TigerSmileyRating from "./TigerSmileyRating";
import TigerDecorations from "./TigerDecorations";
import NatureSuccessModal from "./NatureSuccessModal";
import {
  setRating,
  toggleReason,
  toggleNoIssues,
  setDescription,
  setLang,
  setLocationId,
  setCompanyId,
  setShowSuccessModal,
  submitFeedback,
  updateFeedbackContact,
  resetForm,
} from "../feedback.slice";

const commonIndianWashroomIssues = [
  { id: 1, text: "Dirty or unflushed toilets (Western or Indian)" },
  { id: 2, text: "Wet, slippery, or muddy floors" },
  { id: 3, text: "Unpleasant or strong odor" },
  { id: 4, text: "Paan / Gutka spit stains" },
  { id: 5, text: "Overflowing dustbins" },
  { id: 6, text: "General grime (stained walls, dirty mirrors)" },
  { id: 7, text: "No water in taps or for flush" },
  { id: 8, text: "Leaking taps, pipes, or cisterns" },
  { id: 9, text: "Broken or missing health faucet (jet spray)" },
  { id: 10, text: "No mug or lota available" },
  { id: 11, text: "Broken or missing toilet seat" },
  { id: 12, text: "Faulty or broken door lock/latch" },
  { id: 13, text: "Low water pressure" },
  { id: 14, text: "No hand-washing soap" },
  { id: 15, text: "No toilet paper available" },
  { id: 16, text: "Faulty hand dryer or no paper towels" },
  { id: 17, text: "Poor or no lighting" },
  { id: 18, text: "No hooks for bags or clothes" },
  { id: 19, text: "Poor ventilation (no fan or window)" },
  { id: 0, text: "No Issues" },
];

const translations = {
  en: {
    heroTitlePart1: "Your voice",
    heroTitleHighlight: "cleans",
    heroTitlePart2: "India",
    subtitle: "Help others by sharing your washroom experience.",
    ratingLabel: "Overall Rating",
    ratingRequired: "Rating is required",
    fields: {
      name: "Name",
      email: "Email",
      phone: "Phone Number",
      optional: "Optional",
      additional: "Additional Comments (Optional)",
      selectIssues: "What issues did you find? (Optional):",
      noIssues: "No Issues",
    },
    placeholders: {
      name: "Your full name",
      email: "your.email@example.com (optional)",
      phone: "10-digit mobile number",
      description: "Share more details about your experience...",
    },
    buttons: {
      submit: "Submit Review",
      submitting: "Submitting Review...",
      submitAnother: "Submit Another Review",
      close: "Close",
      shareWhatsApp: "Share on WhatsApp",
      continue: "Continue",
    },
    messages: {
      thankYou: "Thank You for Submitting!",
      thankYouDetailed:
        "Your feedback and details have been received successfully. Your contribution helps us maintain clean, hygienic, and well-managed facilities.",
      successMessage: "Your washroom review has been submitted successfully.",
      nameRequired: "Name is required",
      emailRequired: "Please enter a valid email",
      phoneInvalid: "Phone must be at least 10 digits",
      contactUpdateSuccess: "Thank you! Contact details submitted successfully.",
    },
    campaign: {
      title: "Swachh Drishti Abhiyan",
      subtitle: "Analysis Complete. Your voice helped in cleaning India.",
      description: "Help us improve public facilities by sharing your contact details!",
      enterDetails:
        "Share your details to enter our quarterly 'Swachh Sitara Awards'. Win vouchers for helping India be cleaner.",
    },
    ratingLabels: {
      veryPoor: "Very Poor",
      poor: "Poor",
      belowAverage: "Below Average",
      fair: "Fair",
      average: "Average",
      good: "Good",
      veryGood: "Very Good",
      great: "Great",
      excellent: "Excellent",
      outstanding: "Outstanding",
    },
    issues: [
      "Dirty or unflushed toilets (Western or Indian)",
      "Wet, slippery, or muddy floors",
      "Unpleasant or strong odor",
      "Paan / Gutka spit stains",
      "Overflowing dustbins",
      "General grime (stained walls, dirty mirrors)",
    ],
    header: {
      inAssocWith: "IN ASSOCIATION WITH",
      saafAiTitle: "SaafAI",
      saafAiSub: "Smart Facility AI",
    },
    footer: {
      initiativeTag: "Smart Sanitation & Public Hygiene Monitoring Initiative",
      partnership: "Tadoba-Andhari Tiger Reserve × SaafAI",
    },
  },
  hi: {
    heroTitlePart1: "आपकी आवाज़",
    heroTitleHighlight: "स्वच्छ बनाती है",
    heroTitlePart2: "भारत को",
    subtitle: "अपना अनुभव साझा करके दूसरों की मदद करें।",
    ratingLabel: "कुल रेटिंग",
    ratingRequired: "रेटिंग देना अनिवार्य है",
    fields: {
      name: "नाम",
      email: "ईमेल",
      phone: "फ़ोन नंबर",
      optional: "वैकल्पिक",
      additional: "अतिरिक्त टिप्पणियाँ (वैकल्पिक)",
      selectIssues: "आपको क्या समस्याएँ मिलीं? (वैकल्पिक):",
      noIssues: "कोई समस्या नहीं",
    },
    placeholders: {
      name: "आपका पूरा नाम",
      email: "आपका.ईमेल@उदाहरण.com (वैकल्पिक)",
      phone: "10 अंकों का मोबाइल नंबर",
      description: "अपने अनुभव के बारे में और बताएं...",
    },
    buttons: {
      submit: "समीक्षा जमा करें",
      submitting: "समीक्षा जमा की जा रही है...",
      submitAnother: "दूसरी समीक्षा जमा करें",
      close: "बंद करें",
      shareWhatsApp: "व्हाट्सएप पर शेयर करें",
      continue: "आगे बढ़ें",
    },
    messages: {
      thankYou: "सबमिट करने के लिए धन्यवाद!",
      thankYouDetailed:
        "आपकी समीक्षा और संपर्क विवरण सफलतापूर्वक प्राप्त हो गए हैं। आपका सहयोग ताडोबा में स्वच्छ और उच्च-स्तरीय सुविधाएं सुनिश्चित करने में मदद करता है।",
      successMessage: "आपकी शौचालय समीक्षा सफलतापूर्वक जमा हो गई है।",
      nameRequired: "नाम आवश्यक है",
      emailRequired: "कृपया एक वैध ईमेल दर्ज करें",
      phoneInvalid: "फ़ोन कम से कम 10 अंकों का होना चाहिए",
      contactUpdateSuccess: "धन्यवाद! संपर्क विवरण सफलतापूर्वक दर्ज किया गया।",
    },
    campaign: {
      title: "स्वच्छ दृष्टि अभियान",
      subtitle: "विश्लेषण पूर्ण हुआ। आपकी आवाज़ ने भारत को स्वच्छ बनाने में मदद की।",
      description: "अपने संपर्क विवरण साझा करके सार्वजनिक सुविधाओं को बेहतर बनाने में मदद करें!",
      enterDetails:
        "हमारे त्रैमासिक ‘स्वच्छ सितारा पुरस्कार’ में भाग लेने के लिए अपनी जानकारी साझा करें।",
    },
    ratingLabels: {
      veryPoor: "बहुत खराब",
      poor: "खराब",
      belowAverage: "औसत से कम",
      fair: "ठीक",
      average: "औसत",
      good: "अच्छा",
      veryGood: "बहुत अच्छा",
      great: "बेहतरीन",
      excellent: "उत्कृष्ट",
      outstanding: "शानदार",
    },
    issues: [
      "गंदे या बिना फ्लश किए शौचालय (पश्चिमी या भारतीय)",
      "गीले, फिसलन भरे या कीचड़युक्त फर्श",
      "अप्रिय या तेज़ गंध",
      "पान / गुटखा के दाग",
      "ओवरफ्लो होते कूड़ेदान",
      "सामान्य गंदगी (दीवारों पर धब्बे, गंदे शीशे)",
    ],
    header: {
      inAssocWith: "के साथ साझेदारी में",
      saafAiTitle: "SaafAI",
      saafAiSub: "स्मार्ट सुविधा तकनीक",
    },
    footer: {
      initiativeTag: "स्मार्ट स्वच्छता एवं जन सुविधा निगरानी पहल",
      partnership: "ताडोबा-अंधारी टाइगर रिजर्व × SaafAI",
    },
  },
  mr: {
    heroTitlePart1: "तुमचा आवाज",
    heroTitleHighlight: "स्वच्छ करतो",
    heroTitlePart2: "भारत",
    subtitle: "तुमचा अनुभव शेअर करून इतरांना मदत करा.",
    ratingLabel: "एकूण रेटिंग",
    ratingRequired: "रेटिंग आवश्यक आहे",
    fields: {
      name: "नाव",
      email: "ईमेल",
      phone: "फोन नंबर",
      optional: "ऐच्छिक",
      additional: "अतिरिक्त टिप्पण्या (ऐच्छिक)",
      selectIssues: "तुम्हाला कोणत्या समस्या आढळल्या? (ऐच्छिक):",
      noIssues: "कोणतीही समस्या नाही",
    },
    placeholders: {
      name: "तुमचे पूर्ण नाव",
      email: "तुमचा.ईमेल@उदाहरण.com (ऐच्छिक)",
      phone: "10 अंकांचा मोबाइल नंबर",
      description: "तुमच्या अनुभवाबद्दल अधिक सांगा...",
    },
    buttons: {
      submit: "पुनरावलोकन सबमिट करा",
      submitting: "पुनरावलोकन सबमिट होत आहे...",
      submitAnother: "दुसरे पुनरावलोकन सबमिट करा",
      close: "बंद करा",
      shareWhatsApp: "व्हाट्सअॅपवर शेअर करा",
      continue: "पुढे जा",
    },
    messages: {
      thankYou: "सबमिट केल्याबद्दल धन्यवाद!",
      thankYouDetailed:
        "आपला अभिप्राय आणि संपर्क तपशील यशस्वीरीत्या प्राप्त झाले आहेत. आपले योगदान ताडोबा येथील स्वच्छता आणि सुविधा उत्तम राखण्यास मदत करते.",
      successMessage: "आपली शौचालय समीक्षा यशस्वीरीत्या नोंदवली गेली.",
      nameRequired: "नाव आवश्यक आहे",
      emailRequired: "कृपया वैध ईमेल टाका",
      phoneInvalid: "फोन नंबर किमान 10 अंकांचा असावा",
      contactUpdateSuccess: "धन्यवाद! संपर्क तपशील यशस्वीरित्या नोंदवले गेले.",
    },
    campaign: {
      title: "स्वच्छ दृष्टी अभियान",
      subtitle: "विश्लेषण पूर्ण झाले. आपल्या आवाजाने भारताला स्वच्छ करण्यास मदत केली.",
      description: "सार्वजनिक सुविधा सुधारण्यासाठी तुमची संपर्क माहिती शेअर करा!",
      enterDetails:
        "आमच्या त्रैमासिक ‘स्वच्छ सितारा पुरस्कार’ मध्ये सहभागी होण्यासाठी संपर्क माहिती भरा.",
    },
    ratingLabels: {
      veryPoor: "अतिशय वाईट",
      poor: "वाईट",
      belowAverage: "सरासरीपेक्षा कमी",
      fair: "ठीक",
      average: "सरासरी",
      good: "चांगले",
      veryGood: "खूप चांगले",
      great: "उत्कृष्ट",
      excellent: "अतिशय छान",
      outstanding: "सर्वोत्कृष्ट",
    },
    issues: [
      "घाण किंवा फ्लश न केलेली शौचालये",
      "ओले किंवा निसरडे मजले",
      "घाणेरडा वास",
      "पान / गुटख्याचे डाग",
      "कचराकुंडी भरलेली असणे",
      "सामान्य अस्वच्छता (भिंती किंवा आरसे)",
    ],
    header: {
      inAssocWith: "च्या सहकार्याने",
      saafAiTitle: "SaafAI",
      saafAiSub: "स्मार्ट सुविधा AI",
    },
    footer: {
      initiativeTag: "स्मार्ट स्वच्छता आणि सार्वजनिक आरोग्य देखरेख उपक्रम",
      partnership: "ताडोबा-अंधारी व्याघ्र प्रकल्प × SaafAI",
    },
  },
};

export default function UserFeedbackForm() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Local form state for robust client-side reactivity and safe array defaults
  const [rating, setRating] = useState(0);
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [description, setDescription] = useState("");
  const [lang, setLang] = useState("en");
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const isKioskMode = searchParams.get("kiosk") === "true";

  // Redux status
  const feedbackState = useSelector((state) => state?.feedback) || {};
  const {
    isSubmitting = false,
    showSuccessModal = false,
    submittedReviewId = null,
    reviewData = null,
  } = feedbackState;

  const authUser = useSelector((state) => state?.auth?.user);

  // Parse location and company from URL query or fallback to persisted kiosk storage
  const rawLocationId = searchParams.get("locationId");
  const locMatch = rawLocationId ? rawLocationId.toString().match(/\d+/) : null;
  const savedLocationId = typeof window !== "undefined" ? localStorage.getItem("saafai_kiosk_locationId") : null;
  const locationId = locMatch ? locMatch[0] : (savedLocationId || "2248");

  const rawCompanyId = searchParams.get("companyId") || authUser?.company_id;
  const compMatch = rawCompanyId ? rawCompanyId.toString().match(/\d+/) : null;
  const savedCompanyId = typeof window !== "undefined" ? localStorage.getItem("saafai_kiosk_companyId") : null;
  const companyId = compMatch ? compMatch[0] : (savedCompanyId || "95");

  // Persist current washroom assignment to localStorage for future kiosk app launches
  useEffect(() => {
    if (locMatch?.[0] && typeof window !== "undefined") {
      localStorage.setItem("saafai_kiosk_locationId", locMatch[0]);
    }
    if (compMatch?.[0] && typeof window !== "undefined") {
      localStorage.setItem("saafai_kiosk_companyId", compMatch[0]);
    }
  }, [locMatch, compMatch]);

  // PWA Install state
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      setIsStandalone(isStandaloneMode);

      const handleInstallable = () => setCanInstall(true);
      window.addEventListener("pwa-installable", handleInstallable);
      if (window.deferredPwaPrompt) setCanInstall(true);

      return () => {
        window.removeEventListener("pwa-installable", handleInstallable);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (typeof window !== "undefined" && window.deferredPwaPrompt) {
      try {
        window.deferredPwaPrompt.prompt();
        const choice = await window.deferredPwaPrompt.userChoice;
        if (choice.outcome === "accepted") {
          toast.success("App installed successfully!");
          setCanInstall(false);
        }
        window.deferredPwaPrompt = null;
      } catch (err) {
        console.warn("PWA prompt error:", err);
      }
    } else {
      toast(
        "To install on this device: tap Chrome's 3-dot menu (⋮) and select 'Install app' or 'Add to Home screen'",
        {
          icon: "📲",
          duration: 6000,
        }
      );
    }
  };

  useEffect(() => {
    dispatch(setLocationId(locationId));
    dispatch(setCompanyId(companyId));
  }, [locationId, companyId, dispatch]);

  const isReasonSelected = (reasonId) => {
    return Array.isArray(selectedReasons) ? selectedReasons.includes(reasonId) : false;
  };

  const handleRatingChange = (val) => {
    setRating(val);
  };

  const handleReasonToggle = (reasonId) => {
    setSelectedReasons((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      if (current.includes(reasonId)) {
        return current.filter((id) => id !== reasonId);
      } else {
        return [...current.filter((id) => id !== 0), reasonId];
      }
    });
  };

  const handleNoIssuesToggle = () => {
    setSelectedReasons((prev) => {
      const current = Array.isArray(prev) ? prev : [];
      return current.includes(0) ? [] : [0];
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmittedOnce(true);

    if (rating === 0) {
      toast.error(translations[lang]?.ratingRequired || "Please provide a rating");
      return;
    }

    const payload = {
      rating,
      description,
      reasonids: selectedReasons,
      location_id: locationId,
      companyId: companyId,
    };

    const resultAction = await dispatch(submitFeedback(payload));
    if (submitFeedback.fulfilled.match(resultAction)) {
      toast.success(resultAction.payload?.message || "Review submitted successfully!");
      setRating(0);
      setSelectedReasons([]);
      setDescription("");
      setSubmittedOnce(false);
    } else {
      toast.error(resultAction.payload || "Failed to submit review");
    }
  };

  const handleContactSubmit = async (contactDetails) => {
    if (!submittedReviewId) return false;
    const resultAction = await dispatch(
      updateFeedbackContact({
        reviewId: submittedReviewId,
        contactDetails,
      })
    );

    if (updateFeedbackContact.fulfilled.match(resultAction)) {
      toast.success(
        translations[lang].messages.contactUpdateSuccess ||
          "Contact details updated successfully!"
      );
      return true;
    } else {
      toast.error(resultAction.payload || "Failed to update contact details");
      return false;
    }
  };

  const currentLang = translations[lang] ? lang : "en";

  return (
    <>
      <div className="min-h-screen bg-[#faf8f4] font-sans flex flex-col justify-start items-center py-4 px-3 sm:py-8 sm:px-4">
        <div
          className={`w-full max-w-[620px] mx-auto transition-all duration-300 tadoba-kiosk-container ${
            isKioskMode ? "tadoba-force-kiosk" : ""
          }`}
        >
          {/* Main Card */}
          <div className="relative bg-[#faf8f4] rounded-2xl sm:rounded-3xl shadow-sm sm:shadow-md border border-stone-200/80 overflow-hidden">
            {/* TOP HEADER: Co-Brand Bar */}
            <div className="relative z-10 bg-white px-3.5 py-3 sm:px-6 sm:py-3.5 border-b border-stone-200/70 tadoba-kiosk-header">
              <div className="flex items-center justify-between gap-2.5 sm:gap-4">
                {/* Partner Logos Strip */}
                <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 flex-nowrap min-w-0">
                  {/* Tadoba TATR Logo */}
                  <div className="flex items-center flex-shrink-0">
                    <Image
                      src="/tadoba_logo.jpeg"
                      alt="Tadoba-Andhari Tiger Reserve"
                      width={80}
                      height={80}
                      className="h-10 xs:h-11 sm:h-13 w-auto object-contain tadoba-kiosk-logo"
                      priority
                    />
                  </div>

                  {/* Association Divider */}
                  <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-2.5 flex-shrink-0">
                    <div className="h-6 sm:h-8 w-px bg-stone-200 tadoba-kiosk-divider" />
                    <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs font-semibold tracking-wider text-stone-400 uppercase text-center whitespace-nowrap tadoba-kiosk-assoc-text">
                      {translations[currentLang]?.header?.inAssocWith || "IN ASSOCIATION WITH"}
                    </span>
                    <div className="h-6 sm:h-8 w-px bg-stone-200 tadoba-kiosk-divider" />
                  </div>

                  {/* SaafAI Logo */}
                  <div className="flex items-center justify-center flex-shrink-0 select-none">
                    <div className="text-lg xs:text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-none tadoba-kiosk-brand-title">
                      Saaf<span className="text-[#00A3E0]">AI</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* PWA Install Button (hidden when already installed in standalone mode) */}
                  {!isStandalone && (
                    <button
                      type="button"
                      onClick={handleInstallClick}
                      className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1 rounded-xl text-xs font-semibold bg-[#284e3a] text-white hover:bg-[#1e3a29] transition-all shadow-xs cursor-pointer flex-shrink-0"
                      title="Install as Kiosk App"
                    >
                      <Download size={13} />
                      <span className="hidden xs:inline">Install App</span>
                    </button>
                  )}

                  {/* Segmented Language Selector Pill */}
                  <div className="flex items-center bg-stone-50 border border-stone-200 rounded-xl p-0.5 gap-0.5 shadow-2xs flex-shrink-0">
                    {["en", "hi", "mr"].map((l) => (
                      <button
                        key={l}
                        type="button"
                        onClick={() => dispatch(setLang(l))}
                        className={`px-2.5 py-1 sm:px-3 sm:py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer tadoba-kiosk-lang-btn ${
                          currentLang === l
                            ? "bg-[#284e3a] text-white font-bold shadow-xs"
                            : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                        }`}
                      >
                        {l.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* HERO BANNER SECTION */}
            <div className="relative z-10 w-full overflow-hidden bg-[#faf8f5] select-none border-b border-stone-200/60">
              <Image
                src="/tadoba-form/tadoba_voice_cleans_tadoba.png"
                alt="Your voice cleans Tadoba - Tadoba-Andhari Tiger Reserve"
                width={800}
                height={224}
                className="w-full h-auto block object-cover"
                priority
              />
            </div>

            {/* REVIEW FORM BODY */}
            <div className="relative">
              <TigerDecorations />

              <form
                onSubmit={handleFormSubmit}
                className="relative z-10 px-4 py-5 sm:px-6 sm:py-6 space-y-5 sm:space-y-6 pb-6 sm:pb-7 tadoba-kiosk-form"
              >
                {/* 1. OVERALL RATING SECTION */}
                <div>
                  <label className="block text-sm sm:text-base font-bold text-stone-900 mb-2.5 tadoba-kiosk-section-label">
                    {translations[currentLang].ratingLabel}{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <TigerSmileyRating
                    rating={rating}
                    onRatingChange={handleRatingChange}
                    ratingLabels={translations[currentLang].ratingLabels}
                  />

                  {submittedOnce && rating === 0 && (
                    <p className="text-orange-600 text-xs sm:text-sm font-semibold mt-2 text-center sm:text-left">
                      {translations[currentLang].ratingRequired}
                    </p>
                  )}
                </div>

                {/* 2. ISSUES SECTION */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      onClick={() => {
                        if (isReasonSelected(0)) {
                          handleNoIssuesToggle();
                        }
                      }}
                      className={`flex items-center gap-2 text-sm sm:text-base font-bold text-stone-900 tadoba-kiosk-section-label ${
                        isReasonSelected(0) ? "cursor-pointer" : ""
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                          !isReasonSelected(0)
                            ? "bg-[#284e3a] text-white text-[10px]"
                            : "border border-stone-300 bg-white"
                        }`}
                      >
                        {!isReasonSelected(0) && "✓"}
                      </div>
                      <span>{translations[currentLang].fields.selectIssues}</span>
                    </div>

                    {/* No Issues Checkbox */}
                    <label className="flex items-center space-x-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isReasonSelected(0)}
                        onChange={handleNoIssuesToggle}
                        className="h-4 w-4 text-[#284e3a] rounded border-stone-300 focus:ring-[#284e3a] accent-[#284e3a]"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-stone-800">
                        {translations[currentLang].fields.noIssues}
                      </span>
                    </label>
                  </div>

                  {/* Issues Grid */}
                  {!isReasonSelected(0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                      {translations[currentLang].issues.map((issueText, index) => {
                        const reasonId = commonIndianWashroomIssues[index]?.id ?? (index + 1);
                        const isChecked = isReasonSelected(reasonId);

                        return (
                          <label
                            key={reasonId}
                            className={`flex items-start space-x-2.5 p-2.5 sm:p-3 rounded-xl border transition-all cursor-pointer tadoba-kiosk-issue-item ${
                              isChecked
                                ? "bg-emerald-50/80 border-[#284e3a]/60 shadow-2xs"
                                : "bg-white/90 border-stone-200/90 hover:bg-stone-50/80 hover:border-stone-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleReasonToggle(reasonId)}
                              className="mt-0.5 h-4 w-4 rounded text-[#284e3a] border-stone-300 focus:ring-[#284e3a] accent-[#284e3a] flex-shrink-0 tadoba-kiosk-issue-checkbox"
                            />
                            <span className="text-xs sm:text-[13px] font-medium text-stone-700 leading-snug tadoba-kiosk-issue-text">
                              {issueText}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 3. ADDITIONAL COMMENTS */}
                <div>
                  <label className="flex items-center text-sm sm:text-base font-bold text-stone-900 mb-2 tadoba-kiosk-section-label">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 text-stone-700" />
                    {translations[currentLang].fields.additional}
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => dispatch(setDescription(e.target.value))}
                    rows={3}
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 border border-stone-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-[#284e3a] focus:border-[#284e3a] resize-none text-stone-900 bg-white/90 placeholder-stone-400 text-xs sm:text-sm min-h-[75px] sm:min-h-[85px] tadoba-kiosk-textarea"
                    placeholder={translations[currentLang].placeholders.description}
                  />
                </div>

                {/* 4. SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#284e3a] hover:bg-[#1f3f2e] text-white py-3.5 sm:py-4 px-6 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center space-x-2 text-sm sm:text-base shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-75 tadoba-kiosk-submit-btn"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white" />
                      <span>{translations[currentLang].buttons.submitting}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 sm:h-5 sm:w-5 rotate-45" />
                      <span>{translations[currentLang].buttons.submit}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* CLEAN FOOTER */}
            <div className="relative z-10 bg-white/95 border-t border-stone-150 px-4 py-2.5 sm:px-6 sm:py-3 tadoba-kiosk-footer">
              <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs text-stone-500">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#284e3a] flex-shrink-0" />
                <span className="font-semibold text-stone-700">
                  {translations[currentLang]?.footer?.initiativeTag}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <NatureSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          dispatch(setShowSuccessModal(false));
          dispatch(resetForm());
        }}
        reviewData={reviewData}
        lang={currentLang}
        translations={translations}
        onSubmitWithDetails={handleContactSubmit}
      />
    </>
  );
}
