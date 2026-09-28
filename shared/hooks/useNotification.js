// src/hooks/useNotifications.js
"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestFCMToken, listenToFCMMessages } from "../firebase/fcm";
import {
  addNotification,
  setFCMToken,
} from "@/features/notification/notification.slice";
import { useSaveFCMTokenMutation } from "@/features/notification/notification.api";
import { store } from "@/store/store";
import { useRouter } from "next/navigation";

export default function useNotifications() {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const { notifications, unreadCount, fcmToken } = useSelector(
    (state) => state.notifications,
  );

  const isInitialized = useRef(false);
  const processedMessageIds = useRef(new Set()); // ✅ Track processed messages
  const [saveFCMToken] = useSaveFCMTokenMutation();

  useEffect(() => {
    if (!isAuthenticated || !user || !user.id) {
      console.log("⚠️ User not authenticated, skipping FCM initialization");
      isInitialized.current = false;
      return;
    }
    if (isInitialized.current) {
      //  console.log("⏭️ FCM already initialized, skipping...");
      return;
    }

    if (!user || !user.id) {
      console.log("⚠️ User not logged in, skipping FCM initialization");
      return;
    }

    console.log("🚀 [FCM HOOK] Initializing FCM for user:", user.id, "(Role:", user.role_id, ")");
    isInitialized.current = true;
http://localhost/adminer/?pgsql=34.93.127.187&username=app_user&db=safai_pg&ns=public&sql=DELETE%20FROM%20%20sla_escalations%20
    let unsubscribeFCM = () => {};

    const initializeFCM = async () => {
      const token = await requestFCMToken();
      console.log("🔑 [FCM HOOK] FCM Token received:", token);

      if (token) {
        dispatch(setFCMToken(token));

        try {
          console.log("📤 [FCM HOOK] Dispatching saveFCMToken to backend for userId:", user.id);
          await saveFCMToken({
            fcmToken: token,
            userId: user.id,
          })
            .unwrap()
            .then((payload) => console.log("✅ [FCM HOOK] FCM Token saved to backend successfully:", payload))
            .catch((error) => console.error("❌ [FCM HOOK] Rejected saving FCM token:", error));
        } catch (error) {
          console.error("❌ [FCM HOOK] Error saving FCM token:", error);
        }
      }

      // ✅ Helper function to add notification (prevents duplicates)
      const addNotificationToStore = (title, body, data, messageId, source = "FOREGROUND") => {
        // Check if already processed
        if (messageId && processedMessageIds.current.has(messageId)) {
          console.log("⏭️ [FCM NOTIFICATION] Duplicate message ignored (already processed):", messageId);
          return;
        }

        console.log(
          `%c🔔 [FCM NOTIFICATION RECEIVED - ${source}]`,
          "background: #222; color: #00ff88; font-weight: bold; font-size: 13px; padding: 4px 8px; border-radius: 4px;"
        );
        console.log("📝 Title:", title);
        console.log("📄 Body:", body);
        console.log("📦 Data / Payload:", data);
        console.log("🆔 Message ID:", messageId);

        dispatch(
          addNotification({
            title,
            body,
            data: data || {},
          }),
        );

        // Mark as processed
        if (messageId) {
          processedMessageIds.current.add(messageId);

          // Clean up old message IDs (keep last 50)
          if (processedMessageIds.current.size > 50) {
            const values = Array.from(processedMessageIds.current);
            processedMessageIds.current = new Set(values.slice(-50));
          }
        }

        console.log("✅ [FCM NOTIFICATION] Added to Redux store & Notification Center");
      };

      // ✅ 1. Listen for FOREGROUND messages via onMessage
      console.log("👂 [FCM HOOK] Setting up onMessage listener (foreground only)...");
      unsubscribeFCM = listenToFCMMessages((payload) => {
        const currentAuth = store.getState?.()?.auth?.isAuthenticated;
        if (!currentAuth) {
          console.log("⚠️ [FCM HOOK] User logged out, ignoring notification");
          return;
        }

        console.log("🎉 [FCM HOOK] onMessage fired while tab is active (foreground):", payload);

        const title =
          payload.notification?.title ||
          payload.data?.title ||
          "New Notification";

        const body = payload.notification?.body || payload.data?.body || "";

        const messageId = payload.messageId || payload.fcmMessageId;

        addNotificationToStore(title, body, payload.data, messageId, "FOREGROUND");
      });

      // ✅ 2. Listen for BACKGROUND messages from Service Worker
      console.log("👂 [FCM HOOK] Setting up Service Worker message listener...");
      const handleServiceWorkerMessage = (event) => {
        console.log("📨 [FCM HOOK] Message received from Service Worker:", event.data);

        // Handle background notifications
        if (event.data?.type === "FCM_NOTIFICATION_BACKGROUND") {
          const { title, body, data, messageId } = event.data.payload;
          addNotificationToStore(title, body, data, messageId, "BACKGROUND_SW");
        }

        // Handle notification clicks
        if (event.data?.type === "NOTIFICATION_CLICKED") {
          console.log("🖱️ [FCM HOOK] Notification clicked from SW:", event.data);
          const { targetUrl } = event.data;
          if (targetUrl) {
            router.push(targetUrl);
          }
        }
      };

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener(
          "message",
          handleServiceWorkerMessage,
        );
      }

      console.log("✅ [FCM HOOK] All FCM listeners initialized and ready!");

      return () => {
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.removeEventListener(
            "message",
            handleServiceWorkerMessage,
          );
        }
      };
    };

    const cleanupSWListener = initializeFCM();

    return () => {
      console.log("🧹 [FCM HOOK] Cleaning up FCM hook");
      unsubscribeFCM();
      cleanupSWListener?.then((cleanup) => cleanup?.());
      isInitialized.current = false;
      processedMessageIds.current.clear();
    };
  }, [user?.id, isAuthenticated, dispatch, saveFCMToken, router]);

  return {
    notifications,
    unreadCount,
    fcmToken,
  };
}
