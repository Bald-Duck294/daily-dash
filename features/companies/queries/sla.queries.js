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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (companyId) => SlaApi.enableSla(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["sla-statuses"] });
      queryClient.invalidateQueries({ queryKey: ["sla-config", companyId] });
      queryClient.invalidateQueries({ queryKey: ["washroom-sla-config"] });
    },
  });
};

export const useDisableSla = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (companyId) => SlaApi.disableSla(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["sla-statuses"] });
      queryClient.invalidateQueries({ queryKey: ["sla-config", companyId] });
      queryClient.invalidateQueries({ queryKey: ["washroom-sla-config"] });
    },
  });
};

export const useUpdateSlaConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ companyId, configData }) => SlaApi.updateSlaConfig(companyId, configData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sla-config", variables.companyId] });
      queryClient.invalidateQueries({ queryKey: ["sla-statuses"] });
    },
  });
};

export const useWashroomSlaConfig = (locationId, enabled = false) => {
  return useQuery({
    queryKey: ["washroom-sla-config", locationId],
    queryFn: async () => {
      const data = await SlaApi.getWashroomSlaConfig(locationId);
      return data?.data || data;
    },
    enabled: enabled && !!locationId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateWashroomSlaConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ locationId, configData }) =>
      SlaApi.updateWashroomSlaConfig(locationId, configData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["washroom-sla-config", variables.locationId] });
      queryClient.invalidateQueries({ queryKey: ["location", variables.locationId] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};
