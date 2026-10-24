import { describe, expect, it } from "vitest";
import { NAVIGATION_ITEMS } from "@/shared/constants/navigation.const";
import type { NavItem } from "@/shared/constants/navigation.const";
import { filterNavByPortalVisibility } from "./filter-nav-by-portal-visibility";

const keys = (items: NavItem[]): string[] =>
  items.flatMap((item) => [item.key, ...keys(item.children ?? [])]);

const PORTAL = NAVIGATION_ITEMS.filter((item) => item.key === "nav-portal");

const allOn = {
  showThirteenthMonth: true,
  showCashBond: true,
  showUniformAllowance: true,
};

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

  it("hides all three pages when every switch is off", () => {
    const visible = keys(
      filterNavByPortalVisibility(PORTAL, {
        showThirteenthMonth: false,
        showCashBond: false,
        showUniformAllowance: false,
      }),
    );

    expect(visible).not.toContain("portal-thirteenth-month");
    expect(visible).not.toContain("portal-cash-bond");
    expect(visible).not.toContain("portal-uniform-allowance");
    expect(visible).toContain("portal-payslips");
  });
});
