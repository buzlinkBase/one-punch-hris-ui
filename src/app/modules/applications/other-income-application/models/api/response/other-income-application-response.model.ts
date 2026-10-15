export interface OtherIncomeScheduleResponse {
  id: string;
  date: string;
  amount: number;
  notes: string;
  periodStart?: string | null;
  periodEnd?: string | null;
  // Set by payroll: a skipped row wasn't paid because the attendance rule wasn't met.
  isSkipped: boolean;
  skipReason?: string | null;
  consumedByPayrollId?: string | null;
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
  isTaxable: boolean;
  remarks: string;
  payMode: string;
  attendanceBasis: string;
  minHours?: number | null;
  maxLateMinutes?: number | null;
  maxUndertimeMinutes?: number | null;
  applicableDays: number;
  dayTypes: number;
  minQualifyingDays?: number | null;
  schedule: OtherIncomeScheduleResponse[];
}
