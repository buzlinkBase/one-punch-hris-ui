import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { undertimeApi } from "../services/undertime-application.api";
import type { CreateUndertimeApplication } from "../models/api/request/create-undertime-application.model";
import type { UpdateUndertimeApplication } from "../models/api/request/update-undertime-application.model";
import type { UndertimeApplicationResponse } from "../models/api/response/undertime-application-response.model";

const QUERY_KEY = ["undertime-applications"];

export function useUndertimeApplications(params?: {
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => undertimeApi.getAll(params),
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

export function useCreateUndertimeApplicationBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUndertimeApplication[]) =>
      undertimeApi.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useChangeUndertimeApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      record,
      status,
    }: {
      record: UndertimeApplicationResponse;
      status: string;
    }) => undertimeApi.changeStatus(record, status),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
