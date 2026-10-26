import { describe, expect, it } from "vitest";
import {
  NAVIGATION_ITEMS,
  flattenNavPaths,
  getFeaturesForPath,
  getPermissionForPath,
  getRequiredFeatures,
  withHrmsProduct,
} from "./navigation.const";
import { BASE_FEATURE, FEATURE_KEYS } from "./entitlement-keys.const";

describe("NAVIGATION_ITEMS", () => {
  // An untagged item is visible to every member -- including a plain Member, who holds no
  // permissions at all -- which is how the whole Security menu and Holidays & Leave Types used
  // to show up for everyone. Every page, Dashboard included, must be tagged (on itself or an
  // ancestor group).
  it("gates every page on a permission", () => {
    const ungated = flattenNavPaths(NAVIGATION_ITEMS).filter(
      (path) => !getPermissionForPath(path),
    );

    expect(ungated).toEqual([]);
  });

  // Every page belongs to a subscription feature, or is explicitly on every plan -- a new page
  // can't ship without someone deciding which plan it's on.
  it("assigns every page to a plan feature or to every plan", () => {
    const unassigned = flattenNavPaths(NAVIGATION_ITEMS).filter(
      (path) => getFeaturesForPath(path).length === 0,
    );

    expect(unassigned).toEqual([]);
  });
});

describe("withHrmsProduct", () => {
  it("puts every menu page behind the HRMS system", () => {
    expect(withHrmsProduct("/setup/employee", [])).toEqual([
      FEATURE_KEYS.HRMS_CORE,
    ]);
    expect(withHrmsProduct("/payroll", [FEATURE_KEYS.PAYROLL_CORE])).toEqual([
      FEATURE_KEYS.HRMS_CORE,
      FEATURE_KEYS.PAYROLL_CORE,
    ]);
  });

  it("keeps billing reachable so the plan can be changed", () => {
    expect(withHrmsProduct("/billing", [])).toEqual([]);
    expect(withHrmsProduct("/billing/plans", [])).toEqual([]);
  });

  it("never locks a group header", () => {
    expect(withHrmsProduct(undefined, [])).toEqual([]);
  });
});

describe("getFeaturesForPath", () => {
  it("keeps every plan's pages free of paid features", () => {
    const employeePage = getFeaturesForPath("/setup/employee");
    expect(getRequiredFeatures(employeePage)).toEqual([]);
    expect(getFeaturesForPath("/dashboard")).toEqual([BASE_FEATURE]);
  });

  it("puts payroll, statutory and premium pages on their features", () => {
    expect(getFeaturesForPath("/daily-time-record/for-payroll")).toContain(
      FEATURE_KEYS.PAYROLL_CORE,
    );
    expect(getFeaturesForPath("/payroll/reports/bir-2316")).toContain(
      FEATURE_KEYS.REPORTS_STATUTORY,
    );
    expect(getFeaturesForPath("/analytics/payroll")).toEqual([
      FEATURE_KEYS.ANALYTICS,
    ]);
    expect(getFeaturesForPath("/security/audit")).toContain(
      FEATURE_KEYS.AUDIT_TRAIL,
    );
    expect(getFeaturesForPath("/setup/client")).toContain(
      FEATURE_KEYS.CLIENTS_AGENCY,
    );
  });

  it("accumulates a group's feature onto its pages", () => {
    // My Payslips needs the portal itself and payroll.
    expect(getFeaturesForPath("/portal/payslips")).toEqual([
      FEATURE_KEYS.PORTAL_SELF_SERVICE,
      FEATURE_KEYS.PAYROLL_CORE,
    ]);
  });

  it("matches a page's sub-paths too", () => {
    expect(getFeaturesForPath("/setup/client/123")).toContain(
      FEATURE_KEYS.CLIENTS_AGENCY,
    );
  });

  it("keeps Billing on every plan", () => {
    const plansPage = getFeaturesForPath("/billing/plans");
    expect(getRequiredFeatures(plansPage)).toEqual([]);
  });
});
