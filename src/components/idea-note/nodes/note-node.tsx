"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { NoteData } from "@/types/idea-note";

type NoteNodeType = Node<NoteData & Record<string, unknown>, "note">;

export const NoteNode = memo(function NoteNode({
  id,
  data,
  selected,
}: NodeProps<NoteNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);
  const isReadOnly = useIdeaNoteStore((s) => !!s.board?.id && false);

  return (
    <NodeShell
      selected={selected}
      className="border-t-4"
      style={{
        borderTopColor: data.accentColor,
        background: data.backgroundColor,
      }}
      minWidth={160}
      minHeight={100}
    >
      <div className="flex h-full flex-col gap-2 p-3">
        <input
          className="w-full bg-transparent text-sm font-semibold outline-none"
          value={data.title}
          placeholder="제목"
          onChange={(e) => updateNodeData(id, { title: e.target.value })}
          readOnly={isReadOnly}
        />
        <textarea
          className="flex-1 resize-none bg-transparent text-xs leading-relaxed outline-none"
          value={data.richText}
          placeholder="내용을 입력하세요"
          onChange={(e) => updateNodeData(id, { richText: e.target.value })}
          readOnly={isReadOnly}
        />
      </div>
    </NodeShell>
  );
});
