/** The members to look up: account ids, plus emails for invites not yet accepted. */
export interface UserLinkRequest {
  userIds: string[];
  emails: string[];
}
