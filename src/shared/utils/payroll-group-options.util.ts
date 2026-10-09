interface PayrollGroupLike {
  id: string;
  code?: string | null;
  name: string;
}

export interface PayrollGroupOption {
  value: string;
  label: string;
  fullLabel?: string;
}

// Same shape the DTR screens use: the closed select shows the code, the open list shows
// "CODE - Name" (see payrollGroupOptionRender).
export function toPayrollGroupOptions(
  groups: PayrollGroupLike[],
): PayrollGroupOption[] {
  return groups.map((p) => ({
    value: p.id,
    label: p.code || p.name,
    fullLabel: p.code ? p.name : undefined,
  }));
}

export const payrollGroupOptionRender = (opt: {
  data: { label?: string; fullLabel?: string };
}) =>
  opt.data.fullLabel
    ? `${opt.data.label} - ${opt.data.fullLabel}`
    : String(opt.data.label ?? "");

// Search by either the code or the name.
export const filterPayrollGroupOption = (
  input: string,
  option?: { label?: string | number | boolean; fullLabel?: string },
) => {
  const q = input.toLowerCase();
  return (
    String(option?.label ?? "")
      .toLowerCase()
      .includes(q) || (option?.fullLabel ?? "").toLowerCase().includes(q)
  );
};
