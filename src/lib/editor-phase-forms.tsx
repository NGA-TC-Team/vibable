"use client";

import type { ComponentType } from "react";
import type { AgentSubType, ProjectType } from "@/types/phases";
import { OverviewForm } from "@/components/phases/overview-form";
import { UserScenarioForm } from "@/components/phases/user-scenario-form";
import { RequirementsForm } from "@/components/phases/requirements-form";
import { InfoArchitectureForm } from "@/components/phases/info-architecture-form";
import { ScreenDesignForm } from "@/components/phases/screen-design-form";
import { DataModelForm } from "@/components/phases/data-model-form";
import { DesignSystemForm } from "@/components/phases/design-system-form";
import { AgentRequirementsForm } from "@/components/phases/agent-requirements-form";
import { ClaudePipelineForm } from "@/components/phases/claude-pipeline-form";
import { ClaudeBehaviorForm } from "@/components/phases/claude-behavior-form";
import { ClaudeToolsForm } from "@/components/phases/claude-tools-form";
import { OpenClawArchitectureForm } from "@/components/phases/openclaw-architecture-form";
import { OpenClawBehaviorForm } from "@/components/phases/openclaw-behavior-form";
import { OpenClawToolsForm } from "@/components/phases/openclaw-tools-form";
import { AgentSafetyForm } from "@/components/phases/agent-safety-form";

export type PhaseFormComponent = ComponentType<{ disabled?: boolean }>;

export function getPhaseFormComponent(
  projectType: ProjectType,
  agentSubType: AgentSubType | null,
  phaseIndex: number,
): PhaseFormComponent | null {
  const sub = agentSubType ?? "claude-subagent";
  if (projectType === "agent") {
    if (phaseIndex === 0) return OverviewForm;
    if (phaseIndex === 1) return UserScenarioForm;
    if (phaseIndex === 2) return AgentRequirementsForm;
    if (phaseIndex === 3) {
      return sub === "openclaw"
        ? OpenClawArchitectureForm
        : ClaudePipelineForm;
    }
    if (phaseIndex === 4) {
      return sub === "openclaw" ? OpenClawBehaviorForm : ClaudeBehaviorForm;
    }
    if (phaseIndex === 5) {
      return sub === "openclaw" ? OpenClawToolsForm : ClaudeToolsForm;
    }
    if (phaseIndex === 6) return AgentSafetyForm;
    return null;
  }

  const legacy: Record<number, PhaseFormComponent> = {
    0: OverviewForm,
    1: UserScenarioForm,
    2: RequirementsForm,
    3: InfoArchitectureForm,
    4: ScreenDesignForm,
    5: DataModelForm,
    6: DesignSystemForm,
  };
  return legacy[phaseIndex] ?? null;
}

export function getPhaseTooltipKey(
  projectType: ProjectType,
  phaseIndex: number,
):
  | "phase.overview"
  | "phase.userScenario"
  | "phase.requirements"
  | "phase.infoArchitecture"
  | "phase.screenDesign"
  | "phase.dataModel"
  | "phase.designSystem"
  | "phase.agentRequirements"
  | "phase.agentArchitecture"
  | "phase.agentBehavior"
  | "phase.agentTools"
  | "phase.agentSafety" {
  if (projectType === "agent") {
    const keys = [
      "phase.overview",
      "phase.userScenario",
      "phase.agentRequirements",
      "phase.agentArchitecture",
      "phase.agentBehavior",
      "phase.agentTools",
      "phase.agentSafety",
    ] as const;
    return keys[phaseIndex] ?? "phase.overview";
  }
  const keys = [
    "phase.overview",
    "phase.userScenario",
    "phase.requirements",
    "phase.infoArchitecture",
    "phase.screenDesign",
    "phase.dataModel",
    "phase.designSystem",
  ] as const;
  return keys[phaseIndex] ?? "phase.overview";
}
