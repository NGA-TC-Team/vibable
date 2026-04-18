"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { TextData } from "@/types/idea-note";
import { cn } from "@/lib/utils";

type TextNodeType = Node<TextData & Record<string, unknown>, "text">;

export const TextNode = memo(function TextNode({
  id,
  data,
  selected,
}: NodeProps<TextNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);

  return (
    <div
      className={cn(
        "flex h-full w-full items-center rounded px-1.5",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
      )}
    >
      <textarea
        className="h-full w-full resize-none bg-transparent outline-none"
        value={data.text}
        placeholder="Text"
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
        style={{
          fontSize: data.fontSize,
          fontWeight: data.fontWeight,
          color: data.color,
          textAlign: data.align,
          fontStyle: data.italic ? "italic" : "normal",
        }}
      />
    </div>
  );
});
