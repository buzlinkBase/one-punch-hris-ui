export interface TimeShiftInfo {
  shiftName: string;
  shiftStart: string;
  breakOut: string;
  breakIn: string;
  shiftEnd: string;
}

export interface IncompletePunch {
  id: string;
  employeeNo: string;
  employeeName: string;
  department: string;
  payrollDate: string;
  timeShiftInfo: TimeShiftInfo;
  logs: string[]; // Up to 20 logs
  missingLogs: number; // Count of missing logs
  status: "MISSING_IN" | "MISSING_OUT" | "PARTIAL" | "MULTIPLE_GAPS";
}

export interface IncompletePunchesFilterRequest {
  fromDate?: string;
  toDate?: string;
  departmentId?: string;
  clientId?: string;
  employeeId?: string;
  payrollGroupId?: string;
}

export interface IncompletePunchesResponse {
  incompletePunches: IncompletePunch[];
  totalCount: number;
  filteredCount: number;
}
