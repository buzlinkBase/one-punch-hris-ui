import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { overtimeApplicationApi } from "../services/overtime-application.api";
import type { CreateOvertimeApplication } from "../models/api/request/create-overtime-application.model";
import type { UpdateOvertimeApplication } from "../models/api/request/update-overtime-application.model";
import type { OvertimeApplicationResponse } from "../models/api/response/overtime-application-response.model";

const QUERY_KEY = ["overtime-applications"];

export function useOvertimeApplications(params?: {
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => overtimeApplicationApi.getAll(params),
  });
}

export function useOvertimeApplication(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => overtimeApplicationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateOvertimeApplicationBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOvertimeApplication[]) =>
      overtimeApplicationApi.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useCreateOvertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOvertimeApplication) =>
      overtimeApplicationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateOvertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateOvertimeApplication) =>
      overtimeApplicationApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useChangeOvertimeApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      record,
      status,
    }: {
      record: OvertimeApplicationResponse;
      status: string;
    }) => overtimeApplicationApi.changeStatus(record, status),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteOvertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => overtimeApplicationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
