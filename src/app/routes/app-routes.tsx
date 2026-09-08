import {
  Suspense,
  lazy,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import {
  Navigate,
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import MainLayout from "@/app/layouts/main-layout";
import AuthLayout from "@/app/layouts/auth-layout";
import { setupRoutes } from "./setup.routes";
import { authStorage } from "@/core/auth/auth-storage";
import { resolveTenantDestination } from "@/core/auth/tenant-routing";
import { refreshAccessToken } from "@/core/auth/auth-refresh";

const Login = lazy(() => import("@/app/modules/auth/login/login"));
const Register = lazy(() => import("@/app/modules/auth/register"));
const ForgotPassword = lazy(
  () => import("@/app/modules/auth/forgot-password/forgot-password"),
);
const ResetPassword = lazy(
  () => import("@/app/modules/auth/reset-password/reset-password"),
);
const Dashboard = lazy(() => import("@/app/modules/dashboard/dashboard"));
const Profile = lazy(
  () => import("@/app/modules/account/profile/pages/profile/profile"),
);
const DepartmentList = lazy(
  () => import("@/app/modules/setup/department/pages/department-list"),
);
const Timekeeping = lazy(() => import("@/app/modules/timekeeping/timekeeping"));
const RawLogsList = lazy(
  () => import("@/app/modules/timekeeping/raw-logs/pages/raw-logs-list"),
);
const IncompletePunchesList = lazy(
  () =>
    import("@/app/modules/timekeeping/incomplete-punches/pages/incomplete-punches-list"),
);
const UnregisterEmployeeList = lazy(
  () =>
    import("@/app/modules/timekeeping/unregistered-employees/pages/unregister-employee-list"),
);
const UploadAttendanceList = lazy(
  () =>
    import("@/app/modules/timekeeping/upload-attendance/pages/upload-attendance-list"),
);
const AttendanceEntryList = lazy(
  () =>
    import("@/app/modules/timekeeping/attendance-entry/pages/attendance-entry-list"),
);
const AttendanceEntryCreate = lazy(
  () =>
    import("@/app/modules/timekeeping/attendance-entry/pages/attendance-entry-create"),
);
const UserList = lazy(
  () => import("@/app/modules/security/users/pages/user-list"),
);
const UserDetail = lazy(
  () => import("@/app/modules/security/users/pages/user-detail"),
);
const RoleList = lazy(
  () => import("@/app/modules/security/roles/pages/role-list"),
);
const RoleDetail = lazy(
  () => import("@/app/modules/security/roles/pages/role-detail"),
);
const TardinessList = lazy(
  () => import("@/app/modules/reports/tardiness/pages/tardiness-list"),
);
const RosterList = lazy(
  () => import("@/app/modules/reports/rostering/pages/roster-list"),
);
const EnrollBiometrics = lazy(
  () =>
    import("@/app/modules/biometric/enroll-biometrics/pages/enroll-biometrics"),
);
const ManageDevicesList = lazy(
  () =>
    import("@/app/modules/biometric/manage-devices/pages/manage-devices-list"),
);
const ManageDevicesDetail = lazy(
  () =>
    import("@/app/modules/biometric/manage-devices/pages/manage-devices-detail"),
);
const ForPayrollList = lazy(
  () =>
    import("@/app/modules/daily-time-record/for-payroll/pages/for-payroll-list"),
);
const PayrollSummary = lazy(
  () =>
    import("@/app/modules/daily-time-record/for-payroll/pages/payroll-summary/payroll-summary"),
);
const GenerateThirteenthMonth = lazy(
  () =>
    import("@/app/modules/daily-time-record/for-payroll/pages/generate-thirteenth-month"),
);
const GenerateLastPay = lazy(
  () =>
    import("@/app/modules/daily-time-record/for-payroll/pages/generate-last-pay"),
);
const GenerateYearEndAdjustment = lazy(
  () =>
    import("@/app/modules/daily-time-record/for-payroll/pages/generate-year-end-adjustment"),
);
const SssRemittance = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/sss-remittance"),
);
const PhilHealthRemittance = lazy(
  () =>
    import("@/app/modules/reports/payroll-reports/pages/philhealth-remittance"),
);
const PagIbigRemittance = lazy(
  () =>
    import("@/app/modules/reports/payroll-reports/pages/pagibig-remittance"),
);
const WTaxRemittance = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/wtax-remittance"),
);
const BankDisbursement = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/bank-disbursement"),
);
const LoanLedger = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/loan-ledger"),
);
const LeaveLedger = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/leave-ledger"),
);
const ReimbursementList = lazy(
  () =>
    import("@/app/modules/reports/payroll-reports/pages/reimbursement-list"),
);
const CostSummary = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/cost-summary"),
);
const YtdSummary = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/ytd-summary"),
);
const ThirteenthMonthPay = lazy(
  () =>
    import("@/app/modules/reports/payroll-reports/pages/thirteenth-month-pay"),
);
const Bir1601C = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/bir-1601c"),
);
const BirAlphalist = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/bir-alphalist"),
);
const Bir2316 = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/bir-2316"),
);
const SssR3 = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/sss-r3"),
);
const PhilHealthEprs = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/philhealth-eprs"),
);
const PagIbigMcrf = lazy(
  () => import("@/app/modules/reports/payroll-reports/pages/pagibig-mcrf"),
);
const DtrSummaryList = lazy(
  () =>
    import("@/app/modules/daily-time-record/summary/pages/dtr-summary-list"),
);
const DtrDetailList = lazy(
  () => import("@/app/modules/daily-time-record/detail/pages/dtr-detail-list"),
);
const DtrDetailMaster = lazy(
  () =>
    import("@/app/modules/daily-time-record/detail/pages/dtr-detail-master"),
);
const ChangeHolidayList = lazy(
  () =>
    import("@/app/modules/change-schedule/change-holiday/pages/change-holiday-list"),
);
const ChangeHolidayDetail = lazy(
  () =>
    import("@/app/modules/change-schedule/change-holiday/pages/change-holiday-detail"),
);
const ChangeRestDayList = lazy(
  () =>
    import("@/app/modules/change-schedule/change-rest-day/pages/change-rest-day-list"),
);
const ChangeRestDayDetail = lazy(
  () =>
    import("@/app/modules/change-schedule/change-rest-day/pages/change-rest-day-detail"),
);
const WorkRotationList = lazy(
  () =>
    import("@/app/modules/change-schedule/work-rotation/pages/work-rotation-list"),
);
const WorkRotationDetail = lazy(
  () =>
    import("@/app/modules/change-schedule/work-rotation/pages/work-rotation-detail"),
);
const SelectTenant = lazy(
  () => import("@/app/modules/auth/select-tenant/select-tenant"),
);
const CreateTenant = lazy(
  () => import("@/app/modules/auth/create-tenant/create-tenant"),
);
const AwaitingInvitation = lazy(
  () => import("@/app/modules/auth/awaiting-invitation/awaiting-invitation"),
);
const AccountConfirmation = lazy(
  () => import("@/app/modules/auth/account-confirmation/account-confirmation"),
);
const AcceptInvitation = lazy(
  () => import("@/app/modules/auth/accept-invitation/accept-invitation"),
);
const ClientList = lazy(
  () => import("@/app/modules/onboard/client/pages/client-list"),
);
const ClientDetail = lazy(
  () => import("@/app/modules/onboard/client/pages/client-detail"),
);

