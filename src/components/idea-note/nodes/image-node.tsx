"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { ImageIcon } from "lucide-react";
import { NodeShell } from "./node-shell";
import { useIdeaAsset } from "@/hooks/use-idea-asset.hook";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import type { ImageData } from "@/types/idea-note";

type ImageNodeType = Node<ImageData & Record<string, unknown>, "image">;

export const ImageNode = memo(function ImageNode({
  id,
  data,
  selected,
}: NodeProps<ImageNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);
  const url = useIdeaAsset(data.assetId);

  return (
    <NodeShell
      selected={selected}
      className="overflow-hidden"
      minWidth={120}
      minHeight={90}
    >
      <div className="relative flex h-full w-full flex-col bg-muted">
        {url ? (
          <img
            src={url}
            alt={data.caption ?? ""}
            className="h-full w-full"
            style={{ objectFit: data.objectFit }}
            draggable={false}
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <ImageIcon className="size-6" />
          </div>
        )}
        {(selected || data.caption) && (
          <input
            className="w-full bg-background/90 px-2 py-1 text-[11px] outline-none backdrop-blur"
            value={data.caption ?? ""}
            placeholder="캡션"
            onChange={(e) => updateNodeData(id, { caption: e.target.value })}
          />
        )}
      </div>
    </NodeShell>
  );
});
