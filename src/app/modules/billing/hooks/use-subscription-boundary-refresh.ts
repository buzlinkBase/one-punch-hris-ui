import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { msUntilNextBoundary } from "../utils/next-boundary";
import {
  SUBSCRIPTION_QUERY_KEY,
  useEntitlements,
} from "./use-subscription-queries";

/**
 * Refetches the subscription the moment its calendar turns it read-only (trial end, period end,
 * grace end). Those flips raise no event, so without this the banner and screens would stay
 * "full access" until a save is refused. Mount once, in the app shell.
 */
export function useSubscriptionBoundaryRefresh() {
  const queryClient = useQueryClient();
  const { data } = useEntitlements();
  const snapshot = data?.entitlements;

  useEffect(() => {
    const wait = msUntilNextBoundary(snapshot, Date.now());
    if (wait === null) return;
    const timer = window.setTimeout(() => {
      void queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
    }, wait);
    return () => window.clearTimeout(timer);
  }, [snapshot, queryClient]);
}
