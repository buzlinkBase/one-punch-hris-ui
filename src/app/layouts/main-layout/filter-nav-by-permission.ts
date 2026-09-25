import { authStorage } from "@/core/auth/auth-storage";
import type { NavItem } from "@/shared/constants/navigation.const";

const isDivider = (item: NavItem) => item.type === "divider";

// Drops dividers that no longer separate anything once the items around them were filtered
// out: leading, trailing, and back-to-back ones.
function trimDividers(items: NavItem[]): NavItem[] {
  return items.filter(
    (item, index) =>
      !isDivider(item) ||
      (index > 0 &&
        !isDivider(items[index - 1]) &&
        items.slice(index + 1).some((next) => !isDivider(next))),
  );
}

/**
 * Hides every menu item the current session lacks permission for, then every group left with
 * nothing real to show -- no children at all, or only dividers -- at any nesting depth, so an
 * empty "Setup"/"Security" header never renders on its own.
 */
export function filterNavByPermission(items: NavItem[]): NavItem[] {
  const visible = items.reduce<NavItem[]>((acc, item) => {
    if (item.permission) {
      const codes = Array.isArray(item.permission)
        ? item.permission
        : [item.permission];
      if (!authStorage.hasAnyPermission(...codes)) return acc;
    }

    if (item.children || item.type === "group") {
      const children = filterNavByPermission(item.children ?? []);
      if (!children.some((child) => !isDivider(child))) return acc;
      acc.push({ ...item, children });
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);
  return trimDividers(visible);
}
