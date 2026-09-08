export interface TaxAnnualizationRunRequest {
  year: number;
  // Both null/empty = every employee with a computable, non-zero adjustment for the year.
  payrollGroupIds?: string[];
  employeeIds?: string[];
  payDate?: string | null;
  remarks?: string | null;
}
