import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { phicTableApi } from "../services/phic-table.api";
import type { CreatePhicTable } from "../models/api/request/create-phic-table.model";
import type { UpdatePhicTable } from "../models/api/request/update-phic-table.model";

const QUERY_KEY = ["phic-table"];

export function usePhicTableRows() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => phicTableApi.getAll(),
  });
}

export function usePhicTableRow(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "row", id],
    queryFn: () => phicTableApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePhicTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePhicTable) => phicTableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePhicTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePhicTable) => phicTableApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePhicTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => phicTableApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
