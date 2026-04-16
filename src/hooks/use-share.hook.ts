"use client";

import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { stripMemos } from "@/lib/strip-memos";
import { phaseDataSchema } from "@/lib/schemas/phase-data";
import { SHARE_URL_MAX_BYTES } from "@/lib/constants";
import type { Project, ProjectType, PhaseData } from "@/types/phases";

interface ShareResult {
  url: string | null;
  tooLarge: boolean;
}

export function generateShareUrl(project: Project): ShareResult {
  const stripped = stripMemos(project.phases);
  const json = JSON.stringify(stripped);
  const compressed = compressToEncodedURIComponent(json);

  const urlPath = `/workspace/shared?data=${compressed}&name=${encodeURIComponent(project.name)}&type=${project.type}`;
  const fullUrl = `${window.location.origin}${urlPath}`;

  if (new Blob([fullUrl]).size > SHARE_URL_MAX_BYTES) {
    return { url: null, tooLarge: true };
  }

  return { url: fullUrl, tooLarge: false };
}

export interface ParsedShare {
  name: string;
  type: ProjectType;
  phases: PhaseData;
}

export function parseShareUrl(
  searchParams: URLSearchParams,
): ParsedShare | null {
  const data = searchParams.get("data");
  const name = searchParams.get("name");
  const type = searchParams.get("type") as ProjectType | null;

  if (!data || !name || !type) return null;

  try {
    const decompressed = decompressFromEncodedURIComponent(data);
    if (!decompressed) return null;

    const parsed = JSON.parse(decompressed);
    const result = phaseDataSchema.safeParse({ ...parsed, memos: {} });
    if (!result.success) return null;

    return {
      name: decodeURIComponent(name),
      type,
      phases: result.data as unknown as PhaseData,
    };
  } catch {
    return null;
  }
}
