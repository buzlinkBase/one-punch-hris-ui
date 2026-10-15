import { lazy } from "react";
import type { SetupRouteConfig } from "./setup.routes";

const ClientList = lazy(
  () => import("@/app/modules/client-portal/pages/client-list"),
);
const IntegrationList = lazy(
  () => import("@/app/modules/client-portal/pages/integration-list"),
);
const DtrVerification = lazy(
  () => import("@/app/modules/client-portal/pages/dtr-verification"),
);

const InvoiceList = lazy(
  () => import("@/app/modules/client-portal/pages/invoice-list"),
);
const InvoiceDetail = lazy(
  () => import("@/app/modules/client-portal/pages/invoice-detail"),
);
const PaymentList = lazy(
  () => import("@/app/modules/client-portal/pages/payment-list"),
);
const BillingSetup = lazy(
  () => import("@/app/modules/client-portal/pages/billing-setup"),
);
const BillingReports = lazy(
  () => import("@/app/modules/client-portal/pages/billing-reports"),
);
const DisputeList = lazy(
  () => import("@/app/modules/client-portal/pages/dispute-list"),
);
const Statements = lazy(
  () => import("@/app/modules/client-portal/pages/statements"),
);
const GuardVault = lazy(
  () => import("@/app/modules/client-portal/pages/guard-vault"),
);
const NoticeBoard = lazy(
  () => import("@/app/modules/client-portal/pages/notice-board"),
);
const ManpowerRequests = lazy(
  () => import("@/app/modules/client-portal/pages/manpower-requests"),
);
const ServiceScorecard = lazy(
  () => import("@/app/modules/client-portal/pages/service-scorecard"),
);
const PortalConnection = lazy(
  () => import("@/app/modules/client-portal/pages/portal-connection"),
);

// Children of /client-portal -- gated through the nav entries (see getPermissionForPath).
export const clientPortalRoutes: SetupRouteConfig[] = [
  { path: "clients", component: ClientList },
  { path: "integrations", component: IntegrationList },
  { path: "verification", component: DtrVerification },
  { path: "connection", component: PortalConnection },
  { path: "invoices", component: InvoiceList },
  { path: "invoices/$id", component: InvoiceDetail },
  { path: "payments", component: PaymentList },
  { path: "billing-setup", component: BillingSetup },
  { path: "reports", component: BillingReports },
  { path: "disputes", component: DisputeList },
  { path: "statements", component: Statements },
  { path: "guard-documents", component: GuardVault },
  { path: "notices", component: NoticeBoard },
  { path: "manpower", component: ManpowerRequests },
  { path: "scorecard", component: ServiceScorecard },
];
