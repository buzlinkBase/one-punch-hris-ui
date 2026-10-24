import type { NavItem } from "@/shared/constants/navigation.const";
import type {
  PortalVisibilityKey,
  PortalVisibilityResponse,
} from "@/app/modules/portal/shared/models/api/response/portal-visibility-response.model";

/** The My Portal menu items a company can switch off, and the switch that controls each. */
export const PORTAL_NAV_VISIBILITY_KEYS: Record<string, PortalVisibilityKey> = {
  "portal-thirteenth-month": "showThirteenthMonth",
  "portal-cash-bond": "showCashBond",
  "portal-uniform-allowance": "showUniformAllowance",
};

/**
 * Hides the My Portal pages the company switched off, then any group left empty. `visibility`
 * is undefined while it loads (or if it failed), in which case everything stays listed -- the
 * pages are on by default and the API still refuses the data when a page is off.
 */
export function filterNavByPortalVisibility(
  items: NavItem[],
  visibility: PortalVisibilityResponse | undefined,
): NavItem[] {
  if (!visibility) return items;

  return items.reduce<NavItem[]>((acc, item) => {
    const key = PORTAL_NAV_VISIBILITY_KEYS[item.key];
    if (key && !visibility[key]) return acc;

    if (item.children) {
      const children = filterNavByPortalVisibility(item.children, visibility);
      if (!children.some((child) => child.type !== "divider")) return acc;
      acc.push({ ...item, children });
      return acc;
    }

    acc.push(item);
    return acc;
  }, []);
}
