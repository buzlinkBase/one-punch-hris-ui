import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
  QuestionCircleOutlined,
  CalendarOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  FileProtectOutlined,
  FieldTimeOutlined,
  IdcardOutlined,
  LineChartOutlined,
  LockOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  SafetyOutlined,
  MoonOutlined,
  NotificationOutlined,
  PushpinFilled,
  SettingOutlined,
  SolutionOutlined,
  SunOutlined,
  SwapOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import {
  NAVIGATION_ITEMS,
  getFeaturesForPath,
  getPermissionForPath,
  getRequiredFeatures,
} from "@/shared/constants/navigation.const";
import {
  LIMIT_KEYS,
  SUBSCRIPTION_PROBLEM_TYPES,
  UNLIMITED,
  type FeatureKey,
  type NavFeature,
} from "@/shared/constants/entitlement-keys.const";
import type { NavItem } from "@/shared/constants/navigation.const";
import { useThemeStore } from "@/core/stores/theme.store";
import { authStorage, mergeTenants } from "@/core/auth/auth-storage";
import { resolveFallbackLanding } from "@/core/auth/tenant-routing";
import { filterNavByPermission } from "./filter-nav-by-permission";
import { ConfidentialDataNotice } from "@/shared/components/confidential-data-notice/confidential-data-notice";
import { confidentialNoticeFor } from "@/shared/components/confidential-data-notice/confidential-notice-paths";
import { useAuthUser } from "@/core/auth/use-auth-user";
import { authApi } from "@/app/modules/auth/login/services/auth.api";
import { refreshAccessToken } from "@/core/auth/auth-refresh";
import { useTenantHub } from "@/core/signalr/use-tenant-hub";
import { useTenantHubStore } from "@/core/stores/tenant-hub.store";
import { useApprovalHub } from "@/core/signalr/use-approval-hub";
import { useApprovalNotificationStore } from "@/core/stores/approval-notification.store";
import {
  useMarkAllNotificationsRead,
  useMyNotifications,
} from "@/core/notifications/hooks/use-user-notifications";
import { toBellEntry } from "@/core/notifications/approval-bell-entry";
import { ContextHelpDrawer } from "@/app/modules/help/components/context-help-drawer/context-help-drawer";
import { useAnnouncementHub } from "@/core/signalr/use-announcement-hub";
import {
  useMyLatestAnnouncements,
  useMyUnreadAnnouncementCount,
} from "@/app/modules/portal/announcements/hooks/use-my-announcement-queries";
import { AcknowledgementGate } from "@/app/modules/portal/announcements/components/acknowledgement-gate/acknowledgement-gate";
import { useMyEmployee } from "@/app/modules/portal/shared/hooks/use-my-employee-queries";
import ProvisioningScreen from "./provisioning-screen";
import { useSubscriptionState } from "@/app/modules/billing/hooks/use-subscription-state";
import { SubscriptionBanner } from "@/app/modules/billing/components/subscription-banner";
import { FeatureLocked } from "@/app/modules/billing/components/feature-locked";
import { PlanRestrictionModal } from "@/app/modules/billing/components/plan-restriction-modal";
import type { FeatureLock } from "@/app/modules/billing/utils/feature-lock";
import { usePlanRestrictionStore } from "@/core/stores/plan-restriction.store";
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
  permissions: string[];
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
    permissions: [],
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
    permissions: stored.permissions ?? [],
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
    "portal-raw-attendance": <FieldTimeOutlined />,
    "portal-shift-schedule": <CalendarOutlined />,
    "portal-group-time": <ClockCircleOutlined />,
    "portal-group-pay": <DollarOutlined />,
    "portal-group-applications": <FileProtectOutlined />,
    "portal-leave-credits": <FileProtectOutlined />,
    "portal-thirteenth-month": <DollarOutlined />,
    "portal-leave-applications": <FileProtectOutlined />,
    "portal-overtime": <FileProtectOutlined />,
    "portal-official-business": <FileProtectOutlined />,
    "portal-pass-slip": <FileProtectOutlined />,
    "portal-loan-applications": <FileProtectOutlined />,
    "portal-cash-bond": <FileProtectOutlined />,
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
    analytics: <LineChartOutlined />,
    "analytics-workforce": <TeamOutlined />,
    "analytics-attendance": <ClockCircleOutlined />,
    "analytics-payroll": <DollarOutlined />,
    "analytics-requests": <FileProtectOutlined />,
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
    "portal-announcements": <NotificationOutlined />,
    communication: <NotificationOutlined />,
    "communication-announcements": <NotificationOutlined />,
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

