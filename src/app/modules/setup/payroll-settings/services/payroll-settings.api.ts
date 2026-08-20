import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PayrollSettingsResponse } from "../models/api/response/payroll-settings-response.model";
import type { UpdatePayrollSettings } from "../models/api/request/update-payroll-settings.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "PayrollSettings");

export const payrollSettingsApi = {
  get(): Promise<PayrollSettingsResponse> {
    return httpClient.getUnwrapped<PayrollSettingsResponse>(ENDPOINT);
  },
  update(data: UpdatePayrollSettings): Promise<PayrollSettingsResponse> {
    return httpClient.put<PayrollSettingsResponse>(ENDPOINT, data);
  },
};
