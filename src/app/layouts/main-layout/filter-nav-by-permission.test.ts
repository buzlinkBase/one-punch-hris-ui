import { beforeEach, describe, expect, it } from "vitest";
import { authStorage } from "@/core/auth/auth-storage";
import {
  NAVIGATION_ITEMS,
  type NavItem,
} from "@/shared/constants/navigation.const";
import { filterNavByPermission } from "./filter-nav-by-permission";

const signInWith = (roles: string[], permissions: string[]) =>
  authStorage.save("token", {
    email: "user@example.com",
    name: "User",
    roles,
    permissions,
    tenantId: "tenant-1",
    tenants: [],
  });

const keys = (items: NavItem[]): string[] =>
  items.flatMap((item) => [item.key, ...keys(item.children ?? [])]);

describe("filterNavByPermission", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows nothing at all -- Dashboard included -- to a role with no permissions", () => {
    signInWith(["Member"], []);

    expect(filterNavByPermission(NAVIGATION_ITEMS)).toEqual([]);
  });

  it("keeps only the granted page and the groups leading to it", () => {
    signInWith(["Member"], ["Leave:View"]);

    const visible = filterNavByPermission(NAVIGATION_ITEMS);

    expect(keys(visible)).toEqual(["applications", "applications-leave"]);
  });

  it("hides a nested group whose children are all filtered out", () => {
    signInWith(["Member"], ["Holiday Setup:View"]);

    const visible = filterNavByPermission(NAVIGATION_ITEMS);

    expect(keys(visible)).toEqual([
      "nav-setup",
      "setup-others",
      "setup-holiday",
    ]);
  });

  it("hides a group left with only a divider, and trims dangling dividers", () => {
    const items: NavItem[] = [
      {
        key: "group-a",
        label: "A",
        children: [
          { key: "a-1", label: "A1", path: "/a1", permission: "X:View" },
          { key: "a-divider", label: "", type: "divider" },
          { key: "a-2", label: "A2", path: "/a2", permission: "Y:View" },
        ],
      },
      {
        key: "group-b",
        label: "B",
        children: [
          { key: "b-divider", label: "", type: "divider" },
          { key: "b-1", label: "B1", path: "/b1", permission: "Y:View" },
        ],
      },
      { key: "empty-group", label: "Empty", type: "group" },
    ];
    signInWith(["Member"], ["X:View"]);

    const visible = filterNavByPermission(items);

    expect(keys(visible)).toEqual(["group-a", "a-1"]);
  });

  it("shows everything to Owner", () => {
    signInWith(["Owner"], []);

    expect(filterNavByPermission(NAVIGATION_ITEMS)).toHaveLength(
      NAVIGATION_ITEMS.length,
    );
  });
});
