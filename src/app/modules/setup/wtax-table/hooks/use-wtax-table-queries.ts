import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wtaxTableApi } from "../services/wtax-table.api";
import type { CreateWtaxTable } from "../models/api/request/create-wtax-table.model";
import type { UpdateWtaxTable } from "../models/api/request/update-wtax-table.model";

const QUERY_KEY = ["wtax-table"];

export function useWtaxTableRows(
  effectivity: string | undefined,
  payrollType: string | undefined,
) {
  return useQuery({
    queryKey: [...QUERY_KEY, effectivity, payrollType],
    queryFn: () => wtaxTableApi.getAll(effectivity!, payrollType!),
    enabled: !!effectivity && !!payrollType,
  });
}

export function useWtaxTableRow(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "row", id],
    queryFn: () => wtaxTableApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateWtaxTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWtaxTable) => wtaxTableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateWtaxTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateWtaxTable) => wtaxTableApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteWtaxTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => wtaxTableApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
