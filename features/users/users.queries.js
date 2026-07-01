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
  {
    companyId = null,
    roleId = null,
    page = 1,
    limit = 15,
    search = "",
  } = {},
  options = {},
) => {
  return useQuery({
    queryKey: ["users", { companyId, roleId, page, limit, search }],
    
    queryFn: async () => {
      const res = await UsersApi.getAllclientUsers({
        companyId,
        roleId,
        page,
        limit,
        search,
      });

      return res;
    },
    
    ...options,
  });
};

/* =====================================================
   GET USERS BY ROLE (backend filtered preferred)
===================================================== */

// export const useGetUsersByRole = (roleId, companyId = null, options = {}) => {
//   return useQuery({
//     queryKey: ["users", { roleId, companyId }],
//     queryFn: async () => {
//       const res = await UsersApi.getAllUsers(companyId, roleId);
//       if (!res.success) throw new Error(res.error);
//       return res.data;
//     },
//     enabled: !!roleId,
//     ...options,
//   });
// };

export const useGetUsersByRole = (roleId, companyId = null, page = 1, limit = 10, options = {}) => {
  return useQuery({
    queryKey: ["users", { roleId, companyId, page, limit }],
    queryFn: async () => {
      // ✅ Now using the correct method name defined in UsersApi
      const res = await UsersApi.getUsersByRole(roleId, companyId, page, limit);
      if (!res.success) throw new Error(res.error);
      
      // ✅ Now returns the consistent structure { data, pagination }
      return res; 
    },
    enabled: !!roleId,
    ...options,
  });
};

export const useUsersCount = (roleId = null, companyId = null, options = {}) => {
  return useQuery({
    // Caching based on parameters ensures you get the right count for the right role/company
    queryKey: ["users", "count", { roleId, companyId }],
    queryFn: async () => {
      const res = await UsersApi.getUsersCount(roleId, companyId);
      if (!res.success) throw new Error(res.error);
      return res; // Returns { success: true, totalCount: X }
    },
    // Optional: Keep the count fresh for 1 minute
    staleTime: 60 * 1000, 
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

export const useChangeProfile = () => {
  return useMutation({
    mutationFn: async (payload) => {
      const res = await UsersApi.updateProfile(payload);
      if (!res.success) throw new Error(res.error || "Failed to update profile");
      return res.data; // This will return the updated user object from the backend
    },
  });
};
