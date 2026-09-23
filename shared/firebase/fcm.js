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
        console.warn("⚠️ Service Worker not supported in this browser");
        return null;
    }

    try {
        console.log("📝 Registering service worker /firebase-messaging-sw.js...");
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        console.log("✅ Service worker registered:", registration.scope);

        await navigator.serviceWorker.ready;
        console.log("✅ Service worker is ready");

        return registration;
    } catch (error) {
        console.error("❌ Service worker registration failed:", error);
        return null;
    }
};

let inFlightTokenPromise = null;

/**
 * Request FCM token
 */
export const requestFCMToken = async () => {
    if (inFlightTokenPromise) {
        console.log("⏭️ FCM token request already in-flight, reusing existing request...");
        return inFlightTokenPromise;
    }

    inFlightTokenPromise = (async () => {
        console.log("🎯 requestFCMToken called");
        
        if (!messaging) {
            console.warn("❌ FCM messaging not available (window is undefined or init failed)");
            return null;
        }

        try {
            // Step 1: Check if Notification API exists
            if (!("Notification" in window)) {
                console.error("❌ Browser doesn't support notifications");
                return null;
            }

            // Step 2: Check current permission
            let permission = Notification.permission;
            console.log("📋 Current notification permission:", permission);

            // Step 3: Handle denied permission
            if (permission === "denied") {
                console.error("❌ Notification permission DENIED by user in browser settings. Please allow notifications for this site.");
                return null;
            }

            // Step 4: Request permission if needed
            if (permission === "default") {
                console.log("📩 Requesting notification permission from user...");
                permission = await Notification.requestPermission();
                console.log("📋 Permission result:", permission);
            }

            // Step 5: If not granted, stop here
            if (permission !== "granted") {
                console.warn("❌ Notification permission not granted:", permission);
                return null;
            }
            console.log("✅ Notification permission GRANTED");

            // Step 6: Ensure service worker is ready
            console.log("⏳ Ensuring service worker is ready...");
            const registration = await ensureServiceWorkerReady();

            if (!registration) {
                console.error("❌ Service worker registration returned null");
                return null;
            }
            console.log("✅ Service worker ready, requesting token from Firebase...");

            // Step 7: Get FCM token
            const token = await getToken(messaging, {
                vapidKey: VAPID_KEY,
                serviceWorkerRegistration: registration,
            });

            if (!token) {
                console.error("❌ FCM token is null or empty from Firebase");
                return null;
            }

            console.log("✅ FCM Token received successfully! (first 25 chars):", token.substring(0, 25) + "...");
            return token;

        } catch (error) {
            console.error("❌ Error getting FCM token:", error);
            console.error("❌ Error details:", { name: error.name, message: error.message, stack: error.stack });
            
            if (error.name === 'AbortError') {
                console.error("💡 Hint: Service worker issue. Try clearing site cache or unregistering previous SW.");
            }
            
            return null;
        }
    })();

    try {
        return await inFlightTokenPromise;
    } finally {
        inFlightTokenPromise = null;
    }
};

/**
 * Delete FCM token (call on logout)
 */
export const deleteFCMToken = async () => {
    if (!messaging) {
        //console.warn("FCM messaging not available");
        return false;
    }

    try {
        const deleted = await deleteToken(messaging);

        if (deleted) {
            //console.log("✅ FCM token deleted successfully");
            return true;
        } else {
            //console.log("ℹ️ No FCM token to delete");
            return false;
        }
    } catch (error) {
        //console.error("❌ Error deleting FCM token:", error);
        return false;
    }
};

/**
 * Listen for foreground messages
 */
export const listenToFCMMessages = (callback) => {
    //console.log("🎯 listenToFCMMessages called");
    
    if (!messaging) {
        //console.log("⚠️ Messaging not initialized");
        return () => { };
    }

    //console.log("🎧 Registering message handlers...");

    // Listen for foreground messages
    const unsubscribeOnMessage = onMessage(messaging, (payload) => {
        //console.log("🎉 onMessage FIRED!");
        //console.log("📦 Payload:", JSON.stringify(payload, null, 2));
        callback(payload);
    });

    // Listen for messages from Service Worker
    const handleServiceWorkerMessage = (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
            //console.log("🖱️ Notification clicked in SW:", event.data);
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

    //console.log("✅ Message handlers registered");

    return () => {
        //console.log("🧹 Cleaning up message handlers");
        unsubscribeOnMessage();
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
        }
    };
};
