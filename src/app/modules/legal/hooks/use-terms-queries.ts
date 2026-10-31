import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authStorage } from "@/core/auth/auth-storage";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { termsApi } from "../services/terms.api";

export const TERMS_QUERY_KEY = ["legal", "terms"] as const;

/** The published Terms: the current version, or `version` when given. Null when none is published. */
export function usePublishedTerms(version?: number) {
  return useQuery({
    queryKey: [...TERMS_QUERY_KEY, "published", version ?? "current"],
    queryFn: async () => {
      try {
        return await (version
          ? termsApi.getVersion(version)
          : termsApi.getCurrent());
      } catch {
        return null;
      }
    },
    // "Not live / nothing published" isn't kept: the Terms may go live while the user is signed in.
    staleTime: (query) => (query.state.data == null ? 0 : 1000 * 60 * 30),
  });
}

/**
 * Whether the Terms of Service are in effect (the Platform Console's "Terms of Service live"
 * switch). While they aren't, the public Terms answer 404 -- so this is false, and the agreement
 * boxes, links and acceptance prompt all stay hidden. Anonymous: works on the sign-up page.
 */
export function useTermsLive(): boolean {
  const { data } = usePublishedTerms();
  return data != null;
}

const STATUS_RECHECK_MS = 1000 * 60 * 5;

/**
 * Whether the current company must accept a newer version. Re-checked every few minutes (and on
 * tab focus) so a version published -- or the Terms going live -- reaches users already signed in,
 * not only at their next sign-in.
 */
export function useTermsStatus(enabled = true) {
  useAuthUser(); // re-key when the session switches company
  const tenantId = authStorage.getTenantId();
  return useQuery({
    queryKey: [...TERMS_QUERY_KEY, "status", tenantId],
    queryFn: () => termsApi.getStatus(),
    enabled: enabled && !!tenantId && !!authStorage.getToken(),
    staleTime: STATUS_RECHECK_MS,
    refetchInterval: STATUS_RECHECK_MS,
    retry: false,
  });
}

export function useAcceptTerms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (version: number) => termsApi.accept(version),
    onSuccess: (status) => {
      queryClient.setQueryData(
        [...TERMS_QUERY_KEY, "status", authStorage.getTenantId()],
        status,
      );
    },
  });
}
