"use client";

import { toast } from "sonner";
import { stripMemos } from "@/lib/strip-memos";
import { generateDesignMd } from "@/components/export/design-md-generator";
import { generateCliReferenceMd } from "@/components/export/cli-reference-md-generator";
import {
  generatePhaseMarkdown,
  type PhaseMarkdownExportKey,
} from "@/components/export/phase-md-generator";
import { APP_VERSION, SCHEMA_VERSION } from "@/lib/constants";
import type { Project } from "@/types/phases";
import { downloadBlob, exportFilenameTimestamp } from "@/lib/download";
import { runPdfExportWithProgressToast } from "@/components/export/pdf-export-progress-toast";
import { buildClaudeAgentZipEntries } from "@/components/export/claude-agent-generator";
import { buildOpenClawWorkspaceFiles } from "@/components/export/openclaw-workspace-generator";
import { zipStringFiles } from "@/lib/agent-zip";
import type { ExportJsonPhaseScope } from "@/lib/export-phase-scope";

export const timestamp = exportFilenameTimestamp;

export function useExport() {
  const exportJson = (project: Project, scope: "full" | ExportJsonPhaseScope = "full") => {
    const stripped = stripMemos(project.phases);
    const metaBase = {
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      projectType: project.type,
      schemaVersion: SCHEMA_VERSION,
      ...(project.type === "agent" && project.agentSubType
        ? { agentSubType: project.agentSubType }
        : {}),
      ...(project.type === "cli" && project.cliSubType
        ? { cliSubType: project.cliSubType }
        : {}),
    };
    const payload =
      scope === "full"
        ? {
            _meta: metaBase,
            ...stripped,
          }
        : {
            _meta: {
              ...metaBase,
              phase: scope,
            },
            [scope]: stripped[scope as keyof typeof stripped],
          };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    downloadBlob(blob, `${project.name}_${scope}_${timestamp()}.json`);
    toast.success("JSON 파일이 다운로드되었습니다");
  };

  const exportDesignMd = (project: Project) => {
    const md = generateDesignMd(project.name, project.phases.designSystem);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, "DESIGN.md");
    toast.success("DESIGN.md 파일이 다운로드되었습니다");
  };

  const exportCliReferenceMd = (project: Project) => {
    if (project.type !== "cli") {
      toast.error("CLI 프로젝트에서만 CLI_REFERENCE.md를 생성할 수 있습니다");
      return;
    }
    const md = generateCliReferenceMd(project);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, "CLI_REFERENCE.md");
    toast.success("CLI_REFERENCE.md 파일이 다운로드되었습니다");
  };

  const exportPdf = (project: Project) => {
    runPdfExportWithProgressToast(project);
  };

  const exportAgentZip = (project: Project) => {
    if (project.type !== "agent" || !project.agentSubType) {
      toast.error("에이전트 프로젝트만 번들 ZIP을 받을 수 있습니다");
      return;
    }
    const files =
      project.agentSubType === "claude-subagent"
        ? buildClaudeAgentZipEntries(project)
        : buildOpenClawWorkspaceFiles(project);
    const zip = zipStringFiles(files);
    const blob = new Blob([new Uint8Array(zip)], { type: "application/zip" });
    const suffix =
      project.agentSubType === "claude-subagent" ? "claude-agents" : "openclaw-workspace";
    downloadBlob(blob, `${project.name}_${suffix}_${timestamp()}.zip`);
    toast.success("ZIP 파일이 다운로드되었습니다");
  };

  const exportPhaseMarkdown = async (
    project: Project,
    phaseKey: PhaseMarkdownExportKey,
    mode: "copy" | "download",
  ) => {
    const markdown = generatePhaseMarkdown(project.name, project.phases, phaseKey);

    if (mode === "copy") {
      try {
        await navigator.clipboard.writeText(markdown);
        toast.success("마크다운이 클립보드에 복사되었습니다");
      } catch (err) {
        console.error("Markdown copy failed:", err);
        toast.error("마크다운 복사에 실패했습니다");
      }
      return;
    }

    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    downloadBlob(blob, `${project.name}_${phaseKey}_${timestamp()}.md`);
    toast.success("마크다운 파일이 다운로드되었습니다");
  };

  return {
    exportJson,
    exportDesignMd,
    exportCliReferenceMd,
    exportPdf,
    exportPhaseMarkdown,
    exportAgentZip,
  };
}
