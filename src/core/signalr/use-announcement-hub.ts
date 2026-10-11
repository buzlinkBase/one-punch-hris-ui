import { useEffect } from "react";
import { notification } from "antd";
import { authStorage } from "@/core/auth/auth-storage";
import { queryClient } from "@/core/query-client";
import {
  myAnnouncementDetailKey,
  refreshMyAnnouncementSummaries,
} from "@/app/modules/portal/announcements/hooks/use-my-announcement-queries";
import { approvalHub } from "./approval-hub.connection";
import {
  ANNOUNCEMENT_HUB_METHODS,
  type AnnouncementPushNotification,
} from "./announcement-hub.types";

// Changes to the announcement itself -- an open copy needs reloading, not just the lists.
const CONTENT_CHANGES = new Set([
  "Updated",
  "Unpublished",
  "Archived",
  "Removed",
]);

/**
 * Keeps the bell and "Announcements" pages live. Listens on the NotificationHub connection that
 * useApprovalHub owns (starts/stops), so mount it right after useApprovalHub in MainLayout --
 * both then attach to the same connection instance.
 */
export function useAnnouncementHub(onOpen: (announcementId: string) => void) {
  useEffect(() => {
    if (!authStorage.getToken()) return;
    const connection = approvalHub.getConnection();

    const handle = (payload: AnnouncementPushNotification) => {
      refreshMyAnnouncementSummaries(queryClient);
      if (CONTENT_CHANGES.has(payload.kind)) {
        queryClient.invalidateQueries({
          queryKey: myAnnouncementDetailKey(payload.announcementId),
        });
      }

      if (payload.kind === "Published" || payload.kind === "Reminder") {
        const key = `announcement-${payload.announcementId}`;
        notification.open({
          key,
          message:
            payload.kind === "Reminder"
              ? "Reminder: announcement"
              : "New announcement",
          description: payload.title,
          type: payload.priority === "Urgent" ? "warning" : "info",
          onClick: () => {
            notification.destroy(key);
            onOpen(payload.announcementId);
          },
          className: "cursor-pointer",
        });
      }
    };

    connection.on(ANNOUNCEMENT_HUB_METHODS.onAnnouncementNotification, handle);
    return () => {
      connection.off(
        ANNOUNCEMENT_HUB_METHODS.onAnnouncementNotification,
        handle,
      );
    };
  }, [onOpen]);
}
