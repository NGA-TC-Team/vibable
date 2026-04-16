import { z } from "zod";

export const errorStateSchema = z.object({
  type: z
    .enum(["network", "validation", "permission", "notFound", "custom"])
    .default("custom"),
  description: z.string().default(""),
});

export const interactionSchema = z.object({
  element: z.string().default(""),
  trigger: z.string().default(""),
  action: z.string().default(""),
});

const uxIntentSchema = z.object({
  userGoal: z.string().default(""),
  businessIntent: z.string().default(""),
});

const statesSchema = z.object({
  idle: z.string().default(""),
  loading: z.string().default(""),
  offline: z.string().default(""),
  errors: z.array(errorStateSchema).default([]),
});

export const screenPageSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  route: z.string().optional().default(""),
  uxIntent: uxIntentSchema.default(() => uxIntentSchema.parse({})),
  states: statesSchema.default(() => statesSchema.parse({})),
  interactions: z.array(interactionSchema).default([]),
  inPages: z.array(z.string()).default([]),
  outPages: z.array(z.string()).default([]),
});

export const screenDesignSchema = z.object({
  pages: z.array(screenPageSchema).default([]),
});

export type ScreenDesignSchemaType = z.infer<typeof screenDesignSchema>;
