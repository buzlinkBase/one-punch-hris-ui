import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../services/auth.api";
import type { LoginRequest } from "../models/api/request/login-request.model";
import type { CreateTenantRequest } from "../models/api/request/create-tenant-request.model";

// Plain wrappers: each screen still decides what to do with the session it gets back (save it,
// pick a company, redirect), since those flows differ per screen.

export function useLoginMutation() {
  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
  });
}

export function useGoogleLoginMutation() {
  return useMutation({
    mutationFn: (code: string) => authApi.loginWithGoogle(code),
  });
}

export function useGoogleSignUpMutation() {
  return useMutation({
    mutationFn: (code: string) => authApi.signUpWithGoogle(code),
  });
}

export function useSelectTenantMutation() {
  return useMutation({
    mutationFn: (tenantId: string) => authApi.selectTenant(tenantId),
  });
}

export function useCreateTenantMutation() {
  return useMutation({
    mutationFn: (data: CreateTenantRequest) => authApi.createTenant(data),
  });
}

/** Revokes the refresh-token cookie server-side; callers clear local state themselves. */
export function useLogoutMutation() {
  return useMutation({
    mutationFn: () => authApi.logout(),
  });
}

/** Accepts an invitation for the signed-in session, without entering the app. */
export function useAcceptPendingInvitationMutation() {
  return useMutation({
    mutationFn: (token: string) => authApi.acceptInvitation({ token }),
  });
}

/** A new company's provisioning status, always fresh from the server. */
export function useFetchTenantCreationStatus() {
  const queryClient = useQueryClient();
  return useCallback(
    (tenantId: string) =>
      queryClient.fetchQuery({
        queryKey: ["tenant-creation-status", tenantId],
        queryFn: () => authApi.getTenantCreationStatus(tenantId),
        staleTime: 0,
      }),
    [queryClient],
  );
}

/** Looks up the signed-in user's pending invitation, always fresh from the server. */
export function useFetchPendingInvitation() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.fetchQuery({
      queryKey: ["pending-invitation"],
      queryFn: () => authApi.getPendingInvitation(),
      staleTime: 0,
    });
}
