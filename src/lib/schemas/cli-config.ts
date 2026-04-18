import { z } from "zod";

export const configFormatSchema = z.enum([
  "toml",
  "yaml",
  "json",
  "ini",
  "dotenv",
]);

export const secretStoreSchema = z.enum([
  "os-keychain",
  "env-var",
  "plain-file",
  "encrypted-file",
  "external-vault",
]);

export const configFileSpecSchema = z.object({
  id: z.string(),
  locationPriority: z.array(z.string()).default([]),
  format: configFormatSchema.default("toml"),
  jsonSchema: z.string().default(""),
  description: z.string().default(""),
  mergeStrategy: z.enum(["deep", "override", "array-append"]).default("deep"),
});

export const envVarSpecSchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  purpose: z.string().default(""),
  required: z.boolean().default(false),
  sensitive: z.boolean().default(false),
  defaultValue: z.string().optional(),
  boundFlagId: z.string().optional(),
});

export const secretsPolicySchema = z.object({
  supportedStores: z.array(secretStoreSchema).default(["env-var"]),
  preferredStore: secretStoreSchema.default("env-var"),
  rotationPolicy: z.string().default(""),
  redactInLogs: z.boolean().default(true),
});

export const filesystemLayoutSchema = z.object({
  configDir: z.string().default("$XDG_CONFIG_HOME"),
  cacheDir: z.string().default("$XDG_CACHE_HOME"),
  stateDir: z.string().default("$XDG_STATE_HOME"),
  logsDir: z.string().default("$XDG_STATE_HOME/logs"),
  ensureCreated: z.boolean().default(true),
});

export const outputSchemaSpecSchema = z.object({
  id: z.string(),
  version: z.string().default("0.1.0"),
  describes: z.string().default(""),
  jsonSchema: z.string().default(""),
  stabilityGuarantee: z
    .enum(["experimental", "beta", "stable"])
    .default("experimental"),
});

export const cliConfigSchema = z.object({
  configFiles: z.array(configFileSpecSchema).default([]),
  envVars: z.array(envVarSpecSchema).default([]),
  secrets: secretsPolicySchema.default(() => secretsPolicySchema.parse({})),
  fsLayout: filesystemLayoutSchema.default(() =>
    filesystemLayoutSchema.parse({}),
  ),
  outputSchemas: z.array(outputSchemaSpecSchema).default([]),
  entityReuse: z.boolean().default(false),
});

export type CliConfigSchemaType = z.infer<typeof cliConfigSchema>;
