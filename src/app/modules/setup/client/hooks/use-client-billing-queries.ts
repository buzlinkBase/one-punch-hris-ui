import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientBillingApi } from "../services/client-billing.api";
import type { UpdateClientBilling } from "../models/api/request/update-client-billing.model";

const queryKey = (clientId: string) => ["setup", "client-billing", clientId];

export function useClientBilling(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKey(clientId ?? ""),
    queryFn: () => clientBillingApi.get(clientId!),
    enabled: !!clientId,
  });
}

export function useUpdateClientBilling(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClientBilling) =>
      clientBillingApi.update(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(clientId) });
    },
  });
}
