import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { annualTaxTableApi } from "../services/annual-tax-table.api";
import type { CreateAnnualTaxTable } from "../models/api/request/create-annual-tax-table.model";
import type { UpdateAnnualTaxTable } from "../models/api/request/update-annual-tax-table.model";

const QUERY_KEY = ["annual-tax-table"];

export function useAnnualTaxTableRows() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => annualTaxTableApi.getAll(),
  });
}

export function useAnnualTaxTableRow(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, "row", id],
    queryFn: () => annualTaxTableApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAnnualTaxTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnualTaxTable) => annualTaxTableApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateAnnualTaxTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAnnualTaxTable) => annualTaxTableApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteAnnualTaxTableRow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => annualTaxTableApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
