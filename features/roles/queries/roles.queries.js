// src/features/roles/roles.queries.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RolesApi from "@/features/roles/api/roles.api.js";

/* ===========================
   QUERY KEYS
=========================== */
export const rolesKeys = {
  all: ["roles"],
  lists: () => [...rolesKeys.all, "list"],
  detail: (id) => [...rolesKeys.all, "detail", id],
  permissions: () => [...rolesKeys.all, "permissions"],
  users: (id) => [...rolesKeys.all, "users", id],
};

/* ===========================
   GET ALL ROLES
=========================== */
export const useGetAllRoles = (options = {}) => {
  return useQuery({
    queryKey: rolesKeys.lists(),
    queryFn: async () => {
      const res = await RolesApi.getAllRoles();
      if (!res.success) throw new Error(res.error);
      return res.data.roles;
    },
    ...options,
  });
};

/* ===========================
   GET ROLE BY ID
=========================== */
export const useGetRoleById = (id, options = {}) => {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: async () => {
      const res = await RolesApi.getById(id);
      if (!res.success) throw new Error(res.error);
      return res.data.role;
    },
    enabled: !!id,
    ...options,
  });
};

/* ===========================
   GET AVAILABLE PERMISSIONS
=========================== */
export const useGetAvailablePermissions = (options = {}) => {
  return useQuery({
    queryKey: rolesKeys.permissions(),
    queryFn: async () => {
      const res = await RolesApi.getAvailablePermissions();
      if (!res.success) throw new Error(res.error);
      return {
        permissions: res.data.permissions,
        modules: res.data.modules,
      };
    },
    ...options,
  });
};

/* ===========================
   GET USERS BY ROLE
=========================== */
export const useGetUsersByRole = (id, options = {}) => {
  return useQuery({
    queryKey: rolesKeys.users(id),
    queryFn: async () => {
      const res = await RolesApi.getUsersByRole(id);
      if (!res.success) throw new Error(res.error);
      return res.data.users;
    },
    enabled: !!id,
    ...options,
  });
};

/* ===========================
   CREATE ROLE
=========================== */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await RolesApi.create(payload);
      if (!res.success) throw new Error(res.error);
      return res.data.role;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};

/* ===========================
   UPDATE ROLE
=========================== */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const res = await RolesApi.update(id, payload);
      if (!res.success) throw new Error(res.error);
      return res.data.role;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: rolesKeys.detail(variables.id),
      });
    },
  });
};

/* ===========================
   DELETE ROLE
=========================== */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await RolesApi.delete(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
    },
  });
};
