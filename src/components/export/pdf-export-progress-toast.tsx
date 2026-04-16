"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Project } from "@/types/phases";
import { downloadBlob, exportFilenameTimestamp } from "@/lib/download";
import { Progress } from "@/components/ui/progress";

const PDF_TOAST_POSITION = "bottom-right" as const;

function PdfProgressBody({
  toastId,
  project,
}: {
  toastId: string | number;
  project: Project;
}) {
  const [progress, setProgress] = useState(5);
  const [hint, setHint] = useState("PDF 모듈 준비 중");

  useEffect(() => {
    let alive = true;
    const bump = () => {
      setProgress((p) => (alive ? Math.min(p + 2.5 + Math.random() * 6.5, 88) : p));
    };
    const interval = window.setInterval(bump, 360);

    void (async () => {
      try {
        const { generatePdfBlob } = await import("@/components/export/pdf-document");
        if (!alive) return;
        setHint("문서 렌더링 중");
        setProgress((p) => Math.max(p, 18));

        const blob = await generatePdfBlob(project);
        if (!alive) return;

        window.clearInterval(interval);
        setProgress(100);
        setHint("다운로드 준비 완료");
        await new Promise((r) => setTimeout(r, 200));
        if (!alive) return;

        downloadBlob(blob, `${project.name}_${exportFilenameTimestamp()}.pdf`);
        toast.dismiss(toastId);
        toast.success("PDF 파일이 다운로드되었습니다", {
          position: PDF_TOAST_POSITION,
        });
      } catch (err) {
        console.error("PDF export failed:", err);
        window.clearInterval(interval);
        toast.dismiss(toastId);
        toast.error("PDF 생성에 실패했습니다", { position: PDF_TOAST_POSITION });
      }
    })();

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [project, toastId]);

  const pct = Math.min(100, Math.round(progress));

  return (
    <div className="flex min-w-[260px] max-w-[320px] flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">PDF 생성 중</span>
        <span className="text-muted-foreground text-xs tabular-nums">{pct}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-muted-foreground text-[11px] leading-snug">{hint}</p>
    </div>
  );
}

export function runPdfExportWithProgressToast(project: Project) {
  toast.custom((id) => <PdfProgressBody toastId={id} project={project} />, {
    duration: Infinity,
    position: PDF_TOAST_POSITION,
  });
}
