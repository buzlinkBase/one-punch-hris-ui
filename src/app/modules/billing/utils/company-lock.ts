import type { EntitlementSnapshot } from "../models/api/response/subscription-response.model";

/**
 * Whether the current company is closed to this person. Two ways:
 * - an operator suspended the account or put it on legal hold: closed to everyone, the owner
 *   included (they only see why);
 * - the owner's plan lapsed (read-only) and they're not the owner or a billing admin, who keep
 *   read-only access to look, export and pay.
 * The server applies the same rule (SubscriptionAccessPolicy) to every request.
 */
export function isCompanyLocked(
  snapshot: EntitlementSnapshot | undefined,
  canViewBilling: boolean,
): boolean {
  if (snapshot?.restriction) return true;
  return snapshot?.accessMode === "ReadOnly" && !canViewBilling;
}

/**
 * Whether the company takes no changes at all, for anyone: its plan lapsed (read-only) or an
 * operator suspended it / put it on legal hold. The UI hides every write action then, and the
 * header keeps only the company switcher -- the server refuses the writes either way.
 */
export function isCompanyClosed(
  snapshot: EntitlementSnapshot | undefined,
): boolean {
  return !!snapshot?.restriction || snapshot?.accessMode === "ReadOnly";
}
