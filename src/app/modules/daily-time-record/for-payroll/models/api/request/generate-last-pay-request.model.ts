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
  // Cashes out the employee's current Retirement Fund balance -- non-taxable, added straight
  // to Net Pay (not Gross). See backend LastPayRunPayload.IncludeRetirementPayout.
  includeRetirementPayout?: boolean;
  // Pays back the cash bond collected so far -- non-taxable, added straight to Net Pay. See
  // backend LastPayRunPayload.IncludeCashBondRefund.
  includeCashBondRefund?: boolean;
  salaryAdjustmentIds?: string[];
  otherIncomeScheduleIds?: string[];
}
