"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { FrameData } from "@/types/idea-note";

type FrameNodeType = Node<FrameData & Record<string, unknown>, "frame">;

export const FrameNode = memo(function FrameNode({
  id,
  data,
  selected,
}: NodeProps<FrameNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);

  return (
    <NodeShell
      selected={selected}
      className="shadow-none"
      style={{
        background: data.background,
        borderColor: data.borderColor ?? "#cbd5e1",
        borderStyle: data.dashed ? "dashed" : "solid",
      }}
      minWidth={200}
      minHeight={160}
    >
      <div className="absolute left-2 top-1 z-10">
        <input
          className="bg-transparent text-xs font-semibold text-muted-foreground outline-none"
          value={data.label ?? ""}
          placeholder="Frame"
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
        />
      </div>
    </NodeShell>
  );
});
