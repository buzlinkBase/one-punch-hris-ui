import { useCallback } from "react";
import type { FeatureKey } from "@/shared/constants/entitlement-keys.const";
import { useHasPermission } from "@/shared/hooks/use-has-permission";
import { findFeatureLock } from "../utils/feature-lock";
import { useEntitlements } from "./use-subscription-queries";

/** Tenant Service catalog codes for the account's subscription. */
export const BILLING_PERMISSION = {
  VIEW: "Billing:View",
  MANAGE: "Billing:Manage",
} as const;

/**
 * The current company's subscription as the UI needs it: its entitlements, whether it's
 * read-only, what locks a given set of features, and whether this person may manage billing
 * (the Owner, or a billing admin -- not Admin by default).
 */
export function useSubscriptionState() {
  const { data, isLoading } = useEntitlements();
  const canViewBilling = useHasPermission(BILLING_PERMISSION.VIEW);
  const canManageBilling = useHasPermission(BILLING_PERMISSION.MANAGE);

  const lockFor = useCallback(
    (features: FeatureKey[]) => findFeatureLock(features, data),
    [data],
  );

  return {
    view: data,
    snapshot: data?.entitlements,
    isLoading,
    isReadOnly: data?.entitlements.accessMode === "ReadOnly",
    lockFor,
    canViewBilling,
    canManageBilling,
  };
}
