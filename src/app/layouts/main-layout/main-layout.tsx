import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Button,
  Drawer,
  Dropdown,
  Empty,
  Layout,
  Menu,
  Spin,
  Tag,
  Tooltip,
  message,
  notification,
} from "antd";
import {
  EllipsisOutlined,
  FileTextOutlined,
  BankOutlined,
  BellOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
  CheckOutlined,
  LockOutlined,
  StarFilled,
  StarOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  PlusOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  MoonOutlined,
  PushpinFilled,
  SettingOutlined,
  SunOutlined,
} from "@ant-design/icons";
import { CommandPalette } from "./command-palette/command-palette";
import { getNavIcon } from "./nav-icons";
import { HeaderBreadcrumbs } from "./header-breadcrumbs";
import { buildBreadcrumbs } from "./build-breadcrumbs";
import { Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import type { AxiosError } from "axios";
import {
  NAVIGATION_ITEMS,
  type NavItem,
  getFeaturesForPath,
  getPermissionForPath,
  getRequiredFeatures,
  withHrmsProduct,
} from "@/shared/constants/navigation.const";
import {
  LIMIT_KEYS,
  SUBSCRIPTION_PROBLEM_TYPES,
  UNLIMITED,
  type FeatureKey,
  type NavFeature,
} from "@/shared/constants/entitlement-keys.const";
import { useThemeStore } from "@/core/stores/theme.store";
import { useSidebarStore } from "@/core/stores/sidebar.store";
import {
  useNavShortcutsStore,
  useUserShortcuts,
} from "@/core/stores/nav-shortcuts.store";
import {
  MAX_PINNED_PAGES,
  keepAvailable,
} from "@/core/stores/nav-shortcuts.util";
import { collectPalettePages } from "./command-palette/palette-search";
import { authStorage, mergeTenants } from "@/core/auth/auth-storage";
import { stopImpersonation } from "@/core/auth/impersonation";
import { ImpersonationBanner } from "@/shared/components/impersonation-banner/impersonation-banner";
import { resolveFallbackLanding } from "@/core/auth/tenant-routing";
import { filterNavByPermission } from "./filter-nav-by-permission";
import { filterNavByPortalVisibility } from "./filter-nav-by-portal-visibility";
import { ConfidentialDataNotice } from "@/shared/components/confidential-data-notice/confidential-data-notice";
import { confidentialNoticeFor } from "@/shared/components/confidential-data-notice/confidential-notice-paths";
import { useAuthUser } from "@/core/auth/use-auth-user";
import {
  useLogoutMutation,
  useSelectTenantMutation,
} from "@/app/modules/auth/login/hooks/use-auth-mutations";
import { useTenantHub } from "@/core/signalr/use-tenant-hub";
import { useTenantHubStore } from "@/core/stores/tenant-hub.store";
import { useApprovalHub } from "@/core/signalr/use-approval-hub";
import { useApprovalNotificationStore } from "@/core/stores/approval-notification.store";
import {
  useClearMyNotifications,
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
import {
  useMyEmployee,
  usePortalVisibility,
} from "@/app/modules/portal/shared/hooks/use-my-employee-queries";
import ProvisioningScreen from "./provisioning-screen";
import { useSubscriptionState } from "@/app/modules/billing/hooks/use-subscription-state";
import { useSubscriptionBoundaryRefresh } from "@/app/modules/billing/hooks/use-subscription-boundary-refresh";
import { StorageBanner } from "@/app/modules/billing/components/storage-banner";
import { SubscriptionBanner } from "@/app/modules/billing/components/subscription-banner";
import { ConnectionStatusBanner } from "@/shared/components/connection-status-banner/connection-status-banner";
import { FeatureLocked } from "@/app/modules/billing/components/feature-locked";
import { PlanRestrictionModal } from "@/app/modules/billing/components/plan-restriction-modal";
import { TermsAcceptanceGate } from "@/app/modules/legal/components/terms-acceptance-gate";
import { useTermsLive } from "@/app/modules/legal/hooks/use-terms-queries";
import { DeviationAckModal } from "@/shared/components/deviation-ack-modal";
import type { FeatureLock } from "@/app/modules/billing/utils/feature-lock";
import { CompanyLocked } from "@/app/modules/billing/components/company-locked";
import {
  isCompanyClosed,
  isCompanyLocked,
} from "@/app/modules/billing/utils/company-lock";
import { usePlanRestrictionStore } from "@/core/stores/plan-restriction.store";
import type { TenantSummary } from "@/app/modules/auth/login/models/api/response/tenant-summary.model";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;

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

/** Nav keys that don't depend on the tenant's HR database and stay enabled while it provisions. */
const HR_DB_INDEPENDENT_KEYS = new Set(["dashboard"]);
const LOGOUT_REVOKE_WAIT_MS = 2_000;
const COMPANY_SETTINGS_PATH = "/setup/company-policy";

/** Why a menu item is locked by the plan, for its tooltip. */
function lockTooltip(lock: FeatureLock): string {
  return lock.reason === "revoked"
    ? "Not included in your subscription"
    : `Available on the ${lock.availableOn ?? "higher"} plan`;
}

/**
 * The AntD menu key an item renders under. Pages (and page-groups like Reports' "/reports") are
 * keyed by path so a click navigates; plain groups by their nav key. Open-key tracking must use
 * the same value, or a page-group never auto-opens.
 */
function menuKeyOf(item: NavItem): string {
  return item.type === "group" ? item.key : (item.path ?? item.key);
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
      // Group headers (e.g. "Time Shifts") aren't clickable, so AntD's own
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
    const lock = item.path
      ? lockFor(withHrmsProduct(item.path, getRequiredFeatures(features)))
      : null;

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
      key: menuKeyOf(item),
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
        [...ancestors, menuKeyOf(item)],
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
  const [narrowViewport] = useState(
    () => window.matchMedia("(max-width: 1024px)").matches,
  );
  const storedCollapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);
  const collapsed = storedCollapsed ?? narrowViewport;
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 767px)").matches,
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuNavRef = useRef<HTMLElement>(null);
  const [switchingTenant, setSwitchingTenant] = useState<string | null>(null);
  const { mode: themeMode, toggle: toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const termsLive = useTermsLive();
  const { mutateAsync: logout } = useLogoutMutation();
  const { mutateAsync: selectTenant } = useSelectTenantMutation();
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
  const { mutate: clearSaved } = useClearMyNotifications();
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
  const clearUnsavedApproval = useApprovalNotificationStore(
    (s) => s.clearNotifications,
  );
  const clearTenantNotifications = useTenantHubStore(
    (s) => s.clearNotifications,
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
  const clearAllNotifications = () => {
    clearTenantNotifications();
    clearUnsavedApproval();
    if (savedNotifications.length > 0) clearSaved();
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
  const hasBellEntries = announcementItems.length + activityItems.length > 0;
  // View all / Clear all live in the dropdown's pinned footer (popupRender below), not in this
  // scrolling list, so they stay visible however many notifications there are.
  const bellItems: MenuItem[] = hasBellEntries
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
  // Company Settings > Payroll Settings can switch off 13th Month / Cash Bond / Uniform Allowance.
  const { data: portalVisibility } = usePortalVisibility(!!myEmployee);
  const navItems = useMemo(() => {
    if (!authUser) return [];
    if (authStorage.isEmployeeOnly()) {
      return filterNavByPortalVisibility(
        filterNavByPermission(
          NAVIGATION_ITEMS.filter((item) => item.key === "nav-portal"),
        ),
        portalVisibility,
      );
    }
    const base = myEmployee
      ? NAVIGATION_ITEMS
      : NAVIGATION_ITEMS.filter((item) => item.key !== "nav-portal");
    return filterNavByPortalVisibility(
      filterNavByPermission(base),
      portalVisibility,
    );
  }, [authUser, myEmployee, portalVisibility]);

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
  useSubscriptionBoundaryRefresh();
  const pageFeatures = getFeaturesForPath(location.pathname);
  const pageLock = subscription.lockFor(
    withHrmsProduct(
      pageFeatures.length > 0 ? location.pathname : undefined,
      getRequiredFeatures(pageFeatures),
    ),
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
  // Only the owner of the company they're working in can start another (the server refuses
  // anyone else); switch to a company you own to add one.
  const canCreateCompany = ownsCurrentCompany;
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

  // The owner's plan lapsed and this member isn't the owner or a billing admin: the company is
  // closed to them (the server refuses their requests too), so no menu -- just the lock screen.
  const companyLocked = isCompanyLocked(
    subscription.snapshot,
    subscription.canViewBilling,
  );
  // Read-only, suspended or on hold: the header keeps only the company switcher, theme and
  // sign-out -- no search, help, notifications, Company Settings or New company.
  const companyClosed = isCompanyClosed(subscription.snapshot);
  // Recent and pinned pages, limited to what this user can still open.
  const userKey = authUser?.email;
  const palettePages = useMemo(() => collectPalettePages(navItems), [navItems]);
  const pageLabels = useMemo(
    () => new Map(palettePages.map((p) => [p.path, p.label])),
    [palettePages],
  );
  const shortcuts = useUserShortcuts(userKey);
  const visitPage = useNavShortcutsStore((s) => s.visit);
  const togglePin = useNavShortcutsStore((s) => s.togglePin);
  const pinnedPaths = useMemo(
    () => keepAvailable(shortcuts.pinned, new Set(pageLabels.keys())),
    [shortcuts.pinned, pageLabels],
  );
  const recentPaths = useMemo(
    () => keepAvailable(shortcuts.recent, new Set(pageLabels.keys())),
    [shortcuts.recent, pageLabels],
  );
  useEffect(() => {
    if (userKey && pageLabels.has(location.pathname)) {
      visitPage(userKey, location.pathname);
    }
  }, [userKey, pageLabels, location.pathname, visitPage]);
  const handleTogglePin = (path: string) => {
    if (userKey && !togglePin(userKey, path)) {
      message.info(
        `You can pin up to ${MAX_PINNED_PAGES} pages. Unpin one to add another.`,
      );
    }
  };
  const currentPagePinned = pinnedPaths.includes(location.pathname);
  // The header shortcut follows the menu entry, so it hides for anyone the menu hides it from.
  const canOpenCompanySettings = pageLabels.has(COMPANY_SETTINGS_PATH);

  const baseMenuItems = buildMenuItems(
    companyLocked ? [] : navItems,
    hrDb.ready,
    collapsed,
    subscription.lockFor,
  );
  const menuItems: MenuItem[] =
    pinnedPaths.length > 0 && !companyLocked
      ? [
          {
            key: "pinned",
            type: "group",
            label: "Pinned",
            children: pinnedPaths.map((path) => ({
              key: `pinned:${path}`,
              label: pageLabels.get(path),
              icon: <StarFilled />,
            })),
          },
          { key: "pinned-divider", type: "divider" },
          ...baseMenuItems,
        ]
      : baseMenuItems;
  const navEntries = flattenNavigation(navItems);
  const breadcrumbs = buildBreadcrumbs(location.pathname, navItems);
  const activeMenuKey = resolveActiveMenuKey(location.pathname, navEntries);

  const [openKeys, setOpenKeys] = useState<string[]>(
    () => findAncestorKeys(location.pathname, navItems) ?? [],
  );

  useEffect(() => {
    const keys = findAncestorKeys(location.pathname, navItems);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (keys) setOpenKeys(keys);
  }, [location.pathname, navItems]);

  // Keep the selected menu item in view -- with a long menu it can sit below the fold.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      menuNavRef.current
        ?.querySelector(".ant-menu-item-selected")
        ?.scrollIntoView({ block: "nearest" });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [activeMenuKey, collapsed]);

  useEffect(() => {
    if (!hrDb.known || hrDb.ready) return;
    const allowed =
      location.pathname === "/dashboard" ||
      location.pathname === "/profile" ||
      location.pathname === "/notifications";
    if (!allowed) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [hrDb.known, hrDb.ready, location.pathname, navigate]);

  useEffect(() => {
    if (companyClosed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [companyClosed]);

  // Accordion: opening a top-level group closes the others, so the menu stays short.
  const handleOpenChange = (keys: string[]) => {
    const opened = keys.find((k) => !openKeys.includes(k));
    const rootKeys = NAVIGATION_ITEMS.map(menuKeyOf);
    setOpenKeys(opened && rootKeys.includes(opened) ? [opened] : keys);
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    const path = key.startsWith("pinned:") ? key.slice("pinned:".length) : key;
    if (path.startsWith("/")) {
      if (isMobile) setMobileMenuOpen(false);
      navigate({ to: path });
    }
  };

  const handleLogout = async () => {
    // Signing out of an impersonation session is Stop: it must not revoke the real refresh cookie.
    if (authStorage.isImpersonating()) {
      await stopImpersonation();
      return;
    }
    // Gives the server a moment to revoke the refresh-token cookie (authApi.logout): navigating
    // away immediately usually aborts that request, leaving the cookie valid. Capped, so a
    // failed/slow revoke still never blocks the client-side logout the user is waiting on.
    await Promise.race([
      logout().catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, LOGOUT_REVOKE_WAIT_MS)),
    ]);
    authStorage.clear();
    window.location.assign("/login");
  };

  const handleSwitchTenant = async (tenantId: string) => {
    setSwitchingTenant(tenantId);

    const doSwitch = async () => {
      const result = await selectTenant(tenantId);
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

    // A 401 here was already force-refreshed and replayed once by the axios unauthorized
    // interceptor (and a dead refresh token signs the user out), so any error left is final.
    try {
      await doSwitch();
    } catch (err) {
      showError(err);
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
    else setCollapsed(!collapsed);
  };

  const siderContent = (
    <>
      <div
        role="button"
        tabIndex={0}
        className="brand-chip m-4 rounded-xl px-3 py-3 text-white shadow-sm cursor-pointer"
        onClick={() => navigate({ to: "/" })}
        aria-label="Go to home"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigate({ to: "/" });
          }
        }}
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
      <nav
        ref={menuNavRef}
        aria-label="Main navigation"
        className="app-sider-menu-scroll"
      >
        <Menu
          theme="light"
          mode="inline"
          className="app-menu"
          selectedKeys={[activeMenuKey, `pinned:${activeMenuKey}`]}
          openKeys={openKeys}
          onOpenChange={handleOpenChange}
          items={menuItems}
          onClick={handleMenuClick}
        />
      </nav>
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
      <ImpersonationBanner />
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
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
                <HeaderBreadcrumbs crumbs={breadcrumbs} />
                {pageLabels.has(location.pathname) && (
                  <Tooltip
                    title={
                      currentPagePinned
                        ? "Unpin from sidebar"
                        : "Pin to top of sidebar"
                    }
                  >
                    <button
                      type="button"
                      className="header-pin-trigger"
                      aria-pressed={currentPagePinned}
                      aria-label={
                        currentPagePinned ? "Unpin this page" : "Pin this page"
                      }
                      onClick={() => handleTogglePin(location.pathname)}
                    >
                      {currentPagePinned ? <StarFilled /> : <StarOutlined />}
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>

            <div className="header-search-wrap">
              {!companyClosed && (
                <>
                  <button
                    type="button"
                    className="header-search"
                    aria-label="Search pages and employees"
                    onClick={() => setPaletteOpen(true)}
                  >
                    <SearchOutlined />
                    <span>Search…</span>
                    <kbd>Ctrl K</kbd>
                  </button>
                  <button
                    type="button"
                    className="header-collapse-trigger header-search-icon"
                    aria-label="Search pages and employees"
                    onClick={() => setPaletteOpen(true)}
                  >
                    <SearchOutlined />
                  </button>
                  <Tooltip title="Help for this screen">
                    <button
                      type="button"
                      className="header-collapse-trigger max-md:hidden!"
                      aria-label="Help"
                      onClick={() => setHelpOpen(true)}
                    >
                      <QuestionCircleOutlined />
                    </button>
                  </Tooltip>
                </>
              )}
              <CommandPalette
                open={paletteOpen}
                onClose={() => setPaletteOpen(false)}
                navItems={navItems}
                onNavigate={(path) => navigate({ to: path })}
                pinnedPaths={pinnedPaths}
                recentPaths={recentPaths}
                onTogglePin={handleTogglePin}
              />
              <ContextHelpDrawer
                open={helpOpen}
                onClose={() => setHelpOpen(false)}
              />
              {!companyClosed && (
                <Dropdown
                  trigger={["click"]}
                  placement="bottomRight"
                  open={bellOpen}
                  rootClassName="bell-dropdown"
                  onOpenChange={(open) => {
                    setBellOpen(open);
                    if (open) markAllRead();
                  }}
                  menu={{
                    className:
                      "min-w-80 max-w-96 max-h-none! overflow-visible!",
                    items: bellItems,
                  }}
                  popupRender={(menu) => (
                    <div className="flex flex-col overflow-hidden rounded-lg bg-(--ant-color-bg-elevated) shadow-lg max-sm:h-dvh max-sm:rounded-none">
                      <div className="flex items-center justify-between border-b border-(--ant-color-split) px-4 py-2 sm:hidden">
                        <span className="font-semibold">Notifications</span>
                        <Button
                          type="text"
                          aria-label="Close notifications"
                          icon={<CloseOutlined />}
                          onClick={() => setBellOpen(false)}
                        />
                      </div>
                      <div className="max-h-[min(24rem,calc(100vh-10rem))] overflow-y-auto max-sm:max-h-none max-sm:flex-1">
                        {menu}
                      </div>
                      {hasBellEntries && (
                        <div className="flex items-center justify-between border-t border-(--ant-color-split) px-2 py-1">
                          <Button
                            type="link"
                            size="small"
                            onClick={() => {
                              setBellOpen(false);
                              navigate({ to: "/notifications" });
                            }}
                          >
                            View all notifications
                          </Button>
                          {activityItems.length > 0 && (
                            <Button
                              type="text"
                              size="small"
                              onClick={clearAllNotifications}
                            >
                              Clear all
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
              )}
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
                        ...(canCreateCompany && !companyClosed
                          ? [
                              { type: "divider" as const },
                              {
                                key: "__create-tenant",
                                icon: (
                                  <PlusOutlined style={{ color: "#1DA081" }} />
                                ),
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
                            ]
                          : []),
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
                  className="header-collapse-trigger max-md:hidden!"
                  aria-label="Toggle theme"
                  onClick={toggleTheme}
                >
                  {themeMode === "dark" ? <SunOutlined /> : <MoonOutlined />}
                </button>
              </Tooltip>
              {canOpenCompanySettings && !companyClosed && (
                <Tooltip title="Company Settings">
                  <button
                    type="button"
                    className="header-collapse-trigger max-md:hidden!"
                    aria-label="Company Settings"
                    onClick={() => navigate({ to: COMPANY_SETTINGS_PATH })}
                  >
                    <SettingOutlined />
                  </button>
                </Tooltip>
              )}
              <Dropdown
                trigger={["click"]}
                placement="bottomRight"
                menu={{
                  items: [
                    ...(companyClosed
                      ? []
                      : [
                          {
                            key: "help",
                            icon: <QuestionCircleOutlined />,
                            label: "Help for this screen",
                          },
                        ]),
                    {
                      key: "theme",
                      icon:
                        themeMode === "dark" ? (
                          <SunOutlined />
                        ) : (
                          <MoonOutlined />
                        ),
                      label:
                        themeMode === "dark"
                          ? "Switch to light mode"
                          : "Switch to dark mode",
                    },
                    ...(canOpenCompanySettings && !companyClosed
                      ? [
                          {
                            key: "policy",
                            icon: <SettingOutlined />,
                            label: "Company Settings",
                          },
                        ]
                      : []),
                    ...(termsLive
                      ? [
                          {
                            key: "terms",
                            icon: <FileTextOutlined />,
                            label: "Terms of Service",
                          },
                        ]
                      : []),
                  ],
                  onClick: ({ key }) => {
                    if (key === "help") setHelpOpen(true);
                    else if (key === "theme") toggleTheme();
                    else if (key === "terms")
                      window.open("/terms", "_blank", "noopener");
                    else if (key === "policy")
                      navigate({ to: COMPANY_SETTINGS_PATH });
                  },
                }}
              >
                <button
                  type="button"
                  className="header-collapse-trigger header-more-trigger"
                  aria-label="More options"
                >
                  <EllipsisOutlined />
                </button>
              </Dropdown>
            </div>
          </div>
        </Header>

        <ConnectionStatusBanner />
        {hrDb.ready && !companyLocked && <SubscriptionBanner />}
        {hrDb.ready && !companyLocked && <StorageBanner />}

        <Content
          id="main-content"
          tabIndex={-1}
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
          ) : companyLocked ? (
            <CompanyLocked
              companyName={sessionUser.tenantName}
              status={subscription.snapshot?.status}
              restriction={subscription.snapshot?.restriction}
              canViewBilling={subscription.canViewBilling}
              canSwitch={sessionUser.tenants.length > 1}
              onSignOut={handleLogout}
            />
          ) : (
            <>
              {noticeClearance && (
                <ConfidentialDataNotice clearance={noticeClearance} />
              )}
              {pageLock ? <FeatureLocked lock={pageLock} /> : <Outlet />}
            </>
          )}
          <AcknowledgementGate />
          <PlanRestrictionModal />
          <TermsAcceptanceGate />
          <DeviationAckModal />
        </Content>
      </Layout>
    </Layout>
  );
}
