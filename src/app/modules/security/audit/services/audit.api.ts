import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type {
  AuditLogParams,
  AuditModuleOption,
  AuditPage,
  AuditResponse,
} from "../models/api/response/audit-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "audit-logs");

export const auditApi = {
  async getPage(params: AuditLogParams): Promise<AuditPage> {
    return httpClient.getUnwrapped<AuditPage>(ENDPOINT, { params });
  },

  async getById(id: string): Promise<AuditResponse> {
    return httpClient.getUnwrapped<AuditResponse>(`${ENDPOINT}/${id}`);
  },

  async getModules(): Promise<AuditModuleOption[]> {
    return httpClient.getUnwrapped<AuditModuleOption[]>(`${ENDPOINT}/modules`);
  },
};
