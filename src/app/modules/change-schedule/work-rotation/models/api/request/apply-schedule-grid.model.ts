// One cell of the Quick Schedule grid. A null timeShiftId clears that employee's day.
export interface ApplyScheduleGridEntry {
  employeeId: string;
  payrollDate: string;
  timeShiftId: string | null;
  operationAreaId?: string | null;
  clientId?: string | null;
}

export interface ApplyScheduleGrid {
  entries: ApplyScheduleGridEntry[];
}

export interface ScheduleGridFilter {
  fromDate: string;
  toDate: string;
  employeeIds?: string[];
}