const RouteFallback = () => null;

const withSuspense = (Component: LazyExoticComponent<ComponentType>) => {
  const Wrapped = () => (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  );

  return Wrapped;
};

const ComingSoon = ({ title }: { title: string }) => (
  <div className="content-page">
    <div className="page-toolbar">
      <div className="page-toolbar-row">
        <div>
          <h2 className="text-xl font-semibold mb-0">{title}</h2>
          <p className="page-toolbar-subtitle">
            Module workspace and actions will appear here.
          </p>
        </div>
      </div>
    </div>
    <div className="flex flex-col items-center justify-center min-h-65 text-center rounded-xl border border-emerald-100 bg-emerald-50/40">
      <p className="text-base font-medium text-emerald-900">Coming soon</p>
      <p className="text-sm text-emerald-700">
        This menu page is reserved for the next release.
      </p>
    </div>
  </div>
);

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/account-confirmation/success",
  "/account-confirmation/error",
  "/accept-invite",
];
const TENANT_FLOW_PATHS = [
  "/select-tenant",
  "/create-tenant",
  "/awaiting-invitation",
];

// Returns the destination path if the user should be auto-redirected, null if they should stay on login.
async function attemptAutoRedirect(): Promise<string | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  if (!authStorage.isAccessTokenExpired()) {
    const destination = await resolveTenantDestination();
    return destination ?? "/dashboard";
  }

  // Token expired — try a silent refresh before giving up
  let refreshed = false;
  try {
    await refreshAccessToken();
    refreshed = true;
  } catch {
    // refresh failed: authStorage already cleared by refreshAccessToken
  }

  if (refreshed) {
    const destination = await resolveTenantDestination();
    return destination ?? "/dashboard";
  }

  return null;
}

const rootRoute = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (PUBLIC_PATHS.includes(location.pathname)) return;
    if (!authStorage.getToken()) throw redirect({ to: "/login" });
    if (TENANT_FLOW_PATHS.includes(location.pathname)) return;

    const destination = await resolveTenantDestination();
    if (destination) throw redirect({ to: destination });
  },
  component: () => <Outlet />,
  notFoundComponent: () => <Navigate to="/login" replace />,
});

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: async () => {
    const destination = await attemptAutoRedirect();
    throw redirect({ to: destination ?? "/login" });
  },
  component: () => null,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  beforeLoad: async () => {
    const destination = await attemptAutoRedirect();
    if (destination) throw redirect({ to: destination });
  },
  component: AuthLayout,
});

const loginIndexRoute = createRoute({
  getParentRoute: () => loginRoute,
  path: "/",
  component: withSuspense(Login),
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "register",
  beforeLoad: async () => {
    if (!authStorage.getToken()) return;
    const destination = await resolveTenantDestination();
    throw redirect({ to: destination ?? "/dashboard" });
  },
  component: AuthLayout,
});

const registerIndexRoute = createRoute({
  getParentRoute: () => registerRoute,
  path: "/",
  component: withSuspense(Register),
});

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "forgot-password",
  component: AuthLayout,
});

