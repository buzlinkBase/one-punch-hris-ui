export interface PayrollSettingsResponse {
  id?: string;
  fiscalYearStartMonth: number;
  thirteenthMonthExemptionCeiling: number;
  // Year-End Tax Annualization: warn (never block) when a computed collection exceeds this
  // multiple of the employee's average monthly net pay for the year. Default 1.0.
  largeTaxCollectionWarningMultiplier: number;
}
