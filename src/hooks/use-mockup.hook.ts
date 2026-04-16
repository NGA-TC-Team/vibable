"use client";

import { useCallback } from "react";
import { usePhaseData } from "./use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";
import type { MockupElement, MockupViewport, ScreenState } from "@/types/phases";

export function useMockup(pageId: string) {
  const { data, patchData } = usePhaseData("screenDesign");
  const viewport = useEditorStore((s) => s.activeViewport);
  const setViewport = useEditorStore((s) => s.setActiveViewport);
  const screenState = useEditorStore((s) => s.activeScreenState);

  const page = data?.pages.find((p) => p.id === pageId) ?? null;

  const elements: MockupElement[] =
    page?.mockupByState?.[screenState]?.[viewport]
    ?? (screenState === "idle" ? page?.mockup?.[viewport] ?? [] : []);

  const setElements = useCallback(
    (next: MockupElement[]) => {
      if (!data || !page) return;

      // #region agent log
      fetch("http://127.0.0.1:7617/ingest/1fd985d8-4c37-41b9-98d6-89f96a15ab8e", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e09744" }, body: JSON.stringify({ sessionId: "e09744", runId: "initial", hypothesisId: "H6", location: "use-mockup.hook.ts:24", message: "set elements", data: { pageId, viewport, screenState, previousLength: elements.length, nextLength: next.length, hasMockupByState: Boolean(page.mockupByState) }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion

      if (screenState === "idle" && !page.mockupByState) {
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
      } else {
        const emptyViewport: MockupViewport = { mobile: [], tablet: [], desktop: [] };
        const currentByState = page.mockupByState ?? {
          idle: page.mockup ?? emptyViewport,
          loading: emptyViewport,
          offline: emptyViewport,
          error: emptyViewport,
        };
        const stateViewport: MockupViewport = {
          ...(currentByState[screenState] ?? emptyViewport),
          [viewport]: next,
        };
        const mockupByState = {
          ...currentByState,
          [screenState]: stateViewport,
        };
        const pages = data.pages.map((p) =>
          p.id === pageId ? { ...p, mockupByState } : p,
        );
        patchData({ pages });
      }
    },
    [data, elements.length, page, pageId, viewport, screenState, patchData],
  );

  return {
    page,
    viewport,
    setViewport,
    elements,
    setElements,
  };
}
