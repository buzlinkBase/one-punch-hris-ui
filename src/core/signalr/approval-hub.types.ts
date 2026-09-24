import type { ApprovalApplicationType } from "@/shared/types/approval.model";

/**
 * Contract for hrms-api's own NotificationHub (`Hrms.Core/Hubs/NotificationHub.cs`,
 * `MapHub<NotificationHub>("/hubs/notifications")`), pushed by ApprovalPushNotificationWorker.
 * Targeted per-connected-user (`Clients.User(userId)`, matched off the `sub` claim via
 * HrmsHubUserIdProvider) — no group join needed, same as TenantHub.
 */
export const APPROVAL_HUB_METHODS = {
  onApprovalNotification: "ApprovalNotification",
} as const;

export interface ApprovalPushNotification {
  applicationType: ApprovalApplicationType;
  applicationId: string;
  approvalInstanceId: string;
  applicationTypeLabel: string;
  applicantName: string;
  /** "Pending Your Approval" | "Approved" | "Declined" */
  statusLabel: string;
  stepNumber?: number | null;
  totalSteps?: number | null;
  note?: string | null;
  timestampUtc: string;
}
