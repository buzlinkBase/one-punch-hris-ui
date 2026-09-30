import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userNotificationApi } from "../services/user-notification.api";
import type { UserNotificationPage } from "../models/user-notification.model";

/** The bell's saved entries; a live approval push invalidates this key (use-approval-hub.ts). */
export const MY_NOTIFICATIONS_QUERY_KEY = ["me", "notifications"];

const BELL_PAGE_SIZE = 20;

export function useMyNotifications() {
  return useQuery({
    queryKey: MY_NOTIFICATIONS_QUERY_KEY,
    queryFn: () => userNotificationApi.getMine(1, BELL_PAGE_SIZE),
  });
}

/** Opening the bell reads everything in it; the badge clears at once, then the server confirms. */
export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => userNotificationApi.markAllRead(),
    onMutate: () => {
      const now = new Date().toISOString();
      queryClient.setQueryData<UserNotificationPage>(
        MY_NOTIFICATIONS_QUERY_KEY,
        (page) =>
          page && {
            ...page,
            unreadCount: 0,
            items: page.items.map((n) => ({ ...n, readAt: n.readAt ?? now })),
          },
      );
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_QUERY_KEY }),
  });
}
