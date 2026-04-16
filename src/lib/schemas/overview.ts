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

export const successMetricGroupSchema = z.object({
  id: z.string(),
  parent: successMetricSchema,
  children: z.array(successMetricSchema).default([]),
});

export const milestoneGroupSchema = z.object({
  id: z.string(),
  parent: milestoneSchema,
  children: z.array(milestoneSchema).default([]),
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

function parseMetricRow(raw: unknown, index: number) {
  const parsed = successMetricSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  return successMetricSchema.parse({
    id: `metric-${index}`,
    metric: "",
    target: "",
    measurement: "",
  });
}

function parseMilestoneRow(raw: unknown, index: number) {
  const parsed = milestoneSchema.safeParse(raw);
  if (parsed.success) return parsed.data;
  return milestoneSchema.parse({
    id: `milestone-${index}`,
    milestone: "",
    date: "",
    description: "",
  });
}

/** 레거시 평면 배열 → 그룹 배열로 승격, 그룹이 있으면 평면 키는 비움 */
function migrateOverviewInput(input: unknown): unknown {
  if (input == null || typeof input !== "object") return input;
  const raw = input as Record<string, unknown>;
  const out: Record<string, unknown> = { ...raw };

  const metricGroups = out.successMetricGroups;
  const flatMetrics = out.successMetrics;
  const hasMetricGroups = Array.isArray(metricGroups) && metricGroups.length > 0;

  if (hasMetricGroups) {
    out.successMetrics = [];
  } else if (Array.isArray(flatMetrics) && flatMetrics.length > 0) {
    out.successMetricGroups = flatMetrics.map((row, i) => {
      const parent = parseMetricRow(row, i);
      return {
        id: `grp-${parent.id}`,
        parent,
        children: [],
      };
    });
    out.successMetrics = [];
  }

  const msGroups = out.milestoneGroups;
  const flatTimeline = out.timeline;
  const hasMsGroups = Array.isArray(msGroups) && msGroups.length > 0;

  if (hasMsGroups) {
    out.timeline = [];
  } else if (Array.isArray(flatTimeline) && flatTimeline.length > 0) {
    out.milestoneGroups = flatTimeline.map((row, i) => {
      const parent = parseMilestoneRow(row, i);
      return {
        id: `grp-${parent.id}`,
        parent,
        children: [],
      };
    });
    out.timeline = [];
  }

  return out;
}

const overviewBodySchema = z.object({
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
  successMetricGroups: z.array(successMetricGroupSchema).default([]),
  timeline: z.array(milestoneSchema).default([]),
  milestoneGroups: z.array(milestoneGroupSchema).default([]),
  references: z.array(referenceSchema).default([]),
  techStack: z.string().optional().default(""),
});

export const overviewSchema = z.preprocess(migrateOverviewInput, overviewBodySchema);

export type OverviewSchemaType = z.infer<typeof overviewBodySchema>;
