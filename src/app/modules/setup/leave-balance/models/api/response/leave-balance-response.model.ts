export interface LeaveBalanceResponse {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  leaveId: string;
  leaveCode: string;
  leaveDescription: string;
  periodYear: number;
  granted: number;
  used: number;
  balance: number;
  reserved: number;
  availableToFile: number;
}

export interface AdjustLeaveBalanceResponse {
  id: string;
  balance: number;
  granted: number;
  used: number;
}
