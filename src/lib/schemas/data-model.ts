import { z } from "zod";

export const entityFieldSchema = z.object({
  name: z.string().default(""),
  type: z
    .enum(["string", "number", "boolean", "date", "enum", "relation"])
    .default("string"),
  required: z.boolean().default(false),
  description: z.string().optional().default(""),
  enumValues: z.array(z.string()).optional(),
  relationTarget: z.string().optional(),
  relationTargetField: z.string().optional(),
  relationType: z.enum(["1:1", "1:N", "N:M"]).optional(),
  onDelete: z.enum(["cascade", "restrict", "setNull", "noAction"]).optional(),
  onUpdate: z.enum(["cascade", "restrict", "setNull", "noAction"]).optional(),
});

export const entitySchema = z.object({
  id: z.string(),
  name: z.string().default(""),
  fields: z.array(entityFieldSchema).default([]),
});

export const dataModelSchema = z.object({
  entities: z.array(entitySchema).default([]),
  storageStrategy: z
    .enum(["local", "remote", "hybrid", "distributed"])
    .default("local"),
  distributedStrategy: z
    .enum(["primaryReplica", "sharded", "multiRegion"])
    .optional(),
  storageNotes: z.string().optional().default(""),
});

export type DataModelSchemaType = z.infer<typeof dataModelSchema>;
