import { unzipSync, strFromU8 } from "fflate";
import { db } from "@/lib/db";
import { ideaNoteBundleManifestSchema } from "@/lib/schemas/idea-note-bundle";
import { ideaNoteBoardSchema } from "@/lib/schemas/idea-note";
import type {
  IdeaNoteAsset,
  IdeaNoteBoard,
  IdeaNoteBundleManifest,
} from "@/types/idea-note";

/**
 * .vbn (= zip) 번들을 현재 프로젝트로 import 한다.
 * - 자산 ID 충돌을 피하기 위해 모든 id를 새로 발급한다.
 * - 보드 id 재매핑도 함께 수행하며 parentBoardId 및 board-ref 노드의 childBoardId를 갱신.
 */
export async function importBundleIntoProject(
  targetProjectId: string,
  bundleBlob: Blob,
): Promise<{ boards: number; assets: number }> {
  const ab = await bundleBlob.arrayBuffer();
  const entries = unzipSync(new Uint8Array(ab));

  const manifestEntry = entries["manifest.json"];
  if (!manifestEntry) throw new Error("manifest.json 없음");
  const manifest = ideaNoteBundleManifestSchema.parse(
    JSON.parse(strFromU8(manifestEntry)),
  ) as IdeaNoteBundleManifest;

  // id 재매핑 테이블
  const boardIdMap = new Map<string, string>();
  const assetIdMap = new Map<string, string>();
  for (const b of manifest.boards) boardIdMap.set(b.id, `board-${crypto.randomUUID().slice(0, 8)}`);
  for (const a of manifest.assets) assetIdMap.set(a.id, `asset-${crypto.randomUUID()}`);

  // 보드 로드
  const boards: IdeaNoteBoard[] = [];
  for (const b of manifest.boards) {
    const entry = entries[`boards/${b.id}.json`];
    if (!entry) continue;
    const parsed = ideaNoteBoardSchema.parse(JSON.parse(strFromU8(entry)));
    const newId = boardIdMap.get(parsed.id)!;
    const newParent =
      parsed.parentBoardId && boardIdMap.has(parsed.parentBoardId)
        ? boardIdMap.get(parsed.parentBoardId)!
        : null;
    const remappedNodes = parsed.nodes.map((n) => {
      if (n.type === "board" && boardIdMap.has(n.data.childBoardId)) {
        return {
          ...n,
          data: { ...n.data, childBoardId: boardIdMap.get(n.data.childBoardId)! },
        };
      }
      if (n.type === "image" && assetIdMap.has(n.data.assetId)) {
        return {
          ...n,
          data: { ...n.data, assetId: assetIdMap.get(n.data.assetId)! },
        };
      }
      if (n.type === "file" && assetIdMap.has(n.data.assetId)) {
        return {
          ...n,
          data: { ...n.data, assetId: assetIdMap.get(n.data.assetId)! },
        };
      }
      if (
        n.type === "video" &&
        n.data.assetId &&
        assetIdMap.has(n.data.assetId)
      ) {
        return {
          ...n,
          data: { ...n.data, assetId: assetIdMap.get(n.data.assetId)! },
        };
      }
      if (
        n.type === "link" &&
        n.data.thumbnailAssetId &&
        assetIdMap.has(n.data.thumbnailAssetId)
      ) {
        return {
          ...n,
          data: {
            ...n.data,
            thumbnailAssetId: assetIdMap.get(n.data.thumbnailAssetId)!,
          },
        };
      }
      return n;
    });
    boards.push({
      ...(parsed as IdeaNoteBoard),
      id: newId,
      projectId: targetProjectId,
      parentBoardId: newParent,
      nodes: remappedNodes as IdeaNoteBoard["nodes"],
    });
  }

  // 자산 로드
  const assets: IdeaNoteAsset[] = [];
  for (const a of manifest.assets) {
    // 확장자를 알 수 없으므로 entries에서 id prefix 매칭
    const entryKey = Object.keys(entries).find((k) =>
      k.startsWith(`assets/${a.id}.`),
    );
    if (!entryKey) continue;
    const data = entries[entryKey];
    const blob = new Blob([data as BlobPart], { type: a.mime });
    assets.push({
      id: assetIdMap.get(a.id)!,
      projectId: targetProjectId,
      kind: a.kind,
      mime: a.mime,
      size: a.size,
      originalName: a.originalName,
      width: a.width,
      height: a.height,
      blob,
      createdAt: Date.now(),
    });
  }

  await db.transaction("rw", db.ideaBoards, db.ideaAssets, async () => {
    if (boards.length) await db.ideaBoards.bulkAdd(boards);
    if (assets.length) await db.ideaAssets.bulkAdd(assets);
  });

  return { boards: boards.length, assets: assets.length };
}
