import { useShallow } from "zustand/react/shallow";
import { useAppStore } from "./app-store";
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
