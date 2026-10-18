import type { UserLinkResponse } from "./user-link-response.model";

export interface UserResponse {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  roles: string[];
  status: string;
}

export type UserType = "Owner | Admin" | "Member" | "Employee" | "Client";

/** Which kind of user a member is on the Users page; Other is anyone not tied to a record. */
export type UserKind = "Employee" | "Client" | "Other";

/** A member as the Users page shows it: with the employee or client it belongs to. */
export interface UserRow extends UserResponse {
  kind: UserKind;
  link?: UserLinkResponse;
  /**
   * Set on a client-portal user: they belong to one client (not to the company's own staff), so
   * their status and removal go through that client rather than the company membership.
   */
  portal?: { clientEntityId: string; membershipId: string };
}

/** One client-portal user in one client, as Tenant Service lists them for the company's staff. */
export interface ClientUserResponse {
  clientEntityId: string;
  clientName: string;
  membershipId: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  status: string;
  ownStatus: string;
  roles: { id: string; name: string }[];
}
