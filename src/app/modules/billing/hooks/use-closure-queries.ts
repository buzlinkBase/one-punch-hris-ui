import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authStorage } from "@/core/auth/auth-storage";
import { closureApi } from "../services/closure.api";
import type { AccountClosureRequest } from "../models/api/request/closure-request.model";
import { SUBSCRIPTION_QUERY_KEY } from "./use-subscription-queries";

const closureKey = (tenantId: string | null | undefined) =>
  [...SUBSCRIPTION_QUERY_KEY, "closure", tenantId] as const;

/** The owner's latest request to close the account (null when none). Only the account's owner may ask. */
export function useAccountClosure(enabled = true) {
  const tenantId = authStorage.getTenantId();
  return useQuery({
    queryKey: closureKey(tenantId),
    queryFn: () => closureApi.getCurrent(),
    enabled: enabled && !!tenantId,
  });
}

export function useRequestAccountClosure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AccountClosureRequest) => closureApi.request(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY }),
  });
}

export function useCancelAccountClosure() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => closureApi.cancel(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY }),
  });
}

/** The two email links ("confirm" and "this wasn't me, cancel"), used while signed out. */
export function useClosureLinkAction(action: "confirm" | "cancel") {
  return useMutation({
    mutationFn: (token: string) =>
      action === "confirm"
        ? closureApi.confirmByLink(token)
        : closureApi.cancelByLink(token),
  });
}
