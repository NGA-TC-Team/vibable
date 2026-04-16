import Dexie, { type EntityTable } from "dexie";
import type { Workspace, Project } from "@/types/phases";

const db = new Dexie("vibable") as Dexie & {
  workspaces: EntityTable<Workspace, "id">;
  projects: EntityTable<Project, "id">;
};

db.version(1).stores({
  workspaces: "id, createdAt",
  projects: "id, workspaceId, updatedAt",
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
