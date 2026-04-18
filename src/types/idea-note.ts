// ─── 아이디어 노트: 무한 캔버스형 메모·아이데이션 도구 ───
//
// 모든 프로젝트 타입(web·mobile·cli·agent)이 공통으로 사용한다.
// 보드·자산은 PhaseData 외부 별도 Dexie 테이블에 저장한다.

export type NodeKind =
  | "note"
  | "link"
  | "todo"
  | "column"
  | "table"
  | "image"
  | "video"
  | "file"
  | "swatch"
  | "text"
  | "board"
  | "frame"
  | "shape"
  | "drawing";

export type BoardBackgroundStyle = "dot" | "grid" | "cross" | "plain";

export interface BoardViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface NodeBase {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  groupId?: string;
  locked?: boolean;
  hidden?: boolean;
  /** 최초 렌더 샘플 카드 표식 — 사용자 최초 조작 시 일괄 제거 대상 */
  onboardingSample?: boolean;
}

// ─── 노드별 데이터 ───

export interface NoteData {
  title: string;
  richText: string;
  accentColor: string;
  backgroundColor: string;
}

export interface LinkData {
  url: string;
  title: string;
  description?: string;
  thumbnailAssetId?: string;
  favicon?: string;
}

export interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  indent?: number;
}

export interface TodoData {
  title: string;
  items: TodoItem[];
  showProgress: boolean;
}

export interface ColumnData {
  title: string;
  accent: string;
  childNodeIds: string[];
}

export interface TableData {
  headers: string[];
  rows: string[][];
  columnWidths: number[];
}

export interface ImageData {
  assetId: string;
  caption?: string;
  objectFit: "cover" | "contain" | "fill";
  crop?: { x: number; y: number; w: number; h: number };
}

export interface VideoData {
  assetId?: string;
  externalUrl?: string;
  poster?: string;
}

export interface FileData {
  assetId: string;
  filename: string;
  size: number;
  mime: string;
}

export interface SwatchData {
  hex: string;
  label?: string;
}

export interface TextData {
  text: string;
  fontSize: number;
  fontWeight: 400 | 500 | 700;
  color: string;
  align: "left" | "center" | "right";
  italic?: boolean;
}

export interface BoardRefData {
  childBoardId: string;
  displayName: string;
  iconEmoji?: string;
  cardCount: number;
  fileCount: number;
}

export interface FrameData {
  label?: string;
  background: string;
  borderColor?: string;
  dashed?: boolean;
}

export type ShapeKind =
  | "rect"
  | "ellipse"
  | "diamond"
  | "triangle"
  | "hexagon";

export interface ShapeData {
  kind: ShapeKind;
  fill: string;
  stroke: string;
  strokeWidth: number;
  roughness?: number;
  text?: string;
}

export interface DrawingStroke {
  points: Array<[number, number, number?]>;
  color: string;
  size: number;
  tool: "pen" | "highlighter" | "eraser";
}

export interface DrawingData {
  strokes: DrawingStroke[];
}

// ─── 유니언 (discriminated by `type`) ───

export type IdeaNoteNode =
  | (NodeBase & { type: "note"; data: NoteData })
  | (NodeBase & { type: "link"; data: LinkData })
  | (NodeBase & { type: "todo"; data: TodoData })
  | (NodeBase & { type: "column"; data: ColumnData })
  | (NodeBase & { type: "table"; data: TableData })
  | (NodeBase & { type: "image"; data: ImageData })
  | (NodeBase & { type: "video"; data: VideoData })
  | (NodeBase & { type: "file"; data: FileData })
  | (NodeBase & { type: "swatch"; data: SwatchData })
  | (NodeBase & { type: "text"; data: TextData })
  | (NodeBase & { type: "board"; data: BoardRefData })
  | (NodeBase & { type: "frame"; data: FrameData })
  | (NodeBase & { type: "shape"; data: ShapeData })
  | (NodeBase & { type: "drawing"; data: DrawingData });

// ─── 엣지 ───

export type EdgeEndpoint =
  | { nodeId: string; handle?: "t" | "r" | "b" | "l" }
  | { free: { x: number; y: number } };

export interface IdeaNoteEdge {
  id: string;
  source: EdgeEndpoint;
  target: EdgeEndpoint;
  kind: "straight" | "bezier" | "step" | "freehand";
  label?: string;
  color: string;
  strokeWidth: number;
  arrowHead: "none" | "end" | "both" | "dot-end";
  dashed: boolean;
  roughness?: number;
}

// ─── Board / Asset ───

export interface IdeaNoteBoard {
  id: string;
  projectId: string;
  parentBoardId: string | null;
  name: string;
  description?: string;
  thumbnailAssetId?: string;
  viewport: BoardViewport;
  nodes: IdeaNoteNode[];
  edges: IdeaNoteEdge[];
  backgroundStyle: BoardBackgroundStyle;
  createdAt: number;
  updatedAt: number;
}

export type AssetKind = "image" | "video" | "file" | "thumbnail";

export interface IdeaNoteAsset {
  id: string;
  projectId: string;
  kind: AssetKind;
  mime: string;
  size: number;
  originalName?: string;
  blob: Blob;
  width?: number;
  height?: number;
  createdAt: number;
}

// ─── Bundle ( .vbn export 포맷) ───

export interface IdeaNoteBundleManifest {
  vibableBundleVersion: 1;
  projectId: string;
  exportedAt: number;
  boards: Array<{ id: string; name: string; parentBoardId: string | null }>;
  assets: Array<{
    id: string;
    kind: AssetKind;
    mime: string;
    size: number;
    originalName?: string;
    width?: number;
    height?: number;
  }>;
}
