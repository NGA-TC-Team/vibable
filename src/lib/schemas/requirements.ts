import { z } from "zod";

export const functionalRequirementSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  description: z.string().default(""),
  priority: z.enum(["must", "should", "could", "wont"]).default("should"),
  acceptanceCriteria: z.array(z.string()).default([]),
  statement: z.string().default(""),
  rationale: z.string().default(""),
  source: z.string().default(""),
  relatedGoalIds: z.array(z.string()).default([]),
});

export const nonFunctionalRequirementSchema = z.object({
  id: z.string(),
  category: z
    .enum(["performance", "security", "accessibility", "offline", "other"])
    .default("other"),
  description: z.string().default(""),
});

export const constraintSchema = z.object({
  id: z.string(),
  category: z
    .enum(["policy", "legal", "budget", "schedule", "legacySystem", "other"])
    .default("other"),
  description: z.string().default(""),
  source: z.string().default(""),
  impact: z.string().default(""),
});

export const glossaryTermSchema = z.object({
  id: z.string(),
  term: z.string().default(""),
  definition: z.string().default(""),
  kind: z.enum(["role", "state", "entity", "rule", "term"]).default("term"),
  aliases: z.array(z.string()).default([]),
});

export const clarificationSchema = z.object({
  id: z.string(),
  question: z.string().default(""),
  context: z.string().default(""),
  owner: z.string().default(""),
  status: z.enum(["open", "answered", "deferred"]).default("open"),
  answer: z.string().default(""),
  blocksRequirementIds: z.array(z.string()).default([]),
});

export const requirementsSchema = z.object({
  functional: z.array(functionalRequirementSchema).default([]),
  nonFunctional: z.array(nonFunctionalRequirementSchema).default([]),
  constraints: z.array(constraintSchema).default([]),
  glossary: z.array(glossaryTermSchema).default([]),
  clarifications: z.array(clarificationSchema).default([]),
});

export type RequirementsSchemaType = z.infer<typeof requirementsSchema>;
