export interface CreateDeductionApplicationDetail {
  date: string;
  principal: number;
  interest: number;
  amount: number;
}

export interface CreateDeductionApplication {
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
  breakdown: CreateDeductionApplicationDetail[];
}
