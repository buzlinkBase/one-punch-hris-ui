/** Who a batch invites: employees, or logins for one client. */
export type InviteEntityType = "Employee" | "Client";

export interface BatchInvitationRecipient {
  email: string;
  /** The employee this email belongs to (Employee batches). */
  entityId?: string;
  name?: string;
}

export interface BatchInvitationRequest {
  entityType: InviteEntityType;
  /** The client every login in a Client batch is for. */
  clientId?: string;
  role: string;
  recipients: BatchInvitationRecipient[];
}
