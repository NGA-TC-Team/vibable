import { z } from "zod";
import { assetKindSchema } from "./idea-note";

export const ideaNoteBundleManifestSchema = z.object({
  vibableBundleVersion: z.literal(1),
  projectId: z.string(),
  exportedAt: z.number(),
  boards: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      parentBoardId: z.string().nullable(),
    }),
  ),
  assets: z.array(
    z.object({
      id: z.string(),
      kind: assetKindSchema,
      mime: z.string(),
      size: z.number(),
      originalName: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }),
  ),
});

export type IdeaNoteBundleManifestSchemaType = z.infer<
  typeof ideaNoteBundleManifestSchema
>;
