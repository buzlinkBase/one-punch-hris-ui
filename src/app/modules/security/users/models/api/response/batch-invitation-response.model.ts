/** AuthApi's view of an email: already a member, already invited, or free to invite. */
export type InviteRecipientStatus =
  "Ok" | "InvalidEmail" | "Member" | "PendingInvite";

export interface InviteRecipientCheck {
  email: string;
  status: InviteRecipientStatus;
  /** The member's name, for Member. */
  name?: string | null;
  /** When the still-valid invitation was sent, for PendingInvite. */
  sentAt?: string | null;
}

/** hrms-api's view of an email: the employee or client record it relates to. */
export type InviteMatchStatus =
  | "Matched"
  | "Ok"
  | "NoEmployee"
  | "AlreadyLinked"
  | "ClientLogin"
  | "EmployeeEmail";

export interface InviteMatchResult {
  email: string;
  status: InviteMatchStatus;
  employeeId?: string | null;
  name?: string | null;
}

export interface FailedInvitation {
  email: string;
  reason: string;
}

export interface BatchInvitationResult {
  sent: number;
  failed: FailedInvitation[];
}
