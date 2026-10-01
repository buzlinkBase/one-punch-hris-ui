import type { ReactNode } from "react";
import type { FeatureKey } from "@/shared/constants/entitlement-keys.const";
import { useSubscriptionState } from "../../hooks/use-subscription-state";

interface FeatureGateProps {
  /** Every one of these must be in the company's plan. */
  feature: FeatureKey | FeatureKey[];
  children: ReactNode;
  /** Shown instead when the plan lacks it; nothing by default. */
  fallback?: ReactNode;
}

/**
 * Hides an action or section the company's plan doesn't include -- the subscription
 * counterpart of PermissionGate. The server enforces the same rule; this only keeps the UI
 * from offering what would be refused.
 */
export function FeatureGate({
  feature,
  children,
  fallback = null,
}: FeatureGateProps) {
  const { lockFor } = useSubscriptionState();
  const features = Array.isArray(feature) ? feature : [feature];
  return <>{lockFor(features) ? fallback : children}</>;
}
