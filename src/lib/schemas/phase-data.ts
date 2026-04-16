import { z } from "zod";
import type { AgentSubType } from "@/types/phases";
import { overviewSchema } from "./overview";
import { userScenarioSchema } from "./user-scenario";
import { requirementsSchema } from "./requirements";
import { infoArchitectureSchema } from "./info-architecture";
import { screenDesignSchema } from "./screen-design";
import { dataModelSchema } from "./data-model";
import { designSystemSchema } from "./design-system";
import { agentRequirementsSchema } from "./agent-requirements";
import { agentArchitecturePhaseSchema } from "./agent-architecture";
import { agentBehaviorPhaseSchema } from "./agent-behavior";
import { agentToolsPhaseSchema } from "./agent-tools";
import { agentSafetyPhaseSchema } from "./agent-safety";

export const memoSchema = z.object({
  id: z.string(),
  content: z.string().default(""),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const phaseMemosSchema = z
  .record(z.coerce.number(), z.array(memoSchema))
  .default({});

export const phaseDataSchema = z.object({
  overview: overviewSchema.default(() => overviewSchema.parse({})),
  userScenario: userScenarioSchema.default(() =>
    userScenarioSchema.parse({}),
  ),
  requirements: requirementsSchema.default(() =>
    requirementsSchema.parse({}),
  ),
  infoArchitecture: infoArchitectureSchema.default(() =>
    infoArchitectureSchema.parse({}),
  ),
  screenDesign: screenDesignSchema.default(() =>
    screenDesignSchema.parse({}),
  ),
  dataModel: dataModelSchema.default(() => dataModelSchema.parse({})),
  designSystem: designSystemSchema.default(() =>
    designSystemSchema.parse({}),
  ),
  agentRequirements: agentRequirementsSchema.optional(),
  agentArchitecture: agentArchitecturePhaseSchema.optional(),
  agentBehavior: agentBehaviorPhaseSchema.optional(),
  agentTools: agentToolsPhaseSchema.optional(),
  agentSafety: agentSafetyPhaseSchema.optional(),
  memos: phaseMemosSchema,
});

export type PhaseDataSchemaType = z.infer<typeof phaseDataSchema>;

export function createDefaultPhaseData(): PhaseDataSchemaType {
  return phaseDataSchema.parse({});
}

/** 신규 agent 프로젝트 — 에이전트 슬라이스를 서브타입에 맞게 채움 */
export function createAgentProjectPhaseData(
  agentSubType: AgentSubType,
): PhaseDataSchemaType {
  const base = phaseDataSchema.parse({});

  if (agentSubType === "claude-subagent") {
    return phaseDataSchema.parse({
      ...base,
      agentRequirements: {
        functional: [],
        nonFunctional: [],
        claude: {
          autonomyLevel: "suggest",
          permissionBoundary: "",
          contextScope: "project",
        },
      },
      agentArchitecture: {
        kind: "claude-subagent",
        claude: {
          pattern: "single",
          agents: [],
          delegationRules: [],
          dataFlow: [],
        },
      },
      agentBehavior: { kind: "claude-subagent", behaviors: [] },
      agentTools: {
        kind: "claude-subagent",
        claude: { globalTools: [], agentTools: [], hooks: [] },
      },
      agentSafety: {},
    });
  }

  return phaseDataSchema.parse({
    ...base,
    agentRequirements: {
      functional: [],
      nonFunctional: [],
      openclaw: {
        autonomyLevel: "reactive",
        alwaysOnRequired: false,
        messagingChannels: [],
        hardwareTarget: "",
        sandboxRequired: false,
      },
    },
    agentArchitecture: {
      kind: "openclaw",
      openclaw: {
        workspacePath: "~/.openclaw/workspace",
        sandboxConfig: {
          enabled: false,
          workspaceAccess: "rw",
          networkAccess: true,
        },
        multiAgent: false,
      },
    },
    agentBehavior: {
      kind: "openclaw",
      openclaw: {
        soul: {
          personality: "",
          communicationStyle: [],
          values: [],
          boundaries: [],
        },
        identity: { agentName: "", role: "", selfIntroduction: "" },
        agents: {
          safetyDefaults: [],
          sessionStartRules: [],
          memoryRules: [],
          sharedSpaceRules: [],
        },
        user: {
          name: "",
          timezone: "",
          background: "",
          preferences: [],
          workContext: "",
        },
        heartbeat: [],
      },
    },
    agentTools: {
      kind: "openclaw",
      openclaw: {
        channels: [],
        tools: { enabled: [], disabled: [], notes: "" },
        skills: [],
        gatewayConfig: { bindHost: "127.0.0.1", port: 18789 },
      },
    },
    agentSafety: {},
  });
}
