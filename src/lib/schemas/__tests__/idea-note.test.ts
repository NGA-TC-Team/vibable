import { describe, expect, it } from "vitest";
import {
  ideaNoteNodeSchema,
  ideaNoteEdgeSchema,
  ideaNoteBoardSchema,
} from "@/lib/schemas/idea-note";

describe("ideaNoteNodeSchema", () => {
  it("parses a valid note node", () => {
    const raw = {
      id: "node-1",
      type: "note",
      position: { x: 10, y: 20 },
      size: { width: 200, height: 140 },
      rotation: 0,
      zIndex: 1,
      data: {
        title: "Hello",
        richText: "World",
        accentColor: "#fbbf24",
        backgroundColor: "#ffffff",
      },
    };
    const parsed = ideaNoteNodeSchema.parse(raw);
    expect(parsed.type).toBe("note");
    if (parsed.type === "note") {
      expect(parsed.data.title).toBe("Hello");
    }
  });

  it("rejects unknown node type", () => {
    const bad = {
      id: "node-2",
      type: "unknown",
      position: { x: 0, y: 0 },
      size: { width: 100, height: 100 },
      rotation: 0,
      zIndex: 0,
      data: {},
    };
    expect(() => ideaNoteNodeSchema.parse(bad)).toThrow();
  });

  it("fills defaults for swatch", () => {
    const raw = {
      id: "node-3",
      type: "swatch",
      data: {},
    };
    const parsed = ideaNoteNodeSchema.parse(raw);
    if (parsed.type === "swatch") {
      expect(parsed.data.hex).toBeTruthy();
      expect(parsed.rotation).toBe(0);
    }
  });

  it("parses todo items with defaults", () => {
    const raw = {
      id: "node-4",
      type: "todo",
      data: {
        title: "Tasks",
        items: [{ id: "i1", text: "do", done: false }],
      },
    };
    const parsed = ideaNoteNodeSchema.parse(raw);
    if (parsed.type === "todo") {
      expect(parsed.data.showProgress).toBe(true);
      expect(parsed.data.items).toHaveLength(1);
    }
  });
});

describe("ideaNoteEdgeSchema", () => {
  it("parses an edge with free endpoint", () => {
    const raw = {
      id: "e1",
      source: { nodeId: "a" },
      target: { free: { x: 100, y: 200 } },
    };
    const parsed = ideaNoteEdgeSchema.parse(raw);
    expect(parsed.kind).toBe("bezier");
    expect(parsed.arrowHead).toBe("end");
    expect(parsed.dashed).toBe(false);
  });

  it("applies default color", () => {
    const raw = {
      id: "e2",
      source: { nodeId: "a" },
      target: { nodeId: "b", handle: "l" },
    };
    const parsed = ideaNoteEdgeSchema.parse(raw);
    expect(parsed.color).toBeTruthy();
  });
});

describe("ideaNoteBoardSchema", () => {
  it("parses a minimal board", () => {
    const raw = {
      id: "b1",
      projectId: "p1",
      parentBoardId: null,
      createdAt: 0,
      updatedAt: 0,
    };
    const parsed = ideaNoteBoardSchema.parse(raw);
    expect(parsed.nodes).toEqual([]);
    expect(parsed.edges).toEqual([]);
    expect(parsed.backgroundStyle).toBe("dot");
  });
});
