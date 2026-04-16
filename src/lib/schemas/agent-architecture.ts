import { z } from "zod";

export const agentDefinitionSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  role: z.string().default(""),
  description: z.string().default(""),
  model: z.enum(["inherit", "opus", "sonnet", "haiku"]).default("inherit"),
  toolAccess: z.array(z.string()).default([]),
  permissionMode: z.enum(["default", "plan", "bypassPermissions"]).default("default"),
  memoryScope: z.enum(["user", "project", "none"]).default("project"),
});

export const pipelineStepSchema = z.object({
  id: z.string(),
  from: z.string().default(""),
  to: z.string().default(""),
  trigger: z.string().default(""),
  dataFormat: z.string().default(""),
});

export const claudePipelinePhaseSchema = z.object({
  pattern: z
    .enum(["single", "orchestrator-subagent", "explore-plan-execute", "custom"])
    .default("single"),
  agents: z.array(agentDefinitionSchema).default([]),
  delegationRules: z.array(z.string()).default([]),
  dataFlow: z.array(pipelineStepSchema).default([]),
});

export const openClawAgentConfigSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  workspace: z.string().default(""),
  channels: z.array(z.string()).default([]),
});

export const channelRouteSchema = z.object({
  id: z.string(),
  channel: z.string().default(""),
  agentId: z.string().default(""),
  sessionType: z.enum(["private", "group"]).default("private"),
});

export const openClawArchitecturePhaseSchema = z.object({
  workspacePath: z.string().default("~/.openclaw/workspace"),
  sandboxConfig: z
    .object({
      enabled: z.boolean().default(false),
      workspaceAccess: z.enum(["ro", "rw"]).default("rw"),
      networkAccess: z.boolean().default(true),
    })
    .default({ enabled: false, workspaceAccess: "rw", networkAccess: true }),
  multiAgent: z.boolean().default(false),
  agents: z.array(openClawAgentConfigSchema).optional(),
  channelRouting: z.array(channelRouteSchema).optional(),
});

export const agentArchitecturePhaseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("claude-subagent"),
    claude: claudePipelinePhaseSchema.default(() => claudePipelinePhaseSchema.parse({})),
  }),
  z.object({
    kind: z.literal("openclaw"),
    openclaw: openClawArchitecturePhaseSchema.default(() =>
      openClawArchitecturePhaseSchema.parse({}),
    ),
  }),
]);

export type AgentArchitectureSchemaType = z.infer<typeof agentArchitecturePhaseSchema>;
