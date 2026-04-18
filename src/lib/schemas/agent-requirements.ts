import { z } from "zod";
import {
  clarificationSchema,
  constraintSchema,
  functionalRequirementSchema,
  glossaryTermSchema,
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
  constraints: z.array(constraintSchema).default([]),
  glossary: z.array(glossaryTermSchema).default([]),
  clarifications: z.array(clarificationSchema).default([]),
  claude: agentRequirementsClaudeExtensionSchema.optional(),
  openclaw: agentRequirementsOpenclawExtensionSchema.optional(),
});

export type AgentRequirementsSchemaType = z.infer<typeof agentRequirementsSchema>;
