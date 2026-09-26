import { create } from "zustand";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";

export interface ApprovalNotificationPayload {
  id: string;
  title: string;
  message: string;
  applicationType: ApprovalApplicationType;
  applicationId: string;
  approvalInstanceId: string;
  createdAt: string;
  severity: "success" | "error" | "info" | "warning";
}

interface ApprovalNotificationStore {
  notifications: ApprovalNotificationPayload[];
  unreadCount: number;
  addNotification: (notification: ApprovalNotificationPayload) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

// Mirrors tenant-hub.store.ts's notification slice exactly -- kept as its own store (a
// different concern from tenant/account events) but rendered in the same bell dropdown in
// main-layout.tsx.
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
