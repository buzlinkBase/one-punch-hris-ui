export interface DtrDetailResponse {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  clientId: string;
  payrollGroupId: string;
  workType: string;
  dtrDate: string;
  timeShift: string;
  start: string;
  end: string;
  // Minutes – Late/Over Break
  minutesLate: number;
  minutesUt: number;
  minutesOver: number;
  minutesOt: number;
  minutesNd: number;
  minutesNdOt: number;
  // Minutes – Holiday
  minutesLh: number;
  minutesSp: number;
  // Hours – Regular
  hoursRegNet: number;
  hoursNetOt: number;
  hoursNdOt: number;
  // Hours – Rest Day
  hoursRdNet: number;
  hoursRdOt: number;
  hoursRdNd: number;
  hoursRdNdOt: number;
  // Hours – Legal Holiday
  hoursLh: number;
  hoursLhOt: number;
  hoursLhNd: number;
  hoursLhNdOt: number;
  // Hours – Special Holiday
  hoursSph: number;
  hoursSphNd: number;
  hoursSphNdOt: number;
  // Total
  total: number;
}
