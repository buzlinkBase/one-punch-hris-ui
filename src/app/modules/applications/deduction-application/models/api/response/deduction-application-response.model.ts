export interface DeductionApplicationDetailResponse {
  id: string;
  date: string;
  principal: number;
  interest: number;
  amount: number;
  balance: number;
  notes: string;
}

export interface DeductionApplicationResponse {
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
  breakdown: DeductionApplicationDetailResponse[];
  approvalStatus?: string;
}
