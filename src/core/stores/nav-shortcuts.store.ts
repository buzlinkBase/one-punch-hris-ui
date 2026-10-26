import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MAX_PINNED_PAGES,
  recordVisit,
  togglePinned,
} from "./nav-shortcuts.util";

interface UserShortcuts {
  recent: string[];
  pinned: string[];
}

interface NavShortcutsStore {
  /** Keyed by sign-in email, so people sharing a browser keep separate shortcuts. */
  byUser: Record<string, UserShortcuts>;
  visit: (userKey: string, path: string) => void;
  togglePin: (userKey: string, path: string) => boolean;
}

const EMPTY: UserShortcuts = { recent: [], pinned: [] };

export const useNavShortcutsStore = create<NavShortcutsStore>()(
  persist(
    (set, get) => ({
      byUser: {},
      visit: (userKey, path) => {
        const current = get().byUser[userKey] ?? EMPTY;
        const recent = recordVisit(current.recent, path);
        const unchanged =
          recent.length === current.recent.length &&
          recent.every((p, i) => p === current.recent[i]);
        if (unchanged) return;
        set({ byUser: { ...get().byUser, [userKey]: { ...current, recent } } });
      },
      /** Returns false when the pin was refused because the limit is reached. */
      togglePin: (userKey, path) => {
        const current = get().byUser[userKey] ?? EMPTY;
        const pinned = togglePinned(current.pinned, path);
        const refused =
          !current.pinned.includes(path) &&
          current.pinned.length >= MAX_PINNED_PAGES;
        if (!refused) {
          set({
            byUser: { ...get().byUser, [userKey]: { ...current, pinned } },
          });
        }
        return !refused;
      },
    }),
    { name: "nav-shortcuts" },
  ),
);

/** The signed-in user's recent and pinned page paths (empty lists before any use). */
export function useUserShortcuts(userKey: string | undefined): UserShortcuts {
  return useNavShortcutsStore((s) =>
    userKey ? (s.byUser[userKey] ?? EMPTY) : EMPTY,
  );
}
