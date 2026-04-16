import { z } from "zod";
import {
  functionalRequirementSchema,
  nonFunctionalRequirementSchema,
} from "./requirements";

export const agentRequirementsClaudeExtensionSchema = z.object({
  autonomyLevel: z
    .enum(["read-only", "suggest", "plan-then-execute", "autonomous"])
    .default("suggest"),
  permissionBoundary: z.string().default(""),
  contextScope: z.enum(["project", "user", "both"]).default("project"),
  maxConcurrentAgents: z.number().optional(),
});

export const agentRequirementsOpenclawExtensionSchema = z.object({
  autonomyLevel: z
    .enum(["passive", "reactive", "proactive", "autonomous"])
    .default("reactive"),
  alwaysOnRequired: z.boolean().default(false),
  messagingChannels: z.array(z.string()).default([]),
  hardwareTarget: z.string().default(""),
  sandboxRequired: z.boolean().default(false),
});

export const agentRequirementsSchema = z.object({
  functional: z.array(functionalRequirementSchema).default([]),
  nonFunctional: z.array(nonFunctionalRequirementSchema).default([]),
  claude: agentRequirementsClaudeExtensionSchema.optional(),
  openclaw: agentRequirementsOpenclawExtensionSchema.optional(),
});

export type AgentRequirementsSchemaType = z.infer<typeof agentRequirementsSchema>;
