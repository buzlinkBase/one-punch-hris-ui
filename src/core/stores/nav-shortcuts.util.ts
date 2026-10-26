export const MAX_RECENT_PAGES = 6;
export const MAX_PINNED_PAGES = 8;

/** Moves `path` to the front of the recent list, without duplicates, capped at `max`. */
export function recordVisit(
  recent: readonly string[],
  path: string,
  max = MAX_RECENT_PAGES,
): string[] {
  if (recent[0] === path) return [...recent];
  return [path, ...recent.filter((p) => p !== path)].slice(0, max);
}

/**
 * Adds `path` to the pinned list, or removes it if already pinned. A new pin is refused (list
 * returned unchanged) once `max` pages are pinned, so the sidebar group can't grow unbounded.
 */
export function togglePinned(
  pinned: readonly string[],
  path: string,
  max = MAX_PINNED_PAGES,
): string[] {
  if (pinned.includes(path)) return pinned.filter((p) => p !== path);
  if (pinned.length >= max) return [...pinned];
  return [...pinned, path];
}

/** Keeps only the paths still available to the user (permissions and plans change). */
export function keepAvailable(
  paths: readonly string[],
  available: ReadonlySet<string>,
): string[] {
  return paths.filter((p) => available.has(p));
}
