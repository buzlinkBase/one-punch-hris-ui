import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeRestDayApi } from "../services/change-rest-day.api";
import type { CreateChangeRestDay } from "../models/api/request/create-change-rest-day.model";
import type { UpdateChangeRestDay } from "../models/api/request/update-change-rest-day.model";
import type { ChangeRestDayFilter } from "../models/api/request/change-rest-day-filter.model";

const QUERY_KEY = ["change-schedule", "change-rest-day"];

export function useChangeRestDays(
  filter: ChangeRestDayFilter = {},
  fetchKey = 0,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter, fetchKey],
    queryFn: () => changeRestDayApi.getAll(filter),
    enabled: !!filter.fromDate && !!filter.toDate,
  });
}

export function useChangeRestDay(id: string) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => changeRestDayApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateChangeRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateChangeRestDay) =>
      changeRestDayApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useCreateChangeRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateChangeRestDay) =>
      changeRestDayApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteChangeRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      batchCode,
    }: {
      employeeId: string;
      batchCode: string;
    }) => changeRestDayApi.removeEmployee(employeeId, batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteChangeRestDayBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => changeRestDayApi.removeBatch(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
