import type { EntitlementSnapshot } from "../models/api/response/subscription-response.model";

/**
 * Whether the current company is closed to this person: its owner's plan lapsed (read-only) and
 * they're not the owner or a billing admin, who keep read-only access to look, export and pay.
 * The server applies the same rule (SubscriptionAccessPolicy) to every request.
 */
export function isCompanyLocked(
  snapshot: EntitlementSnapshot | undefined,
  canViewBilling: boolean,
): boolean {
  return snapshot?.accessMode === "ReadOnly" && !canViewBilling;
}
