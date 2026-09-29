import type { AnnouncementPriority } from "@/shared/types/announcement.model";

/** Mirrors hrms-api MyAnnouncementListItem -- one announcement as the signed-in employee sees it. */
export interface MyAnnouncementListItem {
  id: string;
  title: string;
  excerpt: string;
  priority: AnnouncementPriority;
  publishedAtUtc: string | null;
  publishedByName: string | null;
  isPinned: boolean;
  isEdited: boolean;
  isArchived: boolean;
  isRead: boolean;
  requiresAcknowledgement: boolean;
  acknowledgeByUtc: string | null;
  acknowledgedAt: string | null;
  needsAcknowledgement: boolean;
  /** Acknowledged an earlier version; the publisher asked everyone to acknowledge the update. */
  needsReacknowledgement: boolean;
  isOverdue: boolean;
  lastRemindedAt: string | null;
}

/** Mirrors hrms-api MyAnnouncementDetail. When isWithdrawn, body is empty. */
export interface MyAnnouncementDetail extends MyAnnouncementListItem {
  body: string;
  lastEditedAtUtc: string | null;
  isWithdrawn: boolean;
  withdrawnAtUtc: string | null;
  withdrawnByName: string | null;
  withdrawReason: string | null;
}

export type MyAnnouncementFilter =
  "All" | "Unread" | "NeedsAcknowledgement" | "Archived";
