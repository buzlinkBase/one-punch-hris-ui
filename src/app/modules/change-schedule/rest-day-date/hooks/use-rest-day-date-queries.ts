import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { restDayDateApi } from "../services/rest-day-date.api";
import type { CreateRestDayDate } from "../models/api/request/create-rest-day-date.model";

const QUERY_KEY = ["change-schedule", "rest-day-date"];

export function useCreateRestDayDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRestDayDate) => restDayDateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useRestDayDatesByEmployee(
  employeeId: string,
  options?: { enabled?: boolean; dateFrom?: string; dateTo?: string },
) {
  return useQuery({
    queryKey: [
      ...QUERY_KEY,
      "by-employee",
      employeeId,
      options?.dateFrom,
      options?.dateTo,
    ],
    queryFn: () =>
      restDayDateApi.getAllByEmployee(
        employeeId,
        options?.dateFrom,
        options?.dateTo,
      ),
    enabled: (options?.enabled ?? true) && !!employeeId,
    staleTime: 0,
  });
}

export function useDeleteRestDayDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => restDayDateApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
