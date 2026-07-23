import httpClient from "@/core/http/http-client";
import { API_PREFIX, buildApiUrl } from "@/core/http/api-url.util";
import type { DtrDetailResponse } from "../models/api/response/dtr-detail-response.model";
import type { DtrDetailFilter } from "../models/api/request/dtr-detail-filter.model";
import type { CreateDailyRecord } from "../models/api/request/create-daily-record.model";

const ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords/dtr-detail");
const SAVE_ENDPOINT = buildApiUrl(API_PREFIX.hrms, "dailyrecords");

function buildParams(filter: DtrDetailFilter): Record<string, string> {
  const p: Record<string, string> = {};
  if (filter.fromDate) p.fromDate = filter.fromDate;
  if (filter.toDate) p.toDate = filter.toDate;
  if (filter.branchId) p.branchId = filter.branchId;
  if (filter.departmentId) p.departmentId = filter.departmentId;
  if (filter.clientId) p.clientId = filter.clientId;
  if (filter.employeeId) p.employeeId = filter.employeeId;
  if (filter.payrollGroupId) p.payrollGroupId = filter.payrollGroupId;
  if (filter.operationAreaId) p.operationAreaId = filter.operationAreaId;
  return p;
}

export const dtrDetailApi = {
  async getAll(filter: DtrDetailFilter = {}): Promise<DtrDetailResponse[]> {
    try {
      return await httpClient.getUnwrapped<DtrDetailResponse[]>(ENDPOINT, {
        params: buildParams(filter),
      });
    } catch {
      return [];
    }
  },

  save(records: DtrDetailResponse[]): Promise<void> {
    const payload: CreateDailyRecord[] = records.map((r) => ({
      WorkType: r.workType,
      FullName: r.fullName,
      EmployeeId: r.employeeId,
      empCode: "",
      BioId: r.bioId,
      WorkDate: r.workDate,
      ShiftName: r.shiftName,
      ShiftStartTime: r.shiftStartTime,
      ShiftEndTime: r.shiftEndTime,
      StartTime: r.startTime ?? null,
      EndTime: r.endTime ?? null,
      // Days – holiday
      LHHolidayTotalDays: r.lhHolidayTotalDays,
      SPHolidayTotalDays: r.spHolidayTotalDays,
      OTOnSpecialHolidayDays: 0,
      OTOnLegalHolidayDays: 0,
      // Days
      RegularWorkingDays: r.regularWorkingDays,
      RegularNDDays: r.regularNDDays,
      RegularOTDays: r.regularOTDays,
      RegularNDOTDays: r.regularNDOTDays,
      RestDayDays: r.restDayDays,
      RestDayNDDays: r.restDayNDDays,
      RestDayOTDays: r.restDayOTDays,
      RestDayNDODays: r.restDayNDODays,
      // Minutes – holiday OT
      OTOnSpecialHolidayMinutes: r.specialHolOTMinutes,
      OTOnLegalHolidayMinutes: r.legalHolOTMinutes,
      // Minutes – summary
      LateMinutes: r.lateMinutes,
      UTMinutes: r.utMinutes,
      OverBreakMinutes: r.overBreakMinutes,
      OTMinutes: r.otMinutes,
      ND: r.nd,
      NDOT: r.ndot,
      SP: r.sp,
      LH: r.lh,
      // Minutes – reg/rest day
      RegDayMinutes: r.regDayMinutes,
      RegDayNDMinutes: r.regDayNDMinutes,
      RegDayOTMinutes: r.regDayOTMinutes,
      RegDayNDOMinutes: r.regDayNDOMinutes,
      RestDayMinutes: r.restDayMinutes,
      RestDayNDMinutes: r.restDayNDMinutes,
      RestDayOTMinutes: r.restDayOTMinutes,
      RestDayNDOMinutes: r.restDayNDOMinutes,
      // Hours – late/break
      LateHours: r.lateHours,
      OverBreakHours: r.overBreakHours,
      LateForOTHours: r.lateForOTHours,
      // Hours – regular
      RegularNetHours: r.regularNetHours,
      RegularOTHours: r.regularOTHours,
      RegularNDHours: r.regularNDHours,
      RegularNDOTHours: r.regularNDOTHours,
      // Hours – rest day
      RestDayHours: r.restDayHours,
      RestDayOTHours: r.restDayOTHours,
      RestDayNDHours: r.restDayNDHours,
      RestDayNDOTHours: r.restDayNDOTHours,
      // Hours – legal holiday
      LegalHolHours: r.legalHolHours,
      LegalHolOTHours: r.legalHolOTHours,
      LegalHolNightDiffHours: r.legalHolNightDiffHours,
      LegalHolNightDiffOTHours: r.legalHolNightDiffOTHours,
      // Hours – special holiday
      SpecialHolHours: r.specialHolHours,
      SpecialHolOTHours: r.specialHolOTHours,
      SpecialHolNightDiffHours: r.specialHolNightDiffHours,
      SpecialHolNightDiffOTHours: r.specialHolNightDiffOTHours,
      // Hours – rest + legal/special
      RestLegalDayHours: r.restLegalDayHours,
      RestLegalDayOTHours: r.restLegalDayOTHours,
      RestLegalDayNDHours: r.restLegalDayNDHours,
      RestLegalDayNDOTHours: r.restLegalDayNDOTHours,
      RestSpecialDayHours: r.restSpecialDayHours,
      RestSpecialDayOTHours: r.restSpecialDayOTHours,
      RestSpecialDayNDHours: r.restSpecialDayNDHours,
      RestSpecialDayNDOTHours: r.restSpecialDayNDOTHours,
      // Misc
      RawOTHours: 0,
      LeaveMinutes: r.leaveMinutes,
      OB: r.ob,
      Absent: r.absent,
      Note: "",
      RecordStatus: r.recordStatus,
      HolCount: r.holCount,
      SPCount: r.spCount,
      ShiftWorkingHour: r.shiftWorkingHour,
      ClientId: r.clientId ?? null,
      BranchId: null,
      PayrollGroupId: r.payrollGroupId ?? null,
      DepartmentId: r.departmentId ?? null,
    }));
    return httpClient.post<void>(SAVE_ENDPOINT, payload);
  },
};
