import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { salaryAdjustmentApi } from "../services/salary-adjustment.api";
import type {
  CreateSalaryAdjustment,
  UpdateSalaryAdjustment,
} from "../models/api/request/create-salary-adjustment.model";

const KEY = ["salary-adjustments"];

export function useSalaryAdjustments() {
  return useQuery({
    queryKey: KEY,
    queryFn: () => salaryAdjustmentApi.getAll(),
  });
}

export function useSalaryAdjustment(id?: string) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => salaryAdjustmentApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateSalaryAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalaryAdjustment) =>
      salaryAdjustmentApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSalaryAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateSalaryAdjustment;
    }) => salaryAdjustmentApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteSalaryAdjustment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salaryAdjustmentApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
