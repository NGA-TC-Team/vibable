import { z } from "zod";

export const claudeAgentBehaviorSchema = z.object({
  agentId: z.string(),
  systemPrompt: z.string().default(""),
  coreExpertise: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  outputFormat: z.string().default(""),
  constraints: z.array(z.string()).default([]),
  color: z.string().default("cyan"),
});

export const heartbeatTaskSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  schedule: z.string().default(""),
  action: z.string().default(""),
  enabled: z.boolean().default(true),
});

export const openClawBehaviorPhaseSchema = z.object({
  soul: z
    .object({
      personality: z.string().default(""),
      communicationStyle: z.array(z.string()).default([]),
      values: z.array(z.string()).default([]),
      boundaries: z.array(z.string()).default([]),
      tonePreset: z
        .enum(["efficient", "thoughtful", "friendly", "custom"])
        .optional(),
    })
    .default({
      personality: "",
      communicationStyle: [],
      values: [],
      boundaries: [],
    }),
  identity: z
    .object({
      agentName: z.string().default(""),
      role: z.string().default(""),
      selfIntroduction: z.string().default(""),
    })
    .default({ agentName: "", role: "", selfIntroduction: "" }),
  agents: z
    .object({
      safetyDefaults: z.array(z.string()).default([]),
      sessionStartRules: z.array(z.string()).default([]),
      memoryRules: z.array(z.string()).default([]),
      sharedSpaceRules: z.array(z.string()).default([]),
    })
    .default({
      safetyDefaults: [],
      sessionStartRules: [],
      memoryRules: [],
      sharedSpaceRules: [],
    }),
  user: z
    .object({
      name: z.string().default(""),
      timezone: z.string().default(""),
      background: z.string().default(""),
      preferences: z.array(z.string()).default([]),
      workContext: z.string().default(""),
    })
    .default({
      name: "",
      timezone: "",
      background: "",
      preferences: [],
      workContext: "",
    }),
  heartbeat: z.array(heartbeatTaskSchema).default([]),
});

export const agentBehaviorPhaseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("claude-subagent"),
    behaviors: z.array(claudeAgentBehaviorSchema).default([]),
  }),
  z.object({
    kind: z.literal("openclaw"),
    openclaw: openClawBehaviorPhaseSchema.default(() =>
      openClawBehaviorPhaseSchema.parse({}),
    ),
  }),
]);

export type AgentBehaviorSchemaType = z.infer<typeof agentBehaviorPhaseSchema>;
