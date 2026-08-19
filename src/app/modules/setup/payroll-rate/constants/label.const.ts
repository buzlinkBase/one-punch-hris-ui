export const PAYROLL_RATE_LABEL = {
  MODULE: "Payroll Rate Multiplier",
  LIST_TITLE: "Rate Multipliers",
  RATE_TYPE: "Rate Type",
  RATE: "Multiplier",
};

export const BUILDING_BLOCKS = new Set([
  "REGULAR",
  "NIGHTDIFF",
  "OVERTIME",
  "RESTDAY_DUTY",
  "LEGAL_HOLIDAY",
  "LEGAL_HOLIDAY_DUTY",
  "SPECIAL_WORKING",
  "SPECIAL_NON_WORKING",
  "RESTDAY_SPECIAL",
]);

export const RATE_TYPE_LABEL: Record<string, string> = {
  REGULAR: "Regular",
  NIGHTDIFF: "Night Differential",
  OVERTIME: "Overtime",
  RESTDAY_DUTY: "Rest Day",
  LEGAL_HOLIDAY: "Legal Holiday (No Work)",
  LEGAL_HOLIDAY_DUTY: "Legal Holiday (Worked)",
  SPECIAL_WORKING: "Special Working Holiday",
  SPECIAL_NON_WORKING: "Special Non-Working Holiday",
  RESTDAY_SPECIAL: "Rest Day + Special Holiday",
};

export const RATE_TYPE_DESCRIPTION: Record<string, string> = {
  REGULAR: "Base multiplier for regular working hours.",
  NIGHTDIFF: "Applied to hours worked between 10 PM and 6 AM.",
  OVERTIME: "Applied to hours worked beyond the regular shift.",
  RESTDAY_DUTY: "Applied when an employee works on their designated rest day.",
  LEGAL_HOLIDAY: "Pay for unworked legal holidays (no-work, paid).",
  LEGAL_HOLIDAY_DUTY: "Applied when an employee works on a legal holiday.",
  SPECIAL_WORKING: "Applied for hours worked on a special working holiday.",
  SPECIAL_NON_WORKING:
    "Applied when an employee works on a special non-working holiday.",
  RESTDAY_SPECIAL:
    "Applied when an employee works on both a rest day and special holiday.",
};

export const BASE_RATE_DEFAULTS: Record<string, number> = {
  REGULAR: 1.0,
  NIGHTDIFF: 1.1,
  OVERTIME: 1.25,
  RESTDAY_DUTY: 1.3,
  LEGAL_HOLIDAY: 1.0,
  LEGAL_HOLIDAY_DUTY: 2.0,
  SPECIAL_WORKING: 1.0,
  SPECIAL_NON_WORKING: 1.3,
  RESTDAY_SPECIAL: 1.5,
};

// Ordered list for display
export const BASE_RATE_KEYS = [
  "REGULAR",
  "NIGHTDIFF",
  "OVERTIME",
  "RESTDAY_DUTY",
  "LEGAL_HOLIDAY",
  "LEGAL_HOLIDAY_DUTY",
  "SPECIAL_WORKING",
  "SPECIAL_NON_WORKING",
  "RESTDAY_SPECIAL",
] as const;
