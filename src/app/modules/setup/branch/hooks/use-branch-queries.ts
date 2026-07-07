import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { branchApi } from "../services/branch.api";
import type { CreateBranch } from "../models/api/request/create-branch.model";
import type { UpdateBranch } from "../models/api/request/update-branch.model";

const QUERY_KEY = ["branches"];

export function useBranches() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => branchApi.getAll(),
  });
}

export function useBranch(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => branchApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranch) => branchApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBranch) => branchApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => branchApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
