import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ConfigurationsApi } from "@/features/configurations/configurations.api";

export const configKeys = {
  all: ["configurations"],
  modules: () => [...configKeys.all, "modules"],
  byName: (name, companyId) => [...configKeys.all, "name", name, { companyId }],
  schema: (companyId) => [...configKeys.all, "schema", { companyId }],
  templates: (name) => [...configKeys.all, "templates", name],
  detail: (id) => [...configKeys.all, "detail", id],
};
// console.log(configKeys, "config keys0");
export const useDynamicModules = () => {
  return useQuery({
    queryKey: configKeys.modules(),
    queryFn: async () => {
      const response = await ConfigurationsApi.getDynamicModules();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useConfigByName = (name, companyId) => {
  console.log(name, companyId, "fetching config by name and company");
  return useQuery({
    queryKey: configKeys.byName(name, companyId),
    queryFn: async () => {
      const response = await ConfigurationsApi.getConfigByName(name, companyId);
      if (!response.success) throw new Error(response.error);
      return response; // returns { data, isNew }
    },
    enabled: !!name,
  });
};

export const useUpdateConfigByName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, payload, companyId }) => {
      const response = await ConfigurationsApi.updateConfigByName(
        name,
        payload,
        companyId,
      );
      if (!response.success) throw new Error(response.error);
      return response;
    },
    onSuccess: (data, variables) => {
      // ✅ FIXED: Using fuzzy matching to invalidate all variations (with or without companyId)
      queryClient.invalidateQueries({
        queryKey: [...configKeys.all, "name", variables.name],
      });
      queryClient.invalidateQueries({
        queryKey: [...configKeys.all, "templates", variables.name],
      });
      queryClient.invalidateQueries({
        queryKey: [...configKeys.all, "schema"],
      });
    },
  });
};

export const useTemplatesByName = (name) => {
  return useQuery({
    queryKey: configKeys.templates(name),
    queryFn: async () => {
      const response = await ConfigurationsApi.getTemplatesByName(name);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!name,
  });
};

export const useConfigById = (id) => {
  return useQuery({
    queryKey: configKeys.detail(id),
    queryFn: async () => {
      const response = await ConfigurationsApi.getConfigById(id);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useLocationSchema = (companyId) => {
  return useQuery({
    queryKey: configKeys.schema(companyId),
    queryFn: async () => {
      const response = await ConfigurationsApi.getLocationSchema(companyId);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });
};

export const useDeleteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await ConfigurationsApi.deleteConfigById(id);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: configKeys.all });
    },
  });
};
