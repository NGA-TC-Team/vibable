"use client";

import { useRef } from "react";
import { useEditorStore } from "@/services/store/editor-store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplatePromptModal } from "./template-prompt-modal";
import { SectionHeader } from "./section-header";
import { useJsonPaste } from "@/hooks/use-json-paste.hook";
import { AGENT_PHASE_LABELS, CLI_PHASE_LABELS, PHASE_LABELS } from "@/types/phases";
import { SECTION_TOOLTIPS } from "@/lib/constants";
import { getPhaseFormComponent, getPhaseTooltipKey } from "@/lib/editor-phase-forms";

export function FormPanel() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const projectType = useEditorStore((s) => s.projectType);
  const agentSubType = useEditorStore((s) => s.agentSubType);
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const containerRef = useRef<HTMLDivElement>(null);

  useJsonPaste(containerRef);

  const Form = getPhaseFormComponent(projectType, agentSubType, currentPhase);
  const phaseTitle =
    projectType === "agent"
      ? AGENT_PHASE_LABELS[currentPhase]
      : projectType === "cli"
        ? CLI_PHASE_LABELS[currentPhase]
        : PHASE_LABELS[currentPhase];
  const tooltipKey = getPhaseTooltipKey(projectType, currentPhase);

  return (
    <ScrollArea className="h-full">
      <div ref={containerRef} data-slot="form-panel" className="px-5 py-6 space-y-4">
        <SectionHeader
          title={phaseTitle}
          tooltip={SECTION_TOOLTIPS[tooltipKey] ?? ""}
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
