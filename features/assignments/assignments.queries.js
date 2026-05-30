import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AssignmentsApi } from "@/features/assignments/assignments.api"; // Adjust the path as necessary

/* =====================================================
   QUERY KEYS (Structured + Scalable)
===================================================== */
export const assignmentKeys = {
  all: ["assignments"],
  lists: () => [...assignmentKeys.all, "list"],
  list: (companyId, roleId) => [...assignmentKeys.lists(), { companyId, roleId }],
  details: () => [...assignmentKeys.all, "detail"],
  detail: (id) => [...assignmentKeys.details(), id],
  byLocation: (locationId, companyId, roleId) => [...assignmentKeys.all, "by-location", locationId, { companyId, roleId }],
  byCleaner: (cleanerId, companyId, includeAllStatuses) => [...assignmentKeys.all, "by-cleaner", cleanerId, { companyId, includeAllStatuses }],
};

/* =====================================================
   QUERIES (Fetching Data)
===================================================== */

// 1. Get All Assignments
// export const useGetAllAssignments = (companyId, roleId) => {
//   return useQuery({
//     queryKey: assignmentKeys.list(companyId, roleId),
//     queryFn: async () => {
//       const response = await AssignmentsApi.getAllAssignments(companyId, roleId);
//       if (!response.success) throw new Error(response.error || "Failed to fetch assignments");
//      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
//     },
//     enabled: !!companyId, // Only run if companyId exists
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// };


export const useGetAllAssignments = (companyId, roleId, page = 1, limit = 15) => {
  return useQuery({
    // Add page and limit to the query key array to trigger refetches automatically
    queryKey: [...(Array.isArray(assignmentKeys.list(companyId, roleId)) ? assignmentKeys.list(companyId, roleId) : [assignmentKeys.list(companyId, roleId)]), page, limit],
    queryFn: async () => {
      const response = await AssignmentsApi.getAllAssignments(companyId, roleId, page, limit);
      if (!response.success) throw new Error(response.error || "Failed to fetch assignments");
      
      // Return the entire payload { data, pagination, message, status }
      return response.data;
    },
    enabled: !!companyId, 
    staleTime: 5 * 60 * 1000, 
  });
};

// 2. Get Assignment By ID
export const useGetAssignmentById = (id, companyId) => {
  return useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: async () => {
      const response = await AssignmentsApi.getAssignmentById(id, companyId);
      if (!response.success) throw new Error(response.error || "Failed to fetch assignment details");
      return response.data;
    },
    enabled: !!id,
  });
};

// 3. Get Assignments By Location
export const useAssignmentsByLocation = (locationId, companyId, roleId) => {
  return useQuery({
    queryKey: assignmentKeys.byLocation(locationId, companyId, roleId),
    queryFn: async () => {
      const response = await AssignmentsApi.getAssignmentsByLocation(locationId, companyId, roleId);
      if (!response.success) throw new Error(response.error || "Failed to fetch location assignments");
      return response.data;
    },
    enabled: !!locationId,
    staleTime: 5 * 60 * 1000,
  });
};

// 4. Get Assignments By Cleaner ID
export const useAssignmentsByCleanerId = (cleanerId, companyId, includeAllStatuses = false) => {
  return useQuery({
    queryKey: assignmentKeys.byCleaner(cleanerId, companyId, includeAllStatuses),
    queryFn: async () => {
      const response = await AssignmentsApi.getAssignmentsByCleanerId(cleanerId, companyId, includeAllStatuses);
      if (!response.success) throw new Error(response.error || "Failed to fetch cleaner assignments");
      return response.data;
    },
    enabled: !!cleanerId && !!companyId,
    staleTime: 5 * 60 * 1000,
  });
};

/* =====================================================
   MUTATIONS (Modifying Data)
===================================================== */

// 5. Create Single Assignment
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentData) => {
      const response = await AssignmentsApi.createAssignment(assignmentData);
      if (!response.success) throw new Error(response.error || "Failed to create assignment");
      return response.data;
    },
    onSuccess: () => {
      // Invalidate to refresh lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all.filter(k => k.includes("by-cleaner")) });
    },
  });
};

// 6. Create Assignments for Location (Multiple Cleaners)
export const useCreateAssignmentsForLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignmentData) => {
      const response = await AssignmentsApi.createAssignmentsForLocation(assignmentData);
      if (!response.success) throw new Error(response.error || "Failed to assign cleaners to location");
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      if (variables.location_id) {
        queryClient.invalidateQueries({ queryKey: assignmentKeys.byLocation(variables.location_id) });
      }
      // Since this affects multiple cleaners, wipe the cleaner caches
      queryClient.invalidateQueries({ queryKey: ["assignments", "by-cleaner"] });
    },
  });
};

// 7. Update Assignment
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await AssignmentsApi.updateAssignment(id, data);
      if (!response.success) throw new Error(response.error || "Failed to update assignment");
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(variables.id) });
      // Clear location/cleaner specific caches to be safe
      queryClient.invalidateQueries({ queryKey: ["assignments", "by-location"] });
      queryClient.invalidateQueries({ queryKey: ["assignments", "by-cleaner"] });
    },
  });
};

// 8. Delete Assignment
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await AssignmentsApi.deleteAssignment(id);
      if (!response.success) throw new Error(response.error || "Failed to delete assignment");
      return response.data;
    },
    onSuccess: () => {
      // Since we don't know the specific location/cleaner attached to this ID offhand, 
      // it's safest to invalidate all assignment caches.
      queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
    },
  });
};