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

/** One employee's leave type in a "Recompute from DTR" preview/result, summed across batches.
 * delta > 0: more days get charged; delta < 0: days are given back. */
export interface DtrReconcileLine {
  employeeId: string;
  employeeNo: string;
  fullName: string;
  leaveId: string;
  leaveCode: string;
  leaveDescription: string;
  currentDays: number;
  correctDays: number;
  delta: number;
}

export interface AdjustLeaveBalanceResponse {
  id: string;
  balance: number;
  granted: number;
  used: number;
}
