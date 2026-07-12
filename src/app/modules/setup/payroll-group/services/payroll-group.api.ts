import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PayrollGroupResponse } from "../models/api/response/payroll-group-response.model";
import type { CreatePayrollGroup } from "../models/api/request/create-payroll-group.model";
import type { UpdatePayrollGroup } from "../models/api/request/update-payroll-group.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "payrollgroups");

export const payrollGroupApi = {
  getAll(): Promise<PayrollGroupResponse[]> {
    return httpClient.getUnwrapped<PayrollGroupResponse[]>(ENDPOINT);
  },
  getById(id: string): Promise<PayrollGroupResponse> {
    return httpClient.getUnwrapped<PayrollGroupResponse>(`${ENDPOINT}/${id}`);
  },
  create(data: CreatePayrollGroup): Promise<PayrollGroupResponse> {
    return httpClient.postUnwrapped<PayrollGroupResponse>(ENDPOINT, data);
  },
  update(data: UpdatePayrollGroup): Promise<PayrollGroupResponse> {
    return httpClient.put<PayrollGroupResponse>(`${ENDPOINT}/${data.id}`, data);
  },
  remove(id: string): Promise<void> {
    return httpClient.delete<void>(`${ENDPOINT}/${id}`);
  },
};
