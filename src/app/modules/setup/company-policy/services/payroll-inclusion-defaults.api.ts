import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PayrollInclusionDefaultsResponse } from "../models/api/response/payroll-inclusion-defaults-response.model";
import type { UpdatePayrollInclusionDefaults } from "../models/api/request/update-payroll-inclusion-defaults.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "payrollinclusiondefaults");

export const payrollInclusionDefaultsApi = {
  get(): Promise<PayrollInclusionDefaultsResponse> {
    return httpClient.getUnwrapped<PayrollInclusionDefaultsResponse>(ENDPOINT);
  },

  update(data: UpdatePayrollInclusionDefaults): Promise<void> {
    return httpClient.put<void>(ENDPOINT, data);
  },
};
