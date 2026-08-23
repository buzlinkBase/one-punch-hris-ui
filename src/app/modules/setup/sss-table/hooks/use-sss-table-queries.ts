import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sssTableApi } from "../services/sss-table.api";
import type { CreateSssTable } from "../models/api/request/create-sss-table.model";
import type { UpdateSssTable } from "../models/api/request/update-sss-table.model";

const QUERY_KEY = ["sss-table"];

export function useSssTableRows(effectivity: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, effectivity],
    queryFn: () => sssTableApi.getAll(effectivity!),
    enabled: !!effectivity,
  });
}

export function useSssTableVersions() {
  return useQuery({
    queryKey: [...QUERY_KEY, "versions"],
    queryFn: () => sssTableApi.getVersions(),
  });
}

export function useSssTableRow(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "row", id],
    queryFn: () => sssTableApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateSssTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSssTable) => sssTableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateSssTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSssTable) => sssTableApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteSssTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => sssTableApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
