import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ClientRateResponse } from "../models/api/response/client-rate-response.model";
import type { UpdateClientRates } from "../models/api/request/update-client-rates.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "RateTables/client");

export const clientRateApi = {
  get(clientId: string): Promise<ClientRateResponse> {
    return httpClient.getUnwrapped<ClientRateResponse>(
      `${ENDPOINT}/${clientId}`,
    );
  },

  bulkReplace(clientId: string, data: UpdateClientRates): Promise<void> {
    return httpClient.postUnwrapped<void>(`${ENDPOINT}/${clientId}/bulk`, data);
  },
};
