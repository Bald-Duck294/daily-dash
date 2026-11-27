"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const PWA_INSTALLED_KEY = "saafai_pwa_installed";

export default function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = navigator.userAgent || "";
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const mobileUA =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    const updateViewportMobile = () => {
      setIsMobile(mobileUA && window.innerWidth < 1024);
    };

    const syncInitialState = () => {
      setIsIOS(iosDevice);
      updateViewportMobile();

      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));

      if (isStandaloneMode) {
        try {
          localStorage.setItem(PWA_INSTALLED_KEY, "true");
        } catch {}
        setIsInstalled(true);
      } else {
        try {
          if (localStorage.getItem(PWA_INSTALLED_KEY) === "true") {
            setIsInstalled(true);
          }
        } catch {}
      }

      if (window.deferredPwaPrompt) {
        setCanInstall(true);
      }
    };

    const rafId = window.requestAnimationFrame(syncInitialState);

    // Check Chromium's getInstalledRelatedApps API if available
    if (typeof navigator.getInstalledRelatedApps === "function") {
      navigator
        .getInstalledRelatedApps()
        .then((apps) => {
          if (Array.isArray(apps) && apps.length > 0) {
            setIsInstalled(true);
            try {
              localStorage.setItem(PWA_INSTALLED_KEY, "true");
            } catch {}
          }
        })
        .catch(() => {});
    }

    const handleInstallable = () => {
      setCanInstall(true);
    };

    const handleInstalled = () => {
      setIsStandalone(true);
      setIsInstalled(true);
      setCanInstall(false);
      window.deferredPwaPrompt = null;
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, "true");
      } catch {}
    };

    window.addEventListener("resize", updateViewportMobile);
    window.addEventListener("pwa-installable", handleInstallable);
    window.addEventListener("pwa-installed", handleInstalled);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateViewportMobile);
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
          setIsInstalled(true);
          try {
            localStorage.setItem(PWA_INSTALLED_KEY, "true");
          } catch {}
        }
        window.deferredPwaPrompt = null;
      } catch (err) {
        console.warn("[PWA] Prompt error:", err);
      }
    } else if (isIOS) {
      toast(
        "To install on iOS: Tap the Share button (square with arrow) and select 'Add to Home Screen'.",
        {
          icon: "📲",
          duration: 7000,
        },
      );
    } else {
      toast(
        "To install on this device: Open your browser menu (⋮) and select 'Install SaafAI Dashboard' or 'Add to Home screen'.",
        {
          icon: "📲",
          duration: 7000,
        },
      );
    }
  }, [isIOS]);

  // Show only on mobile devices, when not already installed/standalone, and when installable (or iOS Safari)
  const shouldShowInstall =
    isMobile && !isStandalone && !isInstalled && (canInstall || isIOS);

  return {
    canInstall,
    isStandalone,
    isInstalled,
    isMobile,
    shouldShowInstall,
    installApp,
  };
}
