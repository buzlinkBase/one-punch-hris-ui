export interface GenerateLastPayRequest {
  // Required, unlike GenerateThirteenthMonthRequest's optional employeeIds — Last Pay is
  // never run "for everyone", only for specific separated employees being settled.
  employeeIds: string[];
  payDate?: string | null;
  remarks?: string | null;
}
