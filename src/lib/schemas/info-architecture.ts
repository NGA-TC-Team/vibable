import { z } from "zod";

export const SCREEN_TYPES = [
  "hub",
  "list",
  "detail",
  "create",
  "edit",
  "review",
  "result",
  "settings",
] as const;

export const screenTypeSchema = z.enum(SCREEN_TYPES);
export type ScreenType = z.infer<typeof screenTypeSchema>;

export const FLOW_STEP_INTENTS = [
  "view",
  "input",
  "select",
  "submit",
  "confirm",
  "approve",
  "reject",
  "complete",
] as const;

export const flowStepIntentSchema = z.enum(FLOW_STEP_INTENTS);
export type FlowStepIntent = z.infer<typeof flowStepIntentSchema>;

export const NAV_RULE_SEVERITIES = ["info", "warning", "critical"] as const;
export const navRuleSeveritySchema = z.enum(NAV_RULE_SEVERITIES);
export type NavRuleSeverity = z.infer<typeof navRuleSeveritySchema>;

export const sitemapNodeSchema: z.ZodType<{
  id: string;
  label: string;
  path?: string;
  purpose?: string;
  screenType?: ScreenType;
  primaryTask?: string;
  audience?: string[];
  primaryEntity?: string;
  children: unknown[];
}> = z.object({
  id: z.string(),
  label: z.string().default(""),
  path: z.string().optional().default(""),
  purpose: z.string().optional().default(""),
  screenType: screenTypeSchema.optional(),
  primaryTask: z.string().optional().default(""),
  audience: z.array(z.string()).optional().default([]),
  primaryEntity: z.string().optional().default(""),
  children: z.lazy(() => z.array(sitemapNodeSchema)).default([]),
});

export const flowStepSchema = z.object({
  id: z.string(),
  screenRef: z.string().optional().default(""),
  action: z.string().default(""),
  intent: flowStepIntentSchema.optional(),
  actor: z.string().optional().default(""),
  condition: z.string().optional().default(""),
  outcome: z.string().optional().default(""),
  next: z.array(z.string()).default([]),
});

export const userFlowSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  goal: z.string().optional().default(""),
  primaryActor: z.string().optional().default(""),
  startScreenRef: z.string().optional().default(""),
  successEndings: z.array(z.string()).optional().default([]),
  failureEndings: z.array(z.string()).optional().default([]),
  steps: z.array(flowStepSchema).default([]),
});

// 구조화된 네비 규칙 + 레거시 문자열 자동 승격
const structuredNavRuleSchema = z.object({
  id: z.string(),
  title: z.string().default(""),
  rule: z.string().default(""),
  rationale: z.string().optional().default(""),
  severity: navRuleSeveritySchema.optional(),
  appliesTo: z
    .object({
      roles: z.array(z.string()).optional().default([]),
      screenTypes: z.array(screenTypeSchema).optional().default([]),
      paths: z.array(z.string()).optional().default([]),
    })
    .optional(),
});

const legacyNavRuleSchema = z.string().transform((s) => ({
  id: `legacy-${Math.random().toString(36).slice(2, 10)}`,
  title: "",
  rule: s,
  rationale: "",
  severity: undefined as z.infer<typeof navRuleSeveritySchema> | undefined,
  appliesTo: undefined,
}));

export const globalNavRuleSchema = z.union([
  legacyNavRuleSchema,
  structuredNavRuleSchema,
]);

export type GlobalNavRuleType = z.infer<typeof structuredNavRuleSchema>;

export const iaRoleSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().optional().default(""),
});

export const iaEntitySchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  description: z.string().optional().default(""),
  states: z.array(z.string()).optional().default([]),
});

export const infoArchitectureSchema = z.object({
  sitemap: z.array(sitemapNodeSchema).default([]),
  userFlows: z.array(userFlowSchema).default([]),
  globalNavRules: z.array(globalNavRuleSchema).default([]),
  roles: z.array(iaRoleSchema).optional().default([]),
  entities: z.array(iaEntitySchema).optional().default([]),
});

export type InfoArchitectureSchemaType = z.infer<
  typeof infoArchitectureSchema
>;
