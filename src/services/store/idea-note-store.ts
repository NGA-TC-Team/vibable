import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  IdeaNoteBoard,
  IdeaNoteEdge,
  IdeaNoteNode,
  ShapeKind,
} from "@/types/idea-note";

export type ActiveTool =
  | "select"
  | "note"
  | "link"
  | "todo"
  | "line"
  | "board"
  | "column"
  | "table"
  | "image"
  | "file"
  | "draw"
  | "shape"
  | "text"
  | "swatch";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export interface HistorySnapshot {
  nodes: IdeaNoteNode[];
  edges: IdeaNoteEdge[];
}

export interface ClipboardPayload {
  nodes: IdeaNoteNode[];
  edges: IdeaNoteEdge[];
}

const HISTORY_LIMIT = 50;

interface IdeaNoteState {
  projectId: string | null;
  currentBoardId: string | null;
  boardStack: Array<{ id: string; name: string }>;
  board: IdeaNoteBoard | null;
  selectedNodeIds: string[];
  selectedEdgeIds: string[];
  activeTool: ActiveTool;
  clipboard: ClipboardPayload | null;
  history: { past: HistorySnapshot[]; future: HistorySnapshot[] };
  isGridVisible: boolean;
  snapToGrid: boolean;
  gridSize: number;
  activeShapeKind: ShapeKind;
  drawColor: string;
  drawSize: number;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;

  // session
  setProjectId: (id: string | null) => void;
  setBoard: (board: IdeaNoteBoard | null) => void;
  setBoardStack: (stack: Array<{ id: string; name: string }>) => void;
  pushBoardStack: (entry: { id: string; name: string }) => void;
  popBoardStack: () => void;
  setCurrentBoardId: (id: string | null) => void;

  // node ops
  addNode: (node: IdeaNoteNode) => void;
  updateNode: (id: string, patch: Partial<IdeaNoteNode>) => void;
  updateNodeData: (id: string, dataPatch: Record<string, unknown>) => void;
  removeNodes: (ids: string[]) => void;
  replaceNodes: (nodes: IdeaNoteNode[]) => void;

  // edge ops
  addEdge: (edge: IdeaNoteEdge) => void;
  updateEdge: (id: string, patch: Partial<IdeaNoteEdge>) => void;
  removeEdges: (ids: string[]) => void;
  replaceEdges: (edges: IdeaNoteEdge[]) => void;

  // selection
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;

  // tool
  setActiveTool: (tool: ActiveTool) => void;

  // clipboard
  setClipboard: (payload: ClipboardPayload | null) => void;

  // history
  commitHistory: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // view
  setGridVisible: (v: boolean) => void;
  setSnapToGrid: (v: boolean) => void;
  setGridSize: (size: number) => void;
  setActiveShapeKind: (kind: ShapeKind) => void;
  setDrawColor: (color: string) => void;
  setDrawSize: (size: number) => void;

  // save status
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (ts: number | null) => void;

  // bulk
  clearOnboardingSamples: () => void;

  reset: () => void;
}

const initialState = {
  projectId: null as string | null,
  currentBoardId: null as string | null,
  boardStack: [] as Array<{ id: string; name: string }>,
  board: null as IdeaNoteBoard | null,
  selectedNodeIds: [] as string[],
  selectedEdgeIds: [] as string[],
  activeTool: "select" as ActiveTool,
  clipboard: null as ClipboardPayload | null,
  history: { past: [] as HistorySnapshot[], future: [] as HistorySnapshot[] },
  isGridVisible: true,
  snapToGrid: false,
  gridSize: 16,
  activeShapeKind: "rect" as ShapeKind,
  drawColor: "#fde047", // 노랑 형광펜
  drawSize: 10,
  saveStatus: "idle" as SaveStatus,
  lastSavedAt: null as number | null,
};

function cloneSnapshot(board: IdeaNoteBoard | null): HistorySnapshot | null {
  if (!board) return null;
  return {
    nodes: board.nodes.map((n) => ({ ...n, data: { ...(n.data as object) } }) as IdeaNoteNode),
    edges: board.edges.map((e) => ({ ...e })),
  };
}

const devEnabled = process.env.NODE_ENV === "development";

