export interface LeaveApplicationResponse {
  id: string;
  employeeId: string;
  leaveId: string;
  leaveDateFrom: string;
  leaveDateTo: string;
  dayType: string;
  payType: string;
  applicationRemarks?: string;
  approvalStatus: string;
  reviewedBy?: number;
  reviewedOn?: string;
  createdAt?: string;
}
