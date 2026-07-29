// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   ArrowRight,
//   ArrowLeft,
//   Building2,
//   CheckCircle2,
//   Loader2,
// } from "lucide-react";
// import { CompanyApi } from "@/features/companies/api/companies.api";

// const COMPANY_STORAGE_KEY = "company_setup_draft";
// const COMPANY_STORAGE_VERSION = 1;

// const ORGANIZATION_TYPES = [
//   { id: "Government Office", label: "Government", icon: "🏛️" },
//   { id: "Hospital / Healthcare", label: "Healthcare", icon: "🏥" },
//   { id: "Mall / Commercial Complex", label: "Commercial", icon: "🛍️" },
//   { id: "Public Infrastructure", label: "Public Infra", icon: "✈️" },
//   { id: "Hotel", label: "Hospitality", icon: "🏨" },
//   { id: "Other", label: "Other", icon: "⚙️" },
// ];

// const OPERATION_STRUCTURES = [
//   {
//     id: "Single Building",
//     label: "Single Building",
//     icon: "🏠",
//     desc: "One primary facility",
//   },
//   {
//     id: "Multiple Building Campus",
//     label: "Campus",
//     icon: "🏘️",
//     desc: "Multiple adjacent buildings",
//   },
//   {
//     id: "Multiple Locations",
//     label: "Multiple Locations",
//     icon: "📍",
//     desc: "Distributed city facilities",
//   },
//   {
//     id: "Regional Network",
//     label: "Regional",
//     icon: "🗺️",
//     desc: "State-wide operations",
//   },
//   {
//     id: "National Network",
//     label: "National",
//     icon: "🌐",
//     desc: "Country-wide presence",
//   },
// ];

// export default function CompanySetupPage() {
//   const router = useRouter();
//   const inputRef = useRef(null);

//   const [isLoaded, setIsLoaded] = useState(false);
//   const [step, setStep] = useState(1);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isTransitioning, setIsTransitioning] = useState(false);

//   const [formData, setFormData] = useState({
//     organization_name: "",
//     organization_type: "",
//     operation_structure: "",
//   });

//   // 🚀 HYDRATION
//   useEffect(() => {
//     const savedState = localStorage.getItem(COMPANY_STORAGE_KEY);
//     if (savedState) {
//       try {
//         const parsed = JSON.parse(savedState);
//         if (parsed.version === COMPANY_STORAGE_VERSION) {
//           if (parsed.step) setStep(parsed.step);
//           if (parsed.formData) setFormData(parsed.formData);
//         } else {
//           localStorage.removeItem(COMPANY_STORAGE_KEY);
//         }
//       } catch (e) {
//         localStorage.removeItem(COMPANY_STORAGE_KEY);
//       }
//     }
//     setIsLoaded(true);
//   }, []);

//   // 🚀 SAVE
//   useEffect(() => {
//     if (!isLoaded) return;
//     const draft = {
//       version: COMPANY_STORAGE_VERSION,
//       step,
//       formData,
//       savedAt: Date.now(),
//     };
//     localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(draft));
//   }, [step, formData, isLoaded]);

//   useEffect(() => {
//     if (step === 1 && inputRef.current) {
//       inputRef.current.focus();
//     }
//   }, [step]);

//   const advanceStep = (nextStep) => {
//     setIsTransitioning(true);
//     setTimeout(() => {
//       setStep(nextStep);
//       setIsTransitioning(false);
//     }, 350);
//   };

//   const handleNameSubmit = (e) => {
//     e.preventDefault();
//     if (!formData.organization_name.trim()) {
//       toast.error("Please enter an organization name.");
//       return;
//     }
//     advanceStep(2);
//   };

//   const handleTypeSelect = (typeId) => {
//     setFormData((prev) => ({ ...prev, organization_type: typeId }));
//     advanceStep(3);
//   };

//   const handleStructureSelect = async (structureId) => {
//     const finalData = { ...formData, operation_structure: structureId };
//     setFormData(finalData);

