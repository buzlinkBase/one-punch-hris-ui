import { useMutation, useQuery } from "@tanstack/react-query";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { saveInvitationSession } from "@/core/auth/invitation-session";
import type { AcceptInvitationByTokenRequest } from "@/app/modules/auth/login/models/api/request/accept-invitation-by-token-request.model";
import type { AcceptInvitationResponse } from "@/app/modules/auth/login/models/api/response/accept-invitation-response.model";

const INVITATION_PREVIEW_QUERY_KEY = ["invitation-preview"] as const;

// Full reload (so React Query cache and Zustand stores reset cleanly) onto "/" rather than a
// hard-coded "/dashboard" -- the root route then resolves where this user actually belongs
// (dashboard, or the Employee Portal for an Employee-only invitee).
function enterApp(result: AcceptInvitationResponse) {
  saveInvitationSession(result);
  window.location.assign("/");
}

export function useInvitationPreviewQuery(token: string) {
  return useQuery({
    queryKey: [...INVITATION_PREVIEW_QUERY_KEY, token],
    queryFn: () => authApi.getInvitationPreview(token),
    enabled: !!token,
    retry: false,
    // Fetched once per visit: once the invite is accepted, a background refetch (window
    // focus, remount) would come back `valid: false` and flash "expired or invalid" over the
    // page while it's redirecting into the app.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
}

/** Existing account, already signed in: consumes the invitation for the current session. */
export function useAcceptInvitationMutation() {
  return useMutation({
    mutationFn: (token: string) => authApi.acceptInvitation({ token }),
    onSuccess: enterApp,
  });
}

/** New account: creates it with a password and consumes the invitation in one call. */
export function useAcceptInvitationByTokenMutation() {
  return useMutation({
    mutationFn: (data: AcceptInvitationByTokenRequest) =>
      authApi.acceptInvitationByToken(data),
    onSuccess: enterApp,
  });
}

/**
 * New account via Google: signup-google-callback creates the account but knows nothing about
 * invitations (InvitationService.Accept is auth-method-agnostic), so its session is saved
 * first -- making the following [Authorize] accept call run as the newly-created user.
 */
export function useGoogleJoinMutation() {
  return useMutation({
    mutationFn: async ({ code, token }: { code: string; token: string }) => {
      saveInvitationSession(await authApi.signUpWithGoogle(code));
      return authApi.acceptInvitation({ token });
    },
    onSuccess: enterApp,
  });
}
