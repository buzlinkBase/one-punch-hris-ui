export interface RawAttendanceLog {
  id: string;
  employeeId: string | null;
  name: string | null;
  workDateTime: string;
  batch: string;
  logSource: string;
}

export interface TimeShiftInfo {
  shiftName: string;
  shiftStart: string;
  breakOut: string;
  breakIn: string;
  shiftEnd: string;
}

export interface AttInfo {
  attId: string;
  workTime: string;
}

export interface RawColumnarAttendanceLog {
  employeeId: string;
  clientId: string | null;
  payrollGroupId: string | null;
  departmentId: string | null;
  empNo: string;
  fullName: string;
  department: string;
  workDate: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  breakOut: string | null;
  breakIn: string | null;
  log1: AttInfo | null;
  log2: AttInfo | null;
  log3: AttInfo | null;
  log4: AttInfo | null;
  log5: AttInfo | null;
  log6: AttInfo | null;
  log7: AttInfo | null;
  log8: AttInfo | null;
  log9: AttInfo | null;
  log10: AttInfo | null;
  log11: AttInfo | null;
  log12: AttInfo | null;
  log13: AttInfo | null;
  log14: AttInfo | null;
  log15: AttInfo | null;
  log16: AttInfo | null;
  log17: AttInfo | null;
  log18: AttInfo | null;
  log19: AttInfo | null;
  log20: AttInfo | null;
}

export interface CleanAttendanceLogRow {
  employeeId: string;
  empNo: string;
  fullName: string;
  department: string;
  workDate: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  breakOut: string | null;
  breakIn: string | null;
  log1: AttInfo | null;
}

export type CleanAttendanceLogColumnar = RawColumnarAttendanceLog;

export interface RawLogsFilterRequest {
  fromDate?: string;
  toDate?: string;
  employeeId?: string;
  branchId?: string;
  departmentId?: string;
  clientId?: string;
  payrollGroupId?: string;
  operationAreaId?: string;
}
