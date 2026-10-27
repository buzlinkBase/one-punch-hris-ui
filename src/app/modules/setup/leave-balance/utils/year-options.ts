// Read at call time, not module load: a constant went stale in a session left open over New Year.
export const currentYear = () => new Date().getFullYear();

/** Two years back through three ahead of the current year. */
export function yearOptions(center = currentYear()) {
  return Array.from({ length: 6 }, (_, i) => {
    const y = center - 2 + i;
    return { value: y, label: String(y) };
  });
}
