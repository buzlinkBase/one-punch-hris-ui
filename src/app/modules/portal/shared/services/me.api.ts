import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { EmployeeFullResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { PayrollRunResponse } from "@/app/modules/daily-time-record/for-payroll/models/api/response/payroll-run-result.model";
import type { DtrDetailResponse } from "@/app/modules/daily-time-record/detail/models/api/response/dtr-detail-response.model";
import type { CleanAttendanceLogColumnar } from "@/app/modules/timekeeping/raw-logs/models/api/response/raw-attendance-log.model";
import type { EmployeeFixedScheduleResponse } from "@/app/modules/change-schedule/fixed-schedule/models/api/response/employee-fixed-schedule-response.model";

const BASE_URL = buildApiUrl(API_PREFIX.hrms, "me");

export const meApi = {
  /** 404s when the logged-in user has no linked Employee record — silenced, not an error. */
  async getMyEmployee(): Promise<EmployeeFullResponse | null> {
    try {
      return await httpClient.getUnwrapped<EmployeeFullResponse>(
        `${BASE_URL}/employee`,
        { _skipErrorNotification: true },
      );
    } catch {
      return null;
    }
  },

  getMyPayrolls(params: {
    from: string;
    to: string;
  }): Promise<PayrollRunResponse> {
    return httpClient.getUnwrapped<PayrollRunResponse>(`${BASE_URL}/payrolls`, {
      params,
    });
  },

  getMyDtrDetail(params: {
    from: string;
    to: string;
  }): Promise<DtrDetailResponse[]> {
    return httpClient.getUnwrapped<DtrDetailResponse[]>(
      `${BASE_URL}/dtr-detail`,
      { params },
    );
  },

  getMyIncompletePunches(params: {
    from: string;
    to: string;
  }): Promise<CleanAttendanceLogColumnar[]> {
    return httpClient.getUnwrapped<CleanAttendanceLogColumnar[]>(
      `${BASE_URL}/incomplete-punches`,
      { params },
    );
  },

  async getMyFixedSchedule(): Promise<EmployeeFixedScheduleResponse[]> {
    try {
      return await httpClient.getUnwrapped<EmployeeFixedScheduleResponse[]>(
        `${BASE_URL}/fixed-schedule`,
        { _skipErrorNotification: true },
      );
    } catch {
      return [];
    }
  },
};
