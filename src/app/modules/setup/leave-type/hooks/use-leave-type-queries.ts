import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { leaveTypeApi } from "../services/leave-type.api";
import type { CreateLeaveType } from "../models/api/request/create-leave-type.model";
import type { UpdateLeaveType } from "../models/api/request/update-leave-type.model";

const QUERY_KEY = ["leave-types"];

export function useLeaveTypes() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => leaveTypeApi.getAll(),
  });
}

export function useLeaveType(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => leaveTypeApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveType) => leaveTypeApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLeaveType) => leaveTypeApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteLeaveType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leaveTypeApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
