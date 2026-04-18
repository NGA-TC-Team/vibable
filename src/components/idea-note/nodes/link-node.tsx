"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { ExternalLink } from "lucide-react";
import { NodeShell } from "./node-shell";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import { useIdeaAsset } from "@/hooks/use-idea-asset.hook";
import type { LinkData } from "@/types/idea-note";

type LinkNodeType = Node<LinkData & Record<string, unknown>, "link">;

export const LinkNode = memo(function LinkNode({
  id,
  data,
  selected,
}: NodeProps<LinkNodeType>) {
  const updateNodeData = useIdeaNoteStore((s) => s.updateNodeData);
  const thumbUrl = useIdeaAsset(data.thumbnailAssetId);

  return (
    <NodeShell selected={selected} minWidth={180} minHeight={100}>
      <div className="flex h-full">
        {thumbUrl ? (
          <div
            className="h-full w-24 shrink-0 bg-muted bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbUrl})` }}
          />
        ) : (
          <div className="flex h-full w-24 shrink-0 items-center justify-center bg-muted">
            <ExternalLink className="size-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1 p-3">
          <input
            className="w-full bg-transparent text-sm font-semibold outline-none"
            value={data.title}
            placeholder="제목"
            onChange={(e) => updateNodeData(id, { title: e.target.value })}
          />
          <input
            className="w-full truncate bg-transparent text-[11px] text-muted-foreground outline-none"
            value={data.url}
            placeholder="https://"
            onChange={(e) => updateNodeData(id, { url: e.target.value })}
          />
          <textarea
            className="flex-1 resize-none bg-transparent text-xs outline-none"
            value={data.description ?? ""}
            placeholder="설명"
            onChange={(e) =>
              updateNodeData(id, { description: e.target.value })
            }
          />
        </div>
      </div>
    </NodeShell>
  );
});
