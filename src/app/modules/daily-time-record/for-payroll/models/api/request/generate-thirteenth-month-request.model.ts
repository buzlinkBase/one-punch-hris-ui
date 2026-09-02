export interface GenerateThirteenthMonthRequest {
  year: number;
  // Both null/empty = every employee eligible for 13th month pay (Employee Settings ->
  // "Eligible for 13th Month").
  payrollGroupIds?: string[];
  employeeIds?: string[];
  payDate?: string | null;
  remarks?: string | null;
}
