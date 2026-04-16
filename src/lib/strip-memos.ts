import type { PhaseData } from "@/types/phases";

export function stripMemos(phases: PhaseData): Omit<PhaseData, "memos"> {
  const { memos: _, ...rest } = phases;
  return rest;
}
