import type { ApprovalApplicationType } from "@/shared/types/approval.model";

/** One saved bell entry (hrms-api UserNotification) -- today an approval update. */
export interface UserNotification {
  id: string;
  type: string;
  applicationType: ApprovalApplicationType;
  applicationId: string;
  approvalInstanceId: string;
  applicationTypeLabel: string;
  applicantName: string;
  /** "Pending Your Approval" | "Step Approved" | "Approved" | "Declined" | "Cancelled" */
  statusLabel: string;
  stepNumber?: number | null;
  totalSteps?: number | null;
  note?: string | null;
  createdAt: string;
  readAt?: string | null;
}

export interface UserNotificationPage {
  items: UserNotification[];
  total: number;
  unreadCount: number;
  page: number;
  pageSize: number;
}

/** What the bell renders for an entry. */
export interface BellEntry {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  severity: "success" | "error" | "info" | "warning";
  /** The screen clicking it opens (the related request), when there is one. */
  link?: string;
}
