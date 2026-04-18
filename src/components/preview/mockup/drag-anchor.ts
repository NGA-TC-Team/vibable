/**
 * 드래그 앵커 계산.
 *
 * dnd-kit의 DragOverlay는 드래그 시작 시점의 `active.rect` 좌상단에서 렌더되고,
 * `transform`은 포인터 이동 델타다. overlay-to-cursor offset은 드래그 내내
 * 시작 시점의 offset에 고정되므로, 필요한 offset을 앵커로 추출해
 * `transform.x -= anchor.x` modifier를 적용하면 된다.
 *
 * ## 팔레트(source="palette")
 * 팔레트 타일(작음)과 ghost(원본 크기 × scale, 큼)의 크기 차이 때문에 기본 동작은
 * ghost가 커서 우측-하단으로 쏠린다. ghost 좌상단을 커서에서 `EDGE_MARGIN`만큼
 * 안쪽에 두려면 `anchor = cursorOffsetInRect - EDGE_MARGIN`.
 *
 * ## 캔버스(source="canvas")
 * 캔버스 요소의 rect와 ghost는 둘 다 scale이 적용된 동일 크기이므로, modifier 없이도
 * 커서-요소 상대 위치가 유지된다. `null`을 반환해 modifier를 적용하지 않는다.
 */

export const DRAG_ANCHOR_EDGE_MARGIN = 12;

export interface DragAnchorInput {
  source: "palette" | "canvas";
  activatorClientX?: number | null;
  activatorClientY?: number | null;
  rectLeft?: number | null;
  rectTop?: number | null;
  edgeMargin?: number;
}

export interface DragAnchor {
  x: number;
  y: number;
}

export function computeDragAnchor(input: DragAnchorInput): DragAnchor | null {
  if (input.source !== "palette") {
    return null;
  }

  if (
    input.activatorClientX == null ||
    input.activatorClientY == null ||
    input.rectLeft == null ||
    input.rectTop == null
  ) {
    // activator 정보가 없으면 앵커 계산 불가 — 기본 동작(modifier 없음)으로 폴백.
    return null;
  }

  const margin = input.edgeMargin ?? DRAG_ANCHOR_EDGE_MARGIN;
  // overlay.left - cursor.x = -anchor.x - cursorOffsetInRect 이 식이 `-margin`이
  // 되려면 anchor.x = margin - cursorOffsetInRect. 이전 구현은 부호가 반대였다.
  const offsetX = input.activatorClientX - input.rectLeft;
  const offsetY = input.activatorClientY - input.rectTop;
  return {
    x: margin - offsetX,
    y: margin - offsetY,
  };
}
