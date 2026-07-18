import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { holidayApi } from "../services/holiday.api";
import type { CreateHoliday } from "../models/api/request/create-holiday.model";
import type { UpdateHoliday } from "../models/api/request/update-holiday.model";

const QUERY_KEY = ["holidays"];

export function useHolidays(year: number = new Date().getFullYear()) {
  return useQuery({
    queryKey: [...QUERY_KEY, year],
    queryFn: () => holidayApi.getAll(year),
  });
}

export function useHoliday(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => holidayApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHoliday) => holidayApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateHoliday) => holidayApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => holidayApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
