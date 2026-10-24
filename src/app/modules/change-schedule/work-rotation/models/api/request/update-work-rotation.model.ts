export interface UpdateWorkRotation {
  id: string;
  employeeId: string;
  timeShiftId: string;
  payrollDate: string;
  // Project site the employee reports to that day; null = their own site.
  operationAreaId?: string | null;
  clientId?: string | null;
}
