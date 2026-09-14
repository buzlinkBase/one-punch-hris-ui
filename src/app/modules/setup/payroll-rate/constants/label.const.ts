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
  "HOLIDAY_OT",
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
  HOLIDAY_OT: "Holiday / Rest Day OT Premium",
  LEGAL_HOLIDAY_OT: "Legal Holiday OT",
  SPECIAL_HOLIDAY_OT: "Special Holiday OT",
  REST_DAY_OT: "Rest Day OT",
  REST_LEGAL_HOLIDAY_OT: "Rest Day + Legal Holiday OT",
  REST_SPECIAL_HOLIDAY_OT: "Rest Day + Special Holiday OT",
  DOUBLE_LEGAL_HOLIDAY_OT: "Double Legal Holiday OT",
  REST_DOUBLE_LEGAL_HOLIDAY_OT: "Rest Day + Double Legal Holiday OT",
};

export const RATE_TYPE_DESCRIPTION: Record<string, string> = {
  REGULAR: "Base multiplier for regular working hours.",
  NIGHTDIFF: "Applied to hours worked between 10 PM and 6 AM.",
  OVERTIME:
    "Applied to hours worked beyond the regular shift (regular days only).",
  RESTDAY_DUTY: "Applied when an employee works on their designated rest day.",
  LEGAL_HOLIDAY: "Pay for unworked legal holidays (no-work, paid).",
  LEGAL_HOLIDAY_DUTY: "Applied when an employee works on a legal holiday.",
  SPECIAL_WORKING: "Applied for hours worked on a special working holiday.",
  SPECIAL_NON_WORKING:
    "Applied when an employee works on a special non-working holiday.",
  RESTDAY_SPECIAL:
    "Applied when an employee works on both a rest day and special holiday.",
  HOLIDAY_OT:
    "OT premium multiplied on top of the day's rate for overtime on rest days and holidays. DOLE default: ×1.30.",
  LEGAL_HOLIDAY_OT:
    "Flat total rate for Legal Holiday overtime hours only — replaces the standard formula for this client. Does not change their regular (non-OT) Legal Holiday pay.",
  SPECIAL_HOLIDAY_OT:
    "Flat total rate for Special Holiday overtime hours only — replaces the standard formula for this client. Does not change their regular (non-OT) Special Holiday pay.",
  REST_DAY_OT:
    "Flat total rate for Rest Day overtime hours only — replaces the standard formula for this client.",
  REST_LEGAL_HOLIDAY_OT:
    "Flat total rate for Rest Day + Legal Holiday overtime hours only — replaces the standard formula for this client.",
  REST_SPECIAL_HOLIDAY_OT:
    "Flat total rate for Rest Day + Special Holiday overtime hours only — replaces the standard formula for this client.",
  DOUBLE_LEGAL_HOLIDAY_OT:
    "Flat total rate for Double Legal Holiday overtime hours only — replaces the standard formula for this client.",
  REST_DOUBLE_LEGAL_HOLIDAY_OT:
    "Flat total rate for Rest Day + Double Legal Holiday overtime hours only — replaces the standard formula for this client.",
};

// Client-only overtime rate overrides (Setup > Client > Settings > Rate Multipliers). Each
// replaces the TOTAL OT multiplier for that one category — never company-wide (there's
// deliberately no BASE_RATE_DEFAULTS/BASE_RATE_KEYS entry for these), and never affecting that
// same category's regular/non-OT holiday pay, which keeps using LEGAL_HOLIDAY_DUTY/
// SPECIAL_NON_WORKING/etc. unchanged. See ClientOverrideOtRateStrategy (backend).
export const OT_OVERRIDE_RATE_KEYS = [
  "LEGAL_HOLIDAY_OT",
  "SPECIAL_HOLIDAY_OT",
  "REST_DAY_OT",
  "REST_LEGAL_HOLIDAY_OT",
  "REST_SPECIAL_HOLIDAY_OT",
  "DOUBLE_LEGAL_HOLIDAY_OT",
  "REST_DOUBLE_LEGAL_HOLIDAY_OT",
] as const;

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
  HOLIDAY_OT: 1.3,
};

// Ordered list for display
export const BASE_RATE_KEYS = [
  "REGULAR",
  "NIGHTDIFF",
  "OVERTIME",
  "HOLIDAY_OT",
  "RESTDAY_DUTY",
  "LEGAL_HOLIDAY",
  "LEGAL_HOLIDAY_DUTY",
  "SPECIAL_WORKING",
  "SPECIAL_NON_WORKING",
  "RESTDAY_SPECIAL",
] as const;
