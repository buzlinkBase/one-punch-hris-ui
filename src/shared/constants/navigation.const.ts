export interface NavItem {
  key: string;
  label: string;
  path?: string;
  type?: "group" | "divider";
  children?: NavItem[];
  // Any-of permission requirement — omit for "always visible" (the default for nearly every
  // item today). Only tag an item once every role/Custom Role that currently relies on seeing
  // it is confirmed to already hold one of these codes — otherwise it silently disappears for
  // whoever doesn't. See main-layout.tsx's filterNavByPermission.
  permission?: string | string[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
  },
  {
    key: "nav-portal",
    label: "My Portal",
    type: "group",
    permission: "Employee Self-Service Portal:View",
    children: [
      {
        key: "portal-profile",
        label: "My Profile",
        path: "/portal/profile",
      },
      {
        key: "portal-group-time",
        label: "My Time",
        type: "group",
        children: [
          {
            key: "portal-dtr",
            label: "My Daily Time Record",
            path: "/portal/dtr",
          },
          {
            key: "portal-incomplete-punches",
            label: "My Incomplete Logs",
            path: "/portal/incomplete-punches",
          },
          {
            key: "portal-shift-schedule",
            label: "My Shift Schedule",
            path: "/portal/shift-schedule",
          },
        ],
      },
      {
        key: "portal-group-pay",
        label: "My Pay",
        type: "group",
        children: [
          {
            key: "portal-payslips",
            label: "My Pay Slips",
            path: "/portal/payslips",
          },
          {
            key: "portal-leave-credits",
            label: "My Leave Credits",
            path: "/portal/leave-credits",
          },
          {
            key: "portal-thirteenth-month",
            label: "My 13th Month Pay",
            path: "/portal/thirteenth-month",
          },
        ],
      },
      {
        key: "portal-group-applications",
        label: "My Applications",
        type: "group",
        children: [
          {
            key: "portal-leave-applications",
            label: "Leave",
            path: "/portal/leave-applications",
          },
          {
            key: "portal-overtime",
            label: "Overtime",
            path: "/portal/overtime",
          },
          {
            key: "portal-official-business",
            label: "Official Business",
            path: "/portal/official-business",
          },
          {
            key: "portal-pass-slip",
            label: "Pass Slip",
            path: "/portal/pass-slip",
          },
          {
            key: "portal-change-rest-day",
            label: "Change Rest Day",
            path: "/portal/change-rest-day",
          },
          {
            key: "portal-loan-applications",
            label: "Loans",
            path: "/portal/loan-applications",
          },
          {
            key: "portal-cash-bond",
            label: "Cash Bond",
            path: "/portal/cash-bond",
          },
        ],
      },
    ],
  },
  {
    key: "nav-dtr",
    label: "Time Keeping",
    type: "group",
    children: [
      {
        key: "timekeeping-upload-attendance",
        label: "Upload Attendance",
        path: "/timekeeping/upload-attendance",
      },
      {
        key: "timekeeping-attendance-entry",
        label: "Manual Attendance Entry",
        path: "/timekeeping/attendance-entry",
      },
      {
        key: "timekeeping-raw-logs",
        label: "Attendance Logs",
        path: "/timekeeping/raw-logs",
      },
      {
        key: "timekeeping-unregistered-employees",
        label: "Unregistered Employees",
        path: "/timekeeping/unregistered-employees",
      },
      {
        key: "timekeeping-incomplete-punches",
        label: "Incomplete Logs",
        path: "/timekeeping/incomplete-punches",
      },
    ],
  },
  // Promoted to its own top-level group — schedule adjustments feed directly
  // into DTR calculation, so they sit right after Time Keeping.
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
    label: "DTR Generation",
    children: [
      {
        key: "daily-time-record-master",
        label: "Calculate Daily Time Record",
        path: "/daily-time-record/master",
      },
      {
        key: "daily-time-record-summary",
        label: "Posted DTR Summary",
        path: "/daily-time-record/summary",
      },
    ],
  },
  {
    key: "nav-payroll",
    label: "Payroll Generation",
    type: "group",
    children: [
      {
        key: "payroll-run",
        label: "Payroll Run",
        path: "/daily-time-record/for-payroll",
      },
      {
        key: "payroll-summary",
        label: "Payroll Summary",
        path: "/payroll/summary",
      },
      {
        key: "payroll-run-13th-month",
        label: "Generate 13th Month Pay",
        path: "/daily-time-record/for-13th-month",
      },
      {
        key: "payroll-run-last-pay",
        label: "Generate Last Pay",
        path: "/daily-time-record/for-last-pay",
      },
      {
        key: "payroll-run-year-end-adjustment",
        label: "Year-End Tax Adjustment",
        path: "/daily-time-record/for-year-end-adjustment",
      },
    ],
  },
  {
    key: "applications",
    label: "Applications",
    children: [
      {
        key: "applications-leave",
        label: "Leave",
        path: "/applications/leave",
      },
      {
        key: "applications-overtime",
        label: "Overtime",
        path: "/applications/overtime",
      },
      {
        key: "applications-official-business",
        label: "Official Business",
        path: "/applications/official-business",
      },
      {
        key: "applications-pass-slip",
        label: "Pass Slip",
        path: "/applications/pass-slip",
      },
      {
        key: "applications-divider-1",
        label: "",
        type: "divider",
      },
      {
        key: "applications-deduction",
        label: "Loans & Deductions",
        path: "/applications/deduction-application",
      },
      {
        key: "applications-other-income",
        label: "Other Income",
        path: "/applications/other-income",
      },
      {
        key: "applications-salary-adjustment",
        label: "Salary Adjustments",
        path: "/applications/salary-adjustment",
      },
    ],
  },
  // Every master-data/configuration screen lives here, consolidated under one
  // group instead of being split across top-level Organization/Workforce
  // entries plus a catch-all "Admin" group.
  {
    key: "nav-setup",
    label: "Setup",
    type: "group",
    children: [
      {
        key: "setup-group-org",
        label: "Organization",
        type: "group",
        permission: "Organization Setup:View",
        children: [
          {
            key: "setup-payroll-group",
            label: "Payroll Group",
            path: "/setup/payroll-group",
          },
          {
            key: "setup-department",
            label: "Department",
            path: "/setup/department",
          },
          {
            key: "setup-section",
            label: "Section",
            path: "/setup/section",
          },
          {
            key: "setup-position",
            label: "Position",
            path: "/setup/position",
          },
          {
            key: "setup-branch",
            label: "Branch",
            path: "/setup/branch",
          },
          {
            key: "setup-project-site",
            label: "Project Site",
            path: "/setup/project-site",
          },
        ],
      },
      {
        key: "setup-group-workforce",
        label: "Workforce",
        type: "group",
        permission: "Workforce Setup:View",
        children: [
          {
            key: "setup-client",
            label: "Client",
            path: "/setup/client",
          },
          {
            key: "setup-employee",
            label: "Employee",
            path: "/setup/employee",
          },
        ],
      },
      {
        key: "setup-group-shifts",
        label: "Time Shifts",
        type: "group",
        permission: "Time Shift Setup:View",
        children: [
          {
            key: "setup-fixed-shift",
            label: "Fixed Shift",
            path: "/setup/time-shift/fixed",
          },
          {
            key: "setup-split-shift",
            label: "Flexi/Split/Broken Shift",
            path: "/setup/time-shift/split",
          },
        ],
      },
      {
        key: "setup-group-deductions-income",
        label: "Deductions & Income",
        type: "group",
        permission: "Deductions & Income Setup:View",
        children: [
          {
            key: "setup-deduction",
            label: "Deductions",
            path: "/setup/deduction",
          },
          {
            key: "setup-other-income",
            label: "Other Income",
            path: "/setup/other-income",
          },
        ],
      },
      // Deliberately untagged (no `permission`) -- Holidays/Minimum Wage Rates have no
      // matching row in the permission catalog (only Leave Setup covers Leave Types/
      // Balances here), so there's no correct single code to gate the whole group on.
      {
        key: "setup-others",
        label: "Holidays & Leave Types",
        type: "group",
        children: [
          {
            key: "setup-holiday",
            label: "Holidays",
            path: "/setup/holiday",
          },
          {
            key: "setup-minimum-wage-rate",
            label: "Minimum Wage Rates",
            path: "/setup/minimum-wage-rate",
          },
          {
            key: "setup-leave-type",
            label: "Leave Types",
            path: "/setup/leave-type",
          },
          {
            key: "setup-leave-balance",
            label: "Leave Balances",
            path: "/setup/leave-balance",
          },
        ],
      },
      {
        key: "setup-group-statutory",
        label: "Statutory",
        type: "group",
        permission: "Statutory Tables:View",
        children: [
          {
            key: "setup-sss-table",
            label: "SSS Table",
            path: "/setup/sss-table",
          },
          {
            key: "setup-phic-table",
            label: "PHIC Table",
            path: "/setup/phic-table",
          },
          {
            key: "setup-hdmf-table",
            label: "HDMF Table",
            path: "/setup/hdmf-table",
          },
          {
            key: "setup-wtax-table",
            label: "WTax Table",
            path: "/setup/wtax-table",
          },
          {
            key: "setup-annual-tax-table",
            label: "Annual Tax Table",
            path: "/setup/annual-tax-table",
          },
        ],
      },
      // Deliberately untagged -- Biometric Setup's backend (hrms-adms-api's DeviceController)
      // is a separate microservice with no permission-checking wired yet, so a menu-only
      // restriction here would say "no" while the API still says "yes." Land the permission
      // tag alongside that backend work, not before it.
      {
        key: "biometric",
        label: "Biometric",
        type: "group",
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
      {
        key: "reports-rostering",
        label: "Rostering",
        path: "/reports/rostering",
      },
      {
        key: "payroll-reports-sss",
        label: "SSS Remittance",
        path: "/payroll/reports/sss-remittance",
      },
      {
        key: "payroll-reports-philhealth",
        label: "PhilHealth Remittance",
        path: "/payroll/reports/philhealth-remittance",
      },
      {
        key: "payroll-reports-pagibig",
        label: "Pag-IBIG Remittance",
        path: "/payroll/reports/pagibig-remittance",
      },
      {
        key: "payroll-reports-wtax",
        label: "BIR Withholding Tax",
        path: "/payroll/reports/wtax-remittance",
      },
      {
        key: "payroll-reports-bank",
        label: "Bank Disbursement",
        path: "/payroll/reports/bank-disbursement",
      },
      {
        key: "payroll-reports-deductions",
        label: "Deduction Ledger",
        path: "/payroll/reports/deduction-ledger",
      },
      {
        key: "payroll-reports-cash-bond",
        label: "Cash Bond Tracking",
        path: "/payroll/reports/cash-bond",
      },
      {
        key: "payroll-reports-leave",
        label: "Leave Ledger",
        path: "/payroll/reports/leave-ledger",
      },
      {
        key: "payroll-reports-retirement",
        label: "Retirement Ledger",
        path: "/payroll/reports/retirement-ledger",
      },
      {
        key: "payroll-reports-uniform-allowance",
        label: "Uniform Allowance Ledger",
        path: "/payroll/reports/uniform-allowance-ledger",
      },
      {
        key: "payroll-reports-reimbursement",
        label: "Reimbursement List",
        path: "/payroll/reports/reimbursement-list",
      },
      {
        key: "payroll-reports-cost",
        label: "Cost Summary",
        path: "/payroll/reports/cost-summary",
      },
      {
        key: "payroll-reports-ytd",
        label: "YTD Summary",
        path: "/payroll/reports/ytd-summary",
      },
      {
        key: "payroll-reports-13th",
        label: "13th Month Pay",
        path: "/payroll/reports/13th-month-pay",
      },
      {
        key: "payroll-reports-bir-1601c",
        label: "BIR 1601-C Monthly Remittance",
        path: "/payroll/reports/bir-1601c",
      },
      {
        key: "payroll-reports-bir-alphalist",
        label: "BIR Alphalist",
        path: "/payroll/reports/bir-alphalist",
      },
      {
        key: "payroll-reports-bir-2316",
        label: "BIR 2316 Certificate",
        path: "/payroll/reports/bir-2316",
      },
      {
        key: "payroll-reports-sss-r3",
        label: "SSS R3 File",
        path: "/payroll/reports/sss-r3",
      },
      {
        key: "payroll-reports-philhealth-eprs",
        label: "PhilHealth EPRS File",
        path: "/payroll/reports/philhealth-eprs",
      },
      {
        key: "payroll-reports-pagibig-mcrf",
        label: "Pag-IBIG MCRF File",
        path: "/payroll/reports/pagibig-mcrf",
      },
    ],
  },
  {
    key: "security",
    label: "Security",
    children: [
      {
        key: "security-users",
        label: "Users",
        path: "/security/users",
      },
      {
        key: "security-roles",
        label: "Roles",
        path: "/security/roles",
      },
      {
        key: "security-permissions",
        label: "Permissions",
        path: "/security/permissions",
      },
      {
        key: "security-audit",
        label: "Audit",
        path: "/security/audit",
      },
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
