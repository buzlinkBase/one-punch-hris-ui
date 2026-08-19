import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hdmfTableApi } from "../services/hdmf-table.api";
import type { CreateHdmfTable } from "../models/api/request/create-hdmf-table.model";
import type { UpdateHdmfTable } from "../models/api/request/update-hdmf-table.model";

const QUERY_KEY = ["hdmf-table"];

export function useHdmfTableRows(effectivity: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, effectivity],
    queryFn: () => hdmfTableApi.getAll(effectivity!),
    enabled: !!effectivity,
  });
}

export function useHdmfTableRow(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "row", id],
    queryFn: () => hdmfTableApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateHdmfTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHdmfTable) => hdmfTableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateHdmfTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateHdmfTable) => hdmfTableApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteHdmfTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hdmfTableApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
