import { z } from "zod";

export const functionalRequirementSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  description: z.string().default(""),
  priority: z.enum(["must", "should", "could", "wont"]).default("should"),
  acceptanceCriteria: z.array(z.string()).default([]),
});

export const nonFunctionalRequirementSchema = z.object({
  id: z.string(),
  category: z
    .enum(["performance", "security", "accessibility", "offline", "other"])
    .default("other"),
  description: z.string().default(""),
});

export const requirementsSchema = z.object({
  functional: z.array(functionalRequirementSchema).default([]),
  nonFunctional: z.array(nonFunctionalRequirementSchema).default([]),
});

export type RequirementsSchemaType = z.infer<typeof requirementsSchema>;
