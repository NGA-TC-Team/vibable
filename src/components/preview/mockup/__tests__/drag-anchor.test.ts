import { describe, expect, it } from "vitest";
import { computeDragAnchor, DRAG_ANCHOR_EDGE_MARGIN } from "../drag-anchor";

describe("computeDragAnchor", () => {
  it("returns null for canvas drags so dnd-kit default behavior is used", () => {
    const anchor = computeDragAnchor({
      source: "canvas",
      activatorClientX: 500,
      activatorClientY: 400,
      rectLeft: 480,
      rectTop: 380,
    });
    expect(anchor).toBeNull();
  });

  it("returns null when activator data is missing (touch/server path fallback)", () => {
    const anchor = computeDragAnchor({
      source: "palette",
      activatorClientX: undefined,
      activatorClientY: undefined,
      rectLeft: 10,
      rectTop: 20,
    });
    expect(anchor).toBeNull();
  });

  it("shifts palette ghost so cursor sits EDGE_MARGIN inside its top-left", () => {
    // palette tile at (100, 200) sized 60x30, cursor clicks at (125, 215).
    // modifier applies transform.x -= anchor.x; initial transform.x = 0.
    // overlay.left = rect.left - anchor.x  (at drag start)
    // => overlay.left - cursor.x should equal -margin (= -12).
    const anchor = computeDragAnchor({
      source: "palette",
      activatorClientX: 125,
      activatorClientY: 215,
      rectLeft: 100,
      rectTop: 200,
    });
    const expectedX = DRAG_ANCHOR_EDGE_MARGIN - (125 - 100);
    const expectedY = DRAG_ANCHOR_EDGE_MARGIN - (215 - 200);
    expect(anchor).toEqual({ x: expectedX, y: expectedY });
    // 확인: overlay.left - cursor.x = -margin (= -12)
    const overlayLeft = 100 - anchor!.x;
    expect(overlayLeft - 125).toBe(-DRAG_ANCHOR_EDGE_MARGIN);
  });

  it("honors a custom edgeMargin override", () => {
    const anchor = computeDragAnchor({
      source: "palette",
      activatorClientX: 60,
      activatorClientY: 60,
      rectLeft: 40,
      rectTop: 40,
      edgeMargin: 4,
    });
    // cursorOffset = 20, margin = 4 → anchor = 4 - 20 = -16
    expect(anchor).toEqual({ x: -16, y: -16 });
  });
});
