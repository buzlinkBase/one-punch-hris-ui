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
} from "@tanstack/react-router";
import MainLayout from "@/app/layouts/MainLayout";
import AuthLayout from "@/app/layouts/AuthLayout";
import { setupRoutes } from "./setup.routes";

const Login = lazy(() => import("@/app/modules/auth/login/Login"));
const DepartmentList = lazy(
  () => import("@/app/modules/setup/department/pages/DepartmentList"),
);
const Timekeeping = lazy(() => import("@/app/modules/timekeeping/Timekeeping"));

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

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: () => <Navigate to="/login" replace />,
});

const rootIndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/login" replace />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: AuthLayout,
});

const loginIndexRoute = createRoute({
  getParentRoute: () => loginRoute,
  path: "/",
  component: withSuspense(Login),
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

const routeTree = rootRoute.addChildren([
  rootIndexRoute,
  loginRoute.addChildren([loginIndexRoute]),
  setupRoute.addChildren([setupIndexRoute, ...setupChildRoutes]),
  timekeepingRoute.addChildren([timekeepingIndexRoute]),
  appSectionRoute("change-schedule", "Change Schedule"),
  appSectionRoute("daily-time-record", "Daily Time Record"),
  appSectionRoute("reports", "Reports"),
  appSectionRoute("clients", "Clients"),
  appSectionRoute("employee-management", "Employee Management"),
  appSectionRoute("enroll-biometrics", "Enroll Biometrics"),
  appSectionRoute("security", "Security"),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

export default router;
