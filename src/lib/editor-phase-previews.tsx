"use client";

import type { ComponentType } from "react";
import type { AgentSubType, ProjectType } from "@/types/phases";
import { OverviewPreview } from "@/components/preview/overview-preview";
import { UserScenarioPreview } from "@/components/preview/user-scenario-preview";
import { RequirementsPreview } from "@/components/preview/requirements-preview";
import { InfoArchitecturePreview } from "@/components/preview/info-architecture-preview";
import { ScreenDesignPreview } from "@/components/preview/screen-design-preview";
import { DataModelPreview } from "@/components/preview/data-model-preview";
import { DesignSystemPreview } from "@/components/preview/design-system-preview";
import { AgentRequirementsPreview } from "@/components/preview/agent-requirements-preview";
import { ClaudePipelinePreview } from "@/components/preview/claude-pipeline-preview";
import { ClaudeBehaviorPreview } from "@/components/preview/claude-behavior-preview";
import { ClaudeToolsPreview } from "@/components/preview/claude-tools-preview";
import { OpenClawArchitecturePreview } from "@/components/preview/openclaw-architecture-preview";
import { OpenClawBehaviorPreview } from "@/components/preview/openclaw-behavior-preview";
import { OpenClawToolsPreview } from "@/components/preview/openclaw-tools-preview";
import { AgentSafetyPreview } from "@/components/preview/agent-safety-preview";

export type PhasePreviewComponent = ComponentType;

export function getPhasePreviewComponent(
  projectType: ProjectType,
  agentSubType: AgentSubType | null,
  phaseIndex: number,
): PhasePreviewComponent | null {
  const sub = agentSubType ?? "claude-subagent";
  if (projectType === "agent") {
    if (phaseIndex === 0) return OverviewPreview;
    if (phaseIndex === 1) return UserScenarioPreview;
    if (phaseIndex === 2) return AgentRequirementsPreview;
    if (phaseIndex === 3) {
      return sub === "openclaw"
        ? OpenClawArchitecturePreview
        : ClaudePipelinePreview;
    }
    if (phaseIndex === 4) {
      return sub === "openclaw" ? OpenClawBehaviorPreview : ClaudeBehaviorPreview;
    }
    if (phaseIndex === 5) {
      return sub === "openclaw" ? OpenClawToolsPreview : ClaudeToolsPreview;
    }
    if (phaseIndex === 6) return AgentSafetyPreview;
    return null;
  }

  const legacy: Record<number, PhasePreviewComponent> = {
    0: OverviewPreview,
    1: UserScenarioPreview,
    2: RequirementsPreview,
    3: InfoArchitecturePreview,
    4: ScreenDesignPreview,
    5: DataModelPreview,
    6: DesignSystemPreview,
  };
  return legacy[phaseIndex] ?? null;
}
