import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { subscriptionApi } from "../services/subscription.api";
import type { PlanChangeRequest } from "../models/api/request/plan-change-request.model";

/** Every subscription query lives under this key -- SubscriptionChanged invalidates it whole. */
export const SUBSCRIPTION_QUERY_KEY = ["subscription"] as const;

/** The current company's entitlements. Cached per company; refetched on SubscriptionChanged. */
export function useEntitlements() {
  useAuthUser(); // re-render (and re-key) when the session switches company
  const tenantId = authStorage.getTenantId();
  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEY, "entitlements", tenantId],
    queryFn: () => subscriptionApi.getEntitlements(),
    enabled: !!tenantId && !!authStorage.getToken(),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

/** The billing screen's data -- only for callers with Billing:View. */
export function useBilling(enabled = true) {
  const tenantId = authStorage.getTenantId();
  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEY, "billing", tenantId],
    queryFn: () => subscriptionApi.getCurrent(),
    enabled: enabled && !!tenantId,
  });
}

export function usePlans(enabled = true) {
  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEY, "plans"],
    queryFn: () => subscriptionApi.getPlans(),
    enabled,
    staleTime: 1000 * 60 * 30,
  });
}

function useSubscriptionMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY }),
  });
}

export function useRequestPlanChange() {
  return useSubscriptionMutation((payload: PlanChangeRequest) =>
    subscriptionApi.requestChange(payload),
  );
}

export function useWithdrawPlanChange() {
  return useSubscriptionMutation(() => subscriptionApi.withdrawChange());
}

export function useCancelSubscription() {
  return useSubscriptionMutation(() => subscriptionApi.cancel());
}

export function useResumeSubscription() {
  return useSubscriptionMutation(() => subscriptionApi.resume());
}

/** Pay online: opens the gateway's payment page -- the browser leaves the app for it. */
export function useStartCheckout() {
  return useMutation({
    mutationFn: () => subscriptionApi.startCheckout(),
    onSuccess: ({ checkoutUrl }) => window.location.assign(checkoutUrl),
  });
}

const CHECKOUT_POLL_MS = 3000;

/**
 * An online payment, refetched every few seconds while `poll` is on and it's still unpaid --
 * the server checks with the gateway each time, so this confirms it even if the webhook is late.
 */
export function useCheckout(checkoutId: string | undefined, poll: boolean) {
  return useQuery({
    queryKey: [...SUBSCRIPTION_QUERY_KEY, "checkout", checkoutId],
    queryFn: () => subscriptionApi.getCheckout(checkoutId ?? ""),
    enabled: !!checkoutId,
    staleTime: 0,
    retry: 1,
    refetchInterval: (query) =>
      poll && query.state.data?.status === "Open" ? CHECKOUT_POLL_MS : false,
  });
}

/** Refetches the plan and entitlements -- after a payment changed them. */
export function useRefreshSubscription() {
  const queryClient = useQueryClient();
  return useCallback(
    () =>
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...SUBSCRIPTION_QUERY_KEY, "billing"],
        }),
        queryClient.invalidateQueries({
          queryKey: [...SUBSCRIPTION_QUERY_KEY, "entitlements"],
        }),
      ]),
    [queryClient],
  );
}
