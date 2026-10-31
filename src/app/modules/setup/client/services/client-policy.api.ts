import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ClientPolicyResponse } from "../models/api/response/client-policy-response.model";
import type { UpdateClientPolicy } from "../models/api/request/update-client-policy.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "generalsettings/client");

export const clientPolicyApi = {
  get(clientId: string): Promise<ClientPolicyResponse> {
    return httpClient.getUnwrapped<ClientPolicyResponse>(
      `${ENDPOINT}/${clientId}`,
    );
  },

  update(clientId: string, data: UpdateClientPolicy): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${clientId}`, data);
  },
};
