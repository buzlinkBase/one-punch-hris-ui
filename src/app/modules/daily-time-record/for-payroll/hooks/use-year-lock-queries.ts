import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { yearLockApi } from "../services/year-lock.api";

const YEAR_LOCK_KEY = ["year-locks"];

export function useYearLocks() {
  return useQuery({
    queryKey: YEAR_LOCK_KEY,
    queryFn: () => yearLockApi.getAll(),
  });
}

export function useReopenYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (year: number) => yearLockApi.reopen(year),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: YEAR_LOCK_KEY }),
  });
}
