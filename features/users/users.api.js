import axiosInstance from "@/shared/api/axios.instance.js";

export const UsersApi = {
  // Get all users with optional filters
  getAllUsers: async (companyId = null, roleId = null) => {
    try {
      const params = {};
      if (companyId) params.companyId = companyId;
      if (roleId) params.roleId = roleId;

      const response = await axiosInstance.get("/users", { params });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // TEMP: client-side role filtering (backend should do this later)
  getUsersByRole: async (roleId, companyId = null) => {
    try {
      const response = await UsersApi.getAllUsers(companyId);

      if (!response.success) return response;

      const filteredUsers = (response.data || []).filter(
        (user) => user.role_id === roleId
      );

      return {
        success: true,
        data: filteredUsers,
      };
    } catch (error) {
      console.error("Error fetching users by role:", error);
      return {
        success: false,
        error: error.message,
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
      const response = await axiosInstance.put(`/users/${id}`, userData);

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
};
