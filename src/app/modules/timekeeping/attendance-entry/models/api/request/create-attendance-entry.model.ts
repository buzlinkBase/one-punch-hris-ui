export interface CreateAttendanceEntry {
  workTime: string;
  employeeId: string;
  // Required — why this punch is being manually entered instead of coming from a device.
  remarks: string;
  // Where the punch happened; left out = the employee's own branch/client/area/department.
  branchId?: string | null;
  clientId?: string | null;
  operationAreaId?: string | null;
  departmentId?: string | null;
}
