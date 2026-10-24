export interface CreateWorkRotation {
  employeeIds: string[];
  timeShiftId: string;
  payrollDates: string[];
  operationAreaId?: string | null;
  // Client picked directly on the day (wins over the site's client); null = none.
  clientId?: string | null;
}
