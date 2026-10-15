export interface DeductionApplicationDetailResponse {
  id: string;
  date: string;
  principal: number;
  interest: number;
  amount: number;
  balance: number;
  status: string;
  recordOrder: number;
  notes: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  // Set by payroll when the row failed its attendance rule: skipped = never charged,
  // deferred = held out of that run and charged by the next.
  isSkipped?: boolean;
  isDeferred?: boolean;
  skipReason?: string | null;
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
  payMode?: string;
  attendanceBasis?: string;
  minHours?: number | null;
  maxLateMinutes?: number | null;
  maxUndertimeMinutes?: number | null;
  applicableDays?: number;
  dayTypes?: number;
  minQualifyingDays?: number | null;
  onMiss?: string;
}
