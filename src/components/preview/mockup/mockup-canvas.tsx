"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  useDraggable,
  useDroppable,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { BrowserFrame, BROWSER_FRAME_HORIZONTAL_PADDING } from "../device-frames/browser-frame";
import { IPhoneFrame } from "../device-frames/iphone-frame";
import { MockupElementView, getDefaultSize, GhostPreview } from "./mockup-element";
import { ElementPalette } from "./element-palette";
import { ScreenLinkGroup, type LinkedScreenOption } from "./screen-link-group";
import { ViewportTabs, VIEWPORT_WIDTHS, type Viewport } from "./viewport-tabs";
import { ContainerWidthPicker } from "./container-width-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEditorStore } from "@/services/store/editor-store";
import { LAYOUT_TYPES } from "@/lib/element-prop-schemas";
import {
  getViewportContentLeft,
  getViewportContentWidth,
  type MockupPlacement,
} from "@/hooks/use-mockup.hook";
import type { MockupElement, MockupElementType, ProjectType, ScreenPage, ScreenState } from "@/types/phases";

/** 커서와 ghost 좌상단 사이 간격(px). 너무 작으면 커서가 ghost 안쪽에 파묻힌다. */
const GHOST_CURSOR_MARGIN = 10;

interface MockupCanvasProps {
  page: ScreenPage;
  /** Normalized mockup list (same pipeline as `useMockup().elements`). */
  elements: MockupElement[];
  projectType: ProjectType;
  viewport: Viewport;
  inLinks?: LinkedScreenOption[];
  outLinks?: LinkedScreenOption[];
  onNavigateToPage?: (pageId: string) => void;
  onViewportChange: (v: Viewport) => void;
  onMockupChange: (elements: MockupElement[]) => void;
  onAddElement: (element: MockupElement, placement?: MockupPlacement) => void;
  onRemoveElements?: (ids: string[]) => void;
  /** 목업 요소를 더블클릭할 때 디테일 뷰(뒷면)의 해당 요소로 포커스를 보낸다. */
  onRequestFocusInDetail?: (id: string) => void;
  /** 캔버스 내부 드래그로 요소 순서를 바꿨을 때 모든 viewport/state에 동기 반영한다. */
  onReorderElements?: (orderedIds: string[]) => void;
  /**
   * 외부(디테일 뷰)에서 포커스를 요청하면 캔버스가 해당 요소로 scrollIntoView.
   * {id, serial} 쌍으로 동일 id 재요청도 강제 실행하기 위해 serial을 사용한다.
   */
  focusRequest?: { id: string; serial: number } | null;
}

type PointerPosition = {
  clientX: number;
  clientY: number;
};

type CanvasPoint = {
  x: number;
  y: number;
};

type SelectionRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getPointerCoordinates(event: DragEndEvent) {
  if (event.activatorEvent instanceof PointerEvent) {
    return {
      clientX: event.activatorEvent.clientX + event.delta.x,
      clientY: event.activatorEvent.clientY + event.delta.y,
    };
  }

  const translatedRect = event.active.rect.current.translated;
  if (translatedRect) {
    return {
      clientX: translatedRect.left + translatedRect.width / 2,
      clientY: translatedRect.top + translatedRect.height / 2,
    };
  }

  return null;
}

function getDragOverCoordinates(event: DragOverEvent) {
  const translatedRect = event.active.rect.current.translated;
  if (translatedRect) {
    return {
      clientX: translatedRect.left + translatedRect.width / 2,
      clientY: translatedRect.top + translatedRect.height / 2,
    };
  }

  const initialRect = event.active.rect.current.initial;
  if (!initialRect) return null;

  return {
    clientX: initialRect.left + initialRect.width / 2,
    clientY: initialRect.top + initialRect.height / 2,
  };
}

function isPointInsideRect(
  point: { clientX: number; clientY: number } | null,
  rect: DOMRect | undefined,
) {
  if (!point || !rect) return false;

  return (
    point.clientX >= rect.left &&
    point.clientX <= rect.right &&
    point.clientY >= rect.top &&
    point.clientY <= rect.bottom
  );
}

