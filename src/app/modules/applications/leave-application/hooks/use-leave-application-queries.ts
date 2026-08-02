import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveApplicationApi } from "../services/leave-application.api";
import type { CreateLeaveApplication } from "../models/api/request/create-leave-application.model";
import type { UpdateLeaveApplication } from "../models/api/request/update-leave-application.model";

const QUERY_KEY = ["leave-applications"];

export function useLeaveApplications() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => leaveApplicationApi.getAll(),
  });
}

export function useLeaveApplication(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => leaveApplicationApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateLeaveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveApplication) =>
      leaveApplicationApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateLeaveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLeaveApplication) =>
      leaveApplicationApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteLeaveApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveApplicationApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
