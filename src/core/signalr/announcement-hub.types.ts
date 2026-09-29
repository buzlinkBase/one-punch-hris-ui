import type {
  AnnouncementPriority,
  AnnouncementPushKind,
} from "@/shared/types/announcement.model";

/**
 * Pushed by hrms-api's AnnouncementPushService on the same NotificationHub the approval pushes
 * use (see approval-hub.connection.ts), whenever an announcement sent to this person is
 * published, updated, withdrawn, archived, removed or a reminder goes out.
 */
export interface AnnouncementPushNotification {
  announcementId: string;
  kind: AnnouncementPushKind;
  title: string;
  priority: AnnouncementPriority;
  timestampUtc: string;
}

export const ANNOUNCEMENT_HUB_METHODS = {
  onAnnouncementNotification: "AnnouncementNotification",
} as const;
