"use client";

import { Suspense } from "react";
import TadobaLandscapeFeedback from "@/features/feedback/tadobaF/TadobaLandscapeFeedback";

export default function TadobaFDirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#bfe5fe] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <TadobaLandscapeFeedback />
    </Suspense>
  );
}
