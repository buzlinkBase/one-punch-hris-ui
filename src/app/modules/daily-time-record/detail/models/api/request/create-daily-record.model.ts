export interface CreateDailyRecord {
  WorkType: string;
  FullName: string;
  EmployeeId: string;
  empCode: string;
  BioId: number;
  WorkDate: string;
  ShiftName: string;
  ShiftStartTime: string;
  ShiftEndTime: string;
  StartTime: string | null;
  EndTime: string | null;
  // Days – holiday
  LHHolidayTotalDays: number;
  SPHolidayTotalDays: number;
  OTOnSpecialHolidayDays: number;
  OTOnLegalHolidayDays: number;
  // Days
  RegularWorkingDays: number;
  RegularNDDays: number;
  RegularOTDays: number;
  RegularNDOTDays: number;
  RestDayDays: number;
  RestDayNDDays: number;
  RestDayOTDays: number;
  RestDayNDODays: number;
  // Minutes – holiday OT
  OTOnSpecialHolidayMinutes: number;
  OTOnLegalHolidayMinutes: number;
  // Minutes – summary
  LateMinutes: number;
  UTMinutes: number;
  OverBreakMinutes: number;
  OTMinutes: number;
  ND: number;
  NDOT: number;
  SP: number;
  LH: number;
  // Minutes – reg/rest day
  RegDayMinutes: number;
  RegDayNDMinutes: number;
  RegDayOTMinutes: number;
  RegDayNDOMinutes: number;
  RestDayMinutes: number;
  RestDayNDMinutes: number;
  RestDayOTMinutes: number;
  RestDayNDOMinutes: number;
  // Hours – late/break
  LateHours: number;
  OverBreakHours: number;
  LateForOTHours: number;
  // Hours – regular
  RegularNetHours: number;
  RegularOTHours: number;
  RegularNDHours: number;
  RegularNDOTHours: number;
  // Hours – rest day
  RestDayHours: number;
  RestDayOTHours: number;
  RestDayNDHours: number;
  RestDayNDOTHours: number;
  // Hours – legal holiday
  LegalHolHours: number;
  LegalHolOTHours: number;
  LegalHolNightDiffHours: number;
  LegalHolNightDiffOTHours: number;
  // Hours – special holiday
  SpecialHolHours: number;
  SpecialHolOTHours: number;
  SpecialHolNightDiffHours: number;
  SpecialHolNightDiffOTHours: number;
  // Hours – rest + legal/special
  RestLegalDayHours: number;
  RestLegalDayOTHours: number;
  RestLegalDayNDHours: number;
  RestLegalDayNDOTHours: number;
  RestSpecialDayHours: number;
  RestSpecialDayOTHours: number;
  RestSpecialDayNDHours: number;
  RestSpecialDayNDOTHours: number;
  // Misc
  RawOTHours: number;
  LeaveMinutes: number;
  OB: number;
  Absent: number;
  Note: string;
  RecordStatus: string;
  HolCount: number;
  SPCount: number;
  ShiftWorkingHour: number;
  ClientId: string | null;
  BranchId: string | null;
  PayrollGroupId: string | null;
  DepartmentId: string | null;
}
