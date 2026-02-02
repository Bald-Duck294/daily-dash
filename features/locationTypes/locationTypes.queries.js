import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import locationTypesApi from "@/features/locationTypes/locationTypes.api";

/* =======================
   Query Keys
======================= */
const locationTypesKeys = {
  all: ["location-types"],
  list: (companyId) => [...locationTypesKeys.all, companyId],
  detail: (id) => [...locationTypesKeys.all, "detail", id],
};

/* =======================
   Queries
======================= */

// GET ALL
export const useLocationTypes = (companyId) =>
  useQuery({
    queryKey: locationTypesKeys.list(companyId),
    queryFn: () => locationTypesApi.getAll(companyId),
    enabled: !!companyId,
  });

/* =======================
   Mutations
======================= */

// CREATE
export const useCreateLocationType = (companyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) =>
      locationTypesApi.create(data, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: locationTypesKeys.list(companyId),
      });
    },
  });
};

// UPDATE
export const useUpdateLocationType = (companyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      locationTypesApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: locationTypesKeys.list(companyId),
      });
      queryClient.invalidateQueries({
        queryKey: locationTypesKeys.detail(id),
      });
    },
  });
};

// DELETE
export const useDeleteLocationType = (companyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      locationTypesApi.delete(id, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: locationTypesKeys.list(companyId),
      });
    },
  });
};

// UPDATE PARENT
export const useUpdateLocationTypeParent = (companyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) =>
      locationTypesApi.updateParent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: locationTypesKeys.list(companyId),
      });
    },
  });
};

// MARK AS TOILET
export const useMarkLocationTypeAsToilet = (companyId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) =>
      locationTypesApi.markAsToilet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: locationTypesKeys.list(companyId),
      });
    },
  });
};
