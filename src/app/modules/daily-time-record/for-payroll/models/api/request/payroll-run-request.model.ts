export interface PayrollRunRequest {
  batchCodes: string[];
  payDate?: string | null;
  // Free-text identity for this run, captured via the Generate Payroll confirmation dialog
  // and stamped onto every Payroll row it produces — shown later in Payroll Summary's
  // Post / Delete Payroll Run modal.
  remarks?: string | null;
}
