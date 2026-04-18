import { strToU8, zipSync } from "fflate";
import { db } from "@/lib/db";
import type {
  IdeaNoteAsset,
  IdeaNoteBoard,
  IdeaNoteBundleManifest,
} from "@/types/idea-note";

function mimeToExt(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "video/mp4") return "mp4";
  if (mime === "application/pdf") return "pdf";
  if (mime === "application/zip") return "zip";
  const parts = mime.split("/");
  return parts[1] ?? "bin";
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  const ab = await blob.arrayBuffer();
  return new Uint8Array(ab);
}

export async function exportProjectBundle(projectId: string): Promise<Blob> {
  const boards = await db.ideaBoards
    .where("projectId")
    .equals(projectId)
    .toArray();
  const assets = await db.ideaAssets
    .where("projectId")
    .equals(projectId)
    .toArray();

  const manifest: IdeaNoteBundleManifest = {
    vibableBundleVersion: 1,
    projectId,
    exportedAt: Date.now(),
    boards: boards.map((b) => ({
      id: b.id,
      name: b.name,
      parentBoardId: b.parentBoardId,
    })),
    assets: assets.map((a) => ({
      id: a.id,
      kind: a.kind,
      mime: a.mime,
      size: a.size,
      originalName: a.originalName,
      width: a.width,
      height: a.height,
    })),
  };

  const entries: Record<string, Uint8Array> = {};
  entries["manifest.json"] = strToU8(JSON.stringify(manifest, null, 2), true);

  for (const b of boards) {
    // Blob은 JSON에 넣을 수 없으므로 보드 JSON에서 제외 (자산은 파일로 별도 저장)
    const serializable: Omit<IdeaNoteBoard, never> = b;
    entries[`boards/${b.id}.json`] = strToU8(
      JSON.stringify(serializable, null, 2),
      true,
    );
  }

  for (const a of assets) {
    const ext = mimeToExt(a.mime);
    entries[`assets/${a.id}.${ext}`] = await blobToUint8Array(a.blob);
  }

  const zipped = zipSync(entries, { level: 6 });
  return new Blob([zipped as BlobPart], { type: "application/zip" });
}

export async function exportBoardJson(boardId: string): Promise<Blob> {
  const board = await db.ideaBoards.get(boardId);
  if (!board) throw new Error("board not found");
  const json = JSON.stringify(board, null, 2);
  return new Blob([json], { type: "application/json" });
}

export interface AssetUsageStats {
  totalBytes: number;
  totalAssets: number;
}

export async function computeAssetUsage(
  projectId: string,
): Promise<AssetUsageStats> {
  const assets = await db.ideaAssets
    .where("projectId")
    .equals(projectId)
    .toArray();
  const totalBytes = assets.reduce(
    (acc: number, a: IdeaNoteAsset) => acc + a.size,
    0,
  );
  return { totalBytes, totalAssets: assets.length };
}
