"use client";

import { useEditorStore } from "@/services/store/editor-store";
import type { PhaseData } from "@/types/phases";

/** PhaseKey 외 `agentRequirements` 등 에이전트 슬라이스 포함 */
export function usePhaseData<K extends keyof PhaseData>(phaseKey: K) {
  const data = useEditorStore((s) => s.phaseData?.[phaseKey] ?? null) as
    | PhaseData[K]
    | null;
  const updatePhaseData = useEditorStore((s) => s.updatePhaseData);

  const setData = (value: PhaseData[K]) => {
    updatePhaseData((prev) => ({
      ...prev,
      [phaseKey]: value,
    }));
  };

  const patchData = (patch: Partial<PhaseData[K]>) => {
    updatePhaseData((prev) => {
      const prevSlice = prev[phaseKey];
      const base =
        prevSlice != null && typeof prevSlice === "object"
          ? (prevSlice as object)
          : {};
      return {
        ...prev,
        [phaseKey]: { ...base, ...patch } as PhaseData[K],
      };
    });
  };

  return { data, setData, patchData };
}
