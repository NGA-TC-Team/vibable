"use client";

import { useCallback } from "react";
import { usePhaseData } from "./use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";
import { VIEWPORT_WIDTHS } from "@/components/preview/mockup/viewport-tabs";
import type {
  MockupElement,
  MockupViewport,
  MockupViewportKey,
  ScreenState,
} from "@/types/phases";

const VIEWPORT_PADDING: Record<MockupViewportKey, number> = {
  mobile: 16,
  tablet: 32,
  desktop: 64,
};

const ALL_VIEWPORTS: MockupViewportKey[] = ["mobile", "tablet", "desktop"];
const ALL_STATES: ScreenState[] = ["idle", "loading", "offline", "error"];

function adjustForViewport(
  element: MockupElement,
  vp: MockupViewportKey,
  existingElements: MockupElement[],
): MockupElement {
  const cw = VIEWPORT_WIDTHS[vp];
  const pad = VIEWPORT_PADDING[vp];
  const width = Math.min(element.width, cw - 2 * pad);
  const x = Math.round((cw - width) / 2);
  const topLevelElements = existingElements.filter(
    (el) =>
      !existingElements.some((parent) => parent.children?.includes(el.id)),
  );
  const bottomY = topLevelElements.reduce(
    (max, el) => Math.max(max, el.y + el.height),
    0,
  );
  const y = topLevelElements.length > 0 ? bottomY + 12 : pad;
  return { ...element, x, y, width };
}

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

  const addElementToAll = useCallback(
    (baseElement: MockupElement) => {
      if (!data || !page) return;

      const emptyViewport: MockupViewport = { mobile: [], tablet: [], desktop: [] };
      const currentByState = page.mockupByState ?? {
        idle: page.mockup ?? emptyViewport,
        loading: emptyViewport,
        offline: emptyViewport,
        error: emptyViewport,
      };

      const nextByState = ALL_STATES.reduce(
        (acc, state) => {
          const stateViewport = currentByState[state] ?? emptyViewport;
          acc[state] = ALL_VIEWPORTS.reduce(
            (vpAcc, vp) => {
              const existing = stateViewport[vp] ?? [];
              const adjusted = adjustForViewport(baseElement, vp, existing);
              vpAcc[vp] = [...existing, adjusted];
              return vpAcc;
            },
            { ...emptyViewport } as MockupViewport,
          );
          return acc;
        },
        {} as Record<ScreenState, MockupViewport>,
      );

      const pages = data.pages.map((p) =>
        p.id === pageId
          ? { ...p, mockupByState: nextByState as typeof page.mockupByState }
          : p,
      );
      patchData({ pages });
    },
    [data, page, pageId, patchData],
  );

  return {
    page,
    viewport,
    setViewport,
    elements,
    setElements,
    addElementToAll,
  };
}
