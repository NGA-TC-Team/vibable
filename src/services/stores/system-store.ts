import { create } from "zustand";
import { devtools } from "zustand/middleware";

export type SystemState = {
  online: boolean;
  hydrated: boolean;
  prefersReducedMotion: boolean;
  setOnline: (online: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  setPrefersReducedMotion: (value: boolean) => void;
};

const devEnabled = process.env.NODE_ENV === "development";

export const useSystemStore = create<SystemState>()(
  devtools(
    (set) => ({
      online: true,
      hydrated: false,
      prefersReducedMotion: false,
      setOnline: (online) => set({ online }),
      setHydrated: (hydrated) => set({ hydrated }),
      setPrefersReducedMotion: (prefersReducedMotion) =>
        set({ prefersReducedMotion }),
    }),
    { name: "vibable:system", enabled: devEnabled },
  ),
);
