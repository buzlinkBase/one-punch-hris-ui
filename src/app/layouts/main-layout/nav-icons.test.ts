import { describe, expect, it } from "vitest";
import {
  NAVIGATION_ITEMS,
  type NavItem,
} from "@/shared/constants/navigation.const";
import { getNavIcon } from "./nav-icons";

// Top-level entries are all the collapsed sidebar shows, and group headers carry their
// submenu's icon, so each needs one of its own.
const needsIcon = (items: NavItem[], topLevel = true): string[] =>
  items.flatMap((item) => [
    ...(topLevel || item.children ? [item.key] : []),
    ...needsIcon(item.children ?? [], false),
  ]);

describe("getNavIcon", () => {
  it("has an icon for every top-level entry and group", () => {
    const missing = needsIcon(NAVIGATION_ITEMS).filter(
      (key) => !getNavIcon(key),
    );

    expect(missing).toEqual([]);
  });

  it("leaves pages nested in a group without one", () => {
    expect(getNavIcon("setup-department")).toBeUndefined();
  });
});
