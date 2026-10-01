import {
  ENTITLEMENT_SOURCES,
  type FeatureKey,
} from "@/shared/constants/entitlement-keys.const";
import type { EntitlementsResponse } from "../models/api/response/subscription-response.model";

/** Why a page or action is unavailable. */
export interface FeatureLock {
  feature: FeatureKey;
  /**
   * "upgrade": a higher plan includes it. "revoked": an exception on this account takes it
   * away -- upgrading wouldn't help, so no upgrade is offered.
   */
  reason: "upgrade" | "revoked";
  /** The lowest plan that includes the feature (upgrade only). */
  availableOn: string | null;
}

const OVERRIDES = new Set<string>([
  ENTITLEMENT_SOURCES.ACCOUNT_OVERRIDE,
  ENTITLEMENT_SOURCES.COMPANY_OVERRIDE,
]);

/**
 * The first of `features` the company lacks, or null when it has them all. While the
 * entitlements haven't loaded nothing is locked -- the server still enforces, and the menu
 * doesn't flicker locks on every page load.
 */
export function findFeatureLock(
  features: FeatureKey[],
  view: EntitlementsResponse | undefined,
): FeatureLock | null {
  if (!view) return null;
  for (const feature of features) {
    if (view.entitlements.features[feature]) continue;
    const revoked = OVERRIDES.has(view.entitlements.sources[feature] ?? "");
    return {
      feature,
      reason: revoked ? "revoked" : "upgrade",
      availableOn: revoked ? null : (view.featureAvailableOn[feature] ?? null),
    };
  }
  return null;
}
