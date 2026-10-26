export interface AdjacentIds {
  prev: string | null;
  next: string | null;
}

/**
 * Neighbours of `currentId` in the list the user came from, or both null when the list isn't
 * known or doesn't contain them (e.g. the form was opened directly by URL).
 */
export function adjacentIds(
  ids: readonly string[],
  currentId: string | undefined,
): AdjacentIds {
  const index = currentId ? ids.indexOf(currentId) : -1;
  if (index === -1) return { prev: null, next: null };
  return { prev: ids[index - 1] ?? null, next: ids[index + 1] ?? null };
}
