"use client";

import { useEffect, useState } from "react";

export interface StorageQuotaInfo {
  usage: number;
  quota: number;
  usageRatio: number;
  supported: boolean;
}

const EMPTY: StorageQuotaInfo = {
  usage: 0,
  quota: 0,
  usageRatio: 0,
  supported: false,
};

export function useStorageQuota(pollMs = 30_000): StorageQuotaInfo {
  const [info, setInfo] = useState<StorageQuotaInfo>(EMPTY);

  useEffect(() => {
    const supported = typeof navigator !== "undefined" && !!navigator.storage?.estimate;
    if (!supported) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const estimate = await navigator.storage.estimate();
        if (cancelled) return;
        const usage = estimate.usage ?? 0;
        const quota = estimate.quota ?? 0;
        setInfo({
          usage,
          quota,
          usageRatio: quota > 0 ? usage / quota : 0,
          supported: true,
        });
      } catch {
        // 무시
      }
    };

    refresh();
    const id = window.setInterval(refresh, pollMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return info;
}
