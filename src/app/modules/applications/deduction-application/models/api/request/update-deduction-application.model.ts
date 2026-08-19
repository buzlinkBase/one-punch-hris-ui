export interface UpdateDeductionApplicationDetail {
  id: string;
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
