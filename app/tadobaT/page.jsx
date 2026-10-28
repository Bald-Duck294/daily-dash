"use client";

import { Suspense } from "react";
import TadobaTFeedback from "@/features/feedback/tadobaT/TadobaTFeedback";

export default function TadobaTDirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#bfe5fe] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TadobaTFeedback />
    </Suspense>
  );
}
