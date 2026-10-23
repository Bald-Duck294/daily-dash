"use client";

import { Suspense, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

function GenericFeedbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawCompanyId = searchParams.get("companyId");
  const compMatch = rawCompanyId ? rawCompanyId.toString().match(/\d+/) : null;
  const companyId = compMatch ? compMatch[0] : null;

  const rawLocationId = searchParams.get("locationId");
  const locMatch = rawLocationId ? rawLocationId.toString().match(/\d+/) : null;
  const locationId = locMatch ? locMatch[0] : null;

  // If this belongs to Tadoba (Company ID 95), redirect to Tadoba custom form
  useEffect(() => {
    if (companyId === "95") {
      const params = new URLSearchParams(searchParams.toString());
      router.replace(`/feedback/tadoba?${params.toString()}`);
    }
  }, [companyId, searchParams, router]);

  if (companyId === "95") {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3 text-[#284e3a]">
          <div className="w-6 h-6 border-2 border-[#284e3a]/20 border-t-[#284e3a] rounded-full animate-spin" />
          <span className="text-sm font-semibold">
            Redirecting to Tadoba Review...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-slate-100 flex flex-col justify-between items-center p-4 sm:p-8 font-sans">
      {/* Top Navbar */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-3 px-2">
        <div className="flex items-center gap-2 select-none">
          <div className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            Saaf<span className="text-[#00A3E0]">AI</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100/70 text-sky-800 border border-sky-200/60">
          <Sparkles className="w-3.5 h-3.5 text-[#00A3E0]" />
          <span>Smart Facility</span>
        </div>
      </header>

      {/* Main Card */}
      <main className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-8 my-auto text-center space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-gradient-to-tr from-sky-500 to-[#00A3E0] flex items-center justify-center shadow-lg shadow-sky-500/25">
          <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Facility Feedback
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Thank you for helping us maintain clean and hygienic facilities.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Digital Feedback Portal Under Activation</span>
          </div>
          <p className="text-xs text-slate-500 leading-normal pl-6">
            The generic feedback form for this facility will be activated
            shortly. Your presence and intent to share your experience are
            highly appreciated.
          </p>
          {locationId && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Facility ID:</span>
              <span className="font-semibold text-slate-700">
                #{locationId}
              </span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-[#00A3E0]" />
            <span>Verified Smart Sanitation Checkpoint</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md mx-auto text-center py-4 text-xs text-slate-400">
        © {new Date().getFullYear()} SaafAI • Smart Public Hygiene Monitoring
      </footer>
    </div>
  );
}

export default function GenericFeedbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="flex items-center gap-2.5 text-slate-600 text-sm font-semibold">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-[#00A3E0] rounded-full animate-spin" />
            <span>Loading Feedback Portal...</span>
          </div>
        </div>
      }
    >
      <GenericFeedbackContent />
    </Suspense>
  );
}