function getTopLevelElements(elements: MockupElement[]): MockupElement[] {
  const childIds = new Set(elements.flatMap((el) => el.children ?? []));
  return elements.filter((el) => !childIds.has(el.id));
}

function getTopLevelInsertIndex(elements: MockupElement[], x: number) {
  const ordered = [...elements].sort((a, b) => a.x - b.x);
  const nextIndex = ordered.findIndex((element) => x < element.x + element.width / 2);
  return nextIndex === -1 ? ordered.length : nextIndex;
}

function getTopLevelInsertIndexVertical(elements: MockupElement[], y: number) {
  const ordered = [...elements].sort((a, b) => a.y - b.y);
  const nextIndex = ordered.findIndex((element) => y < element.y + element.height / 2);
  return nextIndex === -1 ? ordered.length : nextIndex;
}

/**
 * 최상위 요소 순서를 재정렬해 orderedIds 배열을 반환한다.
 * `insertIndex`는 요소 제거 전 기준이므로 현재 위치보다 뒤쪽이면 1 보정한다.
 */
function computeReorderedIds(
  elements: MockupElement[],
  movedId: string,
  insertIndex: number,
): string[] | null {
  const childIds = new Set(elements.flatMap((el) => el.children ?? []));
  const topLevelIds: string[] = [];
  const restIds: string[] = [];
  elements.forEach((el) => {
    if (childIds.has(el.id)) restIds.push(el.id);
    else topLevelIds.push(el.id);
  });
  const fromIdx = topLevelIds.indexOf(movedId);
  if (fromIdx === -1) return null;
  const next = [...topLevelIds];
  next.splice(fromIdx, 1);
  const target = insertIndex > fromIdx ? insertIndex - 1 : insertIndex;
  const clamped = Math.max(0, Math.min(next.length, target));
  next.splice(clamped, 0, movedId);
  if (next.every((id, i) => id === topLevelIds[i])) return null;
  return [...next, ...restIds];
}

function createSelectionRect(start: CanvasPoint, current: CanvasPoint): SelectionRect {
  return {
    left: Math.min(start.x, current.x),
    top: Math.min(start.y, current.y),
    width: Math.abs(current.x - start.x),
    height: Math.abs(current.y - start.y),
  };
}

function intersectsSelection(rect: SelectionRect, element: MockupElement) {
  return !(
    rect.left + rect.width < element.x ||
    element.x + element.width < rect.left ||
    rect.top + rect.height < element.y ||
    element.y + element.height < rect.top
  );
}

const FULL_BLEED_TYPES = new Set<MockupElementType>(["header", "bottomNav"]);

