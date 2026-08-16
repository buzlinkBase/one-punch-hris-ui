import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notification } from "antd";
import { leaveApplicationApi } from "../services/leave-application.api";
import type { CreateLeaveApplication } from "../models/api/request/create-leave-application.model";
import type { UpdateLeaveApplication } from "../models/api/request/update-leave-application.model";
import type { LeaveApplicationResponse } from "../models/api/response/leave-application-response.model";
import type { ErrorResponse } from "@/shared/types/api-response.model";
import type { AxiosError } from "axios";

const QUERY_KEY = ["leave-applications"];

export function useLeaveApplications(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => leaveApplicationApi.getAll(params),
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

export function useCreateLeaveApplicationBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLeaveApplication[]) =>
      leaveApplicationApi.createBatch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useChangeLeaveApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      record,
      status,
    }: {
      record: LeaveApplicationResponse;
      status: string;
    }) => leaveApplicationApi.changeStatus(record, status),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      const pd = error.response?.data?.data;
      const description =
        pd?.innerException ??
        pd?.detail ??
        error.message ??
        "An unexpected error occurred.";
      notification.error({
        message: "Status Update Failed",
        description,
        placement: "topRight",
        duration: 6,
      });
    },
  });
}
