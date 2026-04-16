import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialAppState = {
  commandPaletteOpen: false,
} as const;

export type AppState = {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  reset: () => void;
};

const devEnabled = process.env.NODE_ENV === "development";

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      ...initialAppState,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      toggleCommandPalette: () =>
        set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
      reset: () => set({ ...initialAppState }),
    }),
    { name: "vibable:app", enabled: devEnabled },
  ),
);
