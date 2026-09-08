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
const PortalLeaveCredits = lazy(
  () => import("@/app/modules/portal/leave-credits/pages/portal-leave-credits"),
);
const PortalLeaveApplicationList = lazy(
  () =>
    import("@/app/modules/portal/leave-application/pages/portal-leave-application-list"),
);
const PortalLeaveApplicationCreate = lazy(
  () =>
    import("@/app/modules/portal/leave-application/pages/portal-leave-application-create"),
);

export const portalRoutes: SetupRouteConfig[] = [
  { path: "profile", component: PortalProfile },
  { path: "payslips", component: PortalPayslips },
  { path: "dtr", component: PortalDtr },
  { path: "incomplete-punches", component: PortalIncompletePunches },
  { path: "shift-schedule", component: PortalShiftSchedule },
  { path: "leave-credits", component: PortalLeaveCredits },
  { path: "leave-applications", component: PortalLeaveApplicationList },
  {
    path: "leave-applications/create",
    component: PortalLeaveApplicationCreate,
  },
];
