import { z } from "zod";

export const competitorSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  url: z.string().optional().default(""),
  strength: z.string().default(""),
  weakness: z.string().default(""),
});

export const successMetricSchema = z.object({
  id: z.string(),
  metric: z.string().default(""),
  target: z.string().default(""),
  measurement: z.string().default(""),
});

export const milestoneSchema = z.object({
  id: z.string(),
  milestone: z.string().default(""),
  date: z.string().default(""),
  description: z.string().default(""),
});

export const referenceSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  url: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export const scopeSchema = z.object({
  type: z.enum(["mvp", "full", "prototype"]).default("mvp"),
  details: z.string().default(""),
});

export const overviewSchema = z.object({
  projectName: z.string().default(""),
  elevatorPitch: z.string().default(""),
  background: z.string().default(""),
  coreValueProposition: z.string().default(""),
  businessGoals: z.array(z.string()).default([]),
  targetUsers: z.string().default(""),
  scope: scopeSchema.default(() => scopeSchema.parse({})),
  competitors: z.array(competitorSchema).default([]),
  constraints: z.array(z.string()).default([]),
  successMetrics: z.array(successMetricSchema).default([]),
  timeline: z.array(milestoneSchema).default([]),
  references: z.array(referenceSchema).default([]),
  techStack: z.string().optional().default(""),
});

export type OverviewSchemaType = z.infer<typeof overviewSchema>;
