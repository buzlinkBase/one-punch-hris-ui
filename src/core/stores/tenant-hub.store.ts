import { create } from "zustand";
import type { TenantNotificationPayload } from "@/core/signalr/tenant-hub.types";
import { authStorage } from "@/core/auth/auth-storage";

export interface HrDbStatus {
  status: string | null;
  ready: boolean;
  /** True once we've heard from the server (hub push or REST check) — vs. still unknown. */
  known: boolean;
}

const UNKNOWN_HR_DB_STATUS: HrDbStatus = {
  status: null,
  ready: false,
  known: false,
};

interface TenantHubStore {
  /** Live tenant state overrides, keyed by tenantId, pushed by the TenantHub connection. */
  liveTenantStates: Record<string, string>;
  /** HR database provisioning status, keyed by tenantId — gates HR-related menus/routes. */
  hrDbStatuses: Record<string, HrDbStatus>;
  notifications: TenantNotificationPayload[];
  unreadCount: number;
  setTenantState: (tenantId: string, state: string) => void;
  setHrDbStatus: (
    tenantId: string,
    status: string | null,
    ready: boolean,
  ) => void;
  getHrDbStatus: (tenantId: string | null | undefined) => HrDbStatus;
  addNotification: (notification: TenantNotificationPayload) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

const MAX_NOTIFICATIONS = 50;

// Pre-seed from localStorage synchronously so the very first render in MainLayout
// already has the correct hrDb.ready — avoids the race where the redirect useEffect
// fires before useTenantHub's async seeding effect has a chance to run.
function buildInitialHrDbStatuses(): Record<string, HrDbStatus> {
  const statuses: Record<string, HrDbStatus> = {};
  for (const t of authStorage.getTenants()) {
    statuses[t.tenantId] = {
      status: t.hrDbStatus,
      ready: t.hrDbReady,
      known: true,
    };
  }
  return statuses;
}

export const useTenantHubStore = create<TenantHubStore>((set, get) => ({
  liveTenantStates: {},
  hrDbStatuses: buildInitialHrDbStatuses(),
  notifications: [],
  unreadCount: 0,
  setTenantState: (tenantId, state) =>
    set((s) => ({
      liveTenantStates: { ...s.liveTenantStates, [tenantId]: state },
    })),
  setHrDbStatus: (tenantId, status, ready) => {
    // Persist to localStorage too, so the next page load seeds from the real
    // last-known status instead of whatever was cached at login/tenant-switch.
    authStorage.updateTenantHrDbStatus(tenantId, status, ready);
    set((s) => ({
      hrDbStatuses: {
        ...s.hrDbStatuses,
        [tenantId]: { status, ready, known: true },
      },
    }));
  },
  getHrDbStatus: (tenantId) =>
    (tenantId && get().hrDbStatuses[tenantId]) || UNKNOWN_HR_DB_STATUS,
  addNotification: (notification) =>
    set((s) => ({
      notifications: [notification, ...s.notifications].slice(
        0,
        MAX_NOTIFICATIONS,
      ),
      unreadCount: s.unreadCount + 1,
    })),
  markAllRead: () => set({ unreadCount: 0 }),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
