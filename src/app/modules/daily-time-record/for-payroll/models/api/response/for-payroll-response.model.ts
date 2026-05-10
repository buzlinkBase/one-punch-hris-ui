export interface ForPayrollResponse {
  id: string;
  bioId: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  clientId: string;
  payrollGroupId: string;
  late: number;
  underTime: number;
  regNet: number;
  netOvertime: number;
  nd: number;
  ndOt: number;
  restDayNet: number;
  restDayOt: number;
  rdNd: number;
  rdNdOt: number;
  lh: number;
  lhOt: number;
  lhNd: number;
  lhNdOt: number;
  sph: number;
  sphOt: number;
  sphNd: number;
  sphNdOt: number;
}
