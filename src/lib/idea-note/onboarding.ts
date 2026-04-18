// 새 프로젝트 루트 보드에 풍부한 샘플을 시드한다.
// Picsum으로 이미지를 원격 fetch해 Blob으로 저장하며, 실패 시 해당 노드는 건너뛴다.

import type {
  IdeaNoteAsset,
  IdeaNoteBoard,
  IdeaNoteEdge,
  IdeaNoteNode,
  ShapeKind,
} from "@/types/idea-note";
import { createEmptyBoard } from "./defaults";
import { db } from "@/lib/db";

function uid(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

interface FetchedImage {
  blob: Blob;
  width: number;
  height: number;
}

async function fetchPicsumImage(
  seed: string,
  width: number,
  height: number,
  timeoutMs = 4000,
): Promise<FetchedImage | null> {
  const url = `https://picsum.photos/seed/${seed}/${width}/${height}`;
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    return { blob, width, height };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

function makeImageAsset(projectId: string, image: FetchedImage): IdeaNoteAsset {
  return {
    id: `asset-${crypto.randomUUID()}`,
    projectId,
    kind: "image",
    mime: image.blob.type || "image/jpeg",
    size: image.blob.size,
    blob: image.blob,
    width: image.width,
    height: image.height,
    createdAt: Date.now(),
  };
}

export async function buildOnboardingBoard(
  projectId: string,
  projectName: string,
): Promise<{ board: IdeaNoteBoard; assets: IdeaNoteAsset[] }> {
  const board = createEmptyBoard(projectId, `${projectName} — Ideas`);

  // ── 이미지 자산 선 fetch (병렬) ──
  const [imgA, imgB, claudeThumb] = await Promise.all([
    fetchPicsumImage("vibable-idea-1", 600, 400),
    fetchPicsumImage("vibable-idea-2", 500, 500),
    fetchPicsumImage("claude-code-og", 800, 420),
  ]);

  const assets: IdeaNoteAsset[] = [];
  const pushAsset = (img: FetchedImage | null): string | null => {
    if (!img) return null;
    const asset = makeImageAsset(projectId, img);
    assets.push(asset);
    return asset.id;
  };

  const imgAId = pushAsset(imgA);
  const imgBId = pushAsset(imgB);
  const claudeThumbId = pushAsset(claudeThumb);

  // ── 노드 레이아웃 ──
  // Row coords:
  //   y=40:  타이틀(text) + 스와치 팔레트 3개
  //   y=140: 환영 노트 + 링크(Claude Code) + 할 일
  //   y=380: 이미지 A + 이미지 B + 테이블
  //   y=640: 도형 3개 + 컬럼
  //   y=900: 드로잉 샘플
  const nodes: IdeaNoteNode[] = [];
  const now = Date.now();
  const onboard = { onboardingSample: true };

  // Row 1 ─ 제목 + 스와치
  nodes.push({
    id: uid("node"),
    type: "text",
    position: { x: 60, y: 40 },
    size: { width: 360, height: 44 },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      text: `👋 ${projectName} — Ideas`,
      fontSize: 24,
      fontWeight: 700,
      color: "#0f172a",
      align: "left",
    },
  });
  const swatchX = [560, 660, 760];
  const swatchColors: Array<{ hex: string; label: string }> = [
    { hex: "#0ea5e9", label: "Primary" },
    { hex: "#f59e0b", label: "Accent" },
    { hex: "#10b981", label: "Success" },
  ];
  swatchColors.forEach((s, i) => {
    nodes.push({
      id: uid("node"),
      type: "swatch",
      position: { x: swatchX[i], y: 40 },
      size: { width: 96, height: 96 },
      rotation: 0,
      zIndex: 1,
      ...onboard,
      data: { hex: s.hex, label: s.label },
    });
  });

  // Row 2 ─ 노트, 링크(Claude Code), 할 일
  const noteId = uid("node");
  nodes.push({
    id: noteId,
    type: "note",
    position: { x: 60, y: 140 },
    size: { width: 300, height: 200 },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      title: "환영합니다",
      richText:
        "이 보드는 아이디어 노트 예시입니다.\n\n좌측 툴바로 노트·이미지·링크를 추가하고, 노드 테두리에 나타나는 핸들을 끌어 연결해 보세요.\n\nSpace 키를 누른 채 드래그하면 캔버스를 이동합니다.",
      accentColor: "#fbbf24",
      backgroundColor: "#ffffff",
    },
  });

  const linkId = uid("node");
  nodes.push({
    id: linkId,
    type: "link",
    position: { x: 390, y: 140 },
    size: { width: 320, height: 200 },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      url: "https://claude.com/claude-code",
      title: "Claude Code",
      description:
        "터미널에서 동작하는 Anthropic의 에이전틱 코딩 도구. 코드베이스를 이해하고 변경을 실행합니다.",
      thumbnailAssetId: claudeThumbId ?? undefined,
    },
  });

  const todoId = uid("node");
  nodes.push({
    id: todoId,
    type: "todo",
    position: { x: 740, y: 140 },
    size: { width: 280, height: 200 },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      title: "체크리스트",
      items: [
        { id: uid("item"), text: "아이디어 노트 살펴보기", done: true },
        { id: uid("item"), text: "이미지 드래그해 업로드", done: false },
        { id: uid("item"), text: "형광펜으로 강조 해보기", done: false },
      ],
      showProgress: true,
    },
  });

  // Row 3 ─ 이미지 A, B (또는 fallback 노트) + 테이블
  let imageAId: string | null = null;
  if (imgAId) {
    imageAId = uid("node");
    nodes.push({
      id: imageAId,
      type: "image",
      position: { x: 60, y: 380 },
      size: { width: 300, height: 220 },
      rotation: 0,
      zIndex: 1,
      ...onboard,
      data: { assetId: imgAId, caption: "무드보드 예시", objectFit: "cover" },
    });
  }
  if (imgBId) {
    nodes.push({
      id: uid("node"),
      type: "image",
      position: { x: 390, y: 380 },
      size: { width: 240, height: 240 },
      rotation: 0,
      zIndex: 1,
      ...onboard,
      data: { assetId: imgBId, caption: "", objectFit: "cover" },
    });
  }
  nodes.push({
    id: uid("node"),
    type: "table",
    position: { x: 660, y: 380 },
    size: { width: 360, height: 180 },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      headers: ["항목", "담당", "상태"],
      rows: [
        ["리서치", "Khan", "진행 중"],
        ["목업", "—", "대기"],
        ["리뷰", "Team", "예정"],
      ],
      columnWidths: [120, 100, 100],
    },
  });

  // Row 4 ─ 도형 3종 + 컬럼
  const shapeConfigs: Array<{
    kind: ShapeKind;
    fill: string;
    text: string;
    x: number;
  }> = [
    { kind: "rect", fill: "#e0f2fe", text: "문제", x: 60 },
    { kind: "ellipse", fill: "#fef3c7", text: "아이디어", x: 220 },
    { kind: "diamond", fill: "#dcfce7", text: "결정", x: 380 },
  ];
  const shapeIds: string[] = [];
  shapeConfigs.forEach((cfg) => {
    const id = uid("node");
    shapeIds.push(id);
    nodes.push({
      id,
      type: "shape",
      position: { x: cfg.x, y: 640 },
      size: { width: 140, height: 110 },
      rotation: 0,
      zIndex: 1,
      ...onboard,
      data: {
        kind: cfg.kind,
        fill: cfg.fill,
        stroke: "#0f172a",
        strokeWidth: 2,
        text: cfg.text,
      },
    });
  });

  nodes.push({
    id: uid("node"),
    type: "column",
    position: { x: 560, y: 600 },
    size: { width: 220, height: 260 },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      title: "다음 단계",
      accent: "#f59e0b",
      childNodeIds: [],
    },
  });

  // Frame — 그룹 박스
  nodes.push({
    id: uid("node"),
    type: "frame",
    position: { x: 800, y: 600 },
    size: { width: 260, height: 260 },
    rotation: 0,
    zIndex: 0,
    ...onboard,
    data: {
      label: "아키텍처 스케치",
      background: "#f1f5f9aa",
      borderColor: "#cbd5e1",
      dashed: true,
    },
  });

  // Row 5 ─ 드로잉 샘플 (형광펜 느낌의 곡선)
  const drawingWidth = 320;
  const drawingHeight = 70;
  const wavePoints: Array<[number, number]> = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const x = t * (drawingWidth - 20) + 10;
    const y = drawingHeight / 2 + Math.sin(t * Math.PI * 3) * 18;
    wavePoints.push([x, y]);
  }
  nodes.push({
    id: uid("node"),
    type: "drawing",
    position: { x: 60, y: 900 },
    size: { width: drawingWidth, height: drawingHeight },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      strokes: [
        {
          points: wavePoints,
          color: "#fde047",
          size: 18,
          tool: "highlighter",
        },
      ],
    },
  });

  // Row 5 ─ 도움말 텍스트
  nodes.push({
    id: uid("node"),
    type: "text",
    position: { x: 420, y: 910 },
    size: { width: 480, height: 48 },
    rotation: 0,
    zIndex: 1,
    ...onboard,
    data: {
      text: "💡 툴바에서 형광펜을 선택하고 드래그해 강조할 수 있어요. 우클릭으로 색·굵기 선택.",
      fontSize: 14,
      fontWeight: 400,
      color: "#475569",
      align: "left",
    },
  });

  // ── 엣지: 도형 3개를 문제→아이디어→결정 흐름으로 연결 ──
  const edges: IdeaNoteEdge[] = [
    {
      id: uid("edge"),
      source: { nodeId: shapeIds[0], handle: "r" },
      target: { nodeId: shapeIds[1], handle: "l" },
      kind: "bezier",
      color: "#334155",
      strokeWidth: 2,
      arrowHead: "end",
      dashed: false,
    },
    {
      id: uid("edge"),
      source: { nodeId: shapeIds[1], handle: "r" },
      target: { nodeId: shapeIds[2], handle: "l" },
      kind: "bezier",
      color: "#334155",
      strokeWidth: 2,
      arrowHead: "end",
      dashed: false,
    },
  ];

  board.nodes = nodes;
  board.edges = edges;
  board.viewport = { x: 40, y: 40, zoom: 0.85 };
  board.updatedAt = now;

  return { board, assets };
}

