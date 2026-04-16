"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/services/store/editor-store";
import { OverviewPreview } from "@/components/preview/overview-preview";
import { UserScenarioPreview } from "@/components/preview/user-scenario-preview";
import { RequirementsPreview } from "@/components/preview/requirements-preview";
import { InfoArchitecturePreview } from "@/components/preview/info-architecture-preview";
import { ScreenDesignPreview } from "@/components/preview/screen-design-preview";
import { DataModelPreview } from "@/components/preview/data-model-preview";
import { DesignSystemPreview } from "@/components/preview/design-system-preview";
import { PHASE_LABELS } from "@/types/phases";
import { ScrollArea } from "@/components/ui/scroll-area";

const previewComponents: React.ComponentType[] = [
  OverviewPreview,
  UserScenarioPreview,
  RequirementsPreview,
  InfoArchitecturePreview,
  ScreenDesignPreview,
  DataModelPreview,
  DesignSystemPreview,
];

const TOTAL_PAGES = 7;

export function PrintPreview() {
  const printPreviewPage = useEditorStore((s) => s.printPreviewPage);
  const setPrintPreviewPage = useEditorStore((s) => s.setPrintPreviewPage);
  const setPrintPreview = useEditorStore((s) => s.setPrintPreview);

  const Preview = previewComponents[printPreviewPage];

  const prev = () => setPrintPreviewPage(Math.max(0, printPreviewPage - 1));
  const next = () => setPrintPreviewPage(Math.min(TOTAL_PAGES - 1, printPreviewPage + 1));

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
          <div
            className="relative overflow-hidden rounded-lg border bg-white shadow-md"
            style={{
              width: "297mm",
              maxWidth: "100%",
              aspectRatio: "297 / 210",
              padding: "15mm",
            }}
          >
            <div className="mb-4 flex items-center justify-between border-b pb-2">
              <span className="text-xs text-muted-foreground">
                {PHASE_LABELS[printPreviewPage]}
              </span>
              <span className="text-xs text-muted-foreground">
                {printPreviewPage + 1} / {TOTAL_PAGES}
              </span>
            </div>
            <div className="overflow-hidden text-sm">
              {Preview ? <Preview /> : null}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="flex items-center justify-center gap-4 border-t py-3">
        <Button variant="outline" size="sm" onClick={prev} disabled={printPreviewPage === 0}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm tabular-nums">
          {printPreviewPage + 1} / {TOTAL_PAGES}
        </span>
        <Button variant="outline" size="sm" onClick={next} disabled={printPreviewPage === TOTAL_PAGES - 1}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
