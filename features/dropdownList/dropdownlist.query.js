import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DropdownlistApi from "@/features/dropdownList/dropdownlist.api";

export const useDropdownLocations = (company_id, type_id = null, facility_company_id = null) => {
  return useQuery({
    queryKey: ["dropdown-locations", { company_id, type_id, facility_company_id }],
    queryFn: async () => {
      const response = await DropdownlistApi.getLocationsForDropdown({ 
        company_id, 
        type_id, 
        facility_company_id 
      });
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch dropdown locations");
      }
      
      return response.data; // The array of formatted {id, name} locations
    },
    enabled: !!company_id, 
    staleTime: 5 * 60 * 1000, 
  });
};

export const useDropdownUsers = (companyId, roleId = null, search = null) => {
  return useQuery({
    queryKey: ["dropdown-users", { companyId, roleId, search }],
    queryFn: async () => {
      const response = await DropdownlistApi.getUsersForDropdown({ 
        companyId, 
        roleId, 
        search 
      });
      
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch dropdown users");
      }
      
      return response.data;
    },
    enabled: !!companyId, // Only fetch if companyId is present
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};