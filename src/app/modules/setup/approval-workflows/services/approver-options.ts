export interface EmployeeOption {
  value: string;
  label: string;
}

/**
 * Adds the employees a workflow already references but the caller's employee list lacks -- a
 * confidential approver they may not see -- labelled with the server-resolved name
 * ("Confidential"), so the dropdown shows that instead of the raw employee id.
 */
export function withReferencedEmployees(
  options: EmployeeOption[],
  approverNames: Record<string, string> | undefined,
): EmployeeOption[] {
  if (!approverNames) return options;
  const known = new Set(options.map((o) => o.value));
  const missing = Object.entries(approverNames)
    .filter(([id]) => !known.has(id))
    .map(([id, name]) => ({ value: id, label: name }));
  return missing.length ? [...options, ...missing] : options;
}
