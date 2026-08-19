import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PassSlipResponse } from "../models/api/response/pass-slip-response.model";
import type { CreatePassSlip } from "../models/api/request/create-pass-slip.model";
import type { UpdatePassSlip } from "../models/api/request/update-pass-slip.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "PassSlipApplications");

export const passSlipApi = {
  async getAll(params?: {
    from?: string;
    to?: string;
    employeeId?: string;
  }): Promise<PassSlipResponse[]> {
    const qs = new URLSearchParams();
    if (params?.from) qs.set("from", params.from);
    if (params?.to) qs.set("to", params.to);
    if (params?.employeeId) qs.set("employeeId", params.employeeId);
    const query = qs.toString();
    return httpClient.getUnwrapped<PassSlipResponse[]>(
      query ? `${ENDPOINT}?${query}` : ENDPOINT,
    );
  },

  getById(id: string): Promise<PassSlipResponse> {
    return httpClient.getUnwrapped<PassSlipResponse>(`${ENDPOINT}/${id}`);
  },

  create(data: CreatePassSlip): Promise<PassSlipResponse> {
    return httpClient.postUnwrapped<PassSlipResponse>(ENDPOINT, data);
  },

  update(data: UpdatePassSlip): Promise<PassSlipResponse> {
    return httpClient.putUnwrapped<PassSlipResponse>(
      `${ENDPOINT}/${data.id}`,
      data,
    );
  },

  approve(id: string): Promise<void> {
    return httpClient.postUnwrapped<void>(`${ENDPOINT}/${id}/approve`, {});
  },

  revoke(id: string): Promise<void> {
    return httpClient.postUnwrapped<void>(`${ENDPOINT}/${id}/revoke`, {});
  },

  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
