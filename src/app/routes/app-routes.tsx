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

const AuditList = lazy(
  () => import("@/app/modules/security/audit/pages/audit-list"),
);
const AuditDetail = lazy(
  () => import("@/app/modules/security/audit/pages/audit-detail"),
);

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
  appSectionRoute("reports", "Reports"),
  tardinessRoute.addChildren([tardinessIndexRoute]),
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
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

export default router;
