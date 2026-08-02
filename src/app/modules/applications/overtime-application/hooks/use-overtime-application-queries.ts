import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { overtimeApplicationApi } from "../services/overtime-application.api";
import type { CreateOvertimeApplication } from "../models/api/request/create-overtime-application.model";
import type { UpdateOvertimeApplication } from "../models/api/request/update-overtime-application.model";

const QUERY_KEY = ["overtime-applications"];

export function useOvertimeApplications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => overtimeApplicationApi.getAll(),
  });
}

export function useOvertimeApplication(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => overtimeApplicationApi.getById(id!),
    enabled: !!id,
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

export function useDeleteOvertimeApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => overtimeApplicationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
