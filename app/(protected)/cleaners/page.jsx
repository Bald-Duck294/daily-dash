"use client";

import { useCompanyId } from "@/providers/CompanyProvider";
import { useCompanySlaConfig } from "@/features/companies/queries/sla.queries";
import { useRequirePermission } from "@/shared/hooks/useRequirePermission";
import { MODULES } from "@/shared/constants/permissions";
import SlaCleanerActivityList from "@/features/slaCleanerActivity/components/SlaCleanerActivityList";
import StandardCleanerActivityList from "./components/StandardCleanerActivityList";
import Loader from "@/components/ui/Loader";

export default function CleanerActivityPage() {
  useRequirePermission(MODULES.CLEANER_REVIEWS);

  const { companyId } = useCompanyId();

  // Query organization master SLA configuration
  const { data: slaConfig, isLoading: isSlaLoading } = useCompanySlaConfig(
    companyId,
    Boolean(companyId)
  );

  const isSlaEnabled = Boolean(slaConfig?.enabled);

  // While determining SLA status, display loading state to prevent flash of wrong activity UI
  if (isSlaLoading) {
    return <Loader label="Loading Cleaner Activity..." />;
  }

  // If organization has SLA enabled, show the SLA Cleaner Activity view
  if (isSlaEnabled) {
    return <SlaCleanerActivityList />;
  }

  // Otherwise, render standard cleaner activity view
  return <StandardCleanerActivityList />;
}