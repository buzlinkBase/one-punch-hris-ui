export interface DtrSummaryResponse {
  id: string;
  bioId: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  clientId: string;
  payrollGroupId: string;
  // Time shift
  timeShift: string;
  start: string;
  end: string;
  // Attendance / raw hours
  late: number;
  underTime: number;
  over: number;
  ot: number;
  overOt: number;
  nd: number;
  ndOt: number;
  lhHours: number;
  spHours: number;
  days: number;
  // Rest-day hours
  rnd: number;
  rot: number;
  rndo: number;
  restDay: number;
  rdNd: number;
  rdOt: number;
  rdNdo: number;
  // Used / net hours
  lhUsed: number;
  spUsed: number;
  // Net amounts
  regNet: number;
  netOt: number;
  ndNet: number;
  ndOtNet: number;
  rdNet: number;
  rdOtNet: number;
  rdNdOt: number;
  lh: number;
  lhOt: number;
  lhNd: number;
  lhNdOt: number;
  sph: number;
  sphOt: number;
  sphNd: number;
  sphNdOt: number;
  rawOt: number;
  appliedOt: number;
  abs: number;
  total: number;
}
