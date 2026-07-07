import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flexiTimeShiftApi } from "../services/flexi-time-shift.api";
import type { CreateFlexiTimeShift } from "../models/api/request/create-flexi-time-shift.model";
import type { UpdateFlexiTimeShift } from "../models/api/request/update-flexi-time-shift.model";

const QUERY_KEY = ["flexi-time-shifts"];

export function useFlexiTimeShifts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => flexiTimeShiftApi.getAll(),
  });
}

export function useFlexiTimeShift(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => flexiTimeShiftApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateFlexiTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFlexiTimeShift) => flexiTimeShiftApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateFlexiTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFlexiTimeShift) => flexiTimeShiftApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteFlexiTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => flexiTimeShiftApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
