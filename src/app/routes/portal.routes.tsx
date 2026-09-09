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
const PortalOvertimeList = lazy(
  () => import("@/app/modules/portal/overtime/pages/portal-overtime-list"),
);
const PortalOvertimeCreate = lazy(
  () => import("@/app/modules/portal/overtime/pages/portal-overtime-create"),
);
const PortalOfficialBusinessList = lazy(
  () =>
    import("@/app/modules/portal/official-business/pages/portal-official-business-list"),
);
const PortalOfficialBusinessCreate = lazy(
  () =>
    import("@/app/modules/portal/official-business/pages/portal-official-business-create"),
);
const PortalPassSlipList = lazy(
  () => import("@/app/modules/portal/pass-slip/pages/portal-pass-slip-list"),
);
const PortalPassSlipCreate = lazy(
  () => import("@/app/modules/portal/pass-slip/pages/portal-pass-slip-create"),
);
const PortalChangeRestDayList = lazy(
  () =>
    import("@/app/modules/portal/change-rest-day/pages/portal-change-rest-day-list"),
);
const PortalChangeRestDayCreate = lazy(
  () =>
    import("@/app/modules/portal/change-rest-day/pages/portal-change-rest-day-create"),
);
const PortalLoanApplicationList = lazy(
  () =>
    import("@/app/modules/portal/loan-application/pages/portal-loan-application-list"),
);
const PortalLoanApplicationCreate = lazy(
  () =>
    import("@/app/modules/portal/loan-application/pages/portal-loan-application-create"),
);
const PortalThirteenthMonth = lazy(
  () =>
    import("@/app/modules/portal/thirteenth-month/pages/portal-thirteenth-month"),
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
  { path: "overtime", component: PortalOvertimeList },
  { path: "overtime/create", component: PortalOvertimeCreate },
  { path: "official-business", component: PortalOfficialBusinessList },
  { path: "official-business/create", component: PortalOfficialBusinessCreate },
  { path: "pass-slip", component: PortalPassSlipList },
  { path: "pass-slip/create", component: PortalPassSlipCreate },
  { path: "change-rest-day", component: PortalChangeRestDayList },
  { path: "change-rest-day/create", component: PortalChangeRestDayCreate },
  { path: "loan-applications", component: PortalLoanApplicationList },
  { path: "loan-applications/create", component: PortalLoanApplicationCreate },
  { path: "thirteenth-month", component: PortalThirteenthMonth },
];
