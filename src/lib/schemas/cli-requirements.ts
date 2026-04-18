import { z } from "zod";
import {
  clarificationSchema,
  constraintSchema,
  functionalRequirementSchema,
  glossaryTermSchema,
  nonFunctionalRequirementSchema,
} from "./requirements";

export const cliPlatformMatrixSchema = z.object({
  os: z.array(z.enum(["macos", "linux", "windows", "bsd"])).default([]),
  arch: z.array(z.enum(["x86_64", "arm64", "riscv64"])).default([]),
  shells: z
    .array(z.enum(["bash", "zsh", "fish", "powershell", "nushell", "pwsh"]))
    .default([]),
  minNodeVersion: z.string().optional(),
  minBunVersion: z.string().optional(),
  minPythonVersion: z.string().optional(),
  minGoVersion: z.string().optional(),
});

export const destructiveActionPolicySchema = z.object({
  requiresConfirmation: z.boolean().default(true),
  confirmationFlag: z.string().default("--yes"),
  dryRunSupported: z.boolean().default(true),
  auditTrail: z.enum(["stderr-log", "file", "none"]).default("stderr-log"),
});

export const cliPerformanceSloSchema = z.object({
  coldStartMs: z.number().optional(),
  p95CommandMs: z.number().optional(),
  streamingLatencyMs: z.number().optional(),
  binarySizeMb: z.number().optional(),
});

export const cliTelemetrySchema = z.object({
  enabled: z.boolean().default(false),
  optOutMechanism: z.string().default(""),
  collects: z.array(z.string()).default([]),
});

export const cliAuthMethodSchema = z.enum([
  "env-var",
  "config-file",
  "oauth-device-code",
  "oauth-browser",
  "static-token",
  "none",
]);

export const cliRequirementsSchema = z.object({
  functional: z.array(functionalRequirementSchema).default([]),
  nonFunctional: z.array(nonFunctionalRequirementSchema).default([]),
  constraints: z.array(constraintSchema).default([]),
  glossary: z.array(glossaryTermSchema).default([]),
  clarifications: z.array(clarificationSchema).default([]),
  platformMatrix: cliPlatformMatrixSchema.optional(),
  destructivePolicy: destructiveActionPolicySchema.optional(),
  performance: cliPerformanceSloSchema.optional(),
  authMethods: z.array(cliAuthMethodSchema).optional(),
  offlineFirst: z.boolean().optional(),
  telemetry: cliTelemetrySchema.optional(),
});

export type CliRequirementsSchemaType = z.infer<typeof cliRequirementsSchema>;
