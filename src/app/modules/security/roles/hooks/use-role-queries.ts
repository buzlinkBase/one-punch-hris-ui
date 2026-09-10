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
    mutationFn: ({ id, data }: { id: string; data: UpdateRole }) =>
      roleApi.update(id, data),
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

export function useSetRolePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => roleApi.setPermissions(id, permissionIds),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, id] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Role names a member can be assigned via the invite/role-assignment flow — every non-Owner
 * System Role plus this tenant's Custom Roles, mirroring tenant-api's own
 * RoleService.IsAssignableAsync rule (Owner is never grantable this way).
 */
export function useAssignableRoles() {
  const { data: roles = [], ...rest } = useRoles();
  return {
    ...rest,
    data: roles
      .filter((r) => !(r.isSystemRole && r.name === "Owner"))
      .map((r) => r.name),
  };
}
