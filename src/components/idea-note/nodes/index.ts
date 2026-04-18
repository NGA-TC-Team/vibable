import type { NodeTypes } from "@xyflow/react";
import { NoteNode } from "./note-node";
import { LinkNode } from "./link-node";
import { TodoNode } from "./todo-node";
import { ColumnNode } from "./column-node";
import { TableNode } from "./table-node";
import { ImageNode } from "./image-node";
import { VideoNode } from "./video-node";
import { FileNode } from "./file-node";
import { SwatchNode } from "./swatch-node";
import { TextNode } from "./text-node";
import { BoardNode } from "./board-node";
import { FrameNode } from "./frame-node";
import { ShapeNode } from "./shape-node";
import { DrawingNode } from "./drawing-node";

export const ideaNoteNodeTypes: NodeTypes = {
  note: NoteNode,
  link: LinkNode,
  todo: TodoNode,
  column: ColumnNode,
  table: TableNode,
  image: ImageNode,
  video: VideoNode,
  file: FileNode,
  swatch: SwatchNode,
  text: TextNode,
  board: BoardNode,
  frame: FrameNode,
  shape: ShapeNode,
  drawing: DrawingNode,
};
