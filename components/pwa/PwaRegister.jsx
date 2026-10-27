"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Dynamically generate and bind manifest with exact query parameters (e.g. locationId, companyId)
    try {
      const dynamicStartUrl = window.location.pathname + window.location.search;

      const dynamicManifest = {
        name: "SaafAI - Tadoba Feedback Kiosk",
        short_name: "Tadoba Feedback",
        description: "Tadoba-Andhari Tiger Reserve × SaafAI Citizen Feedback",
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
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered with scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });

      // 3. Capture beforeinstallprompt so any component or button can trigger it
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        window.deferredPwaPrompt = e;
        window.dispatchEvent(new CustomEvent("pwa-installable"));
      });
    }
  }, []);

  return null;
}
