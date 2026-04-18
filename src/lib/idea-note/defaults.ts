import type {
  IdeaNoteBoard,
  IdeaNoteNode,
  NodeKind,
  TodoItem,
} from "@/types/idea-note";

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

export function createEmptyBoard(
  projectId: string,
  name: string,
  parentBoardId: string | null = null,
): IdeaNoteBoard {
  const now = Date.now();
  return {
    id: uid("board"),
    projectId,
    parentBoardId,
    name,
    description: "",
    viewport: { x: 0, y: 0, zoom: 1 },
    nodes: [],
    edges: [],
    backgroundStyle: "dot",
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 새 프로젝트의 루트 보드는 "무엇을 할 수 있는지" 즉시 보여주기 위해
 * 샘플 노트 + 투두 + 스와치를 배치한다. onboardingSample 플래그가 찍혀
 * 사용자의 첫 조작(노드 생성·수정·이동) 시 일괄 제거된다.
 */
export function createOnboardingBoard(
  projectId: string,
  projectName: string,
): IdeaNoteBoard {
  const board = createEmptyBoard(projectId, `${projectName} — Ideas`);
  const now = Date.now();

  const noteNode: IdeaNoteNode = {
    id: uid("node"),
    type: "note",
    position: { x: 80, y: 120 },
    size: { width: 280, height: 180 },
    rotation: 0,
    zIndex: 1,
    onboardingSample: true,
    data: {
      title: "환영합니다",
      richText:
        "좌측 툴바에서 노트·링크·이미지·보드 등을 드래그해 자유롭게 배치하세요.\n\nMilanote 스타일의 무한 캔버스입니다.",
      accentColor: "#fbbf24",
      backgroundColor: "#ffffff",
    },
  };

  const todoItems: TodoItem[] = [
    { id: uid("item"), text: "아이디어 노트 살펴보기", done: true },
    { id: uid("item"), text: "이미지를 드래그해 업로드", done: false },
    { id: uid("item"), text: "보드를 생성해 중첩 구조 체험", done: false },
  ];

  const todoNode: IdeaNoteNode = {
    id: uid("node"),
    type: "todo",
    position: { x: 420, y: 120 },
    size: { width: 280, height: 200 },
    rotation: 0,
    zIndex: 1,
    onboardingSample: true,
    data: {
      title: "시작하기",
      items: todoItems,
      showProgress: true,
    },
  };

  const swatchNode: IdeaNoteNode = {
    id: uid("node"),
    type: "swatch",
    position: { x: 760, y: 120 },
    size: { width: 160, height: 160 },
    rotation: 0,
    zIndex: 1,
    onboardingSample: true,
    data: {
      hex: "#0ea5e9",
      label: "Primary",
    },
  };

  board.nodes = [noteNode, todoNode, swatchNode];
  board.updatedAt = now;
  return board;
}

export function createNodeOfKind(
  kind: NodeKind,
  position: { x: number; y: number },
  extra?: Partial<IdeaNoteNode>,
): IdeaNoteNode {
  const base = {
    id: uid("node"),
    position,
    rotation: 0,
    zIndex: 1,
  };

  switch (kind) {
    case "note":
      return {
        ...base,
        type: "note",
        size: { width: 260, height: 180 },
        data: {
          title: "",
          richText: "",
          accentColor: "#fbbf24",
          backgroundColor: "#ffffff",
        },
        ...extra,
      } as IdeaNoteNode;
    case "link":
      return {
        ...base,
        type: "link",
        size: { width: 280, height: 140 },
        data: { url: "", title: "", description: "" },
        ...extra,
      } as IdeaNoteNode;
    case "todo":
      return {
        ...base,
        type: "todo",
        size: { width: 280, height: 200 },
        data: { title: "To-do", items: [], showProgress: true },
        ...extra,
      } as IdeaNoteNode;
    case "column":
      return {
        ...base,
        type: "column",
        size: { width: 240, height: 320 },
        data: { title: "Column", accent: "#a8a29e", childNodeIds: [] },
        ...extra,
      } as IdeaNoteNode;
    case "table":
      return {
        ...base,
        type: "table",
        size: { width: 360, height: 160 },
        data: {
          headers: ["Col 1", "Col 2"],
          rows: [
            ["", ""],
            ["", ""],
          ],
          columnWidths: [160, 160],
        },
        ...extra,
      } as IdeaNoteNode;
    case "image":
      return {
        ...base,
        type: "image",
        size: { width: 280, height: 200 },
        data: { assetId: "", caption: "", objectFit: "cover" },
        ...extra,
      } as IdeaNoteNode;
    case "video":
      return {
        ...base,
        type: "video",
        size: { width: 320, height: 200 },
        data: {},
        ...extra,
      } as IdeaNoteNode;
    case "file":
      return {
        ...base,
        type: "file",
        size: { width: 280, height: 90 },
        data: { assetId: "", filename: "", size: 0, mime: "" },
        ...extra,
      } as IdeaNoteNode;
    case "swatch":
      return {
        ...base,
        type: "swatch",
        size: { width: 160, height: 160 },
        data: { hex: "#0ea5e9", label: "" },
        ...extra,
      } as IdeaNoteNode;
    case "text":
      return {
        ...base,
        type: "text",
        size: { width: 200, height: 40 },
        data: {
          text: "Text",
          fontSize: 18,
          fontWeight: 500,
          color: "#0f172a",
          align: "left",
        },
        ...extra,
      } as IdeaNoteNode;
    case "board":
      return {
        ...base,
        type: "board",
        size: { width: 240, height: 180 },
        data: {
          childBoardId: "",
          displayName: "New board",
          cardCount: 0,
          fileCount: 0,
        },
        ...extra,
      } as IdeaNoteNode;
    case "frame":
      return {
        ...base,
        type: "frame",
        size: { width: 360, height: 240 },
        data: { label: "", background: "#f8fafc80" },
        ...extra,
      } as IdeaNoteNode;
    case "shape":
      return {
        ...base,
        type: "shape",
        size: { width: 160, height: 120 },
        data: {
          kind: "rect",
          fill: "#e2e8f0",
          stroke: "#0f172a",
          strokeWidth: 2,
          text: "",
        },
        ...extra,
      } as IdeaNoteNode;
    case "drawing":
      return {
        ...base,
        type: "drawing",
        size: { width: 320, height: 240 },
        data: { strokes: [] },
        ...extra,
      } as IdeaNoteNode;
  }
}
