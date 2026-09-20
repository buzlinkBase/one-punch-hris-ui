import type { UserResponse } from "../models/api/response/user-response.model";

export function isDuplicateTenantMemberEmail(
  members: Pick<UserResponse, "email">[],
  email: string,
): boolean {
  const normalizedInput = email.trim().toLowerCase();

  if (!normalizedInput) {
    return false;
  }

  return members.some(
    (member) => member.email.trim().toLowerCase() === normalizedInput,
  );
}
