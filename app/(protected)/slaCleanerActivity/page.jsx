"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCompanyId } from "@/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";

export default function SlaCleanerActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  // Forward to unified Cleaner Activity route, preserving existing query parameters
  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (companyId && !params.has("companyId")) {
      params.set("companyId", companyId);
    }
    const query = params.toString();
    router.replace(query ? `/cleaners?${query}` : "/cleaners");
  }, [companyId, router, searchParams]);

  return <Loader label="Redirecting to Cleaner Activity..." />;
}
