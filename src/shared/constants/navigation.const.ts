import {
  BASE_FEATURE,
  FEATURE_KEYS,
  type FeatureKey,
  type NavFeature,
} from "./entitlement-keys.const";

export interface NavItem {
  key: string;
  label: string;
  path?: string;
  type?: "group" | "divider";
  children?: NavItem[];
  // Any-of permission requirement, inherited by children. Every page must resolve to one
  // (on itself or an ancestor group) -- an untagged item is visible to every member, even one
  // holding no permissions at all. No exceptions, Dashboard included;
  // navigation.const.test.ts enforces this. See main-layout.tsx's filterNavByPermission.
  permission?: string | string[];
  // The subscription feature the page needs (entitlement-keys.const.ts), or BASE_FEATURE when
  // every plan has it. Unlike `permission` it accumulates: a page needs every feature on its
  // ancestor chain. Every page must resolve to at least one -- navigation.const.test.ts
  // enforces this, so a new page can't ship without a plan decision.
  feature?: NavFeature;
}

/**
 * Every path in the menu, in menu order (parents before their children). `leavesOnly` skips
 * group headers that carry a path (e.g. Reports' "/reports"), which have no page of their own.
 */
export function flattenNavPaths(
  items: NavItem[] = NAVIGATION_ITEMS,
  { leavesOnly = false }: { leavesOnly?: boolean } = {},
): string[] {
  return items.flatMap((item) => [
    ...(item.path && !(leavesOnly && item.children) ? [item.path] : []),
    ...(item.children ? flattenNavPaths(item.children, { leavesOnly }) : []),
  ]);
}

/** Returns the most specific permission attached to a navigation path. */
export function getPermissionForPath(
  path: string,
  items: NavItem[] = NAVIGATION_ITEMS,
): string | string[] | undefined {
  let match: { path: string; permission?: string | string[] } | undefined;

  const visit = (
    entries: NavItem[],
    inheritedPermission?: string | string[],
  ) => {
    for (const item of entries) {
      const permission = item.permission ?? inheritedPermission;
      if (
        item.path &&
        (path === item.path || path.startsWith(`${item.path}/`))
      ) {
        if (!match || item.path.length > match.path.length) {
          match = { path: item.path, permission };
        }
      }
      if (item.children) visit(item.children, permission);
    }
  };

  visit(items);
  return match?.permission;
}

/**
 * Every subscription feature the most specific page matching `path` needs -- its own and its
 * ancestors'. BASE_FEATURE is included when tagged, so a page with none at all is untagged.
 */
export function getFeaturesForPath(
  path: string,
  items: NavItem[] = NAVIGATION_ITEMS,
): NavFeature[] {
  let match: { path: string; features: NavFeature[] } | undefined;

  const visit = (entries: NavItem[], inherited: NavFeature[]) => {
    for (const item of entries) {
      const features = item.feature ? [...inherited, item.feature] : inherited;
      if (
        item.path &&
        (path === item.path || path.startsWith(`${item.path}/`))
      ) {
        if (!match || item.path.length > match.path.length) {
          match = { path: item.path, features };
        }
      }
      if (item.children) visit(item.children, features);
    }
  };

  visit(items, []);
  return match?.features ?? [];
}

/** The paid features (BASE_FEATURE left out) a page needs. */
export function getRequiredFeatures(features: NavFeature[]): FeatureKey[] {
  return features.filter((f): f is FeatureKey => f !== BASE_FEATURE);
}

/** Billing stays reachable without the HRMS system, so a company can still change its plan. */
const PRODUCT_GATE_EXEMPT_PATH = "/billing";

/**
 * Every menu page is part of the HRMS system, so on top of its own features it needs the plan to
 * include `hrms.core` -- except billing. `features` is what the page already needs
 * (getRequiredFeatures); `path` is the page, or undefined for a group header (never locked).
 */
