import { useMemo, useState } from "react";

// Shared "narrow down results" filter for payroll report tables — a multi-select of the
// distinct names already present in the current result set (Employee, Deduction Name, etc.),
// filtering client-side since every report already fetches its full date/year-scoped result
// set up front. See ReportNameFilter for the paired Select control.
export function useReportNameFilter<T>(
  data: T[],
  getName: (item: T) => string | undefined,
) {
  const [selected, setSelected] = useState<string[]>([]);

  const options = useMemo(() => {
    const names = new Set<string>();
    for (const item of data) {
      const name = getName(item);
      if (name) names.add(name);
    }
    return Array.from(names)
      .sort()
      .map((name) => ({ label: name, value: name }));
  }, [data, getName]);

  const filtered = useMemo(() => {
    if (selected.length === 0) return data;
    return data.filter((item) => {
      const name = getName(item);
      return name ? selected.includes(name) : false;
    });
  }, [data, selected, getName]);

  return { selected, setSelected, options, filtered };
}
