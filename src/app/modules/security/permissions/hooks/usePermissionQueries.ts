import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { permissionApi } from "../services/permission.api";
import type { CreatePermission } from "../models/api/request/create-permission.model";
import type { UpdatePermission } from "../models/api/request/update-permission.model";

const QUERY_KEY = ["permissions"];

export function usePermissions() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => permissionApi.getAll(),
  });
}

export function usePermission(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => permissionApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePermission) => permissionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdatePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePermission) => permissionApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeletePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => permissionApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