export function withHrmsProduct(
  path: string | undefined,
  features: FeatureKey[],
): FeatureKey[] {
  if (!path) return features;
  const exempt =
    path === PRODUCT_GATE_EXEMPT_PATH ||
    path.startsWith(`${PRODUCT_GATE_EXEMPT_PATH}/`);
  return exempt ? features : [FEATURE_KEYS.HRMS_CORE, ...features];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    feature: BASE_FEATURE,
    label: "Dashboard",
    path: "/dashboard",
    permission: "Dashboard:View",
  },
  {
    key: "nav-portal",
    feature: FEATURE_KEYS.PORTAL_SELF_SERVICE,
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
        key: "portal-announcements",
        label: "Announcements",
        path: "/portal/announcements",
      },
      {
        key: "portal-coworkers",
        label: "Coworkers",
        path: "/portal/coworkers",
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
            key: "portal-raw-attendance",
            label: "My Raw Attendance",
            path: "/portal/raw-attendance",
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
        label: "My Pay & Benefits",
        type: "group",
        children: [
          {
            key: "portal-payslips",
            feature: FEATURE_KEYS.PAYROLL_CORE,
            label: "My Pay Slips",
            path: "/portal/payslips",
          },
          {
            key: "portal-leave-credits",
            feature: FEATURE_KEYS.APPLICATIONS_CORE,
            label: "My Leave Credits",
            path: "/portal/leave-credits",
          },
          {
            key: "portal-thirteenth-month",
            feature: FEATURE_KEYS.PAYROLL_CORE,
            label: "My 13th Month Pay",
            path: "/portal/thirteenth-month",
          },
          {
            key: "portal-deductions",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "My Deductions",
            path: "/portal/deductions",
          },
          {
            key: "portal-cash-bond",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "My Cash Bond",
            path: "/portal/cash-bond",
          },
          {
            key: "portal-uniform-allowance",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "My Uniform Allowance",
            path: "/portal/uniform-allowance",
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
            feature: FEATURE_KEYS.APPLICATIONS_CORE,
            label: "Leave",
            path: "/portal/leave-applications",
          },
          {
            key: "portal-overtime",
            feature: FEATURE_KEYS.APPLICATIONS_CORE,
            label: "Overtime",
            path: "/portal/overtime",
          },
          {
            key: "portal-official-business",
            feature: FEATURE_KEYS.APPLICATIONS_CORE,
            label: "Official Business",
            path: "/portal/official-business",
          },
          {
            key: "portal-pass-slip",
            feature: FEATURE_KEYS.APPLICATIONS_CORE,
            label: "Pass Slip",
            path: "/portal/pass-slip",
          },
          {
            key: "portal-loan-applications",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Loans",
            path: "/portal/loan-applications",
          },
        ],
      },
    ],
  },
  {
    key: "nav-dtr",
    feature: FEATURE_KEYS.TIMEKEEPING_CORE,
    label: "Time Keeping",
    type: "group",
    children: [
      {
        key: "timekeeping-upload-attendance",
        label: "Upload Attendance",
        path: "/timekeeping/upload-attendance",
        permission: "Upload Attendance:View",
      },
      {
        key: "timekeeping-attendance-entry",
        label: "Manual Attendance Entry",
        path: "/timekeeping/attendance-entry",
        permission: "Attendance Manual Entry:View",
      },
      {
        key: "timekeeping-raw-logs",
        label: "Attendance Logs",
        path: "/timekeeping/raw-logs",
        permission: "Raw Logs:View",
      },
      {
        key: "timekeeping-unregistered-employees",
        label: "Unregistered Employees",
        path: "/timekeeping/unregistered-employees",
        permission: "Unregistered Employees:View",
      },
      {
        key: "timekeeping-incomplete-punches",
        label: "Incomplete Logs",
        path: "/timekeeping/incomplete-punches",
        permission: "Incomplete Punches:View",
      },
    ],
  },
  // Promoted to its own top-level group — schedule adjustments feed directly
  // into DTR calculation, so they sit right after Time Keeping.
  {
    key: "change-schedule",
    feature: FEATURE_KEYS.TIMEKEEPING_CORE,
    label: "Change Schedule",
    children: [
      {
        key: "change-schedule-work-rotation",
        label: "Work Rotation Plan",
        path: "/change-schedule/work-rotation",
        permission: "Work Rotation:View",
      },
      {
        key: "change-schedule-change-rest-day",
        label: "Change Rest Day",
        path: "/change-schedule/change-rest-day",
        permission: "Change Rest Day:View",
      },
      {
        key: "change-schedule-change-holiday",
        label: "Change Holiday",
        path: "/change-schedule/change-holiday",
        permission: "Change Holiday:View",
      },
    ],
  },
  {
    key: "daily-time-record",
    feature: FEATURE_KEYS.TIMEKEEPING_CORE,
    label: "DTR Generation",
    children: [
      {
        key: "daily-time-record-master",
        label: "Calculate Daily Time Record",
        path: "/daily-time-record/master",
        permission: "DTR Master:View",
      },
      {
        key: "daily-time-record-summary",
        label: "DTR Summary",
        path: "/daily-time-record/summary",
        permission: "DTR Summary:View",
      },
    ],
  },
  {
    key: "nav-payroll",
    feature: FEATURE_KEYS.PAYROLL_CORE,
    label: "Payroll Generation",
    type: "group",
    children: [
      {
        key: "payroll-run",
        label: "Payroll Run",
        path: "/daily-time-record/for-payroll",
        permission: "Payroll Run:View",
      },
      {
        key: "payroll-summary",
        label: "Payroll Summary",
        path: "/payroll/summary",
        permission: "Payroll Summary:View",
      },
      {
        key: "payroll-run-13th-month",
        label: "Generate 13th Month Pay",
        path: "/daily-time-record/for-13th-month",
        permission: "13th Month Run:View",
      },
      {
        key: "payroll-run-last-pay",
        label: "Generate Last Pay",
        path: "/daily-time-record/for-last-pay",
        permission: "Last Pay Run:View",
      },
      {
        key: "payroll-run-year-end-adjustment",
        label: "Year-End Tax Adjustment",
        path: "/daily-time-record/for-year-end-adjustment",
        permission: "Year-End Adjustment Run:View",
      },
    ],
  },
  {
    key: "applications",
    label: "Applications",
    children: [
      {
        key: "applications-leave",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Leave",
        path: "/applications/leave",
        permission: "Leave:View",
      },
      {
        key: "applications-overtime",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Overtime",
        path: "/applications/overtime",
        permission: "Overtime:View",
      },
      {
        key: "applications-official-business",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Official Business",
        path: "/applications/official-business",
        permission: "Official Business:View",
      },
      {
        key: "applications-pass-slip",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Pass Slip",
        path: "/applications/pass-slip",
        permission: "Pass Slip:View",
      },
      {
        key: "applications-profile-update",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Profile Update Requests",
        path: "/applications/profile-update-request",
        permission: "Profile Update:View",
      },
      {
        key: "applications-divider-1",
        label: "",
        type: "divider",
      },
      {
        key: "applications-deduction",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Loans & Deductions",
        path: "/applications/deduction-application",
        permission: "Loan/Deduction:View",
      },
      {
        key: "applications-other-income",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Other Income",
        path: "/applications/other-income",
        permission: "Other Income:View",
      },
      {
        key: "applications-salary-adjustment",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Salary Adjustments",
        permission: "Salary Adjustment:View",
        path: "/applications/salary-adjustment",
      },
    ],
  },
  // Every master-data/configuration screen lives here, consolidated under one
  // group instead of being split across top-level Organization/Workforce
  // entries plus a catch-all "Admin" group.
  {
    key: "nav-setup",
    feature: BASE_FEATURE,
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
            feature: FEATURE_KEYS.CLIENTS_AGENCY,
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
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
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
      // Tagged per item rather than on the group -- each screen here belongs to a
      // different catalog feature (Holiday Setup, Minimum Wage Setup, Leave Setup).
      {
        key: "setup-others",
        label: "Holidays & Leave Types",
        type: "group",
        children: [
          {
            key: "setup-holiday",
            label: "Holidays",
            path: "/setup/holiday",
            permission: "Holiday Setup:View",
          },
          {
            key: "setup-minimum-wage-rate",
            feature: FEATURE_KEYS.PAYROLL_CORE,
            label: "Minimum Wage Rates",
            path: "/setup/minimum-wage-rate",
            permission: "Minimum Wage Setup:View",
          },
          {
            key: "setup-leave-type",
            label: "Leave Types",
            path: "/setup/leave-type",
            permission: "Leave Setup:View",
          },
          {
            key: "setup-leave-balance",
            label: "Leave Balances",
            path: "/setup/leave-balance",
            permission: "Leave Setup:View",
          },
        ],
      },
      {
        key: "setup-group-statutory",
        feature: FEATURE_KEYS.PAYROLL_CORE,
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
      {
        key: "biometric",
        feature: FEATURE_KEYS.TIMEKEEPING_BIOMETRIC,
        label: "Biometric",
        type: "group",
        children: [
          {
            key: "enroll-biometrics",
            label: "Enroll Biometrics",
            path: "/enroll-biometrics",
            permission: "Biometric Setup:View",
          },
          {
            key: "biometric-manage-devices",
            label: "Manage Devices",
            path: "/biometric/manage-devices",
            permission: "Biometric Setup:View",
          },
        ],
      },
      {
        key: "setup-group-approvals",
        label: "Approvals",
        type: "group",
        children: [
          {
            key: "setup-approval-workflows",
            label: "Approval Workflows",
            path: "/setup/approval-workflows",
            permission: "Approval Workflows:View",
          },
        ],
      },
    ],
  },
  {
    key: "analytics",
    feature: FEATURE_KEYS.ANALYTICS,
    label: "Analytics",
    children: [
      {
        key: "analytics-workforce",
        label: "Workforce",
        path: "/analytics/workforce",
        permission: "Workforce Analytics:View",
      },
      {
        key: "analytics-attendance",
        label: "Attendance & Time",
        path: "/analytics/attendance",
        permission: "Attendance Analytics:View",
      },
      {
        key: "analytics-payroll",
        label: "Payroll & Labor Cost",
        path: "/analytics/payroll",
        permission: "Payroll Analytics:View",
      },
      {
        key: "analytics-requests",
        label: "Leave & Requests",
        path: "/analytics/requests",
        permission: "Request Analytics:View",
      },
    ],
  },
  {
    key: "reports",
    feature: BASE_FEATURE,
    label: "Reports",
    path: "/reports",
    // The group has its own /reports path, so it needs a gate of its own -- any report
    // permission. Each child still narrows this to its specific code.
    permission: [
      "Attendance Reports:View",
      "Government Statutory Reports:View",
      "Payroll Reports:View",
      "BIR Reports:View",
    ],
    children: [
      {
        key: "reports-tardiness",
        feature: FEATURE_KEYS.TIMEKEEPING_CORE,
        label: "Tardiness",
        path: "/reports/tardiness",
        permission: "Attendance Reports:View",
      },
      // {
      //   key: "reports-rostering",
      //   feature: FEATURE_KEYS.TIMEKEEPING_CORE,
      //   label: "Rostering",
      //   path: "/reports/rostering",
      //   permission: "Attendance Reports:View",
      // },
      {
        key: "payroll-reports-sss",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "SSS Remittance",
        path: "/payroll/reports/sss-remittance",
        permission: "Government Statutory Reports:View",
      },
      {
        key: "payroll-reports-philhealth",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "PhilHealth Remittance",
        path: "/payroll/reports/philhealth-remittance",
        permission: "Government Statutory Reports:View",
      },
      {
        key: "payroll-reports-pagibig",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "Pag-IBIG Remittance",
        path: "/payroll/reports/pagibig-remittance",
        permission: "Government Statutory Reports:View",
      },
      {
        key: "payroll-reports-wtax",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "BIR Withholding Tax",
        path: "/payroll/reports/wtax-remittance",
        permission: "Government Statutory Reports:View",
      },
      {
        key: "payroll-reports-bank",
        feature: FEATURE_KEYS.PAYROLL_CORE,
        label: "Disbursement",
        path: "/payroll/reports/bank-disbursement",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-deductions",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Deduction Ledger",
        path: "/payroll/reports/deduction-ledger",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-cash-bond",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Cash Bond Tracking",
        path: "/payroll/reports/cash-bond",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-leave",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Leave Ledger",
        path: "/payroll/reports/leave-ledger",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-retirement",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Retirement Ledger",
        path: "/payroll/reports/retirement-ledger",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-uniform-allowance",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Uniform Allowance Ledger",
        path: "/payroll/reports/uniform-allowance-ledger",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-reimbursement",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Reimbursement List",
        path: "/payroll/reports/reimbursement-list",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-cost",
        feature: FEATURE_KEYS.CLIENTS_AGENCY,
        label: "Cost Summary",
        path: "/payroll/reports/cost-summary",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-ytd",
        feature: FEATURE_KEYS.PAYROLL_CORE,
        label: "YTD Summary",
        path: "/payroll/reports/ytd-summary",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-13th",
        feature: FEATURE_KEYS.PAYROLL_CORE,
        label: "13th Month Pay",
        path: "/payroll/reports/13th-month-pay",
        permission: "Payroll Reports:View",
      },
      {
        key: "payroll-reports-bir-1601c",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "BIR 1601-C Monthly Remittance",
        path: "/payroll/reports/bir-1601c",
        permission: "BIR Reports:View",
      },
      {
        key: "payroll-reports-bir-alphalist",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "BIR Alphalist",
        path: "/payroll/reports/bir-alphalist",
        permission: "BIR Reports:View",
      },
      {
        key: "payroll-reports-bir-2316",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "BIR 2316 Certificate",
        path: "/payroll/reports/bir-2316",
        permission: "BIR Reports:View",
      },
      {
        key: "payroll-reports-sss-r3",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "SSS R3 File",
        path: "/payroll/reports/sss-r3",
        permission: "BIR Reports:View",
      },
      {
        key: "payroll-reports-philhealth-eprs",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "PhilHealth EPRS File",
        path: "/payroll/reports/philhealth-eprs",
        permission: "BIR Reports:View",
      },
      {
        key: "payroll-reports-pagibig-mcrf",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "Pag-IBIG MCRF File",
        path: "/payroll/reports/pagibig-mcrf",
        permission: "BIR Reports:View",
      },
    ],
  },
  {
    key: "communication",
    label: "Communication",
    children: [
      {
        key: "communication-announcements",
        feature: FEATURE_KEYS.ANNOUNCEMENTS,
        label: "Announcements",
        path: "/communication/announcements",
        permission: "Announcements:View",
      },
    ],
  },
  {
    key: "client-portal",
    feature: FEATURE_KEYS.CLIENT_PORTAL_CORE,
    label: "Client Services",
    children: [
      {
        key: "client-portal-clients",
        label: "Portal Clients",
        path: "/client-portal/clients",
        permission: "clientportal:Client:Manage",
      },
      {
        key: "client-portal-verification",
        label: "DTR Verification",
        path: "/client-portal/verification",
        permission: "clientportal:Client:Manage",
      },
      {
        key: "client-portal-billing-setup",
        label: "Billing Setup",
        path: "/client-portal/billing-setup",
        permission: "clientportal:Billing:View",
      },
      {
        key: "client-portal-invoices",
        label: "Invoices",
        path: "/client-portal/invoices",
        permission: "clientportal:Billing:View",
      },
      {
        key: "client-portal-payments",
        label: "Client Payments",
        path: "/client-portal/payments",
        permission: "clientportal:Billing:View",
      },
      {
        key: "client-portal-disputes",
        label: "Billing Disputes",
        path: "/client-portal/disputes",
        permission: "clientportal:Billing:View",
      },
      {
        key: "client-portal-statements",
        label: "Statements",
        path: "/client-portal/statements",
        permission: "clientportal:Billing:View",
      },
      {
        key: "client-portal-reports",
        label: "Billing Reports",
        path: "/client-portal/reports",
        permission: "clientportal:Billing:View",
      },
      {
        key: "client-portal-manpower",
        label: "Manpower Requests",
        path: "/client-portal/manpower",
        permission: "clientportal:Operations:View",
      },
      {
        key: "client-portal-guard-documents",
        label: "Guard Documents",
        path: "/client-portal/guard-documents",
        permission: "clientportal:Operations:View",
      },
      {
        key: "client-portal-scorecard",
        label: "Service Scorecard",
        path: "/client-portal/scorecard",
        permission: "clientportal:Operations:View",
      },
      {
        key: "client-portal-notices",
        label: "Client Notice Board",
        path: "/client-portal/notices",
        permission: "clientportal:Operations:View",
      },
      {
        key: "client-portal-integrations",
        label: "Integrations",
        path: "/client-portal/integrations",
        permission: "clientportal:Client:Manage",
      },
      {
        key: "client-portal-connection",
        label: "Portal Connection",
        path: "/client-portal/connection",
        permission: "clientportal:Client:Manage",
      },
    ],
  },
  {
    key: "security",
    feature: BASE_FEATURE,
    label: "Security",
    children: [
      {
        key: "security-users",
        label: "Users",
        path: "/security/users",
        permission: ["Users:View", "Tenant Members:Manage"],
      },
      {
        key: "security-roles",
        label: "Roles",
        path: "/security/roles",
        permission: ["Roles:View", "Tenant Roles:Manage"],
      },
      {
        key: "security-permissions",
        label: "Permissions",
        path: "/security/permissions",
        permission: ["Permissions:View", "Tenant Roles:Manage"],
      },
      {
        key: "security-audit",
        feature: FEATURE_KEYS.AUDIT_TRAIL,
        label: "Audit",
        path: "/security/audit",
        permission: "Audit Trail:View",
      },
      {
        key: "security-billing",
        feature: BASE_FEATURE,
        label: "Billing",
        path: "/billing",
        permission: "Billing:View",
      },
      {
        key: "security-storage",
        feature: BASE_FEATURE,
        label: "Storage",
        path: "/billing/storage",
        permission: ["Storage:View", "Storage:Manage"],
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
