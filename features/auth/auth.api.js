import axiosInstance from "@/shared/api/axios.instance";

export const AuthApi = {
  // REGISTER
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/register", userData);

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

  // LOGIN
  login: async (phone, password) => {
    try {
      const response = await axiosInstance.post("/login", {
        phone,
        password,
      });

      const data = response.data;

      if (response.status !== 200 || data.status !== "success") {
        return {
          success: false,
          error: data?.message || "Login failed",
        };
      }

      return {
        success: true,
        data, // contains { status, message, user }
      };
    } catch (err) {
      return {
        success: false,
        error:
          err.response?.data?.message ||
          (err.response?.status === 401
            ? "Invalid phone or password"
            : "Something went wrong"),
      };
    }
  },

  // REFRESH USER (JWT COOKIE BASED)
  refreshUser: async () => {
    try {
      const response = await axiosInstance.get("/auth/me");

      return {
        success: true,
        data: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: "Session expired",
      };
    }
  },

  // LOGOUT (optional but recommended)
  logout: async () => {
    try {
      await axiosInstance.post("/logout");
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },
};
