export const COMPANY_POLICY_LABEL = {
  TITLE: "Company Settings",
  SUBTITLE:
    "Manage your company profile and configure attendance and payroll computation rules for your organization.",

  SECTION_COMPANY_INFO: "Company Profile",
  COMPANY_NAME: "Company Name",
  SHORT_NAME: "Short Name",
  ADDRESS: "Address",
  CONTACT: "Contact Number",
  EMAIL: "Email",
  TIN: "TIN",
  RDO_CODE: "RDO Code",
  SSS_NUMBER: "SSS Employer No.",
  PHILHEALTH_NUMBER: "PhilHealth Employer No.",
  PAGIBIG_NUMBER: "Pag-IBIG Employer No.",
  AUTHORIZED_SIGNATORY_NAME: "Authorized Signatory Name",
  AUTHORIZED_SIGNATORY_TITLE: "Authorized Signatory Title",
  SECTION_AGENCY_REGISTRATION: "Government Agency Registration",

  SECTION_OVERTIME: "Overtime",
  SECTION_LATE: "Late Policy",
  SECTION_NIGHT_DIFF: "Night Differential",
  SECTION_ATT_FILL: "Attendance Entry",
  SECTION_HOLIDAY: "Holiday",
  SECTION_ATTENDANCE_RULES: "Attendance Rules",
  SECTION_STATUTORY: "Cross-Month Cutoff Credit Policies",

  OT_INCLUSION: "OT Inclusion",
  OT_ELIGIBILITY: "OT Eligibility",
  IS_HALF_DAY_LATE: "Enable Half-Day Late",
  HALF_DAY_THRESHOLD: "Half-Day Late Threshold (minutes)",
  IS_WHOLE_DAY_LATE: "Enable Whole-Day Late",
  WHOLE_DAY_THRESHOLD: "Whole-Day Late Threshold (minutes)",
  NIGHT_DIFF_THRESHOLD: "Night Diff Threshold (minutes)",
  ATT_FILL_LIMIT: "Manual Attendance Fill Limit",
  HOLIDAY_TIME_BASIS: "Holiday Hours Basis",
  IS_HOL_PLUS_REG: "Include Regular Hours in Holiday Column",
  TIME_IN_ALLOWANCE: "Earliest Allowed Clock-In (minutes before shift start)",
  DOUBLE_PUNCH_GAP: "Double Punch Gap (minutes)",
  CHECK_AFTER_HOLIDAY:
    "Require attendance after holiday to be eligible for holiday pay",
  WAIVE_PRIOR_DAY_REQUIREMENT:
    "Waive prior-day attendance requirement for holiday eligibility",
  CROSS_MONTH_STATUTORY_CREDIT_POLICY: "Credit SSS/PhilHealth/Pag-IBIG To",
  WTAX_CROSS_MONTH_CREDIT_POLICY: "Credit Withholding Tax To",

  TAB_COMPANY_INFO: "Company Info",
  TAB_GENERAL: "Attendance & Payroll Policy",
  TAB_RATE_MULTIPLIERS: "Rate Multipliers",
  TAB_PAYROLL_SETTINGS: "Payroll Settings",
};

export const OT_INCLUSION_OPTIONS = [
  {
    value: "UseEarlyClockIn",
    label: "OT earned by clocking in before shift starts",
  },
  {
    value: "UsePostShiftWork",
    label: "OT earned by working after shift ends",
  },
  {
    value: "UseAllExcessOver8Hours",
    label: "Any hours beyond 8 per day count as OT",
  },
];

export const OT_ELIGIBILITY_OPTIONS = [
  {
    value: "RequireFullRegularHours",
    label: "Must complete regular hours before earning OT",
  },
  {
    value: "OffsetAgainstUndertimeOrLateness",
    label: "OT offsets late or undertime first",
  },
  {
    value: "IndependentOfAttendanceIssues",
    label: "OT counted regardless of late or undertime",
  },
];

export const ATT_FILL_LIMIT_OPTIONS = [
  { value: "NOLIMIT", label: "No limit" },
  { value: "DONTALLOW", label: "Do not allow" },
  { value: "ONE", label: "1 entry per day" },
  { value: "TWO", label: "2 entries per day" },
  { value: "THREE", label: "3 entries per day" },
  { value: "FOUR", label: "4 entries per day" },
];

export const HOLIDAY_TIME_BASIS_OPTIONS = [
  {
    value: "BasedOnTimeInDayType",
    label: "Full shift treated as holiday based on shift start day",
  },
  // {
  //   value: "BasedOnActualWorkHours",
  //   label: "Count only hours that actually fall within the holiday",
  // },
];

export const CROSS_MONTH_STATUTORY_CREDIT_POLICY_OPTIONS = [
  {
    value: "CutoffStartMonth",
    label: "Month the cutoff starts (standard practice)",
  },
  {
    value: "CutoffEndMonth",
    label: "Month the cutoff ends (payout month)",
  },
  {
    value: "PayDate",
    label: "Explicit Pay/Release Date (entered per payroll run)",
  },
];
