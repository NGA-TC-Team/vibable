import { z } from "zod";

export const sitemapNodeSchema: z.ZodType<{
  id: string;
  label: string;
  path?: string;
  children: unknown[];
}> = z.object({
  id: z.string(),
  label: z.string().default(""),
  path: z.string().optional().default(""),
  children: z.lazy(() => z.array(sitemapNodeSchema)).default([]),
});

export const flowStepSchema = z.object({
  id: z.string(),
  screenRef: z.string().optional().default(""),
  action: z.string().default(""),
  next: z.array(z.string()).default([]),
});

export const userFlowSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  steps: z.array(flowStepSchema).default([]),
});

export const infoArchitectureSchema = z.object({
  sitemap: z.array(sitemapNodeSchema).default([]),
  userFlows: z.array(userFlowSchema).default([]),
  globalNavRules: z.array(z.string()).default([]),
});

export type InfoArchitectureSchemaType = z.infer<
  typeof infoArchitectureSchema
>;
