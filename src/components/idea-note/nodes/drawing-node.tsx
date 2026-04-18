"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { DrawingData } from "@/types/idea-note";

type DrawingNodeType = Node<DrawingData & Record<string, unknown>, "drawing">;

/**
 * 형광펜 스트로크 렌더러. 배경은 투명해 캔버스 위에 겹쳐 그려지는 것처럼 보인다.
 * SVG 좌표는 node 로컬 좌표계(좌상단 기준)이므로 preserveAspectRatio="xMinYMin meet"로
 * 정확한 픽셀 비율 유지.
 */
export const DrawingNode = memo(function DrawingNode({
  data,
  width,
  height,
  selected,
}: NodeProps<DrawingNodeType>) {
  const w = width ?? 240;
  const h = height ?? 120;

  return (
    <div
      className={cn(
        "pointer-events-auto h-full w-full",
        selected && "rounded-md ring-2 ring-primary ring-offset-1",
      )}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="xMinYMin meet"
      >
        {data.strokes.map((stroke, i) => {
          const path = stroke.points
            .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
            .join(" ");
          return (
            <path
              key={i}
              d={path}
              stroke={stroke.color}
              strokeWidth={stroke.size}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={stroke.tool === "highlighter" ? 0.45 : 1}
            />
          );
        })}
      </svg>
    </div>
  );
});
