import { z } from "zod";

// ─── 공통 ───

export const positionSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
});

export const sizeSchema = z.object({
  width: z.number().default(240),
  height: z.number().default(160),
});

export const viewportSchema = z.object({
  x: z.number().default(0),
  y: z.number().default(0),
  zoom: z.number().default(1),
});

const nodeBaseShape = {
  id: z.string(),
  position: positionSchema.default(() => positionSchema.parse({})),
  size: sizeSchema.default(() => sizeSchema.parse({})),
  rotation: z.number().default(0),
  zIndex: z.number().default(0),
  groupId: z.string().optional(),
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
  onboardingSample: z.boolean().optional(),
};

// ─── 노드별 data 스키마 ───

export const noteDataSchema = z.object({
  title: z.string().default(""),
  richText: z.string().default(""),
  accentColor: z.string().default("#fbbf24"),
  backgroundColor: z.string().default("#ffffff"),
});

export const linkDataSchema = z.object({
  url: z.string().default(""),
  title: z.string().default(""),
  description: z.string().optional().default(""),
  thumbnailAssetId: z.string().optional(),
  favicon: z.string().optional(),
});

export const todoItemSchema = z.object({
  id: z.string(),
  text: z.string().default(""),
  done: z.boolean().default(false),
  indent: z.number().int().min(0).max(2).optional(),
});

export const todoDataSchema = z.object({
  title: z.string().default(""),
  items: z.array(todoItemSchema).default([]),
  showProgress: z.boolean().default(true),
});

export const columnDataSchema = z.object({
  title: z.string().default(""),
  accent: z.string().default("#a8a29e"),
  childNodeIds: z.array(z.string()).default([]),
});

export const tableDataSchema = z.object({
  headers: z.array(z.string()).default(["", ""]),
  rows: z.array(z.array(z.string())).default([["", ""]]),
  columnWidths: z.array(z.number()).default([140, 140]),
});

export const imageDataSchema = z.object({
  assetId: z.string(),
  caption: z.string().optional().default(""),
  objectFit: z.enum(["cover", "contain", "fill"]).default("cover"),
  crop: z
    .object({
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })
    .optional(),
});

export const videoDataSchema = z.object({
  assetId: z.string().optional(),
  externalUrl: z.string().optional(),
  poster: z.string().optional(),
});

export const fileDataSchema = z.object({
  assetId: z.string(),
  filename: z.string().default(""),
  size: z.number().default(0),
  mime: z.string().default("application/octet-stream"),
});

export const swatchDataSchema = z.object({
  hex: z.string().default("#0ea5e9"),
  label: z.string().optional().default(""),
});

export const textDataSchema = z.object({
  text: z.string().default(""),
  fontSize: z.number().default(16),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(700)]).default(400),
  color: z.string().default("#0f172a"),
  align: z.enum(["left", "center", "right"]).default("left"),
  italic: z.boolean().optional(),
});

export const boardRefDataSchema = z.object({
  childBoardId: z.string(),
  displayName: z.string().default(""),
  iconEmoji: z.string().optional(),
  cardCount: z.number().default(0),
  fileCount: z.number().default(0),
});

export const frameDataSchema = z.object({
  label: z.string().optional().default(""),
  background: z.string().default("#f8fafc80"),
  borderColor: z.string().optional(),
  dashed: z.boolean().optional(),
});

export const shapeKindSchema = z.enum([
  "rect",
  "ellipse",
  "diamond",
  "triangle",
  "hexagon",
]);

export const shapeDataSchema = z.object({
  kind: shapeKindSchema.default("rect"),
  fill: z.string().default("#e2e8f0"),
  stroke: z.string().default("#0f172a"),
  strokeWidth: z.number().default(2),
  roughness: z.number().optional(),
  text: z.string().optional().default(""),
});

export const drawingStrokeSchema = z.object({
  points: z.array(z.tuple([z.number(), z.number()]).or(z.tuple([z.number(), z.number(), z.number()]))),
  color: z.string().default("#0f172a"),
  size: z.number().default(2),
  tool: z.enum(["pen", "highlighter", "eraser"]).default("pen"),
});

export const drawingDataSchema = z.object({
  strokes: z.array(drawingStrokeSchema).default([]),
});

// ─── 노드 discriminated union ───

export const ideaNoteNodeSchema = z.discriminatedUnion("type", [
  z.object({ ...nodeBaseShape, type: z.literal("note"), data: noteDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("link"), data: linkDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("todo"), data: todoDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("column"), data: columnDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("table"), data: tableDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("image"), data: imageDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("video"), data: videoDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("file"), data: fileDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("swatch"), data: swatchDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("text"), data: textDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("board"), data: boardRefDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("frame"), data: frameDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("shape"), data: shapeDataSchema }),
  z.object({ ...nodeBaseShape, type: z.literal("drawing"), data: drawingDataSchema }),
]);

// ─── 엣지 ───

export const edgeEndpointSchema = z.union([
  z.object({
    nodeId: z.string(),
    handle: z.enum(["t", "r", "b", "l"]).optional(),
  }),
  z.object({
    free: z.object({ x: z.number(), y: z.number() }),
  }),
]);

export const ideaNoteEdgeSchema = z.object({
  id: z.string(),
  source: edgeEndpointSchema,
  target: edgeEndpointSchema,
  kind: z.enum(["straight", "bezier", "step", "freehand"]).default("bezier"),
  label: z.string().optional(),
  color: z.string().default("#334155"),
  strokeWidth: z.number().default(2),
  arrowHead: z.enum(["none", "end", "both", "dot-end"]).default("end"),
  dashed: z.boolean().default(false),
  roughness: z.number().optional(),
});

// ─── Board ───

export const backgroundStyleSchema = z.enum(["dot", "grid", "cross", "plain"]);

export const ideaNoteBoardSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  parentBoardId: z.string().nullable(),
  name: z.string().default(""),
  description: z.string().optional().default(""),
  thumbnailAssetId: z.string().optional(),
  viewport: viewportSchema.default(() => viewportSchema.parse({})),
  nodes: z.array(ideaNoteNodeSchema).default([]),
  edges: z.array(ideaNoteEdgeSchema).default([]),
  backgroundStyle: backgroundStyleSchema.default("dot"),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// ─── Asset (Blob 포함, 스키마 검증 단계에서는 blob 통과) ───

export const assetKindSchema = z.enum(["image", "video", "file", "thumbnail"]);

export const ideaNoteAssetMetaSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  kind: assetKindSchema,
  mime: z.string(),
  size: z.number(),
  originalName: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  createdAt: z.number(),
});

export type IdeaNoteNodeSchemaType = z.infer<typeof ideaNoteNodeSchema>;
export type IdeaNoteEdgeSchemaType = z.infer<typeof ideaNoteEdgeSchema>;
export type IdeaNoteBoardSchemaType = z.infer<typeof ideaNoteBoardSchema>;