const forgotPasswordIndexRoute = createRoute({
  getParentRoute: () => forgotPasswordRoute,
  path: "/",
  component: withSuspense(ForgotPassword),
});

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "reset-password",
  component: AuthLayout,
});

const resetPasswordIndexRoute = createRoute({
  getParentRoute: () => resetPasswordRoute,
  path: "/",
  component: withSuspense(ResetPassword),
});

const selectTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "select-tenant",
  component: AuthLayout,
});

const selectTenantIndexRoute = createRoute({
  getParentRoute: () => selectTenantRoute,
  path: "/",
  component: withSuspense(SelectTenant),
});

const createTenantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "create-tenant",
  component: AuthLayout,
});

const createTenantIndexRoute = createRoute({
  getParentRoute: () => createTenantRoute,
  path: "/",
  component: withSuspense(CreateTenant),
});

const awaitingInvitationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "awaiting-invitation",
  component: AuthLayout,
});

const awaitingInvitationIndexRoute = createRoute({
  getParentRoute: () => awaitingInvitationRoute,
  path: "/",
  component: withSuspense(AwaitingInvitation),
});

const accountConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "account-confirmation",
  component: AuthLayout,
});

const accountConfirmationSuccessRoute = createRoute({
  getParentRoute: () => accountConfirmationRoute,
  path: "success",
  component: withSuspense(AccountConfirmation),
});

const accountConfirmationErrorRoute = createRoute({
  getParentRoute: () => accountConfirmationRoute,
  path: "error",
  component: withSuspense(AccountConfirmation),
});

const acceptInviteRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "accept-invite",
  component: AuthLayout,
});

const acceptInviteIndexRoute = createRoute({
  getParentRoute: () => acceptInviteRoute,
  path: "/",
  component: withSuspense(AcceptInvitation),
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "dashboard",
  component: MainLayout,
});

const dashboardIndexRoute = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: withSuspense(Dashboard),
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "profile",
  component: MainLayout,
});

const profileIndexRoute = createRoute({
  getParentRoute: () => profileRoute,
  path: "/",
  component: withSuspense(Profile),
});

const setupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "setup",
  component: MainLayout,
});

const setupIndexRoute = createRoute({
  getParentRoute: () => setupRoute,
  path: "/",
  component: withSuspense(DepartmentList),
});

const setupChildRoutes = setupRoutes.map((route) =>
  createRoute({
    getParentRoute: () => setupRoute,
    path: route.path,
    component: withSuspense(route.component),
  }),
);

const timekeepingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "timekeeping",
  component: MainLayout,
});

const timekeepingIndexRoute = createRoute({
  getParentRoute: () => timekeepingRoute,
  path: "/",
  component: withSuspense(Timekeeping),
});

const uploadAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "timekeeping/upload-attendance",
  component: MainLayout,
});

const uploadAttendanceIndexRoute = createRoute({
  getParentRoute: () => uploadAttendanceRoute,
  path: "/",
  component: withSuspense(UploadAttendanceList),
});

const attendanceEntryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "timekeeping/attendance-entry",
  component: MainLayout,
});

const attendanceEntryIndexRoute = createRoute({
  getParentRoute: () => attendanceEntryRoute,
  path: "/",
  component: withSuspense(AttendanceEntryList),
});

const attendanceEntryCreateRoute = createRoute({
  getParentRoute: () => attendanceEntryRoute,
  path: "create",
  component: withSuspense(AttendanceEntryCreate),
});

const rawLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "timekeeping/raw-logs",
  component: MainLayout,
});

const rawLogsIndexRoute = createRoute({
  getParentRoute: () => rawLogsRoute,
  path: "/",
  component: withSuspense(RawLogsList),
});

const incompletePunchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "timekeeping/incomplete-punches",
  component: MainLayout,
});

const incompletePunchesIndexRoute = createRoute({
  getParentRoute: () => incompletePunchesRoute,
  path: "/",
  component: withSuspense(IncompletePunchesList),
});

const unregisterEmployeeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "timekeeping/unregistered-employees",
  component: MainLayout,
});

const unregisterEmployeeIndexRoute = createRoute({
  getParentRoute: () => unregisterEmployeeRoute,
  path: "/",
  component: withSuspense(UnregisterEmployeeList),
});

const appSectionRoute = (path: string, title: string) => {
  const sectionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: MainLayout,
  });

  const sectionIndexRoute = createRoute({
    getParentRoute: () => sectionRoute,
    path: "/",
    component: () => <ComingSoon title={title} />,
  });

  return sectionRoute.addChildren([sectionIndexRoute]);
};

const changeHolidayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "change-schedule/change-holiday",
  component: MainLayout,
});

const changeHolidayIndexRoute = createRoute({
  getParentRoute: () => changeHolidayRoute,
  path: "/",
  component: withSuspense(ChangeHolidayList),
});

const changeHolidayCreateRoute = createRoute({
  getParentRoute: () => changeHolidayRoute,
  path: "create",
  component: withSuspense(ChangeHolidayDetail),
});

const changeHolidayDetailRoute = createRoute({
  getParentRoute: () => changeHolidayRoute,
  path: "$id",
  component: withSuspense(ChangeHolidayDetail),
});

const changeRestDayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "change-schedule/change-rest-day",
  component: MainLayout,
});

const changeRestDayIndexRoute = createRoute({
  getParentRoute: () => changeRestDayRoute,
  path: "/",
  component: withSuspense(ChangeRestDayList),
});

