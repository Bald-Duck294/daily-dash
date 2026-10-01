import { useQuery } from "@tanstack/react-query";
import { SlaLogsApi } from "./slaLogs.api.js";

/**
 * Hook to fetch paginated SLA Incidents (primary list view).
 */
export const useSlaIncidents = (params = {}, companyId) => {
  return useQuery({
    queryKey: ["sla-incidents", companyId, params],
    queryFn: async () => {
      const res = await SlaLogsApi.getSlaIncidents(params, companyId);
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch SLA incidents");
      }
      return res;
    },
    enabled: companyId !== undefined && companyId !== null,
    keepPreviousData: true,
    staleTime: 15 * 1000,
  });
};

/**
 * Hook to fetch full single incident details.
 */
export const useSlaIncidentDetails = (incidentId) => {
  return useQuery({
    queryKey: ["sla-incident-details", incidentId],
    queryFn: async () => {
      const res = await SlaLogsApi.getSlaIncidentById(incidentId);
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch SLA incident details");
      }
      return res.data;
    },
    enabled: Boolean(incidentId),
    staleTime: 10 * 1000,
  });
};

/**
 * Hook to fetch paginated SLA escalation logs (audit stream view).
 */
export const useSlaLogs = (params = {}, companyId) => {
  return useQuery({
    queryKey: ["sla-logs", companyId, params],
    queryFn: async () => {
      const res = await SlaLogsApi.getSlaLogs(params, companyId);
      if (!res.success) {
        throw new Error(res.error || "Failed to fetch SLA logs");
      }
      return res;
    },
    enabled: companyId !== undefined && companyId !== null,
    keepPreviousData: true,
    staleTime: 15 * 1000,
  });
};
