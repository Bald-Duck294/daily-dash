"use client";

import { Suspense, useEffect } from "react";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import TadobaLandscapeFeedback from "@/features/feedback/tadobaF/TadobaLandscapeFeedback";

const FeedbackLoading = ({ message = "Loading Tadoba Review Form..." }) => {
  return (
    <div className="min-h-screen bg-[#ede8e1]/60 flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3 text-[#284e3a]">
        <div className="relative animate-bounce">
          <Image
            src="/flo-mascot.webp"
            alt="Flo Mascot"
            width={64}
            height={80}
            className="w-16 h-auto drop-shadow-md select-none"
            priority
          />
        </div>
        <div className="flex items-center gap-2.5 font-semibold text-base sm:text-lg">
          <div className="w-5 h-5 border-2 border-[#284e3a]/20 border-t-[#284e3a] rounded-full animate-spin" />
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
};

function TadobaGuard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawCompanyId = searchParams.get("companyId");
  const compMatch = rawCompanyId ? rawCompanyId.toString().match(/\d+/) : null;
  const companyId = compMatch ? compMatch[0] : null;

  // The Tadoba feedback form is ONLY visible to company ID 95.
  // All other companies are redirected to the generic /feedback URL.
  useEffect(() => {
    if (companyId && companyId !== "95") {
      const params = new URLSearchParams(searchParams.toString());
      router.replace(`/feedback?${params.toString()}`);
    }
  }, [companyId, searchParams, router]);

  if (companyId && companyId !== "95") {
    return <FeedbackLoading message="Redirecting to feedback form..." />;
  }

  return <TadobaLandscapeFeedback />;
}

export default function TadobaFeedbackPage() {
  return (
    <Suspense fallback={<FeedbackLoading />}>
      <TadobaGuard />
    </Suspense>
  );
}

