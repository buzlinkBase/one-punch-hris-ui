export interface EmployeeFilter {
  departmentId?: string | null;
  payrollGroupId?: string | null;
  clientId?: string | null;
  branchId?: string | null;
  operationAreaId?: string | null;
  dayName?: number | null;
  // Direct reports of this employee (Employee.ManagerId) — e.g. a Supervisor's own scoped
  // Work Rotation picker (see work-rotation-detail.tsx).
  managerId?: string | null;
}
