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
