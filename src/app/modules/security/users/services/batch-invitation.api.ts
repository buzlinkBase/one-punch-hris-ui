import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { BatchInvitationRequest } from "../models/api/request/batch-invitation-request.model";
import type {
  BatchInvitationResult,
  InviteMatchResult,
  InviteRecipientCheck,
} from "../models/api/response/batch-invitation-response.model";

// Invitations are sent by AuthApi; which employee or client each email is for comes from hrms-api.
const INVITATIONS_URL = buildApiUrl(API_PREFIX.auth, "invitation");
const MATCH_URL = buildApiUrl(API_PREFIX.hrms, "invitations");

export const batchInvitationApi = {
  check(emails: string[]): Promise<InviteRecipientCheck[]> {
    return httpClient.postUnwrapped<InviteRecipientCheck[]>(
      `${INVITATIONS_URL}/batch/check`,
      { emails },
      { _skipErrorNotification: true },
    );
  },

  matchEmployees(emails: string[]): Promise<InviteMatchResult[]> {
    return httpClient.postUnwrapped<InviteMatchResult[]>(
      `${MATCH_URL}/employee-match`,
      { emails },
      { _skipErrorNotification: true },
    );
  },

  matchClientLogins(
    clientId: string,
    emails: string[],
  ): Promise<InviteMatchResult[]> {
    return httpClient.postUnwrapped<InviteMatchResult[]>(
      `${MATCH_URL}/clients/${clientId}/match`,
      { emails },
      { _skipErrorNotification: true },
    );
  },

  /** 200 when all were sent, 207 when some couldn't be -- both resolve with the result. */
  send(
    payload: BatchInvitationRequest,
    idempotencyKey: string,
  ): Promise<BatchInvitationResult> {
    return httpClient.postUnwrapped<BatchInvitationResult>(
      `${INVITATIONS_URL}/batch`,
      payload,
      {
        headers: { "X-Idempotency-Key": idempotencyKey },
        _skipErrorNotification: true,
      },
    );
  },
};
