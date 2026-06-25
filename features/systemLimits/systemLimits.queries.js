import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemLimitsApi } from "./systemLimits.api";
import toast from "react-hot-toast";

const QUERY_KEYS = {
  limits: (companyId) => ["systemLimits", companyId],
};

// Hook to fetch limits
export const useGetLimits = (companyId) => {
  return useQuery({
    queryKey: QUERY_KEYS.limits(companyId),
    queryFn: () => systemLimitsApi.getLimits(companyId),
    select: (res) => res?.data || [], // Safely extract data array
  });
};

// Hook to set/update limitsa
export const useSetLimit = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => systemLimitsApi.setLimit(data),
    onSuccess: (res, variables) => {
      toast.success("System limit updated successfully!");
      // Invalidate the cache to instantly show new data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.limits(variables.company_id || "global"),
      });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update limit");
    },
  });
};
