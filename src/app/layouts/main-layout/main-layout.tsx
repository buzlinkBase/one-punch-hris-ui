import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Drawer,
  Dropdown,
  Empty,
  Layout,
  Menu,
  Select,
  Spin,
  Tag,
  Tooltip,
  notification,
} from "antd";
import {
  ApartmentOutlined,
  BarChartOutlined,
  BankOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  FieldTimeOutlined,
  IdcardOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  MoonOutlined,
  SettingOutlined,
  SolutionOutlined,
  SunOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import { NAVIGATION_ITEMS } from "@/shared/constants/navigation.const";
import type { NavItem } from "@/shared/constants/navigation.const";
import { useThemeStore } from "@/core/stores/theme.store";
import { authStorage } from "@/core/auth/auth-storage";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { refreshAccessToken } from "@/core/auth/auth-refresh";
import { useTenantHub } from "@/core/signalr/use-tenant-hub";
import { useTenantHubStore } from "@/core/stores/tenant-hub.store";
import { useMyEmployee } from "@/app/modules/portal/shared/hooks/use-my-employee-queries";
import ProvisioningScreen from "./provisioning-screen";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;

interface NavSearchOption {
  value: string;
  label: string;
  breadcrumb: string;
}

function flattenNavItems(
  items: NavItem[],
  trail: string[] = [],
): NavSearchOption[] {
  const results: NavSearchOption[] = [];
  for (const item of items) {
    if (item.type === "divider") continue;
    if (item.path) {
      const breadcrumb = trail.length ? trail.join(" › ") : "";
      results.push({ value: item.path, label: item.label, breadcrumb });
    }
    if (item.children) {
      const nextTrail = item.path ? trail : [...trail, item.label];
      results.push(...flattenNavItems(item.children, nextTrail));
    }
  }
  return results;
}

const NAV_OPTIONS = flattenNavItems(NAVIGATION_ITEMS);

type MenuItem = Required<MenuProps>["items"][number];

type NavWithTrail = {
  path: string;
  trail: string[];
};

interface SessionUser {
  name: string;
  roles: string[];
  email: string;
  tenantId: string | null;
  tenantName: string | null;
  tenants: TenantSummary[];
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!words.length) return "OP";

  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function getSessionUser(): SessionUser {
  const fallbackUser: SessionUser = {
    name: "Current User",
    roles: [],
    email: "user@onepunch.local",
    tenantId: null,
    tenantName: null,
    tenants: [],
  };

  const stored = authStorage.getUser();
  if (!stored) return fallbackUser;

  return {
    name: stored.name?.trim() || fallbackUser.name,
    roles: stored.roles ?? [],
    email: stored.email?.trim() || fallbackUser.email,
    tenantId: stored.tenantId ?? null,
    tenantName: stored.tenantName ?? null,
    tenants: stored.tenants ?? [],
  };
}

function getNavIcon(key: string): ReactNode {
  const iconMap: Record<string, ReactNode> = {
    "nav-portal": <UserOutlined />,
    "portal-profile": <UserOutlined />,
    "portal-payslips": <DollarOutlined />,
    "portal-dtr": <ClockCircleOutlined />,
    "portal-incomplete-punches": <FieldTimeOutlined />,
    "portal-shift-schedule": <CalendarOutlined />,
    "portal-group-time": <ClockCircleOutlined />,
    "portal-group-pay": <DollarOutlined />,
    "portal-group-applications": <FileProtectOutlined />,
    "portal-leave-credits": <FileProtectOutlined />,
    "portal-leave-applications": <FileProtectOutlined />,
    "portal-overtime": <FileProtectOutlined />,
    "portal-official-business": <FileProtectOutlined />,
    "portal-pass-slip": <FileProtectOutlined />,
    "nav-dtr": <ClockCircleOutlined />,
    "nav-payroll": <DollarOutlined />,
    "nav-setup": <SettingOutlined />,
    timekeeping: <ClockCircleOutlined />,
    "timekeeping-upload-attendance": <FileTextOutlined />,
    "timekeeping-raw-logs": <FileTextOutlined />,
    "timekeeping-unregistered-employees": <UserOutlined />,
    "timekeeping-attendance-entry": <IdcardOutlined />,
    "timekeeping-incomplete-punches": <ClockCircleOutlined />,
    "change-schedule": <SwapOutlined />,
    "change-schedule-work-rotation": <SwapOutlined />,
    "change-schedule-change-rest-day": <CalendarOutlined />,
    "change-schedule-change-holiday": <CalendarOutlined />,
    "daily-time-record": <FileTextOutlined />,
    "daily-time-record-detail": <FileTextOutlined />,
    "daily-time-record-summary": <BarChartOutlined />,
    "daily-time-record-for-payroll": <IdcardOutlined />,
    reports: <BarChartOutlined />,
    "reports-tardiness": <ClockCircleOutlined />,
    setup: <SettingOutlined />,
    "setup-group-shifts": <FieldTimeOutlined />,
    "setup-group-org": <ApartmentOutlined />,
    "setup-group-workforce": <TeamOutlined />,
    "setup-group-statutory": <SafetyOutlined />,
    "setup-fixed-shift": <FieldTimeOutlined />,
    "setup-split-shift": <FieldTimeOutlined />,
    "setup-flexi-shift": <FieldTimeOutlined />,
    "setup-department": <ApartmentOutlined />,
    "setup-section": <ApartmentOutlined />,
    "setup-position": <SolutionOutlined />,
    "setup-branch": <BankOutlined />,
    "setup-project-site": <EnvironmentOutlined />,
    "setup-client": <TeamOutlined />,
    "setup-operation-area": <BankOutlined />,
    "setup-payroll-group": <IdcardOutlined />,
    "setup-holiday": <CalendarOutlined />,
    "setup-leave-type": <FileProtectOutlined />,
    "setup-employee": <UserOutlined />,
    clients: <TeamOutlined />,
    biometric: <SafetyCertificateOutlined />,
    "enroll-biometrics": <SafetyCertificateOutlined />,
    security: <SafetyOutlined />,
    "security-users": <UserOutlined />,
    "security-roles": <IdcardOutlined />,
    "security-permissions": <SafetyCertificateOutlined />,
    "security-audit": <FileTextOutlined />,
  };

  return iconMap[key] ?? <FileTextOutlined />;
}

/** Nav keys that don't depend on the tenant's HR database and stay enabled while it provisions. */
const HR_DB_INDEPENDENT_KEYS = new Set(["dashboard"]);

function buildMenuItems(
  items: typeof NAVIGATION_ITEMS,
  hrDbReady: boolean,
  collapsed = false,
): MenuItem[] {
  return items.map((item) => {
    if (item.type === "divider") {
      return { type: "divider" as const, key: item.key };
    }

    if (item.type === "group") {
      return {
        key: item.key,
        label: item.label,
        icon: getNavIcon(item.key),
        children: item.children
          ? buildMenuItems(item.children, hrDbReady, collapsed)
          : undefined,
      };
    }

    const disabled = !hrDbReady && !HR_DB_INDEPENDENT_KEYS.has(item.key);

    // When collapsed, AntD's built-in popup already shows the label text on hover —
    // wrapping in Tooltip creates a nested tooltip that breaks the popup text rendering.
    // Use a plain string when collapsed; use the truncating span when expanded.
    const label = collapsed ? (
      item.label
    ) : disabled ? (
      <Tooltip
        title="Available once your workspace resources finish setting up"
        placement="right"
      >
        <span className="block overflow-hidden text-ellipsis">
          {item.label}
        </span>
      </Tooltip>
    ) : (
      <span className="block overflow-hidden text-ellipsis">{item.label}</span>
    );

    return {
      key: item.path ?? item.key,
      label,
      icon: getNavIcon(item.key),
      disabled,
      children: item.children
        ? buildMenuItems(item.children, hrDbReady, collapsed)
        : undefined,
    };
  });
}

function findAncestorKeys(
  path: string,
  items: typeof NAVIGATION_ITEMS,
  ancestors: string[] = [],
): string[] | null {
  for (const item of items) {
    if (item.type === "divider") continue;
    if (item.path === path) return ancestors;
    if (item.children) {
      const found = findAncestorKeys(
        path,
        item.children as typeof NAVIGATION_ITEMS,
        [...ancestors, item.key],
      );
      if (found !== null) return found;
    }
  }
  return null;
}

function flattenNavigation(
  items: typeof NAVIGATION_ITEMS,
  parentTrail: string[] = [],
): NavWithTrail[] {
  return items.flatMap((item) => {
    if (item.type === "divider") return [];
    const currentTrail = [...parentTrail, item.label];
    const current = item.path ? [{ path: item.path, trail: currentTrail }] : [];
    const children = item.children
      ? flattenNavigation(
          item.children as typeof NAVIGATION_ITEMS,
          currentTrail,
        )
      : [];

    return [...current, ...children];
  });
}

function humanizeSegment(segment: string): string {
  if (!segment) return "Dashboard";

  const value = segment.replace(/[$_-]/g, " ").trim();
  if (!value) return "Dashboard";

  return value
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function buildHeaderContext(
  pathname: string,
  navEntries: NavWithTrail[],
): { title: string; subtitle: string; trailText: string } {
  const exactMatch = navEntries.find((entry) => entry.path === pathname);
  const bestPrefixMatch = navEntries
    .filter((entry) => pathname.startsWith(entry.path + "/"))
    .sort((a, b) => b.path.length - a.path.length)[0];

  const match = exactMatch ?? bestPrefixMatch;
  const baseLabel = match?.trail[match.trail.length - 1] ?? "Dashboard";
  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";

  const title =
    lastSegment === "create"
      ? `Create ${baseLabel}`
      : match
        ? baseLabel
        : humanizeSegment(lastSegment);

  const subtitle =
    lastSegment === "create"
      ? `Add a new ${baseLabel.toLowerCase()} record`
      : `Manage ${baseLabel.toLowerCase()} records`;

  const trailText = (match?.trail ?? ["Dashboard"]).join(" / ");

  return { title, subtitle, trailText };
}

function resolveActiveMenuKey(
  pathname: string,
  navEntries: NavWithTrail[],
): string {
  const match = navEntries
    .filter(
      (entry) =>
        pathname === entry.path || pathname.startsWith(entry.path + "/"),
    )
    .sort((a, b) => b.path.length - a.path.length)[0];

  return match?.path ?? pathname;
}

function getTenantStateTag(state: string): { color: string; show: boolean } {
  switch (state?.toLowerCase()) {
    case "created":
    case "active":
      return { color: "", show: false };
    case "initial":
    case "awaitingapproval":
    case "provisioning":
    case "onboarding":
      return { color: "orange", show: true };
    case "suspended":
    case "expired":
    case "deactivated":
    case "failed":
    case "rejected":
      return { color: "red", show: true };
    default:
      return { color: "default", show: true };
  }
}

export default function MainLayout() {
  // Tablets (and narrower desktop windows) start with the sider collapsed to
  // icon-only so setup pages (e.g. Employee) get enough width for 2-column forms.
  const [collapsed, setCollapsed] = useState(
    () => window.matchMedia("(max-width: 1024px)").matches,
  );
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [switchingTenant, setSwitchingTenant] = useState<string | null>(null);
  const { mode: themeMode, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = getSessionUser();

  useTenantHub();
  const liveTenantStates = useTenantHubStore((s) => s.liveTenantStates);
  const notifications = useTenantHubStore((s) => s.notifications);
  const unreadCount = useTenantHubStore((s) => s.unreadCount);
  const markAllRead = useTenantHubStore((s) => s.markAllRead);
  const hrDb = useTenantHubStore((s) => s.getHrDbStatus(sessionUser.tenantId));
  const hrDbFailed =
    hrDb.known && !!hrDb.status && /fail|error/i.test(hrDb.status);

  // "My Portal" only shows once we know the logged-in user has a linked Employee record —
  // until that resolves (or if there is none), it's filtered out rather than shown disabled,
  // since most accounts will never have one.
  const { data: myEmployee } = useMyEmployee();
  const navItems = useMemo(
    () =>
      myEmployee
        ? NAVIGATION_ITEMS
        : NAVIGATION_ITEMS.filter((item) => item.key !== "nav-portal"),
    [myEmployee],
  );

  const menuItems = buildMenuItems(navItems, hrDb.ready, collapsed);
  const navEntries = flattenNavigation(navItems);
  const headerContext = buildHeaderContext(location.pathname, navEntries);
  const activeMenuKey = resolveActiveMenuKey(location.pathname, navEntries);

  const [openKeys, setOpenKeys] = useState<string[]>(
    () => findAncestorKeys(location.pathname, navItems) ?? [],
  );

  useEffect(() => {
    const keys = findAncestorKeys(location.pathname, navItems);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (keys) setOpenKeys((prev) => Array.from(new Set([...prev, ...keys])));
  }, [location.pathname, navItems]);

  useEffect(() => {
    if (!hrDb.known || hrDb.ready) return;
    const allowed =
      location.pathname === "/dashboard" || location.pathname === "/profile";
    if (!allowed) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [hrDb.known, hrDb.ready, location.pathname, navigate]);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key.startsWith("/")) {
      if (isMobile) setMobileMenuOpen(false);
      navigate({ to: key });
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    window.location.assign("/login");
  };

  const handleSwitchTenant = async (tenantId: string) => {
    setSwitchingTenant(tenantId);

    const doSwitch = async () => {
      const result = await authApi.selectTenant(tenantId);
      const claims = authStorage.getTenantClaims(result.accessToken);
      const user = authStorage.getUser();

      // Merge: use fresh data from backend for tenants it returns, but keep any
      // locally-tracked tenants it omits (e.g. still-provisioning workspaces that
      // the backend excludes from the list until membership becomes Active).
      const localTenants = user?.tenants ?? [];
      const localById = new Map(localTenants.map((t) => [t.tenantId, t]));
      const resultIds = new Set(result.tenants.map((t) => t.tenantId));

      // Never let a stale backend snapshot regress a tenant we've already confirmed
      // ready (via live hub push or REST poll) back to "not ready" — DB provisioning
      // doesn't un-finish, so once locally-confirmed ready it stays ready per tenant,
      // independent of which tenant is active right now.
      const reconciled = result.tenants.map((t) => {
        const local = localById.get(t.tenantId);
        return local?.hrDbReady && !t.hrDbReady
          ? {
              ...t,
              hrDbReady: true,
              hrDbStatus: local.hrDbStatus ?? t.hrDbStatus,
            }
          : t;
      });

      const preserved = localTenants.filter((t) => !resultIds.has(t.tenantId));
      const mergedTenants = [...reconciled, ...preserved];

      authStorage.save(result.accessToken, {
        ...user!,
        tenantId: claims.tenantId ?? tenantId,
        tenantName: claims.tenantName,
        tenants: mergedTenants,
      });
      window.location.assign(window.location.pathname + window.location.search);
    };

    const showError = (err: unknown) => {
      const axiosErr = err as AxiosError<{
        message?: string;
        data?: { detail?: string; title?: string };
      }>;
      const detail =
        axiosErr.response?.data?.data?.detail ??
        axiosErr.response?.data?.data?.title ??
        axiosErr.response?.data?.message ??
        axiosErr.message;
      console.error(
        "[switch-tenant] failed:",
        axiosErr.response?.status,
        detail,
        axiosErr,
      );
      notification.error({
        message: `Switch failed (${axiosErr.response?.status ?? "network error"})`,
        description:
          detail ??
          "Could not switch to the selected workspace. Please try again.",
      });
      setSwitchingTenant(null);
    };

    try {
      await doSwitch();
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response?.status === 401) {
        // The service validates the token internally — force a refresh to get a fresh
        // token even if the frontend didn't detect expiry (clock skew / missing exp claim).
        // refreshAccessToken() redirects to /login if the refresh token is also gone.
        try {
          await refreshAccessToken();
          await doSwitch();
        } catch (retryErr) {
          showError(retryErr);
        }
      } else {
        showError(err);
      }
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (e.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleToggle = () => {
    if (isMobile) setMobileMenuOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  const siderContent = (
    <>
      <div
        role="button"
        tabIndex={0}
        className="brand-chip m-4 rounded-xl px-3 py-3 text-white shadow-sm cursor-pointer"
        onClick={() => navigate({ to: "/" })}
        onKeyDown={(e) => e.key === "Enter" && navigate({ to: "/" })}
      >
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-base">
            <SafetyCertificateOutlined />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 leading-tight">
              <p className="m-0 text-sm font-semibold tracking-wider truncate">
                {import.meta.env.VITE_APP_NAME ?? "One Punch HRIS"}
              </p>
              <p className="m-0 text-[10px] tracking-[0.16em] uppercase text-white/85 truncate">
                Human Resources
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="app-sider-menu-scroll">
        <Menu
          theme="light"
          mode="inline"
          className="app-menu"
          selectedKeys={[activeMenuKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </div>
      <div className="app-sider-user">
        {collapsed && !isMobile ? (
          <div className="side-user-collapsed">
            <button
              type="button"
              className="side-user-avatar"
              style={{ border: 0, padding: 0, cursor: "pointer" }}
              title={`${sessionUser.name} · View profile`}
              onClick={() => navigate({ to: "/profile" })}
            >
              {getInitials(sessionUser.name)}
            </button>
            <Button
              type="text"
              size="small"
              icon={<LogoutOutlined />}
              className="side-user-logout-icon"
              onClick={handleLogout}
              aria-label="Logout"
            />
          </div>
        ) : (
          <div className="side-user-chip">
            <button
              type="button"
              className="side-user-avatar"
              style={{ border: 0, padding: 0, cursor: "pointer" }}
              title="View profile"
              onClick={() => navigate({ to: "/profile" })}
            >
              {getInitials(sessionUser.name)}
            </button>
            <button
              type="button"
              className="side-user-meta"
              style={{
                border: 0,
                padding: 0,
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
              }}
              onClick={() => navigate({ to: "/profile" })}
            >
              <p className="side-user-subtitle">Profile</p>
            </button>
            <Button
              type="text"
              size="small"
              icon={<LogoutOutlined />}
              className="side-user-logout"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <Layout style={{ minHeight: "100vh" }} className="app-shell">
      {isMobile ? (
        <Drawer
          placement="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          width={252}
          title={null}
          closeIcon={null}
          rootClassName="app-mobile-drawer"
          styles={{
            body: {
              padding: 0,
              background: "var(--bg-sider)",
              display: "flex",
              flexDirection: "column",
              height: "100%",
              overflow: "hidden",
            },
          }}
        >
          {siderContent}
        </Drawer>
      ) : (
        <Sider
          collapsed={collapsed}
          width={252}
          collapsedWidth={88}
          trigger={null}
          className="app-sider"
        >
          {siderContent}
        </Sider>
      )}
      <Layout className="app-main-layout">
        <Header className="app-header">
          <div className="header-grid">
            <div className="header-context">
              <div className="header-context-top">
                <button
                  type="button"
                  className="header-collapse-trigger"
                  onClick={handleToggle}
                  aria-label={
                    isMobile
                      ? "Open navigation"
                      : collapsed
                        ? "Expand navigation"
                        : "Collapse navigation"
                  }
                >
                  {isMobile ? (
                    <MenuOutlined />
                  ) : collapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )}
                </button>
                <p className="header-context-trail">
                  {headerContext.trailText}
                </p>
              </div>
              {/* <h1 className="header-context-title">{headerContext.title}</h1> */}
            </div>

            <div
              className="header-search-wrap"
              style={{ display: "flex", gap: 12, alignItems: "center" }}
            >
              <Select
                showSearch
                className="header-search"
                placeholder="Quick search…"
                suffixIcon={
                  <SearchOutlined style={{ pointerEvents: "none" }} />
                }
                filterOption={(input, option) =>
                  `${option?.label ?? ""} ${option?.breadcrumb ?? ""}`
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={NAV_OPTIONS.map((o) => ({
                  value: o.value,
                  label: o.label,
                  breadcrumb: o.breadcrumb,
                }))}
                optionRender={(opt) => (
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {opt.data.label}
                    </div>
                    {opt.data.breadcrumb && (
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>
                        {opt.data.breadcrumb}
                      </div>
                    )}
                  </div>
                )}
                onChange={(path) => {
                  if (!path) return;
                  const ancestors = findAncestorKeys(path, NAVIGATION_ITEMS);
                  if (ancestors) setOpenKeys(ancestors);
                  navigate({ to: path });
                }}
                value={undefined}
                style={{ width: 240 }}
                allowClear
              />
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                onOpenChange={(open) => {
                  if (open) markAllRead();
                }}
                menu={{
                  style: { minWidth: 320, maxHeight: 380, overflowY: "auto" },
                  items:
                    notifications.length > 0
                      ? notifications.map((n) => ({
                          key: n.id,
                          label: (
                            <div style={{ padding: "2px 0" }}>
                              <p
                                style={{
                                  margin: 0,
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#1f2937",
                                }}
                              >
                                {n.title}
                              </p>
                              <p
                                style={{
                                  margin: "2px 0 0",
                                  fontSize: 12,
                                  color: "#6b7280",
                                  whiteSpace: "normal",
                                }}
                              >
                                {n.message}
                              </p>
                              <p
                                style={{
                                  margin: "4px 0 0",
                                  fontSize: 11,
                                  color: "#9ca3af",
                                }}
                              >
                                {new Date(n.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ),
                        }))
                      : [
                          {
                            key: "__empty",
                            disabled: true,
                            label: (
                              <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="No notifications yet"
                                style={{ padding: "12px 0" }}
                              />
                            ),
                          },
                        ],
                }}
              >
                <button
                  type="button"
                  className="header-collapse-trigger"
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <Badge count={unreadCount} size="small" offset={[-2, 2]}>
                    <BellOutlined />
                  </Badge>
                </button>
              </Dropdown>
              {sessionUser.tenants.length > 0 && (
                <Tooltip
                  title={
                    sessionUser.tenants.find(
                      (t) => t.tenantId === sessionUser.tenantId,
                    )?.name ??
                    sessionUser.tenantName ??
                    "Workspace"
                  }
                >
                  <Dropdown
                    trigger={["click"]}
                    placement="bottomRight"
                    menu={{
                      style: { minWidth: 224 },
                      items: [
                        ...sessionUser.tenants.map((t) => {
                          const isActive = t.tenantId === sessionUser.tenantId;
                          const liveState =
                            liveTenantStates[t.tenantId] ?? t.state;
                          const stateTag = getTenantStateTag(liveState);
                          return {
                            key: t.tenantId,
                            disabled: switchingTenant !== null || isActive,
                            onClick: isActive
                              ? undefined
                              : () => void handleSwitchTenant(t.tenantId),
                            icon: isActive ? (
                              <CheckOutlined style={{ color: "#1DA081" }} />
                            ) : (
                              <BankOutlined style={{ color: "#bfbfbf" }} />
                            ),
                            label: (
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  gap: 8,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? "#1DA081" : undefined,
                                  }}
                                >
                                  {t.name}
                                </span>
                                {stateTag.show && (
                                  <Tag
                                    color={stateTag.color}
                                    style={{
                                      margin: 0,
                                      fontSize: 10,
                                      lineHeight: "16px",
                                      padding: "0 5px",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {liveState}
                                  </Tag>
                                )}
                              </div>
                            ),
                          };
                        }),
                        { type: "divider" as const },
                        {
                          key: "__create-tenant",
                          icon: <PlusOutlined style={{ color: "#1DA081" }} />,
                          label: (
                            <span
                              style={{
                                color: "#1DA081",
                                fontWeight: 500,
                                fontSize: 13,
                              }}
                            >
                              New workspace
                            </span>
                          ),
                          onClick: () => navigate({ to: "/create-tenant" }),
                        },
                      ],
                    }}
                  >
                    <button
                      type="button"
                      className="header-collapse-trigger"
                      aria-label="Switch workspace"
                    >
                      {switchingTenant ? (
                        <Spin size="small" />
                      ) : (
                        <BankOutlined />
                      )}
                    </button>
                  </Dropdown>
                </Tooltip>
              )}
              <Tooltip
                title={
                  themeMode === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
              >
                <button
                  type="button"
                  className="header-collapse-trigger"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                >
                  {themeMode === "dark" ? <SunOutlined /> : <MoonOutlined />}
                </button>
              </Tooltip>
              <Tooltip title="Company Policy">
                <button
                  type="button"
                  className="header-collapse-trigger"
                  aria-label="Company Policy"
                  onClick={() => navigate({ to: "/setup/company-policy" })}
                >
                  <SettingOutlined />
                </button>
              </Tooltip>
            </div>
          </div>
        </Header>

        <Content className="app-content-surface app-content-scroll m-2 p-4 md:m-6 md:p-6  min-h-70 relative">
          {!hrDb.ready ? (
            <ProvisioningScreen
              tenantName={sessionUser.tenantName}
              failed={hrDbFailed}
            />
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
