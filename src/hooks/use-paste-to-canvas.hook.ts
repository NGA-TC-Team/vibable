"use client";

import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { toast } from "sonner";
import {
  MAX_FILE_BYTES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  isImageBlob,
  isVideoBlob,
  prepareImageForStorage,
  formatBytes,
} from "@/lib/idea-note/asset-utils";
import { createAssetFromBlob } from "@/hooks/use-idea-asset.hook";
import { createNodeOfKind } from "@/lib/idea-note/defaults";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";

interface DropTarget {
  clientX: number;
  clientY: number;
}

/**
 * 이미지/비디오/파일을 받아 보드에 노드로 추가한다.
 * position은 flow 좌표계(viewport transform 반영).
 */
export function usePasteToCanvas() {
  const projectId = useIdeaNoteStore((s) => s.projectId);
  const addNode = useIdeaNoteStore((s) => s.addNode);
  const commitHistory = useIdeaNoteStore((s) => s.commitHistory);
  const { screenToFlowPosition } = useReactFlow();

  const handleFiles = useCallback(
    async (files: File[], target: DropTarget) => {
      if (!projectId || files.length === 0) return;

      const position = screenToFlowPosition({
        x: target.clientX,
        y: target.clientY,
      });

      let offsetY = 0;
      for (const file of files) {
        try {
          if (isImageBlob(file)) {
            if (file.size > MAX_IMAGE_BYTES) {
              toast.error(
                `이미지가 너무 큽니다(최대 ${formatBytes(MAX_IMAGE_BYTES)})`,
              );
              continue;
            }
            const { main, thumb } = await prepareImageForStorage(file);
            const assetId = await createAssetFromBlob({
              projectId,
              kind: "image",
              blob: main.blob,
              originalName: file.name,
              width: main.width,
              height: main.height,
            });
            await createAssetFromBlob({
              projectId,
              kind: "thumbnail",
              blob: thumb.blob,
              originalName: file.name,
              width: thumb.width,
              height: thumb.height,
            });
            const aspect = main.width / Math.max(main.height, 1);
            const nodeWidth = Math.min(400, Math.max(160, main.width));
            const nodeHeight = nodeWidth / aspect;
            commitHistory();
            addNode(
              createNodeOfKind(
                "image",
                { x: position.x, y: position.y + offsetY },
                {
                  size: { width: nodeWidth, height: nodeHeight },
                  data: { assetId, caption: "", objectFit: "cover" },
                },
              ),
            );
            offsetY += nodeHeight + 24;
          } else if (isVideoBlob(file)) {
            if (file.size > MAX_VIDEO_BYTES) {
              toast.error(
                `동영상이 너무 큽니다(최대 ${formatBytes(MAX_VIDEO_BYTES)})`,
              );
              continue;
            }
            const assetId = await createAssetFromBlob({
              projectId,
              kind: "video",
              blob: file,
              originalName: file.name,
            });
            commitHistory();
            addNode(
              createNodeOfKind(
                "video",
                { x: position.x, y: position.y + offsetY },
                { data: { assetId } },
              ),
            );
            offsetY += 220;
          } else {
            if (file.size > MAX_FILE_BYTES) {
              toast.error(
                `파일이 너무 큽니다(최대 ${formatBytes(MAX_FILE_BYTES)})`,
              );
              continue;
            }
            const assetId = await createAssetFromBlob({
              projectId,
              kind: "file",
              blob: file,
              originalName: file.name,
            });
            commitHistory();
            addNode(
              createNodeOfKind(
                "file",
                { x: position.x, y: position.y + offsetY },
                {
                  data: {
                    assetId,
                    filename: file.name,
                    size: file.size,
                    mime: file.type || "application/octet-stream",
                  },
                },
              ),
            );
            offsetY += 110;
          }
        } catch (err) {
          console.error(err);
          toast.error("자산 처리에 실패했습니다");
        }
      }
    },
    [projectId, addNode, commitHistory, screenToFlowPosition],
  );

  return { handleFiles };
}
