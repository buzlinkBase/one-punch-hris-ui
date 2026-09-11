export interface SendInvitationRequest {
  email: string;
  roles: string[];
  employeeId?: string;
  /** The employee's full name, when this invite is tied to a linked Employee record --
   * greets them by name in the invite email instead of falling back to their email address. */
  name?: string;
}
