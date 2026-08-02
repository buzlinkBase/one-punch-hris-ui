import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { undertimeApi } from "../services/undertime-application.api";
import type { CreateUndertimeApplication } from "../models/api/request/create-undertime-application.model";
import type { UpdateUndertimeApplication } from "../models/api/request/update-undertime-application.model";

const QUERY_KEY = ["undertime-applications"];

export function useUndertimeApplications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => undertimeApi.getAll(),
  });
}

export function useUndertimeApplication(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => undertimeApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateUndertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUndertimeApplication) => undertimeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateUndertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUndertimeApplication) => undertimeApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteUndertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => undertimeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
