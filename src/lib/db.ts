import Dexie, { type EntityTable } from "dexie";
import type { Workspace, Project } from "@/types/phases";
import type { IdeaNoteBoard, IdeaNoteAsset } from "@/types/idea-note";

const db = new Dexie("vibable") as Dexie & {
  workspaces: EntityTable<Workspace, "id">;
  projects: EntityTable<Project, "id">;
  ideaBoards: EntityTable<IdeaNoteBoard, "id">;
  ideaAssets: EntityTable<IdeaNoteAsset, "id">;
};

db.version(1).stores({
  workspaces: "id, createdAt",
  projects: "id, workspaceId, updatedAt",
});

// v2 — 아이디어 노트 테이블 추가 (기존 테이블 스키마 변경 없음)
db.version(2).stores({
  workspaces: "id, createdAt",
  projects: "id, workspaceId, updatedAt",
  ideaBoards: "id, projectId, parentBoardId, updatedAt",
  ideaAssets: "id, projectId, kind, createdAt",
});

const DEFAULT_WORKSPACE_ID = "default";

export async function ensureDefaultWorkspace(): Promise<Workspace> {
  const existing = await db.workspaces.get(DEFAULT_WORKSPACE_ID);
  if (existing) return existing;

  const workspace: Workspace = {
    id: DEFAULT_WORKSPACE_ID,
    name: "내 워크스페이스",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.workspaces.add(workspace);
  return workspace;
}

export { db, DEFAULT_WORKSPACE_ID };
