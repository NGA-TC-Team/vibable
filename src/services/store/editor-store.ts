import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PhaseData, ProjectType } from "@/types/phases";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type ActiveViewport = "mobile" | "tablet" | "desktop";

export type InfoArchView = "sitemap" | "userFlow";

export type EditorState = {
  currentPhase: number;
  isPreviewCollapsed: boolean;
  isReadOnly: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  phaseData: PhaseData | null;
  projectType: ProjectType;
  activeViewport: ActiveViewport;
  isSidebarCollapsed: boolean;
  isPrintPreview: boolean;
  printPreviewPage: number;
  activeScreenPageId: string | null;
  infoArchView: InfoArchView;
  selectedFlowId: string | null;

  setPhase: (phase: number) => void;
  togglePreview: () => void;
  setReadOnly: (readOnly: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (time: number) => void;
  setPhaseData: (data: PhaseData) => void;
  updatePhaseData: (updater: (prev: PhaseData) => PhaseData) => void;
  setProjectType: (type: ProjectType) => void;
  setActiveViewport: (viewport: ActiveViewport) => void;
  toggleSidebar: () => void;
  setInfoArchView: (view: InfoArchView) => void;
  setSelectedFlowId: (id: string | null) => void;
  setPrintPreview: (on: boolean) => void;
  setPrintPreviewPage: (page: number) => void;
  setActiveScreenPageId: (id: string | null) => void;
  reset: () => void;
};

const initialState = {
  currentPhase: 0,
  isPreviewCollapsed: false,
  isReadOnly: false,
  saveStatus: "idle" as SaveStatus,
  lastSavedAt: null as number | null,
  phaseData: null as PhaseData | null,
  projectType: "web" as ProjectType,
  activeViewport: "mobile" as ActiveViewport,
  isSidebarCollapsed: false,
  isPrintPreview: false,
  printPreviewPage: 0,
  activeScreenPageId: null as string | null,
  infoArchView: "sitemap" as InfoArchView,
  selectedFlowId: null as string | null,
};

const devEnabled = process.env.NODE_ENV === "development";

export const useEditorStore = create<EditorState>()(
  devtools(
    (set) => ({
      ...initialState,
      setPhase: (currentPhase) => set({ currentPhase }),
      togglePreview: () =>
        set((s) => ({ isPreviewCollapsed: !s.isPreviewCollapsed })),
      setReadOnly: (isReadOnly) => set({ isReadOnly }),
      setSaveStatus: (saveStatus) => set({ saveStatus }),
      setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
      setPhaseData: (phaseData) => set({ phaseData }),
      updatePhaseData: (updater) =>
        set((s) => ({
          phaseData: s.phaseData ? updater(s.phaseData) : s.phaseData,
        })),
      setProjectType: (projectType) => set({ projectType }),
      setActiveViewport: (activeViewport) => set({ activeViewport }),
      toggleSidebar: () =>
        set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setInfoArchView: (infoArchView) => set({ infoArchView }),
      setSelectedFlowId: (selectedFlowId) => set({ selectedFlowId }),
      setPrintPreview: (isPrintPreview) =>
        set({ isPrintPreview, printPreviewPage: 0 }),
      setPrintPreviewPage: (printPreviewPage) => set({ printPreviewPage }),
      setActiveScreenPageId: (activeScreenPageId) =>
        set({ activeScreenPageId }),
      reset: () => set({ ...initialState }),
    }),
    { name: "vibable:editor", enabled: devEnabled },
  ),
);
