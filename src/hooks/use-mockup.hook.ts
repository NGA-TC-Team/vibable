"use client";

import { useCallback } from "react";
import { usePhaseData } from "./use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";
import type { MockupElement, MockupViewport } from "@/types/phases";

export function useMockup(pageId: string) {
  const { data, patchData } = usePhaseData("screenDesign");
  const viewport = useEditorStore((s) => s.activeViewport);
  const setViewport = useEditorStore((s) => s.setActiveViewport);

  const page = data?.pages.find((p) => p.id === pageId) ?? null;

  const elements: MockupElement[] = page?.mockup?.[viewport] ?? [];

  const setElements = useCallback(
    (next: MockupElement[]) => {
      if (!data || !page) return;
      const mockup: MockupViewport = {
        mobile: page.mockup?.mobile ?? [],
        tablet: page.mockup?.tablet ?? [],
        desktop: page.mockup?.desktop ?? [],
        [viewport]: next,
      };
      const pages = data.pages.map((p) =>
        p.id === pageId ? { ...p, mockup } : p,
      );
      patchData({ pages });
    },
    [data, page, pageId, viewport, patchData],
  );

  return {
    page,
    viewport,
    setViewport,
    elements,
    setElements,
  };
}