/** Why a menu item is locked by the plan, for its tooltip. */
function lockTooltip(lock: FeatureLock): string {
  return lock.reason === "revoked"
    ? "Not included in your subscription"
    : `Available on the ${lock.availableOn ?? "higher"} plan`;
}

function buildMenuItems(
  items: typeof NAVIGATION_ITEMS,
  hrDbReady: boolean,
  collapsed = false,
  lockFor: (features: FeatureKey[]) => FeatureLock | null = () => null,
  inherited: NavFeature[] = [],
): MenuItem[] {
  return items.map((item) => {
    // A page needs every subscription feature on its ancestor chain (navigation.const.ts).
    const features = item.feature ? [...inherited, item.feature] : inherited;
    if (item.type === "divider") {
      return { type: "divider" as const, key: item.key };
    }

    if (item.type === "group") {
      // Group headers (e.g. "Holidays & Leave Types") aren't clickable, so AntD's own
      // `disabled` styling never applied to them -- only to their children below. Left alone,
      // a still-active-looking group label sitting above visibly greyed-out children reads as
      // the group NOT respecting the provisioning gate, even though the children were already
      // correctly disabled. Mirror the same muted/tooltip treatment here for consistency.
      const groupDisabled = !hrDbReady;
      const label =
        collapsed || !groupDisabled ? (
          item.label
        ) : (
          <Tooltip
            title="Available once your company resources finish setting up"
            placement="right"
          >
            <span className="opacity-40">{item.label}</span>
          </Tooltip>
        );

      return {
        key: item.key,
        label,
        icon: getNavIcon(item.key),
        children: item.children
          ? buildMenuItems(
              item.children,
              hrDbReady,
              collapsed,
              lockFor,
              features,
            )
          : undefined,
      };
    }

    const disabled = !hrDbReady && !HR_DB_INDEPENDENT_KEYS.has(item.key);
    // Locked items stay clickable: the page explains what the plan lacks and how to get it.
    const lock = item.path ? lockFor(getRequiredFeatures(features)) : null;

    // When collapsed, AntD's built-in popup already shows the label text on hover —
    // wrapping in Tooltip creates a nested tooltip that breaks the popup text rendering.
    // Use a plain string when collapsed; use the truncating span when expanded.
    const label = collapsed ? (
      item.label
    ) : disabled ? (
      <Tooltip
        title="Available once your company resources finish setting up"
        placement="right"
      >
        <span className="block overflow-hidden text-ellipsis">
          {item.label}
        </span>
      </Tooltip>
    ) : lock ? (
      <Tooltip title={lockTooltip(lock)} placement="right">
        <span className="flex items-center justify-between gap-2">
          <span className="overflow-hidden text-ellipsis">{item.label}</span>
          <LockOutlined className="text-xs opacity-60" />
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
        ? buildMenuItems(item.children, hrDbReady, collapsed, lockFor, features)
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
  const [helpOpen, setHelpOpen] = useState(false);
  const [switchingTenant, setSwitchingTenant] = useState<string | null>(null);
  const { mode: themeMode, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const noticeClearance = confidentialNoticeFor(location.pathname);
  const sessionUser = getSessionUser();

  useTenantHub();
  const liveTenantStates = useTenantHubStore((s) => s.liveTenantStates);
  const tenantNotifications = useTenantHubStore((s) => s.notifications);
  const tenantUnreadCount = useTenantHubStore((s) => s.unreadCount);
  const markTenantNotificationsRead = useTenantHubStore((s) => s.markAllRead);
  const hrDb = useTenantHubStore((s) => s.getHrDbStatus(sessionUser.tenantId));

  // Same bell shows tenant/account events and approval-workflow events, merged here purely for
  // display by timestamp. Approval updates for one person are saved server-side (they survive a
  // refresh and reach people who were offline); pushes to every eligible approver aren't, and
  // live in useApprovalNotificationStore for this session only.
  useApprovalHub();
  const { data: savedPage } = useMyNotifications();
  const { mutate: markSavedRead } = useMarkAllNotificationsRead();
  const savedNotifications = useMemo(
    () => (savedPage?.items ?? []).map(toBellEntry),
    [savedPage],
  );
  const savedUnreadCount = savedPage?.unreadCount ?? 0;
  const unsavedApprovalNotifications = useApprovalNotificationStore(
    (s) => s.notifications,
  );
  const unsavedApprovalUnreadCount = useApprovalNotificationStore(
    (s) => s.unreadCount,
  );
  const markUnsavedApprovalRead = useApprovalNotificationStore(
    (s) => s.markAllRead,
  );

  // Company announcements are saved server-side (unlike the two in-memory stores above) and stay
  // unread until actually opened. Must come after useApprovalHub -- same hub connection.
  const openAnnouncement = useCallback(
    (announcementId: string) =>
      navigate({ to: `/portal/announcements/${announcementId}` }),
    [navigate],
  );
  useAnnouncementHub(openAnnouncement);
  const { data: announcementUnreadCount = 0 } = useMyUnreadAnnouncementCount();
  const { data: latestAnnouncements } = useMyLatestAnnouncements();
  const announcements = latestAnnouncements?.data ?? [];

  const notifications = useMemo(
    () =>
      [
        ...tenantNotifications,
        ...savedNotifications,
        ...unsavedApprovalNotifications,
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [tenantNotifications, savedNotifications, unsavedApprovalNotifications],
  );
  const unreadCount =
    tenantUnreadCount +
    savedUnreadCount +
    unsavedApprovalUnreadCount +
    announcementUnreadCount;
  const markAllRead = () => {
    markTenantNotificationsRead();
    markUnsavedApprovalRead();
    if (savedUnreadCount > 0) markSavedRead();
  };
  const activityItems: MenuItem[] = notifications.map((n) => {
    // Approval updates open the related request; tenant/account events have nowhere to go.
    const link = "link" in n ? n.link : undefined;
    return {
      key: n.id,
      onClick: link ? () => navigate({ to: link }) : undefined,
      label: (
        <div className="py-0.5">
          <p className="m-0 text-[13px] font-semibold text-(--ant-color-text)">
            {n.title}
          </p>
          <p className="mt-0.5 mb-0 text-xs whitespace-normal text-(--ant-color-text-secondary)">
            {n.message}
          </p>
          <p className="mt-1 mb-0 flex items-center justify-between gap-2 text-[11px] text-(--ant-color-text-tertiary)">
            <span>{new Date(n.createdAt).toLocaleString()}</span>
            {link && <span className="text-(--ant-color-primary)">View</span>}
          </p>
        </div>
      ),
    };
  });
  const announcementItems: MenuItem[] =
    announcements.length > 0
      ? [
          {
            key: "__announcements",
            type: "group",
            label: "Announcements",
            children: announcements.map((a) => ({
              key: `announcement-${a.id}`,
              onClick: () => openAnnouncement(a.id),
              label: (
                <div className="py-0.5">
                  <p
                    className={`m-0 flex items-center gap-1.5 text-[13px] text-(--ant-color-text) ${a.isRead ? "font-normal" : "font-semibold"}`}
                  >
                    {!a.isRead && (
                      <span className="inline-block size-1.5 shrink-0 rounded-full bg-(--ant-color-primary)" />
                    )}
                    {a.isPinned && (
                      <PushpinFilled className="text-(--ant-color-primary)" />
                    )}
                    <span className="truncate">{a.title}</span>
                  </p>
                  <p className="mt-0.5 mb-0 text-xs whitespace-normal text-(--ant-color-text-secondary)">
                    {a.needsAcknowledgement
                      ? "Needs your acknowledgement"
                      : (a.publishedByName ?? "Company")}
                  </p>
                </div>
              ),
            })),
          },
          {
            key: "__all-announcements",
            onClick: () => navigate({ to: "/portal/announcements" }),
            label: (
              <span className="text-xs text-(--ant-color-primary)">
                View all announcements
              </span>
            ),
          },
          ...(activityItems.length > 0
            ? [{ key: "__announcements-divider", type: "divider" as const }]
            : []),
        ]
      : [];
  const bellItems: MenuItem[] =
    announcementItems.length + activityItems.length > 0
      ? [...announcementItems, ...activityItems]
      : [
          {
            key: "__empty",
            disabled: true,
            label: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No notifications yet"
                className="py-3"
              />
            ),
          },
        ];

  const hrDbFailed =
    hrDb.known && !!hrDb.status && /fail|error/i.test(hrDb.status);

  // "My Portal" only shows once we know the logged-in user has a linked Employee record —
  // until that resolves (or if there is none), it's filtered out rather than shown disabled,
  // since most accounts will never have one. It's also gated on a permission (Employee Self-
  // Service Portal:View, granted to the Employee role by default — see tenantstore's
  // PermissionCatalogSeederService), same as any other item that opts into filterNavByPermission
  // — the linked-record check alone would otherwise leave it visible to someone who holds no
  // portal-related permission at all.
  const { data: myEmployee } = useMyEmployee();
  // The live session snapshot -- a new reference every time authStorage saves, e.g. the silent
  // refresh a SignalR roles-changed push triggers (use-tenant-hub.ts). It MUST be a dependency of
  // the memo below: re-rendering alone isn't enough, since a memo keyed only on myEmployee kept
  // returning the pre-change nav until the next reload, even though filterNavByPermission reads
  // the new roles/permissions from authStorage.
  const authUser = useAuthUser();
  const navItems = useMemo(() => {
    if (!authUser) return [];
    if (authStorage.isEmployeeOnly()) {
      return filterNavByPermission(
        NAVIGATION_ITEMS.filter((item) => item.key === "nav-portal"),
      );
    }
    const base = myEmployee
      ? NAVIGATION_ITEMS
      : NAVIGATION_ITEMS.filter((item) => item.key !== "nav-portal");
    return filterNavByPermission(base);
  }, [authUser, myEmployee]);

  useEffect(() => {
    const requiredPermission = getPermissionForPath(location.pathname);
    if (!requiredPermission) return;

    const codes = Array.isArray(requiredPermission)
      ? requiredPermission
      : [requiredPermission];
    if (authStorage.hasAnyPermission(...codes)) return;

    // Same target as the root route guard -- see resolveFallbackLanding for why a fixed
    // "/dashboard" here could loop.
    const fallback = resolveFallbackLanding();
    if (location.pathname === fallback) return;
    navigate({ to: fallback, replace: true });
    // authUser: re-check when roles change mid-session, not just on navigation -- a user whose
    // role was just downgraded shouldn't stay parked on a page they can no longer access.
  }, [location.pathname, navigate, authUser]);

  // Employee Portal pages go edge-to-edge (no outer margin/card border/shadow) instead of the
  // floating-card look admin pages use — .page-toolbar's -24px bleed margin still relies on the
  // p-4/md:p-6 padding staying in place, so only the outer m-*/app-content-surface are dropped.
  const isPortalRoute = location.pathname.startsWith("/portal");

  // The company's subscription: locks menu items and whole pages the plan doesn't include.
  const subscription = useSubscriptionState();
  const pageLock = subscription.lockFor(
    getRequiredFeatures(getFeaturesForPath(location.pathname)),
  );
  const showRestriction = usePlanRestrictionStore((s) => s.show);

  // Owning another company is a plan limit (companies.max) -- known here only when this user
  // owns the current company, whose subscription is then their own. The server checks it
  // regardless; this just says so before the user fills in the form.
  const companiesMax =
    subscription.snapshot?.limits[LIMIT_KEYS.COMPANIES_MAX] ?? UNLIMITED;
  const ownsCurrentCompany = sessionUser.tenants.some(
    (t) => t.tenantId === sessionUser.tenantId && t.roles.includes("Owner"),
  );
  const ownedCompanies = sessionUser.tenants.filter((t) =>
    t.roles.includes("Owner"),
  ).length;
  const companyLimitReached =
    ownsCurrentCompany &&
    companiesMax !== UNLIMITED &&
    ownedCompanies >= companiesMax;
  const handleNewCompany = () => {
    if (!companyLimitReached) {
      navigate({ to: "/create-tenant" });
      return;
    }
    showRestriction({
      type: SUBSCRIPTION_PROBLEM_TYPES.PLAN_LIMIT_REACHED,
      detail: `Your plan allows ${companiesMax} ${companiesMax === 1 ? "company" : "companies"}. Upgrade to add another.`,
      limit: LIMIT_KEYS.COMPANIES_MAX,
      max: companiesMax,
      used: ownedCompanies,
    });
  };

  const menuItems = buildMenuItems(
    navItems,
    hrDb.ready,
    collapsed,
    subscription.lockFor,
  );
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
    // Fire-and-forget: revokes the refresh-token cookie server-side (authApi.logout), but a
    // failed/slow revoke call must never delay or block the client-side logout the user is
    // actually waiting on -- local state is cleared and the redirect fires immediately either
    // way, matching how every other forced-logout path in this app (auth-refresh.ts,
    // use-tenant-hub.ts) already behaves.
    void authApi.logout().catch(() => {});
    authStorage.clear();
    window.location.assign("/login");
  };

  const handleSwitchTenant = async (tenantId: string) => {
    setSwitchingTenant(tenantId);

    const doSwitch = async () => {
      const result = await authApi.selectTenant(tenantId);
      const claims = authStorage.getTenantClaims(result.accessToken);
      const user = authStorage.getUser();

      const mergedTenants = mergeTenants(user?.tenants ?? [], result.tenants);

      authStorage.save(result.accessToken, {
        ...user!,
        roles: result.roles,
        permissions: result.permissions,
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
          "Could not switch to the selected company. Please try again.",
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
              <Tooltip title="Help for this screen">
                <button
                  type="button"
                  className="header-collapse-trigger"
                  aria-label="Help"
                  onClick={() => setHelpOpen(true)}
                >
                  <QuestionCircleOutlined />
                </button>
              </Tooltip>
              <ContextHelpDrawer
                open={helpOpen}
                onClose={() => setHelpOpen(false)}
              />
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                onOpenChange={(open) => {
                  if (open) markAllRead();
                }}
                menu={{
                  className: "min-w-80 max-w-96 max-h-110 overflow-y-auto",
                  items: bellItems,
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
                    "Company"
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
                              New company
                              {companyLimitReached && (
                                <LockOutlined className="ml-2 text-xs opacity-60" />
                              )}
                            </span>
                          ),
                          onClick: handleNewCompany,
                        },
                      ],
                    }}
                  >
                    <button
                      type="button"
                      className="header-collapse-trigger"
                      aria-label="Switch company"
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
              {!authStorage.isEmployeeOnly() && (
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
              )}
            </div>
          </div>
        </Header>

        <Content
          className={
            isPortalRoute
              ? "app-content-scroll p-4 md:p-6 min-h-70 relative portal-shell"
              : "app-content-surface app-content-scroll m-2 p-4 md:m-6 md:p-6 min-h-70 relative"
          }
        >
          {!hrDb.ready ? (
            <ProvisioningScreen
              tenantName={sessionUser.tenantName}
              failed={hrDbFailed}
            />
          ) : (
            <>
              <SubscriptionBanner />
              {noticeClearance && (
                <ConfidentialDataNotice clearance={noticeClearance} />
              )}
              {pageLock ? <FeatureLocked lock={pageLock} /> : <Outlet />}
            </>
          )}
          <AcknowledgementGate />
          <PlanRestrictionModal />
        </Content>
      </Layout>
    </Layout>
  );
}
