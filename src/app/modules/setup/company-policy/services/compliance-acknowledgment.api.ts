import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { ComplianceAcknowledgmentPage } from "../models/api/response/compliance-acknowledgment-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "ComplianceAcknowledgments");

export const complianceAcknowledgmentApi = {
  list(page: number, pageSize: number): Promise<ComplianceAcknowledgmentPage> {
    return httpClient.getUnwrapped<ComplianceAcknowledgmentPage>(ENDPOINT, {
      params: { page, pageSize },
    });
  },
};
