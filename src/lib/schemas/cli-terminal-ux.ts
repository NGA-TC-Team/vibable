import { z } from "zod";
import { glossaryEntrySchema } from "./design-system";

export const ansiColorSchema = z.enum([
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
]);

export const terminalPaletteSchema = z.object({
  primary: ansiColorSchema.default("cyan"),
  success: ansiColorSchema.default("green"),
  warning: ansiColorSchema.default("yellow"),
  danger: ansiColorSchema.default("red"),
  info: ansiColorSchema.default("blue"),
  muted: ansiColorSchema.default("brightBlack"),
  truecolorHex: z
    .object({
      primary: z.string().optional(),
      success: z.string().optional(),
      warning: z.string().optional(),
      danger: z.string().optional(),
      info: z.string().optional(),
      muted: z.string().optional(),
    })
    .optional(),
  respectNoColor: z.literal(true).default(true),
});

export const logLevelSchema = z.enum([
  "silent",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
]);

export const logLevelPolicySchema = z.object({
  levels: z
    .array(logLevelSchema)
    .default(["silent", "error", "warn", "info", "debug", "trace"]),
  defaultLevel: z.enum(["info", "warn"]).default("info"),
  verboseFlag: z.string().default("-v/--verbose"),
  quietFlag: z.string().default("--quiet"),
  envOverride: z.string().default(""),
});

export const helpSectionSchema = z.enum([
  "usage",
  "description",
  "flags",
  "commands",
  "examples",
  "env-vars",
  "exit-codes",
  "see-also",
]);

export const helpTemplateSchema = z.object({
  sections: z
    .array(helpSectionSchema)
    .default([
      "usage",
      "description",
      "flags",
      "commands",
      "examples",
      "env-vars",
      "exit-codes",
      "see-also",
    ]),
  headerStyle: z
    .enum(["uppercase", "bold", "color-muted"])
    .default("uppercase"),
  exampleCount: z.number().default(2),
  includeAgentSection: z.boolean().default(false),
});

export const errorMessageTemplateSchema = z.object({
  id: z.string(),
  scenario: z.string().default(""),
  whatWentWrong: z.string().default(""),
  whyItHappened: z.string().default(""),
  howToFix: z.string().default(""),
  relatedCommand: z.string().optional(),
  exitCode: z.number().default(1),
});

export const agentFriendlinessChecklistSchema = z.object({
  stableJsonOutput: z.boolean().default(false),
  nonInteractiveFallback: z.boolean().default(false),
  respectsTtyAndNoColor: z.boolean().default(true),
  semanticExitCodes: z.boolean().default(false),
  streamingEvents: z.boolean().default(false),
  deterministicOutput: z.boolean().default(false),
  mcpBridge: z.enum(["native", "wrapper", "none"]).default("none"),
  nonInteractiveAuth: z.boolean().default(false),
  tokenEfficient: z.boolean().default(true),
});

export const cliTerminalUxSchema = z.object({
  palette: terminalPaletteSchema.default(() =>
    terminalPaletteSchema.parse({}),
  ),
  iconSet: z.enum(["none", "nerd-font", "emoji", "ascii"]).default("ascii"),
  tableStyle: z
    .enum(["plain", "unicode-box", "markdown", "github"])
    .default("unicode-box"),
  logPolicy: logLevelPolicySchema.default(() =>
    logLevelPolicySchema.parse({}),
  ),
  helpTemplate: helpTemplateSchema.default(() => helpTemplateSchema.parse({})),
  errorTemplates: z.array(errorMessageTemplateSchema).default([]),
  toneLevel: z
    .union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ])
    .default(3),
  uxWritingGlossary: z.array(glossaryEntrySchema).default([]),
  agentChecklist: agentFriendlinessChecklistSchema.default(() =>
    agentFriendlinessChecklistSchema.parse({}),
  ),
});

export type CliTerminalUxSchemaType = z.infer<typeof cliTerminalUxSchema>;
