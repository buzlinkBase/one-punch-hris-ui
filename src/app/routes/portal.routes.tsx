import { lazy } from "react";
import type { SetupRouteConfig } from "./setup.routes";

const PortalProfile = lazy(
  () => import("@/app/modules/portal/profile/pages/portal-profile"),
);
const PortalPayslips = lazy(
  () => import("@/app/modules/portal/payslips/pages/portal-payslips"),
);

export const portalRoutes: SetupRouteConfig[] = [
  { path: "profile", component: PortalProfile },
  { path: "payslips", component: PortalPayslips },
];
