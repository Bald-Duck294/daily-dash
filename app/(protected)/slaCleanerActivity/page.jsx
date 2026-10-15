"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCompanyId } from "@/providers/CompanyProvider";
import { useCompanySlaConfig } from "@/features/companies/queries/sla.queries";
import SlaCleanerActivityList from "@/features/slaCleanerActivity/components/SlaCleanerActivityList";

export default function SlaCleanerActivityPage() {
  const router = useRouter();
  const { companyId } = useCompanyId();
  const { data: slaConfig, isLoading: isSlaLoading } = useCompanySlaConfig(
    companyId,
    Boolean(companyId)
  );
  const isSlaEnabled = Boolean(slaConfig?.enabled);

  // Auto-redirect to standard Cleaner Activity if SLA is disabled for this company
  useEffect(() => {
    if (companyId && !isSlaLoading && slaConfig !== undefined && !isSlaEnabled) {
      router.replace(`/cleaners?companyId=${companyId}`);
    }
  }, [companyId, isSlaLoading, slaConfig, isSlaEnabled, router]);

  return <SlaCleanerActivityList />;
}
