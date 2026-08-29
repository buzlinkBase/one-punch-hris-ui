import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientRateApi } from "../services/client-rate.api";
import type { UpdateClientRates } from "../models/api/request/update-client-rates.model";

const queryKey = (clientId: string) => ["setup", "client-rates", clientId];

export function useClientRates(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKey(clientId ?? ""),
    queryFn: () => clientRateApi.get(clientId!),
    enabled: !!clientId,
  });
}

export function useBulkReplaceClientRates(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClientRates) =>
      clientRateApi.bulkReplace(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(clientId) });
    },
  });
}
