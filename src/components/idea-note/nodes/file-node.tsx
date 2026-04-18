"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { FileIcon, Download } from "lucide-react";
import { NodeShell } from "./node-shell";
import { useIdeaAsset } from "@/hooks/use-idea-asset.hook";
import type { FileData } from "@/types/idea-note";

type FileNodeType = Node<FileData & Record<string, unknown>, "file">;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export const FileNode = memo(function FileNode({
  data,
  selected,
}: NodeProps<FileNodeType>) {
  const url = useIdeaAsset(data.assetId);

  return (
    <NodeShell selected={selected} minWidth={200} minHeight={72}>
      <div className="flex h-full items-center gap-3 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded bg-destructive/10 text-destructive">
          <FileIcon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{data.filename}</div>
          <div className="text-[11px] text-muted-foreground">
            {formatSize(data.size)} · {data.mime}
          </div>
        </div>
        {url && (
          <a
            href={url}
            download={data.filename}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Download className="size-4" />
          </a>
        )}
      </div>
    </NodeShell>
  );
});
