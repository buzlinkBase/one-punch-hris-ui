export interface CreateLeaveApplication {
  employeeId: string;
  leaveId: string;
  leaveDateFrom: string;
  leaveDateTo: string;
  dayType: string;
  applicationRemarks?: string;
}
