"use client";

import { useCallback } from "react";
import { usePhaseData } from "./use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";
import { VIEWPORT_WIDTHS } from "@/components/preview/mockup/viewport-tabs";
import type {
  MockupElement,
  MockupElementType,
  MockupViewport,
  MockupViewportKey,
  ScreenState,
} from "@/types/phases";

const VIEWPORT_GUTTERS: Record<MockupViewportKey, number> = {
  mobile: 16,
  tablet: 32,
  desktop: 80,
};

const CONTENT_MAX_WIDTH: Record<MockupViewportKey, number> = {
  mobile: 343,
  tablet: 704,
  desktop: 1120,
};

const ALL_VIEWPORTS: MockupViewportKey[] = ["mobile", "tablet", "desktop"];
const ALL_STATES: ScreenState[] = ["idle", "loading", "offline", "error"];

const FULL_BLEED_TYPES = new Set<MockupElementType>(["header", "bottomNav"]);
const CONTAINER_SCALE_TYPES = new Set<MockupElementType>([
  "heading",
  "text",
  "button",
  "input",
  "image",
  "card",
  "list",
  "divider",
  "sidebar",
  "table",
  "form",
  "modal",
  "tabs",
  "carousel",
  "dropdown",
  "searchbar",
  "breadcrumb",
  "pagination",
  "progressbar",
  "map",
  "video",
  "chart",
  "grid",
  "hstack",
  "vstack",
]);

export interface MockupPlacement {
  sourceViewport: MockupViewportKey;
  x: number;
  y: number;
  width: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getViewportContentWidth(vp: MockupViewportKey) {
  const viewportWidth = VIEWPORT_WIDTHS[vp];
  return Math.min(CONTENT_MAX_WIDTH[vp], viewportWidth - VIEWPORT_GUTTERS[vp] * 2);
}

function getViewportContentLeft(vp: MockupViewportKey) {
  return Math.round((VIEWPORT_WIDTHS[vp] - getViewportContentWidth(vp)) / 2);
}

function getResponsiveWidth(
  type: MockupElementType,
  baseWidth: number,
  sourceViewport: MockupViewportKey,
  targetViewport: MockupViewportKey,
) {
  const viewportWidth = VIEWPORT_WIDTHS[targetViewport];
  if (FULL_BLEED_TYPES.has(type)) {
    return viewportWidth;
  }

  const sourceContentWidth = getViewportContentWidth(sourceViewport);
  const targetContentWidth = getViewportContentWidth(targetViewport);
  const widthRatio = clamp(baseWidth / sourceContentWidth, 0.12, 1);

  if (CONTAINER_SCALE_TYPES.has(type)) {
    return Math.round(targetContentWidth * widthRatio);
  }

  const softenedScale = Math.pow(targetContentWidth / sourceContentWidth, 0.35);
  return Math.round(baseWidth * softenedScale);
}

function adjustForViewport(
  element: MockupElement,
  vp: MockupViewportKey,
  existingElements: MockupElement[],
  placement?: MockupPlacement,
): MockupElement {
  const cw = VIEWPORT_WIDTHS[vp];
  const pad = VIEWPORT_GUTTERS[vp];
  const contentWidth = getViewportContentWidth(vp);
  const contentLeft = getViewportContentLeft(vp);
  const width = Math.min(
    placement
      ? getResponsiveWidth(element.type, placement.width, placement.sourceViewport, vp)
      : element.width,
    cw - 2 * pad,
  );
  const topLevelElements = existingElements.filter(
    (el) =>
      !existingElements.some((parent) => parent.children?.includes(el.id)),
  );
  const bottomY = topLevelElements.reduce(
    (max, el) => Math.max(max, el.y + el.height),
    0,
  );
  const maxContentX = contentLeft + Math.max(0, contentWidth - width);
  const x = FULL_BLEED_TYPES.has(element.type)
    ? 0
    : placement && placement.sourceViewport === vp
      ? clamp(Math.round(placement.x), contentLeft, maxContentX)
      : contentLeft + Math.round((contentWidth - width) / 2);
  const y = placement && placement.sourceViewport === vp
    ? Math.max(pad, Math.round(placement.y))
    : topLevelElements.length > 0 ? bottomY + 16 : pad + 8;
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
    [data, page, pageId, viewport, screenState, patchData],
  );

  const addElementToAll = useCallback(
    (baseElement: MockupElement, placement?: MockupPlacement) => {
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
              const adjusted = adjustForViewport(baseElement, vp, existing, placement);
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
