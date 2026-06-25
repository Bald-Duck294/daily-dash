import React from "react";
import LimitsDashboard from "@/features/systemLimits/components/LimitsDashboard";

export const metadata = {
  title: "System Limits | Safai AI",
  description: "Manage quotas and enforce system limits across the platform.",
};

export default function SystemLimitsPage() {
  return (
    <div className="w-full">
      <LimitsDashboard />
    </div>
  );
}
