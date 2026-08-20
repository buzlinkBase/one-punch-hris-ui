export interface CreateSalaryAdjustment {
  adjustmentType: number;
  employeeId: string;
  payrollDate: string;
  amount: number;
  remarks?: string;
}

export interface UpdateSalaryAdjustment extends CreateSalaryAdjustment {
  id: string;
}
