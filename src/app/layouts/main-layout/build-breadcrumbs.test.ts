import { describe, expect, it } from "vitest";
import type { NavItem } from "@/shared/constants/navigation.const";
import { buildBreadcrumbs } from "./build-breadcrumbs";

const ITEMS: NavItem[] = [
  { key: "dash", label: "Dashboard", path: "/dashboard" },
  {
    key: "apps",
    label: "Applications",
    children: [
      { key: "leave", label: "Leave", path: "/applications/leave" },
      { key: "ot", label: "Overtime", path: "/applications/overtime" },
    ],
  },
];

describe("buildBreadcrumbs", () => {
  it("returns the group and the current page, with no link on the current page", () => {
    expect(buildBreadcrumbs("/applications/leave", ITEMS)).toEqual([
      { label: "Applications", path: undefined },
      { label: "Leave" },
    ]);
  });

  it("links the matched page and appends Create for a create sub-page", () => {
    expect(buildBreadcrumbs("/applications/leave/create", ITEMS)).toEqual([
      { label: "Applications", path: undefined },
      { label: "Leave", path: "/applications/leave" },
      { label: "Create" },
    ]);
  });

  it("appends Details for a record sub-page", () => {
    expect(buildBreadcrumbs("/applications/leave/abc-123", ITEMS)).toEqual([
      { label: "Applications", path: undefined },
      { label: "Leave", path: "/applications/leave" },
      { label: "Details" },
    ]);
  });

  it("names signed-in pages that live outside the menu", () => {
    expect(buildBreadcrumbs("/notifications", ITEMS)).toEqual([
      { label: "Notifications" },
    ]);
  });

  it("falls back to Dashboard for an unknown path", () => {
    expect(buildBreadcrumbs("/nowhere", ITEMS)).toEqual([
      { label: "Dashboard" },
    ]);
  });
});