//     setIsLoading(true);
//     try {
//       await CompanyApi.setupCompany(finalData);

//       // 🚀 CLEANUP ON SUCCESS
//       localStorage.removeItem(COMPANY_STORAGE_KEY);

//       toast.success("Workspace initialized!");
//       setTimeout(() => {
//         router.push("/stepper");
//       }, 800);
//     } catch (error) {
//       console.error(error);
//       toast.error(
//         error?.response?.data?.error || "Failed to save company profile.",
//       );
//       setIsLoading(false);
//       setStep(3);
//     }
//   };

//   // Hydration Guard
//   if (!isLoaded) return null;

//   return (
//     <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative selection:bg-blue-100">
//       <Toaster position="top-center" />

//       <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 z-50">
//         <div
//           className="h-full bg-blue-600 transition-all duration-500 ease-out"
//           style={{ width: `${(step / 3) * 100}%` }}
//         />
//       </div>

//       <header className="p-6 md:p-10 flex justify-between items-center w-full max-w-5xl mx-auto">
//         <div className="flex items-center gap-2.5">
//           <div className="w-8 h-8 rounded-lg bg-[#1F4E79] flex items-center justify-center">
//             <Building2 className="w-4 h-4 text-white" />
//           </div>
//           <span className="font-bold text-lg tracking-tight text-slate-800">
//             Safai
//           </span>
//         </div>

//         {step > 1 && !isLoading && (
//           <button
//             onClick={() => setStep(step - 1)}
//             className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
//           >
//             <ArrowLeft className="w-4 h-4" /> Back
//           </button>
//         )}
//       </header>

//       <main className="flex-1 flex items-center justify-center p-6 pb-24">
//         <div className="w-full max-w-2xl mx-auto">
//           {step === 1 && (
//             <div
//               className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
//             >
//               <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
//                 What's your organization called?
//               </h1>
//               <p className="text-slate-500 mb-8 font-medium">
//                 This will be the name of your primary workspace.
//               </p>
//               <form onSubmit={handleNameSubmit} className="relative">
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   value={formData.organization_name}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       organization_name: e.target.value,
//                     })
//                   }
//                   placeholder="e.g. Acme Corp, City Hospital..."
//                   className="w-full text-2xl md:text-3xl font-bold text-slate-900 placeholder:text-slate-300 border-b-2 border-slate-200 focus:border-blue-600 bg-transparent py-4 pr-14 outline-none transition-colors"
//                 />
//                 <button
//                   type="submit"
//                   disabled={!formData.organization_name.trim()}
//                   className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all"
//                 >
//                   <ArrowRight className="w-5 h-5" />
//                 </button>
//               </form>
//             </div>
//           )}