/**
 * 프로젝트의 모든 보드 노드 수 합계. 빈 프로젝트(전체 0) 감지용.
 */
export async function countTotalNodesInProject(
  projectId: string,
): Promise<number> {
  const boards = await db.ideaBoards
    .where("projectId")
    .equals(projectId)
    .toArray();
  return boards.reduce((sum, b) => sum + b.nodes.length, 0);
}

/**
 * 기존 보드 하나에 온보딩 콘텐츠를 덮어쓴다. board id는 보존.
 */
export async function seedOnboardingIntoBoard(
  targetBoard: IdeaNoteBoard,
  projectName: string,
): Promise<void> {
  const { board: seeded, assets } = await buildOnboardingBoard(
    targetBoard.projectId,
    projectName,
  );
  await db.transaction(
    "rw",
    db.ideaBoards,
    db.ideaAssets,
    async () => {
      await db.ideaBoards.update(targetBoard.id, {
        nodes: seeded.nodes,
        edges: seeded.edges,
        viewport: seeded.viewport,
        name: targetBoard.name || seeded.name,
        updatedAt: Date.now(),
      });
      if (assets.length) await db.ideaAssets.bulkAdd(assets);
    },
  );
}

/**
 * 신규 온보딩 페이지(루트 보드)를 생성한다. 프로젝트에 페이지가 없을 때 호출.
 */
export async function createOnboardingPage(
  projectId: string,
  projectName: string,
): Promise<IdeaNoteBoard> {
  const { board, assets } = await buildOnboardingBoard(projectId, projectName);
  await db.transaction("rw", db.ideaBoards, db.ideaAssets, async () => {
    await db.ideaBoards.add(board);
    if (assets.length) await db.ideaAssets.bulkAdd(assets);
  });
  return board;
}
