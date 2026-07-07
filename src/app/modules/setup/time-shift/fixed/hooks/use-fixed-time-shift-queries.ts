import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fixedTimeShiftApi } from "../services/fixed-time-shift.api";
import type { CreateFixedTimeShift } from "../models/api/request/create-fixed-time-shift.model";
import type { UpdateFixedTimeShift } from "../models/api/request/update-fixed-time-shift.model";

const QUERY_KEY = ["fixed-time-shifts"];

export function useFixedTimeShifts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => fixedTimeShiftApi.getAll(),
  });
}

export function useFixedTimeShift(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => fixedTimeShiftApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateFixedTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFixedTimeShift) => fixedTimeShiftApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateFixedTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFixedTimeShift) => fixedTimeShiftApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteFixedTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fixedTimeShiftApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
