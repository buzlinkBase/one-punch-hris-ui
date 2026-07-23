import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeHolidayApi } from "../services/change-holiday.api";
import type { CreateChangeHoliday } from "../models/api/request/create-change-holiday.model";
import type { UpdateChangeHoliday } from "../models/api/request/update-change-holiday.model";
import type { ChangeHolidayFilter } from "../models/api/request/change-holiday-filter.model";

const QUERY_KEY = ["change-schedule", "change-holiday"];

export function useChangeHolidays(
  filter: ChangeHolidayFilter = {},
  fetchKey = 0,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, filter, fetchKey],
    queryFn: () => changeHolidayApi.getAll(filter),
    enabled: !!filter.fromDate && !!filter.toDate,
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteChangeHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      batchCode,
    }: {
      employeeId: string;
      batchCode: string;
    }) => changeHolidayApi.removeEmployee(employeeId, batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteChangeHolidayBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (batchCode: string) => changeHolidayApi.removeBatch(batchCode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
