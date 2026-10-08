import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SlaCleanerActivityApi } from "./slaCleanerActivity.api";

// ==========================================
// QUERIES
// ==========================================

/**
 * 1. Get Paginated List of SLA Cleaner Activities
 */
export const useSlaCleanerActivities = (params = {}, companyId) => {
  return useQuery({
    queryKey: ["slaCleanerActivities", companyId, params],
    queryFn: async () => {
      const response = await SlaCleanerActivityApi.getSlaActivities(params, companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch SLA cleaner activities");
      return response;
    },
    enabled: !!companyId && companyId !== "null" && companyId !== undefined,
    staleTime: 30 * 1000,
    keepPreviousData: true,
  });
};

/**
 * 2. Get Single SLA Cleaner Activity by Activity ID
 */
export const useSlaCleanerActivityById = (activityId) => {
  return useQuery({
    queryKey: ["slaCleanerActivity", activityId],
    queryFn: async () => {
      const response = await SlaCleanerActivityApi.getSlaActivityById(activityId);
      if (!response.success) throw new Error(response.error || "Failed to fetch SLA activity detail");
      return response.data;
    },
    enabled: !!activityId,
    staleTime: 30 * 1000,
  });
};

// ==========================================
// MUTATIONS
// ==========================================

/**
 * 3. Update Management Score for an Attempt
 */
export function useUpdateSlaActivityScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, formData }) => {
      const response = await SlaCleanerActivityApi.updateManagementScore(reviewId, formData);
      if (!response.success) throw new Error(response.error || "Failed to update score");
      return response.data;
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["slaCleanerActivities"] });
      queryClient.invalidateQueries({ queryKey: ["slaCleanerActivity"] });
      queryClient.invalidateQueries({ queryKey: ["cleaner-reviews"] });
    },
  });
}
