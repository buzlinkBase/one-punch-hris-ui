import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AccountClosureRequest } from "../models/api/request/closure-request.model";
import type { AccountClosureResponse } from "../models/api/response/closure-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "subscriptions/closure");
const LINKS = buildApiUrl(API_PREFIX.tenants, "account-closure");

export const closureApi = {
  /** The owner's latest request to close the account; null when they never made one. */
  async getCurrent(): Promise<AccountClosureResponse | null> {
    const closure = await httpClient.getUnwrapped<AccountClosureResponse | "">(
      ENDPOINT,
    );
    return closure || null;
  },

  /** Asks to close the account. Nothing happens until the owner confirms from the email sent to them. */
  request(payload: AccountClosureRequest): Promise<AccountClosureResponse> {
    return httpClient.postUnwrapped<AccountClosureResponse>(ENDPOINT, payload);
  },

  cancel(): Promise<void> {
    return httpClient.post<void>(`${ENDPOINT}/cancel`);
  },

  /** The link in the email: works signed out. The answer is the same whatever is wrong with a link. */
  confirmByLink(token: string): Promise<void> {
    return httpClient.post<void>(
      `${LINKS}/confirm`,
      { token },
      { _skipErrorNotification: true },
    );
  },

  cancelByLink(token: string): Promise<void> {
    return httpClient.post<void>(
      `${LINKS}/cancel`,
      { token },
      { _skipErrorNotification: true },
    );
  },
};
