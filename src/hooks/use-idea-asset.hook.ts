"use client";

import { useEffect, useRef, useState } from "react";
import { db } from "@/lib/db";

/**
 * 전역 LRU 캐시. 같은 assetId를 여러 노드가 참조해도 object URL을 재사용한다.
 * 캐시 크기 상한은 64. 캐시 밖으로 밀려난 URL은 revoke 한다.
 */
const urlCache = new Map<string, { url: string; refCount: number }>();
const CACHE_LIMIT = 64;

async function resolveAssetUrl(assetId: string): Promise<string | null> {
  const cached = urlCache.get(assetId);
  if (cached) {
    cached.refCount += 1;
    // LRU: 접근한 항목을 맨 뒤로 재삽입
    urlCache.delete(assetId);
    urlCache.set(assetId, cached);
    return cached.url;
  }

  const asset = await db.ideaAssets.get(assetId);
  if (!asset) return null;

  const url = URL.createObjectURL(asset.blob);
  urlCache.set(assetId, { url, refCount: 1 });

  // LRU 초과 시 참조 수 0인 첫 항목 제거
  if (urlCache.size > CACHE_LIMIT) {
    for (const [key, entry] of urlCache) {
      if (entry.refCount <= 0) {
        URL.revokeObjectURL(entry.url);
        urlCache.delete(key);
        break;
      }
    }
  }
  return url;
}

function releaseAssetUrl(assetId: string) {
  const entry = urlCache.get(assetId);
  if (!entry) return;
  entry.refCount = Math.max(0, entry.refCount - 1);
}

export function useIdeaAsset(assetId?: string | null): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const currentAssetRef = useRef<string | null>(null);

  useEffect(() => {
    currentAssetRef.current = assetId ?? null;
    if (!assetId) return;
    let cancelled = false;
    resolveAssetUrl(assetId).then((resolved) => {
      if (cancelled) return;
      // race: 이 effect 실행 중 assetId가 다른 값으로 바뀌었으면 무시
      if (currentAssetRef.current !== assetId) return;
      setUrl(resolved);
    });
    return () => {
      cancelled = true;
      releaseAssetUrl(assetId);
    };
  }, [assetId]);

  // assetId가 falsy면 url을 null로 취급 (state는 이전 값 유지되어도 무관)
  return assetId ? url : null;
}

export async function createAssetFromBlob(input: {
  projectId: string;
  kind: "image" | "video" | "file" | "thumbnail";
  blob: Blob;
  originalName?: string;
  width?: number;
  height?: number;
}): Promise<string> {
  const id = `asset-${crypto.randomUUID()}`;
  await db.ideaAssets.add({
    id,
    projectId: input.projectId,
    kind: input.kind,
    mime: input.blob.type || "application/octet-stream",
    size: input.blob.size,
    originalName: input.originalName,
    blob: input.blob,
    width: input.width,
    height: input.height,
    createdAt: Date.now(),
  });
  return id;
}

export async function deleteAsset(assetId: string): Promise<void> {
  const cached = urlCache.get(assetId);
  if (cached) {
    URL.revokeObjectURL(cached.url);
    urlCache.delete(assetId);
  }
  await db.ideaAssets.delete(assetId);
}
