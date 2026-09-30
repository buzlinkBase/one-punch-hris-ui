import { lazy } from "react";
import type { SetupRouteConfig } from "./setup.routes";

const WorkforceAnalytics = lazy(
  () => import("@/app/modules/analytics/pages/workforce-analytics"),
);
const AttendanceAnalytics = lazy(
  () => import("@/app/modules/analytics/pages/attendance-analytics"),
);
const PayrollAnalytics = lazy(
  () => import("@/app/modules/analytics/pages/payroll-analytics"),
);
const RequestAnalytics = lazy(
  () => import("@/app/modules/analytics/pages/request-analytics"),
);

// Children of /analytics -- each gated on its own "<Area> Analytics:View" through its nav entry
// (see getPermissionForPath).
export const analyticsRoutes: SetupRouteConfig[] = [
  { path: "workforce", component: WorkforceAnalytics },
  { path: "attendance", component: AttendanceAnalytics },
  { path: "payroll", component: PayrollAnalytics },
  { path: "requests", component: RequestAnalytics },
];

/** The Analytics pages in menu order, for landing on the first one a user may open. */
export const ANALYTICS_PAGES = [
  { path: "/analytics/workforce", permission: "Workforce Analytics:View" },
  { path: "/analytics/attendance", permission: "Attendance Analytics:View" },
  { path: "/analytics/payroll", permission: "Payroll Analytics:View" },
  { path: "/analytics/requests", permission: "Request Analytics:View" },
] as const;
