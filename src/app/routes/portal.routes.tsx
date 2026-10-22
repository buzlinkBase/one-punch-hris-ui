import { lazy } from "react";
import type { SetupRouteConfig } from "./setup.routes";

const PortalProfile = lazy(
  () => import("@/app/modules/portal/profile/pages/portal-profile"),
);
const PortalProfileEdit = lazy(
  () => import("@/app/modules/portal/profile/pages/portal-profile-edit"),
);
const PortalAnnouncements = lazy(
  () => import("@/app/modules/portal/announcements/pages/portal-announcements"),
);
const PortalAnnouncementReader = lazy(
  () =>
    import("@/app/modules/portal/announcements/pages/portal-announcement-reader"),
);
const PortalCoworkers = lazy(
  () => import("@/app/modules/portal/coworkers/pages/portal-coworkers"),
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
const PortalRawAttendance = lazy(
  () =>
    import("@/app/modules/portal/raw-attendance/pages/portal-raw-attendance"),
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
const PortalLoanApplicationList = lazy(
  () =>
    import("@/app/modules/portal/loan-application/pages/portal-loan-application-list"),
);
const PortalLoanApplicationCreate = lazy(
  () =>
    import("@/app/modules/portal/loan-application/pages/portal-loan-application-create"),
);
const PortalCashBond = lazy(
  () => import("@/app/modules/portal/cash-bond/pages/portal-cash-bond"),
);
const PortalUniformAllowance = lazy(
  () =>
    import("@/app/modules/portal/uniform-allowance/pages/portal-uniform-allowance"),
);
const PortalThirteenthMonth = lazy(
  () =>
    import("@/app/modules/portal/thirteenth-month/pages/portal-thirteenth-month"),
);

export const portalRoutes: SetupRouteConfig[] = [
  { path: "profile", component: PortalProfile },
  { path: "profile/edit", component: PortalProfileEdit },
  { path: "announcements", component: PortalAnnouncements },
  { path: "announcements/$id", component: PortalAnnouncementReader },
  { path: "coworkers", component: PortalCoworkers },
  { path: "payslips", component: PortalPayslips },
  { path: "dtr", component: PortalDtr },
  { path: "incomplete-punches", component: PortalIncompletePunches },
  { path: "raw-attendance", component: PortalRawAttendance },
  { path: "shift-schedule", component: PortalShiftSchedule },
  { path: "leave-credits", component: PortalLeaveCredits },
  { path: "leave-applications", component: PortalLeaveApplicationList },
  {
    path: "leave-applications/create",
    component: PortalLeaveApplicationCreate,
  },
  // The create page doubles as edit ($id) and read-only view ($id/view) -- see
  // usePortalFormMode.
  {
    path: "leave-applications/$id",
    component: PortalLeaveApplicationCreate,
  },
  {
    path: "leave-applications/$id/view",
    component: PortalLeaveApplicationCreate,
  },
  { path: "overtime", component: PortalOvertimeList },
  { path: "overtime/create", component: PortalOvertimeCreate },
  { path: "overtime/$id", component: PortalOvertimeCreate },
  { path: "overtime/$id/view", component: PortalOvertimeCreate },
  { path: "official-business", component: PortalOfficialBusinessList },
  { path: "official-business/create", component: PortalOfficialBusinessCreate },
  { path: "official-business/$id", component: PortalOfficialBusinessCreate },
  {
    path: "official-business/$id/view",
    component: PortalOfficialBusinessCreate,
  },
  { path: "pass-slip", component: PortalPassSlipList },
  { path: "pass-slip/create", component: PortalPassSlipCreate },
  { path: "pass-slip/$id", component: PortalPassSlipCreate },
  { path: "pass-slip/$id/view", component: PortalPassSlipCreate },
  { path: "loan-applications", component: PortalLoanApplicationList },
  { path: "loan-applications/create", component: PortalLoanApplicationCreate },
  { path: "loan-applications/$id", component: PortalLoanApplicationCreate },
  {
    path: "loan-applications/$id/view",
    component: PortalLoanApplicationCreate,
  },
  { path: "cash-bond", component: PortalCashBond },
  { path: "uniform-allowance", component: PortalUniformAllowance },
  { path: "thirteenth-month", component: PortalThirteenthMonth },
];
