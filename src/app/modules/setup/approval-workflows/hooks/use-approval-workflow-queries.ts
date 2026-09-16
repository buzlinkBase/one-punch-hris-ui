import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { approvalWorkflowApi } from "../services/approval-workflow.api";
import type { ApprovalApplicationType } from "@/shared/types/approval.model";
import type { ApprovalWorkflowRequest } from "../models/api/request/approval-workflow-request.model";

const QUERY_KEY = ["approval-workflows"];

export function useApprovalWorkflows(applicationType: ApprovalApplicationType) {
  return useQuery({
    queryKey: [...QUERY_KEY, applicationType],
    queryFn: () => approvalWorkflowApi.getAll(applicationType),
  });
}

export function useApprovalWorkflow(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => approvalWorkflowApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateApprovalWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ApprovalWorkflowRequest) =>
      approvalWorkflowApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateApprovalWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ApprovalWorkflowRequest }) =>
      approvalWorkflowApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useActivateApprovalWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvalWorkflowApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeactivateApprovalWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvalWorkflowApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteApprovalWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approvalWorkflowApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
