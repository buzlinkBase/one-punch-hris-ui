import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { operationAreaApi } from "../services/operation-area.api";
import type { CreateOperationArea } from "../models/api/request/create-operation-area.model";
import type { UpdateOperationArea } from "../models/api/request/update-operation-area.model";

const QUERY_KEY = ["operation-areas"];

export function useOperationAreas() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => operationAreaApi.getAll(),
  });
}

export function useOperationArea(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => operationAreaApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateOperationArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOperationArea) => operationAreaApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateOperationArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOperationArea) => operationAreaApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteOperationArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => operationAreaApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