export const useIdeaNoteStore = create<IdeaNoteState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setProjectId: (projectId) => set({ projectId }),
      setBoard: (board) => set({ board }),
      setBoardStack: (boardStack) => set({ boardStack }),
      pushBoardStack: (entry) =>
        set((s) => ({ boardStack: [...s.boardStack, entry] })),
      popBoardStack: () =>
        set((s) => ({ boardStack: s.boardStack.slice(0, -1) })),
      setCurrentBoardId: (currentBoardId) => set({ currentBoardId }),

      addNode: (node) =>
        set((s) => {
          if (!s.board) return s;
          return {
            ...s,
            board: {
              ...s.board,
              nodes: [...s.board.nodes, node],
              updatedAt: Date.now(),
            },
          };
        }),

      updateNode: (id, patch) =>
        set((s) => {
          if (!s.board) return s;
          return {
            ...s,
            board: {
              ...s.board,
              nodes: s.board.nodes.map((n) =>
                n.id === id ? ({ ...n, ...patch } as IdeaNoteNode) : n,
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      updateNodeData: (id, dataPatch) =>
        set((s) => {
          if (!s.board) return s;
          return {
            ...s,
            board: {
              ...s.board,
              nodes: s.board.nodes.map((n) =>
                n.id === id
                  ? ({ ...n, data: { ...(n.data as object), ...dataPatch } } as IdeaNoteNode)
                  : n,
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      removeNodes: (ids) =>
        set((s) => {
          if (!s.board) return s;
          const idSet = new Set(ids);
          return {
            ...s,
            board: {
              ...s.board,
              nodes: s.board.nodes.filter((n) => !idSet.has(n.id)),
              edges: s.board.edges.filter((e) => {
                const src = "nodeId" in e.source ? e.source.nodeId : null;
                const tgt = "nodeId" in e.target ? e.target.nodeId : null;
                if (src && idSet.has(src)) return false;
                if (tgt && idSet.has(tgt)) return false;
                return true;
              }),
              updatedAt: Date.now(),
            },
            selectedNodeIds: s.selectedNodeIds.filter((id) => !idSet.has(id)),
          };
        }),

      replaceNodes: (nodes) =>
        set((s) => {
          if (!s.board) return s;
          return {
            ...s,
            board: { ...s.board, nodes, updatedAt: Date.now() },
          };
        }),

      addEdge: (edge) =>
        set((s) => {
          if (!s.board) return s;
          return {
            ...s,
            board: {
              ...s.board,
              edges: [...s.board.edges, edge],
              updatedAt: Date.now(),
            },
          };
        }),

      updateEdge: (id, patch) =>
        set((s) => {
          if (!s.board) return s;
          return {
            ...s,
            board: {
              ...s.board,
              edges: s.board.edges.map((e) =>
                e.id === id ? { ...e, ...patch } : e,
              ),
              updatedAt: Date.now(),
            },
          };
        }),

      removeEdges: (ids) =>
        set((s) => {
          if (!s.board) return s;
          const idSet = new Set(ids);
          return {
            ...s,
            board: {
              ...s.board,
              edges: s.board.edges.filter((e) => !idSet.has(e.id)),
              updatedAt: Date.now(),
            },
            selectedEdgeIds: s.selectedEdgeIds.filter((id) => !idSet.has(id)),
          };
        }),

      replaceEdges: (edges) =>
        set((s) => {
          if (!s.board) return s;
          return {
            ...s,
            board: { ...s.board, edges, updatedAt: Date.now() },
          };
        }),

      setSelectedNodes: (ids) => set({ selectedNodeIds: ids }),
      setSelectedEdges: (ids) => set({ selectedEdgeIds: ids }),
      clearSelection: () => set({ selectedNodeIds: [], selectedEdgeIds: [] }),

      setActiveTool: (activeTool) => set({ activeTool }),

      setClipboard: (clipboard) => set({ clipboard }),

      commitHistory: () => {
        const snap = cloneSnapshot(get().board);
        if (!snap) return;
        set((s) => ({
          history: {
            past: [...s.history.past.slice(-(HISTORY_LIMIT - 1)), snap],
            future: [],
          },
        }));
      },

      undo: () =>
        set((s) => {
          if (!s.board || s.history.past.length === 0) return s;
          const previous = s.history.past[s.history.past.length - 1];
          const currentSnap = cloneSnapshot(s.board)!;
          return {
            ...s,
            board: {
              ...s.board,
              nodes: previous.nodes,
              edges: previous.edges,
              updatedAt: Date.now(),
            },
            history: {
              past: s.history.past.slice(0, -1),
              future: [currentSnap, ...s.history.future],
            },
          };
        }),

      redo: () =>
        set((s) => {
          if (!s.board || s.history.future.length === 0) return s;
          const next = s.history.future[0];
          const currentSnap = cloneSnapshot(s.board)!;
          return {
            ...s,
            board: {
              ...s.board,
              nodes: next.nodes,
              edges: next.edges,
              updatedAt: Date.now(),
            },
            history: {
              past: [...s.history.past, currentSnap],
              future: s.history.future.slice(1),
            },
          };
        }),

      clearHistory: () =>
        set({ history: { past: [], future: [] } }),

      setGridVisible: (isGridVisible) => set({ isGridVisible }),
      setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
      setGridSize: (gridSize) => set({ gridSize }),
      setActiveShapeKind: (activeShapeKind) => set({ activeShapeKind }),
      setDrawColor: (drawColor) => set({ drawColor }),
      setDrawSize: (drawSize) => set({ drawSize }),

      setSaveStatus: (saveStatus) => set({ saveStatus }),
      setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),

      clearOnboardingSamples: () =>
        set((s) => {
          if (!s.board) return s;
          const filtered = s.board.nodes.filter((n) => !n.onboardingSample);
          if (filtered.length === s.board.nodes.length) return s;
          return {
            ...s,
            board: {
              ...s.board,
              nodes: filtered,
              updatedAt: Date.now(),
            },
          };
        }),

      reset: () => set({ ...initialState }),
    }),
    { name: "vibable:idea-note", enabled: devEnabled },
  ),
);
