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
import { PHASE_KEYS } from "@/types/phases";
import type { ZodType } from "zod";

const phaseSchemas: Record<number, ZodType> = {
  0: overviewSchema,
  1: userScenarioSchema,
  2: requirementsSchema,
  3: infoArchitectureSchema,
  4: screenDesignSchema,
  5: dataModelSchema,
  6: designSystemSchema,
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

      const { currentPhase, updatePhaseData } = useEditorStore.getState();
      const schema = phaseSchemas[currentPhase];
      if (!schema) return;

      const result = schema.safeParse(parsed);
      if (!result.success) return;

      e.preventDefault();

      const phaseKey = PHASE_KEYS[currentPhase];
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
