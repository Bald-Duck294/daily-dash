import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
  toggleShiftStatus,
} from "@/features/shifts/shift.api.js";

// 🔹 Get All Shifts
export const useGetAllShifts = (params) => {
  return useQuery({
    queryKey: ["shifts", params],
    queryFn: () => getAllShifts(params),
    keepPreviousData: true,
  });
};

// 🔹 Get Shift By ID
export const useGetShiftById = ({ id, company_id, include_unavailable }) => {
  return useQuery({
    queryKey: ["shift", id, company_id],
    queryFn: () => getShiftById({ id, company_id, include_unavailable }),
    enabled: !!id && !!company_id,
  });
};

// 🔹 Create Shift
export const useCreateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
  });
};

// 🔹 Update Shift
export const useUpdateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateShift(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({
        queryKey: ["shift", variables.id, variables.data.company_id],
      });
    },
  });
};

// 🔹 Delete Shift
export const useDeleteShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
    },
  });
};

// 🔹 Toggle Shift Status
export const useToggleShiftStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleShiftStatus,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["shifts"] });
      queryClient.invalidateQueries({ queryKey: ["shift", id] });
    },
  });
};