//           {step === 2 && (
//             <div
//               className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
//             >
//               <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
//                 What type of facility is{" "}
//                 <span className="text-blue-600">
//                   {formData.organization_name}
//                 </span>
//                 ?
//               </h1>
//               <p className="text-slate-500 mb-8 font-medium">
//                 We'll tailor your dashboard metrics based on your industry.
//               </p>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {ORGANIZATION_TYPES.map((type) => {
//                   const isSelected = formData.organization_type === type.id;
//                   return (
//                     <button
//                       key={type.id}
//                       onClick={() => handleTypeSelect(type.id)}
//                       className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group flex flex-col gap-3
//                         ${isSelected ? "border-blue-600 bg-blue-50/50 shadow-sm scale-[0.98]" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"}`}
//                     >
//                       <span className="text-3xl block">{type.icon}</span>
//                       <span
//                         className={`font-bold text-sm ${isSelected ? "text-blue-900" : "text-slate-700 group-hover:text-blue-700"}`}
//                       >
//                         {type.label}
//                       </span>
//                       {isSelected && (
//                         <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-blue-600 animate-in zoom-in" />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {step === 3 && (
//             <div
//               className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
//             >
//               {isLoading ? (
//                 <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
//                   <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-inner">
//                     <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
//                   </div>
//                   <h2 className="text-2xl font-black text-slate-900 mb-2">
//                     Creating Workspace
//                   </h2>
//                   <p className="text-slate-500 font-medium">
//                     Setting up your environment infrastructure...
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
//                     How is your operation structured?
//                   </h1>
//                   <p className="text-slate-500 mb-8 font-medium">
//                     This helps us generate the correct hierarchy map for your
//                     setup.
//                   </p>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {OPERATION_STRUCTURES.map((struct) => {
//                       const isSelected =
//                         formData.operation_structure === struct.id;
//                       return (
//                         <button
//                           key={struct.id}
//                           onClick={() => handleStructureSelect(struct.id)}
//                           className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group flex items-center gap-4
//                             ${isSelected ? "border-blue-600 bg-blue-50/50 shadow-sm scale-[0.98]" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"}`}
//                         >
//                           <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
//                             {struct.icon}
//                           </div>
//                           <div>
//                             <span
//                               className={`font-bold block mb-0.5 ${isSelected ? "text-blue-900" : "text-slate-800"}`}
//                             >
//                               {struct.label}
//                             </span>
//                             <span className="text-xs text-slate-500 font-medium">
//                               {struct.desc}
//                             </span>
//                           </div>
//                           {isSelected && (
//                             <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-5 w-5 h-5 text-blue-600 animate-in zoom-in" />
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </>
//               )}
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   );
// }


"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Landmark,
  Hospital,
  ShoppingBag,
  Plane,
  Hotel,
  MoreHorizontal,
  Home,
  Grip,
  MapPin,
  Map,
  Globe2,
} from "lucide-react";
import { CompanyApi } from "@/features/companies/api/companies.api";
// If you are using next/image, you can import Image from "next/image";
import { useSelector } from "react-redux";
import { StorageManager } from "@/shared/utils/storageManager";

// Replaced emojis with modern Lucide icons
const ORGANIZATION_TYPES = [
  { id: "Government Office", label: "Government", Icon: Landmark },
  { id: "Hospital / Healthcare", label: "Healthcare", Icon: Hospital },
  { id: "Mall / Commercial Complex", label: "Commercial", Icon: ShoppingBag },
  { id: "Public Infrastructure", label: "Public Infra", Icon: Plane },
  { id: "Hotel", label: "Hospitality", Icon: Hotel },
  { id: "Other", label: "Other", Icon: MoreHorizontal },
];

const OPERATION_STRUCTURES = [
  {
    id: "Single Building",
    label: "Single Building",
    Icon: Home,
    desc: "One primary facility",
  },
  {
    id: "Multiple Building Campus",
    label: "Campus",
    Icon: Grip,
    desc: "Multiple adjacent buildings",
  },
  {
    id: "Multiple Locations",
    label: "Multiple Locations",
    Icon: MapPin,
    desc: "Distributed city facilities",
  },
  {
    id: "Regional Network",
    label: "Regional",
    Icon: Map,
    desc: "State-wide operations",
  },
  {
    id: "National Network",
    label: "National",
    Icon: Globe2,
    desc: "Country-wide presence",
  },
];

const LOADING_TAGLINES = [
  "Calibrating your workspace...",
  "Assembling the dashboard...",
  "Deploying modern aesthetics...",
  "Sweeping up the details...",
  "Almost ready to shine!",
];

