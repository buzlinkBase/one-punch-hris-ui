export interface CreateWorkRotation {
  employeeIds: string[];
  timeShiftId: string;
  payrollDates: string[];
  operationAreaId?: string | null;
}