const changeRestDayCreateRoute = createRoute({
  getParentRoute: () => changeRestDayRoute,
  path: "create",
  component: withSuspense(ChangeRestDayDetail),
});

const changeRestDayDetailRoute = createRoute({
  getParentRoute: () => changeRestDayRoute,
  path: "$id",
  component: withSuspense(ChangeRestDayDetail),
});

const workRotationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "change-schedule/work-rotation",
  component: MainLayout,
});

const workRotationIndexRoute = createRoute({
  getParentRoute: () => workRotationRoute,
  path: "/",
  component: withSuspense(WorkRotationList),
});

const workRotationCreateRoute = createRoute({
  getParentRoute: () => workRotationRoute,
  path: "create",
  component: withSuspense(WorkRotationDetail),
});

const workRotationDetailRoute = createRoute({
  getParentRoute: () => workRotationRoute,
  path: "$id",
  component: withSuspense(WorkRotationDetail),
});

const dtrDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "daily-time-record/detail",
  component: MainLayout,
});

const dtrDetailIndexRoute = createRoute({
  getParentRoute: () => dtrDetailRoute,
  path: "/",
  component: withSuspense(DtrDetailList),
});

const dtrDetailMasterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "daily-time-record/master",
  component: MainLayout,
});

const dtrDetailMasterIndexRoute = createRoute({
  getParentRoute: () => dtrDetailMasterRoute,
  path: "/",
  component: withSuspense(DtrDetailMaster),
});

const dtrSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "daily-time-record/summary",
  component: MainLayout,
});

const dtrSummaryIndexRoute = createRoute({
  getParentRoute: () => dtrSummaryRoute,
  path: "/",
  component: withSuspense(DtrSummaryList),
});

const forPayrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "daily-time-record/for-payroll",
  component: MainLayout,
});

const forPayrollIndexRoute = createRoute({
  getParentRoute: () => forPayrollRoute,
  path: "/",
  component: withSuspense(ForPayrollList),
});

const generateThirteenthMonthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "daily-time-record/for-13th-month",
  component: MainLayout,
});

const generateThirteenthMonthIndexRoute = createRoute({
  getParentRoute: () => generateThirteenthMonthRoute,
  path: "/",
  component: withSuspense(GenerateThirteenthMonth),
});

const generateLastPayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "daily-time-record/for-last-pay",
  component: MainLayout,
});

const generateLastPayIndexRoute = createRoute({
  getParentRoute: () => generateLastPayRoute,
  path: "/",
  component: withSuspense(GenerateLastPay),
});

const generateYearEndAdjustmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "daily-time-record/for-year-end-adjustment",
  component: MainLayout,
});

const generateYearEndAdjustmentIndexRoute = createRoute({
  getParentRoute: () => generateYearEndAdjustmentRoute,
  path: "/",
  component: withSuspense(GenerateYearEndAdjustment),
});

const payrollSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/summary",
  component: MainLayout,
});

const payrollSummaryIndexRoute = createRoute({
  getParentRoute: () => payrollSummaryRoute,
  path: "/",
  component: withSuspense(PayrollSummary),
});

const sssRemittanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/sss-remittance",
  component: MainLayout,
});
const sssRemittanceIndexRoute = createRoute({
  getParentRoute: () => sssRemittanceRoute,
  path: "/",
  component: withSuspense(SssRemittance),
});

const philHealthRemittanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/philhealth-remittance",
  component: MainLayout,
});
const philHealthRemittanceIndexRoute = createRoute({
  getParentRoute: () => philHealthRemittanceRoute,
  path: "/",
  component: withSuspense(PhilHealthRemittance),
});

const pagIbigRemittanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/pagibig-remittance",
  component: MainLayout,
});
const pagIbigRemittanceIndexRoute = createRoute({
  getParentRoute: () => pagIbigRemittanceRoute,
  path: "/",
  component: withSuspense(PagIbigRemittance),
});

const wtaxRemittanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/wtax-remittance",
  component: MainLayout,
});
const wtaxRemittanceIndexRoute = createRoute({
  getParentRoute: () => wtaxRemittanceRoute,
  path: "/",
  component: withSuspense(WTaxRemittance),
});

const bankDisbursementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/bank-disbursement",
  component: MainLayout,
});
const bankDisbursementIndexRoute = createRoute({
  getParentRoute: () => bankDisbursementRoute,
  path: "/",
  component: withSuspense(BankDisbursement),
});

const loanLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/loan-ledger",
  component: MainLayout,
});
const loanLedgerIndexRoute = createRoute({
  getParentRoute: () => loanLedgerRoute,
  path: "/",
  component: withSuspense(LoanLedger),
});

const leaveLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/leave-ledger",
  component: MainLayout,
});
const leaveLedgerIndexRoute = createRoute({
  getParentRoute: () => leaveLedgerRoute,
  path: "/",
  component: withSuspense(LeaveLedger),
});

const reimbursementListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/reimbursement-list",
  component: MainLayout,
});
const reimbursementListIndexRoute = createRoute({
  getParentRoute: () => reimbursementListRoute,
  path: "/",
  component: withSuspense(ReimbursementList),
});

const costSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/cost-summary",
  component: MainLayout,
});
const costSummaryIndexRoute = createRoute({
  getParentRoute: () => costSummaryRoute,
  path: "/",
  component: withSuspense(CostSummary),
});

const ytdSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/ytd-summary",
  component: MainLayout,
});
const ytdSummaryIndexRoute = createRoute({
  getParentRoute: () => ytdSummaryRoute,
  path: "/",
  component: withSuspense(YtdSummary),
});

const thirteenthMonthPayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/13th-month-pay",
  component: MainLayout,
});
const thirteenthMonthPayIndexRoute = createRoute({
  getParentRoute: () => thirteenthMonthPayRoute,
  path: "/",
  component: withSuspense(ThirteenthMonthPay),
});

const bir1601CRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/bir-1601c",
  component: MainLayout,
});
const bir1601CIndexRoute = createRoute({
  getParentRoute: () => bir1601CRoute,
  path: "/",
  component: withSuspense(Bir1601C),
});

const birAlphalistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/bir-alphalist",
  component: MainLayout,
});
const birAlphalistIndexRoute = createRoute({
  getParentRoute: () => birAlphalistRoute,
  path: "/",
  component: withSuspense(BirAlphalist),
});

const bir2316Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/bir-2316",
  component: MainLayout,
});
const bir2316IndexRoute = createRoute({
  getParentRoute: () => bir2316Route,
  path: "/",
  component: withSuspense(Bir2316),
});

const sssR3Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/sss-r3",
  component: MainLayout,
});
const sssR3IndexRoute = createRoute({
  getParentRoute: () => sssR3Route,
  path: "/",
  component: withSuspense(SssR3),
});

const philHealthEprsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/philhealth-eprs",
  component: MainLayout,
});
const philHealthEprsIndexRoute = createRoute({
  getParentRoute: () => philHealthEprsRoute,
  path: "/",
  component: withSuspense(PhilHealthEprs),
});

const pagIbigMcrfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "payroll/reports/pagibig-mcrf",
  component: MainLayout,
});
const pagIbigMcrfIndexRoute = createRoute({
  getParentRoute: () => pagIbigMcrfRoute,
  path: "/",
  component: withSuspense(PagIbigMcrf),
});

const tardinessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "reports/tardiness",
  component: MainLayout,
});

const tardinessIndexRoute = createRoute({
  getParentRoute: () => tardinessRoute,
  path: "/",
  component: withSuspense(TardinessList),
});

const rosterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "reports/rostering",
  component: MainLayout,
});

const rosterIndexRoute = createRoute({
  getParentRoute: () => rosterRoute,
  path: "/",
  component: withSuspense(RosterList),
});

const clientsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "clients",
  component: MainLayout,
});

const clientsIndexRoute = createRoute({
  getParentRoute: () => clientsRoute,
  path: "/",
  component: withSuspense(ClientList),
});

const clientsCreateRoute = createRoute({
  getParentRoute: () => clientsRoute,
  path: "create",
  component: withSuspense(ClientDetail),
});

const clientsDetailRoute = createRoute({
  getParentRoute: () => clientsRoute,
  path: "$id",
  component: withSuspense(ClientDetail),
});

const securityUsersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "security/users",
  component: MainLayout,
});

const securityUsersIndexRoute = createRoute({
  getParentRoute: () => securityUsersRoute,
  path: "/",
  component: withSuspense(UserList),
});

const securityUsersCreateRoute = createRoute({
  getParentRoute: () => securityUsersRoute,
  path: "create",
  component: withSuspense(UserDetail),
});

const securityUsersDetailRoute = createRoute({
  getParentRoute: () => securityUsersRoute,
  path: "$id",
  component: withSuspense(UserDetail),
});

const securityRolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "security/roles",
  component: MainLayout,
});

const securityRolesIndexRoute = createRoute({
  getParentRoute: () => securityRolesRoute,
  path: "/",
  component: withSuspense(RoleList),
});

const securityRolesCreateRoute = createRoute({
  getParentRoute: () => securityRolesRoute,
  path: "create",
  component: withSuspense(RoleDetail),
});

const securityRolesDetailRoute = createRoute({
  getParentRoute: () => securityRolesRoute,
  path: "$id",
  component: withSuspense(RoleDetail),
});

const PermissionList = lazy(
  () => import("@/app/modules/security/permissions/pages/permission-list"),
);
const PermissionDetail = lazy(
  () => import("@/app/modules/security/permissions/pages/permission-detail"),
);

const securityPermissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "security/permissions",
  component: MainLayout,
});

const securityPermissionsIndexRoute = createRoute({
  getParentRoute: () => securityPermissionsRoute,
  path: "/",
  component: withSuspense(PermissionList),
});

const securityPermissionsCreateRoute = createRoute({
  getParentRoute: () => securityPermissionsRoute,
  path: "create",
  component: withSuspense(PermissionDetail),
});

const securityPermissionsDetailRoute = createRoute({
  getParentRoute: () => securityPermissionsRoute,
  path: "$id",
  component: withSuspense(PermissionDetail),
});

