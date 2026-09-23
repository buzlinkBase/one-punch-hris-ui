export const EMPLOYEE_LABEL = {
  TITLE: "Employee",
  EMPLOYEE_NO: "Employee No.",
  BIO_ID: "Bio ID",
  FIRST_NAME: "First Name",
  LAST_NAME: "Last Name",
  MIDDLE_NAME: "Middle Name",
  SUFFIX: "Suffix",
  GENDER: "Gender",
  CIVIL_STATUS: "Civil Status",
  DOB: "Date of Birth",
  BLOOD_TYPE: "Blood Type",
  EMAIL: "Email Address",
  CONTACT: "Contact No.",
  ADDRESS1: "Address Line 1",
  ADDRESS2: "Address Line 2",
  DEPARTMENT: "Department",
  MANAGER: "Reports To",
  AREA: "Project Site",
  PAYROLL_GROUP: "Payroll Group",
  CLIENT: "Client",
  BRANCH: "Branch",
  SECTION: "Section",
  POSITION: "Position",
  JOB_LEVEL: "Job Level",
  TIME_SHIFT: "Permanent Shift",
  EMPLOYMENT_STATUS: "Employment Status",
  HIRING_ENTITY: "Hiring Entity",
  DATE_REGISTERED: "Date Registered",
  HIRE_DATE: "Hire Date",
  CONTRACT_START: "Contract Start",
  CONTRACT_END: "Contract End",
  DATE_RESIGNED: "Date Resigned",
  STATUS: "Status",
  MODE_OF_PAYMENT: "Mode of Payment",
  SALARY_TYPE: "Salary Type",
  MONTHLY_RATE: "Monthly Rate",
  DAILY_RATE: "Daily Rate",
  DAILY_RATE_MODE: "Daily Rate Mode",
  FACTOR_DAYS: "Factor Days",
  COLA: "COLA (Per Payroll)",
  CASH_BOND: "Cash Bond",
  BANK_NAME: "Bank Name",
  BANK_NO: "Bank Account No.",
  SSS_NO: "SSS No.",
  PHIC_NO: "PhilHealth No.",
  HDMF_NO: "Pag-IBIG No.",
  TIN: "TIN",
  RDO_CODE: "RDO Code",
  AGE: "Age",
  REST_DAYS: "Rest Days",
  CREATE_TITLE: "Create Employee",
  EDIT_TITLE: "Edit Employee",
};

export const MODE_OF_PAYMENT_OPTIONS = [
  { value: "Cash", label: "Cash" },
  { value: "ATM", label: "ATM" },
];

export const SALARY_TYPE_OPTIONS = [
  { value: "VARIABLE", label: "Variable" },
  { value: "FIXED", label: "Fixed" },
];

export const DAILY_RATE_MODE_OPTIONS = [
  { value: "Manual", label: "Manual Entry" },
  { value: "CalculatedEDR", label: "Calculated (EDR)" },
  { value: "MonthlyTotalDays", label: "Monthly Total Days" },
];

export interface FactorDaysFlags {
  isRestDayPaid: boolean;
  isRegularHolidayIncluded: boolean;
  isSpecialNonWorkingIncluded: boolean;
}

export const FACTOR_DAYS_DEFAULT_FLAGS: Record<number, FactorDaysFlags> = {
  // Standard (PH DOLE) — holiday premium adjustments embedded in the divisor itself.
  // 365 = every day paid. 313/261 = 6-day/5-day week, rest days unpaid, regular
  // holidays AND special non-working days both paid. 305/253 = the 313/261 variant
  // with special non-working days excluded (unpaid if unworked) — regular holidays
  // stay paid either way. 251 = ordinary working days only, nothing else paid.
  365: {
    isRestDayPaid: true,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },
  313: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },
  305: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: false,
  },
  261: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },
  253: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: false,
  },
  251: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },

  // Flat calendar — a plain 52-week × N-day divisor with no DOLE paid-day adjustment
  // baked in. Rest day/holiday premiums are NOT assumed pre-funded here (all flags
  // false), so the DTR engine still pays them in full via the Fixed Salary Inclusion
  // toggles — this only changes how the base daily rate itself is derived.
  312: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  260: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },

  // Continuous operations (24/7/365) — DOLE Advisory No. 001-10: 297 ordinary days +
  // 67.60 (52 rest days x 130%) + 24.00 (12 regular holidays x 200%) + 5.20 (4 special
  // days x 130%) = 393.80. All three premium categories are baked into the divisor.
  393.8: {
    isRestDayPaid: true,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },

  // Custom / averaging — flat monthly denominators, no premium semantics
  30.4167: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  30: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  31: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  26: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  22: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  21.67: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
};

interface FactorDaysOption {
  value: number;
  label: string;
  description: string;
}

