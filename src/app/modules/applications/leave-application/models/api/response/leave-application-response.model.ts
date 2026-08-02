export interface LeaveApplicationResponse {
  id: string;
  employeeId: string;
  leaveId: string;
  leaveDateFrom: string;
  leaveDateTo: string;
  dayType: string;
  applicationRemarks?: string;
  approvalStatus: string;
  reviewedBy?: number;
  reviewedOn?: string;
}
