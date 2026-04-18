"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  ConnectionMode,
  Controls,
  MiniMap,
  useReactFlow,
  type Connection,
  type Node as RFNode,
  type Edge as RFEdge,
  type NodeChange,
  type EdgeChange,
  type OnSelectionChangeParams,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useRouter } from "next/navigation";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import { ideaNoteNodeTypes } from "./nodes";
import { ideaNoteEdgeTypes } from "./edges";
import { usePasteToCanvas } from "@/hooks/use-paste-to-canvas.hook";
import { createNodeOfKind } from "@/lib/idea-note/defaults";
import {
  toFlowEdges,
  toFlowNodes,
  snapPosition,
} from "@/lib/idea-note/flow-mapping";
import { createEmptyBoard } from "@/lib/idea-note/defaults";
import { db } from "@/lib/db";
import type { IdeaNoteEdge } from "@/types/idea-note";
import {
  DrawSettingsPopover,
  type DrawSettingsPopoverState,
} from "./draw-settings-popover";

export function IdeaNoteCanvas({
  projectId,
}: {
  projectId: string;
  boardId: string;
}) {
  const router = useRouter();
  const board = useIdeaNoteStore((s) => s.board);
  const activeTool = useIdeaNoteStore((s) => s.activeTool);
  const setActiveTool = useIdeaNoteStore((s) => s.setActiveTool);
  const addNode = useIdeaNoteStore((s) => s.addNode);
  const addEdge = useIdeaNoteStore((s) => s.addEdge);
  const updateNode = useIdeaNoteStore((s) => s.updateNode);
  const removeNodes = useIdeaNoteStore((s) => s.removeNodes);
  const removeEdges = useIdeaNoteStore((s) => s.removeEdges);
  const setSelectedNodes = useIdeaNoteStore((s) => s.setSelectedNodes);
  const setSelectedEdges = useIdeaNoteStore((s) => s.setSelectedEdges);
  const clearOnboardingSamples = useIdeaNoteStore(
    (s) => s.clearOnboardingSamples,
  );
  const commitHistory = useIdeaNoteStore((s) => s.commitHistory);
  const isGridVisible = useIdeaNoteStore((s) => s.isGridVisible);
  const snapToGrid = useIdeaNoteStore((s) => s.snapToGrid);
  const gridSize = useIdeaNoteStore((s) => s.gridSize);
  const activeShapeKind = useIdeaNoteStore((s) => s.activeShapeKind);
  const drawColor = useIdeaNoteStore((s) => s.drawColor);
  const drawSize = useIdeaNoteStore((s) => s.drawSize);
  const pushBoardStack = useIdeaNoteStore((s) => s.pushBoardStack);

  const { screenToFlowPosition } = useReactFlow();
  const { handleFiles } = usePasteToCanvas();
  const containerRef = useRef<HTMLDivElement>(null);

  // xyflow의 presentation 상태는 canvas가 직접 소유한다.
  // applyNodeChanges가 반환하는 measured/selected/dragging 을 렌더 간에 보존해야
  // 드래그·리사이즈가 정상 동작한다(에러 #015 방지).
  const [rfNodes, setRfNodes] = useState<RFNode[]>([]);
  const [rfEdges, setRfEdges] = useState<RFEdge[]>([]);
  const lastSeenBoardIdRef = useRef<string | null>(null);

  // board → rfNodes/rfEdges 동기화
  // Zustand store에서 읽은 board(외부 상태)를 xyflow의 presentation 상태로 브릿지한다.
  // 렌더 중 파생으로 구현하면 applyNodeChanges가 세팅한 measured가 매 렌더 유실되어
  // xyflow 에러 #015("uninitialized node")가 발생한다.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!board) {
      setRfNodes([]);
      setRfEdges([]);
      lastSeenBoardIdRef.current = null;
      return;
    }
    const isSameBoard = lastSeenBoardIdRef.current === board.id;
    lastSeenBoardIdRef.current = board.id;

    if (!isSameBoard) {
      // 보드 전환 — 전체 재시드
      setRfNodes(toFlowNodes(board));
      setRfEdges(toFlowEdges(board));
      return;
    }
    // 같은 보드에서 store-side 변경 (addNode / updateNodeData / removeNodes 등)
    // → 기존 rfNodes의 measured/선택/드래그 상태는 보존하면서 data·size만 머지
    setRfNodes((prev) => {
      const prevById = new Map(prev.map((n) => [n.id, n]));
      return toFlowNodes(board).map((fresh) => {
        const old = prevById.get(fresh.id);
        if (!old) return fresh; // 신규 노드
        return {
          ...fresh,
          position: old.position ?? fresh.position,
          measured: old.measured,
          selected: old.selected,
          dragging: old.dragging,
        };
      });
    });
    setRfEdges((prev) => {
      const prevById = new Map(prev.map((e) => [e.id, e]));
      return toFlowEdges(board).map((fresh) => {
        const old = prevById.get(fresh.id);
        if (!old) return fresh;
        return { ...fresh, selected: old.selected };
      });
    });
  }, [board]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // 드래그 시작(mousedown) 시 히스토리 스냅샷 1회, 드래그 종료 시 반영
  const dragCommittedRef = useRef(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // 1) xyflow 로컬 상태에 변경을 그대로 적용 — measured/selected 보존
      setRfNodes((prev) => applyNodeChanges(changes, prev));

      // 2) store로 미러링
      // 삭제는 즉시 반영(히스토리 커밋 포함)
      const removedIds = changes
        .filter((c) => c.type === "remove")
        .map((c) => (c as { id: string }).id);
      if (removedIds.length) {
        commitHistory();
        removeNodes(removedIds);
      }

      // 리사이즈 종료(resizing:false) 시점에만 size를 store에 반영
      for (const c of changes) {
        if (
          c.type === "dimensions" &&
          (c as { resizing?: boolean }).resizing === false &&
          (c as { dimensions?: { width: number; height: number } }).dimensions
        ) {
          const dim = (c as { dimensions: { width: number; height: number } })
            .dimensions;
          updateNode((c as { id: string }).id, {
            size: { width: dim.width, height: dim.height },
          });
        }
      }

      // 3) 첫 조작 시 온보딩 샘플 정리
      if (!board) return;
      const anyMeaningful = changes.some(
        (c) =>
          c.type === "position" ||
          c.type === "dimensions" ||
          c.type === "remove" ||
          c.type === "replace",
      );
      if (anyMeaningful && board.nodes.some((n) => n.onboardingSample)) {
        const touchedOnlySample = changes.every((c) => {
          if (c.type === "position" || c.type === "dimensions") {
            const n = board.nodes.find(
              (node) => node.id === (c as { id: string }).id,
            );
            return n?.onboardingSample ?? false;
          }
          return false;
        });
        if (!touchedOnlySample) {
          clearOnboardingSamples();
        }
      }
    },
    [board, commitHistory, removeNodes, updateNode, clearOnboardingSamples],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      setRfEdges((prev) => applyEdgeChanges(changes, prev));
      const removedIds = changes
        .filter((c) => c.type === "remove")
        .map((c) => (c as { id: string }).id);
      if (removedIds.length) removeEdges(removedIds);
    },
    [removeEdges],
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      if (conn.source === conn.target) return; // self-loop 차단
      commitHistory();
      const handleKey = (h: string | null | undefined) => {
        if (!h) return undefined;
        const k = h as "t" | "r" | "b" | "l";
        return k === "t" || k === "r" || k === "b" || k === "l" ? k : undefined;
      };
      const edge: IdeaNoteEdge = {
        id: `edge-${crypto.randomUUID().slice(0, 8)}`,
        source: { nodeId: conn.source, handle: handleKey(conn.sourceHandle) },
        target: { nodeId: conn.target, handle: handleKey(conn.targetHandle) },
        kind: "bezier",
        color: "#334155",
        strokeWidth: 2,
        arrowHead: "end",
        dashed: false,
      };
      addEdge(edge);
    },
    [addEdge, commitHistory],
  );

  const onPaneClick = useCallback(
    async (event: React.MouseEvent) => {
      if (!board) return;
      if (activeTool === "select") return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const snapped = snapToGrid ? snapPosition(position, gridSize) : position;

      // 도구별로 노드 생성
      commitHistory();

      if (activeTool === "image") {
        // 파일 선택창 오픈
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = true;
        input.onchange = async () => {
          const files = Array.from(input.files ?? []);
          if (files.length) {
            await handleFiles(files, {
              clientX: event.clientX,
              clientY: event.clientY,
            });
          }
        };
        input.click();
        setActiveTool("select");
        return;
      }
      if (activeTool === "file") {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.onchange = async () => {
          const files = Array.from(input.files ?? []);
          if (files.length) {
            await handleFiles(files, {
              clientX: event.clientX,
              clientY: event.clientY,
            });
          }
        };
        input.click();
        setActiveTool("select");
        return;
      }
      if (activeTool === "board") {
        // 자식 보드 생성 후 참조 노드 삽입
        const child = createEmptyBoard(projectId, "New board", board.id);
        await db.ideaBoards.add(child);
        addNode(
          createNodeOfKind("board", snapped, {
            data: {
              childBoardId: child.id,
              displayName: child.name,
              cardCount: 0,
              fileCount: 0,
            },
          }),
        );
        setActiveTool("select");
        return;
      }
      if (activeTool === "line" || activeTool === "draw") {
        // 라인/드로잉 도구는 클릭이 아닌 드래그로 동작. 빈 공간 클릭은 무시.
        return;
      }

      if (activeTool === "shape") {
        addNode(
          createNodeOfKind("shape", snapped, {
            data: {
              kind: activeShapeKind,
              fill: "#e2e8f0",
              stroke: "#0f172a",
              strokeWidth: 2,
              text: "",
            },
          }),
        );
        setActiveTool("select");
        return;
      }

      addNode(createNodeOfKind(activeTool, snapped));
      setActiveTool("select");
    },
    [
      board,
      activeTool,
      activeShapeKind,
      screenToFlowPosition,
      snapToGrid,
      gridSize,
      commitHistory,
      projectId,
      addNode,
      setActiveTool,
      handleFiles,
    ],
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, rfNode: RFNode) => {
      if (!board) return;
      if (rfNode.type === "board") {
        const original = board.nodes.find((n) => n.id === rfNode.id);
        if (!original || original.type !== "board") return;
        pushBoardStack({ id: board.id, name: board.name });
        router.push(
          `/workspace/${projectId}/idea-note/${original.data.childBoardId}`,
        );
      }
    },
    [board, router, projectId, pushBoardStack],
  );

  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      setSelectedNodes(params.nodes.map((n) => n.id));
      setSelectedEdges(params.edges.map((e) => e.id));
    },
    [setSelectedNodes, setSelectedEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length === 0) return;
      await handleFiles(files, {
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    [handleFiles],
  );

  // Ctrl/Cmd+V 클립보드 이미지 붙여넣기
  useEffect(() => {
    const onPaste = async (e: ClipboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length) {
        const bounds = containerRef.current?.getBoundingClientRect();
        const center = bounds
          ? {
              clientX: bounds.left + bounds.width / 2,
              clientY: bounds.top + bounds.height / 2,
            }
          : { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 };
        await handleFiles(files, center);
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handleFiles]);

  // 드래그 종료 시 히스토리 커밋
  const onNodeDragStart = useCallback(() => {
    if (!dragCommittedRef.current) {
      commitHistory();
      dragCommittedRef.current = true;
    }
  }, [commitHistory]);
  const onNodeDragStop = useCallback(() => {
    dragCommittedRef.current = false;
  }, []);

  // 스페이스 키로 팬 모드 활성화 — 커서를 grab/grabbing으로 바꾼다.
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const [isPanGrabbing, setIsPanGrabbing] = useState(false);
  useEffect(() => {
    const isEditingText = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      return (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      );
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isEditingText(e.target) && !e.repeat) {
        setIsSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpaceHeld(false);
        setIsPanGrabbing(false);
      }
    };
    const onBlur = () => {
      setIsSpaceHeld(false);
      setIsPanGrabbing(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const paneCursor = isSpaceHeld
    ? isPanGrabbing
      ? "grabbing"
      : "grab"
    : activeTool === "select"
      ? "default"
      : activeTool === "line" || activeTool === "draw"
        ? "crosshair"
        : "copy";

  // ─── 형광펜 드로잉 오버레이 ───
  // 드래그 중 스트로크 좌표를 flow 좌표로 누적하고, 릴리즈 시점에 drawing 노드로 변환.
  const [currentStroke, setCurrentStroke] = useState<
    Array<[number, number]> | null
  >(null);
  const [drawSettingsState, setDrawSettingsState] =
    useState<DrawSettingsPopoverState | null>(null);

  const startDrawStroke = useCallback(
    (clientX: number, clientY: number) => {
      const p = screenToFlowPosition({ x: clientX, y: clientY });
      setCurrentStroke([[p.x, p.y]]);
    },
    [screenToFlowPosition],
  );
  const extendDrawStroke = useCallback(
    (clientX: number, clientY: number) => {
      setCurrentStroke((prev) => {
        if (!prev) return prev;
        const p = screenToFlowPosition({ x: clientX, y: clientY });
        // 가까운 점은 스킵(노이즈 방지)
        const last = prev[prev.length - 1];
        if (
          Math.hypot(p.x - last[0], p.y - last[1]) < 1.5
        ) {
          return prev;
        }
        return [...prev, [p.x, p.y]];
      });
    },
    [screenToFlowPosition],
  );
  const endDrawStroke = useCallback(() => {
    setCurrentStroke((stroke) => {
      if (!stroke || stroke.length < 2) return null;
      // bounding box 계산
      const xs = stroke.map((p) => p[0]);
      const ys = stroke.map((p) => p[1]);
      const pad = Math.max(4, drawSize);
      const minX = Math.min(...xs) - pad;
      const minY = Math.min(...ys) - pad;
      const maxX = Math.max(...xs) + pad;
      const maxY = Math.max(...ys) + pad;
      const width = Math.max(40, maxX - minX);
      const height = Math.max(40, maxY - minY);
      const relPoints: Array<[number, number]> = stroke.map((p) => [
        p[0] - minX,
        p[1] - minY,
      ]);
      commitHistory();
      addNode(
        createNodeOfKind(
          "drawing",
          { x: minX, y: minY },
          {
            size: { width, height },
            data: {
              strokes: [
                {
                  points: relPoints,
                  color: drawColor,
                  size: drawSize,
                  tool: "highlighter",
                },
              ],
            },
          },
        ),
      );
      return null;
    });
  }, [drawColor, drawSize, commitHistory, addNode]);

  useEffect(() => {
    // 뷰포트 저장은 onMoveEnd로
  }, []);

  // 현재 진행 중인 스트로크의 화면 좌표 (SVG 오버레이 렌더용)
  const viewportForStroke = board?.viewport ?? { x: 0, y: 0, zoom: 1 };
  const strokeScreenPoints = currentStroke
    ? currentStroke.map(
        ([x, y]): [number, number] => [
          x * viewportForStroke.zoom + viewportForStroke.x,
          y * viewportForStroke.zoom + viewportForStroke.y,
        ],
      )
    : null;
  const strokeScreenPath = strokeScreenPoints
    ? strokeScreenPoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p[0]} ${p[1]}`)
        .join(" ")
    : "";

  const handleContainerPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (activeTool !== "draw") return;
      if (e.button !== 0) return; // 왼쪽 버튼만
      if (isSpaceHeld) return; // 팬 모드면 드로잉 무시
      e.preventDefault();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      startDrawStroke(e.clientX, e.clientY);
    },
    [activeTool, isSpaceHeld, startDrawStroke],
  );

  const handleContainerPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activeTool !== "draw") return;
      if (!currentStroke) return;
      extendDrawStroke(e.clientX, e.clientY);
    },
    [activeTool, currentStroke, extendDrawStroke],
  );

  const handleContainerPointerUp = useCallback(() => {
    if (activeTool !== "draw") return;
    if (!currentStroke) return;
    endDrawStroke();
  }, [activeTool, currentStroke, endDrawStroke]);

  const handleContainerContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== "draw") return;
      e.preventDefault();
      setDrawSettingsState({ clientX: e.clientX, clientY: e.clientY });
    },
    [activeTool],
  );

  if (!board) return null;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full"
      style={{ cursor: paneCursor }}
      onPointerDown={handleContainerPointerDown}
      onPointerMove={handleContainerPointerMove}
      onPointerUp={handleContainerPointerUp}
      onPointerLeave={handleContainerPointerUp}
      onContextMenu={handleContainerContextMenu}
    >
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={ideaNoteNodeTypes}
        edgeTypes={ideaNoteEdgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onSelectionChange={onSelectionChange}
        onNodeDragStart={onNodeDragStart}
        onNodeDragStop={(_, node) => {
          onNodeDragStop();
          // 스냅 반영된 최종 좌표 저장
          if (!board) return;
          updateNode(node.id, { position: node.position });
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        defaultViewport={board.viewport}
        onMove={(_, viewport) => {
          useIdeaNoteStore.setState((s) =>
            s.board ? { board: { ...s.board, viewport } } : s,
          );
        }}
        snapToGrid={snapToGrid}
        snapGrid={[gridSize, gridSize]}
        fitView={false}
        minZoom={0.2}
        maxZoom={3}
        deleteKeyCode={null}
        connectionMode={ConnectionMode.Loose}
        connectOnClick={false}
        nodesConnectable
        // 기본 드래그는 팬이 아닌 박스 선택. Space+드래그로만 팬.
        // draw/line 툴일 때는 박스 선택도 끈다 — 드로잉/연결 제스처와 충돌 방지.
        panOnDrag={isSpaceHeld}
        selectionOnDrag={
          !isSpaceHeld && activeTool !== "draw" && activeTool !== "line"
        }
        onMoveStart={() => {
          if (isSpaceHeld) setIsPanGrabbing(true);
        }}
        onMoveEnd={() => {
          setIsPanGrabbing(false);
        }}
        defaultEdgeOptions={{
          type: "connector",
          data: {
            color: "#334155",
            strokeWidth: 2,
            arrowHead: "end",
            dashed: false,
          },
        }}
        proOptions={{ hideAttribution: true }}
        className="h-full w-full"
      >
        {isGridVisible && (
          <Background
            gap={gridSize}
            size={1.5}
            variant={
              board.backgroundStyle === "grid"
                ? BackgroundVariant.Lines
                : board.backgroundStyle === "cross"
                  ? BackgroundVariant.Cross
                  : BackgroundVariant.Dots
            }
            color="#cbd5e1"
          />
        )}
        <Controls position="bottom-left" showInteractive={false} />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => {
            switch (n.type) {
              case "note":
                return "#fbbf24";
              case "image":
                return "#60a5fa";
              case "board":
                return "#f59e0b";
              case "swatch":
                return "#a78bfa";
              default:
                return "#94a3b8";
            }
          }}
          className="!bg-card !border"
        />
      </ReactFlow>

      {/* 형광펜 드래그 중 실시간 스트로크 오버레이 */}
      {strokeScreenPath && (
        <svg
          className="pointer-events-none absolute inset-0 z-40 h-full w-full"
          aria-hidden
        >
          <path
            d={strokeScreenPath}
            stroke={drawColor}
            strokeWidth={drawSize * (viewportForStroke.zoom || 1)}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.55}
          />
        </svg>
      )}

      <DrawSettingsPopover
        state={drawSettingsState}
        onClose={() => setDrawSettingsState(null)}
      />
    </div>
  );
}
