import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { CompanyPolicyResponse } from "../models/api/response/company-policy-response.model";
import type { UpdateCompanyPolicy } from "../models/api/request/update-company-policy.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "generalsettings/company");

export const companyPolicyApi = {
  get(): Promise<CompanyPolicyResponse> {
    return httpClient.getUnwrapped<CompanyPolicyResponse>(ENDPOINT);
  },

  update(data: UpdateCompanyPolicy): Promise<void> {
    return httpClient.put<void>(ENDPOINT, data);
  },
};
