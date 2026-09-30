import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UserLinkRequest } from "../models/api/request/user-link-request.model";
import type { UserLinkResponse } from "../models/api/response/user-link-response.model";

// Members come from TenantApi; which employee or client each belongs to comes from hrms-api.
const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "invitations/user-links");

export const userLinkApi = {
  getLinks(payload: UserLinkRequest): Promise<UserLinkResponse[]> {
    return httpClient.postUnwrapped<UserLinkResponse[]>(ENDPOINT, payload, {
      _skipErrorNotification: true,
    });
  },
};
