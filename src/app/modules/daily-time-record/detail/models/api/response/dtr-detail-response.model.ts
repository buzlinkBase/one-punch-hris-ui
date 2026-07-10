export interface DtrDetailResponse {
  fullName: string;
  employeeId: string;
  bioId: number;
  departmentId: string | null;
  payrollGroupId: string | null;
  clientId: string | null;
  attStatus: string;
  recordStatus: string;
  workType: string;
  workTypeEnum: string;
  absent: number;
  ob: number;
  holCount: number;
  spCount: number;
  shiftWorkingHour: number;
  workDate: string;
  shiftName: string;
  shiftStartTime: string;
  shiftEndTime: string;
  startTime: string | null;
  endTime: string | null;
  // Day counts
  lhHolidayTotalDays: number;
  spHolidayTotalDays: number;
  regularWorkingDays: number;
  regularNDDays: number;
  regularOTDays: number;
  regularNDOTDays: number;
  restDayDays: number;
  restDayNDDays: number;
  restDayOTDays: number;
  restDayNDODays: number;
  // Minutes – summary
  lateMinutes: number;
  utMinutes: number;
  overBreakMinutes: number;
  otMinutes: number;
  nd: number;
  ndot: number;
  lh: number;
  sp: number;
  leaveMinutes: number;
  // Minutes – legal holiday
  legalHolOTMinutes: number;
  legalHolNightDiffMinutes: number;
  legalHolNightDiffOTMinutes: number;
  // Minutes – special holiday
  specialHolOTMinutes: number;
  specialHolNightDiffMinutes: number;
  specialHolNightDiffOTMinutes: number;
  // Minutes – reg/rest day
  regDayMinutes: number;
  regDayNDMinutes: number;
  regDayOTMinutes: number;
  regDayNDOMinutes: number;
  restDayMinutes: number;
  restDayNDMinutes: number;
  restDayOTMinutes: number;
  restDayNDOMinutes: number;
  // Hours – late/break
  lateHours: number;
  overBreakHours: number;
  lateForOTHours: number;
  // Hours – regular
  regularNetHours: number;
  regularOTHours: number;
  regularNDHours: number;
  regularNDOTHours: number;
  // Hours – rest day
  restDayHours: number;
  restDayOTHours: number;
  restDayNDHours: number;
  restDayNDOTHours: number;
  // Hours – legal holiday
  legalHolHours: number;
  legalHolOTHours: number;
  legalHolNightDiffHours: number;
  legalHolNightDiffOTHours: number;
  // Hours – special holiday
  specialHolHours: number;
  specialHolOTHours: number;
  specialHolNightDiffHours: number;
  specialHolNightDiffOTHours: number;
  // Hours – rest + legal/special
  restLegalDayHours: number;
  restLegalDayOTHours: number;
  restLegalDayNDHours: number;
  restLegalDayNDOTHours: number;
  restSpecialDayHours: number;
  restSpecialDayOTHours: number;
  restSpecialDayNDHours: number;
  restSpecialDayNDOTHours: number;
}
