export interface AccountClosureRequest {
  /** The owner's email, typed to confirm. */
  confirmEmail: string;
  /** Optional: why the owner is leaving. */
  reason?: string;
}
