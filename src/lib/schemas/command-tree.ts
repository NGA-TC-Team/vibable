import { z } from "zod";

export const flagKindSchema = z.enum([
  "boolean",
  "string",
  "number",
  "enum",
  "path",
  "duration",
  "count",
  "stringArray",
]);

export const cliFlagSchema = z.object({
  id: z.string(),
  long: z.string().default(""),
  short: z.string().optional(),
  kind: flagKindSchema.default("boolean"),
  enumValues: z.array(z.string()).optional(),
  defaultValue: z.string().optional(),
  required: z.boolean().default(false),
  repeatable: z.boolean().default(false),
  envVar: z.string().optional(),
  mutuallyExclusiveWith: z.array(z.string()).optional(),
  description: z.string().default(""),
  hiddenFromHelp: z.boolean().optional(),
});

export const cliPositionalSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  kind: z.enum(["required", "optional", "variadic"]).default("required"),
  description: z.string().default(""),
});

export const commandStabilitySchema = z.enum([
  "experimental",
  "beta",
  "stable",
  "deprecated",
]);

export const commandConventionSchema = z.enum([
  "posix-minimal",
  "verb-noun",
  "noun-verb",
  "kubernetes-style",
  "rust-clap",
  "cobra-go",
  "custom",
]);

interface CommandNodeShape {
  id: string;
  name: string;
  aliases: string[];
  summary: string;
  description: string;
  positional: z.infer<typeof cliPositionalSchema>[];
  localFlags: z.infer<typeof cliFlagSchema>[];
  inheritedFlags: string[];
  hidden: boolean;
  stability: "experimental" | "beta" | "stable" | "deprecated";
  agentSafe: boolean;
  children: CommandNodeShape[];
}

export const commandNodeSchema: z.ZodType<CommandNodeShape> = z.lazy(() =>
  z.object({
    id: z.string(),
    name: z.string().default(""),
    aliases: z.array(z.string()).default([]),
    summary: z.string().default(""),
    description: z.string().default(""),
    positional: z.array(cliPositionalSchema).default([]),
    localFlags: z.array(cliFlagSchema).default([]),
    inheritedFlags: z.array(z.string()).default([]),
    hidden: z.boolean().default(false),
    stability: commandStabilitySchema.default("experimental"),
    agentSafe: z.boolean().default(true),
    children: z.array(commandNodeSchema).default([]),
  }),
);

export const completionsSpecSchema = z.object({
  shells: z
    .array(z.enum(["bash", "zsh", "fish", "powershell"]))
    .default(["bash", "zsh"]),
  strategy: z
    .enum(["static-generated", "runtime-completion", "none"])
    .default("static-generated"),
});

export const helpStyleSchema = z.object({
  includeExamplesInHelp: z.boolean().default(true),
  includeEnvVarsInHelp: z.boolean().default(true),
  colorizeHelp: z.boolean().default(true),
});

export const commandTreeSchema = z.object({
  rootBinary: z.string().default(""),
  convention: commandConventionSchema.default("verb-noun"),
  globalFlags: z.array(cliFlagSchema).default([]),
  commands: z.array(commandNodeSchema).default([]),
  completions: completionsSpecSchema.default(() =>
    completionsSpecSchema.parse({}),
  ),
  helpStyle: helpStyleSchema.default(() => helpStyleSchema.parse({})),
});

export type CommandTreeSchemaType = z.infer<typeof commandTreeSchema>;
