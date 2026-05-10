// Raw Attendance Log - Vertical display
// Columns: BioId, Employee, Time Log
export interface RawAttendanceLog {
  id: string;
  bioId: string;
  employeeNo: string;
  employeeName: string;
  timeLog: string;
  logType: "IN" | "OUT";
  logDateTime: string;
}

// Raw Columnar Attendance Log - Horizontal display per employee
// Columns: BioId, Employee, Department, Payroll Date, Time Shift Info, Logs[1-20]
export interface TimeShiftInfo {
  shiftName: string;
  shiftStart: string;
  breakOut: string;
  breakIn: string;
  shiftEnd: string;
}

export interface RawColumnarAttendanceLog {
  id: string;
  bioId: string;
  employeeNo: string;
  employeeName: string;
  department: string;
  payrollDate: string;
  timeShiftInfo: TimeShiftInfo;
  logs: string[]; // Up to 20 logs
}

// Clean Attendance Log (Row) - Cleaned version with additional information
// Columns: Emp No, Employee name, Department, Payroll Date, Time Shift Info, Logs[1]
export interface CleanAttendanceLogRow {
  id: string;
  employeeNo: string;
  employeeName: string;
  department: string;
  payrollDate: string;
  timeShiftInfo: TimeShiftInfo;
  log: string; // Single log entry
  status: "COMPLETE" | "INCOMPLETE" | "FLAGGED";
}

// Clean Attendance Log (Columnar) - Cleaned version, columnar format
export interface CleanAttendanceLogColumnar {
  id: string;
  employeeNo: string;
  employeeName: string;
  department: string;
  payrollDate: string;
  timeShiftInfo: TimeShiftInfo;
  logs: string[]; // Multiple log entries
  status: "COMPLETE" | "INCOMPLETE" | "FLAGGED";
}

// Filter parameters
export interface RawLogsFilterRequest {
  fromDate?: string;
  toDate?: string;
  clientId?: string;
  employeeId?: string;
}

// Generic response wrapper
export interface RawLogsResponse {
  rawAttendanceLogs: RawAttendanceLog[];
  rawColumnarLogs: RawColumnarAttendanceLog[];
  cleanRowLogs: CleanAttendanceLogRow[];
  cleanColumnarLogs: CleanAttendanceLogColumnar[];
}
