// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import toast, { Toaster } from "react-hot-toast";
// import {
//   ArrowRight,
//   ArrowLeft,
//   Building2,
//   CheckCircle2,
//   Loader2,
// } from "lucide-react";

// // Mocking API for self-contained compilation.
// // In your project, you can swap this back to your real CompanyApi.
// const CompanyApi = {
//   setupCompany: (data) => new Promise((resolve) => setTimeout(resolve, 1000)),
// };

// const ORGANIZATION_TYPES = [
//   { id: "Corporate Office / IT Park", label: "Corporate Office", icon: "🏢" },
//   { id: "Hospital / Healthcare", label: "Healthcare", icon: "🏥" },
//   { id: "School / College", label: "Education", icon: "🎓" },
//   { id: "Factory / Manufacturing", label: "Manufacturing", icon: "🏭" },
//   { id: "Mall / Commercial Complex", label: "Commercial", icon: "🛍️" },
//   { id: "Public Infrastructure", label: "Public Infra", icon: "✈️" },
//   { id: "Government Office", label: "Government", icon: "🏛️" },
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
//   // Navigation handled via window.location for broad compatibility
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

//   useEffect(() => {
//     const savedProgress = localStorage.getItem("companySetupProgress");
//     if (savedProgress) {
//       try {
//         const { savedStep, savedData } = JSON.parse(savedProgress);
//         if (savedStep) setStep(savedStep);
//         if (savedData) setFormData(savedData);
//       } catch (e) {
//         console.error("Failed to load setup progress", e);
//       }
//     }
//     setIsLoaded(true);
//   }, []);

//   useEffect(() => {
//     if (isLoaded) {
//       localStorage.setItem(
//         "companySetupProgress",
//         JSON.stringify({ savedStep: step, savedData: formData }),
//       );
//     }
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
//       localStorage.removeItem("companySetupProgress");
//       toast.success("Workspace initialized!");
//       setTimeout(() => {
//         window.location.href = "/stepper";
//       }, 800);
//     } catch (error) {
//       toast.error("Failed to save company profile.");
//       setIsLoading(false);
//       setStep(3);
//     }
//   };

//   if (!isLoaded) return null;

//   return (
//     <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative">
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
//             className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900"
//           >
//             <ArrowLeft className="w-4 h-4" /> Back
//           </button>
//         )}
//       </header>

//       <main className="flex-1 flex items-center justify-center p-6 pb-24">
//         <div className="w-full max-w-2xl mx-auto">
//           {step === 1 && (
//             <div
//               className={`transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
//             >
//               <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
//                 What's your organization called?
//               </h1>
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
//                   placeholder="e.g. Acme Corp..."
//                   className="w-full text-2xl font-bold border-b-2 border-slate-200 focus:border-blue-600 bg-transparent py-4 outline-none"
//                 />
//                 <button
//                   type="submit"
//                   className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center"
//                 >
//                   <ArrowRight className="w-5 h-5" />
//                 </button>
//               </form>
//             </div>
//           )}

//           {step === 2 && (
//             <div
//               className={`transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
//             >
//               <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
//                 What type of facility?
//               </h1>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {ORGANIZATION_TYPES.map((type) => (
//                   <button
//                     key={type.id}
//                     onClick={() => handleTypeSelect(type.id)}
//                     className={`p-5 rounded-2xl border-2 text-left ${formData.organization_type === type.id ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}
//                   >
//                     <span className="text-3xl block mb-2">{type.icon}</span>
//                     <span className="font-bold text-sm">{type.label}</span>
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}

//           {step === 3 && (
//             <div
//               className={`transition-all duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}
//             >
//               {isLoading ? (
//                 <div className="flex flex-col items-center py-20">
//                   <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
//                   <p className="font-bold">Creating Workspace...</p>
//                 </div>
//               ) : (
//                 <>
//                   <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3">
//                     Operation structure?
//                   </h1>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {OPERATION_STRUCTURES.map((struct) => (
//                       <button
//                         key={struct.id}
//                         onClick={() => handleStructureSelect(struct.id)}
//                         className={`p-5 rounded-2xl border-2 ${formData.operation_structure === struct.id ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}
//                       >
//                         <span className="font-bold block mb-1">
//                           {struct.label}
//                         </span>
//                         <span className="text-xs text-slate-500">
//                           {struct.desc}
//                         </span>
//                       </button>
//                     ))}
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
  Loader2,
} from "lucide-react";
import { CompanyApi } from "@/features/companies/api/companies.api";

const COMPANY_STORAGE_KEY = "company_setup_draft";
const COMPANY_STORAGE_VERSION = 1;

const ORGANIZATION_TYPES = [
  { id: "Corporate Office / IT Park", label: "Corporate Office", icon: "🏢" },
  { id: "Hospital / Healthcare", label: "Healthcare", icon: "🏥" },
  { id: "School / College", label: "Education", icon: "🎓" },
  { id: "Factory / Manufacturing", label: "Manufacturing", icon: "🏭" },
  { id: "Mall / Commercial Complex", label: "Commercial", icon: "🛍️" },
  { id: "Public Infrastructure", label: "Public Infra", icon: "✈️" },
  { id: "Government Office", label: "Government", icon: "🏛️" },
  { id: "Hotel", label: "Hospitality", icon: "🏨" },
  { id: "Other", label: "Other", icon: "⚙️" },
];

