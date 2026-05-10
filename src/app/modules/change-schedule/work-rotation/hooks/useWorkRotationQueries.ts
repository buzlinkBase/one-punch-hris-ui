import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workRotationApi } from "../services/work-rotation.api";
import type { CreateWorkRotation } from "../models/api/request/create-work-rotation.model";
import type { UpdateWorkRotation } from "../models/api/request/update-work-rotation.model";
import type { WorkRotationFilter } from "../models/api/request/work-rotation-filter.model";

const QUERY_KEY = ["change-schedule", "work-rotation"];

export function useWorkRotations(filter: WorkRotationFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => workRotationApi.getAll(filter),
  });
}

export function useWorkRotation(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => workRotationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateWorkRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkRotation) => workRotationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateWorkRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWorkRotation) => workRotationApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteWorkRotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => workRotationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
