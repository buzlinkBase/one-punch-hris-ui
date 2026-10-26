import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  toggle: () => void;
}

/** First-visit default follows the OS setting; a saved choice always wins (persist rehydrates over it). */
function systemMode(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: systemMode(),
      toggle: () => set({ mode: get().mode === "light" ? "dark" : "light" }),
    }),
    { name: "theme-mode" },
  ),
);
