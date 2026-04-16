"use client";

import { useEditorStore } from "@/services/store/editor-store";
import { OverviewPreview } from "@/components/preview/overview-preview";
import { UserScenarioPreview } from "@/components/preview/user-scenario-preview";
import { RequirementsPreview } from "@/components/preview/requirements-preview";
import { InfoArchitecturePreview } from "@/components/preview/info-architecture-preview";
import { ScreenDesignPreview } from "@/components/preview/screen-design-preview";
import { DataModelPreview } from "@/components/preview/data-model-preview";
import { DesignSystemPreview } from "@/components/preview/design-system-preview";
import { ScrollArea } from "@/components/ui/scroll-area";

const previewComponents: Record<number, React.ComponentType> = {
  0: OverviewPreview,
  1: UserScenarioPreview,
  2: RequirementsPreview,
  3: InfoArchitecturePreview,
  4: ScreenDesignPreview,
  5: DataModelPreview,
  6: DesignSystemPreview,
};

export function PreviewPanel() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const Preview = previewComponents[currentPhase];

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        <div className="mx-auto aspect-[297/210] w-full max-w-3xl rounded-lg border bg-card p-8 shadow-sm">
          {Preview ? (
            <Preview />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              미리보기 준비 중...
            </div>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
