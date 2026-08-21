export interface SalaryAdjustmentResponse {
  id: string;
  adjustmentType: number;
  employeeId: string;
  payrollDate: string;
  amount: number;
  remarks?: string;
}
