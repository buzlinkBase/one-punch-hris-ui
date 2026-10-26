import type { NavItem } from "@/shared/constants/navigation.const";

export interface PalettePage {
  path: string;
  label: string;
  /** Menu group the page sits under, e.g. "Setup › Organization". */
  breadcrumb: string;
}

/** Every page in the (already permission-filtered) menu, with its group trail. */
export function collectPalettePages(
  items: NavItem[],
  trail: string[] = [],
): PalettePage[] {
  const pages: PalettePage[] = [];
  for (const item of items) {
    if (item.type === "divider") continue;
    if (item.path) {
      pages.push({
        path: item.path,
        label: item.label,
        breadcrumb: trail.join(" › "),
      });
    }
    if (item.children) {
      pages.push(
        ...collectPalettePages(
          item.children,
          item.path ? trail : [...trail, item.label],
        ),
      );
    }
  }
  return pages;
}

/**
 * Pages matching every word of the query, label matches first, then trail matches. An empty
 * query returns the first `limit` pages so the palette isn't blank on open.
 */
export function searchPalettePages(
  pages: PalettePage[],
  query: string,
  limit = 8,
): PalettePage[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return pages.slice(0, limit);

  const scored: { page: PalettePage; score: number }[] = [];
  for (const page of pages) {
    const label = page.label.toLowerCase();
    const haystack = `${label} ${page.breadcrumb.toLowerCase()}`;
    if (!words.every((w) => haystack.includes(w))) continue;
    const labelHits = words.filter((w) => label.includes(w)).length;
    const startsWith = label.startsWith(words[0]) ? 1 : 0;
    scored.push({ page, score: labelHits * 2 + startsWith });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.page);
}

/** Employees whose name contains the query (case-insensitive); needs at least 2 characters. */
export function searchPaletteEmployees<T extends { name?: string | null }>(
  employees: T[],
  query: string,
  limit = 6,
): T[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  return employees
    .filter((e) => (e.name ?? "").toLowerCase().includes(q))
    .slice(0, limit);
}
