import { z } from "zod";
import type { AgentSubType, CliSubType } from "@/types/phases";
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
import { cliRequirementsSchema } from "./cli-requirements";
import { commandTreeSchema } from "./command-tree";
import { cliContractSchema } from "./cli-contract";
import { cliConfigSchema } from "./cli-config";
import { cliTerminalUxSchema } from "./cli-terminal-ux";

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
  cliRequirements: cliRequirementsSchema.optional(),
  commandTree: commandTreeSchema.optional(),
  cliContract: cliContractSchema.optional(),
  cliConfig: cliConfigSchema.optional(),
  cliTerminalUx: cliTerminalUxSchema.optional(),
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

function defaultGlobalFlags(cliSubType: CliSubType) {
  const humanFlags = [
    { id: crypto.randomUUID(), long: "--help", short: "-h", kind: "boolean" as const, required: false, repeatable: false, description: "도움말 표시" },
    { id: crypto.randomUUID(), long: "--version", kind: "boolean" as const, required: false, repeatable: false, description: "버전 표시" },
    { id: crypto.randomUUID(), long: "--verbose", short: "-v", kind: "count" as const, required: false, repeatable: true, description: "상세 로그 (반복 가능)" },
    { id: crypto.randomUUID(), long: "--quiet", short: "-q", kind: "boolean" as const, required: false, repeatable: false, description: "최소 출력" },
    { id: crypto.randomUUID(), long: "--no-color", kind: "boolean" as const, required: false, repeatable: false, description: "색상 비활성화 (NO_COLOR 존중)" },
  ];
  const agentFlags = [
    { id: crypto.randomUUID(), long: "--help", short: "-h", kind: "boolean" as const, required: false, repeatable: false, description: "도움말 표시" },
    { id: crypto.randomUUID(), long: "--version", kind: "boolean" as const, required: false, repeatable: false, description: "버전 표시" },
    { id: crypto.randomUUID(), long: "--json", kind: "boolean" as const, required: false, repeatable: false, description: "JSON 출력 (기계 파싱용)" },
    { id: crypto.randomUUID(), long: "--quiet", kind: "boolean" as const, required: false, repeatable: false, description: "진행 표시 억제" },
    { id: crypto.randomUUID(), long: "--no-input", kind: "boolean" as const, required: false, repeatable: false, description: "대화식 프롬프트 금지" },
  ];
  if (cliSubType === "human-first") return humanFlags;
  if (cliSubType === "agent-first") return agentFlags;
  const seen = new Set<string>();
  return [...humanFlags, ...agentFlags].filter((f) => {
    if (seen.has(f.long)) return false;
    seen.add(f.long);
    return true;
  });
}

function defaultConventions(cliSubType: CliSubType) {
  return {
    piscesRule: true,
    quietFlag: "--quiet",
    verboseFlag: cliSubType === "agent-first" ? "" : "-v/--verbose",
    jsonFlag: cliSubType === "human-first" ? "" : "--json",
    formatFlag: "--format",
  };
}

function defaultCliConfig(cliSubType: CliSubType) {
  return {
    configFiles: [],
    envVars: [],
    secrets: {
      supportedStores:
        cliSubType === "agent-first"
          ? (["env-var"] as const)
          : (["os-keychain", "env-var", "encrypted-file"] as const),
      preferredStore:
        cliSubType === "agent-first" ? ("env-var" as const) : ("os-keychain" as const),
      rotationPolicy: "",
      redactInLogs: true,
    },
    fsLayout: {
      configDir: "$XDG_CONFIG_HOME",
      cacheDir: "$XDG_CACHE_HOME",
      stateDir: "$XDG_STATE_HOME",
      logsDir: "$XDG_STATE_HOME/logs",
      ensureCreated: true,
    },
    outputSchemas: [],
    entityReuse: false,
  };
}

function defaultTerminalUx(cliSubType: CliSubType) {
  return {
    palette: {
      primary: "cyan" as const,
      success: "green" as const,
      warning: "yellow" as const,
      danger: "red" as const,
      info: "blue" as const,
      muted: "brightBlack" as const,
      respectNoColor: true as const,
    },
    iconSet: cliSubType === "agent-first" ? ("none" as const) : ("ascii" as const),
    tableStyle:
      cliSubType === "agent-first" ? ("plain" as const) : ("unicode-box" as const),
    logPolicy: {
      levels: ["silent", "error", "warn", "info", "debug", "trace"] as const,
      defaultLevel: cliSubType === "agent-first" ? ("warn" as const) : ("info" as const),
      verboseFlag: "-v/--verbose",
      quietFlag: "--quiet",
      envOverride: "",
    },
    helpTemplate: {
      sections: [
        "usage",
        "description",
        "flags",
        "commands",
        "examples",
        "env-vars",
        "exit-codes",
        "see-also",
      ] as const,
      headerStyle: "uppercase" as const,
      exampleCount: 2,
      includeAgentSection: cliSubType !== "human-first",
    },
    errorTemplates: [],
    toneLevel: 3 as const,
    uxWritingGlossary: [],
    agentChecklist: {
      stableJsonOutput: cliSubType !== "human-first",
      nonInteractiveFallback: cliSubType !== "human-first",
      respectsTtyAndNoColor: true,
      semanticExitCodes: cliSubType !== "human-first",
      streamingEvents: cliSubType === "agent-first",
      deterministicOutput: cliSubType !== "human-first",
      mcpBridge:
        cliSubType === "agent-first"
          ? ("native" as const)
          : cliSubType === "hybrid"
            ? ("wrapper" as const)
            : ("none" as const),
      nonInteractiveAuth: cliSubType !== "human-first",
      tokenEfficient: true,
    },
  };
}

/** 신규 cli 프로젝트 — CLI 슬라이스를 서브타입에 맞게 채움 */
export function createCliProjectPhaseData(
  cliSubType: CliSubType,
): PhaseDataSchemaType {
  const base = phaseDataSchema.parse({});

  return phaseDataSchema.parse({
    ...base,
    cliRequirements: {
      functional: [],
      nonFunctional: [],
      platformMatrix: {
        os: ["macos", "linux"],
        arch: ["x86_64", "arm64"],
        shells: ["bash", "zsh"],
      },
      authMethods:
        cliSubType === "agent-first" ? ["env-var"] : ["env-var", "config-file"],
      destructivePolicy: {
        requiresConfirmation: cliSubType !== "agent-first",
        confirmationFlag: "--yes",
        dryRunSupported: true,
        auditTrail: "stderr-log",
      },
      offlineFirst: cliSubType === "human-first",
    },
    commandTree: {
      rootBinary: "",
      convention: "verb-noun",
      globalFlags: defaultGlobalFlags(cliSubType),
      commands: [],
      completions: {
        shells: cliSubType === "agent-first" ? ["bash"] : ["bash", "zsh", "fish"],
        strategy:
          cliSubType === "agent-first" ? "none" : "static-generated",
      },
      helpStyle: {
        includeExamplesInHelp: true,
        includeEnvVarsInHelp: true,
        colorizeHelp: cliSubType !== "agent-first",
      },
    },
    cliContract: {
      contracts: [],
      globalConventions: defaultConventions(cliSubType),
    },
    cliConfig: defaultCliConfig(cliSubType),
    cliTerminalUx: defaultTerminalUx(cliSubType),
  });
}
