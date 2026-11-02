"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export default function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect if running as standalone app (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // Check if prompt was already captured
    if (window.deferredPwaPrompt) {
      setCanInstall(true);
    }

    const handleInstallable = () => {
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setIsStandalone(true);
      setCanInstall(false);
      window.deferredPwaPrompt = null;
    };

    window.addEventListener("pwa-installable", handleInstallable);
    window.addEventListener("pwa-installed", handleInstalled);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("pwa-installable", handleInstallable);
      window.removeEventListener("pwa-installed", handleInstalled);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (window.deferredPwaPrompt) {
      try {
        window.deferredPwaPrompt.prompt();
        const choice = await window.deferredPwaPrompt.userChoice;
        if (choice && choice.outcome === "accepted") {
          toast.success("SaafAI Dashboard installed successfully!");
          setCanInstall(false);
          setIsStandalone(true);
        }
        window.deferredPwaPrompt = null;
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
      }
    } else {
      // Browser instructions when beforeinstallprompt hasn't fired or on Safari
      const isIOS =
        typeof navigator !== "undefined" &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !window.MSStream;

      if (isIOS) {
        toast(
          "To install on iOS: Tap the Share button (square with arrow) and select 'Add to Home Screen'.",
          {
            icon: "📲",
            duration: 7000,
          }
        );
      } else {
        toast(
          "To install on this device: Open your browser menu (⋮) and select 'Install SaafAI Dashboard' or 'Add to Home screen'.",
          {
            icon: "💻",
            duration: 7000,
          }
        );
      }
    }
  }, []);

  return {
    canInstall,
    isStandalone,
    installApp,
  };
}

