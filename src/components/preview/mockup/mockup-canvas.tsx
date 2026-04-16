"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  type Modifier,
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEditorStore } from "@/services/store/editor-store";
import { LAYOUT_TYPES } from "@/lib/element-prop-schemas";
import {
  getViewportContentLeft,
  getViewportContentWidth,
  type MockupPlacement,
} from "@/hooks/use-mockup.hook";
import type { MockupElement, MockupElementType, ProjectType, ScreenPage, ScreenState } from "@/types/phases";

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
}

type DragAnchor = {
  x: number;
  y: number;
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
  if (!(event.activatorEvent instanceof PointerEvent)) {
    return null;
  }

  return {
    clientX: event.activatorEvent.clientX + event.delta.x,
    clientY: event.activatorEvent.clientY + event.delta.y,
  };
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
  const [dragAnchor, setDragAnchor] = useState<DragAnchor | null>(null);
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

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const draggedId = event.active.id as string;

    if (!selectedIds.includes(draggedId)) {
      setSingleSelectedId(draggedId);
    }

    const data = event.active.data.current;
    const draggedElement = elements.find((element) => element.id === draggedId);
    if (data?.source === "palette") {
      const type = data.type as MockupElementType;
      const size = getDefaultSize(type);

      setDragAnchor({
        x: Math.round((size.width * scale) / 2),
        y: Math.round((size.height * scale) / 2),
      });
      return;
    }

    const sourceRect = event.active.rect.current.initial;
    const previewWidth = (draggedElement?.width ?? sourceRect?.width ?? 40) * scale;
    const previewHeight = (draggedElement?.height ?? sourceRect?.height ?? 40) * scale;

    setDragAnchor({
      x: Math.round(previewWidth / 2),
      y: Math.round(previewHeight / 2),
    });
  }, [elements, scale, selectedIds, setSingleSelectedId]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    setIsOverCanvas(overId === "mockup-canvas");

    if (overId && overId !== "mockup-canvas") {
      const overElement = elements.find((el) => el.id === overId);
      if (overElement && LAYOUT_TYPES.has(overElement.type)) {
        setOverContainerId(overId);
        setTopLevelInsertIndex(null);
        return;
      }
    }
    setOverContainerId(null);
    if (
      overId === "mockup-canvas" &&
      isDesktopFlowViewport &&
      event.active.data.current?.source === "palette"
    ) {
      const pointer = getDragOverCoordinates(event);
      const point = pointer ? getCanvasPoint(pointer.clientX, pointer.clientY) : null;
      setTopLevelInsertIndex(
        point ? getTopLevelInsertIndex(topLevelElements, point.x) : topLevelElements.length,
      );
      return;
    }

    setTopLevelInsertIndex(null);
  }, [elements, getCanvasPoint, isDesktopFlowViewport, topLevelElements]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const pointer = getPointerCoordinates(event);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const didDropInsideCanvas =
      over?.id === "mockup-canvas" || isOverCanvas || isPointInsideRect(pointer, canvasRect);

    const droppedOnContainerId = overContainerId;

    setActiveId(null);
    setIsOverCanvas(false);
    setOverContainerId(null);
    setTopLevelInsertIndex(null);
    setDragAnchor(null);

    const data = active.data.current;

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
      } else {
        const anchorX = dragAnchor?.x ?? Math.round((size.width * scale) / 2);
        const anchorY = dragAnchor?.y ?? Math.round((size.height * scale) / 2);
        const logicalX = canvasRect
          ? Math.round((pointer!.clientX - canvasRect.left - anchorX) / scale)
          : 0;
        const logicalY = canvasRect
          ? Math.round((pointer!.clientY - canvasRect.top - anchorY) / scale)
          : 0;
        const centeredX = contentLeft + Math.round((contentWidth - size.width) / 2);
        const boundedX = FULL_BLEED_TYPES.has(type)
          ? 0
          : viewport === "mobile"
            ? centeredX
            : clamp(logicalX, contentLeft, Math.max(contentLeft, maxContentX - size.width));
        const placement: MockupPlacement = {
          sourceViewport: viewport,
          x: boundedX,
          y: Math.max(0, logicalY),
          width: size.width,
          insertIndex: isDesktopFlowViewport ? topLevelInsertIndex ?? topLevelElements.length : undefined,
        };

        onAddElement(newEl, placement);
        setSingleSelectedId(newEl.id);
      }
      return;
    }

    if (!over) return;

    const elId = active.id as string;
    const activeElement = elements.find((element) => element.id === elId);
    if (!activeElement) return;

    const anchorX = dragAnchor?.x ?? Math.round((activeElement.width * scale) / 2);
    const anchorY = dragAnchor?.y ?? Math.round((activeElement.height * scale) / 2);
    const logicalX = pointer && canvasRect
      ? Math.round((pointer.clientX - canvasRect.left - anchorX) / scale)
      : Math.round(activeElement.x + delta.x / scale);
    const logicalY = pointer && canvasRect
      ? Math.round((pointer.clientY - canvasRect.top - anchorY) / scale)
      : Math.round(activeElement.y + delta.y / scale);

    const updated = elements.map((el) =>
      el.id === elId
        ? {
            ...el,
            x: FULL_BLEED_TYPES.has(el.type)
              ? 0
              : clamp(
                  logicalX,
                  contentLeft,
                  Math.max(contentLeft, maxContentX - el.width),
                ),
            y: Math.max(0, logicalY),
          }
        : el,
    );
    onMockupChange(updated);
  };

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setIsOverCanvas(false);
    setOverContainerId(null);
    setTopLevelInsertIndex(null);
    setDragAnchor(null);
  }, []);

  useEffect(() => {
    if (!activeId) return;

    const previousCursor = document.documentElement.style.cursor;
    document.documentElement.style.cursor = "grabbing";

    return () => {
      document.documentElement.style.cursor = previousCursor;
    };
  }, [activeId]);

  const overlayModifiers = useMemo<Modifier[]>(
    () =>
      dragAnchor
        ? [
            ({ transform }) => ({
              ...transform,
              x: transform.x - dragAnchor.x,
              y: transform.y - dragAnchor.y,
            }),
          ]
        : [],
    [dragAnchor],
  );

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
      <DragOverlay
        modifiers={overlayModifiers}
        dropAnimation={{ duration: 200, easing: "ease-out" }}
      >
        {activeId ? <GhostPreview id={activeId} elements={elements} scale={scale} /> : null}
      </DragOverlay>
    </DndContext>
  );
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

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
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
