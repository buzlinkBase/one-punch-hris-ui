export interface CompanyPolicyResponse {
  otInclusionPolicy: string;
  otEligibility: string;
  isHalfDayLateOn: boolean;
  isWholeDayLateOn: boolean;
  halfDayLateThresholdMinutes: number;
  wholeDayLateThresholdMinutes: number;
  nightDiffThreshold: number;
  attFillLimit: string;
  holidayTimeBasis: string;
  isHolPlusReg: boolean;
  timeInAllowance: number;
  doublePunchGap: number;
  checkAfterHoliday: boolean;
  waivePriorDayRequirement: boolean;
  crossMonthStatutoryCreditPolicy: string;
  wTaxCrossMonthCreditPolicy: string;
  treatNdotAsNdOnly: boolean;
}
