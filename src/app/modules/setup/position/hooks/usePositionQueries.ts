import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { positionApi } from "../services/position.api";
import type { CreatePosition } from "../models/api/request/create-position.model";
import type { UpdatePosition } from "../models/api/request/update-position.model";

const QUERY_KEY = ["positions"];

export function usePositions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => positionApi.getAll(),
  });
}

export function usePosition(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => positionApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePosition) => positionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePosition) => positionApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => positionApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
