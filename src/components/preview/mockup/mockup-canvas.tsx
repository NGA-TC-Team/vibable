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

export function MockupCanvas({
  page,
  projectType,
  viewport,
  inLinks = [],
  outLinks = [],
  onNavigateToPage,
  onViewportChange,
  onMockupChange,
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
    // #region agent log
    fetch("http://127.0.0.1:7617/ingest/1fd985d8-4c37-41b9-98d6-89f96a15ab8e", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e09744" }, body: JSON.stringify({ sessionId: "e09744", runId: "initial", hypothesisId: "H1", location: "mockup-canvas.tsx:83", message: "drag start", data: { activeId: String(event.active.id), source: event.active.data.current?.source ?? null, type: event.active.data.current?.type ?? null }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // #region agent log
    fetch("http://127.0.0.1:7617/ingest/1fd985d8-4c37-41b9-98d6-89f96a15ab8e", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e09744" }, body: JSON.stringify({ sessionId: "e09744", runId: "initial", hypothesisId: "H2", location: "mockup-canvas.tsx:88", message: "drag over", data: { activeId: String(event.active.id), overId: event.over?.id ? String(event.over.id) : null, activeSource: event.active.data.current?.source ?? null }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    setIsOverCanvas(event.over?.id === "mockup-canvas");
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    const pointer = getPointerCoordinates(event);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const didDropInsideCanvas =
      over?.id === "mockup-canvas" || isOverCanvas || isPointInsideRect(pointer, canvasRect);

    // #region agent log
    fetch("http://127.0.0.1:7617/ingest/1fd985d8-4c37-41b9-98d6-89f96a15ab8e", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e09744" }, body: JSON.stringify({ sessionId: "e09744", runId: "initial", hypothesisId: "H3", location: "mockup-canvas.tsx:95", message: "drag end", data: { activeId: String(active.id), activeSource: active.data.current?.source ?? null, activeType: active.data.current?.type ?? null, overId: over?.id ? String(over.id) : null, isOverCanvas, didDropInsideCanvas, delta: { x: delta.x, y: delta.y }, scale }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
    setActiveId(null);
    setIsOverCanvas(false);

    const data = active.data.current;

    if (data?.source === "palette") {
      if (!didDropInsideCanvas) return;

      const type = data.type as MockupElementType;
      const size = getDefaultSize(type);

      let x = 20;
      let y = 20;

      if (canvasRect && pointer) {
        x = Math.round((pointer.clientX - canvasRect.left) / scale);
        y = Math.round((pointer.clientY - canvasRect.top) / scale);
      }

      x = Math.max(0, Math.min(x, canvasWidth - size.width));
      y = Math.max(0, Math.min(y, canvasHeight - size.height));

      const newEl: MockupElement = {
        id: crypto.randomUUID(),
        type,
        x,
        y,
        width: size.width,
        height: size.height,
        props: {},
      };
      // #region agent log
      fetch("http://127.0.0.1:7617/ingest/1fd985d8-4c37-41b9-98d6-89f96a15ab8e", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e09744" }, body: JSON.stringify({ sessionId: "e09744", runId: "initial", hypothesisId: "H4", location: "mockup-canvas.tsx:126", message: "create palette element", data: { pageId: page.id, viewport, screenState: activeScreenState, type, x, y, nextLength: elements.length + 1 }, timestamp: Date.now() }) }).catch(() => {});
      // #endregion
      onMockupChange([...elements, newEl]);
      setSelectedId(newEl.id);
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

  useEffect(() => {
    // #region agent log
    fetch("http://127.0.0.1:7617/ingest/1fd985d8-4c37-41b9-98d6-89f96a15ab8e", { method: "POST", headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e09744" }, body: JSON.stringify({ sessionId: "e09744", runId: "initial", hypothesisId: "H5", location: "mockup-canvas.tsx:166", message: "canvas render snapshot", data: { pageId: page.id, viewport, screenState: activeScreenState, elementCount: elements.length, projectType }, timestamp: Date.now() }) }).catch(() => {});
    // #endregion
  }, [activeScreenState, elements.length, page.id, projectType, viewport]);

  const { setNodeRef: setDroppableRef } = useDroppable({ id: "mockup-canvas" });

  const canvasContent = (
    <div
      ref={(node) => {
        setDroppableRef(node);
        (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={`relative bg-background transition-colors ${
        isOverCanvas ? "ring-2 ring-primary ring-dashed" : ""
      }`}
      style={{ width: canvasWidth, height: canvasHeight }}
      onClick={() => setSelectedId(null)}
    >
      {elements.map((el) => (
        <DraggableElement key={el.id} element={el} isDragActive={activeId === el.id}>
          <MockupElementView
            element={el}
            selected={el.id === selectedId}
            onSelect={() => setSelectedId(el.id)}
          />
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
