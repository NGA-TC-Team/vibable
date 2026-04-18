"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { SwatchData } from "@/types/idea-note";

type SwatchNodeType = Node<SwatchData & Record<string, unknown>, "swatch">;

function getContrastText(hex: string): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return "#000";
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.6 ? "#0f172a" : "#ffffff";
}

export const SwatchNode = memo(function SwatchNode({
  id,
  data,
  selected,
}: NodeProps<SwatchNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);
  const text = getContrastText(data.hex);

  return (
    <NodeShell
      selected={selected}
      className="border-0 shadow-md"
      minWidth={100}
      minHeight={100}
    >
      <div
        className="flex h-full w-full flex-col justify-between p-3"
        style={{ background: data.hex, color: text }}
      >
        <input
          className="bg-transparent text-xs font-medium outline-none placeholder:text-current/50"
          value={data.label ?? ""}
          placeholder="Label"
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
          style={{ color: text }}
        />
        <input
          className="w-full bg-transparent text-[11px] font-mono uppercase outline-none placeholder:text-current/50"
          value={data.hex}
          onChange={(e) => updateNodeData(id, { hex: e.target.value })}
          style={{ color: text }}
        />
      </div>
    </NodeShell>
  );
});
