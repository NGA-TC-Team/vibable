import { z } from "zod";

export const colorTokenSchema = z.object({
  name: z.string().default(""),
  hex: z.string().default("#000000"),
  oklch: z.string().optional(),
  role: z.string().default(""),
});

export const typeScaleEntrySchema = z.object({
  name: z.string().default(""),
  size: z.string().default(""),
  lineHeight: z.string().default(""),
  weight: z.string().default(""),
  letterSpacing: z.string().optional(),
});

export const componentStyleSchema = z.object({
  component: z.string().default(""),
  variants: z.string().default(""),
  borderRadius: z.string().default(""),
  notes: z.string().optional(),
});

export const glossaryEntrySchema = z.object({
  term: z.string().default(""),
  avoid: z.string().default(""),
  context: z.string().optional(),
});

const visualThemeSchema = z.object({
  mood: z.string().default(""),
  density: z
    .enum(["compact", "comfortable", "spacious"])
    .default("comfortable"),
  philosophy: z.string().default(""),
});

const typographySchema = z.object({
  fontFamilies: z
    .array(
      z.object({
        role: z.string().default(""),
        family: z.string().default(""),
        fallback: z.string().default(""),
      }),
    )
    .default([]),
  scale: z.array(typeScaleEntrySchema).default([]),
});

const layoutSchema = z.object({
  spacingScale: z.array(z.string()).default([]),
  gridColumns: z.number().default(12),
  maxContentWidth: z.string().default("1280px"),
  whitespacePhilosophy: z.string().default(""),
});

const elevationSchema = z.object({
  shadows: z
    .array(
      z.object({
        level: z.string().default(""),
        value: z.string().default(""),
        usage: z.string().default(""),
      }),
    )
    .default([]),
  surfaceHierarchy: z.string().default(""),
});

const guidelinesSchema = z.object({
  dos: z.array(z.string()).default([]),
  donts: z.array(z.string()).default([]),
});

const responsiveSchema = z.object({
  breakpoints: z
    .array(
      z.object({
        name: z.string().default(""),
        minWidth: z.string().default(""),
      }),
    )
    .default([]),
  touchTargetMin: z.string().default("44px"),
  collapsingStrategy: z.string().default(""),
});

const uxWritingSchema = z.object({
  toneLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(3),
  glossary: z.array(glossaryEntrySchema).default([]),
  errorMessageStyle: z
    .enum(["descriptive", "concise", "friendly"])
    .default("friendly"),
});

export const designSystemSchema = z.object({
  visualTheme: visualThemeSchema.default(() => visualThemeSchema.parse({})),
  colorPalette: z.array(colorTokenSchema).default([]),
  typography: typographySchema.default(() => typographySchema.parse({})),
  components: z.array(componentStyleSchema).default([]),
  layout: layoutSchema.default(() => layoutSchema.parse({})),
  elevation: elevationSchema.default(() => elevationSchema.parse({})),
  guidelines: guidelinesSchema.default(() => guidelinesSchema.parse({})),
  responsive: responsiveSchema.default(() => responsiveSchema.parse({})),
  uxWriting: uxWritingSchema.default(() => uxWritingSchema.parse({})),
  presetSelection: z
    .object({
      moodPreset: z.string().optional(),
      colorPreset: z.string().optional(),
      darkMode: z.boolean().optional(),
      references: z.array(z.string()).optional(),
    })
    .optional(),
});

export type DesignSystemSchemaType = z.infer<typeof designSystemSchema>;