const OPERATION_STRUCTURES = [
  {
    id: "Single Building",
    label: "Single Building",
    icon: "🏠",
    desc: "One primary facility",
  },
  {
    id: "Multiple Building Campus",
    label: "Campus",
    icon: "🏘️",
    desc: "Multiple adjacent buildings",
  },
  {
    id: "Multiple Locations",
    label: "Multiple Locations",
    icon: "📍",
    desc: "Distributed city facilities",
  },
  {
    id: "Regional Network",
    label: "Regional",
    icon: "🗺️",
    desc: "State-wide operations",
  },
  {
    id: "National Network",
    label: "National",
    icon: "🌐",
    desc: "Country-wide presence",
  },
];

export default function CompanySetupPage() {
  const router = useRouter();
  const inputRef = useRef(null);

  const [isLoaded, setIsLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [formData, setFormData] = useState({
    organization_name: "",
    organization_type: "",
    operation_structure: "",
  });

  // 🚀 HYDRATION
  useEffect(() => {
    const savedState = localStorage.getItem(COMPANY_STORAGE_KEY);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.version === COMPANY_STORAGE_VERSION) {
          if (parsed.step) setStep(parsed.step);
          if (parsed.formData) setFormData(parsed.formData);
        } else {
          localStorage.removeItem(COMPANY_STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(COMPANY_STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  // 🚀 SAVE
  useEffect(() => {
    if (!isLoaded) return;
    const draft = {
      version: COMPANY_STORAGE_VERSION,
      step,
      formData,
      savedAt: Date.now(),
    };
    localStorage.setItem(COMPANY_STORAGE_KEY, JSON.stringify(draft));
  }, [step, formData, isLoaded]);

  useEffect(() => {
    if (step === 1 && inputRef.current) {
      inputRef.current.focus();
    }
  }, [step]);

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
    setFormData((prev) => ({ ...prev, organization_type: typeId }));
    advanceStep(3);
  };

  const handleStructureSelect = async (structureId) => {
    const finalData = { ...formData, operation_structure: structureId };
    setFormData(finalData);

    setIsLoading(true);
    try {
      await CompanyApi.setupCompany(finalData);

      // 🚀 CLEANUP ON SUCCESS
      localStorage.removeItem(COMPANY_STORAGE_KEY);

      toast.success("Workspace initialized!");
      setTimeout(() => {
        router.push("/stepper");
      }, 800);
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.error || "Failed to save company profile.",
      );
      setIsLoading(false);
      setStep(3);
    }
  };

  // Hydration Guard
  if (!isLoaded) return null;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative selection:bg-blue-100">
      <Toaster position="top-center" />

      <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-100 z-50">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <header className="p-6 md:p-10 flex justify-between items-center w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F4E79] flex items-center justify-center">
            <Building2 className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-800">
            Safai
          </span>
        </div>

        {step > 1 && !isLoading && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
      </header>

      <main className="flex-1 flex items-center justify-center p-6 pb-24">
        <div className="w-full max-w-2xl mx-auto">
          {step === 1 && (
            <div
              className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
            >
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                What's your organization called?
              </h1>
              <p className="text-slate-500 mb-8 font-medium">
                This will be the name of your primary workspace.
              </p>
              <form onSubmit={handleNameSubmit} className="relative">
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
                  className="w-full text-2xl md:text-3xl font-bold text-slate-900 placeholder:text-slate-300 border-b-2 border-slate-200 focus:border-blue-600 bg-transparent py-4 pr-14 outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!formData.organization_name.trim()}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {step === 2 && (
            <div
              className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
            >
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                What type of facility is{" "}
                <span className="text-blue-600">
                  {formData.organization_name}
                </span>
                ?
              </h1>
              <p className="text-slate-500 mb-8 font-medium">
                We'll tailor your dashboard metrics based on your industry.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ORGANIZATION_TYPES.map((type) => {
                  const isSelected = formData.organization_type === type.id;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group flex flex-col gap-3
                        ${isSelected ? "border-blue-600 bg-blue-50/50 shadow-sm scale-[0.98]" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"}`}
                    >
                      <span className="text-3xl block">{type.icon}</span>
                      <span
                        className={`font-bold text-sm ${isSelected ? "text-blue-900" : "text-slate-700 group-hover:text-blue-700"}`}
                      >
                        {type.label}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-blue-600 animate-in zoom-in" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div
              className={`transition-all duration-300 ${isTransitioning ? "opacity-0 -translate-x-8" : "opacity-100 translate-x-0 animate-in slide-in-from-right-8"}`}
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100 shadow-inner">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">
                    Creating Workspace
                  </h2>
                  <p className="text-slate-500 font-medium">
                    Setting up your environment infrastructure...
                  </p>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                    How is your operation structured?
                  </h1>
                  <p className="text-slate-500 mb-8 font-medium">
                    This helps us generate the correct hierarchy map for your
                    setup.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {OPERATION_STRUCTURES.map((struct) => {
                      const isSelected =
                        formData.operation_structure === struct.id;
                      return (
                        <button
                          key={struct.id}
                          onClick={() => handleStructureSelect(struct.id)}
                          className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 group flex items-center gap-4
                            ${isSelected ? "border-blue-600 bg-blue-50/50 shadow-sm scale-[0.98]" : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"}`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                            {struct.icon}
                          </div>
                          <div>
                            <span
                              className={`font-bold block mb-0.5 ${isSelected ? "text-blue-900" : "text-slate-800"}`}
                            >
                              {struct.label}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              {struct.desc}
                            </span>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 right-5 w-5 h-5 text-blue-600 animate-in zoom-in" />
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
