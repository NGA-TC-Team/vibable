"use client";

import { useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { downloadBlob } from "@/lib/download";
import { toast } from "sonner";
import type { Workspace, Project } from "@/types/phases";

interface BackupPayload {
  version: number;
  exportedAt: string;
  workspaces: Workspace[];
  projects: Project[];
}

function backupTimestamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function supportsCompression() {
  return typeof CompressionStream !== "undefined";
}

async function compressBlob(blob: Blob): Promise<Blob> {
  const cs = new CompressionStream("gzip");
  const stream = blob.stream().pipeThrough(cs);
  return new Response(stream).blob();
}

async function decompressBlob(blob: Blob): Promise<string> {
  const ds = new DecompressionStream("gzip");
  const stream = blob.stream().pipeThrough(ds);
  return new Response(stream).text();
}

export function useExportBackup() {
  const exportBackup = async () => {
    try {
      const [workspaces, projects] = await Promise.all([
        db.workspaces.toArray(),
        db.projects.toArray(),
      ]);

      const payload: BackupPayload = {
        version: 1,
        exportedAt: new Date().toISOString(),
        workspaces,
        projects,
      };

      const json = JSON.stringify(payload);
      const jsonBlob = new Blob([json], { type: "application/json" });
      const ts = backupTimestamp();

      if (supportsCompression()) {
        const compressed = await compressBlob(jsonBlob);
        downloadBlob(compressed, `vibable_backup_${ts}.vibable`);
      } else {
        downloadBlob(jsonBlob, `vibable_backup_${ts}.json`);
      }

      toast.success(`${projects.length}개 프로젝트가 내보내기되었습니다`);
    } catch (err) {
      console.error("Backup export failed:", err);
      toast.error("데이터 내보내기에 실패했습니다");
    }
  };

  return { exportBackup };
}

export function useImportBackup() {
  const queryClient = useQueryClient();

  const importBackup = async (file: File) => {
    try {
      let jsonText: string;

      if (file.name.endsWith(".vibable") && supportsCompression()) {
        jsonText = await decompressBlob(file);
      } else {
        jsonText = await file.text();
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(jsonText);
      } catch {
        toast.error("유효하지 않은 백업 파일입니다");
        return;
      }

      const data = parsed as Record<string, unknown>;
      if (
        !data.version ||
        !Array.isArray(data.workspaces) ||
        !Array.isArray(data.projects)
      ) {
        toast.error("유효하지 않은 백업 파일 형식입니다");
        return;
      }

      const incoming = data as unknown as BackupPayload;
      let restoredCount = 0;

      await db.transaction(
        "rw",
        db.workspaces,
        db.projects,
        async () => {
          for (const ws of incoming.workspaces) {
            const existing = await db.workspaces.get(ws.id);
            if (!existing || ws.updatedAt > existing.updatedAt) {
              await db.workspaces.put(ws);
            }
          }

          for (const proj of incoming.projects) {
            const existing = await db.projects.get(proj.id);
            if (!existing) {
              await db.projects.add(proj);
              restoredCount++;
            } else if (proj.updatedAt > existing.updatedAt) {
              await db.projects.put(proj);
              restoredCount++;
            }
          }
        },
      );

      await queryClient.invalidateQueries();
      toast.success(`${restoredCount}개 프로젝트가 복원되었습니다`);
    } catch (err) {
      console.error("Backup import failed:", err);
      toast.error("데이터 가져오기에 실패했습니다");
    }
  };

  return { importBackup };
}

export function useResetData() {
  const resetData = async () => {
    try {
      await db.delete();
      window.location.reload();
    } catch (err) {
      console.error("Data reset failed:", err);
      toast.error("데이터 초기화에 실패했습니다");
    }
  };

  return { resetData };
}
