import { z } from "zod";

export const personaSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  role: z.string().default(""),
  painPoints: z.array(z.string()).default([]),
  goals: z.array(z.string()).default([]),
});

export const userStorySchema = z.object({
  id: z.string(),
  personaId: z.string().default(""),
  asA: z.string().default(""),
  iWant: z.string().default(""),
  soThat: z.string().default(""),
});

export const userScenarioSchema = z.object({
  personas: z.array(personaSchema).default([]),
  userStories: z.array(userStorySchema).default([]),
  successScenarios: z.array(z.string()).default([]),
  failureScenarios: z.array(z.string()).default([]),
});

export type UserScenarioSchemaType = z.infer<typeof userScenarioSchema>;
