"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { LayoutGrid } from "lucide-react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { BoardRefData } from "@/types/idea-note";

type BoardNodeType = Node<BoardRefData & Record<string, unknown>, "board">;

export const BoardNode = memo(function BoardNode({
  id,
  data,
  selected,
}: NodeProps<BoardNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);

  return (
    <NodeShell
      selected={selected}
      className="border-dashed"
      style={{ background: "#faf7f0" }}
      minWidth={180}
      minHeight={120}
    >
      <div className="flex h-full flex-col gap-2 p-3">
        <div className="flex items-center gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded bg-amber-100 text-amber-700">
            {data.iconEmoji ? (
              <span className="text-xs">{data.iconEmoji}</span>
            ) : (
              <LayoutGrid className="size-3.5" />
            )}
          </div>
          <input
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
            value={data.displayName}
            placeholder="보드 이름"
            onChange={(e) =>
              updateNodeData(id, { displayName: e.target.value })
            }
          />
        </div>
        <div className="mt-auto text-[11px] text-muted-foreground">
          {data.cardCount} cards · {data.fileCount} files
        </div>
        <div className="text-[10px] italic text-muted-foreground">
          더블클릭하여 열기
        </div>
      </div>
    </NodeShell>
  );
});
