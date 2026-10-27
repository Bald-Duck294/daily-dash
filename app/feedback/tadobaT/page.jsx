"use client";

import { Suspense } from "react";
import TadobaTFeedback from "@/features/feedback/tadobaT/TadobaTFeedback";

export default function TadobaTPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#5ab7f5] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TadobaTFeedback />
    </Suspense>
  );
}
