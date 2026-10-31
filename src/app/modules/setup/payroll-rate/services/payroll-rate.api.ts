import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PayrollRateResponse } from "../models/api/response/payroll-rate-response.model";
import type { CreatePayrollRate } from "../models/api/request/create-payroll-rate.model";
import type { UpdatePayrollRate } from "../models/api/request/update-payroll-rate.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "RateTables");

export const payrollRateApi = {
  getAll(): Promise<PayrollRateResponse[]> {
    return httpClient.getUnwrapped<PayrollRateResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<PayrollRateResponse> {
    return httpClient.getUnwrapped<PayrollRateResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreatePayrollRate): Promise<PayrollRateResponse> {
    return httpClient.postUnwrapped<PayrollRateResponse>(ENDPOINT, data);
  },
  update(data: UpdatePayrollRate): Promise<PayrollRateResponse> {
    return httpClient.put<PayrollRateResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
  clearAll(): Promise<void> {
    return httpClient.delete<void>(ENDPOINT);
  },
  bulkReplace(data: CreatePayrollRate[]): Promise<void> {
    return httpClient.postUnwrapped<void>(`${ENDPOINT}/bulk`, data);
  },
};
