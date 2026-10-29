export interface UpdatePayrollSettings {
  id?: string;
  fiscalYearStartMonth: number;
  thirteenthMonthExemptionCeiling: number;
  largeTaxCollectionWarningMultiplier: number;
  portalShowThirteenthMonth: boolean;
  portalShowCashBond: boolean;
  portalShowUniformAllowance: boolean;
  portalShowAnnouncements: boolean;
  portalShowCoworkers: boolean;
  portalShowDtr: boolean;
  portalShowIncompletePunches: boolean;
  portalShowRawAttendance: boolean;
  portalShowShiftSchedule: boolean;
  portalShowPayslips: boolean;
  portalShowLeaveCredits: boolean;
  portalShowDeductions: boolean;
  portalShowLeaveApplications: boolean;
  portalShowOvertime: boolean;
  portalShowOfficialBusiness: boolean;
  portalShowPassSlip: boolean;
  portalShowLoanApplications: boolean;
  portalShowPunch: boolean;
  portalPunchCooldownMinutes: number;
  mobilePunchModesEnabled: boolean;
}
