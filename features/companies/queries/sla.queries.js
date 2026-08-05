import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SlaApi } from "@/features/companies/api/sla.api.js";

// ==========================================
// QUERIES
// ==========================================

export const useSlaStatuses = () => {
  return useQuery({
    queryKey: ["sla-statuses"],
    queryFn: async () => {
      const data = await SlaApi.getSlaStatuses();
      // Ensure we return the array directly if it's wrapped in a 'data' property
      return data?.data || data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useCompanySlaConfig = (companyId, enabled = false) => {
  return useQuery({
    queryKey: ["sla-config", companyId],
    queryFn: async () => {
      const data = await SlaApi.getCompanySlaConfig(companyId);
      return data?.data || data;
    },
    enabled: enabled && !!companyId, // Only fetch when modal is opened and companyId exists
    staleTime: 5 * 60 * 1000,
  });
};

// ==========================================
// MUTATIONS
// ==========================================

export const useEnableSla = () => {
  return useMutation({
    mutationFn: (companyId) => SlaApi.enableSla(companyId),
  });
};

export const useDisableSla = () => {
  return useMutation({
    mutationFn: (companyId) => SlaApi.disableSla(companyId),
  });
};

export const useUpdateSlaConfig = () => {
  return useMutation({
    mutationFn: ({ companyId, configData }) => SlaApi.updateSlaConfig(companyId, configData),
  });
};
