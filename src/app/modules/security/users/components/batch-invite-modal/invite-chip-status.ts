import dayjs from "dayjs";
import type { EmailChipStatus } from "@/shared/components/email-chip-input/email-chip-input";
import { isValidEmail } from "@/shared/components/email-chip-input/parse-email-list";
import type { InviteEntityType } from "../../models/api/request/batch-invitation-request.model";
import type {
  InviteMatchResult,
  InviteRecipientCheck,
} from "../../models/api/response/batch-invitation-response.model";

export interface InviteChipStatus extends EmailChipStatus {
  /** True when this email can't be sent; the Send button stays disabled. */
  blocked: boolean;
  /** Employee batches: the employee this email belongs to. */
  employeeId?: string;
  name?: string;
}

export interface InviteLookup {
  checks: InviteRecipientCheck[];
  matches: InviteMatchResult[];
}

const blocked = (
  tone: EmailChipStatus["tone"],
  message: string,
): InviteChipStatus => ({ tone, message, blocked: true });

/**
 * One chip's state, combining AuthApi's check (member / already invited) with hrms-api's match
 * (the employee it belongs to, or a clash with the other kind of account). Order matters: the
 * most actionable reason wins.
 */
export function resolveInviteChipStatus(
  email: string,
  entityType: InviteEntityType,
  lookup: InviteLookup | undefined,
): InviteChipStatus {
  if (!isValidEmail(email)) {
    return blocked(
      "invalid",
      "Invalid email format (RFC 5322 compliant expected).",
    );
  }

  // Client logins are invited through the client portal, which refuses anyone who already belongs
  // (reported per email after sending); there's nothing in the HRIS to pre-check them against.
  if (entityType === "Client") {
    return { tone: "ready", message: "Ready to invite", blocked: false };
  }

  const check = lookup?.checks.find((c) => c.email === email);
  const match = lookup?.matches.find((m) => m.email === email);
  if (!check || !match) return blocked("checking", "Checking…");

  if (check.status === "Member") {
    return blocked(
      "member",
      `User ${check.name || email} is already an active member of this company.`,
    );
  }
  if (match.status === "ClientLogin") {
    return blocked(
      "conflict",
      "User is already registered as an active Client.",
    );
  }
  if (match.status === "EmployeeEmail") {
    return blocked(
      "conflict",
      `User is already registered as an active Employee${match.name ? ` (${match.name})` : ""}.`,
    );
  }
  if (check.status === "PendingInvite") {
    const sentOn = check.sentAt
      ? dayjs(check.sentAt).format("MMM D, YYYY")
      : "an earlier date";
    return blocked(
      "pending",
      entityType === "Employee"
        ? `An active invitation was sent on ${sentOn}. Resend it with Invite to Company on the employee.`
        : `An active invitation was sent on ${sentOn}.`,
    );
  }
  if (match.status === "AlreadyLinked") {
    return blocked(
      "member",
      entityType === "Employee"
        ? `${match.name || "This employee"} already has an account.`
        : "This email is already a login for a client.",
    );
  }
  if (match.status === "NoEmployee") {
    return blocked("conflict", "No employee record has this email.");
  }

  // An employee invite is only ready once the email is matched to an employee. Anything else here
  // is a lookup left over from the other kind of invite, which hasn't been replaced yet.
  if (
    entityType === "Employee" &&
    (match.status !== "Matched" || !match.employeeId)
  ) {
    return blocked("checking", "Checking…");
  }

  return {
    tone: "ready",
    message: match.name ? `Ready to invite ${match.name}` : "Ready to invite",
    blocked: false,
    employeeId: match.employeeId ?? undefined,
    name: match.name ?? undefined,
  };
}
