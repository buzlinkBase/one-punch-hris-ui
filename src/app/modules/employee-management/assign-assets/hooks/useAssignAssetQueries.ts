import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { assignAssetApi } from "../services/assign-asset.api";
import type { CreateAssignAsset } from "../models/api/request/create-assign-asset.model";
import type { UpdateAssignAsset } from "../models/api/request/update-assign-asset.model";

const QUERY_KEY = ["employee-assign-assets"];

export function useAssignAssets() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => assignAssetApi.getAll(),
  });
}

export function useAssignAsset(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => assignAssetApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAssignAsset) => assignAssetApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAssignAsset) => assignAssetApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteAssignAsset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => assignAssetApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
