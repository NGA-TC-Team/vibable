"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { BrowserFrame } from "../device-frames/browser-frame";
import { IPhoneFrame } from "../device-frames/iphone-frame";
import { MockupElementView, getDefaultSize } from "./mockup-element";
import { ElementPalette } from "./element-palette";
import { ViewportTabs, VIEWPORT_WIDTHS, type Viewport } from "./viewport-tabs";
import type { MockupElement, MockupElementType, ProjectType, ScreenPage } from "@/types/phases";

interface MockupCanvasProps {
  page: ScreenPage;
  projectType: ProjectType;
  viewport: Viewport;
  onViewportChange: (v: Viewport) => void;
  onMockupChange: (elements: MockupElement[]) => void;
}

export function MockupCanvas({
  page,
  projectType,
  viewport,
  onViewportChange,
  onMockupChange,
}: MockupCanvasProps) {
  const elements = useMemo(() => page.mockup?.[viewport] ?? [], [page.mockup, viewport]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const canvasWidth = VIEWPORT_WIDTHS[viewport];
  const canvasHeight = projectType === "mobile" || viewport === "mobile" ? 812 : 600;
  const scale = viewport === "desktop" ? 0.55 : 1;

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over, delta } = event;
      if (!over) return;

      const data = active.data.current;

      if (data?.source === "palette") {
        const type = data.type as MockupElementType;
        const size = getDefaultSize(type);
        const canvasRect = canvasRef.current?.getBoundingClientRect();

        let x = 20;
        let y = 20;

        if (canvasRect && event.activatorEvent instanceof PointerEvent) {
          const clientX = event.activatorEvent.clientX + delta.x;
          const clientY = event.activatorEvent.clientY + delta.y;
          x = Math.max(0, Math.round((clientX - canvasRect.left) / scale));
          y = Math.max(0, Math.round((clientY - canvasRect.top) / scale));
        }

        const newEl: MockupElement = {
          id: crypto.randomUUID(),
          type,
          x,
          y,
          width: size.width,
          height: size.height,
          props: {},
        };
        onMockupChange([...elements, newEl]);
        setSelectedId(newEl.id);
        return;
      }

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
    },
    [elements, onMockupChange, scale],
  );

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
  }, [selectedId, elements, onMockupChange]);

  const { setNodeRef: setDroppableRef } = useDroppable({ id: "mockup-canvas" });

  const canvasContent = (
    <div
      ref={(node) => {
        setDroppableRef(node);
        (canvasRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className="relative bg-background"
      style={{ width: canvasWidth, height: canvasHeight }}
      onClick={() => setSelectedId(null)}
    >
      {elements.map((el) => (
        <DraggableElement key={el.id} element={el}>
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
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-3">
        <aside className="w-36 shrink-0 overflow-y-auto border-r">
          <ElementPalette />
        </aside>
        <div className="flex flex-1 flex-col gap-3 overflow-auto">
          <div className="flex items-center gap-3">
            <ViewportTabs
              value={viewport}
              onChange={onViewportChange}
              projectType={projectType}
            />
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto p-4">
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
    </DndContext>
  );
}

function DraggableElement({
  element,
  children,
}: {
  element: MockupElement;
  children: React.ReactNode;
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
      style={{
        position: "absolute",
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      {children}
    </div>
  );
}
