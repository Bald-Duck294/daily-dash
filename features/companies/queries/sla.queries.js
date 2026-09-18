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
      queryClient.invalidateQueries({ queryKey: ["sla-config", companyId] });
      queryClient.invalidateQueries({ queryKey: ["sla-statuses"] });
      queryClient.invalidateQueries({ queryKey: ["washroom-sla-config"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};

export const useDisableSla = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (companyId) => SlaApi.disableSla(companyId),
    onSuccess: (_, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["sla-config", companyId] });
      queryClient.invalidateQueries({ queryKey: ["sla-statuses"] });
      queryClient.invalidateQueries({ queryKey: ["washroom-sla-config"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
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
      queryClient.invalidateQueries({ queryKey: ["washroom-sla-config"] });
      queryClient.invalidateQueries({ queryKey: ["dropdown-locations"] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
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
    onSuccess: (response, variables) => {
      const respData = response?.data || response;
      const newConfig = respData?.configuration || variables.configData;

      // 1. Instantly update all dropdown-locations query caches
      queryClient.setQueriesData({ queryKey: ["dropdown-locations"] }, (oldData) => {
        if (!Array.isArray(oldData)) return oldData;
        return oldData.map((loc) => {
          if (String(loc.id) === String(variables.locationId)) {
            return {
              ...loc,
              sla_config: {
                ...(loc.sla_config || {}),
                enabled: variables.configData.enabled,
                is_active: variables.configData.enabled,
                threshold_score: variables.configData.threshold_score,
                notify_cleaner: variables.configData.notify_cleaner,
                notify_supervisor: variables.configData.notify_supervisor,
                max_retry_attempts: variables.configData.max_retry_attempts,
                max_score_updates_per_activity: variables.configData.max_score_updates_per_activity,
                ...newConfig,
              },
            };
          }
          return loc;
        });
      });

      // 2. Refetch in background to guarantee complete sync
      queryClient.invalidateQueries({ queryKey: ["dropdown-locations"] });
      queryClient.invalidateQueries({ queryKey: ["washroom-sla-config", variables.locationId] });
      queryClient.invalidateQueries({ queryKey: ["location", variables.locationId] });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });
};
