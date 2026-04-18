"use client";

import { useEffect } from "react";
import { useIdeaNoteStore, type ActiveTool } from "@/services/store/idea-note-store";
import type { ShapeKind } from "@/types/idea-note";

// 업계 표준(Figma/FigJam/Miro/Excalidraw)에 맞춘 단축키
// - V: select/move
// - N: sticky note
// - T: text
// - L: line/connector
// - P: pen (형광펜)
// - R: rectangle (shape)
// - O: ellipse (shape)
// - I: image
// - F: file
// - B: board (드릴다운)
// - C: column
// - D: to-do (do list)
// - S: shape (현재 선택된 도형으로)
// - K: table (grid)
const TOOL_BY_KEY: Record<string, ActiveTool> = {
  v: "select",
  n: "note",
  t: "text",
  l: "line",
  p: "draw",
  d: "todo",
  i: "image",
  f: "file",
  b: "board",
  c: "column",
  s: "shape",
  k: "table",
};

const SHAPE_BY_KEY: Record<string, ShapeKind> = {
  r: "rect",
  o: "ellipse",
};

function isEditingText(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  if (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  ) {
    return true;
  }
  return false;
}

export function useIdeaNoteShortcuts() {
  const setActiveTool = useIdeaNoteStore((s) => s.setActiveTool);
  const setActiveShapeKind = useIdeaNoteStore((s) => s.setActiveShapeKind);
  const selectedNodeIds = useIdeaNoteStore((s) => s.selectedNodeIds);
  const selectedEdgeIds = useIdeaNoteStore((s) => s.selectedEdgeIds);
  const removeNodes = useIdeaNoteStore((s) => s.removeNodes);
  const removeEdges = useIdeaNoteStore((s) => s.removeEdges);
  const undo = useIdeaNoteStore((s) => s.undo);
  const redo = useIdeaNoteStore((s) => s.redo);
  const commitHistory = useIdeaNoteStore((s) => s.commitHistory);
  const clearSelection = useIdeaNoteStore((s) => s.clearSelection);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isEditingText(e.target)) return;

      const mod = e.metaKey || e.ctrlKey;

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (
        (mod && e.key.toLowerCase() === "y") ||
        (mod && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === "Escape") {
        clearSelection();
        setActiveTool("select");
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeIds.length === 0 && selectedEdgeIds.length === 0) return;
        e.preventDefault();
        commitHistory();
        if (selectedNodeIds.length) removeNodes(selectedNodeIds);
        if (selectedEdgeIds.length) removeEdges(selectedEdgeIds);
        return;
      }

      if (!mod && !e.shiftKey && !e.altKey) {
        const key = e.key.toLowerCase();
        // 도형 단축키가 먼저 — R/O는 shape 툴 + 해당 도형 프리셋
        const shape = SHAPE_BY_KEY[key];
        if (shape) {
          e.preventDefault();
          setActiveShapeKind(shape);
          setActiveTool("shape");
          return;
        }
        const tool = TOOL_BY_KEY[key];
        if (tool) {
          e.preventDefault();
          setActiveTool(tool);
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    setActiveTool,
    setActiveShapeKind,
    selectedNodeIds,
    selectedEdgeIds,
    removeNodes,
    removeEdges,
    undo,
    redo,
    commitHistory,
    clearSelection,
  ]);
}
