import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientApi } from "../services/client.api";
import type { CreateClient } from "../models/api/request/create-client.model";
import type { UpdateClient } from "../models/api/request/update-client.model";

const QUERY_KEY = ["clients"];

export function useClients() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => clientApi.getAll(),
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => clientApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClient) => clientApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateClient) => clientApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
