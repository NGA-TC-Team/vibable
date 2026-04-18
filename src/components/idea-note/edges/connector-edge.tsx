"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type Edge,
  type EdgeProps,
} from "@xyflow/react";

export interface ConnectorEdgeData extends Record<string, unknown> {
  label?: string;
  color?: string;
  strokeWidth?: number;
  arrowHead?: "none" | "end" | "both" | "dot-end";
  dashed?: boolean;
}

type ConnectorEdgeType = Edge<ConnectorEdgeData, "connector">;

export const ConnectorEdge = memo(function ConnectorEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<ConnectorEdgeType>) {
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const ed = (data ?? {}) as ConnectorEdgeData;
  const color = ed.color ?? "#334155";
  const width = ed.strokeWidth ?? 2;
  const markerEnd =
    ed.arrowHead === "none" ? undefined : `url(#idea-arrow-${id})`;
  const markerStart =
    ed.arrowHead === "both" ? `url(#idea-arrow-start-${id})` : undefined;

  return (
    <>
      <defs>
        <marker
          id={`idea-arrow-${id}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill={color} />
        </marker>
        {ed.arrowHead === "both" && (
          <marker
            id={`idea-arrow-start-${id}`}
            viewBox="0 0 10 10"
            refX="1"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <path d="M10,0 L0,5 L10,10 z" fill={color} />
          </marker>
        )}
      </defs>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{
          stroke: color,
          strokeWidth: selected ? width + 1 : width,
          strokeDasharray: ed.dashed ? "6 4" : undefined,
        }}
      />
      {ed.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="rounded bg-background/90 px-1.5 py-0.5 text-[11px] shadow-sm ring-1 ring-border"
          >
            {ed.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
