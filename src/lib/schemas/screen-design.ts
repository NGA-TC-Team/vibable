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

const mockupElementTypeSchema = z.enum([
  "header", "text", "heading", "button", "input", "image", "card", "list",
  "divider", "icon", "bottomNav", "sidebar", "table", "form", "modal",
  "tabs", "carousel", "avatar", "badge", "toggle", "checkbox", "radio",
  "dropdown", "searchbar", "breadcrumb", "pagination", "progressbar",
  "map", "video", "chart", "spacer",
]);

export const mockupElementSchema = z.object({
  id: z.string(),
  type: mockupElementTypeSchema,
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().default(100),
  height: z.number().default(40),
  props: z.record(z.string(), z.string()).default({}),
});

export const mockupViewportSchema = z.object({
  mobile: z.array(mockupElementSchema).default([]),
  tablet: z.array(mockupElementSchema).default([]),
  desktop: z.array(mockupElementSchema).default([]),
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
  mockup: mockupViewportSchema.optional(),
});

export const screenDesignSchema = z.object({
  pages: z.array(screenPageSchema).default([]),
});

export type ScreenDesignSchemaType = z.infer<typeof screenDesignSchema>;
