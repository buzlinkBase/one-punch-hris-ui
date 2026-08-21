import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { AuditResponse } from "../models/api/response/audit-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "audit-logs");

export const auditApi = {
  async getAll(): Promise<AuditResponse[]> {
    return httpClient.getUnwrapped<AuditResponse[]>(ENDPOINT);
  },

  async getById(id: string): Promise<AuditResponse> {
    return httpClient.getUnwrapped<AuditResponse>(`${ENDPOINT}/${id}`);
  },
};
