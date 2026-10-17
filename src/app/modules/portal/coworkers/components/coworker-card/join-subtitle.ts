/** "Position · Department", skipping whichever is empty. */
export function joinSubtitle(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" · ");
}
