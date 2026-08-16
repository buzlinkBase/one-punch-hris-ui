import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientPolicyApi } from "../services/client-policy.api";
import type { UpdateClientPolicy } from "../models/api/request/update-client-policy.model";

const queryKey = (clientId: string) => ["setup", "client-policy", clientId];

export function useClientPolicy(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKey(clientId ?? ""),
    queryFn: () => clientPolicyApi.get(clientId!),
    enabled: !!clientId,
  });
}

export function useUpdateClientPolicy(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClientPolicy) =>
      clientPolicyApi.update(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(clientId) });
    },
  });
}
