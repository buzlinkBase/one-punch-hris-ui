import type { NavItem } from "@/shared/constants/navigation.const";

export interface Crumb {
  label: string;
  /** Present only for ancestors that are real pages; the current page has no link. */
  path?: string;
}

/** Signed-in pages that live outside the menu. */
const STANDALONE_PAGES: Record<string, string> = {
  "/profile": "Profile",
  "/notifications": "Notifications",
  "/help": "Help Center",
};

function findBestChain(
  items: NavItem[],
  pathname: string,
  parents: NavItem[] = [],
): NavItem[] | null {
  let best: NavItem[] | null = null;
  for (const item of items) {
    if (item.type === "divider") continue;
    const chain = [...parents, item];
    const matches =
      !!item.path &&
      (pathname === item.path || pathname.startsWith(`${item.path}/`));
    if (matches && (!best || item.path!.length > lastPathLength(best))) {
      best = chain;
    }
    const deeper = item.children
      ? findBestChain(item.children, pathname, chain)
      : null;
    if (deeper && (!best || lastPathLength(deeper) > lastPathLength(best))) {
      best = deeper;
    }
  }
  return best;
}

function lastPathLength(chain: NavItem[]): number {
  return chain[chain.length - 1]?.path?.length ?? 0;
}

/**
 * Breadcrumb trail for a pathname: every menu ancestor, linking those that are pages, then a
 * trailing crumb for sub-pages the menu doesn't list ("Create" or "Details").
 */
export function buildBreadcrumbs(pathname: string, items: NavItem[]): Crumb[] {
  const chain = findBestChain(items, pathname);
  if (!chain) {
    const standalone = Object.keys(STANDALONE_PAGES).find(
      (path) => pathname === path || pathname.startsWith(`${path}/`),
    );
    const label = standalone ? STANDALONE_PAGES[standalone] : "Dashboard";
    return [{ label }];
  }

  const crumbs: Crumb[] = chain.map((item) => ({
    label: item.label,
    path: item.path,
  }));

  const matched = chain[chain.length - 1];
  if (matched.path && matched.path !== pathname) {
    const lastSegment = pathname.split("/").filter(Boolean).pop();
    crumbs.push({ label: lastSegment === "create" ? "Create" : "Details" });
  } else {
    crumbs[crumbs.length - 1] = { label: matched.label };
  }
  return crumbs;
}