const LeaveApplicationList = lazy(
  () =>
    import("@/app/modules/applications/leave-application/pages/leave-application-list"),
);
const LeaveApplicationDetail = lazy(
  () =>
    import("@/app/modules/applications/leave-application/pages/leave-application-detail"),
);
const OvertimeApplicationList = lazy(
  () =>
    import("@/app/modules/applications/overtime-application/pages/overtime-application-list"),
);
const OvertimeApplicationBatch = lazy(
  () =>
    import("@/app/modules/applications/overtime-application/pages/overtime-application-batch"),
);
const OvertimeApplicationDetail = lazy(
  () =>
    import("@/app/modules/applications/overtime-application/pages/overtime-application-detail"),
);
const TravelOrderList = lazy(
  () =>
    import("@/app/modules/applications/travel-order-application/pages/travel-order-list"),
);
const TravelOrderBatch = lazy(
  () =>
    import("@/app/modules/applications/travel-order-application/pages/travel-order-batch"),
);
const TravelOrderDetail = lazy(
  () =>
    import("@/app/modules/applications/travel-order-application/pages/travel-order-detail"),
);
const PassSlipList = lazy(
  () => import("@/app/modules/applications/pass-slip/pages/pass-slip-list"),
);
const PassSlipDetail = lazy(
  () => import("@/app/modules/applications/pass-slip/pages/pass-slip-detail"),
);
const DeductionApplicationList = lazy(
  () =>
    import("@/app/modules/applications/deduction-application/pages/deduction-application-list"),
);
const DeductionApplicationDetail = lazy(
  () =>
    import("@/app/modules/applications/deduction-application/pages/deduction-application-detail"),
);
const OtherIncomeApplicationList = lazy(
  () =>
    import("@/app/modules/applications/other-income-application/pages/other-income-application-list"),
);
const OtherIncomeApplicationDetail = lazy(
  () =>
    import("@/app/modules/applications/other-income-application/pages/other-income-application-detail"),
);
const SalaryAdjustmentList = lazy(
  () =>
    import("@/app/modules/applications/salary-adjustment/pages/salary-adjustment-list/salary-adjustment-list"),
);
const SalaryAdjustmentDetail = lazy(
  () =>
    import("@/app/modules/applications/salary-adjustment/pages/salary-adjustment-detail/salary-adjustment-detail"),
);
// const UndertimeList = lazy(
//   () =>
//     import("@/app/modules/applications/undertime-application/pages/undertime-list"),
// );
// const UndertimeBatch = lazy(
//   () =>
//     import("@/app/modules/applications/undertime-application/pages/undertime-batch"),
// );
// const UndertimeDetail = lazy(
//   () =>
//     import("@/app/modules/applications/undertime-application/pages/undertime-detail"),
// );

const AuditList = lazy(
  () => import("@/app/modules/security/audit/pages/audit-list"),
);
const AuditDetail = lazy(
  () => import("@/app/modules/security/audit/pages/audit-detail"),
);

const leaveApplicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications/leave",
  component: MainLayout,
});

const leaveApplicationIndexRoute = createRoute({
  getParentRoute: () => leaveApplicationRoute,
  path: "/",
  component: withSuspense(LeaveApplicationList),
});

const leaveApplicationCreateRoute = createRoute({
  getParentRoute: () => leaveApplicationRoute,
  path: "create",
  component: withSuspense(LeaveApplicationDetail),
});

const leaveApplicationDetailRoute = createRoute({
  getParentRoute: () => leaveApplicationRoute,
  path: "$id",
  component: withSuspense(LeaveApplicationDetail),
});

const overtimeApplicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications/overtime",
  component: MainLayout,
});

const travelOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications/official-business",
  component: MainLayout,
});

const passSlipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications/pass-slip",
  component: MainLayout,
});

const deductionApplicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications/deduction-application",
  component: MainLayout,
});

const otherIncomeApplicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications/other-income",
  component: MainLayout,
});

const salaryAdjustmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "applications/salary-adjustment",
  component: MainLayout,
});

// const undertimeRoute = createRoute({
//   getParentRoute: () => rootRoute,
//   path: "applications/undertime",
//   component: MainLayout,
// });

const overtimeApplicationIndexRoute = createRoute({
  getParentRoute: () => overtimeApplicationRoute,
  path: "/",
  component: withSuspense(OvertimeApplicationList),
});

const overtimeApplicationCreateRoute = createRoute({
  getParentRoute: () => overtimeApplicationRoute,
  path: "create",
  component: withSuspense(OvertimeApplicationBatch),
});

const overtimeApplicationDetailRoute = createRoute({
  getParentRoute: () => overtimeApplicationRoute,
  path: "$id",
  component: withSuspense(OvertimeApplicationDetail),
});

const travelOrderIndexRoute = createRoute({
  getParentRoute: () => travelOrderRoute,
  path: "/",
  component: withSuspense(TravelOrderList),
});

const travelOrderCreateRoute = createRoute({
  getParentRoute: () => travelOrderRoute,
  path: "create",
  component: withSuspense(TravelOrderBatch),
});

const travelOrderDetailRoute = createRoute({
  getParentRoute: () => travelOrderRoute,
  path: "$id",
  component: withSuspense(TravelOrderDetail),
});

const passSlipIndexRoute = createRoute({
  getParentRoute: () => passSlipRoute,
  path: "/",
  component: withSuspense(PassSlipList),
});

const passSlipCreateRoute = createRoute({
  getParentRoute: () => passSlipRoute,
  path: "create",
  component: withSuspense(PassSlipDetail),
});

