export interface CreateLeaveApplication {
  employeeId: string;
  leaveId: string;
  leaveDateFrom: string;
  leaveDateTo: string;
  dayType: string;
  payType: string;
  applicationRemarks?: string;
}
