import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "./app-store";
import { useEditorStore } from "./editor-store";
import { useSystemStore } from "./system-store";

/** Subscribe to system/runtime slice only (fewer rerenders). */
export function useSystemRuntime() {
  return useSystemStore(
    useShallow((s) => ({
      online: s.online,
      hydrated: s.hydrated,
      prefersReducedMotion: s.prefersReducedMotion,
    })),
  );
}

/** Subscribe to app UI slice only. */
export function useCommandPalette() {
  return useAppStore(
    useShallow((s) => ({
      open: s.commandPaletteOpen,
      setOpen: s.setCommandPaletteOpen,
      toggle: s.toggleCommandPalette,
    })),
  );
}

/** Subscribe to editor state slice. */
export function useEditor() {
  return useEditorStore(
    useShallow((s) => ({
      currentPhase: s.currentPhase,
      isPreviewCollapsed: s.isPreviewCollapsed,
      isReadOnly: s.isReadOnly,
      saveStatus: s.saveStatus,
      lastSavedAt: s.lastSavedAt,
      phaseData: s.phaseData,
      setPhase: s.setPhase,
      togglePreview: s.togglePreview,
      setReadOnly: s.setReadOnly,
      setSaveStatus: s.setSaveStatus,
      setPhaseData: s.setPhaseData,
      updatePhaseData: s.updatePhaseData,
    })),
  );
}
