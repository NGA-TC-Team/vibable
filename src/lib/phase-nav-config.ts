import type { PhaseData } from "@/types/phases";

export const LEGACY_PHASE_DATA_KEYS = [
  "overview",
  "userScenario",
  "requirements",
  "infoArchitecture",
  "screenDesign",
  "dataModel",
  "designSystem",
] as const;

export const AGENT_PHASE_DATA_KEYS = [
  "overview",
  "userScenario",
  "agentRequirements",
  "agentArchitecture",
  "agentBehavior",
  "agentTools",
  "agentSafety",
] as const;

export type LegacyPhaseDataKey = (typeof LEGACY_PHASE_DATA_KEYS)[number];
export type AgentPhaseDataKey = (typeof AGENT_PHASE_DATA_KEYS)[number];

export function isLegacyPhaseComplete(
  phaseIndex: number,
  slice: unknown,
): boolean {
  if (!slice) return false;
  const pd = slice as Record<string, unknown>;
  switch (phaseIndex) {
    case 0:
      return !!(pd as { projectName?: string }).projectName;
    case 1:
      return ((pd as { personas?: unknown[] }).personas?.length ?? 0) > 0;
    case 2:
      return ((pd as { functional?: unknown[] }).functional?.length ?? 0) > 0;
    case 3:
      return ((pd as { sitemap?: unknown[] }).sitemap?.length ?? 0) > 0;
    case 4:
      return ((pd as { pages?: unknown[] }).pages?.length ?? 0) > 0;
    case 5:
      return ((pd as { entities?: unknown[] }).entities?.length ?? 0) > 0;
    case 6:
      return !!(pd as { visualTheme?: { mood?: string } }).visualTheme?.mood;
    default:
      return false;
  }
}

export function isAgentPhaseComplete(phaseIndex: number, phaseData: PhaseData): boolean {
  switch (phaseIndex) {
    case 0:
      return !!phaseData.overview?.projectName?.trim();
    case 1:
      return (phaseData.userScenario?.personas?.length ?? 0) > 0;
    case 2:
      return (phaseData.agentRequirements?.functional?.length ?? 0) > 0;
    case 3: {
      const ar = phaseData.agentArchitecture;
      if (!ar) return false;
      if (ar.kind === "claude-subagent") {
        return (ar.claude.agents?.length ?? 0) > 0;
      }
      return !!ar.openclaw.workspacePath?.trim();
    }
    case 4: {
      const b = phaseData.agentBehavior;
      if (!b) return false;
      if (b.kind === "claude-subagent") {
        return (b.behaviors?.length ?? 0) > 0;
      }
      return !!b.openclaw.soul?.personality?.trim();
    }
    case 5: {
      const t = phaseData.agentTools;
      if (!t) return false;
      if (t.kind === "claude-subagent") {
        const c = t.claude;
        return (c.globalTools?.length ?? 0) > 0 || (c.hooks?.length ?? 0) > 0;
      }
      return (
        (t.openclaw.channels?.length ?? 0) > 0 ||
        !!t.openclaw.tools?.notes?.trim()
      );
    }
    case 6: {
      const s = phaseData.agentSafety;
      if (!s) return false;
      return (
        (s.riskScenarios?.length ?? 0) > 0 ||
        !!s.rollbackPlan?.trim() ||
        (s.testCases?.length ?? 0) > 0
      );
    }
    default:
      return false;
  }
}
