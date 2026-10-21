"use client";

import { Suspense } from "react";
import Image from "next/image";
import UserFeedbackForm from "@/features/feedback/components/UserFeedbackForm";

const FeedbackLoading = () => {
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
          <span>Loading Tadoba Review Form...</span>
        </div>
      </div>
    </div>
  );
};

export default function TadobaFeedbackPage() {
  return (
    <Suspense fallback={<FeedbackLoading />}>
      <UserFeedbackForm />
    </Suspense>
  );
}
