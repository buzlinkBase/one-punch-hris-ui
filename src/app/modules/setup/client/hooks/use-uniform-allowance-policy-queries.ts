import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { uniformAllowancePolicyApi } from "../services/uniform-allowance-policy.api";
import type {
  UniformAllowanceCreditLogFilter,
  UpsertUniformAllowancePolicy,
} from "../models/api/response/uniform-allowance-policy.model";

const ROOT = ["setup", "uniform-allowance-policy"] as const;
const listKey = (clientId: string) => [...ROOT, clientId, "list"];
const previewKey = (clientId: string) => [...ROOT, clientId, "preview"];

export function useUniformAllowancePolicies(clientId: string | undefined) {
  return useQuery({
    queryKey: listKey(clientId ?? ""),
    queryFn: () => uniformAllowancePolicyApi.list(clientId!),
    enabled: !!clientId,
  });
}

export function useUniformAllowancePreview(clientId: string | undefined) {
  return useQuery({
    queryKey: previewKey(clientId ?? ""),
    queryFn: () => uniformAllowancePolicyApi.preview(clientId!),
    enabled: !!clientId,
  });
}

/** Creates a version, or changes one that hasn't started (policyId given). */
export function useSaveUniformAllowancePolicy(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      policyId,
      payload,
    }: {
      policyId?: string | null;
      payload: UpsertUniformAllowancePolicy;
    }) =>
      policyId
        ? uniformAllowancePolicyApi.update(clientId, policyId, payload)
        : uniformAllowancePolicyApi.create(clientId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ROOT, clientId] });
    },
  });
}

export function useDeleteUniformAllowancePolicy(clientId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (policyId: string) =>
      uniformAllowancePolicyApi.remove(clientId, policyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...ROOT, clientId] });
    },
  });
}

export function useUniformAllowanceCreditLog(
  filter: UniformAllowanceCreditLogFilter,
  enabled = true,
) {
  return useQuery({
    queryKey: ["payroll-reports", "uniform-allowance-credit-log", filter],
    queryFn: () => uniformAllowancePolicyApi.creditLog(filter),
    enabled,
  });
}

export function useUniformAllowanceSchedule(employeeId: string | undefined) {
  return useQuery({
    queryKey: ["payroll-reports", "uniform-allowance-schedule", employeeId],
    queryFn: () => uniformAllowancePolicyApi.employeeSchedule(employeeId!),
    enabled: !!employeeId,
  });
}
