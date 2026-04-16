"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useEditorStore } from "@/services/store/editor-store";
import { overviewSchema } from "@/lib/schemas/overview";
import { userScenarioSchema } from "@/lib/schemas/user-scenario";
import { requirementsSchema } from "@/lib/schemas/requirements";
import { infoArchitectureSchema } from "@/lib/schemas/info-architecture";
import { screenDesignSchema } from "@/lib/schemas/screen-design";
import { dataModelSchema } from "@/lib/schemas/data-model";
import { designSystemSchema } from "@/lib/schemas/design-system";
import { agentRequirementsSchema } from "@/lib/schemas/agent-requirements";
import { agentArchitecturePhaseSchema } from "@/lib/schemas/agent-architecture";
import { agentBehaviorPhaseSchema } from "@/lib/schemas/agent-behavior";
import { agentToolsPhaseSchema } from "@/lib/schemas/agent-tools";
import { agentSafetyPhaseSchema } from "@/lib/schemas/agent-safety";
import { AGENT_PHASE_KEYS, PHASE_KEYS } from "@/types/phases";
import type { ZodType } from "zod";

const legacyPhaseSchemas: Record<number, ZodType> = {
  0: overviewSchema,
  1: userScenarioSchema,
  2: requirementsSchema,
  3: infoArchitectureSchema,
  4: screenDesignSchema,
  5: dataModelSchema,
  6: designSystemSchema,
};

const agentPhaseSchemas: Record<number, ZodType> = {
  0: overviewSchema,
  1: userScenarioSchema,
  2: agentRequirementsSchema,
  3: agentArchitecturePhaseSchema,
  4: agentBehaviorPhaseSchema,
  5: agentToolsPhaseSchema,
  6: agentSafetyPhaseSchema,
};

export function useJsonPaste(containerRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handler = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text/plain");
      if (!text) return;

      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        return;
      }

      const { currentPhase, updatePhaseData, projectType } = useEditorStore.getState();
      const isAgent = projectType === "agent";
      const schema = isAgent
        ? agentPhaseSchemas[currentPhase]
        : legacyPhaseSchemas[currentPhase];
      if (!schema) return;

      const result = schema.safeParse(parsed);
      if (!result.success) return;

      e.preventDefault();

      const phaseKey = isAgent
        ? AGENT_PHASE_KEYS[currentPhase]
        : PHASE_KEYS[currentPhase];
      updatePhaseData((prev) => ({
        ...prev,
        [phaseKey]: result.data,
      }));

      toast.success("AI 응답이 적용되었습니다");
    };

    el.addEventListener("paste", handler as EventListener);
    return () => el.removeEventListener("paste", handler as EventListener);
  }, [containerRef]);
}
