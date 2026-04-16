"use client";

import { useEditorStore } from "@/services/store/editor-store";
import type { PhaseData, PhaseKey } from "@/types/phases";

export function usePhaseData<K extends PhaseKey>(phaseKey: K) {
  const data = useEditorStore((s) => s.phaseData?.[phaseKey] ?? null) as PhaseData[K] | null;
  const updatePhaseData = useEditorStore((s) => s.updatePhaseData);

  const setData = (value: PhaseData[K]) => {
    updatePhaseData((prev) => ({
      ...prev,
      [phaseKey]: value,
    }));
  };

  const patchData = (patch: Partial<PhaseData[K]>) => {
    updatePhaseData((prev) => ({
      ...prev,
      [phaseKey]: { ...prev[phaseKey], ...patch },
    }));
  };

  return { data, setData, patchData };
}
