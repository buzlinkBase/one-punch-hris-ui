export interface UpdateOtherIncomeSchedule {
  // Omitted for a row that isn't stored yet (e.g. after Generate Schedule).
  id?: string;
  date: string;
  amount: number;
}

export interface UpdateOtherIncomeApplication {
  id: string;
  employeeId: string;
  incomeId: string;
  encodeDate: string;
  startDate: string;
  endDate: string;
  frequencyOfPayment: string;
  amount: number;
  isProrated: boolean;
  remarks: string;
  schedule: UpdateOtherIncomeSchedule[];
}
