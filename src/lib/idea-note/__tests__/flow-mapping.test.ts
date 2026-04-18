import { describe, expect, it } from "vitest";
import {
  toFlowNodes,
  toFlowEdges,
  snapPosition,
  snapValue,
} from "@/lib/idea-note/flow-mapping";
import type { IdeaNoteBoard } from "@/types/idea-note";

function board(partial?: Partial<IdeaNoteBoard>): IdeaNoteBoard {
  return {
    id: "b1",
    projectId: "p1",
    parentBoardId: null,
    name: "",
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
    backgroundStyle: "dot",
    createdAt: 0,
    updatedAt: 0,
    ...partial,
  };
}

describe("snapValue / snapPosition", () => {
  it("rounds to grid", () => {
    expect(snapValue(17, 16)).toBe(16);
    expect(snapValue(24, 16)).toBe(32);
  });
  it("passes through with grid 0", () => {
    expect(snapValue(17, 0)).toBe(17);
  });
  it("snaps both axes", () => {
    expect(snapPosition({ x: 17, y: 9 }, 8)).toEqual({ x: 16, y: 8 });
  });
});

describe("toFlowNodes", () => {
  it("maps a note node with size and zIndex", () => {
    const b = board({
      nodes: [
        {
          id: "n1",
          type: "note",
          position: { x: 10, y: 20 },
          size: { width: 200, height: 140 },
          rotation: 0,
          zIndex: 3,
          data: {
            title: "",
            richText: "",
            accentColor: "#000",
            backgroundColor: "#fff",
          },
        },
      ],
    });
    const rf = toFlowNodes(b);
    expect(rf).toHaveLength(1);
    expect(rf[0]).toMatchObject({
      id: "n1",
      type: "note",
      position: { x: 10, y: 20 },
    });
    expect(rf[0].style?.width).toBe(200);
  });
});

describe("toFlowEdges", () => {
  it("drops free-endpoint edges (xyflow cannot render them)", () => {
    const b = board({
      edges: [
        {
          id: "e1",
          source: { nodeId: "a" },
          target: { free: { x: 10, y: 10 } },
          kind: "bezier",
          color: "#000",
          strokeWidth: 2,
          arrowHead: "end",
          dashed: false,
        },
        {
          id: "e2",
          source: { nodeId: "a" },
          target: { nodeId: "b" },
          kind: "bezier",
          color: "#000",
          strokeWidth: 2,
          arrowHead: "end",
          dashed: false,
        },
      ],
    });
    const rf = toFlowEdges(b);
    expect(rf).toHaveLength(1);
    expect(rf[0].id).toBe("e2");
  });
});
