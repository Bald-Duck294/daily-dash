import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CompanyApi } from "@/features/companies/api/companies.api.js";

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: CompanyApi.getAllCompanies,
  });
}


export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CompanyApi.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useToggleCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      CompanyApi.updateCompany({
        id,
        companyData: { status },
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
