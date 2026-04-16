import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AgentSubType, PhaseData, ProjectType, ScreenState } from "@/types/phases";

export type SaveStatus = "idle" | "saving" | "saved" | "error";
export type ActiveViewport = "mobile" | "tablet" | "desktop";

export type InfoArchView = "sitemap" | "userFlow";
export type InfoArchDisplayMode = "diagram" | "table";

export type EditorState = {
  currentPhase: number;
  isPreviewCollapsed: boolean;
  isReadOnly: boolean;
  saveStatus: SaveStatus;
  lastSavedAt: number | null;
  phaseData: PhaseData | null;
  projectType: ProjectType;
  agentSubType: AgentSubType | null;
  activeViewport: ActiveViewport;
  isSidebarCollapsed: boolean;
  isPrintPreview: boolean;
  printPreviewPage: number;
  activeScreenPageId: string | null;
  activeScreenState: ScreenState;
  infoArchView: InfoArchView;
  infoArchDisplayMode: InfoArchDisplayMode;
  selectedFlowId: string | null;
  selectedMockupElementIds: string[];

  setPhase: (phase: number) => void;
  togglePreview: () => void;
  setReadOnly: (readOnly: boolean) => void;
  setSaveStatus: (status: SaveStatus) => void;
  setLastSavedAt: (time: number) => void;
  setPhaseData: (data: PhaseData) => void;
  updatePhaseData: (updater: (prev: PhaseData) => PhaseData) => void;
  setProjectType: (type: ProjectType) => void;
  setAgentSubType: (sub: AgentSubType | null) => void;
  setActiveViewport: (viewport: ActiveViewport) => void;
  toggleSidebar: () => void;
  setInfoArchView: (view: InfoArchView) => void;
  setInfoArchDisplayMode: (mode: InfoArchDisplayMode) => void;
  setSelectedFlowId: (id: string | null) => void;
  setPrintPreview: (on: boolean) => void;
  setPrintPreviewPage: (page: number) => void;
  setActiveScreenPageId: (id: string | null) => void;
  setActiveScreenState: (state: ScreenState) => void;
  setSelectedMockupElementIds: (ids: string[]) => void;
  setSingleSelectedMockupElementId: (id: string | null) => void;
  toggleSelectedMockupElementId: (id: string) => void;
  clearSelectedMockupElements: () => void;
  removeSelectedMockupElementIds: (ids: string[]) => void;
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
  agentSubType: null as AgentSubType | null,
  activeViewport: "mobile" as ActiveViewport,
  isSidebarCollapsed: false,
  isPrintPreview: false,
  printPreviewPage: 0,
  activeScreenPageId: null as string | null,
  activeScreenState: "idle" as ScreenState,
  infoArchView: "sitemap" as InfoArchView,
  infoArchDisplayMode: "diagram" as InfoArchDisplayMode,
  selectedFlowId: null as string | null,
  selectedMockupElementIds: [] as string[],
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
      setAgentSubType: (agentSubType) => set({ agentSubType }),
      setActiveViewport: (activeViewport) => set({ activeViewport }),
      toggleSidebar: () =>
        set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
      setInfoArchView: (infoArchView) => set({ infoArchView }),
      setInfoArchDisplayMode: (infoArchDisplayMode) => set({ infoArchDisplayMode }),
      setSelectedFlowId: (selectedFlowId) => set({ selectedFlowId }),
      setPrintPreview: (isPrintPreview) =>
        set({ isPrintPreview, printPreviewPage: 0 }),
      setPrintPreviewPage: (printPreviewPage) => set({ printPreviewPage }),
      setActiveScreenPageId: (activeScreenPageId) =>
        set({ activeScreenPageId }),
      setActiveScreenState: (activeScreenState) =>
        set({ activeScreenState }),
      setSelectedMockupElementIds: (selectedMockupElementIds) =>
        set({ selectedMockupElementIds }),
      setSingleSelectedMockupElementId: (id) =>
        set({ selectedMockupElementIds: id ? [id] : [] }),
      toggleSelectedMockupElementId: (id) =>
        set((s) => ({
          selectedMockupElementIds: s.selectedMockupElementIds.includes(id)
            ? s.selectedMockupElementIds.filter((item) => item !== id)
            : [...s.selectedMockupElementIds, id],
        })),
      clearSelectedMockupElements: () => set({ selectedMockupElementIds: [] }),
      removeSelectedMockupElementIds: (ids) =>
        set((s) => ({
          selectedMockupElementIds: s.selectedMockupElementIds.filter(
            (item) => !ids.includes(item),
          ),
        })),
      reset: () => set({ ...initialState }),
    }),
    { name: "vibable:editor", enabled: devEnabled },
  ),
);
