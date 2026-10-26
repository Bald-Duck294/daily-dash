"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startLoggingOut, logout } from "@/features/auth/auth.slice.js";
import { resetNotifications } from "@/features/notification/notification.slice.js";
import { deleteFCMToken } from "@/shared/firebase/fcm.js";
import { useDeleteFCMTokenMutation } from "@/features/notification/notification.api.js";
import toast from "react-hot-toast";
import { toast as sonnerToast } from "sonner";

export const useLogout = () => {
  const dispatch = useDispatch();
  const { user, isLoggingOut } = useSelector((state) => state.auth);
  const { fcmToken } = useSelector((state) => state.notifications);
  const [deleteFcmTokenFromBackend] = useDeleteFCMTokenMutation();

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;

    // 1. Immediately dismiss any active toast notifications so they don't linger
    try {
      toast.dismiss();
      sonnerToast.dismiss();
    } catch {
      // Ignore toast dismissal errors
    }

    // 2. Trigger logging-out state in Redux (activates LogoutOverlay animation immediately)
    dispatch(startLoggingOut());

    try {
      const currentToken =
        fcmToken ||
        (typeof window !== "undefined"
          ? localStorage.getItem("fcm_token")
          : null);

      // 3. Prepare background cleanup tasks in parallel with safe error guards
      const deleteBackendPromise = (async () => {
        if (user?.id && currentToken) {
          try {
            await deleteFcmTokenFromBackend({
              userId: user.id,
              fcm_token: currentToken,
            }).unwrap();
            console.log("✅ FCM token removed from backend on logout");
          } catch (err) {
            console.warn("FCM backend deletion error during logout:", err);
          }
        }
      })();

      const deleteClientPromise = (async () => {
        try {
          await deleteFCMToken();
          console.log("✅ FCM client token deleted on logout");
        } catch (err) {
          console.warn("FCM client token delete error:", err);
        }
      })();

      const unregisterSwPromise = (async () => {
        if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
          try {
            const registrations =
              await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
              if (
                registration.scope &&
                registration.scope.includes("firebase-cloud-messaging")
              ) {
                await registration.unregister();
                console.log("✅ Service worker unregistered");
              }
            }
          } catch (err) {
            console.warn("Service worker unregister error:", err);
          }
        }
      })();

      // 4. Run cleanup tasks with a hard safety timeout (1500ms max)
      // and minimum display duration (700ms) for a silky-smooth animation experience
      await Promise.allSettled([
        Promise.race([
          Promise.allSettled([
            deleteBackendPromise,
            deleteClientPromise,
            unregisterSwPromise,
          ]),
          new Promise((resolve) => setTimeout(resolve, 1500)),
        ]),
        new Promise((resolve) => setTimeout(resolve, 700)),
      ]);
    } catch (error) {
      console.error("❌ Error during logout cleanup:", error);
    } finally {
      // 5. Dismiss any remaining toasts
      try {
        toast.dismiss();
        sonnerToast.dismiss();
      } catch {
        // Ignore toast dismissal errors
      }

      // 6. Reset notifications and auth state in Redux
      dispatch(resetNotifications());
      dispatch(logout());

      // 7. Clear all storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("fcm_token");
        sessionStorage.clear();

        // 8. Redirect cleanly to login via hard navigation to reset entire React state and cache
        window.location.href = "/login";
      }
    }
  }, [
    isLoggingOut,
    dispatch,
    fcmToken,
    user?.id,
    deleteFcmTokenFromBackend,
  ]);

  return { handleLogout, isLoggingOut };
};

export default useLogout;
