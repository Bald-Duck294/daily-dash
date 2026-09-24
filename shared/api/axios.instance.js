"use client";

import axios from "axios";
import { store } from "@/store/index.js";
import { logout } from "@/features/auth/auth.slice.js";
import { resetNotifications } from "@/features/notification/notification.slice.js";
import { deleteFCMToken } from "@/shared/firebase/fcm.js";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
  // baseURL: "https://saaf-ai-backend.vercel.app/api",
  baseURL: "http://localhost:8001/api",
  // baseURL: "https://dash-backend-five.vercel.app/api",
  // baseURL: "https://daily-dash-backend-development.vercel.app/api",
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
  async (error) => {
    // ✅ FIX: Ignore 401 errors from the login route.
    // Let AuthApi handle them so it can show "Invalid password".
    if (error.config?.url?.includes("/login")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !isLoggingOut) {
      isLoggingOut = true;

      toast.error("Session expired. Please login again.");

      try {
        const state = store.getState();
        const user = state?.auth?.user;
        const fcmToken = state?.notifications?.fcmToken;

        let userId = user?.id;
        if (!userId && typeof window !== "undefined") {
          try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const parsed = JSON.parse(storedUser);
              userId = parsed?.id;
            }
          } catch (e) {
            console.error("Failed to parse stored user during auto logout:", e);
          }
        }

        // Delete client FCM token from Firebase
        const deleteClientTokenPromise = deleteFCMToken().catch((err) => {
          console.error("Error deleting FCM client token on auto logout:", err);
        });

        // Delete / deactivate FCM token in backend database
        const deleteBackendTokenPromise = (async () => {
          if (!userId) return;
          try {
            const baseURL =
              axiosInstance.defaults.baseURL || "http://localhost:8000/api";
            await axios.delete(`${baseURL}/fcm/delete-fcm-token`, {
              data: {
                userId,
                fcm_token: fcmToken,
              },
              timeout: 3000,
            });
            console.log(
              "✅ FCM token deactivated on backend during auto logout",
            );
          } catch (backendError) {
            console.error(
              "❌ Failed to delete FCM token on backend during auto logout:",
              backendError,
            );
          }
        })();

        // Await deletion tasks with a safety timeout so user redirect is never blocked
        await Promise.race([
          Promise.allSettled([
            deleteClientTokenPromise,
            deleteBackendTokenPromise,
          ]),
          new Promise((resolve) => setTimeout(resolve, 2500)),
        ]);
      } catch (err) {
        console.error("Error during auto logout token cleanup:", err);
      } finally {
        store.dispatch(resetNotifications());
        store.dispatch(logout());

        if (typeof window !== "undefined") {
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          // Hard reset app state to login page
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
