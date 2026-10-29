/** Which My Portal pages the company switched on for the Employee Portal. */
export interface PortalVisibilityResponse {
  showThirteenthMonth: boolean;
  showCashBond: boolean;
  showUniformAllowance: boolean;
  showAnnouncements: boolean;
  showCoworkers: boolean;
  showDtr: boolean;
  showIncompletePunches: boolean;
  showRawAttendance: boolean;
  showShiftSchedule: boolean;
  showPayslips: boolean;
  showLeaveCredits: boolean;
  showDeductions: boolean;
  showLeaveApplications: boolean;
  showOvertime: boolean;
  showOfficialBusiness: boolean;
  showPassSlip: boolean;
  showLoanApplications: boolean;
  /** Opt-in: off until the company turns Punch In/Out on. */
  showPunch: boolean;
}

export type PortalVisibilityKey = keyof PortalVisibilityResponse;
