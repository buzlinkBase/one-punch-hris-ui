import { lazy } from "react";
import type { SetupRouteConfig } from "./setup.routes";

const PortalProfile = lazy(
  () => import("@/app/modules/portal/profile/pages/portal-profile"),
);
const PortalPayslips = lazy(
  () => import("@/app/modules/portal/payslips/pages/portal-payslips"),
);
const PortalDtr = lazy(
  () => import("@/app/modules/portal/dtr/pages/portal-dtr"),
);
const PortalIncompletePunches = lazy(
  () =>
    import("@/app/modules/portal/incomplete-punches/pages/portal-incomplete-punches"),
);
const PortalShiftSchedule = lazy(
  () =>
    import("@/app/modules/portal/shift-schedule/pages/portal-shift-schedule"),
);

export const portalRoutes: SetupRouteConfig[] = [
  { path: "profile", component: PortalProfile },
  { path: "payslips", component: PortalPayslips },
  { path: "dtr", component: PortalDtr },
  { path: "incomplete-punches", component: PortalIncompletePunches },
  { path: "shift-schedule", component: PortalShiftSchedule },
];
