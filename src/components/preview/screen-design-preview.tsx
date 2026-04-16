"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { useMockup } from "@/hooks/use-mockup.hook";
import { useEditorStore } from "@/services/store/editor-store";
import { MockupCanvas } from "./mockup/mockup-canvas";
import type { ProjectType } from "@/types/phases";

function ScreenMockup({ pageId, projectType }: { pageId: string; projectType: ProjectType }) {
  const { page, viewport, setViewport, setElements } = useMockup(pageId);

  if (!page) return null;

  return (
    <div className="h-full">
      <MockupCanvas
        page={page}
        projectType={projectType}
        viewport={viewport}
        onViewportChange={setViewport}
        onMockupChange={setElements}
      />
    </div>
  );
}

export function ScreenDesignPreview() {
  const { data } = usePhaseData("screenDesign");
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  if (!data) return null;

  if (data.pages.length === 0) {
    return (
      <div className="space-y-4 text-sm">
        <h2 className="text-base font-semibold">화면 설계</h2>
        <p className="text-muted-foreground/50 italic">화면을 추가하세요</p>
      </div>
    );
  }

  const activePageId = selectedPageId ?? data.pages[0]?.id ?? null;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-3 px-2 pt-2">
        <Select value={activePageId ?? undefined} onValueChange={setSelectedPageId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="화면 선택" />
          </SelectTrigger>
          <SelectContent>
            {data.pages.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name || "이름 없음"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {activePageId && (
        <div className="flex-1 overflow-hidden">
          <ScreenMockupWrapper key={activePageId} pageId={activePageId} />
        </div>
      )}
    </div>
  );
}

function ScreenMockupWrapper({ pageId }: { pageId: string }) {
  const projectType = useEditorStore((s) => s.projectType);
  return <ScreenMockup pageId={pageId} projectType={projectType} />;
}
