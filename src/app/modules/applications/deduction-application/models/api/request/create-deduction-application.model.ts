export interface CreateDeductionApplicationDetail {
  date: string;
  principal: number;
  interest: number;
  amount: number;
  periodStart?: string;
  periodEnd?: string;
}

// The attendance rule. A fixed schedule sends payMode "FixedSchedule" and the neutral defaults.
export interface DeductionRuleFields {
  payMode: string;
  attendanceBasis: string;
  minHours: number | null;
  maxLateMinutes: number | null;
  maxUndertimeMinutes: number | null;
  // Bit masks: weekdays Mon = 1 ... Sun = 64; day types regular 1, rest day 2, legal 4, special 8.
  applicableDays: number;
  dayTypes: number;
  minQualifyingDays: number | null;
  // What happens to a day that doesn't qualify: "Skip" (never charged) or "Defer" (next payroll).
  onMiss: string;
}

export interface CreateDeductionApplication extends Partial<DeductionRuleFields> {
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
