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
  AREA: "Project Site",
  PAYROLL_GROUP: "Payroll Group",
  CLIENT: "Client",
  BRANCH: "Branch",
  SECTION: "Section",
  POSITION: "Position",
  JOB_LEVEL: "Job Level",
  TIME_SHIFT: "Time Shift",
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
  BANK_NAME: "Bank Name",
  BANK_NO: "Bank Account No.",
  SSS_NO: "SSS No.",
  PHIC_NO: "PhilHealth No.",
  HDMF_NO: "Pag-IBIG No.",
  TIN: "TIN",
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
  // Standard (PH DOLE) — holiday premium adjustments embedded in the divisor itself
  365: {
    isRestDayPaid: true,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },
  313: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: false,
  },
  261: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  252: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },

  // International / Enterprise — straight calendar math, no holiday premium embedded
  312: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  305: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  260: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },
  253: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: false,
    isSpecialNonWorkingIncluded: false,
  },

  // Continuous operations (24/7/365) — premium factors already baked into the divisor
  394.4: {
    isRestDayPaid: true,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },
  393.9: {
    isRestDayPaid: true,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },
  393.5: {
    isRestDayPaid: true,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: true,
  },
  337.8: {
    isRestDayPaid: false,
    isRegularHolidayIncluded: true,
    isSpecialNonWorkingIncluded: false,
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
          "All calendar days pre-funded in base pay — rest days and holidays are fully paid.",
      },
      {
        value: 313,
        label: "313 Days",
        description: "Working days + regular holidays pre-funded in base pay.",
      },
      {
        value: 261,
        label: "261 Days",
        description: "Working days only pre-funded in base pay.",
      },
      {
        value: 252,
        label: "252 Days",
        description:
          "Working days only (5-day work week) pre-funded in base pay.",
      },
    ],
  },
  {
    group: "International / Enterprise",
    options: [
      {
        value: 312,
        label: "312 Days",
        description:
          "Alternate 6-day work week (52 × 6). Rest days unpaid; holidays treated as normal workdays — no holiday premium embedded.",
      },
      {
        value: 305,
        label: "305 Days",
        description:
          "6-day work week variant — the 8 regular holidays are deducted from the 313 schedule (unpaid if unworked).",
      },
      {
        value: 260,
        label: "260 Days",
        description:
          "Corporate global baseline for a 5-day work week (52 × 5). No holiday premium embedded.",
      },
      {
        value: 253,
        label: "253 Days",
        description:
          "5-day work week variant — the 8 regular holidays are deducted from the 261 schedule (unpaid if unworked).",
      },
    ],
  },
  {
    group: "Continuous Operations (24/7/365)",
    options: [
      {
        value: 394.4,
        label: "394.40 Days",
        description:
          "For employees required to work every day, including Sundays/rest days and holidays — factors in premium rates for those worked days.",
      },
      {
        value: 393.9,
        label: "393.90 Days",
        description:
          "DOLE Advisory No. 001-10 variation — precise mathematical weight for worked holidays in continuous operations.",
      },
      {
        value: 393.5,
        label: "393.50 Days",
        description:
          "Alternate DOLE Advisory No. 001-10 weighting for worked holidays in continuous operations.",
      },
      {
        value: 337.8,
        label: "337.80 Days",
        description:
          "6-day work week where employees are contractually required to work all regular holidays falling on normal workdays.",
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
  { value: "FixedMonthly", label: "Fixed Monthly" },
  { value: "Table", label: "Table" },
];

// kept for backward compatibility
export const PAYMENT_METHOD_OPTIONS = MODE_OF_PAYMENT_OPTIONS;
