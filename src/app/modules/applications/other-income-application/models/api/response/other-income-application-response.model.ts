export interface OtherIncomeScheduleResponse {
  id: string;
  date: string;
  amount: number;
  notes: string;
}

export interface OtherIncomeApplicationResponse {
  id: string;
  employeeId: string;
  incomeId: string;
  encodeDate: string;
  startDate: string;
  endDate: string;
  frequencyOfPayment: string;
  amount: number;
  isProrated: boolean;
  isTaxable: boolean;
  remarks: string;
  schedule: OtherIncomeScheduleResponse[];
}
