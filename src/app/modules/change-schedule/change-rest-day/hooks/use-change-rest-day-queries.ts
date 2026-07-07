import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeRestDayApi } from "../services/change-rest-day.api";
import type { CreateChangeRestDay } from "../models/api/request/create-change-rest-day.model";
import type { UpdateChangeRestDay } from "../models/api/request/update-change-rest-day.model";
import type { ChangeRestDayFilter } from "../models/api/request/change-rest-day-filter.model";

const QUERY_KEY = ["change-schedule", "change-rest-day"];

export function useChangeRestDays(filter: ChangeRestDayFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => changeRestDayApi.getAll(filter),
  });
}

export function useChangeRestDay(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => changeRestDayApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateChangeRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChangeRestDay) => changeRestDayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateChangeRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateChangeRestDay) => changeRestDayApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteChangeRestDay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => changeRestDayApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