const passSlipDetailRoute = createRoute({
  getParentRoute: () => passSlipRoute,
  path: "$id",
  component: withSuspense(PassSlipDetail),
});

const deductionApplicationIndexRoute = createRoute({
  getParentRoute: () => deductionApplicationRoute,
  path: "/",
  component: withSuspense(DeductionApplicationList),
});

const deductionApplicationCreateRoute = createRoute({
  getParentRoute: () => deductionApplicationRoute,
  path: "create",
  component: withSuspense(DeductionApplicationDetail),
});

const deductionApplicationDetailRoute = createRoute({
  getParentRoute: () => deductionApplicationRoute,
  path: "$id",
  component: withSuspense(DeductionApplicationDetail),
});

const otherIncomeApplicationIndexRoute = createRoute({
  getParentRoute: () => otherIncomeApplicationRoute,
  path: "/",
  component: withSuspense(OtherIncomeApplicationList),
});

const otherIncomeApplicationCreateRoute = createRoute({
  getParentRoute: () => otherIncomeApplicationRoute,
  path: "create",
  component: withSuspense(OtherIncomeApplicationDetail),
});

const otherIncomeApplicationDetailRoute = createRoute({
  getParentRoute: () => otherIncomeApplicationRoute,
  path: "$id",
  component: withSuspense(OtherIncomeApplicationDetail),
});

const salaryAdjustmentIndexRoute = createRoute({
  getParentRoute: () => salaryAdjustmentRoute,
  path: "/",
  component: withSuspense(SalaryAdjustmentList),
});

const salaryAdjustmentCreateRoute = createRoute({
  getParentRoute: () => salaryAdjustmentRoute,
  path: "create",
  component: withSuspense(SalaryAdjustmentDetail),
});

const salaryAdjustmentDetailRoute = createRoute({
  getParentRoute: () => salaryAdjustmentRoute,
  path: "$id",
  component: withSuspense(SalaryAdjustmentDetail),
});

// const undertimeIndexRoute = createRoute({
//   getParentRoute: () => undertimeRoute,
//   path: "/",
//   component: withSuspense(UndertimeList),
// });

// const undertimeCreateRoute = createRoute({
//   getParentRoute: () => undertimeRoute,
//   path: "create",
//   component: withSuspense(UndertimeBatch),
// });

// const undertimeDetailRoute = createRoute({
//   getParentRoute: () => undertimeRoute,
//   path: "$id",
//   component: withSuspense(UndertimeDetail),
// });

const securityAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "security/audit",
  component: MainLayout,
});

const securityAuditIndexRoute = createRoute({
  getParentRoute: () => securityAuditRoute,
  path: "/",
  component: withSuspense(AuditList),
});

const securityAuditDetailRoute = createRoute({
  getParentRoute: () => securityAuditRoute,
  path: "$id",
  component: withSuspense(AuditDetail),
});

const enrollBiometricsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "enroll-biometrics",
  component: MainLayout,
});

const enrollBiometricsIndexRoute = createRoute({
  getParentRoute: () => enrollBiometricsRoute,
  path: "/",
  component: withSuspense(EnrollBiometrics),
});

const manageDevicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "biometric/manage-devices",
  component: MainLayout,
});

const manageDevicesIndexRoute = createRoute({
  getParentRoute: () => manageDevicesRoute,
  path: "/",
  component: withSuspense(ManageDevicesList),
});

const manageDevicesCreateRoute = createRoute({
  getParentRoute: () => manageDevicesRoute,
  path: "create",
  component: withSuspense(ManageDevicesDetail),
});

