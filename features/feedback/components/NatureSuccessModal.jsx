"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Send,
  CheckCircle,
  Award,
  X,
} from "lucide-react";

export default function NatureSuccessModal({
  isOpen,
  onClose,
  reviewData,
  lang = "en",
  translations,
  onSubmitWithDetails,
}) {
  const [step, setStep] = useState(1);
  const [contactDetails, setContactDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations?.[lang]?.campaign || {};
  const tMsg = translations?.[lang]?.messages || {};
  const tBtn = translations?.[lang]?.buttons || {};

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setContactDetails({
        name: "",
        email: "",
        phone: "",
      });
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateContactForm = () => {
    const newErrors = {};
    if (!contactDetails.name.trim()) newErrors.name = tMsg.nameRequired || "Name is required";
    // Email is optional - only validate format if entered
    if (
      contactDetails.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactDetails.email.trim())
    ) {
      newErrors.email = tMsg.emailRequired || "Please enter a valid email";
    }
    if (!contactDetails.phone.trim()) {
      newErrors.phone = tMsg.phoneInvalid || "Phone must be at least 10 digits";
    } else if (contactDetails.phone.trim().length < 10) {
      newErrors.phone = tMsg.phoneInvalid || "Phone must be at least 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateContactForm()) {
      try {
        setIsSubmitting(true);
        const success = await onSubmitWithDetails(contactDetails);
        if (success) {
          setStep(2);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-[95%] xs:max-w-md sm:max-w-lg my-auto overflow-hidden flex flex-col max-h-[90vh]">
        {/* Forest Green Header */}
        <div className="relative bg-gradient-to-r from-[#20402f] to-[#284e3a] p-5 sm:p-7 text-white flex-shrink-0 text-center">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/15 rounded-full mb-2">
            <Award className="h-7 w-7 text-emerald-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-1">{t.title || "Swachh Drishti Abhiyan"}</h2>
          <p className="text-emerald-100 text-xs sm:text-sm">
            {step === 2
              ? lang === "hi"
                ? "आपकी प्रतिक्रिया सफलतापूर्वक प्राप्त हुई"
                : lang === "mr"
                ? "आपला अभिप्राय यशस्वीरीत्या प्राप्त झाला"
                : "Submission Complete"
              : t.subtitle || "Analysis Complete. Your voice helped in cleaning India."}
          </p>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {step === 1 ? (
            <>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-[#284e3a] mx-auto mb-2" />
                <p className="text-gray-800 text-base sm:text-lg font-semibold">
                  {tMsg.successMessage || "Your washroom review has been submitted successfully."}
                </p>
              </div>

              <div className="text-center bg-emerald-50/70 border border-emerald-200/60 p-4 rounded-2xl">
                <p className="text-emerald-950 text-xs sm:text-sm font-medium leading-relaxed">
                  {t.enterDetails ||
                    "Share your details to enter our quarterly 'Swachh Sitara Awards'. Win vouchers for helping India be cleaner."}
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-1.5">
                    <User className="h-3.5 w-3.5 mr-1.5 text-[#284e3a]" />
                    {translations?.[lang]?.fields?.name || "Name"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={contactDetails.name}
                    onChange={(e) =>
                      setContactDetails({ ...contactDetails, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#284e3a] focus:border-transparent text-black"
                    placeholder={translations?.[lang]?.placeholders?.name || "Your full name"}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-1.5">
                    <Mail className="h-3.5 w-3.5 mr-1.5 text-[#284e3a]" />
                    {translations?.[lang]?.fields?.email || "Email"} (
                    {translations?.[lang]?.fields?.optional || "Optional"})
                  </label>
                  <input
                    type="email"
                    value={contactDetails.email}
                    onChange={(e) =>
                      setContactDetails({ ...contactDetails, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#284e3a] focus:border-transparent text-black"
                    placeholder={
                      translations?.[lang]?.placeholders?.email || "your.email@example.com (optional)"
                    }
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-1.5">
                    <Phone className="h-3.5 w-3.5 mr-1.5 text-[#284e3a]" />
                    {translations?.[lang]?.fields?.phone || "Phone Number"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactDetails.phone}
                    onChange={(e) =>
                      setContactDetails({
                        ...contactDetails,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#284e3a] focus:border-transparent text-black"
                    placeholder={
                      translations?.[lang]?.placeholders?.phone || "10-digit mobile number"
                    }
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#284e3a] text-white py-3 px-5 rounded-xl hover:bg-[#1e3a29] transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white" />
                  ) : (
                    <>
                      <span>{tBtn.continue || "Continue"}</span>
                      <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-6 space-y-3">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-1">
                  <CheckCircle className="h-10 w-10 text-[#284e3a]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {tMsg.thankYou || "Thank You!"}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                  {tMsg.thankYouDetailed ||
                    "Thank you for submitting! Your contribution helps us maintain clean and hygienic facilities."}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-[#284e3a] hover:bg-[#1e3a29] text-white py-3.5 px-5 rounded-xl font-bold text-sm sm:text-base transition-all cursor-pointer shadow-sm hover:shadow-md"
                >
                  {tBtn.close || "Close"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
