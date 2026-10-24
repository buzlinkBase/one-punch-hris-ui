export interface PayrollRunRequest {
  // Cutoff mode (the Payroll Run screen): every approved, not-yet-paid DTR day of the payroll
  // group's employees in the date range, whichever DTR batch or client it came from.
  fromDate?: string | null;
  toDate?: string | null;
  payrollGroupId?: string | null;
  // Optional narrowing to specific employees within the group.
  employeeIds?: string[];
  // Narrow the group by the employee's own client / department tags (not the DTR's).
  clientIds?: string[];
  departmentIds?: string[];
  // Employees this run must / must not take deductions for, whatever the company's "which payroll
  // run takes the deductions" rule would decide. A skip beats a carry; neither can override a
  // cutoff another run has already taken.
  carryDeductionEmployeeIds?: string[];
  skipDeductionEmployeeIds?: string[];
  // Legacy batch mode — only used when no cutoff fields are sent.
  batchCodes?: string[];
  payDate?: string | null;
  // Free-text identity for this run, captured via the Generate Payroll confirmation dialog
  // and stamped onto every Payroll row it produces — shown later in Payroll Summary's
  // Post / Delete Payroll Run modal.
  remarks?: string | null;
}
