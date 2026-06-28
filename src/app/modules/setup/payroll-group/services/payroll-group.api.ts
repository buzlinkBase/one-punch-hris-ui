import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { PayrollGroupResponse } from "../models/api/response/payroll-group-response.model";
import type { CreatePayrollGroup } from "../models/api/request/create-payroll-group.model";
import type { UpdatePayrollGroup } from "../models/api/request/update-payroll-group.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "payrollgroups");

const FREQUENCIES = ["DAILY", "WEEKLY", "SEMI_MONTHLY", "MONTHLY"] as const;

const MOCK_PAYROLL_GROUPS: PayrollGroupResponse[] = Array.from(
  { length: 24 },
  (_, i) => ({
    id: `pg-${i + 1}`,
    code: `PG${String(i + 1).padStart(3, "0")}`,
    name: `Payroll Group ${i + 1}`,
    payrollFrequency: FREQUENCIES[i % FREQUENCIES.length],
    cutoffDays:
      i % 2 === 0
        ? [
            { day: 15, isEndOfMonth: false, label: "First Cutoff" },
            { day: 30, isEndOfMonth: true, label: "Second Cutoff" },
          ]
        : [],
    status: i % 5 === 0 ? "INACTIVE" : "ACTIVE",
  }),
);

export const payrollGroupApi = {
  async getAll(): Promise<PayrollGroupResponse[]> {
    try {
      const data =
        await httpClient.getUnwrapped<PayrollGroupResponse[]>(ENDPOINT);
      return data.length ? data : MOCK_PAYROLL_GROUPS;
    } catch {
      return MOCK_PAYROLL_GROUPS;
    }
  },
  async getById(id: string): Promise<PayrollGroupResponse> {
    try {
      return await httpClient.getUnwrapped<PayrollGroupResponse>(
        `${ENDPOINT}/${id}`,
      );
    } catch {
      const match = MOCK_PAYROLL_GROUPS.find((item) => item.id === id);
      if (match) return match;
      throw new Error(`Payroll group ${id} not found`);
    }
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