export const FACTOR_DAYS_GROUPS: {
  group: string;
  options: FactorDaysOption[];
}[] = [
  {
    group: "Standard (PH DOLE)",
    options: [
      {
        value: 365,
        label: "365 Days",
        description:
          "All calendar days pre-funded in base pay — rest days, regular holidays, and special non-working days are all fully paid.",
      },
      {
        value: 313,
        label: "313 Days",
        description:
          "6-day work week (365 − 52 Sundays). Regular holidays and special non-working days are pre-funded in base pay; rest days are not.",
      },
      {
        value: 305,
        label: "305 Days",
        description:
          "6-day work week — the 313 schedule with the 8 special non-working days excluded (unpaid if unworked). Regular holidays stay pre-funded; rest days are not.",
      },
      {
        value: 261,
        label: "261 Days",
        description:
          "5-day work week (365 − 104 weekend days). Regular holidays and special non-working days are pre-funded in base pay; rest days are not.",
      },
      {
        value: 253,
        label: "253 Days",
        description:
          "5-day work week — the 261 schedule with the 8 special non-working days excluded (unpaid if unworked). Regular holidays stay pre-funded; rest days are not.",
      },
      {
        value: 251,
        label: "251 Days",
        description:
          "5-day work week, ordinary working days only — rest days, regular holidays, and special non-working days are all excluded from base pay.",
      },
    ],
  },
  {
    group: "Flat Calendar (No Statutory Holiday Premium)",
    options: [
      {
        value: 312,
        label: "312 Days",
        description:
          "Flat 52-week × 6-day calendar. Rest days, regular holidays, and special days are excluded from the divisor itself — actual holiday/rest-day premiums are still paid separately by the payroll engine when the matching Fixed Salary Inclusion toggles are off.",
      },
      {
        value: 260,
        label: "260 Days",
        description:
          "Flat 52-week × 5-day calendar. Rest days, regular holidays, and special days are excluded from the divisor itself — actual holiday/rest-day premiums are still paid separately by the payroll engine when the matching Fixed Salary Inclusion toggles are off.",
      },
    ],
  },
  {
    group: "Continuous Operations (24/7/365)",
    options: [
      {
        value: 393.5,
        label: "393.50 Days",
        description:
          "DOLE Advisory No. 001-10 — for employees required to work every day of the year: 297 ordinary days + 67.60 (52 rest days × 130%) + 24.00 (12 regular holidays × 200%) + 5.20 (4 special days × 130%). Rest-day and holiday premiums are baked into the divisor.",
      },
    ],
  },
];

export const FACTOR_DAYS_OPTIONS: FactorDaysOption[] =
  FACTOR_DAYS_GROUPS.flatMap((g) => g.options);

// Monthly Total Days mode — flat monthly denominators (not annual factors), so DailyRate =
// MonthlyRate / FactorDays directly, without annualizing first like Calculated EDR does.
// The "actual days in month" option isn't in this list — it's a separate toggle (see
// employee-detail.tsx's "Use Actual Days in Month" switch) since it resolves dynamically
// per payroll period (28/29/30/31) instead of being a fixed value.
export const MONTHLY_TOTAL_DAYS_OPTIONS: FactorDaysOption[] = [
  {
    value: 30.4167,
    label: "30.4167 Days",
    description:
      "Exact average number of days per month (365 ÷ 12) — a flat monthly daily rate without a yearly factor.",
  },
  {
    value: 30,
    label: "30 Days",
    description:
      "Simplified flat convention — every month treated as exactly 30 days, common in manual payroll setups.",
  },
  {
    value: 31,
    label: "31 Days",
    description:
      "Conservative flat convention — every month treated as exactly 31 days for consistency.",
  },
  {
    value: 26,
    label: "26 Days",
    description: "Fixed monthly denominator — average working days per month.",
  },
  {
    value: 22,
    label: "22 Days",
    description: "Fixed monthly denominator — average working days per month.",
  },
  {
    value: 21.67,
    label: "21.67 Days",
    description: "Fixed monthly denominator — average working days per month.",
  },
];

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: "Regular", label: "Regular" },
  { value: "PartTime", label: "Part Time" },
  { value: "Probationary", label: "Probationary" },
  { value: "Contract", label: "Contract" },
  { value: "Temporary", label: "Temporary" },
  { value: "Casual", label: "Casual" },
  { value: "Intern", label: "Intern" },
  { value: "OnLeave", label: "On Leave" },
  { value: "Suspended", label: "Suspended" },
  { value: "Terminated", label: "Terminated" },
  { value: "Resigned", label: "Resigned" },
  { value: "Retired", label: "Retired" },
  { value: "Deceased", label: "Deceased" },
];

export const JOB_LEVEL_OPTIONS = [
  { value: "Managerial", label: "Managerial" },
  { value: "Supervisory", label: "Supervisory" },
  { value: "Executive", label: "Executive" },
  { value: "RankandFile", label: "Rank and File" },
  { value: "EntryLevel", label: "Entry Level" },
  { value: "TechnicalSpecialist", label: "Technical Specialist" },
  { value: "Contractual", label: "Contractual" },
  { value: "FieldStaff", label: "Field Staff" },
];

export const GENDER_OPTIONS = [
  { value: "Male", label: "Male" },
  { value: "Female", label: "Female" },
];

export const CIVIL_STATUS_OPTIONS = [
  { value: "Single", label: "Single" },
  { value: "Married", label: "Married" },
  { value: "Widowed", label: "Widowed" },
  { value: "Separated", label: "Separated" },
];

export const BLOOD_TYPE_OPTIONS = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const COMPUTATION_BASIS_OPTIONS = [
  { value: "None", label: "None" },
  { value: "FixedPerPayroll", label: "Fixed Per Payroll" },
  { value: "Table", label: "Table" },
];

// kept for backward compatibility
export const PAYMENT_METHOD_OPTIONS = MODE_OF_PAYMENT_OPTIONS;
