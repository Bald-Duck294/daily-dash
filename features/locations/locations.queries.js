import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import LocationsApi from "@/features/locations/locations.api"; // Adjust the import path

/* =====================================================
   QUERY KEYS (Structured + Scalable)
===================================================== */
export const locationKeys = {
  all: ["locations"],
  lists: () => [...locationKeys.all, "list"],
  list: (filters) => [...locationKeys.lists(), filters],
  detail: (id) => [...locationKeys.all, "detail", id],
  zones: (options) => [...locationKeys.all, "zones", options],
  hierarchy: (parentId) => [...locationKeys.all, "hierarchy", parentId],
  byCompany: (companyId) => [...locationKeys.all, "by-company", companyId],
  types: () => [...locationKeys.all, "types"],
  search: (query, companyId) => [...locationKeys.all, "search", query, companyId],
  names: (companyId) => [...locationKeys.all, "names", companyId],
};

/* =====================================================
   QUERIES (Fetching Data)
===================================================== */

// 1. Get All Locations
// export const useGetAllLocations = (company_id, includeUnavailable = false, facilityCompanyId = null) => {
//   return useQuery({
//     queryKey: locationKeys.list({ company_id, includeUnavailable, facilityCompanyId }),
//     queryFn: async () => {
//       const response = await LocationsApi.getAllLocations(company_id, includeUnavailable, facilityCompanyId);
//       if (!response.success) throw new Error(response.error || "Failed to fetch locations");
//       return response.data;
//     },
//     enabled: !!company_id && company_id !== "null", // Only run if company_id exists
//     staleTime: 5 * 60 * 1000,
//   });
// };

export const useGetAllLocations = (
  company_id, 
  includeUnavailable = false, 
  facilityCompanyId = null,
  page = 1,       // Add page parameter
  limit = 15      // Add limit parameter
) => {
  return useQuery({
    // --- IMPORTANT: ADD PAGE AND LIMIT TO QUERY KEY ---
    queryKey: locationKeys.list({ company_id, includeUnavailable, facilityCompanyId, page, limit }),
    
    queryFn: async () => {
      // --- PASS THE NEW PARAMS TO THE API FUNCTION ---
      const response = await LocationsApi.getAllLocations(
        company_id, 
        includeUnavailable, 
        facilityCompanyId, 
        page, 
        limit
      );
      
      if (!response.success) throw new Error(response.error || "Failed to fetch locations");
      return response.data;
    },
    enabled: !!company_id && company_id !== "null", // Only run if company_id exists
    staleTime: 5 * 60 * 1000,
  });
};

export const useMapLocations = (companyId) => {
  return useQuery({
    queryKey: ["map-locations", companyId],
    queryFn: async () => {
      // Fetch the raw response from your backend
      const response = await LocationsApi.getMapLocations(companyId);
      
      // CRITICAL: Ensure we return only the array
      // If your API returns { success: true, data: [...] }, return response.data
      // If it returns just an array, return response
      return Array.isArray(response) ? response : (response?.data || []);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};

// 2. Fetch Zones with Toilets
export const useFetchZonesWithToilets = (options = {}) => {
  return useQuery({
    queryKey: locationKeys.zones(options),
    queryFn: async () => {
      // This specific API method natively throws errors in your setup
      return await LocationsApi.fetchZonesWithToilets(options);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// 3. Get Hierarchical Locations
export const useHierarchicalLocations = (parentId = null) => {
  return useQuery({
    queryKey: locationKeys.hierarchy(parentId),
    queryFn: async () => {
      return await LocationsApi.getHierarchicalLocations(parentId);
    },
    staleTime: 5 * 60 * 1000,
  });
};

// 4. Get Locations By Company (Alternative to getAllLocations)
export const useLocationsByCompany = (companyId) => {
  return useQuery({
    queryKey: locationKeys.byCompany(companyId),
    queryFn: async () => {
      return await LocationsApi.getLocationsByCompany(companyId);
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};

// 5. Get Location Types
export const useLocationTypes = () => {
  return useQuery({
    queryKey: locationKeys.types(),
    queryFn: async () => {
      return await LocationsApi.getLocationTypes();
    },
    staleTime: 24 * 60 * 60 * 1000, // Types rarely change, cache for 24hrs
  });
};

// 6. Search Locations
export const useSearchLocations = (query, companyId) => {
  return useQuery({
    queryKey: locationKeys.search(query, companyId),
    queryFn: async () => {
      const response = await LocationsApi.searchLocations(query, companyId);
      if (!response.success) throw new Error(response.error || "Failed to search locations");
      return response.data;
    },
    enabled: !!query && !!companyId, // Only search if query exists
  });
};

// 7. Get Location By ID
export const useLocationById = (id, companyId = null) => {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: async () => {
      const response = await LocationsApi.getLocationById(id, companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch location details");
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// 8. Get All Location Names
export const useAllLocationNames = (companyId) => {
  return useQuery({
    queryKey: locationKeys.names(companyId),
    queryFn: async () => {
      const response = await LocationsApi.getAllLocationNames(companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch location names");
      return response.data;
    },
    enabled: !!companyId,
    staleTime: 10 * 60 * 1000,
  });
};


/* =====================================================
   MUTATIONS (Modifying Data)
===================================================== */

// 9. Create Location
export const useCreateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, companyId, images = [] }) => {
      const response = await LocationsApi.postLocation(data, companyId, images);
      if (!response.success) throw new Error(response.error || "Failed to create location");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });
};

// 10. Update Location
export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data, companyId = null, images = [], replaceImages = false }) => {
      const response = await LocationsApi.updateLocation(id, data, companyId, images, replaceImages);
      if (!response.success) throw new Error(response.error || "Failed to update location");
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: locationKeys.zones() }); // If it moved zones
    },
  });
};

// 11. Delete Location Image
export const useDeleteLocationImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ locationId, imageUrl, companyId = null }) => {
      const response = await LocationsApi.deleteLocationImage(locationId, imageUrl, companyId);
      if (!response.success) throw new Error(response.error || "Failed to delete image");
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables.locationId) });
    },
  });
};

// 12. Delete Location
export const useDeleteLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, companyId = null, softDelete = false }) => {
      const response = await LocationsApi.deleteLocation(id, companyId, softDelete);
      if (!response.success) throw new Error(response.error || "Failed to delete location");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.all });
    },
  });
};

// 13. Toggle Location Status
export const useToggleLocationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await LocationsApi.toggleStautsLocations(id);
      if (!response.success) throw new Error(response.error || "Failed to toggle status");
      return response.data;
    },
    onSuccess: (data, variables) => {
      // variables is just the `id` in this case
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(variables) });
    },
  });
};