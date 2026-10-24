export const ROSTER_LABEL = {
  TITLE: "Rostering Report",
  DATE: "Date",
  EMPLOYEE_ID: "Employee ID",
  EMPLOYEE_NAME: "Name",
  DEPARTMENT: "Department",
  SHIFT: "Shift",
  SHIFT_START: "Shift Start",
  SHIFT_END: "Shift End",
  REST_DAY: "Rest Day",
  SCHEDULE_SOURCE: "Schedule Source",
  AREA: "Project Site",
  AREA_PLACEHOLDER: "Employee's own project site",
  FILTER_DEPARTMENT: "Department",
  FILTER_EMPLOYEE: "Employee",
  FILTER_AREA: "Project Site",
};

export const SCHEDULE_SOURCE_LABEL: Record<
  string,
  { label: string; color: string }
> = {
  Override: { label: "Work Rotation Override", color: "purple" },
  FixedSchedule: { label: "Fixed Schedule", color: "blue" },
  Permanent: { label: "Permanent Shift", color: "green" },
  OpenShift: { label: "Open Shift", color: "default" },
};
