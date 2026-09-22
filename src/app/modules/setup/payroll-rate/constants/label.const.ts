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
  RESTDAY_OT_PREMIUM: "Rest Day OT Premium",
  LEGAL_HOLIDAY_OT_PREMIUM: "Legal Holiday OT Premium",
  SPECIAL_HOLIDAY_OT_PREMIUM: "Special Holiday OT Premium",
  RESTLEGAL_OT_PREMIUM: "Rest Day + Legal Holiday OT Premium",
  RESTSPECIAL_OT_PREMIUM: "Rest Day + Special Holiday OT Premium",
  DOUBLELEGAL_OT_PREMIUM: "Double Legal Holiday OT Premium",
  RESTDOUBLELEGAL_OT_PREMIUM: "Rest Day + Double Legal Holiday OT Premium",
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
  RESTDAY_OT_PREMIUM:
    "This client's own OT premium for Rest Day overtime hours, multiplied on top of the Rest Day rate above — leave blank to use the company-wide Holiday / Rest Day OT Premium.",
  LEGAL_HOLIDAY_OT_PREMIUM:
    "This client's own OT premium for Legal Holiday overtime hours, multiplied on top of the Legal Holiday (Worked) rate above — leave blank to use the company-wide Holiday / Rest Day OT Premium.",
  SPECIAL_HOLIDAY_OT_PREMIUM:
    "This client's own OT premium for Special Holiday overtime hours, multiplied on top of the Special Non-Working Holiday rate above — leave blank to use the company-wide Holiday / Rest Day OT Premium.",
  RESTLEGAL_OT_PREMIUM:
    "This client's own OT premium for Rest Day + Legal Holiday overtime hours — leave blank to use the company-wide Holiday / Rest Day OT Premium.",
  RESTSPECIAL_OT_PREMIUM:
    "This client's own OT premium for Rest Day + Special Holiday overtime hours — leave blank to use the company-wide Holiday / Rest Day OT Premium.",
  DOUBLELEGAL_OT_PREMIUM:
    "This client's own OT premium for Double Legal Holiday overtime hours — leave blank to use the company-wide Holiday / Rest Day OT Premium.",
  RESTDOUBLELEGAL_OT_PREMIUM:
    "This client's own OT premium for Rest Day + Double Legal Holiday overtime hours — leave blank to use the company-wide Holiday / Rest Day OT Premium.",
};

// Client-only OT PREMIUM overrides (Setup > Client > Settings > Rate Multipliers). Each
// compounds with that same category's day-type rate exactly the way the shared HOLIDAY_OT rate
// does elsewhere — just per-category instead of shared. Client-only by design (there's
// deliberately no BASE_RATE_DEFAULTS/BASE_RATE_KEYS entry for these — never company-wide), and
// never affecting that same category's regular/non-OT holiday pay, which keeps using
// LEGAL_HOLIDAY_DUTY/SPECIAL_NON_WORKING/etc. unchanged. Left blank, a category falls back to
// the company-wide Holiday / Rest Day OT Premium (HOLIDAY_OT). See CompoundedOtRateStrategy
// (backend).
export const OT_OVERRIDE_RATE_KEYS = [
  "RESTDAY_OT_PREMIUM",
  "LEGAL_HOLIDAY_OT_PREMIUM",
  "SPECIAL_HOLIDAY_OT_PREMIUM",
  "RESTLEGAL_OT_PREMIUM",
  "RESTSPECIAL_OT_PREMIUM",
  "DOUBLELEGAL_OT_PREMIUM",
  "RESTDOUBLELEGAL_OT_PREMIUM",
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
