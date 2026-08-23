import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { employeeFixedScheduleApi } from "../services/employee-fixed-schedule.api";
import type { DayName } from "../models/api/response/employee-fixed-schedule-response.model";
import type { SetEmployeeFixedScheduleDay } from "../models/api/request/set-employee-fixed-schedule-day.model";

const QUERY_KEY = ["employee-fixed-schedule"];

export function useEmployeeFixedSchedule(employeeId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, employeeId],
    queryFn: () => employeeFixedScheduleApi.getByEmployee(employeeId!),
    enabled: !!employeeId,
    // Always refetch on mount — this drives the Employee edit form's initial
    // draft state, so it must reflect the latest save, not a stale cache entry.
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useSetEmployeeFixedScheduleDay(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      dayName,
      data,
    }: {
      dayName: DayName;
      data: SetEmployeeFixedScheduleDay;
    }) => employeeFixedScheduleApi.setDay(employeeId, dayName, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, employeeId] });
    },
  });
}

export function useUnassignEmployeeFixedScheduleDay(employeeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dayName: DayName) =>
      employeeFixedScheduleApi.unassignDay(employeeId, dayName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, employeeId] });
    },
  });
}
