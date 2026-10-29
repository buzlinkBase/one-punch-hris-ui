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

interface RouteAlias {
  path: string;
  as: string;
  exact?: boolean;
}

/**
 * Routes with no menu entry of their own, gated as the menu page they belong to. The route guard
 * only knows the menu, so a route missing from both the menu and this list needs no permission
 * at all -- any signed-in member could open it by URL.
 */
export const ROUTE_ALIASES: RouteAlias[] = [
  { path: "/setup", as: "/setup/department", exact: true },
  { path: "/portal", as: "/portal/dashboard", exact: true },
  { path: "/setup/time-shift/flexi", as: "/setup/time-shift/split" },
  { path: "/setup/deduction-type", as: "/setup/deduction" },
  { path: "/setup/other-income-type", as: "/setup/other-income" },
  { path: "/daily-time-record/detail", as: "/daily-time-record/master" },
];

/** The menu path whose permission and features `path` is gated by. */
export function resolveNavPath(path: string): string {
  const alias = ROUTE_ALIASES.find((a) =>
    a.exact
      ? path === a.path
      : path === a.path || path.startsWith(`${a.path}/`),
  );
  return alias?.as ?? path;
}

/** Returns the most specific permission attached to a navigation path. */
export function getPermissionForPath(
  rawPath: string,
  items: NavItem[] = NAVIGATION_ITEMS,
): string | string[] | undefined {
  const path = resolveNavPath(rawPath);
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
  rawPath: string,
  items: NavItem[] = NAVIGATION_ITEMS,
): NavFeature[] {
  const path = resolveNavPath(rawPath);
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

// Ordered by the pay cycle: capture attendance, adjust schedules, file applications, process
// the DTR, run payroll, then report on it. Setup and Administration sit last.
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
        key: "portal-dashboard",
        label: "My Dashboard",
        path: "/portal/dashboard",
      },
      {
        key: "portal-profile",
        label: "My Profile",
        path: "/portal/profile",
      },
      {
        key: "portal-approvals",
        label: "My Approvals",
        path: "/portal/approvals",
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
            key: "portal-punch",
            label: "Punch In / Out",
            path: "/portal/punch",
          },
          {
            key: "portal-incomplete-punches",
            label: "My Incomplete Logs",
            path: "/portal/incomplete-punches",
          },
          {
            key: "portal-raw-attendance",
            label: "My Attendance Logs",
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
            label: "My Payslips",
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
  // The most-used screen, so it sits at the top level instead of under Setup.
  {
    key: "employees",
    feature: BASE_FEATURE,
    label: "Employees",
    path: "/setup/employee",
    permission: "Workforce Setup:View",
  },
  {
    key: "nav-dtr",
    feature: FEATURE_KEYS.TIMEKEEPING_CORE,
    label: "Timekeeping",
    type: "group",
    children: [
      {
        key: "timekeeping-raw-logs",
        label: "Attendance Logs",
        path: "/timekeeping/raw-logs",
        permission: "Raw Logs:View",
      },
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
        key: "timekeeping-incomplete-punches",
        label: "Incomplete Logs",
        path: "/timekeeping/incomplete-punches",
        permission: "Incomplete Punches:View",
      },
      {
        key: "timekeeping-unregistered-employees",
        label: "Unregistered Employees",
        path: "/timekeeping/unregistered-employees",
        permission: "Unregistered Employees:View",
      },
    ],
  },
  // Schedule adjustments feed directly into DTR calculation, so they sit right after
  // Timekeeping.
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
  // Before DTR Processing: approved leave, overtime and official business feed the DTR.
  {
    key: "applications",
    label: "Applications",
    children: [
      // The one inbox for every request the person is involved in as an approver -- the same page
      // as My Portal > My Approvals, for admin-side approvers.
      {
        key: "applications-approvals",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Approvals",
        path: "/approvals",
        permission: [
          "Leave:Approve",
          "Overtime:Approve",
          "Official Business:Approve",
          "Pass Slip:Approve",
          "Loan/Deduction:Approve",
          "Profile Update:Approve",
        ],
      },
      {
        key: "applications-group-time",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Time & Leave",
        type: "group",
        children: [
          {
            key: "applications-leave",
            label: "Leave",
            path: "/applications/leave",
            permission: "Leave:View",
          },
          {
            key: "applications-overtime",
            label: "Overtime",
            path: "/applications/overtime",
            permission: "Overtime:View",
          },
          {
            key: "applications-official-business",
            label: "Official Business",
            path: "/applications/official-business",
            permission: "Official Business:View",
          },
          {
            key: "applications-pass-slip",
            label: "Pass Slip",
            path: "/applications/pass-slip",
            permission: "Pass Slip:View",
          },
        ],
      },
      {
        key: "applications-group-pay",
        feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
        label: "Pay & Loans",
        type: "group",
        children: [
          {
            key: "applications-deduction",
            label: "Loans & Deductions",
            path: "/applications/deduction-application",
            permission: "Loan/Deduction:View",
          },
          {
            key: "applications-other-income",
            label: "Other Income",
            path: "/applications/other-income",
            permission: "Other Income:View",
          },
          {
            key: "applications-salary-adjustment",
            label: "Salary Adjustments",
            path: "/applications/salary-adjustment",
            permission: "Salary Adjustment:View",
          },
        ],
      },
      {
        key: "applications-profile-update",
        feature: FEATURE_KEYS.APPLICATIONS_CORE,
        label: "Profile Updates",
        path: "/applications/profile-update-request",
        permission: "Profile Update:View",
      },
    ],
  },
  {
    key: "daily-time-record",
    feature: FEATURE_KEYS.TIMEKEEPING_CORE,
    label: "DTR Processing",
    children: [
      {
        key: "daily-time-record-master",
        label: "Process DTR",
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
    label: "Payroll",
    type: "group",
    children: [
      {
        key: "payroll-run",
        label: "Payroll Run",
        path: "/daily-time-record/for-payroll",
        permission: "Payroll Run:View",
      },
      {
        key: "payroll-run-13th-month",
        label: "13th Month Run",
        path: "/daily-time-record/for-13th-month",
        permission: "13th Month Run:View",
      },
      {
        key: "payroll-run-last-pay",
        label: "Last Pay Run",
        path: "/daily-time-record/for-last-pay",
        permission: "Last Pay Run:View",
      },
      {
        key: "payroll-run-year-end-adjustment",
        label: "Year-End Adjustment Run",
        path: "/daily-time-record/for-year-end-adjustment",
        permission: "Year-End Adjustment Run:View",
      },
      {
        key: "payroll-summary",
        label: "Payroll Summary",
        path: "/payroll/summary",
        permission: "Payroll Summary:View",
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
      "DTR Master:View",
      "Government Statutory Reports:View",
      "Payroll Reports:View",
      "BIR Reports:View",
    ],
    children: [
      {
        key: "reports-group-attendance",
        feature: FEATURE_KEYS.TIMEKEEPING_CORE,
        label: "Attendance",
        type: "group",
        children: [
          {
            key: "reports-tardiness",
            label: "Tardiness",
            path: "/reports/tardiness",
            permission: "Attendance Reports:View",
          },
          {
            key: "reports-dtr-detail",
            label: "DTR Detail",
            path: "/reports/dtr-detail",
            permission: "DTR Master:View",
          },
          // {
          //   key: "reports-rostering",
          //   label: "Rostering",
          //   path: "/reports/rostering",
          //   permission: "Attendance Reports:View",
          // },
        ],
      },
      {
        key: "reports-group-payroll",
        label: "Payroll",
        type: "group",
        permission: "Payroll Reports:View",
        children: [
          {
            key: "payroll-reports-bank",
            feature: FEATURE_KEYS.PAYROLL_CORE,
            label: "Disbursement",
            path: "/payroll/reports/bank-disbursement",
          },
          {
            key: "payroll-reports-ytd",
            feature: FEATURE_KEYS.PAYROLL_CORE,
            label: "YTD Summary",
            path: "/payroll/reports/ytd-summary",
          },
          {
            key: "payroll-reports-13th",
            feature: FEATURE_KEYS.PAYROLL_CORE,
            label: "13th Month Pay",
            path: "/payroll/reports/13th-month-pay",
          },
          {
            key: "payroll-reports-cost",
            feature: FEATURE_KEYS.CLIENTS_AGENCY,
            label: "Cost Summary",
            path: "/payroll/reports/cost-summary",
          },
        ],
      },
      {
        key: "reports-group-ledgers",
        label: "Ledgers",
        type: "group",
        permission: "Payroll Reports:View",
        children: [
          {
            key: "payroll-reports-deductions",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Deduction Ledger",
            path: "/payroll/reports/deduction-ledger",
          },
          {
            key: "payroll-reports-cash-bond",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Cash Bond Ledger",
            path: "/payroll/reports/cash-bond",
          },
          {
            key: "payroll-reports-leave",
            feature: FEATURE_KEYS.APPLICATIONS_CORE,
            label: "Leave Ledger",
            path: "/payroll/reports/leave-ledger",
          },
          {
            key: "payroll-reports-retirement",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Retirement Ledger",
            path: "/payroll/reports/retirement-ledger",
          },
          {
            key: "payroll-reports-uniform-allowance",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Uniform Allowance Ledger",
            path: "/payroll/reports/uniform-allowance-ledger",
          },
          {
            key: "payroll-reports-reimbursement",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Reimbursement List",
            path: "/payroll/reports/reimbursement-list",
          },
        ],
      },
      // Paired by agency: each remittance report sits next to its e-filing file.
      {
        key: "reports-group-contributions",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "SSS · PhilHealth · Pag-IBIG",
        type: "group",
        permission: "Government Statutory Reports:View",
        children: [
          {
            key: "payroll-reports-sss",
            label: "SSS Remittance",
            path: "/payroll/reports/sss-remittance",
          },
          {
            key: "payroll-reports-sss-r3",
            label: "SSS R3 File",
            path: "/payroll/reports/sss-r3",
          },
          {
            key: "payroll-reports-philhealth",
            label: "PhilHealth Remittance",
            path: "/payroll/reports/philhealth-remittance",
          },
          {
            key: "payroll-reports-philhealth-eprs",
            label: "PhilHealth EPRS File",
            path: "/payroll/reports/philhealth-eprs",
          },
          {
            key: "payroll-reports-pagibig",
            label: "Pag-IBIG Remittance",
            path: "/payroll/reports/pagibig-remittance",
          },
          {
            key: "payroll-reports-pagibig-mcrf",
            label: "Pag-IBIG MCRF File",
            path: "/payroll/reports/pagibig-mcrf",
          },
        ],
      },
      // Withholding Tax is gated as a Government Statutory report while the BIR forms need BIR
      // Reports, so this group gates per item.
      {
        key: "reports-group-bir",
        feature: FEATURE_KEYS.REPORTS_STATUTORY,
        label: "BIR",
        type: "group",
        children: [
          {
            key: "payroll-reports-wtax",
            label: "BIR Withholding Tax",
            path: "/payroll/reports/wtax-remittance",
            permission: "Government Statutory Reports:View",
          },
          {
            key: "payroll-reports-bir-1601c",
            label: "BIR 1601-C Monthly Remittance",
            path: "/payroll/reports/bir-1601c",
            permission: "BIR Reports:View",
          },
          {
            key: "payroll-reports-bir-alphalist",
            label: "BIR Alphalist",
            path: "/payroll/reports/bir-alphalist",
            permission: "BIR Reports:View",
          },
          {
            key: "payroll-reports-bir-2316",
            label: "BIR 2316 Certificate",
            path: "/payroll/reports/bir-2316",
            permission: "BIR Reports:View",
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
    key: "announcements",
    feature: FEATURE_KEYS.ANNOUNCEMENTS,
    label: "Announcements",
    path: "/communication/announcements",
    permission: "Announcements:View",
  },
  {
    key: "client-portal",
    feature: FEATURE_KEYS.CLIENT_PORTAL_CORE,
    label: "Client Services",
    children: [
      {
        key: "client-portal-group-operations",
        label: "Clients & Operations",
        type: "group",
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
        ],
      },
      {
        key: "client-portal-group-billing",
        label: "Billing",
        type: "group",
        permission: "clientportal:Billing:View",
        children: [
          {
            key: "client-portal-billing-setup",
            label: "Billing Setup",
            path: "/client-portal/billing-setup",
          },
          {
            key: "client-portal-invoices",
            label: "Invoices",
            path: "/client-portal/invoices",
          },
          {
            key: "client-portal-payments",
            label: "Client Payments",
            path: "/client-portal/payments",
          },
          {
            key: "client-portal-disputes",
            label: "Billing Disputes",
            path: "/client-portal/disputes",
          },
          {
            key: "client-portal-statements",
            label: "Statements",
            path: "/client-portal/statements",
          },
          {
            key: "client-portal-reports",
            label: "Billing Reports",
            path: "/client-portal/reports",
          },
        ],
      },
      {
        key: "client-portal-group-settings",
        label: "Portal Settings",
        type: "group",
        permission: "clientportal:Client:Manage",
        children: [
          {
            key: "client-portal-integrations",
            label: "Integrations",
            path: "/client-portal/integrations",
          },
          {
            key: "client-portal-connection",
            label: "Portal Connection",
            path: "/client-portal/connection",
          },
        ],
      },
    ],
  },
  // Every master-data/configuration screen lives here. A group's permission hides the whole
  // group, so groups that mix permissions (Organization, Time Shifts, Pay Components) tag each
  // item instead.
  {
    key: "nav-setup",
    feature: BASE_FEATURE,
    label: "Setup",
    type: "group",
    children: [
      {
        key: "setup-company-settings",
        label: "Company Settings",
        path: "/setup/company-policy",
        permission: "Organization Setup:View",
      },
      {
        key: "setup-group-org",
        label: "Organization",
        type: "group",
        children: [
          {
            key: "setup-branch",
            label: "Branches",
            path: "/setup/branch",
            permission: "Organization Setup:View",
          },
          {
            key: "setup-project-site",
            label: "Project Sites",
            path: "/setup/project-site",
            permission: "Organization Setup:View",
          },
          {
            key: "setup-department",
            label: "Departments",
            path: "/setup/department",
            permission: "Organization Setup:View",
          },
          {
            key: "setup-section",
            label: "Sections",
            path: "/setup/section",
            permission: "Organization Setup:View",
          },
          {
            key: "setup-position",
            label: "Positions",
            path: "/setup/position",
            permission: "Organization Setup:View",
          },
          {
            key: "setup-payroll-group",
            label: "Payroll Groups",
            path: "/setup/payroll-group",
            permission: "Organization Setup:View",
          },
          {
            key: "setup-client",
            feature: FEATURE_KEYS.CLIENTS_AGENCY,
            label: "Clients",
            path: "/setup/client",
            permission: "Workforce Setup:View",
          },
        ],
      },
      {
        key: "setup-group-shifts",
        label: "Time Shifts",
        type: "group",
        children: [
          {
            key: "setup-fixed-shift",
            label: "Fixed Shifts",
            path: "/setup/time-shift/fixed",
            permission: "Time Shift Setup:View",
          },
          {
            key: "setup-split-shift",
            label: "Flexi & Split Shifts",
            path: "/setup/time-shift/split",
            permission: "Time Shift Setup:View",
          },
          {
            key: "setup-holiday",
            label: "Holidays",
            path: "/setup/holiday",
            permission: "Holiday Setup:View",
          },
        ],
      },
      {
        key: "setup-group-leave",
        label: "Leave",
        type: "group",
        permission: "Leave Setup:View",
        children: [
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
        key: "setup-group-pay",
        label: "Pay Components",
        type: "group",
        children: [
          {
            key: "setup-deduction",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Deductions",
            path: "/setup/deduction",
            permission: "Deductions & Income Setup:View",
          },
          {
            key: "setup-other-income",
            feature: FEATURE_KEYS.PAYROLL_LOANS_INCOME,
            label: "Other Income",
            path: "/setup/other-income",
            permission: "Deductions & Income Setup:View",
          },
          {
            key: "setup-minimum-wage-rate",
            feature: FEATURE_KEYS.PAYROLL_CORE,
            label: "Minimum Wage Rates",
            path: "/setup/minimum-wage-rate",
            permission: "Minimum Wage Setup:View",
          },
        ],
      },
      {
        key: "setup-group-statutory",
        feature: FEATURE_KEYS.PAYROLL_CORE,
        label: "Statutory Tables",
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
        label: "Biometrics",
        type: "group",
        permission: "Biometric Setup:View",
        children: [
          {
            key: "enroll-biometrics",
            label: "Enroll Biometrics",
            path: "/enroll-biometrics",
          },
          {
            key: "biometric-manage-devices",
            label: "Devices",
            path: "/biometric/manage-devices",
          },
        ],
      },
      {
        key: "setup-group-approvals",
        label: "Approvals",
        type: "group",
        permission: "Approval Workflows:View",
        children: [
          {
            key: "setup-approval-workflows",
            label: "Workflows",
            path: "/setup/approval-workflows",
          },
          {
            key: "setup-approval-delegations",
            label: "Delegations",
            path: "/setup/approval-delegations",
          },
        ],
      },
    ],
  },
  {
    key: "administration",
    feature: BASE_FEATURE,
    label: "Administration",
    children: [
      {
        key: "administration-group-access",
        label: "Users & Access",
        type: "group",
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
            label: "Audit Trail",
            path: "/security/audit",
            permission: "Audit Trail:View",
          },
        ],
      },
      {
        key: "administration-group-subscription",
        label: "Subscription",
        type: "group",
        children: [
          {
            key: "security-billing",
            label: "Billing",
            path: "/billing",
            permission: "Billing:View",
          },
          {
            key: "security-storage",
            label: "Storage",
            path: "/billing/storage",
            permission: ["Storage:View", "Storage:Manage"],
          },
        ],
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
