import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userRoleApi } from "../services/user-role.api";

const QUERY_KEY = ["user-roles"];

export function useUserRoles(userId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, userId],
    queryFn: () => userRoleApi.getRoles(userId!),
    enabled: !!userId,
  });
}

export function useReplaceUserRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      userRoleApi.replaceRoles(userId, roleIds),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, userId] });
    },
  });
}
