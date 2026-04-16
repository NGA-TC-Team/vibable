"use client";

import { toast } from "sonner";
import { stripMemos } from "@/lib/strip-memos";
import { generateDesignMd } from "@/components/export/design-md-generator";
import { APP_VERSION, SCHEMA_VERSION } from "@/lib/constants";
import { PHASE_KEYS, type Project, type PhaseKey } from "@/types/phases";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

export function useExport() {
  const exportJson = (project: Project, scope: "full" | PhaseKey = "full") => {
    const stripped = stripMemos(project.phases);
    const payload =
      scope === "full"
        ? {
            _meta: {
              appVersion: APP_VERSION,
              exportedAt: new Date().toISOString(),
              projectType: project.type,
              schemaVersion: SCHEMA_VERSION,
            },
            ...stripped,
          }
        : {
            _meta: {
              appVersion: APP_VERSION,
              exportedAt: new Date().toISOString(),
              projectType: project.type,
              schemaVersion: SCHEMA_VERSION,
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

  const exportPdf = async (project: Project) => {
    try {
      toast.info("PDF 생성 중...");
      const { generatePdfBlob } = await import(
        "@/components/export/pdf-document"
      );
      const blob = await generatePdfBlob(project);
      downloadBlob(blob, `${project.name}_${timestamp()}.pdf`);
      toast.success("PDF 파일이 다운로드되었습니다");
    } catch (err) {
      console.error("PDF export failed:", err);
      toast.error("PDF 생성에 실패했습니다");
    }
  };

  return { exportJson, exportDesignMd, exportPdf };
}
