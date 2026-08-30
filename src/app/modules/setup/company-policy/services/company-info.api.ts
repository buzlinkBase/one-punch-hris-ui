import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { CompanyInfoResponse } from "../models/api/response/company-info-response.model";
import type { UpdateCompanyInfo } from "../models/api/request/update-company-info.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "companysettings");

export const companyInfoApi = {
  get(): Promise<CompanyInfoResponse> {
    return httpClient.getUnwrapped<CompanyInfoResponse>(ENDPOINT);
  },

  update(data: UpdateCompanyInfo): Promise<void> {
    return httpClient.put<void>(ENDPOINT, data);
  },
};
