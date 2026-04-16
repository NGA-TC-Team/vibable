import { z } from "zod";

export const personaSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  role: z.string().default(""),
  demographics: z.string().default(""),
  context: z.string().default(""),
  techProficiency: z.string().default(""),
  behaviors: z.array(z.string()).default([]),
  motivations: z.array(z.string()).default([]),
  needs: z.array(z.string()).default([]),
  painPoints: z.array(z.string()).default([]),
  frustrations: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
  successCriteria: z.array(z.string()).default([]),
  quote: z.string().default(""),
});

export const userStorySchema = z.object({
  id: z.string(),
  personaId: z.string().default(""),
  asA: z.string().default(""),
  iWant: z.string().default(""),
  soThat: z.string().default(""),
});

export const userScenarioSchema = z.object({
  personaDetailLevel: z.enum(["simple", "detailed"]).default("simple"),
  personas: z.array(personaSchema).default([]),
  userStories: z.array(userStorySchema).default([]),
  successScenarios: z.array(z.string()).default([]),
  failureScenarios: z.array(z.string()).default([]),
});

export type UserScenarioSchemaType = z.infer<typeof userScenarioSchema>;
