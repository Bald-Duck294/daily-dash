import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { CompanyApi } from "@/features/companies/api/companies.api.js"; // Adjust import path

// ==========================================
// QUERIES (Fetching Data)
// ==========================================

// 1. Get Paginated Companies
export const useCompanies = (page = 1, limit = 4) => {
  return useQuery({
    queryKey: ["companies", page, limit],
    queryFn: async () => {
      // Your API already throws natively here, so no need for manual success checks
      return await CompanyApi.getAllCompanies({ page, limit });
    },
    placeholderData: keepPreviousData, // Smooth page transitions
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
  });
};

// 2. Get Companies Count
export const useCompaniesCount = () => {
  return useQuery({
    queryKey: ["companies", "count"],
    queryFn: async () => {
      return await CompanyApi.getCompaniesCount();
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, 
  });
};

// 3. Get Single Company by ID
export const useCompany = (companyId) => {
  return useQuery({
    queryKey: ["company", companyId],
    queryFn: async () => {
      const response = await CompanyApi.getCompanyById(companyId);
      // Force React Query into error state if success is false
      if (!response.success) throw new Error(response.error || "Failed to fetch company");
      return response.data;
    },
    enabled: !!companyId && companyId !== "null", // Prevent running if ID is invalid
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
      // Invalidate both lists and counts to trigger a refetch
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
      // Invalidate the main list and the specific cached company
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
      // 1. Refetch the active page of data to remove the row from the table
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      
      // 2. Refetch the total count so your pagination math stays accurate
      queryClient.invalidateQueries({ queryKey: ["companies", "count"] }); 
    },
  });
}

// 7. Toggle Company Status (Specific use case leveraging update logic)
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