const manageDevicesDetailRoute = createRoute({
  getParentRoute: () => manageDevicesRoute,
  path: "$id",
  component: withSuspense(ManageDevicesDetail),
});

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute.addChildren([loginIndexRoute]),
  registerRoute.addChildren([registerIndexRoute]),
  forgotPasswordRoute.addChildren([forgotPasswordIndexRoute]),
  resetPasswordRoute.addChildren([resetPasswordIndexRoute]),
  selectTenantRoute.addChildren([selectTenantIndexRoute]),
  createTenantRoute.addChildren([createTenantIndexRoute]),
  awaitingInvitationRoute.addChildren([awaitingInvitationIndexRoute]),
  accountConfirmationRoute.addChildren([
    accountConfirmationSuccessRoute,
    accountConfirmationErrorRoute,
  ]),
  acceptInviteRoute.addChildren([acceptInviteIndexRoute]),
  dashboardRoute.addChildren([dashboardIndexRoute]),
  profileRoute.addChildren([profileIndexRoute]),
  setupRoute.addChildren([setupIndexRoute, ...setupChildRoutes]),
  timekeepingRoute.addChildren([timekeepingIndexRoute]),
  uploadAttendanceRoute.addChildren([uploadAttendanceIndexRoute]),
  attendanceEntryRoute.addChildren([
    attendanceEntryIndexRoute,
    attendanceEntryCreateRoute,
  ]),
  rawLogsRoute.addChildren([rawLogsIndexRoute]),
  incompletePunchesRoute.addChildren([incompletePunchesIndexRoute]),
  unregisterEmployeeRoute.addChildren([unregisterEmployeeIndexRoute]),
  appSectionRoute("change-schedule", "Change Schedule"),
  workRotationRoute.addChildren([
    workRotationIndexRoute,
    workRotationCreateRoute,
    workRotationDetailRoute,
  ]),
  changeRestDayRoute.addChildren([
    changeRestDayIndexRoute,
    changeRestDayCreateRoute,
    changeRestDayDetailRoute,
  ]),
  changeHolidayRoute.addChildren([
    changeHolidayIndexRoute,
    changeHolidayCreateRoute,
    changeHolidayDetailRoute,
  ]),
  appSectionRoute("daily-time-record", "DTR Summary"),
  dtrDetailRoute.addChildren([dtrDetailIndexRoute]),
  dtrDetailMasterRoute.addChildren([dtrDetailMasterIndexRoute]),
  dtrSummaryRoute.addChildren([dtrSummaryIndexRoute]),
  forPayrollRoute.addChildren([forPayrollIndexRoute]),
  generateThirteenthMonthRoute.addChildren([generateThirteenthMonthIndexRoute]),
  generateLastPayRoute.addChildren([generateLastPayIndexRoute]),
  generateYearEndAdjustmentRoute.addChildren([
    generateYearEndAdjustmentIndexRoute,
  ]),
  payrollSummaryRoute.addChildren([payrollSummaryIndexRoute]),
  sssRemittanceRoute.addChildren([sssRemittanceIndexRoute]),
  philHealthRemittanceRoute.addChildren([philHealthRemittanceIndexRoute]),
  pagIbigRemittanceRoute.addChildren([pagIbigRemittanceIndexRoute]),
  wtaxRemittanceRoute.addChildren([wtaxRemittanceIndexRoute]),
  bankDisbursementRoute.addChildren([bankDisbursementIndexRoute]),
  loanLedgerRoute.addChildren([loanLedgerIndexRoute]),
  leaveLedgerRoute.addChildren([leaveLedgerIndexRoute]),
  reimbursementListRoute.addChildren([reimbursementListIndexRoute]),
  costSummaryRoute.addChildren([costSummaryIndexRoute]),
  ytdSummaryRoute.addChildren([ytdSummaryIndexRoute]),
  thirteenthMonthPayRoute.addChildren([thirteenthMonthPayIndexRoute]),
  bir1601CRoute.addChildren([bir1601CIndexRoute]),
  birAlphalistRoute.addChildren([birAlphalistIndexRoute]),
  bir2316Route.addChildren([bir2316IndexRoute]),
  sssR3Route.addChildren([sssR3IndexRoute]),
  philHealthEprsRoute.addChildren([philHealthEprsIndexRoute]),
  pagIbigMcrfRoute.addChildren([pagIbigMcrfIndexRoute]),
  appSectionRoute("reports", "Reports"),
  tardinessRoute.addChildren([tardinessIndexRoute]),
  rosterRoute.addChildren([rosterIndexRoute]),
  clientsRoute.addChildren([
    clientsIndexRoute,
    clientsCreateRoute,
    clientsDetailRoute,
  ]),
  enrollBiometricsRoute.addChildren([enrollBiometricsIndexRoute]),
  manageDevicesRoute.addChildren([
    manageDevicesIndexRoute,
    manageDevicesCreateRoute,
    manageDevicesDetailRoute,
  ]),
  securityUsersRoute.addChildren([
    securityUsersIndexRoute,
    securityUsersCreateRoute,
    securityUsersDetailRoute,
  ]),
  securityRolesRoute.addChildren([
    securityRolesIndexRoute,
    securityRolesCreateRoute,
    securityRolesDetailRoute,
  ]),
  securityPermissionsRoute.addChildren([
    securityPermissionsIndexRoute,
    securityPermissionsCreateRoute,
    securityPermissionsDetailRoute,
  ]),
  securityAuditRoute.addChildren([
    securityAuditIndexRoute,
    securityAuditDetailRoute,
  ]),
  leaveApplicationRoute.addChildren([
    leaveApplicationIndexRoute,
    leaveApplicationCreateRoute,
    leaveApplicationDetailRoute,
  ]),
  overtimeApplicationRoute.addChildren([
    overtimeApplicationIndexRoute,
    overtimeApplicationCreateRoute,
    overtimeApplicationDetailRoute,
  ]),
  travelOrderRoute.addChildren([
    travelOrderIndexRoute,
    travelOrderCreateRoute,
    travelOrderDetailRoute,
  ]),
  passSlipRoute.addChildren([
    passSlipIndexRoute,
    passSlipCreateRoute,
    passSlipDetailRoute,
  ]),
  deductionApplicationRoute.addChildren([
    deductionApplicationIndexRoute,
    deductionApplicationCreateRoute,
    deductionApplicationDetailRoute,
  ]),
  otherIncomeApplicationRoute.addChildren([
    otherIncomeApplicationIndexRoute,
    otherIncomeApplicationCreateRoute,
    otherIncomeApplicationDetailRoute,
  ]),
  salaryAdjustmentRoute.addChildren([
    salaryAdjustmentIndexRoute,
    salaryAdjustmentCreateRoute,
    salaryAdjustmentDetailRoute,
  ]),
  // undertimeRoute.addChildren([
  //   undertimeIndexRoute,
  //   undertimeCreateRoute,
  //   undertimeDetailRoute,
  // ]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

export default router;
