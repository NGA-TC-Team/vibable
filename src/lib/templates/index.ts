import type { AgentSubType, ProjectType } from "@/types/phases";
import { overviewTemplates } from "./overview";
import { userScenarioTemplates } from "./user-scenario";
import { requirementsTemplates } from "./requirements";
import { infoArchitectureTemplates } from "./info-architecture";
import { screenDesignTemplates } from "./screen-design";
import { dataModelTemplates } from "./data-model";
import { designSystemTemplates } from "./design-system";
import {
  agentPhase2Templates,
  claudePhaseTemplates,
  openclawPhaseTemplates,
} from "./agent";
import { cliRequirementsTemplates } from "./cli-requirements";
import { commandTreeTemplates } from "./command-tree";
import { cliContractTemplates } from "./cli-contract";
import { cliConfigTemplates } from "./cli-config";
import { cliTerminalUxTemplates } from "./cli-terminal-ux";

export const cliPhaseTemplates: Record<number, PhaseTemplate[]> = {
  2: cliRequirementsTemplates,
  3: commandTreeTemplates,
  4: cliContractTemplates,
  5: cliConfigTemplates,
  6: cliTerminalUxTemplates,
};

export interface PhaseTemplate {
  id: string;
  name: string;
  description: string;
  promptTemplate: string;
}

export const templatesByPhase: Record<number, PhaseTemplate[]> = {
  0: overviewTemplates,
  1: userScenarioTemplates,
  2: requirementsTemplates,
  3: infoArchitectureTemplates,
  4: screenDesignTemplates,
  5: dataModelTemplates,
  6: designSystemTemplates,
};

export function getTemplates(opts: {
  projectType: ProjectType;
  agentSubType: AgentSubType | null;
  phase: number;
}): PhaseTemplate[] {
  const { projectType, agentSubType, phase } = opts;
  if (projectType === "cli") {
    if (phase <= 1) return templatesByPhase[phase] ?? [];
    return cliPhaseTemplates[phase] ?? [];
  }
  if (projectType === "agent") {
    if (phase <= 1) return templatesByPhase[phase] ?? [];
    if (phase === 2) return agentPhase2Templates;
    const sub = agentSubType ?? "claude-subagent";
    if (sub === "openclaw") return openclawPhaseTemplates[phase] ?? [];
    return claudePhaseTemplates[phase] ?? [];
  }
  return templatesByPhase[phase] ?? [];
}

export {
  overviewTemplates,
  userScenarioTemplates,
  requirementsTemplates,
  infoArchitectureTemplates,
  screenDesignTemplates,
  dataModelTemplates,
  designSystemTemplates,
};
