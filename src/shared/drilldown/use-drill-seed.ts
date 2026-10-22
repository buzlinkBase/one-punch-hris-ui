import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearch } from "@tanstack/react-router";

/**
 * The drill-down filters a list screen was opened with (see DrillTarget): the values of `keys`
 * in the URL, read once on arrival for the page's initial state. They're then removed from the
 * URL, so the page's own filter controls own them from there -- a refresh or a later visit
 * starts the page as usual instead of re-applying a drill from long ago.
 *
 * `keys` must be a module-level constant.
 */
export function useDrillSeed<K extends string>(
  keys: readonly K[],
): Partial<Record<K, unknown>> {
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [seed] = useState(() => {
    const picked: Partial<Record<K, unknown>> = {};
    for (const key of keys) {
      if (search[key] !== undefined) picked[key] = search[key];
    }
    return picked;
  });
  const hasSeed = Object.keys(seed).length > 0;

  useEffect(() => {
    if (!hasSeed) return;
    navigate({
      to: pathname,
      search: (prev: Record<string, unknown>) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => !keys.includes(key as K)),
        ),
      replace: true,
    });
  }, [hasSeed, keys, navigate, pathname]);

  return seed;
}
