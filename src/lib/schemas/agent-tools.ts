import { z } from "zod";

export const hookDefinitionSchema = z.object({
  id: z.string(),
  agentId: z.string().default(""),
  hookType: z.enum(["PreToolUse", "PostToolUse"]).default("PreToolUse"),
  matcher: z.string().default(""),
  action: z.string().default(""),
  purpose: z.string().default(""),
});

export const mcpServerConfigSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  url: z.string().default(""),
  description: z.string().default(""),
});

export const claudeToolsPhaseSchema = z.object({
  globalTools: z.array(z.string()).default([]),
  agentTools: z
    .array(
      z.object({
        agentId: z.string(),
        tools: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  hooks: z.array(hookDefinitionSchema).default([]),
  mcpServers: z.array(mcpServerConfigSchema).optional(),
});

export const channelConfigSchema = z.object({
  id: z.string(),
  platform: z
    .enum([
      "whatsapp",
      "telegram",
      "discord",
      "slack",
      "signal",
      "teams",
      "irc",
      "other",
    ])
    .default("other"),
  identifier: z.string().default(""),
  purpose: z.string().default(""),
  allowedContacts: z.array(z.string()).optional(),
});

export const skillConfigSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  source: z.string().default(""),
  description: z.string().default(""),
  enabled: z.boolean().default(true),
});

export const openClawToolsPhaseSchema = z.object({
  channels: z.array(channelConfigSchema).default([]),
  tools: z
    .object({
      enabled: z.array(z.string()).default([]),
      disabled: z.array(z.string()).default([]),
      notes: z.string().default(""),
    })
    .default({ enabled: [], disabled: [], notes: "" }),
  skills: z.array(skillConfigSchema).default([]),
  gatewayConfig: z
    .object({
      bindHost: z.string().default("127.0.0.1"),
      port: z.number().default(18789),
      authToken: z.string().optional(),
    })
    .default({ bindHost: "127.0.0.1", port: 18789 }),
});

export const agentToolsPhaseSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("claude-subagent"),
    claude: claudeToolsPhaseSchema.default(() => claudeToolsPhaseSchema.parse({})),
  }),
  z.object({
    kind: z.literal("openclaw"),
    openclaw: openClawToolsPhaseSchema.default(() => openClawToolsPhaseSchema.parse({})),
  }),
]);

export type AgentToolsSchemaType = z.infer<typeof agentToolsPhaseSchema>;
