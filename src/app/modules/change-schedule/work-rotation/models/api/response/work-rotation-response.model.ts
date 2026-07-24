export interface WorkRotationResponse {
  id: string;
  timeShiftId: string;
  employeeId: string;
  payrollDate: string;
  batchCode?: string;
  fullName?: string;
  shiftName?: string;
}
