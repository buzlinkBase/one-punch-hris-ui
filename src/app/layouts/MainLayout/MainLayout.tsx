import { useState, type ReactNode } from "react";
import { Button, Input, Layout, Menu } from "antd";
import {
  ApartmentOutlined,
  BarChartOutlined,
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  FieldTimeOutlined,
  IdcardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SettingOutlined,
  SolutionOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { NAVIGATION_ITEMS } from "@/shared/constants/navigation.const";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

type NavWithTrail = {
  path: string;
  trail: string[];
};

interface SessionUser {
  name: string;
  role: string;
  email: string;
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!words.length) return "OP";

  return words.map((word) => word[0]?.toUpperCase() ?? "").join("");
}

function getSessionUser(): SessionUser {
  const fallbackUser: SessionUser = {
    name: "Current User",
    role: "HR Administrator",
    email: "user@onepunch.local",
  };

  const stored = localStorage.getItem("auth_user");
  if (!stored) return fallbackUser;

  try {
    const parsed = JSON.parse(stored) as Partial<SessionUser>;
    return {
      name: parsed.name?.trim() || fallbackUser.name,
      role: parsed.role?.trim() || fallbackUser.role,
      email: parsed.email?.trim() || fallbackUser.email,
    };
  } catch {
    return fallbackUser;
  }
}

function getNavIcon(key: string): ReactNode {
  const iconMap: Record<string, ReactNode> = {
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
    "setup-fixed-shift": <FieldTimeOutlined />,
    "setup-flexi-shift": <FieldTimeOutlined />,
    "setup-department": <ApartmentOutlined />,
    "setup-operation-area": <BankOutlined />,
    "setup-payroll-group": <IdcardOutlined />,
    "setup-holiday": <CalendarOutlined />,
    "setup-employee": <UserOutlined />,
    clients: <TeamOutlined />,
    "employee-management": <SolutionOutlined />,
    "enroll-biometrics": <SafetyCertificateOutlined />,
    security: <SafetyOutlined />,
    "security-users": <UserOutlined />,
    "security-roles": <IdcardOutlined />,
    "security-permissions": <SafetyCertificateOutlined />,
    "security-audit": <FileTextOutlined />,
  };

  return iconMap[key] ?? <FileTextOutlined />;
}

function buildMenuItems(items: typeof NAVIGATION_ITEMS): MenuItem[] {
  return items.map((item) => ({
    key: item.path ?? item.key,
    label: item.label,
    icon: getNavIcon(item.key),
    children: item.children ? buildMenuItems(item.children) : undefined,
  }));
}

function flattenNavigation(
  items: typeof NAVIGATION_ITEMS,
  parentTrail: string[] = [],
): NavWithTrail[] {
  return items.flatMap((item) => {
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

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const sessionUser = getSessionUser();

  const menuItems = buildMenuItems(NAVIGATION_ITEMS);
  const navEntries = flattenNavigation(NAVIGATION_ITEMS);
  const headerContext = buildHeaderContext(location.pathname, navEntries);
  const activeMenuKey = resolveActiveMenuKey(location.pathname, navEntries);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key.startsWith("/")) {
      navigate({ to: key });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    localStorage.removeItem("auth_user");
    navigate({ to: "/login", replace: true });
  };

  const toggleCollapsed = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <Layout style={{ minHeight: "100vh" }} className="app-shell">
      <Sider
        collapsed={collapsed}
        width={252}
        collapsedWidth={88}
        trigger={null}
        className="app-sider"
      >
        <div className="brand-chip m-4 rounded-xl px-3 py-3 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-base">
              <SafetyCertificateOutlined />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="m-0 text-sm font-semibold tracking-[0.05em] truncate">
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
            defaultOpenKeys={["setup"]}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </div>
        <div className="app-sider-user">
          {collapsed ? (
            <div className="side-user-collapsed">
              <div className="side-user-avatar" title={sessionUser.name}>
                {getInitials(sessionUser.name)}
              </div>
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
              <div className="side-user-avatar">
                {getInitials(sessionUser.name)}
              </div>
              <div className="side-user-meta">
                <p className="side-user-name">{sessionUser.name}</p>
                <p className="side-user-subtitle">
                  {sessionUser.role}
                  {sessionUser.email ? ` · ${sessionUser.email}` : ""}
                </p>
              </div>
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
      </Sider>
      <Layout className="app-main-layout">
        <Header className="app-header px-7">
          <div className="header-grid">
            <div className="header-context">
              <div className="header-context-top">
                <button
                  type="button"
                  className="header-collapse-trigger"
                  onClick={toggleCollapsed}
                  aria-label={
                    collapsed ? "Expand navigation" : "Collapse navigation"
                  }
                  title={
                    collapsed ? "Expand navigation" : "Collapse navigation"
                  }
                >
                  {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
                <p className="header-context-trail">
                  {headerContext.trailText}
                </p>
              </div>
              {/* <h1 className="header-context-title">{headerContext.title}</h1> */}
            </div>

            <div className="header-search-wrap">
              <Input
                className="header-search"
                prefix={<SearchOutlined />}
                placeholder="Quick search (coming soon)"
                allowClear
                disabled
              />
            </div>
          </div>
        </Header>
        <Content className="app-content-surface app-content-scroll m-6 p-6 rounded-2xl min-h-[280px] relative">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
