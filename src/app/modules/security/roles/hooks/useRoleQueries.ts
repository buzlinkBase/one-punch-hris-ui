import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { roleApi } from "../services/role.api";
import type { CreateRole } from "../models/api/request/create-role.model";
import type { UpdateRole } from "../models/api/request/update-role.model";

const QUERY_KEY = ["roles"];

export function useRoles() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => roleApi.getAll(),
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => roleApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRole) => roleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRole) => roleApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roleApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}
