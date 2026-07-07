import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeHolidayApi } from "../services/change-holiday.api";
import type { CreateChangeHoliday } from "../models/api/request/create-change-holiday.model";
import type { UpdateChangeHoliday } from "../models/api/request/update-change-holiday.model";
import type { ChangeHolidayFilter } from "../models/api/request/change-holiday-filter.model";

const QUERY_KEY = ["change-schedule", "change-holiday"];

export function useChangeHolidays(filter: ChangeHolidayFilter = {}) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter],
    queryFn: () => changeHolidayApi.getAll(filter),
  });
}

export function useChangeHoliday(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => changeHolidayApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateChangeHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateChangeHoliday) => changeHolidayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateChangeHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateChangeHoliday) => changeHolidayApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.batchId], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteChangeHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => changeHolidayApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
