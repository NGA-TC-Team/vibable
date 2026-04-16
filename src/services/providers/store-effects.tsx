"use client";

import { useEffect } from "react";
import { useSystemStore } from "@/services/store";

export function StoreEffects() {
  useEffect(() => {
    const { setHydrated, setOnline, setPrefersReducedMotion } =
      useSystemStore.getState();

    setHydrated(true);
    setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setPrefersReducedMotion(mq.matches);
    syncMotion();
    mq.addEventListener("change", syncMotion);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      mq.removeEventListener("change", syncMotion);
    };
  }, []);

  return null;
}
