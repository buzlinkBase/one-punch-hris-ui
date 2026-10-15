export interface CreateOtherIncomeSchedule {
  date: string;
  amount: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface OtherIncomeRuleFields {
  payMode: string;
  attendanceBasis: string;
  minHours: number | null;
  maxLateMinutes: number | null;
  maxUndertimeMinutes: number | null;
  // Bit masks: weekdays Mon = 1 ... Sun = 64; day types regular 1, rest day 2, legal 4, special 8.
  applicableDays: number;
  dayTypes: number;
  minQualifyingDays: number | null;
}

export interface CreateOtherIncomeApplication extends OtherIncomeRuleFields {
  employeeId: string;
  incomeId: string;
  encodeDate: string;
  startDate: string;
  endDate: string;
  frequencyOfPayment: string;
  amount: number;
  remarks: string;
  schedule: CreateOtherIncomeSchedule[];
}
