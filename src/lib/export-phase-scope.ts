import { AGENT_PHASE_KEYS, PHASE_KEYS, type Project } from "@/types/phases";

export type ExportJsonPhaseScope =
  | (typeof PHASE_KEYS)[number]
  | (typeof AGENT_PHASE_KEYS)[number];

export function getPhaseExportScope(
  project: Project,
  phaseIndex: number,
): ExportJsonPhaseScope {
  if (project.type === "agent") {
    return AGENT_PHASE_KEYS[phaseIndex];
  }
  return PHASE_KEYS[phaseIndex];
}
