import { describe, expect, it } from "vitest";
import { NAVIGATION_ITEMS } from "@/shared/constants/navigation.const";
import type { NavItem } from "@/shared/constants/navigation.const";
import type { PortalVisibilityResponse } from "@/app/modules/portal/shared/models/api/response/portal-visibility-response.model";
import {
  filterNavByPortalVisibility,
  PORTAL_NAV_VISIBILITY_KEYS,
} from "./filter-nav-by-portal-visibility";

const keys = (items: NavItem[]): string[] =>
  items.flatMap((item) => [item.key, ...keys(item.children ?? [])]);

const PORTAL = NAVIGATION_ITEMS.filter((item) => item.key === "nav-portal");

const allOn: PortalVisibilityResponse = {
  showThirteenthMonth: true,
  showCashBond: true,
  showUniformAllowance: true,
  showAnnouncements: true,
  showCoworkers: true,
  showDtr: true,
  showIncompletePunches: true,
  showRawAttendance: true,
  showShiftSchedule: true,
  showPayslips: true,
  showLeaveCredits: true,
  showDeductions: true,
  showLeaveApplications: true,
  showOvertime: true,
  showOfficialBusiness: true,
  showPassSlip: true,
  showLoanApplications: true,
  showPunch: true,
};

const allOff = Object.fromEntries(
  Object.keys(allOn).map((key) => [key, false]),
) as unknown as PortalVisibilityResponse;

describe("filterNavByPortalVisibility", () => {
  it("lists everything while the setting is still loading", () => {
    expect(filterNavByPortalVisibility(PORTAL, undefined)).toBe(PORTAL);
  });

  it("keeps every page when the company has all of them on", () => {
    expect(keys(filterNavByPortalVisibility(PORTAL, allOn))).toEqual(
      keys(PORTAL),
    );
  });

  it("hides only the page that was switched off", () => {
    const visible = keys(
      filterNavByPortalVisibility(PORTAL, { ...allOn, showCashBond: false }),
    );

    expect(visible).not.toContain("portal-cash-bond");
    expect(visible).toContain("portal-thirteenth-month");
    expect(visible).toContain("portal-uniform-allowance");
  });

  it("hides every switchable page, and the groups left empty, when every switch is off", () => {
    const visible = keys(filterNavByPortalVisibility(PORTAL, allOff));

    for (const navKey of Object.keys(PORTAL_NAV_VISIBILITY_KEYS)) {
      expect(visible).not.toContain(navKey);
    }
    expect(visible).not.toContain("portal-group-time");
    expect(visible).not.toContain("portal-group-pay");
    expect(visible).not.toContain("portal-group-applications");
  });

  it("always keeps the dashboard and profile", () => {
    const visible = keys(filterNavByPortalVisibility(PORTAL, allOff));

    expect(visible).toContain("portal-dashboard");
    expect(visible).toContain("portal-profile");
  });

  it("covers every switch the company can set", () => {
    expect(Object.values(PORTAL_NAV_VISIBILITY_KEYS).sort()).toEqual(
      [...Object.keys(allOn)].sort(),
    );
  });

  it("only maps menu items that exist", () => {
    const all = keys(PORTAL);

    for (const navKey of Object.keys(PORTAL_NAV_VISIBILITY_KEYS)) {
      expect(all).toContain(navKey);
    }
  });
});
