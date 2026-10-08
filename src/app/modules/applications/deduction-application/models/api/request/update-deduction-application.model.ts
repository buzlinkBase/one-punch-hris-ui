export interface UpdateDeductionApplicationDetail {
  // Omitted for an installment that isn't stored yet (e.g. after regenerating the schedule).
  id?: string;
  date: string;
  principal: number;
  interest: number;
  amount: number;
}

export interface UpdateDeductionApplication {
  id: string;
  employeeId: string;
  deductionId: string;
  encodeDate: string;
  startDate: string;
  endDate: string;
  frequencyOfPayment: string;
  terms: number;
  totalPrincipal: number;
  interestRate: number;
  totalAmount: number;
  note: string;
  remarks: string;
  details: UpdateDeductionApplicationDetail[];
}
