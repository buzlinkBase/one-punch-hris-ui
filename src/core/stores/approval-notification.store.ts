import { create } from "zustand";
import type { BellEntry } from "@/core/notifications/models/user-notification.model";

interface ApprovalNotificationStore {
  notifications: BellEntry[];
  unreadCount: number;
  addNotification: (notification: BellEntry) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

// Only the approval pushes that aren't saved server-side -- the ones sent to every eligible
// approver of a type (no configured workflow). Pushes for one person are saved and come from
// the API (use-user-notifications.ts). Rendered in the same bell dropdown in main-layout.tsx.
const MAX_NOTIFICATIONS = 50;

export const useApprovalNotificationStore = create<ApprovalNotificationStore>(
  (set) => ({
    notifications: [],
    unreadCount: 0,
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
  }),
);
