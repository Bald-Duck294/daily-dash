import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CompanyApi } from "@/features/companies/api/companies.api.js";

// ==========================================
// QUERIES (Fetching Data)
// ==========================================

// 1. Get Paginated Companies (with search + sort)
export const useCompanies = (page = 1, limit = 6, search = "", sortField = "", sortOrder = "") => {
  return useQuery({
    queryKey: ["companies", page, limit, search, sortField, sortOrder],
    queryFn: async () => {
      return await CompanyApi.getAllCompanies({ page, limit, search, sortField, sortOrder });
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

// 2. Get Companies Count
export const useCompaniesCount = (search = "") => {
  return useQuery({
    queryKey: ["companies", "count", search],
    queryFn: async () => {
      return await CompanyApi.getCompaniesCount({ search });
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

// 3. Get Single Company by ID
export const useCompany = (companyId) => {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const response = await CompanyApi.getCompanyById(companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch company");
      return response.data;
    },
    enabled: !!companyId && companyId !== "null",
    staleTime: 5 * 60 * 1000,
  });
};

// ==========================================
// MUTATIONS (Modifying Data)
// ==========================================

// 4. Create Company
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyData) => {
      const response = await CompanyApi.createCompany(companyData);
      if (!response.success) throw new Error(response.error || "Failed to create company");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

// 5. Update Company (General)
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, companyData }) => {
      const response = await CompanyApi.updateCompany({ id, companyData });
      if (!response.success) throw new Error(response.error || "Failed to update company");
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
    },
  });
}

// 6. Delete Company
export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await CompanyApi.deleteCompany(id);
      if (!response.success) throw new Error(response.error || "Failed to delete company");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", "count"] });
    },
  });
}

// 7. Toggle Company Status
export function useToggleCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const response = await CompanyApi.updateCompany({
        id,
        companyData: { is_active: status },
      });
      if (!response.success) throw new Error(response.error || "Failed to update status");
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", variables.id] });
    },
  });
}

// 8. Reset Company Workspace
export function useResetCompanyWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyId) => {
      return await CompanyApi.resetCompanyWorkspace(companyId);
    },
    onSuccess: (data, companyId) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", "count"] });
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });
}