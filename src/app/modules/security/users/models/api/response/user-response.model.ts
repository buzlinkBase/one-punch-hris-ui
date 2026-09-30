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
}
