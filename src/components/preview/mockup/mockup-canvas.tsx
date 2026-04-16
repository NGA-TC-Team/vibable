"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { BrowserFrame } from "../device-frames/browser-frame";
import { IPhoneFrame } from "../device-frames/iphone-frame";
import { MockupElementView, getDefaultSize, GhostPreview } from "./mockup-element";
import { ElementPalette } from "./element-palette";
import { ScreenLinkGroup, type LinkedScreenOption } from "./screen-link-group";
import { ViewportTabs, VIEWPORT_WIDTHS, type Viewport } from "./viewport-tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEditorStore } from "@/services/store/editor-store";
import { LAYOUT_TYPES } from "@/lib/element-prop-schemas";
import type { MockupElement, MockupElementType, ProjectType, ScreenPage, ScreenState } from "@/types/phases";

interface MockupCanvasProps {
  page: ScreenPage;
  projectType: ProjectType;
  viewport: Viewport;
  inLinks?: LinkedScreenOption[];
  outLinks?: LinkedScreenOption[];
  onNavigateToPage?: (pageId: string) => void;
  onViewportChange: (v: Viewport) => void;
  onMockupChange: (elements: MockupElement[]) => void;
  onAddElement: (element: MockupElement) => void;
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

export function MockupCanvas({
  page,
  projectType,
  viewport,
  inLinks = [],
  outLinks = [],
  onNavigateToPage,
  onViewportChange,
  onMockupChange,
  onAddElement,
}: MockupCanvasProps) {
  const activeScreenState = useEditorStore((s) => s.activeScreenState);
  const setActiveScreenState = useEditorStore((s) => s.setActiveScreenState);
  const selectedId = useEditorStore((s) => s.selectedMockupElementId);
  const setSelectedId = useEditorStore((s) => s.setSelectedMockupElementId);

  const elements = useMemo(() => {
    const byState = page.mockupByState?.[activeScreenState]?.[viewport];
    if (byState) return byState;
    if (activeScreenState === "idle") return page.mockup?.[viewport] ?? [];
    return [];
  }, [page.mockup, page.mockupByState, activeScreenState, viewport]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);
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
  const canvasHeight = projectType === "mobile" || viewport === "mobile" ? 812 : 600;

  useEffect(() => {
    if (!containerRef.current || viewport !== "desktop") return;
    const containerWidth = containerRef.current.clientWidth - 32;
    const newScale = Math.min(1, containerWidth / canvasWidth);
    setComputedScale(newScale);
  }, [viewport, canvasWidth]);

  const scale = viewport === "desktop" ? computedScale : 1;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    setIsOverCanvas(overId === "mockup-canvas");

    if (overId && overId !== "mockup-canvas") {
      const overElement = elements.find((el) => el.id === overId);
      if (overElement && LAYOUT_TYPES.has(overElement.type)) {
        setOverContainerId(overId);
        return;
      }
    }
    setOverContainerId(null);
  }, [elements]);

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
        setSelectedId(newEl.id);
      } else {
        onAddElement(newEl);
        setSelectedId(newEl.id);
      }
      return;
    }

    if (!over) return;

    const elId = active.id as string;
    const updated = elements.map((el) =>
      el.id === elId
        ? {
            ...el,
            x: Math.max(0, Math.round(el.x + delta.x / scale)),
            y: Math.max(0, Math.round(el.y + delta.y / scale)),
          }
        : el,
    );
    onMockupChange(updated);
  };

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
    setIsOverCanvas(false);
    setOverContainerId(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        onMockupChange(elements.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, elements, onMockupChange, setSelectedId]);

  const { setNodeRef: setDroppableRef } = useDroppable({ id: "mockup-canvas" });

  const topLevelElements = useMemo(() => getTopLevelElements(elements), [elements]);

  const canvasContent = (
    <div
      ref={(node) => {
        setDroppableRef(node);
        (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={`relative bg-background transition-colors ${
        isOverCanvas && !overContainerId ? "ring-2 ring-primary ring-dashed" : ""
      }`}
      style={{ width: canvasWidth, height: canvasHeight }}
      onClick={() => setSelectedId(null)}
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
              selected={el.id === selectedId}
              selectedId={selectedId}
              onSelect={() => setSelectedId(el.id)}
              onSelectId={setSelectedId}
            />
          </DroppableLayout>
        </DraggableElement>
      ))}
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
                  >
                    {(Object.entries(STATE_LABELS) as [ScreenState, string][]).map(([k, label]) => (
                      <ToggleGroupItem key={k} value={k} className="text-xs">
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
            className="flex flex-1 items-start justify-center overflow-auto overscroll-contain px-4 pb-4 pt-6"
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
              }}
            >
              {framedContent}
            </div>
          </div>
        </div>
      </div>
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease-out" }}>
        {activeId ? <GhostPreview id={activeId} elements={elements} /> : null}
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
      className={isDragActive ? "transition-transform duration-200" : ""}
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
