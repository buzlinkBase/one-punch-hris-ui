export interface GenerateLastPayRequest {
  // Required, unlike GenerateThirteenthMonthRequest's optional employeeIds — Last Pay is
  // never run "for everyone", only for specific separated employees being settled.
  employeeIds: string[];
  payDate?: string | null;
  remarks?: string | null;
  // Selectable components — all default true/empty on the backend (LastPayRunPayload) so
  // omitting them preserves the original "include everything" behavior.
  includeThirteenthMonth?: boolean;
  includeLeaveConversion?: boolean;
  salaryAdjustmentIds?: string[];
  otherIncomeScheduleIds?: string[];
}
