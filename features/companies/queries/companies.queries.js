// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { CompanyApi } from "@/features/companies/api/companies.api.js";
// import { keepPreviousData } from "@tanstack/react-query";
// // export function useCompanies() {
// //   return useQuery({
// //     queryKey: ["companies"],
// //     queryFn: CompanyApi.getAllCompanies,
// //   });
// // }

// export const useCompanies = (page = 1, limit = 10) => {
//   return useQuery({
//     queryKey: ["companies", page, limit],
//     queryFn: async () => {
//       const response = await CompanyApi.getAllCompanies();
//       return response.data;
//     },
//     placeholderData: keepPreviousData, // Keep previous data while fetching new page
//     staleTime: 5000, // Consider data fresh for 5 seconds
//   });
// };

// export function useDeleteCompany() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: CompanyApi.deleteCompany,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["companies"] });
//     },
//   });
// }

// export function useToggleCompanyStatus() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, status }) =>
//       CompanyApi.updateCompany({
//         id,
//         companyData: { status },
//       }),

//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["companies"] });
//     },
//   });
// }

// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { keepPreviousData } from "@tanstack/react-query";
// import { CompanyApi } from "@/features/companies/api/companies.api.js";

// // Companies Query with Server-Side Pagination
// export const useCompanies = (page = 1, limit = 10) => {
//   return useQuery({
//     queryKey: ["companies", page, limit],
//     queryFn: async () => {
//       const response = await CompanyApi.getAllCompanies({ page, limit });
//       return response.data;
//     },
//     placeholderData: keepPreviousData, // Keep previous data while fetching new page [web:31][web:37]
//     staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache for 10 minutes
//     retry: 2,
//     retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
//   });
// };

// // Delete Company Mutation
// export function useDeleteCompany() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: CompanyApi.deleteCompany,
//     onSuccess: (_, variables) => {
//       // Optimistically update all companies queries
//       queryClient.invalidateQueries({ queryKey: ["companies"] });
//       // Remove specific company from cache if needed
//       queryClient.removeQueries({
//         queryKey: ["companies", { exact: true }],
//       });
//     },
//     onError: (error) => {
//       console.error("Failed to delete company:", error);
//     },
//   });
// }

// // Toggle Company Status Mutation
// export function useToggleCompanyStatus() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ id, status }) =>
//       CompanyApi.updateCompany({
//         id,
//         companyData: { is_active: status }, // Assuming your field is 'is_active'
//       }),

//     onSuccess: () => {
//       // Invalidate all companies queries to refresh data
//       queryClient.invalidateQueries({ queryKey: ["companies"] });
//     },
//     onError: (error) => {
//       console.error("Failed to toggle company status:", error);
//     },
//   });
// }

// // Bonus: useCompanies with Filters (for future search implementation)
// export const useCompaniesWithFilters = ({
//   page = 1,
//   limit = 10,
//   search = "",
//   status = "",
// } = {}) => {
//   return useQuery({
//     queryKey: ["companies", page, limit, search, status],
//     queryFn: async () => {
//       const params = { page, limit };
//       if (search) params.search = search;
//       if (status) params.status = status;

//       const response = await CompanyApi.getAllCompanies(params);
//       return response.data;
//     },
//     placeholderData: keepPreviousData,
//     staleTime: 5 * 60 * 1000,
//     enabled: !!page && !!limit,
//   });
// };

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import { CompanyApi } from "@/features/companies/api/companies.api.js";

// Companies Query with Server-Side Pagination - FIXED
export const useCompanies = (page = 1, limit = 4) => {
  return useQuery({
    queryKey: ["companies", page, limit],
    queryFn: async () => {
      // Pass page/limit as OBJECT to CompanyApi.getAllCompanies
      const response = await CompanyApi.getAllCompanies({ page, limit: 4 });
      return response;
    },
    placeholderData: keepPreviousData, // Smooth page transitions
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes cache
    retry: 2,
  });
};

export const useCompaniesCount = () => {
  return useQuery({
    queryKey: ["companies", "count"],
    queryFn: () => CompanyApi.getCompaniesCount(),
    staleTime: 30 * 1000, // 30 seconds - counts don't change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export function useDeleteCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: CompanyApi.deleteCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

// Toggle Company Status Mutation
export function useToggleCompanyStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      CompanyApi.updateCompany({
        id,
        companyData: { is_active: status }, // Fixed field name
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
