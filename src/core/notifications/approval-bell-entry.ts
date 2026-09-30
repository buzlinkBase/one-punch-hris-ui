import type {
  BellEntry,
  UserNotification,
} from "./models/user-notification.model";
import { PENDING_YOUR_APPROVAL, approvalLink } from "./approval-link";

/** The approval update fields both a saved entry and a live push carry. */
export type ApprovalUpdate = Pick<
  UserNotification,
  | "applicationTypeLabel"
  | "applicantName"
  | "statusLabel"
  | "stepNumber"
  | "totalSteps"
>;

export function approvalMessage(update: ApprovalUpdate): string {
  const step =
    update.stepNumber && update.totalSteps
      ? `step ${update.stepNumber} of ${update.totalSteps}`
      : null;
  if (update.statusLabel === PENDING_YOUR_APPROVAL) {
    return `${update.applicantName}'s ${update.applicationTypeLabel} application is waiting on you${
      step ? ` (${step})` : ""
    }.`;
  }
  // Intermediate step cleared on a multi-step chain -- the applicant's "it moved forward" notice.
  if (update.statusLabel === "Step Approved") {
    return `Your ${update.applicationTypeLabel} application passed ${step ?? "a step"} and moved to the next approver.`;
  }
  return `Your ${update.applicationTypeLabel} application was ${update.statusLabel.toLowerCase()}.`;
}

/** How a saved approval update reads in the bell. */
export function toBellEntry(notification: UserNotification): BellEntry {
  return {
    id: notification.id,
    title: `${notification.applicationTypeLabel} — ${notification.statusLabel}`,
    message: approvalMessage(notification),
    createdAt: notification.createdAt,
    link: approvalLink(notification),
    severity:
      notification.statusLabel === "Declined" ||
      notification.statusLabel === "Cancelled"
        ? "warning"
        : "info",
  };
}
