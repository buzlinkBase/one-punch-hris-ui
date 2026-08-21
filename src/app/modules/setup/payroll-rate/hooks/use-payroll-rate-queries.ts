import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { payrollRateApi } from "../services/payroll-rate.api";
import type { CreatePayrollRate } from "../models/api/request/create-payroll-rate.model";
import type { UpdatePayrollRate } from "../models/api/request/update-payroll-rate.model";

const QUERY_KEY = ["payroll-rates"];

export function usePayrollRates() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => payrollRateApi.getAll(),
  });
}

export function usePayrollRate(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => payrollRateApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePayrollRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePayrollRate) => payrollRateApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePayrollRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePayrollRate) => payrollRateApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePayrollRate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollRateApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
