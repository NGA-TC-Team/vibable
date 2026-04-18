import { z } from "zod";

export const stdinFormatSchema = z.enum([
  "none",
  "text",
  "json",
  "ndjson",
  "binary",
]);

export const stdoutModeSchema = z.enum([
  "human-pretty",
  "human-plain",
  "json",
  "ndjson",
  "yaml",
  "custom-template",
]);

export const exitCodeCategorySchema = z.enum([
  "success",
  "usage",
  "input",
  "unavailable",
  "software",
  "config",
  "temporary",
  "permission",
]);

export const exitCodeMappingSchema = z.object({
  code: z.number().default(0),
  when: z.string().default(""),
  category: exitCodeCategorySchema.default("success"),
});

export const cliSampleSchema = z.object({
  label: z.string().default(""),
  mode: z.enum(["human", "agent"]).default("human"),
  invocation: z.string().default(""),
  stdin: z.string().optional(),
  stdout: z.string().default(""),
  stderr: z.string().optional(),
  exitCode: z.number().default(0),
});

export const commandContractSchema = z.object({
  commandId: z.string().default(""),
  stdinFormat: stdinFormatSchema.default("none"),
  stdinSchemaRef: z.string().optional(),
  stdoutModes: z.array(stdoutModeSchema).default(["human-pretty"]),
  defaultMode: stdoutModeSchema.default("human-pretty"),
  stdoutSchemaVersion: z.string().optional(),
  stdoutSchemaRef: z.string().optional(),
  stderr: z
    .object({
      diagnosticsFormat: z.enum(["plain", "json"]).default("plain"),
      includesStackTrace: z.boolean().default(false),
    })
    .default(() => ({ diagnosticsFormat: "plain" as const, includesStackTrace: false })),
  exitCodes: z.array(exitCodeMappingSchema).default([]),
  streaming: z.enum(["none", "stdout-ndjson", "sse-like"]).default("none"),
  interactivity: z
    .object({
      promptsIfTTY: z.boolean().default(false),
      nonInteractiveFallback: z.string().default(""),
      respectsNoInput: z.boolean().default(true),
    })
    .default(() => ({
      promptsIfTTY: false,
      nonInteractiveFallback: "",
      respectsNoInput: true,
    })),
  progressReporting: z
    .enum(["none", "spinner", "bar", "events"])
    .default("none"),
  idempotent: z.boolean().default(false),
  safeToRetry: z.boolean().default(false),
  samples: z.array(cliSampleSchema).default([]),
});

export const cliContractSchema = z.object({
  contracts: z.array(commandContractSchema).default([]),
  globalConventions: z
    .object({
      piscesRule: z.boolean().default(true),
      quietFlag: z.string().default("--quiet"),
      verboseFlag: z.string().default("-v/--verbose"),
      jsonFlag: z.string().default("--json"),
      formatFlag: z.string().default("--format"),
    })
    .default(() => ({
      piscesRule: true,
      quietFlag: "--quiet",
      verboseFlag: "-v/--verbose",
      jsonFlag: "--json",
      formatFlag: "--format",
    })),
});

export type CliContractSchemaType = z.infer<typeof cliContractSchema>;
