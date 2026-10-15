// Optional "which employees" scope for a payroll report. Every member is optional; a report applies
// only the ones that are set, so an empty scope means everyone.
export interface EmployeeScopeFilter {
  clientId?: string;
  areaId?: string;
  payrollGroupId?: string;
  departmentId?: string;
  branchId?: string;
}