export function MockupCanvas({
  page,
  elements,
  projectType,
  viewport,
  inLinks = [],
  outLinks = [],
  onNavigateToPage,
  onViewportChange,
  onMockupChange,
  onAddElement,
  onRemoveElements,
  onRequestFocusInDetail,
  onReorderElements,
  focusRequest,
}: MockupCanvasProps) {
  const activeScreenState = useEditorStore((s) => s.activeScreenState);
  const setActiveScreenState = useEditorStore((s) => s.setActiveScreenState);
  const selectedIds = useEditorStore((s) => s.selectedMockupElementIds);
  const setSelectedIds = useEditorStore((s) => s.setSelectedMockupElementIds);
  const setSingleSelectedId = useEditorStore((s) => s.setSingleSelectedMockupElementId);
  const toggleSelectedId = useEditorStore((s) => s.toggleSelectedMockupElementId);
  const clearSelectedIds = useEditorStore((s) => s.clearSelectedMockupElements);

  const topLevelElements = useMemo(() => getTopLevelElements(elements), [elements]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeSource, setActiveSource] = useState<"palette" | "canvas" | null>(null);
  const [pointerPos, setPointerPos] = useState<PointerPosition | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);
  const [topLevelInsertIndex, setTopLevelInsertIndex] = useState<number | null>(null);
  const [marqueeStart, setMarqueeStart] = useState<CanvasPoint | null>(null);
  const [selectionRect, setSelectionRect] = useState<SelectionRect | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const STATE_LABELS: Record<ScreenState, string> = {
    idle: "Idle",
    loading: "Loading",
    offline: "Offline",
    error: "Error",
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const [computedScale, setComputedScale] = useState(0.55);

  const canvasWidth = VIEWPORT_WIDTHS[viewport];
  const contentLeft = getViewportContentLeft(viewport);
  const contentWidth = getViewportContentWidth(viewport);
  const maxContentX = contentLeft + contentWidth;
  const isDesktopFlowViewport = projectType !== "mobile" && viewport === "desktop";
  const minCanvasHeight = projectType === "mobile" || viewport === "mobile" ? 812 : 600;
  const canvasBottomPadding = projectType === "mobile"
    ? 40
    : viewport === "desktop"
      ? 96
      : 72;
  const contentBottom = topLevelElements.reduce(
    (max, element) => Math.max(max, element.y + element.height),
    0,
  );
  const canvasHeight = Math.max(minCanvasHeight, contentBottom + canvasBottomPadding);
  const displayWidth = projectType === "mobile"
    ? canvasWidth
    : canvasWidth + BROWSER_FRAME_HORIZONTAL_PADDING * 2;

  useEffect(() => {
    if (!containerRef.current) return;
    if (viewport !== "desktop") return;

    const containerNode = containerRef.current;
    const updateScale = () => {
      const containerWidth = Math.max(containerNode.clientWidth - 48, 320);
      setComputedScale(Math.min(1, containerWidth / displayWidth));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(containerNode);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [displayWidth, viewport]);

  const scale = viewport === "desktop" ? computedScale : 1;

  const getCanvasPoint = useCallback((clientX: number, clientY: number): CanvasPoint | null => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;

    return {
      x: Math.round(((clientX - rect.left) / rect.width) * canvasWidth),
      y: Math.round(((clientY - rect.top) / rect.height) * canvasHeight),
    };
  }, [canvasHeight, canvasWidth]);

  const handleElementSelect = useCallback((
    elementId: string,
    event: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (event.metaKey || event.ctrlKey) {
      toggleSelectedId(elementId);
      return;
    }

    setSingleSelectedId(elementId);
  }, [setSingleSelectedId, toggleSelectedId]);

  const handleFocusDetail = useCallback(
    (elementId: string) => {
      setSingleSelectedId(elementId);
      onRequestFocusInDetail?.(elementId);
    },
    [onRequestFocusInDetail, setSingleSelectedId],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const draggedId = event.active.id as string;

    if (!selectedIds.includes(draggedId)) {
      setSingleSelectedId(draggedId);
    }

    const data = event.active.data.current;
    const source: "palette" | "canvas" = data?.source === "palette" ? "palette" : "canvas";
    setActiveSource(source);

    // 드래그 시작 좌표는 activator 이벤트에서 곧바로 얻는다 — 이후 pointermove로 갱신.
    if (event.activatorEvent instanceof PointerEvent) {
      setPointerPos({
        clientX: event.activatorEvent.clientX,
        clientY: event.activatorEvent.clientY,
      });
    }
  }, [selectedIds, setSingleSelectedId]);

  // 드래그 도중 실제 커서 위치를 계속 추적 — 커스텀 ghost 오버레이를 커서에 고정시키는 데 쓴다.
  useEffect(() => {
    if (!activeId) return;
    const onMove = (event: PointerEvent) => {
      setPointerPos({ clientX: event.clientX, clientY: event.clientY });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [activeId]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;

    // 레이아웃 컨테이너 위에 있으면 해당 컨테이너 drop을 우선.
    if (overId && overId !== "mockup-canvas") {
      const overElement = elements.find((el) => el.id === overId);
      if (overElement && LAYOUT_TYPES.has(overElement.type)) {
        setOverContainerId(overId);
        setTopLevelInsertIndex(null);
        setIsOverCanvas(false);
        return;
      }
    }
    setOverContainerId(null);

    // dnd-kit의 `over`가 기존 요소에 가려져 null이 될 수 있다. 커서 위치로 직접 판단해야
    // 요소 위에 있을 때도 insertion indicator를 계산할 수 있다.
    const pointer = getDragOverCoordinates(event);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const cursorInsideCanvas = isPointInsideRect(pointer, canvasRect);
    setIsOverCanvas(cursorInsideCanvas);

    if (!cursorInsideCanvas || !pointer) {
      setTopLevelInsertIndex(null);
      return;
    }

    const point = getCanvasPoint(pointer.clientX, pointer.clientY);
    if (!point) {
      setTopLevelInsertIndex(topLevelElements.length);
      return;
    }

    setTopLevelInsertIndex(
      isDesktopFlowViewport
        ? getTopLevelInsertIndex(topLevelElements, point.x)
        : getTopLevelInsertIndexVertical(topLevelElements, point.y),
    );
  }, [elements, getCanvasPoint, isDesktopFlowViewport, topLevelElements]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const pointer = pointerPos ?? getPointerCoordinates(event);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const didDropInsideCanvas =
      over?.id === "mockup-canvas" || isOverCanvas || isPointInsideRect(pointer, canvasRect);

    const droppedOnContainerId = overContainerId;
    const capturedInsertIndex = topLevelInsertIndex;

    setActiveId(null);
    setActiveSource(null);
    setIsOverCanvas(false);
    setOverContainerId(null);
    setTopLevelInsertIndex(null);
    setPointerPos(null);

    const data = active.data.current;

    // 1) 팔레트 → 캔버스 드롭: 새 요소 추가.
    if (data?.source === "palette") {
      if (!didDropInsideCanvas && !droppedOnContainerId) return;

      const type = data.type as MockupElementType;
      const size = getDefaultSize(type);

      const newEl: MockupElement = {
        id: crypto.randomUUID(),
        type,
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        props: {},
      };

      if (droppedOnContainerId) {
        const updated = elements.map((el) =>
          el.id === droppedOnContainerId
            ? { ...el, children: [...(el.children ?? []), newEl.id] }
            : el,
        );
        onMockupChange([...updated, newEl]);
        setSingleSelectedId(newEl.id);
        return;
      }

      // 자동 플로우: 드롭 위치의 insertion index에 맞춰 placement만 전달하고
      // 실제 x/y는 use-mockup.hook의 reflow가 모든 viewport/state별로 정돈한다.
      const placement: MockupPlacement = {
        sourceViewport: viewport,
        x: FULL_BLEED_TYPES.has(type)
          ? 0
          : contentLeft + Math.round((contentWidth - size.width) / 2),
        y: 0,
        width: size.width,
        insertIndex: capturedInsertIndex ?? topLevelElements.length,
      };
      onAddElement(newEl, placement);
      setSingleSelectedId(newEl.id);
      return;
    }

    // 2) 캔버스 내 기존 요소 이동: 순서 재배치만 수행한다.
    const elId = active.id as string;
    const activeElement = elements.find((element) => element.id === elId);
    if (!activeElement) return;

    // 레이아웃 컨테이너로 이동한 경우 해당 컨테이너의 자식으로 편입.
    if (droppedOnContainerId && droppedOnContainerId !== elId) {
      const updated = elements.map((el) => {
        if (el.id === droppedOnContainerId) {
          const existing = el.children ?? [];
          if (existing.includes(elId)) return el;
          return { ...el, children: [...existing, elId] };
        }
        if (el.children?.includes(elId)) {
          return { ...el, children: el.children.filter((cid) => cid !== elId) };
        }
        return el;
      });
      onMockupChange(updated);
      return;
    }

    if (!didDropInsideCanvas) return;

    if (capturedInsertIndex == null || !onReorderElements) return;

    const orderedIds = computeReorderedIds(elements, elId, capturedInsertIndex);
    if (orderedIds) {
      onReorderElements(orderedIds);
    }
  };

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setActiveSource(null);
    setIsOverCanvas(false);
    setOverContainerId(null);
    setTopLevelInsertIndex(null);
    setPointerPos(null);
  }, []);

  useEffect(() => {
    if (!activeId) return;

    const previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "grabbing";

    return () => {
      document.documentElement.style.cursor = previousCursor;
    };
  }, [activeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedIds.length > 0) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();

        if (onRemoveElements) {
          onRemoveElements(selectedIds);
          return;
        }

        onMockupChange(elements.filter((el) => !selectedIds.includes(el.id)));
        clearSelectedIds();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [clearSelectedIds, elements, onMockupChange, onRemoveElements, selectedIds]);

  useEffect(() => {
    if (selectedIds.length === 0) return;

    const elementIds = new Set(elements.map((element) => element.id));
    const visibleSelections = selectedIds.filter((id) => elementIds.has(id));

    if (visibleSelections.length !== selectedIds.length) {
      setSelectedIds(visibleSelections);
    }
  }, [elements, selectedIds, setSelectedIds]);

  // 디테일뷰에서 더블클릭으로 포커스 요청이 오면 flip 애니메이션이 끝난 뒤 scrollIntoView.
  useEffect(() => {
    if (!focusRequest) return;
    const timer = window.setTimeout(() => {
      const node = canvasRef.current?.querySelector<HTMLElement>(
        `[data-mockup-element-id="${focusRequest.id}"]`,
      );
      node?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [focusRequest]);

  const { setNodeRef: setDroppableRef } = useDroppable({ id: "mockup-canvas" });

  const selectedCount = selectedIds.length;
  const desktopInsertIndicatorX = useMemo(() => {
    if (!isDesktopFlowViewport || topLevelInsertIndex == null) return null;
    const orderedTopLevel = [...topLevelElements].sort((a, b) => a.x - b.x);
    if (orderedTopLevel.length === 0) return contentLeft;
    if (topLevelInsertIndex <= 0) {
      return Math.max(contentLeft, orderedTopLevel[0]!.x - 8);
    }
    if (topLevelInsertIndex >= orderedTopLevel.length) {
      const last = orderedTopLevel[orderedTopLevel.length - 1]!;
      return Math.min(maxContentX, last.x + last.width + 8);
    }

    return clamp(orderedTopLevel[topLevelInsertIndex]!.x - 8, contentLeft, maxContentX);
  }, [contentLeft, isDesktopFlowViewport, maxContentX, topLevelElements, topLevelInsertIndex]);

  const verticalInsertIndicatorY = useMemo(() => {
    if (isDesktopFlowViewport || topLevelInsertIndex == null) return null;
    const orderedTopLevel = [...topLevelElements].sort((a, b) => a.y - b.y);
    if (orderedTopLevel.length === 0) return 16;
    if (topLevelInsertIndex <= 0) {
      return Math.max(4, orderedTopLevel[0]!.y - 6);
    }
    if (topLevelInsertIndex >= orderedTopLevel.length) {
      const last = orderedTopLevel[orderedTopLevel.length - 1]!;
      return last.y + last.height + 6;
    }
    return orderedTopLevel[topLevelInsertIndex]!.y - 6;
  }, [isDesktopFlowViewport, topLevelElements, topLevelInsertIndex]);

  const handleCanvasPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || event.target !== event.currentTarget) return;

    const point = getCanvasPoint(event.clientX, event.clientY);
    if (!point) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setMarqueeStart(point);
    setSelectionRect({
      left: point.x,
      top: point.y,
      width: 0,
      height: 0,
    });
  };

  const handleCanvasPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!marqueeStart) return;

    const point = getCanvasPoint(event.clientX, event.clientY);
    if (!point) return;

    setSelectionRect(createSelectionRect(marqueeStart, point));
  };

  const finishMarqueeSelection = (
    event: React.PointerEvent<HTMLDivElement>,
    shouldKeepExisting: boolean,
  ) => {
    if (!marqueeStart) return;

    const point = getCanvasPoint(event.clientX, event.clientY);
    const nextRect = point ? createSelectionRect(marqueeStart, point) : selectionRect;
    const hasDragSelection = Boolean(nextRect && (nextRect.width > 6 || nextRect.height > 6));

    if (hasDragSelection && nextRect) {
      const hitIds = topLevelElements
        .filter((element) => intersectsSelection(nextRect, element))
        .map((element) => element.id);

      setSelectedIds(
        shouldKeepExisting
          ? Array.from(new Set([...selectedIds, ...hitIds]))
          : hitIds,
      );
    } else if (!shouldKeepExisting) {
      clearSelectedIds();
    }

    setMarqueeStart(null);
    setSelectionRect(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const canvasContent = (
    <div
      ref={(node) => {
        setDroppableRef(node);
        (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={`relative bg-background transition-colors ${
        isOverCanvas && !overContainerId ? "ring-2 ring-primary ring-dashed" : ""
      } ${marqueeStart ? "cursor-crosshair" : ""}`}
      style={{ width: canvasWidth, height: canvasHeight }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={(event) =>
        finishMarqueeSelection(event, event.metaKey || event.ctrlKey)
      }
      onPointerCancel={(event) => finishMarqueeSelection(event, false)}
    >
      {topLevelElements.map((el) => (
        <DraggableElement key={el.id} element={el} isDragActive={activeId === el.id}>
          <DroppableLayout
            element={el}
            isOverTarget={overContainerId === el.id}
          >
            <MockupElementView
              element={el}
              allElements={elements}
              selected={selectedIds.includes(el.id)}
              selectedIds={selectedIds}
              onSelect={(event) => handleElementSelect(el.id, event)}
              onSelectId={handleElementSelect}
              onFocusDetail={handleFocusDetail}
            />
          </DroppableLayout>
        </DraggableElement>
      ))}
      {selectionRect ? (
        <div
          className="pointer-events-none absolute rounded-md border border-primary/70 bg-primary/10"
          style={{
            left: selectionRect.left,
            top: selectionRect.top,
            width: selectionRect.width,
            height: selectionRect.height,
          }}
        />
      ) : null}
      {desktopInsertIndicatorX != null ? (
        <div
          className="pointer-events-none absolute bottom-6 top-6 z-20 flex items-start justify-center"
          style={{ left: desktopInsertIndicatorX, width: 0 }}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full border border-blue-400/40 bg-background/90 px-2 py-0.5 text-[10px] font-medium text-blue-600 shadow-sm dark:text-blue-300">
              삽입
            </div>
            <div className="h-full w-0.5 rounded-full bg-blue-500/80 shadow-[0_0_14px_rgba(59,130,246,0.55)]" />
          </div>
        </div>
      ) : null}
      {verticalInsertIndicatorY != null ? (
        <div
          className="pointer-events-none absolute inset-x-4 z-20 flex items-center gap-2"
          style={{ top: verticalInsertIndicatorY, height: 0 }}
        >
          <div className="rounded-full border border-blue-400/40 bg-background/95 px-2 py-0.5 text-[10px] font-medium text-blue-600 shadow-sm dark:text-blue-300">
            삽입
          </div>
          <div className="h-0.5 flex-1 rounded-full bg-blue-500/80 shadow-[0_0_14px_rgba(59,130,246,0.55)]" />
        </div>
      ) : null}
    </div>
  );

  const framedContent =
    projectType === "mobile" ? (
      <IPhoneFrame>{canvasContent}</IPhoneFrame>
    ) : (
      <BrowserFrame url={page.route || "https://example.com"} width={canvasWidth}>
        {canvasContent}
      </BrowserFrame>
    );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-full gap-3 overflow-hidden">
        <aside
          className="w-36 shrink-0 overflow-y-auto border-r py-3 overscroll-contain"
        >
          <ElementPalette activeId={activeId} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-3 overflow-hidden">
          <div className="shrink-0 px-1 pt-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
              <ScreenLinkGroup
                title="In"
                pages={inLinks}
                onNavigate={(pageId) => onNavigateToPage?.(pageId)}
              />
              <div className="flex min-w-0 justify-center">
                <div className="flex items-center justify-center gap-3">
                  <ViewportTabs
                    value={viewport}
                    onChange={onViewportChange}
                    projectType={projectType}
                  />
                  {projectType !== "mobile" ? <div className="h-5 w-px bg-border" /> : null}
                  <ToggleGroup
                    type="single"
                    value={activeScreenState}
                    onValueChange={(v) => v && setActiveScreenState(v as ScreenState)}
                    size="sm"
                    className="rounded-3xl bg-muted/60 p-1"
                  >
                    {(Object.entries(STATE_LABELS) as [ScreenState, string][]).map(([k, label]) => (
                      <ToggleGroupItem
                        key={k}
                        value={k}
                        className="rounded-2xl border border-transparent text-xs data-[state=on]:border-border data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                      >
                        {label}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
              <ScreenLinkGroup
                title="Out"
                pages={outLinks}
                onNavigate={(pageId) => onNavigateToPage?.(pageId)}
                align="right"
              />
            </div>
            <div className="mt-2 flex justify-center">
              <ContainerWidthPicker />
            </div>
          </div>
          <div
            ref={containerRef}
            className="relative flex flex-1 items-start justify-center overflow-auto overscroll-contain px-4 pb-4 pt-6"
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              {framedContent}
            </div>
            <AnimatePresence>
              {selectedCount > 1 ? (
                <motion.div
                  key="selection-count"
                  initial={{ opacity: 0, scale: 0.7, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 6 }}
                  transition={{ duration: 0.16, ease: "easeOut" }}
                  className="pointer-events-none absolute bottom-5 right-5 flex size-9 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white shadow-lg"
                >
                  {selectedCount}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <CursorGhostLayer
        activeId={activeId}
        activeSource={activeSource}
        pointerPos={pointerPos}
        elements={elements}
        scale={scale}
      />
    </DndContext>
  );
}

/**
 * DragOverlay 대신 document level에 fixed 포지션으로 ghost를 고정한다.
 * 커서 위치를 직접 추적하기 때문에 dnd-kit 내부 좌표계와 무관하게
 * ghost 좌상단이 커서에서 `GHOST_CURSOR_MARGIN`px 안쪽에 위치한다.
 */
function CursorGhostLayer({
  activeId,
  activeSource,
  pointerPos,
  elements,
  scale,
}: {
  activeId: string | null;
  activeSource: "palette" | "canvas" | null;
  pointerPos: PointerPosition | null;
  elements: MockupElement[];
  scale: number;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !activeId || !pointerPos) return null;

  // 캔버스에서 이미 추적 중인 요소는 원본이 opacity 0.3으로 남아 이동하므로 별도 ghost 불필요.
  // 다만 팔레트에서 드래그 중인 경우 원본 타일은 제자리에 있고 ghost만 이동해야 한다.
  const node = (
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{
        left: pointerPos.clientX - GHOST_CURSOR_MARGIN,
        top: pointerPos.clientY - GHOST_CURSOR_MARGIN,
      }}
    >
      <GhostPreview
        id={activeId}
        elements={elements}
        scale={activeSource === "canvas" ? scale : 1}
      />
    </div>
  );

  return createPortal(node, document.body);
}

function DroppableLayout({
  element,
  isOverTarget,
  children,
}: {
  element: MockupElement;
  isOverTarget: boolean;
  children: React.ReactNode;
}) {
  const isLayout = LAYOUT_TYPES.has(element.type);
  const { setNodeRef } = useDroppable({
    id: element.id,
    disabled: !isLayout,
  });

  if (!isLayout) return <>{children}</>;

  return (
    <div
      ref={setNodeRef}
      className={`h-full w-full transition-all ${
        isOverTarget
          ? "ring-2 ring-blue-500 bg-blue-50/20 dark:bg-blue-950/20 rounded"
          : ""
      }`}
    >
      {children}
    </div>
  );
}

function DraggableElement({
  element,
  children,
  isDragActive,
}: {
  element: MockupElement;
  children: React.ReactNode;
  isDragActive: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: element.id,
    data: { source: "canvas" },
  });

  // Cmd/Ctrl+클릭을 다중 선택으로 쓰려면 dnd-kit PointerSensor가
  // activation되지 않아야 한다. modifier 키가 눌린 채 pointerdown이 오면
  // capture 단계에서 pointer 이벤트 전파를 끊고, onClick만 남긴다.
  const handleModifierAwareCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.metaKey || e.ctrlKey) {
      e.stopPropagation();
    }
  };

  return (
    <div
      ref={setNodeRef}
      onPointerDownCapture={handleModifierAwareCapture}
      {...listeners}
      {...attributes}
      data-mockup-element-id={element.id}
      className={`touch-none cursor-grab active:cursor-grabbing ${
        isDragActive ? "transition-transform duration-200" : ""
      }`}
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      {children}
    </div>
  );
}
