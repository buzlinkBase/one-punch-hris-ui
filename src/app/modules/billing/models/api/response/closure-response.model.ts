/** Where the owner's request to close the account stands. */
export type AccountClosureStatus =
  | "PendingConfirmation"
  | "CoolingOff"
  | "ReadyForReview"
  | "Approved"
  | "Rejected"
  | "Canceled"
  | "Expired";

export interface AccountClosureResponse {
  id: string;
  status: AccountClosureStatus;
  requestedAtUtc: string;
  /** While waiting for the owner to confirm from their email: when the link stops working. */
  confirmExpiresAtUtc: string | null;
  /** Until when the owner can still change their mind. */
  coolingOffEndsAtUtc: string | null;
  decisionReason: string | null;
  /** Once approved: when the company records are removed from the live system. */
  purgeAfterUtc: string | null;
}
