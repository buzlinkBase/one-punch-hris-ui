import type { OtherIncomeRuleFields } from "./create-other-income-application.model";

export interface UpdateOtherIncomeSchedule {
  // Omitted for a row that isn't stored yet (e.g. after Generate Schedule).
  id?: string;
  date: string;
  amount: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface UpdateOtherIncomeApplication extends OtherIncomeRuleFields {
  id: string;
  employeeId: string;
  incomeId: string;
  encodeDate: string;
  startDate: string;
  endDate: string;
  frequencyOfPayment: string;
  amount: number;
  remarks: string;
  schedule: UpdateOtherIncomeSchedule[];
}
