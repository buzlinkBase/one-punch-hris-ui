// Options shared by every attendance-based schedule (Other Income, Loans & Deductions). The bit
// values match the API's OtherIncomeWeekdays / OtherIncomeDayTypes masks.

export const ATTENDANCE_BASIS_OPTIONS = [
  { value: "Worked", label: "Worked (has punches / worked hours)" },
  { value: "WorkedOrPaidLeave", label: "Worked, or on paid leave" },
];

// Mon = 1 ... Sun = 64.
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 4, label: "Wed" },
  { value: 8, label: "Thu" },
  { value: 16, label: "Fri" },
  { value: 32, label: "Sat" },
  { value: 64, label: "Sun" },
];

export const DAY_TYPE_OPTIONS = [
  { value: 1, label: "Regular days" },
  { value: 2, label: "Rest days" },
  { value: 4, label: "Legal holidays" },
  { value: 8, label: "Special holidays" },
];

export const ALL_WEEKDAY_BITS = WEEKDAY_OPTIONS.map((o) => o.value);
export const ALL_DAY_TYPE_BITS = DAY_TYPE_OPTIONS.map((o) => o.value);

// Codes the API stamps on a row payroll didn't pay (OtherIncomeSkipReasons).
export const SKIP_REASON_LABEL: Record<string, string> = {
  NotApplicableDay: "Not an applicable day",
  DayTypeExcluded: "Day type not covered",
  NoDtr: "No posted DTR",
  NotWorked: "Did not work",
  BelowMinHours: "Below minimum hours",
  TooLate: "Late beyond the limit",
  TooMuchUndertime: "Undertime beyond the limit",
  GateNotMet: "Attendance requirement not met",
};
