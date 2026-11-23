import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import FeatureManagementApi from "./featureManagement.api";
import toast from "react-hot-toast";

export const FEATURE_MANAGEMENT_KEYS = {
  all: ["featureManagement"],
  companies: () => [...FEATURE_MANAGEMENT_KEYS.all, "companies"],
  company: (id) => [...FEATURE_MANAGEMENT_KEYS.all, "company", String(id)],
};

/**
 * Super Admin: Fetch all companies and their enabled features
 */
export const useCompaniesFeatures = (enabled = true) => {
  return useQuery({
    queryKey: FEATURE_MANAGEMENT_KEYS.companies(),
    queryFn: () => FeatureManagementApi.getAllCompaniesFeatures(),
    enabled: Boolean(enabled),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
};

/**
 * Fetch feature configuration for a single company
 */
export const useCompanyFeatures = (companyId, enabled = true) => {
  return useQuery({
    queryKey: FEATURE_MANAGEMENT_KEYS.company(companyId),
    queryFn: () => FeatureManagementApi.getCompanyFeatures(companyId),
    enabled: Boolean(enabled && companyId),
    staleTime: 1000 * 60 * 5, // 5 mins
  });
};

/**
 * Super Admin: Mutation to toggle a feature
 */
export const useToggleCompanyFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ companyId, featureKey, isActive, threshold }) =>
      FeatureManagementApi.toggleCompanyFeature(companyId, featureKey, isActive, threshold),
    onSuccess: (data, variables) => {
      // Invalidate list & specific company queries
      queryClient.invalidateQueries({ queryKey: FEATURE_MANAGEMENT_KEYS.companies() });
      queryClient.invalidateQueries({
        queryKey: FEATURE_MANAGEMENT_KEYS.company(variables.companyId),
      });

      // Also invalidate SLA company status query if sla_rules was toggled
      if (variables.featureKey === "sla_rules") {
        queryClient.invalidateQueries({ queryKey: ["slaPenalty", "companyStatus"] });
      }

      const label =
        variables.featureKey === "cleaner_assignment"
          ? "Cleaner Assignment"
          : variables.featureKey === "cleaning_request"
          ? "Cleaning Request"
          : variables.featureKey === "service_req_threshold" || variables.featureKey === "service_req_thredshold"
          ? "Auto-Dispatch Threshold"
          : "SLA Rules";

      toast.success(
        variables.threshold !== undefined && variables.isActive
          ? `${label} set to threshold ${variables.threshold} and enabled!`
          : `${label} successfully ${variables.isActive ? "enabled" : "disabled"}`
      );
    },
    onError: (error) => {
      const msg = error?.response?.data?.message || error.message || "Failed to update feature";
      toast.error(msg);
    },
  });
};
