import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { EmployeeFullResponse } from "@/app/modules/setup/employee/models/api/response/employee-response.model";
import type { PayrollRunResponse } from "@/app/modules/daily-time-record/for-payroll/models/api/response/payroll-run-result.model";
import type { DtrDetailResponse } from "@/app/modules/daily-time-record/detail/models/api/response/dtr-detail-response.model";
import type { CleanAttendanceLogColumnar } from "@/app/modules/timekeeping/raw-logs/models/api/response/raw-attendance-log.model";
import type { EmployeeFixedScheduleResponse } from "@/app/modules/change-schedule/fixed-schedule/models/api/response/employee-fixed-schedule-response.model";
import type { LeaveBalanceResponse } from "@/app/modules/setup/leave-balance/models/api/response/leave-balance-response.model";
import type { LeaveApplicationResponse } from "@/app/modules/applications/leave-application/models/api/response/leave-application-response.model";
import type { CreateLeaveApplication } from "@/app/modules/applications/leave-application/models/api/request/create-leave-application.model";
import type { CreateOvertimeApplication } from "@/app/modules/applications/overtime-application/models/api/request/create-overtime-application.model";
import type { OvertimeApplicationResponse } from "@/app/modules/applications/overtime-application/models/api/response/overtime-application-response.model";
import type { CreateTravelOrderApplication } from "@/app/modules/applications/travel-order-application/models/api/request/create-travel-order-application.model";
import type { TravelOrderApplicationResponse } from "@/app/modules/applications/travel-order-application/models/api/response/travel-order-application-response.model";
import type { PortalCreatePassSlip } from "../models/api/request/portal-create-pass-slip.model";
import type { PortalPassSlipResponse } from "../models/api/response/portal-pass-slip-response.model";
import type { PortalRequestChangeRestDay } from "../models/api/request/portal-request-change-rest-day.model";
import type { ChangeRestDayResponse } from "@/app/modules/change-schedule/change-rest-day/models/api/response/change-rest-day-response.model";
import type { CreateDeductionApplication } from "@/app/modules/applications/deduction-application/models/api/request/create-deduction-application.model";
import type { DeductionApplicationResponse } from "@/app/modules/applications/deduction-application/models/api/response/deduction-application-response.model";
import type { ThirteenthMonthResponse } from "@/app/modules/reports/payroll-reports/models/api/response/payroll-reports.model";

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

  getMyLeaveCredits(year?: number): Promise<LeaveBalanceResponse[]> {
    return httpClient.getUnwrapped<LeaveBalanceResponse[]>(
      `${BASE_URL}/leave-credits`,
      { params: year ? { year } : undefined },
    );
  },

  getMyLeaveApplications(): Promise<LeaveApplicationResponse[]> {
    return httpClient.getUnwrapped<LeaveApplicationResponse[]>(
      `${BASE_URL}/leave-applications`,
    );
  },

  createMyLeaveApplication(data: CreateLeaveApplication): Promise<void> {
    return httpClient.postUnwrapped<void>(
      `${BASE_URL}/leave-applications`,
      data,
    );
  },

  getMyOvertimeApplications(): Promise<OvertimeApplicationResponse[]> {
    return httpClient.getUnwrapped<OvertimeApplicationResponse[]>(
      `${BASE_URL}/overtime-applications`,
    );
  },

  createMyOvertimeApplication(data: CreateOvertimeApplication): Promise<void> {
    return httpClient.postUnwrapped<void>(
      `${BASE_URL}/overtime-applications`,
      data,
    );
  },

  getMyTravelOrderApplications(): Promise<TravelOrderApplicationResponse[]> {
    return httpClient.getUnwrapped<TravelOrderApplicationResponse[]>(
      `${BASE_URL}/travel-order-applications`,
    );
  },

  createMyTravelOrderApplication(
    data: CreateTravelOrderApplication,
  ): Promise<void> {
    return httpClient.postUnwrapped<void>(
      `${BASE_URL}/travel-order-applications`,
      data,
    );
  },

  getMyPassSlipApplications(): Promise<PortalPassSlipResponse[]> {
    return httpClient.getUnwrapped<PortalPassSlipResponse[]>(
      `${BASE_URL}/pass-slip-applications`,
    );
  },

  createMyPassSlipApplication(data: PortalCreatePassSlip): Promise<void> {
    return httpClient.postUnwrapped<void>(
      `${BASE_URL}/pass-slip-applications`,
      data,
    );
  },

  getMyChangeRestDayRequests(): Promise<ChangeRestDayResponse[]> {
    return httpClient.getUnwrapped<ChangeRestDayResponse[]>(
      `${BASE_URL}/change-rest-day`,
    );
  },

  createMyChangeRestDayRequest(
    data: PortalRequestChangeRestDay,
  ): Promise<void> {
    return httpClient.postUnwrapped<void>(`${BASE_URL}/change-rest-day`, data);
  },

  getMyLoanApplications(): Promise<DeductionApplicationResponse[]> {
    return httpClient.getUnwrapped<DeductionApplicationResponse[]>(
      `${BASE_URL}/loan-applications`,
    );
  },

  createMyLoanApplication(data: CreateDeductionApplication): Promise<void> {
    return httpClient.postUnwrapped<void>(
      `${BASE_URL}/loan-applications`,
      data,
    );
  },

  /** Returns null when there's no payroll history at all for that year yet. */
  getMy13thMonth(year: number): Promise<ThirteenthMonthResponse | null> {
    return httpClient.getUnwrapped<ThirteenthMonthResponse | null>(
      `${BASE_URL}/13th-month`,
      { params: { year } },
    );
  },
};
