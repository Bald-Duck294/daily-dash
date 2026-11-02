"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Dynamically generate and bind manifest based on route (Feedback vs Dashboard)
    try {
      const pathname = window.location.pathname || "";
      const dynamicStartUrl = window.location.pathname + window.location.search;
      const isFeedback =
        pathname.startsWith("/feedback") || pathname.startsWith("/tadoba");

      const dynamicManifest = isFeedback
        ? {
            name: "SaafAI - Tadoba Feedback Kiosk",
            short_name: "Tadoba Feedback",
            description:
              "Tadoba-Andhari Tiger Reserve × SaafAI Citizen Washroom Feedback",
            start_url: dynamicStartUrl || "/feedback/tadoba",
            scope: "/feedback/",
            display: "standalone",
            orientation: "portrait-primary",
            background_color: "#faf8f4",
            theme_color: "#284e3a",
            id: dynamicStartUrl || "/feedback/tadoba",
            icons: [
              {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
              },
              {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
              },
              {
                src: "/icons/icon-maskable-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
              },
            ],
          }
        : {
            name: "SaafAI Dashboard",
            short_name: "SaafAI",
            description:
              "SaafAI Intelligent Facility Management & Washroom Hygiene Platform",
            start_url: dynamicStartUrl || "/",
            scope: "/",
            display: "standalone",
            orientation: "any",
            background_color: "#ffffff",
            theme_color: "#0891b2",
            id: "/dashboard",
            icons: [
              {
                src: "/icons/icon-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any",
              },
              {
                src: "/icons/icon-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any",
              },
              {
                src: "/icons/icon-maskable-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
              },
            ],
          };

      const manifestBlob = new Blob([JSON.stringify(dynamicManifest)], {
        type: "application/json",
      });
      const manifestUrl = URL.createObjectURL(manifestBlob);

      let link = document.querySelector('link[rel="manifest"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "manifest";
        document.head.appendChild(link);
      }
      link.href = manifestUrl;
    } catch (e) {
      console.warn("[PWA] Error binding dynamic manifest:", e);
    }

    // 2. Register Service Worker
    const registerServiceWorker = () => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      }
    };

    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker, { once: true });
    }

    // 3. Capture beforeinstallprompt so any component or button can trigger it
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPwaPrompt = e;
      window.dispatchEvent(new CustomEvent("pwa-installable"));
    };

    // 4. Capture appinstalled
    const handleAppInstalled = () => {
      window.deferredPwaPrompt = null;
      window.dispatchEvent(new CustomEvent("pwa-installed"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}
