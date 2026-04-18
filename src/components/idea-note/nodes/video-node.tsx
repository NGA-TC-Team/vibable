"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { Video as VideoIcon } from "lucide-react";
import { NodeShell } from "./node-shell";
import { useIdeaAsset } from "@/hooks/use-idea-asset.hook";
import type { VideoData } from "@/types/idea-note";

type VideoNodeType = Node<VideoData & Record<string, unknown>, "video">;

export const VideoNode = memo(function VideoNode({
  data,
  selected,
}: NodeProps<VideoNodeType>) {
  const url = useIdeaAsset(data.assetId);

  return (
    <NodeShell selected={selected} minWidth={180} minHeight={120}>
      <div className="flex h-full w-full bg-black">
        {url ? (
          <video src={url} controls className="h-full w-full" />
        ) : data.externalUrl ? (
          <iframe
            src={data.externalUrl}
            className="h-full w-full"
            allow="autoplay; encrypted-media"
          />
        ) : (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <VideoIcon className="size-6" />
          </div>
        )}
      </div>
    </NodeShell>
  );
});
