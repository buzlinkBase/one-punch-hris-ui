import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeStore {
  mode: ThemeMode;
  toggle: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      mode: "light",
      toggle: () => set({ mode: get().mode === "light" ? "dark" : "light" }),
    }),
    { name: "theme-mode" },
  ),
);
