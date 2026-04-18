import { describe, expect, it } from "vitest";
import {
  createEmptyBoard,
  createOnboardingBoard,
  createNodeOfKind,
} from "@/lib/idea-note/defaults";

describe("createEmptyBoard", () => {
  it("creates a root board by default", () => {
    const board = createEmptyBoard("p1", "Test");
    expect(board.parentBoardId).toBeNull();
    expect(board.projectId).toBe("p1");
    expect(board.name).toBe("Test");
    expect(board.nodes).toEqual([]);
    expect(board.edges).toEqual([]);
    expect(board.viewport.zoom).toBe(1);
  });

  it("supports nesting via parentBoardId", () => {
    const board = createEmptyBoard("p1", "Child", "root-board");
    expect(board.parentBoardId).toBe("root-board");
  });
});

describe("createOnboardingBoard", () => {
  it("seeds welcome sample nodes", () => {
    const board = createOnboardingBoard("p2", "My Project");
    expect(board.nodes.length).toBeGreaterThanOrEqual(3);
    expect(board.nodes.every((n) => n.onboardingSample === true)).toBe(true);
    expect(board.name).toContain("My Project");
  });
});

describe("createNodeOfKind", () => {
  it("returns a note with accent color", () => {
    const node = createNodeOfKind("note", { x: 0, y: 0 });
    expect(node.type).toBe("note");
    if (node.type === "note") {
      expect(node.data.accentColor).toBeTruthy();
    }
  });

  it("handles all MVP kinds", () => {
    const kinds = [
      "note",
      "link",
      "todo",
      "column",
      "table",
      "image",
      "video",
      "file",
      "swatch",
      "text",
      "board",
      "frame",
      "shape",
      "drawing",
    ] as const;
    for (const k of kinds) {
      const n = createNodeOfKind(k, { x: 0, y: 0 });
      expect(n.type).toBe(k);
      expect(n.size.width).toBeGreaterThan(0);
      expect(n.size.height).toBeGreaterThan(0);
    }
  });
});
