import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import shiftAssignApi from "./shiftAssign.api.js";

// 🔹 Get ALL shift assignments (company level)
export const useGetAllShiftAssignments = (companyId) => {
  return useQuery({
    queryKey: ["shift-assignments", "all", companyId],
    queryFn: () => shiftAssignApi.getAll(companyId),
    enabled: !!companyId,
  });
};

// 🔹 Get assignments by specific shift
export const useGetShiftAssignmentsByShift = (shiftId, companyId) => {
  return useQuery({
    queryKey: ["shift-assignments", shiftId, companyId],
    queryFn: () => shiftAssignApi.getByShift(shiftId, companyId),
    enabled: !!shiftId && !!companyId,
  });
};

// 🔹 Get assignable users
export const useGetShiftAssignableUsers = (companyId) => {
  return useQuery({
    queryKey: ["shift-assignable-users", companyId],
    queryFn: () => shiftAssignApi.getAssignableUsers(companyId),
    enabled: !!companyId,
  });
};

// 🔹 Create shift assignment
export const useCreateShiftAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => shiftAssignApi.create(payload),

    onSuccess: (_, variables) => {
      // 🔥 Invalidate ALL lists properly
      queryClient.invalidateQueries({
        queryKey: ["shift-assignments"],
      });

      // If specific shift exists
      if (variables?.shiftId) {
        queryClient.invalidateQueries({
          queryKey: ["shift-assignments", variables.shiftId],
        });
      }
    },
  });
};

// 🔹 Update shift assignment
export const useUpdateShiftAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => shiftAssignApi.update(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-assignments"],
      });
    },
  });
};

// 🔹 update assignment status
export const useToggleShiftAssignmentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => shiftAssignApi.toggleStatus(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-assignments"],
      });
    },
  });
};

// 🔹 Delete shift assignment
export const useDeleteShiftAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => shiftAssignApi.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shift-assignments"],
      });
    },
  });
};
