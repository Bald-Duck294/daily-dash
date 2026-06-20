import { useQuery } from "@tanstack/react-query";
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
      
      return response.data; 
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
    enabled: !!companyId, 
    staleTime: 5 * 60 * 1000, 
  });
};

export const useCompaniesDropdown = () => {
  return useQuery({
    queryKey: ["companies-dropdown"],
    queryFn: async () => {
      // ✅ FIXED: Changed PhotoApi to DropdownlistApi
      const data = await DropdownlistApi.getCompaniesDropdown();
      return data;
    },
    staleTime: 10 * 60 * 1000, 
  });
};

export const useCleanersDropdown = (companyId) => {
  return useQuery({
    queryKey: ["cleanersDropdown", companyId],
    queryFn: async () => {
      const res = await DropdownlistApi.getCleanersForDropdown(companyId);
      if (!res.success) throw new Error("Failed to fetch cleaners dropdown");
      
      // Return just the array of cleaner objects
      return res.data; 
    },
    // Don't run the query until we actually have a company ID
    enabled: companyId !== undefined && companyId !== null, 
  });
};
export const useAssignedCleanersDropdown = (companyId, search = "") => {
  return useQuery({
    queryKey: ["assignedCleanersDropdown", companyId, search],
    queryFn: async () => {
      const res = await DropdownlistApi.getAssignedCleanersForDropdown(companyId, search);
      
      if (!res.success) {
        throw new Error("Failed to fetch assigned cleaners dropdown");
      }
      
      // Return just the array of formatted cleaner objects
      return res.data; 
    },
    // Prevent the query from firing until a companyId is actually available
    enabled: !!companyId, 
    staleTime: 5 * 60 * 1000, // Cache the data for 5 minutes
  });
};
export const useDropdownZones = (companyId) => {
  return useQuery({
    queryKey: ["zonesDropdown", companyId],
    queryFn: async () => {
      // ✅ Use the correct exported constant name
      const response = await DropdownlistApi.getZonesForDropdown({ 
        company_id: companyId 
      });
      return response;
    },
    enabled: !!companyId, 
  });

};

export const useDropdownRoles = () => {
  return useQuery({
    queryKey: ["rolesDropdown"],
    queryFn: async () => {
      const response = await DropdownlistApi.getRolesForDropdown();
      return response;
    },
  });
};