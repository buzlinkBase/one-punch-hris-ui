import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ClientBillingResponse } from "../models/api/response/client-billing-response.model";
import type { UpdateClientBilling } from "../models/api/request/update-client-billing.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "clients");

export const clientBillingApi = {
  get(clientId: string): Promise<ClientBillingResponse> {
    return httpClient.getUnwrapped<ClientBillingResponse>(
      `${ENDPOINT}/${clientId}/billing-info`,
    );
  },

  update(clientId: string, data: UpdateClientBilling): Promise<void> {
    return httpClient.put<void>(`${ENDPOINT}/${clientId}/billing-info`, data);
  },
};
