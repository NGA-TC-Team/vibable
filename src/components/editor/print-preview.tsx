"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
import { Document, Page as PdfPage, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/services/store/editor-store";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { PHASE_LABELS } from "@/types/phases";
import { ScrollArea } from "@/components/ui/scroll-area";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PrintPreview() {
  const printPreviewPage = useEditorStore((s) => s.printPreviewPage);
  const setPrintPreviewPage = useEditorStore((s) => s.setPrintPreviewPage);
  const setPrintPreview = useEditorStore((s) => s.setPrintPreview);
  const phaseData = useEditorStore((s) => s.phaseData);

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  const generatePdf = useCallback(async () => {
    if (!phaseData) return;
    setIsGenerating(true);
    try {
      const { generatePdfBlob } = await import("@/components/export/pdf-document");
      const projectType = useEditorStore.getState().projectType;
      const fakeProject = {
        id: "preview",
        workspaceId: "preview",
        name: phaseData.overview.projectName || "미리보기",
        type: projectType,
        currentPhase: 0,
        phases: phaseData,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const blob = await generatePdfBlob(fakeProject);
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      const url = URL.createObjectURL(blob);
      prevUrlRef.current = url;
      setPdfUrl(url);
    } catch {
      // PDF 생성 실패 시 무시
    } finally {
      setIsGenerating(false);
    }
  }, [phaseData]);

  useEffect(() => {
    const timer = setTimeout(generatePdf, 1000);
    return () => clearTimeout(timer);
  }, [generatePdf]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    };
  }, []);

  const prev = () => setPrintPreviewPage(Math.max(0, printPreviewPage - 1));
  const next = () => setPrintPreviewPage(Math.min(numPages - 1, printPreviewPage + 1));

  const onDocumentLoadSuccess = ({ numPages: n }: { numPages: number }) => {
    setNumPages(n);
    if (printPreviewPage >= n) setPrintPreviewPage(Math.max(0, n - 1));
  };

  return (
    <div className="flex h-full flex-col bg-muted/30">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="text-sm font-semibold">출력 미리보기</h3>
        <Button variant="ghost" size="icon-xs" onClick={() => setPrintPreview(false)}>
          <X className="size-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex justify-center p-6">
          {isGenerating && !pdfUrl && (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" />
              <span className="text-sm">PDF 생성 중...</span>
            </div>
          )}
          {pdfUrl && (
            <div className="rounded-lg border bg-white shadow-md overflow-hidden">
              <Document
                file={pdfUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center gap-2 p-10 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm">로딩 중...</span>
                  </div>
                }
              >
                <PdfPage
                  pageNumber={printPreviewPage + 1}
                  width={700}
                  renderAnnotationLayer={false}
                  renderTextLayer={false}
                />
              </Document>
            </div>
          )}
          {!pdfUrl && !isGenerating && (
            <div className="py-20 text-sm text-muted-foreground">
              PDF를 생성할 데이터가 없습니다.
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex items-center justify-center gap-4 border-t py-3">
        <Button variant="outline" size="sm" onClick={prev} disabled={printPreviewPage === 0}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm tabular-nums">
          {numPages > 0 ? `${printPreviewPage + 1} / ${numPages}` : "— / —"}
        </span>
        <Button variant="outline" size="sm" onClick={next} disabled={printPreviewPage >= numPages - 1}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
