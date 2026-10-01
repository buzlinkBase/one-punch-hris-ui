export interface JobLevelOptionGroup {
  label: string;
  options: { value: string; label: string }[];
}

const toOption = (value: string) => ({ value, label: value });

/**
 * The Job Level suggestions: the standard levels first, then the company's own levels that
 * aren't one of them (compared ignoring case and spaces). Empty groups are left out.
 */
export function buildJobLevelOptions(
  standard: string[],
  used: string[],
): JobLevelOptionGroup[] {
  const known = new Set(standard.map((s) => s.trim().toLowerCase()));
  const own: string[] = [];
  for (const level of used) {
    const value = level.trim();
    const key = value.toLowerCase();
    if (!value || known.has(key)) continue;
    known.add(key);
    own.push(value);
  }

  return [
    { label: "Standard levels", options: standard.map(toOption) },
    { label: "Used in your company", options: own.map(toOption) },
  ].filter((group) => group.options.length > 0);
}

/** Whether a suggestion matches what's typed: anywhere in it, ignoring case. */
export function jobLevelMatches(input: string, value: string): boolean {
  return value.toLowerCase().includes(input.trim().toLowerCase());
}
