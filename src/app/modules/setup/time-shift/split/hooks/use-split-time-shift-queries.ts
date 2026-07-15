import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SplitTimeShiftApi } from "../services/split-time-shift.api";
import type { CreateSplitTimeShift } from "../models/api/request/create-split-time-shift.model";
import type { UpdateSplitTimeShift } from "../models/api/request/update-split-time-shift.model";

const QUERY_KEY = ["split-time-shifts"];

export function useSplitTimeShifts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => SplitTimeShiftApi.getAll(),
  });
}

export function useSplitTimeShift(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => SplitTimeShiftApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateSplitTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSplitTimeShift) => SplitTimeShiftApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateSplitTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateSplitTimeShift) => SplitTimeShiftApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteSplitTimeShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => SplitTimeShiftApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