export default function CompanySetupPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth) || {};
  const inputRef = useRef(null);
  const otherInputRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // New states for the "Other" option handling
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customType, setCustomType] = useState("");
  const [loadingTaglineIdx, setLoadingTaglineIdx] = useState(0);

  const [formData, setFormData] = useState({
    organization_name: "",
    organization_type: "",
    operation_structure: "",
  });

  // 🚀 HYDRATION
  useEffect(() => {
    StorageManager.purgeLegacyDrafts();
    if (!user?.id) return;

    const parsed = StorageManager.loadCompanySetupDraft(user.id);
    if (parsed) {
      if (parsed.step) setStep(parsed.step);
      if (parsed.formData) {
        setFormData(parsed.formData);
        // Check if the loaded type is a custom one (not in the standard list)
        const isStandardType = ORGANIZATION_TYPES.some(
          (t) => t.id === parsed.formData.organization_type
        );
        if (
          parsed.formData.organization_type &&
          !isStandardType &&
          parsed.step === 2
        ) {
          setShowOtherInput(true);
          setCustomType(parsed.formData.organization_type);
        }
      }
    }
    setIsLoaded(true);
  }, [user?.id]);

  // 🚀 SAVE
  useEffect(() => {
    if (!isLoaded || !user?.id) return;
    StorageManager.saveCompanySetupDraft(user.id, step, formData);
  }, [step, formData, isLoaded, user?.id]);

  useEffect(() => {
    if (step === 1 && inputRef.current) {
      inputRef.current.focus();
    }
    if (step === 2 && showOtherInput && otherInputRef.current) {
      otherInputRef.current.focus();
    }
  }, [step, showOtherInput]);

  // Rotate taglines when loading
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingTaglineIdx((prev) => (prev + 1) % LOADING_TAGLINES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const advanceStep = (nextStep) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 350);
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (!formData.organization_name.trim()) {
      toast.error("Please enter an organization name.");
      return;
    }
    advanceStep(2);
  };

  const handleTypeSelect = (typeId) => {
    if (typeId === "Other") {
      setShowOtherInput(true);
      setFormData((prev) => ({ ...prev, organization_type: "Other" }));
    } else {
      setShowOtherInput(false);
      setFormData((prev) => ({ ...prev, organization_type: typeId }));
      advanceStep(3);
    }
  };

  const handleCustomTypeSubmit = (e) => {
    e.preventDefault();
    if (!customType.trim()) {
      toast.error("Please enter your organization type.");
      return;
    }
    // Update payload with custom input
    setFormData((prev) => ({ ...prev, organization_type: customType }));
    advanceStep(3);
  };

  const handleStructureSelect = async (structureId) => {
    const finalData = { ...formData, operation_structure: structureId };
    setFormData(finalData);

    setIsLoading(true);
    try {
      await CompanyApi.setupCompany(finalData);

      // 🚀 CLEANUP ON SUCCESS
      if (user?.id) {
        StorageManager.clearCompanySetupDraft(user.id);
      }

      toast.success("Workspace initialized!");
      setTimeout(() => {
        router.push("/stepper");
      }, 800);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.error || "Failed to save company profile."
      );
      setIsLoading(false);
      setStep(3);
    }
  };

  // Hydration Guard
  if (!isLoaded) return null;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex flex-col font-sans relative selection:bg-blue-100 selection:text-blue-900 transition-colors duration-300">
      <Toaster position="top-center" />

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-200 dark:bg-slate-800 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <header className="p-6 md:p-10 flex justify-between items-center w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1F4E79] to-blue-700 shadow-md flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            Safai
          </span>
        </div>

        {step > 1 && !isLoading && (
          <button
            onClick={() => {
              if (step === 2 && showOtherInput) {
                setShowOtherInput(false);
                setFormData((prev) => ({ ...prev, organization_type: "" }));
              } else {
                setStep(step - 1);
              }
            }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-slate-200/50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-2xl mx-auto">
          {/* STEP 1: ORGANIZATION NAME */}
          {step === 1 && (
            <div
              className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
            >
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                What's your organization called?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg font-medium">
                This will be the name of your primary workspace.
              </p>
              <form onSubmit={handleNameSubmit} className="relative group">
                <input
                  ref={inputRef}
                  type="text"
                  value={formData.organization_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      organization_name: e.target.value,
                    })
                  }
                  placeholder="e.g. Acme Corp, City Hospital..."
                  className="w-full text-2xl md:text-3xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 border-b-2 border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500 bg-transparent py-4 pr-16 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!formData.organization_name.trim()}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: ORGANIZATION TYPE */}
          {step === 2 && (
            <div
              className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
            >
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                What type of facility is{" "}
                <span className="text-blue-600 dark:text-blue-500">
                  {formData.organization_name}
                </span>
                ?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                We'll tailor your dashboard metrics based on your industry.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ORGANIZATION_TYPES.map((type) => {
                  const isSelected =
                    (formData.organization_type === type.id && !showOtherInput) ||
                    (type.id === "Other" && showOtherInput);

                  const IconComponent = type.Icon;

                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group flex flex-col gap-4
                        ${isSelected
                          ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm scale-[0.98]"
                          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                        }`}
                    >
                      <div
                        className={`p-2.5 rounded-lg w-fit transition-colors ${isSelected ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400" : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-blue-600"}`}
                      >
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span
                        className={`font-bold text-sm ${isSelected ? "text-blue-900 dark:text-blue-400" : "text-slate-700 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400"}`}
                      >
                        {type.label}
                      </span>
                      {isSelected && type.id !== "Other" && (
                        <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-blue-600 dark:text-blue-500 animate-in zoom-in" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Input for "Other" Selection */}
              {showOtherInput && (
                <form
                  onSubmit={handleCustomTypeSubmit}
                  className="mt-6 animate-in slide-in-from-top-4 fade-in duration-300 relative"
                >
                  <input
                    ref={otherInputRef}
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter your industry type..."
                    className="w-full text-lg font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 border-2 border-slate-200 dark:border-slate-800 focus:border-blue-600 dark:focus:border-blue-500 bg-white dark:bg-slate-900 rounded-2xl py-4 pl-5 pr-16 outline-none transition-all shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!customType.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white rounded-xl flex items-center justify-center transition-all"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: OPERATION STRUCTURE & LOADING */}
          {step === 3 && (
            <div
              className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 animate-in fade-in duration-700">
                  <div className="relative mb-8 w-32 h-32 flex items-center justify-center">
                    {/* Glowing effect behind mascot */}
                    <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-600/20 blur-2xl rounded-full animate-pulse" />
                    <img
                      src="/flo-mascot.webp"
                      alt="Flo Mascot"
                      className="w-full h-full object-contain animate-bounce relative z-10 drop-shadow-2xl"
                    />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-3">
                    Setting up your workspace
                  </h2>
                  <div className="h-6 overflow-hidden relative w-full text-center">
                    <p
                      key={loadingTaglineIdx}
                      className="text-slate-500 dark:text-slate-400 font-medium text-lg animate-in slide-in-from-bottom-5 fade-in duration-500 absolute w-full"
                    >
                      {LOADING_TAGLINES[loadingTaglineIdx]}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                    How is your operation structured?
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                    This helps us generate the correct hierarchy map for your setup.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {OPERATION_STRUCTURES.map((struct) => {
                      const isSelected =
                        formData.operation_structure === struct.id;
                      const IconComponent = struct.Icon;

                      return (
                        <button
                          key={struct.id}
                          onClick={() => handleStructureSelect(struct.id)}
                          className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group flex items-center gap-4
                            ${isSelected
                              ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-sm scale-[0.98]"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md"
                            }`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm border border-slate-100 dark:border-slate-700">
                            <IconComponent
                              className={`w-6 h-6 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 group-hover:text-blue-500"}`}
                            />
                          </div>
                          <div>
                            <span
                              className={`font-bold block mb-0.5 ${isSelected ? "text-blue-900 dark:text-blue-400" : "text-slate-800 dark:text-slate-100"}`}
                            >
                              {struct.label}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {struct.desc}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-5 w-5 h-5 text-blue-600 dark:text-blue-500 animate-in zoom-in" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}