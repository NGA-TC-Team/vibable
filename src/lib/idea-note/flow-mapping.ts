// xyflow의 Node/Edge <-> IdeaNoteNode/IdeaNoteEdge 변환

import type { Node as RFNode, Edge as RFEdge } from "@xyflow/react";
import type { IdeaNoteBoard, IdeaNoteEdge } from "@/types/idea-note";

export function toFlowNodes(board: IdeaNoteBoard): RFNode[] {
  return board.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data as unknown as Record<string, unknown>,
    width: n.size.width,
    height: n.size.height,
    style: {
      width: n.size.width,
      height: n.size.height,
      zIndex: n.zIndex,
    },
    draggable: !n.locked,
    selectable: true,
    hidden: n.hidden ?? false,
  }));
}

function endpointNodeId(
  endpoint: IdeaNoteEdge["source"],
): { id: string | undefined; handle: string | undefined } {
  if ("nodeId" in endpoint) {
    return { id: endpoint.nodeId, handle: endpoint.handle };
  }
  return { id: undefined, handle: undefined };
}

export function toFlowEdges(board: IdeaNoteBoard): RFEdge[] {
  return board.edges
    .map((e) => {
      const src = endpointNodeId(e.source);
      const tgt = endpointNodeId(e.target);
      // 자유 좌표 엔드포인트는 xyflow가 직접 표현하지 못하므로
      // 고정된 노드 간 연결만 렌더한다.
      if (!src.id || !tgt.id) return null;
      return {
        id: e.id,
        source: src.id,
        target: tgt.id,
        // loose 연결 모드에서 source/target 핸들 id는 동일하게 t/r/b/l 사용
        sourceHandle: src.handle,
        targetHandle: tgt.handle,
        type: "connector",
        data: {
          label: e.label,
          color: e.color,
          strokeWidth: e.strokeWidth,
          arrowHead: e.arrowHead,
          dashed: e.dashed,
        },
      } as RFEdge;
    })
    .filter((x): x is RFEdge => x !== null);
}

export function snapValue(value: number, grid: number): number {
  if (grid <= 0) return value;
  return Math.round(value / grid) * grid;
}

export function snapPosition(
  pos: { x: number; y: number },
  grid: number,
): { x: number; y: number } {
  return { x: snapValue(pos.x, grid), y: snapValue(pos.y, grid) };
}

/** 뷰포트 화면 공간의 (clientX, clientY)를 flow 좌표로 변환하는 헬퍼 */
export function worldFromScreen(
  clientX: number,
  clientY: number,
  container: DOMRect,
  viewport: { x: number; y: number; zoom: number },
): { x: number; y: number } {
  const x = (clientX - container.left - viewport.x) / viewport.zoom;
  const y = (clientY - container.top - viewport.y) / viewport.zoom;
  return { x, y };
}
