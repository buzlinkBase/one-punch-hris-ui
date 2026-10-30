import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  PublishedTermsResponse,
  TermsStatusResponse,
} from "../models/api/response/terms-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.tenants, "legal/terms");

export const termsApi = {
  /** The current version -- anonymous, for the sign-up page and the public Terms page. */
  getCurrent(): Promise<PublishedTermsResponse> {
    return httpClient.getUnwrapped<PublishedTermsResponse>(
      `${ENDPOINT}/current`,
      { _skipErrorNotification: true },
    );
  },
  getVersion(version: number): Promise<PublishedTermsResponse> {
    return httpClient.getUnwrapped<PublishedTermsResponse>(
      `${ENDPOINT}/${version}`,
      { _skipErrorNotification: true },
    );
  },
  getStatus(): Promise<TermsStatusResponse> {
    return httpClient.getUnwrapped<TermsStatusResponse>(`${ENDPOINT}/status`, {
      _skipErrorNotification: true,
    });
  },
  /** The current company accepts `version` (owners and admins only). */
  accept(version: number): Promise<TermsStatusResponse> {
    return httpClient.postUnwrapped<TermsStatusResponse>(`${ENDPOINT}/accept`, {
      version,
    });
  },
};
