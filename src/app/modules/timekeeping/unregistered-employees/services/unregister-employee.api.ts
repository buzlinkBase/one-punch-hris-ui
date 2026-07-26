import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { UnregisterEmployeeFilter } from "../models/api/request/unregister-employee-filter.model";
import type { UnregisteredAttendanceLog } from "../models/api/response/unregister-employee-response.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attendance/unregistered");
const TAG_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "attendance/tag");

export const unregisterEmployeeApi = {
  async getAll(
    filter: UnregisterEmployeeFilter = {},
  ): Promise<UnregisteredAttendanceLog[]> {
    const params: Record<string, string> = {};
    if (filter.fromDate) params.fromDate = filter.fromDate;
    if (filter.toDate) params.toDate = filter.toDate;

    return httpClient.getUnwrapped<UnregisteredAttendanceLog[]>(ENDPOINT, {
      params,
    });
  },

  tag(employeeId: string, attId: string): Promise<void> {
    return httpClient.getUnwrapped<void>(TAG_ENDPOINT, {
      params: { employeeId, attId },
    });
  },
};
