import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type AppState = {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
};

const devEnabled = process.env.NODE_ENV === "development";

export const useAppStore = create<AppState>()(
  devtools(
    (set) => ({
      commandPaletteOpen: false,
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      toggleCommandPalette: () =>
        set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
    }),
    { name: "vibable:app", enabled: devEnabled },
  ),
);
