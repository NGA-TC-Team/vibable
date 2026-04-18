import { db } from "@/lib/db";
import type { IdeaNoteNode } from "@/types/idea-note";

/**
 * 프로젝트 내 모든 보드의 노드를 훑어 참조되지 않는 자산을 삭제한다.
 * 썸네일은 참조되는 자산의 동반 자산이므로 스캔 대상에서 제외한다.
 */
export async function collectOrphanedAssets(projectId: string) {
  const [boards, assets] = await Promise.all([
    db.ideaBoards.where("projectId").equals(projectId).toArray(),
    db.ideaAssets.where("projectId").equals(projectId).toArray(),
  ]);

  const referenced = new Set<string>();
  for (const board of boards) {
    for (const node of board.nodes as IdeaNoteNode[]) {
      if (node.type === "image" && node.data.assetId) referenced.add(node.data.assetId);
      if (node.type === "file" && node.data.assetId) referenced.add(node.data.assetId);
      if (node.type === "video" && node.data.assetId) referenced.add(node.data.assetId);
      if (node.type === "link" && node.data.thumbnailAssetId)
        referenced.add(node.data.thumbnailAssetId);
    }
    if (board.thumbnailAssetId) referenced.add(board.thumbnailAssetId);
  }

  return assets.filter(
    (a) => a.kind !== "thumbnail" && !referenced.has(a.id),
  );
}

export async function runAssetGc(projectId: string): Promise<number> {
  const orphaned = await collectOrphanedAssets(projectId);
  if (!orphaned.length) return 0;
  await db.ideaAssets.bulkDelete(orphaned.map((a) => a.id));
  return orphaned.length;
}
