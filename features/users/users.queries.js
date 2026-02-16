// src/features/users/users.queries.js

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UsersApi } from "./users.api";

/* =====================================================
   QUERY KEYS (Structured + Scalable)
===================================================== */

export const usersKeys = {
  all: ["users"],
  lists: () => [...usersKeys.all, "list"],
  list: (filters) => [...usersKeys.lists(), filters],
  detail: (id) => [...usersKeys.all, "detail", id],
};

/* =====================================================
   GET ALL USERS (with optional filters)
===================================================== */

export const useGetAllUsers = (
  { companyId = null, roleId = null } = {},
  options = {},
) => {
  return useQuery({
    queryKey: usersKeys.list({ companyId, roleId }),
    queryFn: async () => {
      const res = await UsersApi.getAllUsers(companyId, roleId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    ...options,
  });
};

/* =====================================================
   GET USERS BY ROLE (backend filtered preferred)
===================================================== */

export const useGetUsersByRole = (roleId, companyId = null, options = {}) => {
  return useQuery({
    queryKey: ["users", { roleId, companyId }],
    queryFn: async () => {
      const res = await UsersApi.getAllUsers(companyId, roleId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!roleId,
    ...options,
  });
};

/* =====================================================
   GET USER BY ID
===================================================== */

export const useGetUserById = (id, options = {}) => {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: async () => {
      const res = await UsersApi.getUserById(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    enabled: !!id,
    ...options,
  });
};

/* =====================================================
   CREATE USER
===================================================== */

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, companyId }) => {
      const res = await UsersApi.createUser(data, companyId);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

/* =====================================================
   UPDATE USER
===================================================== */

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await UsersApi.updateUser(id, data);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: usersKeys.detail(variables.id),
      });
    },
  });
};

/* =====================================================
   DELETE USER
===================================================== */

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await UsersApi.deleteUser(id);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
};

/* =====================================================
   CHANGE PASSWORD
===================================================== */

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await UsersApi.changePassword(payload);
      if (!res.success) throw new Error(res.error);
      return res.data;
    },
  });
};
