export interface CreateOtherIncomeSchedule {
  date: string;
  amount: number;
}

export interface CreateOtherIncomeApplication {
  employeeId: string;
  incomeId: string;
  encodeDate: string;
  startDate: string;
  endDate: string;
  frequencyOfPayment: string;
  amount: number;
  isProrated: boolean;
  remarks: string;
  schedule: CreateOtherIncomeSchedule[];
}
