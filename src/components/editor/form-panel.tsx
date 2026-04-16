"use client";

import { useRef } from "react";
import { useEditorStore } from "@/services/store/editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OverviewForm } from "@/components/phases/overview-form";
import { UserScenarioForm } from "@/components/phases/user-scenario-form";
import { RequirementsForm } from "@/components/phases/requirements-form";
import { InfoArchitectureForm } from "@/components/phases/info-architecture-form";
import { ScreenDesignForm } from "@/components/phases/screen-design-form";
import { DataModelForm } from "@/components/phases/data-model-form";
import { DesignSystemForm } from "@/components/phases/design-system-form";
import { TemplatePromptModal } from "./template-prompt-modal";
import { SectionHeader } from "./section-header";
import { useJsonPaste } from "@/hooks/use-json-paste.hook";
import { PHASE_LABELS } from "@/types/phases";
import { SECTION_TOOLTIPS } from "@/lib/constants";

const PHASE_TOOLTIP_KEYS = [
  "phase.overview",
  "phase.userScenario",
  "phase.requirements",
  "phase.infoArchitecture",
  "phase.screenDesign",
  "phase.dataModel",
  "phase.designSystem",
] as const;

const formComponents: Record<
  number,
  React.ComponentType<{ disabled?: boolean }>
> = {
  0: OverviewForm,
  1: UserScenarioForm,
  2: RequirementsForm,
  3: InfoArchitectureForm,
  4: ScreenDesignForm,
  5: DataModelForm,
  6: DesignSystemForm,
};

export function FormPanel() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const containerRef = useRef<HTMLDivElement>(null);

  useJsonPaste(containerRef);

  const Form = formComponents[currentPhase];

  return (
    <ScrollArea className="h-full">
      <div ref={containerRef} data-slot="form-panel" className="px-5 py-6 space-y-4">
        <SectionHeader
          title={PHASE_LABELS[currentPhase]}
          tooltip={SECTION_TOOLTIPS[PHASE_TOOLTIP_KEYS[currentPhase]] ?? ""}
        >
          {!isReadOnly && <TemplatePromptModal />}
        </SectionHeader>
        {Form ? (
          <Form disabled={isReadOnly} />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            이 페이즈의 폼은 곧 구현됩니다
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
