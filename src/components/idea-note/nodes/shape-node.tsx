"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { ShapeData } from "@/types/idea-note";

type ShapeNodeType = Node<ShapeData & Record<string, unknown>, "shape">;

export const ShapeNode = memo(function ShapeNode({
  id,
  data,
  selected,
}: NodeProps<ShapeNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);

  const renderShape = () => {
    const common = {
      fill: data.fill,
      stroke: data.stroke,
      strokeWidth: data.strokeWidth,
    };
    switch (data.kind) {
      case "rect":
        return (
          <rect
            x={data.strokeWidth}
            y={data.strokeWidth}
            width={`calc(100% - ${data.strokeWidth * 2}px)` as unknown as number}
            height={`calc(100% - ${data.strokeWidth * 2}px)` as unknown as number}
            rx={6}
            {...common}
          />
        );
      case "ellipse":
        return (
          <ellipse
            cx="50%"
            cy="50%"
            rx="48%"
            ry="48%"
            {...common}
          />
        );
      case "diamond":
        return (
          <polygon
            points="50,2 98,50 50,98 2,50"
            transform="scale(1,1)"
            vectorEffect="non-scaling-stroke"
            {...common}
          />
        );
      case "triangle":
        return (
          <polygon
            points="50,4 98,98 2,98"
            vectorEffect="non-scaling-stroke"
            {...common}
          />
        );
      case "hexagon":
        return (
          <polygon
            points="25,5 75,5 98,50 75,95 25,95 2,50"
            vectorEffect="non-scaling-stroke"
            {...common}
          />
        );
    }
  };

  return (
    <NodeShell
      selected={selected}
      className="border-0 shadow-none"
      minWidth={60}
      minHeight={60}
    >
      <div className="relative h-full w-full">
        <svg
          viewBox={
            data.kind === "rect" || data.kind === "ellipse"
              ? undefined
              : "0 0 100 100"
          }
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {renderShape()}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center px-3">
          <input
            className="w-full bg-transparent text-center text-sm outline-none"
            value={data.text ?? ""}
            placeholder=""
            onChange={(e) => updateNodeData(id, { text: e.target.value })}
          />
        </div>
      </div>
    </NodeShell>
  );
});
