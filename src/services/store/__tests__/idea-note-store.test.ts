import { beforeEach, describe, expect, it } from "vitest";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import { createNodeOfKind, createEmptyBoard } from "@/lib/idea-note/defaults";

describe("idea-note-store", () => {
  beforeEach(() => {
    useIdeaNoteStore.getState().reset();
  });

  it("adds and removes nodes", () => {
    const board = createEmptyBoard("p1", "B");
    useIdeaNoteStore.getState().setBoard(board);

    const node = createNodeOfKind("note", { x: 0, y: 0 });
    useIdeaNoteStore.getState().addNode(node);
    expect(useIdeaNoteStore.getState().board?.nodes).toHaveLength(1);

    useIdeaNoteStore.getState().removeNodes([node.id]);
    expect(useIdeaNoteStore.getState().board?.nodes).toHaveLength(0);
  });

  it("updates node data", () => {
    const board = createEmptyBoard("p1", "B");
    useIdeaNoteStore.getState().setBoard(board);

    const node = createNodeOfKind("note", { x: 0, y: 0 });
    useIdeaNoteStore.getState().addNode(node);
    useIdeaNoteStore.getState().updateNodeData(node.id, { title: "Updated" });

    const found = useIdeaNoteStore
      .getState()
      .board?.nodes.find((n) => n.id === node.id);
    if (found?.type === "note") {
      expect(found.data.title).toBe("Updated");
    }
  });

  it("commit / undo / redo round-trip", () => {
    const board = createEmptyBoard("p1", "B");
    useIdeaNoteStore.getState().setBoard(board);

    const node = createNodeOfKind("note", { x: 0, y: 0 });
    const s = useIdeaNoteStore.getState();
    s.commitHistory();
    s.addNode(node);

    expect(useIdeaNoteStore.getState().board?.nodes).toHaveLength(1);

    useIdeaNoteStore.getState().undo();
    expect(useIdeaNoteStore.getState().board?.nodes).toHaveLength(0);

    useIdeaNoteStore.getState().redo();
    expect(useIdeaNoteStore.getState().board?.nodes).toHaveLength(1);
  });

  it("history has 50-entry limit", () => {
    const board = createEmptyBoard("p1", "B");
    useIdeaNoteStore.getState().setBoard(board);

    for (let i = 0; i < 60; i++) {
      useIdeaNoteStore.getState().commitHistory();
      useIdeaNoteStore
        .getState()
        .addNode(createNodeOfKind("text", { x: i, y: i }));
    }
    expect(useIdeaNoteStore.getState().history.past.length).toBeLessThanOrEqual(
      50,
    );
  });

  it("clears onboarding samples", () => {
    const board = createEmptyBoard("p1", "B");
    useIdeaNoteStore.getState().setBoard(board);
    const sample = {
      ...createNodeOfKind("note", { x: 0, y: 0 }),
      onboardingSample: true,
    };
    const real = createNodeOfKind("note", { x: 0, y: 0 });
    useIdeaNoteStore.getState().addNode(sample);
    useIdeaNoteStore.getState().addNode(real);
    useIdeaNoteStore.getState().clearOnboardingSamples();
    expect(useIdeaNoteStore.getState().board?.nodes).toHaveLength(1);
    expect(useIdeaNoteStore.getState().board?.nodes[0].id).toBe(real.id);
  });

  it("removing a node also removes connected edges", () => {
    const board = createEmptyBoard("p1", "B");
    useIdeaNoteStore.getState().setBoard(board);
    const n1 = createNodeOfKind("note", { x: 0, y: 0 });
    const n2 = createNodeOfKind("note", { x: 100, y: 0 });
    useIdeaNoteStore.getState().addNode(n1);
    useIdeaNoteStore.getState().addNode(n2);
    useIdeaNoteStore.getState().addEdge({
      id: "e1",
      source: { nodeId: n1.id },
      target: { nodeId: n2.id },
      kind: "bezier",
      color: "#000",
      strokeWidth: 2,
      arrowHead: "end",
      dashed: false,
    });

    useIdeaNoteStore.getState().removeNodes([n1.id]);
    expect(useIdeaNoteStore.getState().board?.edges).toHaveLength(0);
  });
});
