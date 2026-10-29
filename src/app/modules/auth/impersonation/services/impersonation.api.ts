import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ImpersonationSessionResponse } from "../models/api/response/impersonation-session.model";

const IMPERSONATION_URL = buildApiUrl(API_PREFIX.auth, "auth/impersonation");

export const impersonationApi = {
  /** Redeems the one-time code the support console handed over; works once, within a minute. */
  exchange(code: string): Promise<ImpersonationSessionResponse> {
    return httpClient.postUnwrapped<ImpersonationSessionResponse>(
      `${IMPERSONATION_URL}/exchange`,
      { code },
      { _skipErrorNotification: true },
    );
  },

  /** Ends the session on the server, so every API refuses its token at once. */
  async stop(): Promise<void> {
    await httpClient.post<void>(
      `${IMPERSONATION_URL}/stop`,
      {},
      { _skipErrorNotification: true },
    );
  },
};
