export interface PayrollSettingsResponse {
  id?: string;
  fiscalYearStartMonth: number;
  thirteenthMonthExemptionCeiling: number;
  // Year-End Tax Annualization: warn (never block) when a computed collection exceeds this
  // multiple of the employee's average monthly net pay for the year. Default 1.0.
  largeTaxCollectionWarningMultiplier: number;
  // Employee Portal (My Portal) pages; on unless the company switched them off.
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
}
