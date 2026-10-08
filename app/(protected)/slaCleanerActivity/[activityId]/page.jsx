"use client";

import { useParams, useSearchParams } from "next/navigation";
import SlaCleanerActivityDetail from "@/features/slaCleanerActivity/components/SlaCleanerActivityDetail";
import { useCompanyId } from "@/providers/CompanyProvider";

export default function SlaCleanerActivityDetailPage() {
  const { activityId } = useParams();
  const searchParams = useSearchParams();
  const { companyId: providerCompanyId } = useCompanyId();

  const companyId = searchParams.get("companyId") || providerCompanyId;

  return (
    <SlaCleanerActivityDetail
      activityId={activityId}
      companyId={companyId}
    />
  );
}
