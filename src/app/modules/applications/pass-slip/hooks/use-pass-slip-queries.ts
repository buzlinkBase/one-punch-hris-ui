import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { passSlipApi } from "../services/pass-slip.api";
import type { CreatePassSlip } from "../models/api/request/create-pass-slip.model";
import type { UpdatePassSlip } from "../models/api/request/update-pass-slip.model";

const QUERY_KEY = ["pass-slips"];

export function usePassSlips(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: [...QUERY_KEY, params],
    queryFn: () => passSlipApi.getAll(params),
  });
}

export function usePassSlip(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => passSlipApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePassSlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePassSlip) => passSlipApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePassSlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePassSlip) => passSlipApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useApprovePassSlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      passSlipApi.approve(id, note),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PassSlip", id],
      });
    },
  });
}

export function useDeclinePassSlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      passSlipApi.decline(id, note),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: ["approval-instance", "PassSlip", id],
      });
    },
  });
}

export function useRevokePassSlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => passSlipApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePassSlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => passSlipApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
