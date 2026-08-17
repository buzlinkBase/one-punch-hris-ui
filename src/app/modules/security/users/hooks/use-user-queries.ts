import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../services/user.api";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import type { CreateUser } from "../models/api/request/create-user.model";
import type { UpdateUser } from "../models/api/request/update-user.model";
import type { SendInvitationRequest } from "../models/api/request/send-invitation-request.model";

const QUERY_KEY = ["users"];

export function useUsers() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => userApi.getAll(),
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => userApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUser) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateUser) => userApi.update(data),
    onSuccess: (updated) => {
      queryClient.setQueryData([...QUERY_KEY, updated.id], updated);
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useSendInvitation() {
  return useMutation({
    mutationFn: (data: SendInvitationRequest) => authApi.sendInvitation(data),
  });
}

export function useAuthRoles() {
  return useQuery({
    queryKey: ["auth", "roles"],
    queryFn: () => authApi.getRoles(),
    staleTime: Infinity,
  });
}
