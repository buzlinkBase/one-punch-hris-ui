export interface NavItem {
  key: string;
  label: string;
  path?: string;
  children?: NavItem[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    key: "timekeeping",
    label: "Time Keeping",
    path: "/timekeeping",
    children: [
      {
        key: "timekeeping-upload-attendance",
        label: "Upload Attendance",
        path: "/timekeeping/upload-attendance",
      },
      {
        key: "timekeeping-attendance-entry",
        label: "Attendance Entry",
        path: "/timekeeping/attendance-entry",
      },
      {
        key: "timekeeping-raw-logs",
        label: "Raw Logs",
        path: "/timekeeping/raw-logs",
      },
      {
        key: "timekeeping-unregistered-employees",
        label: "Unregister Employee",
        path: "/timekeeping/unregistered-employees",
      },
      {
        key: "timekeeping-incomplete-punches",
        label: "Incomplete Punches",
        path: "/timekeeping/incomplete-punches",
      },
    ],
  },
  {
    key: "change-schedule",
    label: "Change Schedule",
    children: [
      {
        key: "change-schedule-work-rotation",
        label: "Work Rotation Plan",
        path: "/change-schedule/work-rotation",
      },
      {
        key: "change-schedule-change-rest-day",
        label: "Change Rest Day",
        path: "/change-schedule/change-rest-day",
      },
      {
        key: "change-schedule-change-holiday",
        label: "Change Holiday",
        path: "/change-schedule/change-holiday",
      },
    ],
  },
  {
    key: "daily-time-record",
    label: "Daily Time Record",
    children: [
      {
        key: "daily-time-record-detail",
        label: "DTR Detail",
        path: "/daily-time-record/detail",
      },
      {
        key: "daily-time-record-summary",
        label: "DTR Summary",
        path: "/daily-time-record/summary",
      },
      {
        key: "daily-time-record-for-payroll",
        label: "For Payroll",
        path: "/daily-time-record/for-payroll",
      },
    ],
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    children: [
      {
        key: "reports-tardiness",
        label: "Tardiness",
        path: "/reports/tardiness",
      },
    ],
  },
  {
    key: "setup",
    label: "Setup",
    children: [
      {
        key: "setup-fixed-shift",
        label: "Fixed Time Shift",
        path: "/setup/time-shift/fixed",
      },
      {
        key: "setup-flexi-shift",
        label: "Flexi Time Shift",
        path: "/setup/time-shift/flexi",
      },
      { key: "setup-branch", label: "Branch", path: "/setup/branch" },
      {
        key: "setup-project-site",
        label: "Project Site",
        path: "/setup/project-site",
      },
      {
        key: "setup-department",
        label: "Department",
        path: "/setup/department",
      },
      { key: "setup-section", label: "Section", path: "/setup/section" },
      { key: "setup-position", label: "Position", path: "/setup/position" },
      {
        key: "setup-payroll-group",
        label: "Payroll Group",
        path: "/setup/payroll-group",
      },
      { key: "setup-client", label: "Client", path: "/setup/client" },
      { key: "setup-employee", label: "Employee", path: "/setup/employee" },
      { key: "setup-holiday", label: "Holiday", path: "/setup/holiday" },
      // {
      //   key: "setup-deduction-type",
      //   label: "Deduction Type",
      //   path: "/setup/deduction-type",
      // },
      // { key: "setup-deduction", label: "Deduction", path: "/setup/deduction" },
    ],
  },
  {
    key: "employee-management",
    label: "Employee Management",
    children: [
      {
        key: "employee-management-assign-assets",
        label: "Assign Assets",
        path: "/employee-management/assign-assets",
      },
      {
        key: "employee-management-dependents",
        label: "Dependents",
        path: "/employee-management/dependents",
      },
      {
        key: "employee-management-doc-records",
        label: "Document Records",
        path: "/employee-management/doc-records",
      },
    ],
  },
  {
    key: "biometric",
    label: "Biometric",
    children: [
      {
        key: "enroll-biometrics",
        label: "Enroll Biometrics",
        path: "/enroll-biometrics",
      },
      {
        key: "biometric-manage-devices",
        label: "Manage Devices",
        path: "/biometric/manage-devices",
      },
    ],
  },
  {
    key: "security",
    label: "Security",
    children: [
      { key: "security-users", label: "Users", path: "/security/users" },
      { key: "security-roles", label: "Roles", path: "/security/roles" },
      {
        key: "security-permissions",
        label: "Permissions",
        path: "/security/permissions",
      },
      { key: "security-audit", label: "Audit", path: "/security/audit" },
    ],
  },
];

export const NAVIGATION_BUTTON_LABEL = {
  BACK: "Back",
  SAVE: "Save",
  CANCEL: "Cancel",
  ADD: "Add",
  EDIT: "Edit",
  DELETE: "Delete",
};
