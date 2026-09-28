// src/lib/firebase/fcm.js
import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import app from "./firebase";

let messaging = null;

if (typeof window !== "undefined") {
    messaging = getMessaging(app);
}

const VAPID_KEY = "BOXjoc6B-HK4cy2cYKu8IR8ZeOkLmPPkC7wtj1jIt9hSJcKvK53wTNvV2ddlLe4Jf_jJMVr6lxYxEuDCN9pErko";

/**
 * ✅ Ensure service worker is registered and ready
 */
const ensureServiceWorkerReady = async () => {
    if (!('serviceWorker' in navigator)) {
       // //console.log("⚠️ Service Worker not supported");
        return null;
    }

    try {
        //console.log("📝 Registering service worker...");
        
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        //console.log("✅ Service worker registered:", registration.scope);

        // Wait for it to be ready
        await navigator.serviceWorker.ready;
        //console.log("✅ Service worker is ready");

        return registration;
    } catch (error) {
        //console.error("❌ Service worker registration failed:", error);
        return null;
    }
};

/**
 * Request FCM token
 */
export const requestFCMToken = async () => {
    console.log("🎯 [FCM] requestFCMToken called...");
    
    if (!messaging) {
        console.warn("❌ [FCM] messaging not available or not in browser environment");
        return null;
    }

    try {
        // Step 1: Check if Notification API exists
        if (!("Notification" in window)) {
            console.log("❌ [FCM] Browser doesn't support notifications");
            return null;
        }

        // Step 2: Check current permission
        let permission = Notification.permission;
        console.log("📋 [FCM] Current notification permission:", permission);

        // Step 3: Handle denied permission
        if (permission === "denied") {
            console.warn("❌ [FCM] Notification permission is DENIED by user. Enable in browser settings.");
            return null;
        }

        // Step 4: Request permission if needed
        if (permission === "default") {
            console.log("📩 [FCM] Requesting notification permission...");
            permission = await Notification.requestPermission();
            console.log("📋 [FCM] Permission result:", permission);
        }

        // Step 5: If not granted, stop here
        if (permission !== "granted") {
            console.warn("❌ [FCM] Notification permission was not granted:", permission);
            return null;
        }
        console.log("✅ [FCM] Notification permission GRANTED!");

        // Step 6: Ensure service worker is ready
        console.log("⏳ [FCM] Ensuring service worker is ready...");
        const registration = await ensureServiceWorkerReady();

        if (!registration) {
            console.error("❌ [FCM] Service worker registration failed");
            return null;
        }
        console.log("✅ [FCM] Service worker ready, proceeding to fetch token...");

        // Step 7: Get FCM token
        console.log("🔑 [FCM] Requesting FCM token with VAPID key...");
        const token = await getToken(messaging, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration,
        });

        if (!token) {
            console.error("❌ [FCM] FCM token is null or empty");
            return null;
        }

        console.log("✅ [FCM Token Generated]:", token);
        return token;

    } catch (error) {
        console.error("❌ [FCM] Error getting FCM token:", error);
        return null;
    }
};

/**
 * Delete FCM token (call on logout)
 */
export const deleteFCMToken = async () => {
    if (!messaging) {
        return false;
    }

    try {
        const deleted = await deleteToken(messaging);
        if (deleted) {
            console.log("✅ [FCM] Token deleted successfully");
            return true;
        }
        return false;
    } catch (error) {
        console.error("❌ [FCM] Error deleting FCM token:", error);
        return false;
    }
};

/**
 * Listen for foreground messages
 */
export const listenToFCMMessages = (callback) => {
    console.log("🎧 [FCM] Registering onMessage & Service Worker message listeners...");
    
    if (!messaging) {
        console.warn("⚠️ [FCM] Messaging not initialized, cannot register listeners");
        return () => { };
    }

    // Listen for foreground messages via Firebase SDK
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
        console.log("🎉 [FCM onMessage FIRED - FOREGROUND PUSH RECEIVED]:", payload);
        callback(payload);
    });

    // Listen for messages forwarded from Service Worker
    const handleServiceWorkerMessage = (event) => {
        console.log("📨 [FCM Service Worker Message Event]:", event.data);
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
            console.log("🖱️ [FCM] Notification clicked in SW:", event.data);
            callback({
                fromServiceWorker: true,
                action: 'click',
                data: event.data.data
            });
        }
    };

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    console.log("✅ [FCM] Listeners active and listening for messages");

    return () => {
        console.log("🧹 [FCM] Cleaning up message listeners");
        unsubscribeOnMessage();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        }
    };
};
