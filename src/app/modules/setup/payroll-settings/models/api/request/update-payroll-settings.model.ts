export interface UpdatePayrollSettings {
  id?: string;
  fiscalYearStartMonth: number;
  thirteenthMonthExemptionCeiling: number;
  largeTaxCollectionWarningMultiplier: number;
  portalShowThirteenthMonth: boolean;
  portalShowCashBond: boolean;
  portalShowUniformAllowance: boolean;
}
