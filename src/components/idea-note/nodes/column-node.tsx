"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { ColumnData } from "@/types/idea-note";

type ColumnNodeType = Node<ColumnData & Record<string, unknown>, "column">;

export const ColumnNode = memo(function ColumnNode({
  id,
  data,
  selected,
}: NodeProps<ColumnNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);
  const board = useIdeaNoteStore((s) => s.board);

  const childNodes =
    board?.nodes.filter((n) => data.childNodeIds.includes(n.id)) ?? [];

  return (
    <NodeShell
      selected={selected}
      style={{ background: "#f8fafc" }}
      minWidth={180}
      minHeight={200}
    >
      <div className="flex h-full flex-col">
        <div
          className="flex items-center gap-2 border-b px-3 py-2"
          style={{ borderColor: data.accent }}
        >
          <div
            className="size-2 shrink-0 rounded-full"
            style={{ background: data.accent }}
          />
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
            value={data.title}
            placeholder="Column"
            onChange={(e) => updateNodeData(id, { title: e.target.value })}
          />
        </div>
        <div className="flex-1 space-y-1.5 overflow-auto p-2">
          {childNodes.length === 0 && (
            <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
              카드를 여기 드래그하세요
            </div>
          )}
          {childNodes.map((child) => (
            <div
              key={child.id}
              className="rounded border bg-background px-2 py-1 text-xs"
            >
              {"data" in child && "title" in (child.data as Record<string, unknown>)
                ? String((child.data as { title?: string }).title ?? child.type)
                : child.type}
            </div>
          ))}
        </div>
      </div>
    </NodeShell>
  );
});
