import axiosInstance from "@/shared/api/axios.instance.js";

export const UsersApi = {
  // Get all users with optional filters
 getAllUsers: async (companyId = null, roleId = null, page = 1, limit = 10) => {
    try {
      const params = { page, limit };
      if (companyId) params.companyId = companyId;
      if (roleId) params.roleId = roleId;

      const response = await axiosInstance.get("/users", { params });

      return {
        success: true,
        data: response.data.data,     // The array of users
        pagination: response.data.meta, // The pagination/meta object
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

getAllclientUsers: async ({ companyId = null, roleId = null, page = 1, limit = 15, search = "" }) => {
    const params = { page, limit }; 
    
    if (companyId) params.companyId = companyId;
    if (roleId && roleId !== "all") params.roleId = roleId;
    if (search) params.search = search;

    const response = await axiosInstance.get("/users/client", { params });
    
    // This now returns the full payload: { data, roleCounts, meta }
    return response.data; 
  },

  getUsersCount: async (roleId = null, companyId = null) => {
    try {
      const params = {};
      if (roleId) params.roleId = roleId;
      if (companyId) params.companyId = companyId;

      const response = await axiosInstance.get("/users/count", { params });

      return {
        success: true,
        totalCount: response.data.totalCount, // Returning the integer directly
      };
    } catch (error) {
      console.error("Error fetching user count:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  // TEMP: client-side role filtering (backend should do this later)
  // getUsersByRole: async (roleId, companyId = null) => {
  //   try {
  //     const response = await UsersApi.getAllUsers(companyId);

  //     if (!response.success) return response;

  //     const filteredUsers = (response.data || []).filter(
  //       (user) => user.role_id === roleId,
  //     );

  //     return {
  //       success: true,
  //       data: filteredUsers,
  //     };
  //   } catch (error) {
  //     console.error("Error fetching users by role:", error);
  //     return {
  //       success: false,
  //       error: error.message,
  //     };
  //   }
  // },
  getUsersByRole: async (roleId, companyId = null, page = 1, limit = 10) => {
  try {
    const params = { page, limit, roleId };
    if (companyId) params.companyId = companyId;

    const response = await axiosInstance.get("/users", { params });

    return {
      success: true,
      data: response.data.data,      // Matches getAllUsers structure
      pagination: response.data.meta, // Matches getAllUsers structure
    };
  } catch (error) {
    console.error("Error fetching users by role:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
},

  getUserById: async (id) => {
    try {
      const response = await axiosInstance.get(`/users/${id}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  createUser: async (data, companyId) => {
    try {
      const payload = {
        ...data,
        company_id: companyId,
      };

      const response = await axiosInstance.post("/users", payload);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axiosInstance.post(`/users/${id}`, userData);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  changePassword: async (payload) => {
    try {
      /**
       * payload = {
       *   currentPassword: string,
       *   newPassword: string
       * }
       */

      const response = await axiosInstance.patch(
        "/users/change-password",
        payload,
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error changing password:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
};
