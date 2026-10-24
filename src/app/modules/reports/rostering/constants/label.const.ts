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
  CLIENT: "Client",
  CLIENT_PLACEHOLDER: "Follow the project site or the employee's own client",
  CLIENT_HINT:
    "Pick the client this day is for. It is used for this day's attendance, billing and payroll, and the project sites below narrow to this client's. A site that belongs to a client fills it in for you.",
  AREA_FILTERED_HINT:
    "Showing this client's sites and the sites that aren't tied to any client.",
  FILTER_DEPARTMENT: "Department",
  FILTER_EMPLOYEE: "Employee",
  FILTER_CLIENT: "Client",
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
