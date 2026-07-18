import axiosInstance from "@/shared/api/axios.instance";

export const AuthApi = {
  // REGISTER
  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/register", userData);

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
      const response = await axiosInstance.post("/auth/login", {
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
  googleLogin: async (idToken) => {
    try {
      const response = await axiosInstance.post("/auth/google-login", {
        idToken,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || "Google Authentication failed",
      };
    }
  },

  // OTP: REQUEST
  requestOtp: async (phone) => {
    try {
      const response = await axiosInstance.post("/auth/request-otp", { phone });
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Failed to send OTP",
      };
    }
  },
verifyOtp: async (phone, code, intent = "login") => { 
    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        phone,
        code,
        intent,
      });
      return { success: true, data: response.data };
    } catch (error) {
      // 🚨 THIS WILL REVEAL THE TRUE BUG IN YOUR CONSOLE 🚨
      console.error("FULL OTP API ERROR:", error); 
      console.error("BACKEND RESPONSE:", error.response?.data);

      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Invalid OTP", // This is the fallback you are currently seeing
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

  getOnboardingStatus: async () => {
    try {
      const response = await axiosInstance.get("/auth/onboarding-status");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.log(error, "error in getOnboardingStatus");
      return {
        success: false,
        error: "Failed to fetch onboarding status",
      };
    }
  },
};
