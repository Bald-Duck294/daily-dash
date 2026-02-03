"use client";

import axios from "axios";
import { store } from "@/store/index.js";
import { logout } from "@/features/auth/auth.slice.js";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  // baseURL: "https://saaf-ai-backend.vercel.app/api",
  baseURL: "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


// Attach token from Redux
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ✅ READ FROM LS

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isLoggingOut = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      toast.error("Session expired. Please login again.");

      store.dispatch(logout());

      // hard reset app state
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
