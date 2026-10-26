import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  /** The user's own choice. `null` until they toggle, so the responsive default applies. */
  collapsed: boolean | null;
  setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: null,
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    { name: "sidebar-collapsed" },
  ),
);
