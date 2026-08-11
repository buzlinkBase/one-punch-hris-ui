export interface CreateUndertimeApplication {
  employeeId: string;
  payrollDate: string;
  utMinutes: number;
  remarks: string;
  approvalStatus?: string;
}
