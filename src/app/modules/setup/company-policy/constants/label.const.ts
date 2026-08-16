export const COMPANY_POLICY_LABEL = {
  TITLE: "Company Policy",
  SUBTITLE:
    "Configure attendance and payroll computation rules for your organization.",

  SECTION_OVERTIME: "Overtime",
  SECTION_LATE: "Late Policy",
  SECTION_NIGHT_DIFF: "Night Differential",
  SECTION_ATT_FILL: "Attendance Entry",
  SECTION_HOLIDAY: "Holiday",
  SECTION_ATTENDANCE_RULES: "Attendance Rules",

  OT_INCLUSION: "OT Inclusion",
  OT_ELIGIBILITY: "OT Eligibility",
  IS_HALF_DAY_LATE: "Enable Half-Day Late",
  HALF_DAY_THRESHOLD: "Half-Day Late Threshold (minutes)",
  IS_WHOLE_DAY_LATE: "Enable Whole-Day Late",
  WHOLE_DAY_THRESHOLD: "Whole-Day Late Threshold (minutes)",
  NIGHT_DIFF_THRESHOLD: "Night Diff Start (minutes before 10 PM)",
  ATT_FILL_LIMIT: "Manual Attendance Fill Limit",
  HOLIDAY_TIME_BASIS: "Holiday Hours Basis",
  IS_HOL_PLUS_REG: "Include Regular Hours in Holiday Column",
  TIME_IN_ALLOWANCE: "Clock-In Window (minutes before shift)",
  DOUBLE_PUNCH_GAP: "Double Punch Gap (minutes)",
  CHECK_AFTER_HOLIDAY: "Check Day After Holiday",
};

export const OT_INCLUSION_OPTIONS = [
  { value: "UseEarlyClockIn", label: "Include early clock-in before shift" },
  { value: "UsePostShiftWork", label: "Include work after shift ends" },
  {
    value: "UseAllExcessOver8Hours",
    label: "Count all hours beyond 8 as overtime",
  },
];

export const OT_ELIGIBILITY_OPTIONS = [
  {
    value: "RequireFullRegularHours",
    label: "Must complete full regular hours first",
  },
  {
    value: "OffsetAgainstUndertimeOrLateness",
    label: "Offset against undertime / lateness",
  },
  {
    value: "IndependentOfAttendanceIssues",
    label: "Independent of attendance issues",
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
  { value: "BasedOnTimeInDayType", label: "Based on day type at time-in" },
  {
    value: "BasedOnActualWorkHours",
    label: "Based on actual hours worked in holiday",
  },
];
